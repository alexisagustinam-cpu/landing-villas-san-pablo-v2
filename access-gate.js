(() => {
  const PASSWORD_HASH = "fcccb441e5ee7e85f299907b7d32127a6585c9c6fc9d5896d519426ab65ad564";
  const SESSION_KEY = "vsp-access-authorized";

  async function hash(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function unlock() {
    sessionStorage.setItem(SESSION_KEY, "1");
    document.documentElement.classList.remove("auth-pending");
    document.getElementById("access-gate")?.remove();
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      unlock();
      return;
    }

    const form = document.getElementById("access-form");
    const passwordInput = document.getElementById("access-password");
    const error = document.getElementById("access-error");
    passwordInput?.focus();

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const valid = (await hash(passwordInput.value)) === PASSWORD_HASH;
      if (valid) {
        unlock();
        return;
      }
      error.hidden = false;
      passwordInput.value = "";
      passwordInput.focus();
    });
  });
})();
