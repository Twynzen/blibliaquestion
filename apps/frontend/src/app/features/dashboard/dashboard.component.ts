import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Firestore, collection, query, where, getDocs, orderBy, limit } from '@angular/fire/firestore';
import { AuthService } from '@core/services/auth.service';
import { Tournament } from '@shared/models';
import { LoaderComponent } from '@shared/components/loader/loader.component';

interface RankEntry {
  rank: number;
  oderId: string;
  displayName: string;
  totalStars: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    <div class="dashboard page">
      <div class="container">
        <header class="page-header">
          <h1 class="page-title">Hola, {{ authService.userDisplayName() }}!</h1>
          <p class="page-subtitle">Bienvenido a tu panel de Biblia Question</p>
        </header>

        @if (loading()) {
          <app-loader message="Cargando tu progreso..." />
        } @else {
          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ authService.currentUser()?.totalStars || 0 }}</div>
              <div class="stat-label">Estrellas Totales</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">#{{ userRank() || '-' }}</div>
              <div class="stat-label">Tu Posicion</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ authService.currentUser()?.tournamentsPlayed || 0 }}</div>
              <div class="stat-label">Torneos Jugados</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ authService.currentUser()?.currentStreak || 0 }}</div>
              <div class="stat-label">Racha Actual</div>
            </div>
          </div>

          <!-- Active Tournament -->
          @if (activeTournament()) {
            <section class="section">
              <h2 class="section-title">Torneo Activo</h2>
              <div class="tournament-card">
                <div class="tournament-info">
                  <h3 class="tournament-name">{{ activeTournament()!.name }}</h3>
                  <p class="tournament-desc">{{ activeTournament()!.description }}</p>
                  <div class="tournament-meta">
                    <span>Semana {{ getCurrentWeek() }} de {{ activeTournament()!.totalWeeks }}</span>
                    <span>{{ activeTournament()!.participantCount }} participantes</span>
                  </div>
                </div>
                <div class="tournament-actions">
                  <a [routerLink]="['/play', activeTournament()!.id]" class="btn btn-primary btn-lg">
                    Jugar Hoy
                  </a>
                  <a [routerLink]="['/ranking', activeTournament()!.id]" class="btn btn-outline">
                    Ver Ranking
                  </a>
                </div>
              </div>
            </section>
          } @else {
            <section class="section">
              <div class="empty-state">
                <div class="empty-state-icon">🏆</div>
                <h3>No estas inscrito en ningun torneo</h3>
                <p>Explora los torneos disponibles y unete a uno</p>
                <a routerLink="/tournaments" class="btn btn-primary">
                  Ver Torneos
                </a>
              </div>
            </section>
          }

          <!-- Top Ranking -->
          @if (topRanking().length > 0) {
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Top 5 del Torneo</h2>
                @if (activeTournament()) {
                  <a [routerLink]="['/ranking', activeTournament()!.id]" class="section-link">
                    Ver ranking completo
                  </a>
                }
              </div>
              <div class="ranking-list">
                @for (entry of topRanking(); track entry.oderId) {
                  <div class="ranking-item" [class.current-user]="entry.oderId === authService.userId()">
                    <span class="ranking-position" [class]="'rank-' + entry.rank">
                      @switch (entry.rank) {
                        @case (1) { 🥇 }
                        @case (2) { 🥈 }
                        @case (3) { 🥉 }
                        @default { {{ entry.rank }} }
                      }
                    </span>
                    <span class="ranking-name">{{ entry.displayName }}</span>
                    <span class="ranking-stars">{{ entry.totalStars }} ⭐</span>
                  </div>
                }
              </div>
            </section>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .section {
      margin-bottom: var(--spacing-xl);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
    }

    .section-title {
      font-size: 1.5rem;
      margin: 0;
    }

    .section-link {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .tournament-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-xl);
    }

    .tournament-name {
      font-size: 1.5rem;
      margin-bottom: var(--spacing-sm);
    }

    .tournament-desc {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-md);
    }

    .tournament-meta {
      display: flex;
      gap: var(--spacing-lg);
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .tournament-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .ranking-list {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .ranking-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);

      &:last-child {
        border-bottom: none;
      }

      &.current-user {
        background-color: rgba(74, 144, 217, 0.1);
      }
    }

    .ranking-position {
      width: 40px;
      font-weight: 600;
      font-size: 1.25rem;
    }

    .ranking-name {
      flex: 1;
      font-weight: 500;
    }

    .ranking-stars {
      font-weight: 600;
      color: var(--color-secondary-dark);
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
        margin-bottom: var(--spacing-lg);
      }
    }

    @media (max-width: 768px) {
      .tournament-card {
        flex-direction: column;
        text-align: center;
      }

      .tournament-meta {
        justify-content: center;
      }

      .tournament-actions {
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  protected authService = inject(AuthService);
  private firestore = inject(Firestore);
  private router = inject(Router);

  loading = signal(true);
  activeTournament = signal<Tournament | null>(null);
  topRanking = signal<RankEntry[]>([]);
  userRank = signal<number | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      // Load active tournament
      const tournamentsRef = collection(this.firestore, 'tournaments');
      const q = query(
        tournamentsRef,
        where('status', '==', 'active'),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        this.activeTournament.set({
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
        });

        // Load top ranking
        await this.loadTopRanking(doc.id);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadTopRanking(tournamentId: string): Promise<void> {
    const participantsRef = collection(
      this.firestore,
      `tournaments/${tournamentId}/participants`
    );
    const q = query(
      participantsRef,
      orderBy('totalStars', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(q);
    let rank = 1;
    const rankings: RankEntry[] = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      rankings.push({
        rank: rank++,
        oderId: doc.id,
        displayName: data['displayName'] || 'Usuario',
        totalStars: data['totalStars'] || 0
      });

      if (doc.id === this.authService.userId()) {
        this.userRank.set(rank - 1);
      }
    });

    this.topRanking.set(rankings);
  }

  getCurrentWeek(): number {
    const tournament = this.activeTournament();
    if (!tournament) return 1;

    const start = tournament.startDate;
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(Math.floor(diffDays / 7) + 1, tournament.totalWeeks);
  }
}
