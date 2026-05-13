window.SFMS_ROUTER = {
  routes: {
    dashboard: () => window.SFMS_PAGES.dashboard(),
    students: () => window.SFMS_PAGES.students(),
    classes: () => window.SFMS_PAGES.classes(),
    attendance: () => window.SFMS_PAGES.attendance(),
    scanner: () => window.SFMS_PAGES.scanner(),
    teachers: () => window.SFMS_PAGES.teachers(),
    reports: () => window.SFMS_PAGES.reports(),
    promotion: () => window.SFMS_PAGES.promotion(),
    archives: () => window.SFMS_PAGES.archives(),
    settings: () => window.SFMS_PAGES.settings()
  },

  setRoute(route) {
    window.SFMS_STATE.route = route;
    this.render();
  },

  render() {
    const route = window.SFMS_STATE.route;
    const fn = this.routes[route] || this.routes.dashboard;
    fn();
  }
};
