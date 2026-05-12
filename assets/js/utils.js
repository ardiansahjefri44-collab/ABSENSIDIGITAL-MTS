window.SFMS_UTILS = {
  qs(selector, root = document) {
    return root.querySelector(selector);
  },

  qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  },

  saveSession(session) {
    localStorage.setItem(window.SFMS_CONFIG.SESSION_KEY, JSON.stringify(session));
  },

  loadSession() {
    try {
      return JSON.parse(localStorage.getItem(window.SFMS_CONFIG.SESSION_KEY) || "null");
    } catch (err) {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(window.SFMS_CONFIG.SESSION_KEY);
  },

  escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  schoolById(id) {
    return window.SFMS_STATE.db.schools.find(x => String(x.id) === String(id)) || null;
  },

  classById(id) {
    return window.SFMS_STATE.db.classes.find(x => String(x.id) === String(id)) || null;
  },

  today() {
    return new Date().toISOString().slice(0, 10);
  },

  monthNow() {
    return new Date().toISOString().slice(0, 7);
  },

  formatDateTime(value) {
    if (!value) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value));
    } catch (err) {
      return value;
    }
  },

  scopedSchoolId() {
    const session = window.SFMS_STATE.session;
    if (!session) return "";
    return session.role === "superadmin" ? "all" : (session.schoolid || "");
  }
};
