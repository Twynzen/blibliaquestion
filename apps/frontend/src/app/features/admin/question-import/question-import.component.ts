import { Component, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  Timestamp
} from '@angular/fire/firestore';
import { Tournament, QuestionImportRow } from '@shared/models';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-question-import',
  standalone: true,
  imports: [RouterLink, FormsModule, SlicePipe],
  template: `
    <div class="import-page page">
      <div class="container">
        <a routerLink="/admin" class="back-link">← Volver al Panel</a>

        <header class="page-header">
          <h1 class="page-title">Importar Preguntas</h1>
          <p class="page-subtitle">Carga preguntas desde un archivo Excel</p>
        </header>

        <div class="import-card">
          <!-- Step 1: Select Tournament -->
          <div class="import-step">
            <h3>1. Selecciona el Torneo</h3>
            <select
              [(ngModel)]="selectedTournamentId"
              class="form-input"
              (change)="onTournamentChange()"
            >
              <option value="">Seleccionar torneo...</option>
              @for (tournament of tournaments(); track tournament.id) {
                <option [value]="tournament.id">{{ tournament.name }}</option>
              }
            </select>
          </div>

          <!-- Step 2: Upload File -->
          @if (selectedTournamentId) {
            <div class="import-step">
              <h3>2. Sube el archivo Excel</h3>
              <div class="upload-area" (click)="fileInput.click()">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  (change)="onFileSelected($event)"
                  #fileInput
                  hidden
                />
                @if (fileName()) {
                  <div class="file-selected">
                    <span class="file-icon">📄</span>
                    <span>{{ fileName() }}</span>
                  </div>
                } @else {
                  <div class="upload-prompt">
                    <span class="upload-icon">📥</span>
                    <p>Haz clic para seleccionar archivo</p>
                    <span class="upload-hint">Formatos: .xlsx, .xls</span>
                  </div>
                }
              </div>
              <a href="#" class="download-template" (click)="downloadTemplate($event)">
                Descargar plantilla Excel
              </a>
            </div>
          }

          <!-- Step 3: Preview -->
          @if (previewData().length > 0) {
            <div class="import-step">
              <h3>3. Vista Previa</h3>
              <div class="preview-stats">
                <span class="stat">{{ previewData().length }} preguntas detectadas</span>
                @if (errors().length > 0) {
                  <span class="stat error">{{ errors().length }} errores</span>
                }
              </div>

              <div class="preview-table-container">
                <table class="preview-table">
                  <thead>
                    <tr>
                      <th>Sem</th>
                      <th>Dia</th>
                      <th>#</th>
                      <th>Pregunta</th>
                      <th>Referencia</th>
                      <th>Correcta</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of previewData().slice(0, 10); track $index) {
                      <tr>
                        <td>{{ row.weekNumber }}</td>
                        <td>{{ row.dayNumber }}</td>
                        <td>{{ row.questionNumber }}</td>
                        <td>{{ row.questionText | slice:0:50 }}...</td>
                        <td>{{ row.bibleReference }}</td>
                        <td>{{ row.correctAnswer }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (previewData().length > 10) {
                <p class="preview-note">Mostrando 10 de {{ previewData().length }} preguntas</p>
              }
            </div>
          }

          <!-- Errors -->
          @if (errors().length > 0) {
            <div class="errors-section">
              <h4>Errores encontrados:</h4>
              <ul class="error-list">
                @for (error of errors().slice(0, 5); track $index) {
                  <li>{{ error }}</li>
                }
              </ul>
            </div>
          }

          <!-- Import Button -->
          @if (previewData().length > 0 && errors().length === 0) {
            <div class="import-actions">
              <button
                class="btn btn-primary btn-lg"
                (click)="importQuestions()"
                [disabled]="importing()"
              >
                @if (importing()) {
                  Importando... {{ importProgress() }}%
                } @else {
                  Importar {{ previewData().length }} Preguntas
                }
              </button>
            </div>
          }

          <!-- Success Message -->
          @if (importSuccess()) {
            <div class="success-message">
              <span class="success-icon">✅</span>
              <p>¡{{ importedCount() }} preguntas importadas exitosamente!</p>
            </div>
          }
        </div>
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

    .import-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }

    .import-step {
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-xl);
      border-bottom: 1px solid var(--color-border);

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      h3 {
        margin-bottom: var(--spacing-md);
      }
    }

    .upload-area {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      text-align: center;
      cursor: pointer;
      transition: border-color var(--transition-fast);

      &:hover {
        border-color: var(--color-primary);
      }
    }

    .upload-icon, .file-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: var(--spacing-md);
    }

    .upload-hint {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .file-selected {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      font-weight: 500;
    }

    .download-template {
      display: inline-block;
      margin-top: var(--spacing-md);
      font-size: 0.875rem;
    }

    .preview-stats {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-md);
    }

    .preview-stats .stat {
      padding: var(--spacing-xs) var(--spacing-sm);
      background-color: var(--color-background);
      border-radius: var(--radius-md);
      font-size: 0.875rem;

      &.error {
        background-color: rgba(220, 53, 69, 0.1);
        color: var(--color-error);
      }
    }

    .preview-table-container {
      overflow-x: auto;
    }

    .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      th, td {
        padding: var(--spacing-sm);
        text-align: left;
        border-bottom: 1px solid var(--color-border);
      }

      th {
        background-color: var(--color-background);
        font-weight: 600;
      }
    }

    .preview-note {
      text-align: center;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin-top: var(--spacing-md);
    }

    .errors-section {
      background-color: rgba(220, 53, 69, 0.1);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);

      h4 {
        color: var(--color-error);
        margin-bottom: var(--spacing-sm);
      }
    }

    .error-list {
      margin: 0;
      padding-left: var(--spacing-lg);
      color: var(--color-error);
      font-size: 0.875rem;
    }

    .import-actions {
      text-align: center;
    }

    .success-message {
      text-align: center;
      padding: var(--spacing-xl);
      background-color: rgba(40, 167, 69, 0.1);
      border-radius: var(--radius-lg);
      margin-top: var(--spacing-lg);

      .success-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: var(--spacing-md);
      }

      p {
        color: var(--color-success);
        font-weight: 600;
        margin: 0;
      }
    }
  `]
})
export class QuestionImportComponent {
  private firestore = inject(Firestore);

  tournaments = signal<Tournament[]>([]);
  selectedTournamentId = '';
  fileName = signal('');
  previewData = signal<QuestionImportRow[]>([]);
  errors = signal<string[]>([]);
  importing = signal(false);
  importProgress = signal(0);
  importSuccess = signal(false);
  importedCount = signal(0);

  constructor() {
    this.loadTournaments();
  }

  private async loadTournaments(): Promise<void> {
    const tournamentsRef = collection(this.firestore, 'tournaments');
    const snapshot = await getDocs(tournamentsRef);

    const tournamentsList: Tournament[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Tournament));

    this.tournaments.set(tournamentsList);
  }

  onTournamentChange(): void {
    this.previewData.set([]);
    this.errors.set([]);
    this.importSuccess.set(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileName.set(file.name);
    this.parseExcelFile(file);
  }

  private parseExcelFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { range: 1 });

        const parsed: QuestionImportRow[] = jsonData.map((row: any) => ({
          weekNumber: parseInt(row['Semana'] || row['weekNumber'] || 0),
          dayNumber: parseInt(row['Dia'] || row['dayNumber'] || 0),
          questionNumber: parseInt(row['Numero'] || row['questionNumber'] || 0),
          questionText: row['Pregunta'] || row['questionText'] || '',
          bibleReference: row['Referencia'] || row['bibleReference'] || '',
          bibleVerseText: row['Versiculo'] || row['bibleVerseText'] || '',
          optionA: row['OpcionA'] || row['optionA'] || '',
          optionB: row['OpcionB'] || row['optionB'] || '',
          optionC: row['OpcionC'] || row['optionC'] || '',
          optionD: row['OpcionD'] || row['optionD'] || '',
          correctAnswer: (row['Correcta'] || row['correctAnswer'] || '').toString().toUpperCase(),
          youtubeShortId: row['YouTubeShort'] || row['youtubeShortId'] || '',
          isExtra: (row['Extra'] || row['isExtra'] || '').toString().toLowerCase() === 'si',
          youtubeLongId: row['YouTubeLargo'] || row['youtubeLongId'] || ''
        }));

        this.previewData.set(parsed);
        this.validateData(parsed);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        this.errors.set(['Error al leer el archivo Excel']);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  private validateData(data: QuestionImportRow[]): void {
    const errors: string[] = [];

    data.forEach((row, index) => {
      if (!row.questionText) {
        errors.push(`Fila ${index + 2}: Falta el texto de la pregunta`);
      }
      if (!['A', 'B', 'C', 'D'].includes(row.correctAnswer)) {
        errors.push(`Fila ${index + 2}: Respuesta correcta invalida (${row.correctAnswer})`);
      }
      if (!row.optionA || !row.optionB || !row.optionC || !row.optionD) {
        errors.push(`Fila ${index + 2}: Faltan opciones de respuesta`);
      }
    });

    this.errors.set(errors);
  }

  async importQuestions(): Promise<void> {
    if (!this.selectedTournamentId || this.previewData().length === 0) return;

    this.importing.set(true);
    this.importProgress.set(0);

    const tournament = this.tournaments().find(t => t.id === this.selectedTournamentId);
    if (!tournament) return;

    const questions = this.previewData();
    const batchSize = 500;
    let imported = 0;

    try {
      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = writeBatch(this.firestore);
        const chunk = questions.slice(i, i + batchSize);

        for (const q of chunk) {
          const releaseDate = this.calculateReleaseDate(
            tournament.startDate,
            q.weekNumber,
            q.dayNumber
          );

          const questionRef = doc(collection(this.firestore, 'questions'));
          batch.set(questionRef, {
            tournamentId: this.selectedTournamentId,
            weekNumber: q.weekNumber,
            dayNumber: q.dayNumber,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            bibleReference: q.bibleReference,
            bibleVerseText: q.bibleVerseText,
            options: [
              { id: 'A', text: q.optionA },
              { id: 'B', text: q.optionB },
              { id: 'C', text: q.optionC },
              { id: 'D', text: q.optionD }
            ],
            correctAnswer: q.correctAnswer,
            stars: q.isExtra ? 3 : 1,
            isExtraQuestion: q.isExtra,
            youtubeShortId: q.youtubeShortId || null,
            releaseDate: Timestamp.fromDate(releaseDate),
            createdAt: Timestamp.now()
          });

          imported++;
        }

        await batch.commit();
        this.importProgress.set(Math.round((imported / questions.length) * 100));
      }

      this.importSuccess.set(true);
      this.importedCount.set(imported);
    } catch (error) {
      console.error('Import error:', error);
      this.errors.set(['Error durante la importacion']);
    } finally {
      this.importing.set(false);
    }
  }

  private calculateReleaseDate(startDate: Date, week: number, day: number): Date {
    const date = new Date(startDate);
    date.setDate(date.getDate() + ((week - 1) * 7) + (day - 1));
    date.setHours(0, 0, 0, 0);
    return date;
  }

  downloadTemplate(event: Event): void {
    event.preventDefault();

    const template = [
      {
        Semana: 1,
        Dia: 1,
        Numero: 1,
        Pregunta: '¿Ejemplo de pregunta?',
        Referencia: 'Juan 3:16',
        Versiculo: 'Texto del versiculo...',
        OpcionA: 'Primera opcion',
        OpcionB: 'Segunda opcion',
        OpcionC: 'Tercera opcion',
        OpcionD: 'Cuarta opcion',
        Correcta: 'B',
        YouTubeShort: 'videoId123',
        Extra: 'NO',
        YouTubeLargo: ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Preguntas');
    XLSX.writeFile(workbook, 'plantilla_preguntas.xlsx');
  }
}
