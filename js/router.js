export class Router {
  constructor() {
    this._fn = () => {};
    window.addEventListener('hashchange', () => this._fn(this.path));
  }

  onChange(fn) {
    this._fn = fn;
  }

  start() {
    this._fn(this.path);
  }

  get path() {
    let hash = location.hash.replace(/^#/, '');
    if (!hash || hash === '/') return '/';
    if (!hash.startsWith('/')) hash = `/${hash}`;
    return hash;
  }

  go(path) {
    const next = path.startsWith('/') ? path : `/${path}`;
    const current = this.path;
    if (current === next) {
      this._fn(current);
      return;
    }
    location.hash = next;
  }
}
