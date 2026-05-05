"use client";
import React, { useState, useRef, useCallback } from "react";
import { clsx } from "clsx";

interface AICommandBarProps {
  onSubmit: (prompt: string, model?: string) => Promise<void> | void;
  placeholder?: string;
  models?: string[];
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AICommandBar({
  onSubmit,
  placeholder = "Enter a prompt or command... (⌘K to focus)",
  models = ["gpt-4o-mini", "gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"],
  selectedModel,
  onModelChange,
  loading = false,
  disabled = false,
}: AICommandBarProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [model, setModel] = useState(selectedModel ?? models[0] ?? "gpt-4o-mini");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!value.trim() || loading || disabled) return;
    await onSubmit(value.trim(), model);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, loading, disabled, onSubmit, model]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    onModelChange?.(newModel);
  };

  return (
    <div
      className={clsx(
        "relative rounded-xl border backdrop-blur-[12px] transition-all duration-300",
        "bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)]",
        focused
          ? "border-[rgba(0,245,255,0.6)] shadow-[0_0_30px_rgba(0,245,255,0.2),0_8px_32px_rgba(0,0,0,0.4)]"
          : "border-[rgba(0,245,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      )}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,245,255,0.5)] to-transparent" />
      </div>

      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <div className={clsx("h-1.5 w-1.5 rounded-full transition-colors", loading ? "bg-[#00F5FF] animate-pulse" : "bg-[rgba(0,245,255,0.4)]")} />
          <span className="text-xs text-[rgba(0,245,255,0.6)] font-mono">AI</span>
        </div>

        <select
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="ml-auto text-xs bg-transparent border border-[rgba(0,245,255,0.2)] rounded px-2 py-0.5 text-[#00F5FF] focus:outline-none focus:border-[rgba(0,245,255,0.5)] cursor-pointer"
        >
          {models.map((m) => (
            <option key={m} value={m} className="bg-[#05060A]">
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="px-4 pb-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={1}
          className={clsx(
            "w-full bg-transparent resize-none text-sm text-white placeholder-[rgba(255,255,255,0.3)]",
            "focus:outline-none leading-relaxed",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[24px] max-h-[200px]"
          )}
          style={{ height: "auto" }}
        />
      </div>

      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <span className="text-xs text-[rgba(255,255,255,0.3)] font-mono">
          ⌘+Enter to send
        </span>
        <button
          onClick={() => void handleSubmit()}
          disabled={!value.trim() || loading || disabled}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
            "border border-[rgba(0,245,255,0.3)] text-[#00F5FF]",
            value.trim() && !loading && !disabled
              ? "bg-[rgba(0,245,255,0.1)] hover:bg-[rgba(0,245,255,0.2)] hover:shadow-[0_0_15px_rgba(0,245,255,0.3)] cursor-pointer"
              : "opacity-40 cursor-not-allowed"
          )}
        >
          {loading ? (
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
          Send
        </button>
      </div>
    </div>
  );
}
