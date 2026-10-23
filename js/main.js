import './components/atlas-mascot.js';
import './components/skill-tree.js';
import './components/lesson-player.js';
import './components/exercise-choice.js';
import './components/exercise-match.js';
import './components/exercise-fill.js';
import './components/exercise-quote.js';
import './components/xp-bar.js';
import './components/streak-flame.js';
import './components/lesson-complete.js';
import { App } from './app.js';
import { applyThemePlates } from './assets.js';

applyThemePlates();

const app = new App({ main: document.querySelector('#main') });
app.start();
