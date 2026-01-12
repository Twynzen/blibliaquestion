import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Firestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe
} from '@angular/fire/firestore';
import { AuthService } from '@core/services/auth.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';

interface RankEntry {
  rank: number;
  oderId: string;
  displayName: string;
  totalStars: number;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    <div class="ranking-page page">
      <div class="container">
        <header class="page-header">
          <a routerLink="/dashboard" class="back-link">← Volver</a>
          <h1 class="page-title">Ranking del Torneo</h1>
          <p class="page-subtitle">Clasificacion en tiempo real</p>
        </header>

        @if (loading()) {
          <app-loader message="Cargando ranking..." />
        } @else {
          <!-- User position highlight -->
          @if (userRank()) {
            <div class="user-position-card">
              <span class="user-position-label">Tu posicion actual</span>
              <span class="user-position-rank">#{{ userRank()?.rank }}</span>
              <span class="user-position-stars">{{ userRank()?.totalStars }} ⭐</span>
            </div>
          }

          <!-- Top 3 podium -->
          <div class="podium">
            @for (entry of topThree(); track entry.oderId) {
              <div class="podium-item" [class]="'rank-' + entry.rank">
                <div class="podium-medal">
                  @switch (entry.rank) {
                    @case (1) { 🥇 }
                    @case (2) { 🥈 }
                    @case (3) { 🥉 }
                  }
                </div>
                <div class="podium-name">{{ entry.displayName }}</div>
                <div class="podium-stars">{{ entry.totalStars }} ⭐</div>
              </div>
            }
          </div>

          <!-- Full ranking list -->
          <div class="ranking-list">
            <div class="ranking-header">
              <span class="ranking-col-pos">Pos.</span>
              <span class="ranking-col-name">Participante</span>
              <span class="ranking-col-stars">Estrellas</span>
            </div>

            @for (entry of rankings(); track entry.oderId) {
              <div
                class="ranking-item"
                [class.current-user]="entry.oderId === authService.userId()"
                [class.top-three]="entry.rank <= 3"
              >
                <span class="ranking-col-pos">
                  @switch (entry.rank) {
                    @case (1) { 🥇 }
                    @case (2) { 🥈 }
                    @case (3) { 🥉 }
                    @default { {{ entry.rank }} }
                  }
                </span>
                <span class="ranking-col-name">{{ entry.displayName }}</span>
                <span class="ranking-col-stars">{{ entry.totalStars }} ⭐</span>
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
      margin-bottom: var(--spacing-md);
      color: var(--color-text-secondary);
      font-size: 0.875rem;

      &:hover {
        color: var(--color-primary);
      }
    }

    .user-position-card {
      background: linear-gradient(135deg, var(--color-primary) 0%, #357abd 100%);
      color: white;
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-xl);
    }

    .user-position-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .user-position-rank {
      font-size: 2.5rem;
      font-weight: 700;
    }

    .user-position-stars {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .podium {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .podium-item {
      text-align: center;
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-md);

      &.rank-1 {
        order: 2;
        transform: scale(1.1);
        background: linear-gradient(135deg, #ffeaa7 0%, #f0c14b 100%);
      }

      &.rank-2 {
        order: 1;
        background: linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%);
      }

      &.rank-3 {
        order: 3;
        background: linear-gradient(135deg, #ffeaa7 0%, #cd6133 100%);
      }
    }

    .podium-medal {
      font-size: 3rem;
      margin-bottom: var(--spacing-sm);
    }

    .podium-name {
      font-weight: 600;
      margin-bottom: var(--spacing-xs);
    }

    .podium-stars {
      color: var(--color-secondary-dark);
      font-weight: 600;
    }

    .ranking-list {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .ranking-header {
      display: flex;
      padding: var(--spacing-md) var(--spacing-lg);
      background-color: var(--color-background);
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .ranking-item {
      display: flex;
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      transition: background-color var(--transition-fast);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }

      &.current-user {
        background-color: rgba(74, 144, 217, 0.1);
      }

      &.top-three {
        font-weight: 500;
      }
    }

    .ranking-col-pos {
      width: 60px;
      font-weight: 600;
    }

    .ranking-col-name {
      flex: 1;
    }

    .ranking-col-stars {
      font-weight: 600;
      color: var(--color-secondary-dark);
    }

    @media (max-width: 768px) {
      .podium {
        flex-direction: column;
        align-items: center;
      }

      .podium-item {
        width: 100%;
        max-width: 300px;

        &.rank-1 {
          order: 1;
          transform: none;
        }

        &.rank-2 {
          order: 2;
        }

        &.rank-3 {
          order: 3;
        }
      }

      .user-position-card {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm);
      }
    }
  `]
})
export class RankingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  protected authService = inject(AuthService);

  loading = signal(true);
  rankings = signal<RankEntry[]>([]);
  userRank = signal<RankEntry | null>(null);
  topThree = signal<RankEntry[]>([]);

  private unsubscribe: Unsubscribe | null = null;

  ngOnInit(): void {
    const tournamentId = this.route.snapshot.paramMap.get('tournamentId');
    if (tournamentId) {
      this.subscribeToRanking(tournamentId);
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private subscribeToRanking(tournamentId: string): void {
    const participantsRef = collection(
      this.firestore,
      `tournaments/${tournamentId}/participants`
    );

    const q = query(
      participantsRef,
      orderBy('totalStars', 'desc'),
      limit(100)
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      let rank = 1;
      const allRankings: RankEntry[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const entry: RankEntry = {
          rank: rank++,
          oderId: doc.id,
          displayName: data['displayName'] || 'Usuario',
          totalStars: data['totalStars'] || 0
        };
        allRankings.push(entry);

        if (doc.id === this.authService.userId()) {
          this.userRank.set(entry);
        }
      });

      this.rankings.set(allRankings);
      this.topThree.set(allRankings.slice(0, 3));
      this.loading.set(false);
    });
  }
}
