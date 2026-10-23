import { reducedMotion } from './motion.js';

/** Confetti and XP tick. Visual pieces are plain elements animated with transform and opacity. */
export class Celebration {
  confetti(container, count = 42) {
    if (!container || reducedMotion()) return;
    const colors = ['#E4C36A', '#F0D48A', '#F6F0E4', '#C6A15A', '#A56B3C'];
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement('i');
      piece.className = 'confetti';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.35}s`;
      piece.style.animationDuration = `${1.5 + Math.random() * 1.3}s`;
      piece.style.setProperty('--dx', `${-50 + Math.random() * 100}px`);
      piece.style.setProperty('--rot', `${120 + Math.random() * 220}deg`);
      piece.style.width = `${6 + (i % 4) * 2}px`;
      piece.style.height = `${10 + (i % 3) * 4}px`;
      container.appendChild(piece);
    }
  }

  tick(from, to, onUpdate, ms = 850) {
    if (reducedMotion() || from === to) {
      onUpdate(to);
      return Promise.resolve();
    }
    const start = performance.now();
    return new Promise((resolve) => {
      const frame = (now) => {
        const progress = Math.min(1, (now - start) / ms);
        const eased = 1 - (1 - progress) ** 3;
        onUpdate(Math.round(from + (to - from) * eased));
        if (progress < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }
}
