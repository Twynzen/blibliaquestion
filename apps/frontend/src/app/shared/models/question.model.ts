export interface QuestionOption {
  id: string; // A, B, C, D
  text: string;
}

export interface Question {
  id: string;
  tournamentId: string;
  weekNumber: number;
  dayNumber: number;
  questionNumber: number;
  isExtraQuestion: boolean;
  questionText: string;
  bibleReference: string;
  bibleVerseText: string;
  options: QuestionOption[];
  correctAnswer: string;
  stars: number;
  youtubeShortId: string | null;
  releaseDate: Date;
  createdAt: Date;
}

export interface Answer {
  id: string;
  oderId: string;
  questionId: string;
  tournamentId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  starsEarned: number;
  answeredAt: Date;
  timeSpent: number; // segundos
}

export interface DailyContent {
  id: string;
  tournamentId: string;
  weekNumber: number;
  dayNumber: number;
  bibleReference: string;
  bibleVerseText: string;
  youtubeLongVideoId: string | null;
  youtubeLongVideoTitle: string | null;
  dailyChallengeText: string;
  maxVideoDuration: number;
  releaseDate: Date;
  createdAt: Date;
}

export interface DailyProgress {
  questionsAnswered: number;
  questionsTotal: number;
  starsEarned: number;
  maxStars: number;
  challengeCompleted: boolean;
  challengeStatus: 'pending' | 'submitted' | 'approved' | 'rejected' | null;
}

export interface QuestionImportRow {
  weekNumber: number;
  dayNumber: number;
  questionNumber: number;
  questionText: string;
  bibleReference: string;
  bibleVerseText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  youtubeShortId: string;
  isExtra: boolean;
  youtubeLongId: string;
}
