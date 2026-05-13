window.SFMS_AUTH = {
  async login(username, password) {
    const res = await window.SFMS_API.login(username, password);
    window.SFMS_STATE.session = res.session;
    window.SFMS_UTILS.saveSession(res.session);
    return res.session;
  },

  async bootstrap() {
    const session = window.SFMS_STATE.session;
    const res = await window.SFMS_API.bootstrap(session);
    window.SFMS_STATE.db = res.data;
    return res.data;
  },

  logout() {
    window.SFMS_UTILS.clearSession();
    window.SFMS_STATE.session = null;
    window.SFMS_STATE.db = {
      schools: [],
      classes: [],
      students: [],
      teachers: [],
      subjects: [],
      teacherSubjects: [],
      attendance: [],
      teacherAttendance: [],
      settings: [],
      studentArchives: [],
      users: []
    };
  }
};
