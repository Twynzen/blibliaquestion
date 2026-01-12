import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  Timestamp
} from '@angular/fire/firestore';
import { DailyContent } from '@shared/models';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-daily-content-management',
  standalone: true,
  imports: [RouterLink, FormsModule, LoaderComponent],
  template: `
    <div class="daily-content-page page">
      <div class="container">
        <a routerLink="/admin/tournaments" class="back-link">← Volver a Torneos</a>

        <header class="page-header">
          <h1 class="page-title">Gestion de Contenido Diario</h1>
          <p class="page-subtitle">Configura el contenido para cada dia del torneo</p>
        </header>

        <div class="filters">
          <div class="filter-group">
            <label>Semana:</label>
            <select [(ngModel)]="selectedWeek" (change)="loadContent()" class="form-input">
              @for (week of weeks; track week) {
                <option [value]="week">Semana {{ week }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label>Dia:</label>
            <select [(ngModel)]="selectedDay" (change)="loadContent()" class="form-input">
              @for (day of days; track day) {
                <option [value]="day">Dia {{ day }}</option>
              }
            </select>
          </div>
        </div>

        @if (loading()) {
          <app-loader message="Cargando contenido..." />
        } @else {
          <div class="content-form">
            <h2>Semana {{ selectedWeek }}, Dia {{ selectedDay }}</h2>

            <div class="form-section">
              <h3>Cita Biblica del Dia</h3>
              <div class="form-group">
                <label class="form-label">Referencia</label>
                <input
                  type="text"
                  [(ngModel)]="content.bibleReference"
                  class="form-input"
                  placeholder="Ej: Juan 3:16"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Texto del Versiculo</label>
                <textarea
                  [(ngModel)]="content.bibleVerseText"
                  class="form-input"
                  rows="4"
                  placeholder="Texto completo del versiculo..."
                ></textarea>
              </div>
            </div>

            <div class="form-section">
              <h3>Video Largo del Dia</h3>
              <div class="form-group">
                <label class="form-label">ID de YouTube</label>
                <input
                  type="text"
                  [(ngModel)]="content.youtubeLongVideoId"
                  class="form-input"
                  placeholder="Ej: dQw4w9WgXcQ"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Titulo del Video</label>
                <input
                  type="text"
                  [(ngModel)]="content.youtubeLongVideoTitle"
                  class="form-input"
                  placeholder="Titulo descriptivo"
                />
              </div>
            </div>

            <div class="form-section">
              <h3>Reto del Dia</h3>
              <div class="form-group">
                <label class="form-label">Descripcion del Reto</label>
                <textarea
                  [(ngModel)]="content.dailyChallengeText"
                  class="form-input"
                  rows="3"
                  placeholder="Describe el reto que deben cumplir..."
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Duracion maxima del video (segundos)</label>
                <input
                  type="number"
                  [(ngModel)]="content.maxVideoDuration"
                  class="form-input"
                  min="10"
                  max="300"
                />
              </div>
            </div>

            <div class="form-actions">
              <button
                class="btn btn-primary btn-lg"
                (click)="saveContent()"
                [disabled]="saving()"
              >
                @if (saving()) {
                  Guardando...
                } @else {
                  Guardar Cambios
                }
              </button>
            </div>

            @if (saved()) {
              <div class="save-success">
                ✅ Contenido guardado correctamente
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

    .filters {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      label {
        font-weight: 500;
      }

      .form-input {
        width: auto;
      }
    }

    .content-form {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-sm);

      h2 {
        margin-bottom: var(--spacing-xl);
        color: var(--color-primary);
      }
    }

    .form-section {
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-xl);
      border-bottom: 1px solid var(--color-border);

      &:last-of-type {
        border-bottom: none;
      }

      h3 {
        margin-bottom: var(--spacing-lg);
        font-size: 1.125rem;
      }
    }

    .form-actions {
      text-align: center;
      margin-top: var(--spacing-xl);
    }

    .save-success {
      text-align: center;
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
      background-color: rgba(40, 167, 69, 0.1);
      color: var(--color-success);
      border-radius: var(--radius-md);
      font-weight: 500;
    }
  `]
})
export class DailyContentManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);

  tournamentId = '';
  selectedWeek = 1;
  selectedDay = 1;
  weeks = Array.from({ length: 15 }, (_, i) => i + 1);
  days = Array.from({ length: 7 }, (_, i) => i + 1);

  loading = signal(true);
  saving = signal(false);
  saved = signal(false);

  content = {
    bibleReference: '',
    bibleVerseText: '',
    youtubeLongVideoId: '',
    youtubeLongVideoTitle: '',
    dailyChallengeText: '',
    maxVideoDuration: 60
  };

  ngOnInit(): void {
    this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || '';
    this.loadContent();
  }

  async loadContent(): Promise<void> {
    this.loading.set(true);
    this.saved.set(false);

    try {
      const contentRef = collection(this.firestore, 'dailyContent');
      const q = query(
        contentRef,
        where('tournamentId', '==', this.tournamentId),
        where('weekNumber', '==', this.selectedWeek),
        where('dayNumber', '==', this.selectedDay)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        this.content = {
          bibleReference: data['bibleReference'] || '',
          bibleVerseText: data['bibleVerseText'] || '',
          youtubeLongVideoId: data['youtubeLongVideoId'] || '',
          youtubeLongVideoTitle: data['youtubeLongVideoTitle'] || '',
          dailyChallengeText: data['dailyChallengeText'] || '',
          maxVideoDuration: data['maxVideoDuration'] || 60
        };
      } else {
        this.content = {
          bibleReference: '',
          bibleVerseText: '',
          youtubeLongVideoId: '',
          youtubeLongVideoTitle: '',
          dailyChallengeText: '',
          maxVideoDuration: 60
        };
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async saveContent(): Promise<void> {
    this.saving.set(true);
    this.saved.set(false);

    try {
      const contentId = `${this.tournamentId}_${this.selectedWeek}_${this.selectedDay}`;
      const contentRef = doc(this.firestore, 'dailyContent', contentId);

      await setDoc(contentRef, {
        tournamentId: this.tournamentId,
        weekNumber: this.selectedWeek,
        dayNumber: this.selectedDay,
        ...this.content,
        releaseDate: this.calculateReleaseDate(),
        updatedAt: Timestamp.now()
      }, { merge: true });

      this.saved.set(true);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      this.saving.set(false);
    }
  }

  private calculateReleaseDate(): Timestamp {
    // This would need the tournament start date to calculate properly
    // For now, return current timestamp as placeholder
    return Timestamp.now();
  }
}
