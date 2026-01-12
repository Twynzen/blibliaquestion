export type ChallengeType = 'daily' | 'weekly';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Challenge {
  id: string;
  tournamentId: string;
  type: ChallengeType;
  weekNumber: number;
  dayNumber: number | null;
  title: string;
  description: string;
  maxVideoDuration: number;
  stars: number;
  startDate: Date;
  endDate: Date;
  status: 'open' | 'closed';
  createdAt: Date;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  oderId: string;
  oderName: string;
  videoURL: string;
  thumbnailURL: string | null;
  duration: number;
  status: SubmissionStatus;
  starsAwarded: number | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewComment: string | null;
  submittedAt: Date;
}

export interface VideoValidation {
  valid: boolean;
  errors: string[];
  duration?: number;
  isVertical?: boolean;
  fileSize?: number;
}

export interface UploadProgress {
  state: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error: string | null;
}
