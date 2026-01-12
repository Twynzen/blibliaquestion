import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  user,
  User
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, Timestamp } from '@angular/fire/firestore';
import { AppUser } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Estado reactivo con Signals
  private _currentUser = signal<AppUser | null>(null);
  private _loading = signal<boolean>(true);
  private _error = signal<string | null>(null);

  // Signals públicos de solo lectura
  readonly currentUser = this._currentUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals (estado derivado)
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly isModerator = computed(() =>
    this._currentUser()?.role === 'moderator' || this._currentUser()?.role === 'admin'
  );
  readonly userDisplayName = computed(() => this._currentUser()?.displayName ?? 'Invitado');
  readonly userId = computed(() => this._currentUser()?.uid ?? null);

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener(): void {
    user(this.auth).subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        await this.loadUserData(firebaseUser);
      } else {
        this._currentUser.set(null);
      }
      this._loading.set(false);
    });
  }

  private async loadUserData(firebaseUser: User): Promise<void> {
    try {
      const userDoc = doc(this.firestore, `users/${firebaseUser.uid}`);
      const snapshot = await getDoc(userDoc);

      if (snapshot.exists()) {
        const data = snapshot.data();
        this._currentUser.set({
          uid: firebaseUser.uid,
          email: data['email'],
          displayName: data['displayName'],
          photoURL: data['photoURL'] || null,
          role: data['role'],
          totalStars: data['totalStars'] || 0,
          tournamentsPlayed: data['tournamentsPlayed'] || 0,
          currentStreak: data['currentStreak'] || 0,
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date()
        });
      } else {
        // Usuario existe en Auth pero no en Firestore - crear perfil
        await this.createUserProfile(firebaseUser);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      this._error.set('Error al cargar datos del usuario');
    }
  }

  private async createUserProfile(firebaseUser: User): Promise<void> {
    const newUser: AppUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
      photoURL: firebaseUser.photoURL || null,
      role: 'player',
      totalStars: 0,
      tournamentsPlayed: 0,
      currentStreak: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userDoc = doc(this.firestore, `users/${firebaseUser.uid}`);
    await setDoc(userDoc, {
      ...newUser,
      createdAt: Timestamp.fromDate(newUser.createdAt),
      updatedAt: Timestamp.fromDate(newUser.updatedAt)
    });

    this._currentUser.set(newUser);
  }

  async register(email: string, password: string, displayName: string): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      const newUser: AppUser = {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        photoURL: null,
        role: 'player',
        totalStars: 0,
        tournamentsPlayed: 0,
        currentStreak: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userDoc = doc(this.firestore, `users/${userCredential.user.uid}`);
      await setDoc(userDoc, {
        ...newUser,
        createdAt: Timestamp.fromDate(newUser.createdAt),
        updatedAt: Timestamp.fromDate(newUser.updatedAt)
      });

      this._currentUser.set(newUser);
      return true;
    } catch (err: any) {
      this._error.set(this.getErrorMessage(err.code));
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      return true;
    } catch (err: any) {
      this._error.set(this.getErrorMessage(err.code));
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (err: any) {
      this._error.set(this.getErrorMessage(err.code));
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this._currentUser.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }

  async getIdToken(): Promise<string | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken();
  }

  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contrasena incorrecta',
      'auth/email-already-in-use': 'El correo ya esta registrado',
      'auth/weak-password': 'La contrasena debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Correo electronico invalido',
      'auth/invalid-credential': 'Credenciales invalidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta mas tarde',
      'auth/network-request-failed': 'Error de conexion. Verifica tu internet'
    };
    return messages[code] || 'Error de autenticacion';
  }
}
