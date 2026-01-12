export type TournamentStatus = 'upcoming' | 'active' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalWeeks: number;
  status: TournamentStatus;
  lateRegistrationAllowed: boolean;
  catchUpPercentage: number;
  participantCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentParticipant {
  oderId: string;
  odeName: string;
  joinedAt: Date;
  totalStars: number;
  weeklyStars: Record<string, number>; // { week1: 45, week2: 63, ... }
  rank: number;
  isCatchUp: boolean;
  catchUpStars: number;
}

export interface CreateTournamentData {
  name: string;
  description: string;
  startDate: Date;
  totalWeeks: number;
  lateRegistrationAllowed: boolean;
  catchUpPercentage: number;
}

export interface TournamentProgress {
  currentWeek: number;
  currentDay: number;
  totalDays: number;
  completedDays: number;
  userRank: number;
  userStars: number;
  totalParticipants: number;
}
