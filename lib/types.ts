export interface Guess {
  id: number;
  name: string;
  gender: 'boy' | 'girl';
  weight_lbs: number;
  weight_oz: number;
  birth_date: string; // "YYYY-MM-DD"
  birth_time: string; // "HH:MM"
  length_in: number;
  created_at: string;
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
