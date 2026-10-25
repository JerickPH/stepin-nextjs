/* Small runtime helpers that replace WordPress server-side behaviour on the static site. */
(function () {
  "use strict";
  var here = location.pathname.replace(/\/?$/, "/");

  // 1. Highlight the current page in every nav menu (WordPress did this server-side).
  document.querySelectorAll(".elementor-nav-menu a[href], .menu a[href]").forEach(function (a) {
    var path;
    try { path = new URL(a.getAttribute("href"), location.origin).pathname.replace(/\/?$/, "/"); } catch (e) { return; }
    if (path !== here || a.getAttribute("href").charAt(0) === "#") return;
    a.classList.add("elementor-item-active");
    a.setAttribute("aria-current", "page");
    var li = a.closest("li");
    if (li) li.classList.add("current-menu-item", "current_page_item");
  });

  // 2. Site search: no WordPress search backend, so send queries to a site-restricted web search.
  document.querySelectorAll("form.e-search-form, form[role=search]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      var input = form.querySelector('input[name="s"], input[type="search"]');
      var q = input ? input.value.trim() : "";
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if (!q) return;
      window.location.href = "https://www.google.com/search?q=" + encodeURIComponent("site:" + location.hostname + " " + q);
    }, true);
  });
})();
