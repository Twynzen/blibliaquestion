import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    <div class="admin-page page">
      <div class="container">
        <header class="page-header">
          <h1 class="page-title">Panel de Administracion</h1>
          <p class="page-subtitle">Gestiona torneos, preguntas y revisa videos</p>
        </header>

        @if (loading()) {
          <app-loader message="Cargando datos..." />
        } @else {
          <!-- Quick Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ stats().activeTournaments }}</div>
              <div class="stat-label">Torneos Activos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats().totalParticipants }}</div>
              <div class="stat-label">Participantes</div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-value">{{ stats().pendingVideos }}</div>
              <div class="stat-label">Videos Pendientes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats().totalQuestions }}</div>
              <div class="stat-label">Preguntas Cargadas</div>
            </div>
          </div>

          <!-- Admin Actions -->
          <div class="admin-grid">
            <a routerLink="/admin/tournaments" class="admin-card">
              <div class="admin-icon">🏆</div>
              <h3>Gestionar Torneos</h3>
              <p>Crear, editar y administrar torneos</p>
            </a>

            <a routerLink="/admin/questions" class="admin-card">
              <div class="admin-icon">❓</div>
              <h3>Importar Preguntas</h3>
              <p>Cargar preguntas desde Excel</p>
            </a>

            <a routerLink="/admin/video-review" class="admin-card" [class.has-pending]="stats().pendingVideos > 0">
              <div class="admin-icon">📹</div>
              <h3>Revisar Videos</h3>
              <p>{{ stats().pendingVideos }} videos pendientes</p>
              @if (stats().pendingVideos > 0) {
                <span class="pending-badge">{{ stats().pendingVideos }}</span>
              }
            </a>

            <a routerLink="/admin/statistics" class="admin-card">
              <div class="admin-icon">📊</div>
              <h3>Estadisticas</h3>
              <p>Ver metricas y reportes</p>
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      margin-bottom: var(--spacing-xl);
    }

    .stat-card.highlight {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
      color: white;

      .stat-value, .stat-label {
        color: white;
      }
    }

    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-lg);
    }

    .admin-card {
      display: block;
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      text-align: center;
      text-decoration: none;
      color: var(--color-text-primary);
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
      position: relative;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }

      &.has-pending {
        border: 2px solid #ff6b6b;
      }
    }

    .admin-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
    }

    .admin-card h3 {
      margin-bottom: var(--spacing-sm);
    }

    .admin-card p {
      color: var(--color-text-secondary);
      margin: 0;
      font-size: 0.875rem;
    }

    .pending-badge {
      position: absolute;
      top: var(--spacing-md);
      right: var(--spacing-md);
      background-color: #ff6b6b;
      color: white;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private firestore = inject(Firestore);

  loading = signal(true);
  stats = signal({
    activeTournaments: 0,
    totalParticipants: 0,
    pendingVideos: 0,
    totalQuestions: 0
  });

  async ngOnInit(): Promise<void> {
    await this.loadStats();
  }

  private async loadStats(): Promise<void> {
    try {
      // Count active tournaments
      const tournamentsRef = collection(this.firestore, 'tournaments');
      const activeTournamentsQuery = query(tournamentsRef, where('status', '==', 'active'));
      const tournamentsSnapshot = await getDocs(activeTournamentsQuery);

      // Count questions
      const questionsRef = collection(this.firestore, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);

      this.stats.set({
        activeTournaments: tournamentsSnapshot.size,
        totalParticipants: 0, // Would need to aggregate from participants subcollections
        pendingVideos: 0, // Would need to count from challenges subcollections
        totalQuestions: questionsSnapshot.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
