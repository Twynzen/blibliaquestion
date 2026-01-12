import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from '@core/services/auth.service';
import { Question, DailyContent, Answer } from '@shared/models';
import { LoaderComponent } from '@shared/components/loader/loader.component';

type GamePhase =
  | 'loading'
  | 'bible-verse'
  | 'question'
  | 'daily-challenge'
  | 'long-video'
  | 'summary'
  | 'completed';

interface QuestionResult {
  questionNumber: number;
  isCorrect: boolean;
  starsEarned: number;
  isExtra: boolean;
}

@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    <div class="gameplay-page">
      @switch (currentPhase()) {
        @case ('loading') {
          <app-loader [fullScreen]="true" message="Cargando preguntas del dia..." />
        }

        @case ('bible-verse') {
          <div class="phase-container">
            <div class="phase-card bible-verse-card">
              <div class="phase-icon">📖</div>
              <h2 class="phase-title">Cita Biblica del Dia</h2>
              <div class="bible-reference">{{ dailyContent()?.bibleReference }}</div>
              <blockquote class="bible-text">
                "{{ dailyContent()?.bibleVerseText }}"
              </blockquote>
              <button class="btn btn-primary btn-lg" (click)="nextPhase()">
                Continuar
              </button>
            </div>
          </div>
        }

        @case ('question') {
          <div class="phase-container">
            <div class="question-phase">
              <!-- Progress indicator -->
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  [style.width.%]="(currentQuestionIndex() / questions().length) * 100"
                ></div>
              </div>

              <div class="question-header">
                <span class="question-number">
                  Pregunta {{ currentQuestionIndex() + 1 }} de {{ questions().length }}
                </span>
                <span class="question-stars" [class.extra]="currentQuestion()?.isExtraQuestion">
                  @if (currentQuestion()?.isExtraQuestion) {
                    ⭐⭐⭐ Extra
                  } @else {
                    ⭐ x{{ currentQuestion()?.stars }}
                  }
                </span>
              </div>

              <!-- YouTube Short -->
              @if (currentQuestion()?.youtubeShortId && !videoWatched()) {
                <div class="video-section">
                  <h3>Mira este video antes de responder:</h3>
                  <div class="video-container vertical">
                    <iframe
                      [src]="getYouTubeUrl(currentQuestion()!.youtubeShortId!)"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <button class="btn btn-outline" (click)="skipVideo()">
                    Saltar video
                  </button>
                </div>
              } @else {
                <!-- Question content -->
                <div class="question-content">
                  <h2 class="question-text">{{ currentQuestion()?.questionText }}</h2>

                  <div class="options-grid">
                    @for (option of currentQuestion()?.options; track option.id) {
                      <button
                        class="option-btn"
                        [class.selected]="selectedAnswer() === option.id"
                        [class.correct]="showResult() && option.id === currentQuestion()?.correctAnswer"
                        [class.incorrect]="showResult() && selectedAnswer() === option.id && option.id !== currentQuestion()?.correctAnswer"
                        [disabled]="showResult()"
                        (click)="selectAnswer(option.id)"
                      >
                        <span class="option-letter">{{ option.id }}</span>
                        <span class="option-text">{{ option.text }}</span>
                      </button>
                    }
                  </div>

                  @if (selectedAnswer() && !showResult()) {
                    <button class="btn btn-primary btn-lg btn-full" (click)="confirmAnswer()">
                      Confirmar Respuesta
                    </button>
                  }

                  @if (showResult()) {
                    <div class="result-box" [class.correct]="isCurrentCorrect()" [class.incorrect]="!isCurrentCorrect()">
                      @if (isCurrentCorrect()) {
                        <div class="result-icon">✅</div>
                        <div class="result-text">¡Correcto! +{{ currentQuestion()?.stars }} ⭐</div>
                      } @else {
                        <div class="result-icon">❌</div>
                        <div class="result-text">
                          Incorrecto. La respuesta era: {{ currentQuestion()?.correctAnswer }}
                        </div>
                      }
                      <button class="btn btn-primary btn-lg" (click)="nextQuestion()">
                        @if (currentQuestionIndex() < questions().length - 1) {
                          Siguiente Pregunta
                        } @else {
                          Continuar al Reto
                        }
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        @case ('daily-challenge') {
          <div class="phase-container">
            <div class="phase-card challenge-card">
              <div class="phase-icon">🎯</div>
              <h2 class="phase-title">Reto del Dia</h2>
              <span class="challenge-stars">⭐⭐⭐⭐⭐ 5 estrellas</span>

              <p class="challenge-description">
                {{ dailyContent()?.dailyChallengeText }}
              </p>

              <div class="challenge-requirements">
                <p><strong>Requisitos del video:</strong></p>
                <ul>
                  <li>Formato vertical (portrait)</li>
                  <li>Maximo {{ dailyContent()?.maxVideoDuration || 60 }} segundos</li>
                  <li>Maximo 50MB</li>
                </ul>
              </div>

              @if (!challengeSubmitted()) {
                <div class="upload-section">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    (change)="onVideoSelected($event)"
                    #videoInput
                    hidden
                  />

                  @if (uploadProgress() > 0 && uploadProgress() < 100) {
                    <div class="upload-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="uploadProgress()"></div>
                      </div>
                      <span>Subiendo... {{ uploadProgress() }}%</span>
                    </div>
                  } @else {
                    <button class="btn btn-primary btn-lg" (click)="videoInput.click()">
                      Seleccionar Video
                    </button>
                  }
                </div>
              } @else {
                <div class="challenge-submitted">
                  <div class="submitted-icon">📤</div>
                  <p>¡Video enviado! Esta pendiente de revision.</p>
                </div>
              }

              <button class="btn btn-outline" (click)="nextPhase()">
                @if (challengeSubmitted()) {
                  Continuar
                } @else {
                  Saltar por hoy
                }
              </button>
            </div>
          </div>
        }

        @case ('long-video') {
          <div class="phase-container">
            <div class="phase-card video-card">
              <div class="phase-icon">📺</div>
              <h2 class="phase-title">Video Recomendado del Dia</h2>

              @if (dailyContent()?.youtubeLongVideoId) {
                <p class="video-title">{{ dailyContent()?.youtubeLongVideoTitle }}</p>
                <div class="video-container horizontal">
                  <iframe
                    [src]="getYouTubeUrl(dailyContent()!.youtubeLongVideoId!)"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              } @else {
                <p class="no-video">No hay video disponible para hoy.</p>
              }

              <button class="btn btn-primary btn-lg" (click)="nextPhase()">
                Ver mi Resumen
              </button>
            </div>
          </div>
        }

        @case ('summary') {
          <div class="phase-container">
            <div class="phase-card summary-card">
              <div class="phase-icon">🎉</div>
              <h2 class="phase-title">¡Felicidades!</h2>

              <div class="total-stars">
                <span class="stars-earned">{{ totalStarsEarned() }}</span>
                <span class="stars-label">estrellas hoy</span>
              </div>

              <div class="results-list">
                @for (result of questionResults(); track result.questionNumber) {
                  <div class="result-item" [class.correct]="result.isCorrect">
                    <span class="result-label">
                      @if (result.isExtra) {
                        Pregunta Extra:
                      } @else {
                        Pregunta {{ result.questionNumber }}:
                      }
                    </span>
                    <span class="result-status">
                      @if (result.isCorrect) {
                        ✅ +{{ result.starsEarned }} ⭐
                      } @else {
                        ❌ 0 ⭐
                      }
                    </span>
                  </div>
                }
                <div class="result-item" [class.pending]="!challengeSubmitted()">
                  <span class="result-label">Reto Diario:</span>
                  <span class="result-status">
                    @if (challengeSubmitted()) {
                      ⏳ Pendiente revision
                    } @else {
                      ⏭️ No completado
                    }
                  </span>
                </div>
              </div>

              <div class="summary-actions">
                <a routerLink="/dashboard" class="btn btn-primary btn-lg">
                  Volver al Inicio
                </a>
                <a [routerLink]="['/ranking', tournamentId]" class="btn btn-outline">
                  Ver Ranking
                </a>
              </div>
            </div>
          </div>
        }

        @case ('completed') {
          <div class="phase-container">
            <div class="phase-card completed-card">
              <div class="phase-icon">✅</div>
              <h2 class="phase-title">Ya completaste las preguntas de hoy</h2>
              <p>Vuelve manana para nuevas preguntas.</p>

              <div class="summary-actions">
                <a routerLink="/dashboard" class="btn btn-primary btn-lg">
                  Volver al Inicio
                </a>
                <a [routerLink]="['/ranking', tournamentId]" class="btn btn-outline">
                  Ver Ranking
                </a>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .gameplay-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    }

    .phase-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
    }

    .phase-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xl);
      max-width: 600px;
      width: 100%;
      text-align: center;
      box-shadow: var(--shadow-lg);
    }

    .phase-icon {
      font-size: 4rem;
      margin-bottom: var(--spacing-lg);
    }

    .phase-title {
      font-size: 1.75rem;
      margin-bottom: var(--spacing-lg);
    }

    /* Bible verse phase */
    .bible-reference {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: var(--spacing-md);
    }

    .bible-text {
      font-size: 1.25rem;
      font-style: italic;
      line-height: 1.8;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-xl);
      padding: var(--spacing-lg);
      background-color: rgba(74, 144, 217, 0.05);
      border-left: 4px solid var(--color-primary);
      border-radius: var(--radius-md);
    }

    /* Question phase */
    .question-phase {
      background-color: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xl);
      max-width: 800px;
      width: 100%;
      box-shadow: var(--shadow-lg);
    }

    .progress-bar {
      height: 4px;
      background-color: var(--color-border);
      border-radius: var(--radius-full);
      margin-bottom: var(--spacing-lg);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--color-primary);
      transition: width var(--transition-normal);
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
    }

    .question-number {
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .question-stars {
      padding: var(--spacing-xs) var(--spacing-sm);
      background-color: var(--color-secondary);
      border-radius: var(--radius-full);
      font-weight: 600;
      font-size: 0.875rem;

      &.extra {
        background-color: #ff6b6b;
        color: white;
      }
    }

    .video-section {
      text-align: center;
      margin-bottom: var(--spacing-xl);

      h3 {
        margin-bottom: var(--spacing-lg);
      }
    }

    .video-container {
      margin: 0 auto var(--spacing-lg);
      border-radius: var(--radius-lg);
      overflow: hidden;
      background-color: #000;

      &.vertical {
        max-width: 300px;
        aspect-ratio: 9/16;
      }

      &.horizontal {
        max-width: 100%;
        aspect-ratio: 16/9;
      }

      iframe {
        width: 100%;
        height: 100%;
      }
    }

    .question-content {
      text-align: left;
    }

    .question-text {
      font-size: 1.25rem;
      margin-bottom: var(--spacing-xl);
      line-height: 1.5;
    }

    .options-grid {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .option-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      width: 100%;
      padding: var(--spacing-md) var(--spacing-lg);
      background-color: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: left;

      &:hover:not(:disabled) {
        border-color: var(--color-primary);
        background-color: rgba(74, 144, 217, 0.05);
      }

      &.selected {
        border-color: var(--color-primary);
        background-color: rgba(74, 144, 217, 0.1);
      }

      &.correct {
        border-color: var(--color-success);
        background-color: rgba(40, 167, 69, 0.1);
      }

      &.incorrect {
        border-color: var(--color-error);
        background-color: rgba(220, 53, 69, 0.1);
      }

      &:disabled {
        cursor: default;
      }
    }

    .option-letter {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-border);
      border-radius: 50%;
      font-weight: 600;
    }

    .option-text {
      flex: 1;
    }

    .result-box {
      padding: var(--spacing-xl);
      border-radius: var(--radius-lg);
      text-align: center;

      &.correct {
        background-color: rgba(40, 167, 69, 0.1);
      }

      &.incorrect {
        background-color: rgba(220, 53, 69, 0.1);
      }
    }

    .result-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
    }

    .result-text {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: var(--spacing-lg);
    }

    /* Challenge phase */
    .challenge-stars {
      display: inline-block;
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--color-secondary);
      border-radius: var(--radius-full);
      font-weight: 600;
      margin-bottom: var(--spacing-lg);
    }

    .challenge-description {
      font-size: 1.125rem;
      margin-bottom: var(--spacing-lg);
    }

    .challenge-requirements {
      text-align: left;
      background-color: rgba(0, 0, 0, 0.03);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);

      ul {
        margin: var(--spacing-sm) 0 0 var(--spacing-lg);
      }
    }

    .upload-section {
      margin-bottom: var(--spacing-lg);
    }

    .upload-progress {
      text-align: center;

      .progress-bar {
        height: 8px;
        margin-bottom: var(--spacing-sm);
      }
    }

    .challenge-submitted {
      padding: var(--spacing-lg);
      background-color: rgba(40, 167, 69, 0.1);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);

      .submitted-icon {
        font-size: 2rem;
        margin-bottom: var(--spacing-sm);
      }
    }

    /* Summary phase */
    .total-stars {
      margin-bottom: var(--spacing-xl);
    }

    .stars-earned {
      display: block;
      font-size: 4rem;
      font-weight: 700;
      color: var(--color-secondary-dark);
    }

    .stars-label {
      color: var(--color-text-secondary);
    }

    .results-list {
      text-align: left;
      background-color: rgba(0, 0, 0, 0.03);
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--color-border);

      &:last-child {
        border-bottom: none;
      }
    }

    .summary-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .phase-card, .question-phase {
        padding: var(--spacing-md);
      }

      .bible-text {
        font-size: 1rem;
      }

      .question-text {
        font-size: 1.125rem;
      }
    }
  `]
})
export class GameplayComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private sanitizer = inject(DomSanitizer);
  protected authService = inject(AuthService);

  tournamentId = '';

  // Phase management
  currentPhase = signal<GamePhase>('loading');

  // Data
  dailyContent = signal<DailyContent | null>(null);
  questions = signal<Question[]>([]);
  currentQuestionIndex = signal(0);
  questionResults = signal<QuestionResult[]>([]);

  // Question state
  selectedAnswer = signal<string | null>(null);
  showResult = signal(false);
  videoWatched = signal(false);

  // Challenge state
  challengeSubmitted = signal(false);
  uploadProgress = signal(0);

  // Computed
  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  totalStarsEarned = computed(() =>
    this.questionResults().reduce((sum, r) => sum + r.starsEarned, 0)
  );

  async ngOnInit(): Promise<void> {
    this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || '';
    if (!this.tournamentId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    await this.loadDailyData();
  }

  private async loadDailyData(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      // Check if already completed today
      const userId = this.authService.userId();
      if (userId) {
        const answersRef = collection(this.firestore, 'answers');
        const answersQuery = query(
          answersRef,
          where('oderId', '==', userId),
          where('tournamentId', '==', this.tournamentId),
          where('answeredAt', '>=', Timestamp.fromDate(today)),
          where('answeredAt', '<', Timestamp.fromDate(tomorrow))
        );
        const answersSnapshot = await getDocs(answersQuery);
        if (answersSnapshot.size >= 5) {
          this.currentPhase.set('completed');
          return;
        }
      }

      // Load daily content
      const dailyContentRef = collection(this.firestore, 'dailyContent');
      const dcQuery = query(
        dailyContentRef,
        where('tournamentId', '==', this.tournamentId),
        where('releaseDate', '>=', Timestamp.fromDate(today)),
        where('releaseDate', '<', Timestamp.fromDate(tomorrow))
      );
      const dcSnapshot = await getDocs(dcQuery);

      if (!dcSnapshot.empty) {
        const dcData = dcSnapshot.docs[0].data();
        this.dailyContent.set({
          id: dcSnapshot.docs[0].id,
          tournamentId: dcData['tournamentId'],
          weekNumber: dcData['weekNumber'],
          dayNumber: dcData['dayNumber'],
          bibleReference: dcData['bibleReference'],
          bibleVerseText: dcData['bibleVerseText'],
          youtubeLongVideoId: dcData['youtubeLongVideoId'] || null,
          youtubeLongVideoTitle: dcData['youtubeLongVideoTitle'] || null,
          dailyChallengeText: dcData['dailyChallengeText'],
          maxVideoDuration: dcData['maxVideoDuration'] || 60,
          releaseDate: dcData['releaseDate']?.toDate(),
          createdAt: dcData['createdAt']?.toDate()
        });
      }

      // Load questions
      const questionsRef = collection(this.firestore, 'questions');
      const qQuery = query(
        questionsRef,
        where('tournamentId', '==', this.tournamentId),
        where('releaseDate', '>=', Timestamp.fromDate(today)),
        where('releaseDate', '<', Timestamp.fromDate(tomorrow)),
        orderBy('releaseDate'),
        orderBy('questionNumber')
      );
      const qSnapshot = await getDocs(qQuery);

      const loadedQuestions: Question[] = qSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tournamentId: data['tournamentId'],
          weekNumber: data['weekNumber'],
          dayNumber: data['dayNumber'],
          questionNumber: data['questionNumber'],
          isExtraQuestion: data['isExtraQuestion'] || false,
          questionText: data['questionText'],
          bibleReference: data['bibleReference'],
          bibleVerseText: data['bibleVerseText'],
          options: data['options'],
          correctAnswer: data['correctAnswer'],
          stars: data['stars'] || 1,
          youtubeShortId: data['youtubeShortId'] || null,
          releaseDate: data['releaseDate']?.toDate(),
          createdAt: data['createdAt']?.toDate()
        };
      });

      this.questions.set(loadedQuestions);

      if (loadedQuestions.length === 0) {
        this.currentPhase.set('completed');
      } else {
        this.currentPhase.set('bible-verse');
      }
    } catch (error) {
      console.error('Error loading daily data:', error);
      this.currentPhase.set('completed');
    }
  }

  getYouTubeUrl(videoId: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  nextPhase(): void {
    const phase = this.currentPhase();

    switch (phase) {
      case 'bible-verse':
        this.currentPhase.set('question');
        break;
      case 'question':
        this.currentPhase.set('daily-challenge');
        break;
      case 'daily-challenge':
        this.currentPhase.set('long-video');
        break;
      case 'long-video':
        this.currentPhase.set('summary');
        break;
    }
  }

  skipVideo(): void {
    this.videoWatched.set(true);
  }

  selectAnswer(optionId: string): void {
    if (this.showResult()) return;
    this.selectedAnswer.set(optionId);
  }

  async confirmAnswer(): Promise<void> {
    const question = this.currentQuestion();
    const selected = this.selectedAnswer();
    if (!question || !selected) return;

    const isCorrect = selected === question.correctAnswer;
    const starsEarned = isCorrect ? question.stars : 0;

    // Save answer to Firestore
    const userId = this.authService.userId();
    if (userId) {
      const answerId = `${userId}_${question.id}`;
      const answerRef = doc(this.firestore, 'answers', answerId);
      await setDoc(answerRef, {
        oderId: userId,
        questionId: question.id,
        tournamentId: this.tournamentId,
        selectedAnswer: selected,
        isCorrect,
        starsEarned,
        answeredAt: Timestamp.now()
      });
    }

    // Update results
    this.questionResults.update(results => [
      ...results,
      {
        questionNumber: question.questionNumber,
        isCorrect,
        starsEarned,
        isExtra: question.isExtraQuestion
      }
    ]);

    this.showResult.set(true);
  }

  isCurrentCorrect(): boolean {
    const question = this.currentQuestion();
    return this.selectedAnswer() === question?.correctAnswer;
  }

  nextQuestion(): void {
    const nextIndex = this.currentQuestionIndex() + 1;

    if (nextIndex < this.questions().length) {
      this.currentQuestionIndex.set(nextIndex);
      this.selectedAnswer.set(null);
      this.showResult.set(false);
      this.videoWatched.set(false);
    } else {
      this.nextPhase();
    }
  }

  async onVideoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 50 * 1024 * 1024) {
      alert('El video es muy grande. Maximo 50MB.');
      return;
    }

    const userId = this.authService.userId();
    if (!userId) return;

    // Upload
    const fileName = `${userId}_${Date.now()}.mp4`;
    const storageRef = ref(this.storage, `challenges/${this.tournamentId}/videos/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: { uploadedBy: userId }
    });

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.uploadProgress.set(Math.round(progress));
      },
      (error) => {
        console.error('Upload error:', error);
        alert('Error al subir el video. Intenta de nuevo.');
        this.uploadProgress.set(0);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Save submission to Firestore
        const dailyContent = this.dailyContent();
        if (dailyContent) {
          const submissionsRef = collection(this.firestore, `challenges/${dailyContent.id}/submissions`);
          await setDoc(doc(submissionsRef), {
            oderId: userId,
            oderName: this.authService.userDisplayName(),
            videoURL: downloadURL,
            status: 'pending',
            submittedAt: Timestamp.now()
          });
        }

        this.challengeSubmitted.set(true);
        this.uploadProgress.set(0);
      }
    );
  }
}
