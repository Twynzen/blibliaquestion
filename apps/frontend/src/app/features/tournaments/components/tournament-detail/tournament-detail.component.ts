import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from '@angular/fire/firestore';
import { AuthService } from '@core/services/auth.service';
import { Tournament } from '@shared/models';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    <div class="tournament-detail-page page">
      <div class="container">
        <a routerLink="/tournaments" class="back-link">← Volver a Torneos</a>

        @if (loading()) {
          <app-loader message="Cargando torneo..." />
        } @else if (tournament()) {
          <div class="tournament-header">
            <div class="status-badge" [class]="tournament()!.status">
              @switch (tournament()!.status) {
                @case ('upcoming') { Proximo }
                @case ('active') { En curso }
                @case ('completed') { Finalizado }
              }
            </div>
            <h1 class="tournament-title">{{ tournament()!.name }}</h1>
            <p class="tournament-description">{{ tournament()!.description }}</p>
          </div>

          <div class="tournament-details">
            <div class="detail-card">
              <h3>Informacion del Torneo</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Fecha de inicio</span>
                  <span class="detail-value">{{ formatDate(tournament()!.startDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fecha de fin</span>
                  <span class="detail-value">{{ formatDate(tournament()!.endDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Duracion</span>
                  <span class="detail-value">{{ tournament()!.totalWeeks }} semanas</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Participantes</span>
                  <span class="detail-value">{{ tournament()!.participantCount }}</span>
                </div>
              </div>
            </div>

            <div class="detail-card">
              <h3>Reglas del Torneo</h3>
              <ul class="rules-list">
                <li>4 preguntas normales por dia (1 estrella cada una)</li>
                <li>1 pregunta extra por dia (3 estrellas)</li>
                <li>1 reto diario con video (5 estrellas si es aprobado)</li>
                <li>Maximo 12 estrellas por dia</li>
                @if (tournament()!.lateRegistrationAllowed) {
                  <li>Se permite inscripcion tardia con nivelacion del {{ tournament()!.catchUpPercentage }}%</li>
                }
              </ul>
            </div>
          </div>

          <div class="tournament-actions">
            @if (isParticipant()) {
              <div class="already-enrolled">
                <span class="enrolled-badge">✅ Ya estas inscrito</span>
              </div>
              @if (tournament()!.status === 'active') {
                <a [routerLink]="['/play', tournament()!.id]" class="btn btn-primary btn-lg">
                  Jugar Ahora
                </a>
              }
              <a [routerLink]="['/ranking', tournament()!.id]" class="btn btn-outline btn-lg">
                Ver Ranking
              </a>
            } @else if (canEnroll()) {
              <button
                class="btn btn-primary btn-lg"
                (click)="enrollInTournament()"
                [disabled]="enrolling()"
              >
                @if (enrolling()) {
                  Inscribiendo...
                } @else {
                  Inscribirme al Torneo
                }
              </button>
            } @else {
              <div class="cannot-enroll">
                <p>Este torneo no admite mas inscripciones.</p>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-state-icon">🏆</div>
            <h3>Torneo no encontrado</h3>
            <a routerLink="/tournaments" class="btn btn-primary">Ver Torneos</a>
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

      &:hover {
        color: var(--color-primary);
      }
    }

    .tournament-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .status-badge {
      display: inline-block;
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: var(--spacing-md);

      &.active {
        background-color: rgba(40, 167, 69, 0.1);
        color: var(--color-success);
      }

      &.upcoming {
        background-color: rgba(74, 144, 217, 0.1);
        color: var(--color-primary);
      }

      &.completed {
        background-color: rgba(108, 117, 125, 0.1);
        color: var(--color-text-secondary);
      }
    }

    .tournament-title {
      font-size: 2.5rem;
      margin-bottom: var(--spacing-md);
    }

    .tournament-description {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }

    .tournament-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .detail-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);

      h3 {
        margin-bottom: var(--spacing-lg);
        font-size: 1.25rem;
      }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }

    .detail-item {
      text-align: center;
      padding: var(--spacing-md);
      background-color: var(--color-background);
      border-radius: var(--radius-md);
    }

    .detail-label {
      display: block;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .detail-value {
      font-weight: 600;
    }

    .rules-list {
      margin: 0;
      padding-left: var(--spacing-lg);

      li {
        margin-bottom: var(--spacing-sm);
        color: var(--color-text-secondary);
      }
    }

    .tournament-actions {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
    }

    .already-enrolled {
      margin-bottom: var(--spacing-md);
    }

    .enrolled-badge {
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: rgba(40, 167, 69, 0.1);
      color: var(--color-success);
      border-radius: var(--radius-full);
      font-weight: 600;
    }

    .cannot-enroll {
      color: var(--color-text-secondary);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xxl);

      h3 {
        margin-bottom: var(--spacing-lg);
      }
    }
  `]
})
export class TournamentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestore = inject(Firestore);
  protected authService = inject(AuthService);

  loading = signal(true);
  enrolling = signal(false);
  tournament = signal<Tournament | null>(null);
  isParticipant = signal(false);

  async ngOnInit(): Promise<void> {
    const tournamentId = this.route.snapshot.paramMap.get('id');
    if (tournamentId) {
      await this.loadTournament(tournamentId);
      await this.checkParticipation(tournamentId);
    }
  }

  private async loadTournament(tournamentId: string): Promise<void> {
    try {
      const tournamentRef = doc(this.firestore, 'tournaments', tournamentId);
      const snapshot = await getDoc(tournamentRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        this.tournament.set({
          id: snapshot.id,
          name: data['name'],
          description: data['description'],
          startDate: data['startDate']?.toDate(),
          endDate: data['endDate']?.toDate(),
          totalWeeks: data['totalWeeks'],
          status: data['status'],
          lateRegistrationAllowed: data['lateRegistrationAllowed'],
          catchUpPercentage: data['catchUpPercentage'],
          participantCount: data['participantCount'] || 0,
          createdBy: data['createdBy'],
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate()
        });
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async checkParticipation(tournamentId: string): Promise<void> {
    const userId = this.authService.userId();
    if (!userId) return;

    const participantRef = doc(
      this.firestore,
      `tournaments/${tournamentId}/participants/${userId}`
    );
    const snapshot = await getDoc(participantRef);
    this.isParticipant.set(snapshot.exists());
  }

  canEnroll(): boolean {
    const t = this.tournament();
    if (!t) return false;

    if (t.status === 'completed') return false;
    if (t.status === 'upcoming') return true;
    if (t.status === 'active' && t.lateRegistrationAllowed) return true;

    return false;
  }

  async enrollInTournament(): Promise<void> {
    const userId = this.authService.userId();
    const t = this.tournament();
    if (!userId || !t) return;

    this.enrolling.set(true);

    try {
      const participantRef = doc(
        this.firestore,
        `tournaments/${t.id}/participants/${userId}`
      );

      await setDoc(participantRef, {
        oderId: userId,
        displayName: this.authService.userDisplayName(),
        joinedAt: Timestamp.now(),
        totalStars: 0,
        weeklyStars: {},
        rank: 0,
        isCatchUp: t.status === 'active',
        catchUpStars: 0
      });

      this.isParticipant.set(true);
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      this.enrolling.set(false);
    }
  }

  formatDate(date: Date): string {
    if (!date) return '-';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
