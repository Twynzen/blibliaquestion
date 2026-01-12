import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Firestore, collection, getDocs, orderBy, query } from '@angular/fire/firestore';
import { Tournament } from '@shared/models';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    <div class="tournaments-page page">
      <div class="container">
        <header class="page-header">
          <h1 class="page-title">Torneos Disponibles</h1>
          <p class="page-subtitle">Inscribete en un torneo y empieza a competir</p>
        </header>

        @if (loading()) {
          <app-loader message="Cargando torneos..." />
        } @else if (tournaments().length === 0) {
          <div class="empty-state">
            <div class="empty-state-icon">🏆</div>
            <h3>No hay torneos disponibles</h3>
            <p>Vuelve pronto para nuevos torneos.</p>
          </div>
        } @else {
          <div class="tournaments-grid">
            @for (tournament of tournaments(); track tournament.id) {
              <div class="tournament-card" [class]="'status-' + tournament.status">
                <div class="tournament-status">
                  @switch (tournament.status) {
                    @case ('upcoming') {
                      <span class="status-badge upcoming">Proximo</span>
                    }
                    @case ('active') {
                      <span class="status-badge active">En curso</span>
                    }
                    @case ('completed') {
                      <span class="status-badge completed">Finalizado</span>
                    }
                  }
                </div>

                <h3 class="tournament-name">{{ tournament.name }}</h3>
                <p class="tournament-desc">{{ tournament.description }}</p>

                <div class="tournament-info">
                  <div class="info-item">
                    <span class="info-label">Inicio</span>
                    <span class="info-value">{{ formatDate(tournament.startDate) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Duracion</span>
                    <span class="info-value">{{ tournament.totalWeeks }} semanas</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Participantes</span>
                    <span class="info-value">{{ tournament.participantCount }}</span>
                  </div>
                </div>

                <div class="tournament-actions">
                  <a [routerLink]="['/tournaments', tournament.id]" class="btn btn-primary">
                    Ver Detalles
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
    .tournaments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--spacing-lg);
    }

    .tournament-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }

      &.status-active {
        border-left: 4px solid var(--color-success);
      }

      &.status-upcoming {
        border-left: 4px solid var(--color-primary);
      }

      &.status-completed {
        border-left: 4px solid var(--color-text-secondary);
        opacity: 0.8;
      }
    }

    .tournament-status {
      margin-bottom: var(--spacing-md);
    }

    .status-badge {
      display: inline-block;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;

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

    .tournament-name {
      font-size: 1.25rem;
      margin-bottom: var(--spacing-sm);
    }

    .tournament-desc {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-lg);
      font-size: 0.875rem;
    }

    .tournament-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      background-color: var(--color-background);
      border-radius: var(--radius-md);
    }

    .info-item {
      text-align: center;
    }

    .info-label {
      display: block;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .info-value {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .tournament-actions {
      text-align: center;
    }

    .empty-state {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xxl);
      text-align: center;

      h3 {
        margin-bottom: var(--spacing-sm);
      }

      p {
        color: var(--color-text-secondary);
        margin: 0;
      }
    }
  `]
})
export class TournamentListComponent implements OnInit {
  private firestore = inject(Firestore);

  loading = signal(true);
  tournaments = signal<Tournament[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadTournaments();
  }

  private async loadTournaments(): Promise<void> {
    try {
      const tournamentsRef = collection(this.firestore, 'tournaments');
      const q = query(tournamentsRef, orderBy('startDate', 'desc'));
      const snapshot = await getDocs(q);

      const tournamentsList: Tournament[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
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
        };
      });

      this.tournaments.set(tournamentsList);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: Date): string {
    if (!date) return '-';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
