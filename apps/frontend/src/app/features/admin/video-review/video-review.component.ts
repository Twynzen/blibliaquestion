import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  Firestore,
  collection,
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp
} from '@angular/fire/firestore';
import { AuthService } from '@core/services/auth.service';
import { ChallengeSubmission } from '@shared/models';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-video-review',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    <div class="review-page page">
      <div class="container">
        <a routerLink="/admin" class="back-link">← Volver al Panel</a>

        <header class="page-header">
          <h1 class="page-title">Revisar Videos</h1>
          <p class="page-subtitle">{{ pendingVideos().length }} videos pendientes de revision</p>
        </header>

        @if (loading()) {
          <app-loader message="Cargando videos..." />
        } @else if (pendingVideos().length === 0) {
          <div class="empty-state">
            <div class="empty-state-icon">✅</div>
            <h3>No hay videos pendientes</h3>
            <p>Todos los videos han sido revisados.</p>
          </div>
        } @else {
          <div class="review-container">
            <div class="video-card">
              <div class="video-header">
                <span class="video-counter">
                  Video {{ currentIndex() + 1 }} de {{ pendingVideos().length }}
                </span>
                <span class="submission-info">
                  {{ currentVideo()?.oderName }} - {{ formatDate(currentVideo()?.submittedAt) }}
                </span>
              </div>

              <div class="video-player">
                @if (currentVideo()?.videoURL) {
                  <video
                    [src]="currentVideo()!.videoURL"
                    controls
                    class="video-element"
                  ></video>
                }
              </div>

              <div class="review-actions">
                <button
                  class="btn btn-success btn-lg"
                  (click)="approveVideo()"
                  [disabled]="processing()"
                >
                  ✅ Aprobar (+5 ⭐)
                </button>
                <button
                  class="btn btn-error btn-lg"
                  (click)="rejectVideo()"
                  [disabled]="processing()"
                >
                  ❌ Rechazar
                </button>
              </div>

              <div class="navigation">
                <button
                  class="btn btn-ghost"
                  (click)="previousVideo()"
                  [disabled]="currentIndex() === 0"
                >
                  ← Anterior
                </button>
                <button
                  class="btn btn-ghost"
                  (click)="nextVideo()"
                  [disabled]="currentIndex() >= pendingVideos().length - 1"
                >
                  Siguiente →
                </button>
              </div>
            </div>
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

    .review-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .video-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-md);
    }

    .video-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
    }

    .video-counter {
      font-weight: 600;
    }

    .submission-info {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .video-player {
      background-color: #000;
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: var(--spacing-lg);
      aspect-ratio: 9/16;
      max-height: 500px;
    }

    .video-element {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .review-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      margin-bottom: var(--spacing-lg);
    }

    .navigation {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid var(--color-border);
      padding-top: var(--spacing-lg);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xxl);
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);

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
export class VideoReviewComponent implements OnInit {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  loading = signal(true);
  processing = signal(false);
  pendingVideos = signal<(ChallengeSubmission & { challengeId: string })[]>([]);
  currentIndex = signal(0);

  currentVideo = signal<(ChallengeSubmission & { challengeId: string }) | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadPendingVideos();
  }

  private async loadPendingVideos(): Promise<void> {
    try {
      // Query all submissions with status 'pending' across all challenges
      const submissionsQuery = query(
        collectionGroup(this.firestore, 'submissions'),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(submissionsQuery);

      const videos: (ChallengeSubmission & { challengeId: string })[] = [];

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const pathParts = docSnap.ref.path.split('/');
        const challengeId = pathParts[1]; // challenges/{challengeId}/submissions/{id}

        videos.push({
          id: docSnap.id,
          challengeId,
          oderId: data['oderId'],
          oderName: data['oderName'] || 'Usuario',
          videoURL: data['videoURL'],
          thumbnailURL: data['thumbnailURL'] || null,
          duration: data['duration'] || 0,
          status: data['status'],
          starsAwarded: data['starsAwarded'] || null,
          reviewedBy: data['reviewedBy'] || null,
          reviewedAt: data['reviewedAt']?.toDate() || null,
          reviewComment: data['reviewComment'] || null,
          submittedAt: data['submittedAt']?.toDate() || new Date()
        });
      });

      this.pendingVideos.set(videos);
      if (videos.length > 0) {
        this.currentVideo.set(videos[0]);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async approveVideo(): Promise<void> {
    const video = this.currentVideo();
    if (!video) return;

    this.processing.set(true);

    try {
      const submissionRef = doc(
        this.firestore,
        `challenges/${video.challengeId}/submissions/${video.id}`
      );

      await updateDoc(submissionRef, {
        status: 'approved',
        starsAwarded: 5,
        reviewedBy: this.authService.userId(),
        reviewedAt: Timestamp.now()
      });

      this.removeCurrentVideo();
    } catch (error) {
      console.error('Error approving video:', error);
    } finally {
      this.processing.set(false);
    }
  }

  async rejectVideo(): Promise<void> {
    const video = this.currentVideo();
    if (!video) return;

    this.processing.set(true);

    try {
      const submissionRef = doc(
        this.firestore,
        `challenges/${video.challengeId}/submissions/${video.id}`
      );

      await updateDoc(submissionRef, {
        status: 'rejected',
        starsAwarded: 0,
        reviewedBy: this.authService.userId(),
        reviewedAt: Timestamp.now()
      });

      this.removeCurrentVideo();
    } catch (error) {
      console.error('Error rejecting video:', error);
    } finally {
      this.processing.set(false);
    }
  }

  private removeCurrentVideo(): void {
    const index = this.currentIndex();
    const videos = this.pendingVideos();

    const updatedVideos = videos.filter((_, i) => i !== index);
    this.pendingVideos.set(updatedVideos);

    if (updatedVideos.length > 0) {
      const newIndex = Math.min(index, updatedVideos.length - 1);
      this.currentIndex.set(newIndex);
      this.currentVideo.set(updatedVideos[newIndex]);
    } else {
      this.currentVideo.set(null);
    }
  }

  previousVideo(): void {
    const index = this.currentIndex();
    if (index > 0) {
      this.currentIndex.set(index - 1);
      this.currentVideo.set(this.pendingVideos()[index - 1]);
    }
  }

  nextVideo(): void {
    const index = this.currentIndex();
    const videos = this.pendingVideos();
    if (index < videos.length - 1) {
      this.currentIndex.set(index + 1);
      this.currentVideo.set(videos[index + 1]);
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
