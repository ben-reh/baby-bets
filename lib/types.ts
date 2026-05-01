export interface Guess {
  id: string;         // UUID
  name: string;
  gender: 'boy' | 'girl';
  weight_lbs: number;
  weight_oz: number;
  birth_date: string; // "YYYY-MM-DD"
  birth_time: string; // "HH:MM"
  length_in: number;
  created_at: string; // ISO 8601
}

export interface Stats {
  total: number;
  boyCt: number;
  girlCt: number;
  boyPct: number;
  girlPct: number;
  avgWeightLbs: number;
  avgWeightOz: number;
  avgLengthIn: number;
  mostCommonDate: string | null;
}
