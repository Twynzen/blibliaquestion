export type UserRole = 'player' | 'admin' | 'moderator';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  totalStars: number;
  tournamentsPlayed: number;
  currentStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  displayName: string;
}

export interface UserStats {
  totalStars: number;
  tournamentsPlayed: number;
  questionsAnswered: number;
  correctAnswers: number;
  videosUploaded: number;
  currentStreak: number;
  longestStreak: number;
}
