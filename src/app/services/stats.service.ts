import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface StatsData {
  played: number;
  won: number;
  wonLast: boolean;
  winPercent: number;
  streakCurrent: number;
  streakMax: number;
  winDistribution: {
    [key: number]: number;
  }
  totalGuesses: number;
}

@Injectable()
export class StatsService {

  STATS_KEY = 'yummle_stats';

  currentStats!: StatsData;

  constructor(public supabase: SupabaseService) {
    console.log("Stats Service Started")
    this.load();
  }

  load() {
    const stats = localStorage.getItem(this.STATS_KEY);
    if (stats === null) {
      this.create();
    } else {
      this.currentStats = JSON.parse(stats);
    }
  }

  get(): StatsData {
    return this.currentStats;
  }

  create() {
    const freshStats: StatsData = {
      played: 0,
      won: 0,
      wonLast: false,
      winPercent: 0,
      streakCurrent: 0,
      streakMax: 0,
      winDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      },
      totalGuesses: 0
    }
    this.save(freshStats);
  }

  save(stats: StatsData) {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    this.currentStats = stats;
  }

  update(guessCount: number, won: boolean = false) {
    this.currentStats.played++;
    this.currentStats.totalGuesses += guessCount;
    if (won) {
      this.currentStats.won++;
    }
    this.currentStats.winPercent = this.currentStats.won / this.currentStats.played;
    if (won === true) {
      this.currentStats.streakCurrent++;
      this.currentStats.winDistribution[guessCount]++;      
    } else {
      this.currentStats.streakCurrent = 0;
    }
    if (this.currentStats.streakCurrent > this.currentStats.streakMax) {
      this.currentStats.streakMax = this.currentStats.streakCurrent;
    }
    localStorage.setItem(this.STATS_KEY, JSON.stringify(this.currentStats));
  }

}