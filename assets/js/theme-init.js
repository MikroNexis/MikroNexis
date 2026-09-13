/* Runs before paint so the correct theme is applied on the very first frame. */
(function () {
  try {
    var p = localStorage.getItem("mps-theme") || "auto";
    var m = p === "auto"
      ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : p;
    document.documentElement.setAttribute("data-theme", m);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
