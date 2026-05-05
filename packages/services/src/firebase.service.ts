import * as admin from "firebase-admin";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Firestore, FieldValue } from "firebase-admin/firestore";
import { getDatabase, Database } from "firebase-admin/database";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: admin.app.App | null = null;

function getAdminApp(): admin.app.App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0] as admin.app.App;
    return adminApp;
  }

  adminApp = initializeApp({
    credential: cert({
      projectId: process.env["FIREBASE_PROJECT_ID"],
      privateKey: process.env["FIREBASE_PRIVATE_KEY"]?.replace(/\\n/g, "\n"),
      clientEmail: process.env["FIREBASE_CLIENT_EMAIL"],
    }),
    databaseURL: process.env["NEXT_PUBLIC_FIREBASE_DATABASE_URL"],
  });
  return adminApp;
}

export class FirebaseService {
  private get db(): Firestore {
    return getFirestore(getAdminApp());
  }

  private get rtdb(): Database {
    return getDatabase(getAdminApp());
  }

  private get auth(): Auth {
    return getAuth(getAdminApp());
  }

  // ─── Firestore ───────────────────────────────────────────────────────────────
  async getDocument<T>(collection: string, docId: string): Promise<T | null> {
    const snap = await this.db.collection(collection).doc(docId).get();
    return snap.exists ? ({ id: snap.id, ...snap.data() } as T) : null;
  }

  async setDocument<T extends object>(
    collection: string,
    docId: string,
    data: T
  ): Promise<void> {
    await this.db
      .collection(collection)
      .doc(docId)
      .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }

  async createDocument<T extends object>(collection: string, data: T): Promise<string> {
    const ref = await this.db
      .collection(collection)
      .add({ ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return ref.id;
  }

  async updateDocument<T extends Partial<object>>(
    collection: string,
    docId: string,
    data: T
  ): Promise<void> {
    await this.db
      .collection(collection)
      .doc(docId)
      .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  }

  async deleteDocument(collection: string, docId: string): Promise<void> {
    await this.db.collection(collection).doc(docId).delete();
  }

  async queryCollection<T>(
    collection: string,
    filters: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: unknown }>
  ): Promise<T[]> {
    let query: FirebaseFirestore.Query = this.db.collection(collection);
    for (const f of filters) {
      query = query.where(f.field, f.op, f.value);
    }
    const snap = await query.get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
  }

  // ─── Realtime Database ───────────────────────────────────────────────────────
  async rtdbGet<T>(path: string): Promise<T | null> {
    const snap = await this.rtdb.ref(path).get();
    return snap.exists() ? (snap.val() as T) : null;
  }

  async rtdbSet<T>(path: string, data: T): Promise<void> {
    await this.rtdb.ref(path).set(data);
  }

  async rtdbUpdate<T extends object>(path: string, data: T): Promise<void> {
    await this.rtdb.ref(path).update(data);
  }

  async rtdbDelete(path: string): Promise<void> {
    await this.rtdb.ref(path).remove();
  }

  // ─── Auth ────────────────────────────────────────────────────────────────────
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(idToken);
  }

  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    return this.auth.getUser(uid);
  }

  async createUser(
    email: string,
    password: string,
    displayName: string
  ): Promise<admin.auth.UserRecord> {
    return this.auth.createUser({ email, password, displayName });
  }

  async setCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void> {
    await this.auth.setCustomUserClaims(uid, claims);
  }

  async deleteUser(uid: string): Promise<void> {
    await this.auth.deleteUser(uid);
  }
}

export const firebaseService = new FirebaseService();
