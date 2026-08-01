(() => {
  const PASSWORD_HASH = "a4bded7f702929c65a4aa95e24d790d91af9331a06655b609bacdceb4bbebdcb";
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
