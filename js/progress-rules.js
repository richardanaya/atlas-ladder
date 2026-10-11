import { CONFIG } from './config.js';

export function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function previousDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return todayISO(dt);
}

/** Next streak count after a finished lesson on `today`. */
export function nextStreak(streak, lastActiveDate, today) {
  if (lastActiveDate === today) return streak || 1;
  if (lastActiveDate && lastActiveDate === previousDay(today)) return (streak || 0) + 1;
  return 1;
}

export function levelFor(xp, per = CONFIG.xpPerLevel) {
  return Math.floor(Math.max(0, xp) / per) + 1;
}

export function xpIntoLevel(xp, per = CONFIG.xpPerLevel) {
  return Math.max(0, xp) % per;
}

export function xpAward({ correct, total, already }) {
  if (already) return 0;
  const base = correct * CONFIG.xpPerCorrect;
  const bonus = correct === total ? CONFIG.perfectBonus : 0;
  return base + bonus;
}

/** Ready lessons in climb order. Coming-soon units are omitted, so they do not gate later floors. */
export function readyLessons(catalog) {
  const list = [];
  for (const section of catalog.sections) {
    for (const unit of section.units) {
      if (unit.status !== 'ready' || !Array.isArray(unit.lessons)) continue;
      for (const lesson of unit.lessons) {
        list.push({
          sectionId: section.id,
          unitId: unit.id,
          lessonId: lesson.id,
          key: `${section.id}/${unit.id}/${lesson.id}`,
          section,
          unit,
          lesson,
        });
      }
    }
  }
  return list;
}

export function lessonKey(sectionId, unitId, lessonId) {
  return `${sectionId}/${unitId}/${lessonId}`;
}

export function isLessonUnlocked(catalog, completed, key) {
  const list = readyLessons(catalog);
  const idx = list.findIndex((entry) => entry.key === key);
  if (idx < 0) return false;
  if (idx === 0) return true;
  return Boolean(completed[list[idx - 1].key]);
}

export function currentLessonKey(catalog, completed) {
  const list = readyLessons(catalog);
  const open = list.find((entry) => isLessonUnlocked(catalog, completed, entry.key) && !completed[entry.key]);
  return open ? open.key : null;
}
