export type QuizMode = "general" | "personal";
export type QuizFormat = "round" | "streak";
export type GeneralFlavor = "charts" | "genre" | "artist";

export interface Clip {
  trackId: string;
  previewUrl: string;
  songQuestion: Question;
  artistQuestion: Question;
}

export interface Question {
  correct: string;
  options: string[]; // 4 options, shuffled, correct included
}

export interface QuizSession {
  id: string;
  userId: string | null;
  mode: QuizMode;
  format: QuizFormat;
  clips: Clip[];
  createdAt: string;
}

export interface QuizAnswer {
  clipIndex: number;
  songAnswer: string | null;
  artistAnswer: string | null;
  songCorrect: boolean;
  artistCorrect: boolean;
}

export interface ScoreResult {
  score: number;
  totalPossible: number;
  label: ScoreLabel;
}

export type ScoreLabel =
  | "Superfan"
  | "True Fan"
  | "Casual Listener"
  | "Just Passing Through"
  | "Who Are You?";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  preview_url: string | null;
  album: { release_date: string };
}
