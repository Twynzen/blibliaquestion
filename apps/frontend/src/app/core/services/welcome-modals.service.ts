import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';

export type WelcomeModalStep = 'donation' | 'social' | 'completed' | null;

@Injectable({ providedIn: 'root' })
export class WelcomeModalsService {
  private firestore = inject(Firestore);

  // Estado actual del modal
  private _currentStep = signal<WelcomeModalStep>(null);
  readonly currentStep = this._currentStep.asReadonly();

  // Flag para saber si estamos en flujo de bienvenida
  private _isWelcomeFlow = signal<boolean>(false);
  readonly isWelcomeFlow = this._isWelcomeFlow.asReadonly();

  private readonly STORAGE_KEY = 'biblia_question_welcome_seen';

  /**
   * Inicia el flujo de bienvenida para un usuario nuevo
   */
  async startWelcomeFlow(userId: string): Promise<void> {
    // Verificar si el usuario ya vio los modales
    const hasSeenModals = await this.hasUserSeenModals(userId);

    if (hasSeenModals) {
      this._currentStep.set('completed');
      return;
    }

    // Iniciar flujo
    this._isWelcomeFlow.set(true);
    this._currentStep.set('donation');
  }

  /**
   * Avanza al siguiente paso del flujo
   */
  nextStep(): void {
    const current = this._currentStep();

    if (current === 'donation') {
      this._currentStep.set('social');
    } else if (current === 'social') {
      this._currentStep.set('completed');
      this._isWelcomeFlow.set(false);
    }
  }

  /**
   * Cierra el flujo de bienvenida
   */
  async completeWelcomeFlow(userId: string): Promise<void> {
    this._currentStep.set('completed');
    this._isWelcomeFlow.set(false);

    // Guardar en localStorage como respaldo
    localStorage.setItem(this.STORAGE_KEY, 'true');

    // Guardar en Firestore
    if (userId) {
      try {
        const userDoc = doc(this.firestore, `users/${userId}`);
        await updateDoc(userDoc, {
          hasSeenWelcomeModals: true
        });
      } catch (error) {
        console.error('Error saving welcome modals state:', error);
      }
    }
  }

  /**
   * Verifica si el usuario ya vio los modales
   */
  private async hasUserSeenModals(userId: string): Promise<boolean> {
    // Verificar localStorage primero (respaldo)
    const localSeen = localStorage.getItem(this.STORAGE_KEY);
    if (localSeen === 'true') {
      return true;
    }

    // Verificar en Firestore
    if (userId) {
      try {
        const userDoc = doc(this.firestore, `users/${userId}`);
        const snapshot = await getDoc(userDoc);

        if (snapshot.exists()) {
          const data = snapshot.data();
          return data['hasSeenWelcomeModals'] === true;
        }
      } catch (error) {
        console.error('Error checking welcome modals state:', error);
      }
    }

    return false;
  }

  /**
   * Resetea el estado (útil para testing)
   */
  reset(): void {
    this._currentStep.set(null);
    this._isWelcomeFlow.set(false);
  }
}
