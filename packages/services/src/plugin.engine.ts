import { v4 as uuidv4 } from "uuid";
import {
  type PluginManifest,
  type PluginInstallation,
  type PluginExecutionContext,
  type PluginExecutionResult,
  SubscriptionTier,
  TierLimits,
} from "@promptos/contracts";

interface PluginSandbox {
  execute(context: PluginExecutionContext): Promise<unknown>;
}

class InProcessSandbox implements PluginSandbox {
  private readonly module: unknown;
  constructor(mod: unknown) {
    this.module = mod;
  }

  async execute(context: PluginExecutionContext): Promise<unknown> {
    const mod = this.module as Record<string, (ctx: PluginExecutionContext) => Promise<unknown>>;
    const handler = mod[context.hook];
    if (typeof handler !== "function") return null;
    return handler(context);
  }
}

export class PluginEngine {
  private registry = new Map<string, PluginManifest>();
  private installations = new Map<string, PluginInstallation>();
  private sandboxes = new Map<string, PluginSandbox>();

  async installPlugin(
    userId: string,
    manifest: PluginManifest,
    config: Record<string, unknown>,
    userTier: SubscriptionTier
  ): Promise<PluginInstallation> {
    const tierOrder = [SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE];
    const userTierIndex = tierOrder.indexOf(userTier);
    const requiredTierIndex = tierOrder.indexOf(manifest.requiredTier);

    if (userTierIndex < requiredTierIndex) {
      throw new Error(`Plugin requires ${manifest.requiredTier} tier or higher`);
    }

    const userPlugins = Array.from(this.installations.values()).filter(
      (inst) => inst.userId === userId && inst.enabled
    );
    const limit = TierLimits[userTier].maxPlugins;
    if (limit !== -1 && userPlugins.length >= limit) {
      throw new Error(`Plugin limit reached for ${userTier} tier (max: ${limit})`);
    }

    this.registry.set(manifest.id, manifest);

    const installation: PluginInstallation = {
      id: uuidv4(),
      userId,
      pluginId: manifest.id,
      manifest,
      config,
      enabled: true,
      installedAt: new Date(),
      updatedAt: new Date(),
    };

    const installKey = `${userId}:${manifest.id}`;
    this.installations.set(installKey, installation);

    if (manifest.hooks.onInstall) {
      await this.executeHook(installation, "onInstall", {});
    }

    return installation;
  }

  async uninstallPlugin(userId: string, pluginId: string): Promise<void> {
    const installKey = `${userId}:${pluginId}`;
    const installation = this.installations.get(installKey);
    if (!installation) throw new Error(`Plugin ${pluginId} not installed`);

    if (installation.manifest.hooks.onUninstall) {
      await this.executeHook(installation, "onUninstall", {});
    }

    this.installations.delete(installKey);
    this.sandboxes.delete(installKey);
  }

  async executeHook(
    installation: PluginInstallation,
    hook: string,
    payload: Record<string, unknown>
  ): Promise<PluginExecutionResult> {
    const start = Date.now();

    if (!installation.enabled) {
      return { success: false, error: "Plugin is disabled", durationMs: 0 };
    }

    const context: PluginExecutionContext = {
      pluginId: installation.pluginId,
      userId: installation.userId,
      hook,
      payload,
      config: installation.config,
      timeoutMs: 5_000,
    };

    try {
      const sandbox = this.getOrCreateSandbox(installation);
      const result = await Promise.race([
        sandbox.execute(context),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Plugin execution timeout")), context.timeoutMs)
        ),
      ]);

      return { success: true, output: result, durationMs: Date.now() - start };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown plugin error";
      return { success: false, error: message, durationMs: Date.now() - start };
    }
  }

  async runHookForUser(
    userId: string,
    hook: keyof PluginInstallation["manifest"]["hooks"],
    payload: Record<string, unknown>
  ): Promise<PluginExecutionResult[]> {
    const hookStr = hook as string;
    const userInstallations = Array.from(this.installations.entries())
      .filter(([key, inst]) => key.startsWith(`${userId}:`) && inst.enabled && inst.manifest.hooks[hook])
      .map(([, inst]) => inst);

    return Promise.all(
      userInstallations.map((inst) => this.executeHook(inst, hookStr, payload))
    );
  }

  getInstalledPlugins(userId: string): PluginInstallation[] {
    return Array.from(this.installations.entries())
      .filter(([key]) => key.startsWith(`${userId}:`))
      .map(([, inst]) => inst);
  }

  getPlugin(pluginId: string): PluginManifest | undefined {
    return this.registry.get(pluginId);
  }

  async togglePlugin(userId: string, pluginId: string, enabled: boolean): Promise<void> {
    const installKey = `${userId}:${pluginId}`;
    const installation = this.installations.get(installKey);
    if (!installation) throw new Error(`Plugin ${pluginId} not installed`);
    installation.enabled = enabled;
    installation.updatedAt = new Date();
  }

  private getOrCreateSandbox(installation: PluginInstallation): PluginSandbox {
    const key = `${installation.userId}:${installation.pluginId}`;
    let sandbox = this.sandboxes.get(key);
    if (!sandbox) {
      sandbox = new InProcessSandbox({});
      this.sandboxes.set(key, sandbox);
    }
    return sandbox;
  }
}

export const pluginEngine = new PluginEngine();
