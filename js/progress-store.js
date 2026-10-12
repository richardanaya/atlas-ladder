import { CONFIG } from './config.js';
import { nextStreak, todayISO } from './progress-rules.js';

function emptyState() {
  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    muted: false,
    completed: {},
  };
}

export class ProgressStore {
  constructor(key = CONFIG.storageKey, storage = globalThis.localStorage) {
    this.key = key;
    this.storage = storage;
    this.state = this._load();
  }

  _load() {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      return {
        ...emptyState(),
        ...parsed,
        completed: parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {},
      };
    } catch {
      return emptyState();
    }
  }

  save() {
    this.storage.setItem(this.key, JSON.stringify(this.state));
  }

  reset() {
    this.state = emptyState();
    this.save();
  }

  get xp() {
    return this.state.xp || 0;
  }

  get streak() {
    return this.state.streak || 0;
  }

  get muted() {
    return Boolean(this.state.muted);
  }

  setMuted(muted) {
    this.state.muted = Boolean(muted);
    this.save();
  }

  isComplete(key) {
    return Boolean(this.state.completed[key]);
  }

  /**
   * Record a finished lesson. Replays do not add XP again.
   * A finish on a new local day advances the streak.
   */
  completeLesson({ key, correct, total, xpAwarded, today = todayISO() }) {
    const already = this.isComplete(key);
    const gained = already ? 0 : xpAwarded;
    this.state.xp = (this.state.xp || 0) + gained;
    const prev = this.state.completed[key];
    if (!prev) {
      this.state.completed[key] = {
        correct,
        total,
        xp: gained,
        at: new Date().toISOString(),
      };
    } else if (correct > (prev.correct || 0)) {
      prev.correct = correct;
      prev.total = total;
    }
    this.state.streak = nextStreak(this.state.streak || 0, this.state.lastActiveDate, today);
    this.state.lastActiveDate = today;
    this.save();
    return { gained, xp: this.state.xp, streak: this.state.streak, already };
  }
}
