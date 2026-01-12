import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp
} from '@angular/fire/firestore';
import { AuthService } from '@core/services/auth.service';
import { Tournament, TournamentStatus } from '@shared/models';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-tournament-management',
  standalone: true,
  imports: [RouterLink, FormsModule, LoaderComponent],
  template: `
    <div class="tournaments-admin-page page">
      <div class="container">
        <a routerLink="/admin" class="back-link">← Volver al Panel</a>

        <header class="page-header">
          <h1 class="page-title">Gestionar Torneos</h1>
          <button class="btn btn-primary" (click)="showCreateForm.set(true)">
            + Nuevo Torneo
          </button>
        </header>

        <!-- Create Form Modal -->
        @if (showCreateForm()) {
          <div class="modal-overlay" (click)="showCreateForm.set(false)">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h2>Crear Nuevo Torneo</h2>

              <form (ngSubmit)="createTournament()">
                <div class="form-group">
                  <label class="form-label">Nombre del Torneo</label>
                  <input
                    type="text"
                    [(ngModel)]="newTournament.name"
                    name="name"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Descripcion</label>
                  <textarea
                    [(ngModel)]="newTournament.description"
                    name="description"
                    class="form-input"
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Fecha de Inicio</label>
                    <input
                      type="date"
                      [(ngModel)]="newTournament.startDate"
                      name="startDate"
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Semanas</label>
                    <input
                      type="number"
                      [(ngModel)]="newTournament.totalWeeks"
                      name="totalWeeks"
                      class="form-input"
                      min="1"
                      max="52"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      [(ngModel)]="newTournament.lateRegistration"
                      name="lateRegistration"
                    />
                    Permitir inscripciones tardias
                  </label>
                </div>

                @if (newTournament.lateRegistration) {
                  <div class="form-group">
                    <label class="form-label">Porcentaje de Nivelacion</label>
                    <input
                      type="number"
                      [(ngModel)]="newTournament.catchUpPercentage"
                      name="catchUpPercentage"
                      class="form-input"
                      min="0"
                      max="100"
                    />
                  </div>
                }

                <div class="modal-actions">
                  <button type="button" class="btn btn-ghost" (click)="showCreateForm.set(false)">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="creating()">
                    @if (creating()) {
                      Creando...
                    } @else {
                      Crear Torneo
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Tournaments List -->
        @if (loading()) {
          <app-loader message="Cargando torneos..." />
        } @else {
          <div class="tournaments-list">
            @for (tournament of tournaments(); track tournament.id) {
              <div class="tournament-item">
                <div class="tournament-info">
                  <h3>{{ tournament.name }}</h3>
                  <p>{{ tournament.description }}</p>
                  <div class="tournament-meta">
                    <span>{{ formatDate(tournament.startDate) }}</span>
                    <span>{{ tournament.totalWeeks }} semanas</span>
                    <span>{{ tournament.participantCount }} participantes</span>
                  </div>
                </div>
                <div class="tournament-status">
                  <select
                    [value]="tournament.status"
                    (change)="updateStatus(tournament.id, $event)"
                    class="status-select"
                  >
                    <option value="upcoming">Proximo</option>
                    <option value="active">Activo</option>
                    <option value="completed">Finalizado</option>
                  </select>
                </div>
                <div class="tournament-actions">
                  <a [routerLink]="['/admin/daily-content', tournament.id]" class="btn btn-sm btn-outline">
                    Contenido
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: var(--spacing-lg);
      color: var(--color-text-secondary);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;

      h2 {
        margin-bottom: var(--spacing-lg);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      cursor: pointer;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
      margin-top: var(--spacing-lg);
    }

    .tournaments-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .tournament-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
    }

    .tournament-info {
      flex: 1;

      h3 {
        margin-bottom: var(--spacing-xs);
      }

      p {
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-sm);
        font-size: 0.875rem;
      }
    }

    .tournament-meta {
      display: flex;
      gap: var(--spacing-md);
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .status-select {
      padding: var(--spacing-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
    }
  `]
})
export class TournamentManagementComponent implements OnInit {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  loading = signal(true);
  creating = signal(false);
  showCreateForm = signal(false);
  tournaments = signal<Tournament[]>([]);

  newTournament = {
    name: '',
    description: '',
    startDate: '',
    totalWeeks: 15,
    lateRegistration: true,
    catchUpPercentage: 70
  };

  async ngOnInit(): Promise<void> {
    await this.loadTournaments();
  }

  private async loadTournaments(): Promise<void> {
    try {
      const tournamentsRef = collection(this.firestore, 'tournaments');
      const snapshot = await getDocs(tournamentsRef);

      const tournamentsList: Tournament[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Tournament));

      this.tournaments.set(tournamentsList);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async createTournament(): Promise<void> {
    if (!this.newTournament.name || !this.newTournament.startDate) return;

    this.creating.set(true);

    try {
      const startDate = new Date(this.newTournament.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (this.newTournament.totalWeeks * 7));

      const tournamentsRef = collection(this.firestore, 'tournaments');
      await addDoc(tournamentsRef, {
        name: this.newTournament.name,
        description: this.newTournament.description,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        totalWeeks: this.newTournament.totalWeeks,
        status: 'upcoming',
        lateRegistrationAllowed: this.newTournament.lateRegistration,
        catchUpPercentage: this.newTournament.catchUpPercentage,
        participantCount: 0,
        createdBy: this.authService.userId(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      this.showCreateForm.set(false);
      this.resetForm();
      await this.loadTournaments();
    } catch (error) {
      console.error('Error creating tournament:', error);
    } finally {
      this.creating.set(false);
    }
  }

  async updateStatus(tournamentId: string, event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as TournamentStatus;

    try {
      const tournamentRef = doc(this.firestore, 'tournaments', tournamentId);
      await updateDoc(tournamentRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });

      this.tournaments.update(tournaments =>
        tournaments.map(t =>
          t.id === tournamentId ? { ...t, status: newStatus } : t
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  private resetForm(): void {
    this.newTournament = {
      name: '',
      description: '',
      startDate: '',
      totalWeeks: 15,
      lateRegistration: true,
      catchUpPercentage: 70
    };
  }

  formatDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
