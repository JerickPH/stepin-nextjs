/* JA Jobs Carousel v2.1.0 — requires window.Swiper (loaded in site.js) */
(function () {
  "use strict";

  var JA_SRC = "https://apps.jobadder.com/widgets/v1/jobs.min.js";
  var scriptInjected = false;

  function init(root) {
    if (root.__jaInit) return;
    root.__jaInit = true;

    var cfg = {};
    try {
      cfg = JSON.parse(root.getAttribute("data-ja-config")) || {};
    } catch (e) {}

    var widget = root.querySelector("#ja-jobs-widget");
    var staging = root.querySelector(".ja-carousel__staging");
    var swiperEl = root.querySelector(".ja-carousel__swiper");
    var wrapper = root.querySelector(".swiper-wrapper");
    var loading = root.querySelector(".ja-carousel__loading");
    var modal = root.querySelector(".ja-modal");
    var modalBody = root.querySelector(".ja-modal__body");

    if (!widget || !wrapper || !swiperEl) return;

    var locationIndex =
      typeof cfg.locationIndex === "number" ? cfg.locationIndex : 2;

    // Slides per view per breakpoint (Swiper breakpoints are min-width).
    //   0    – 640  : perViewSm
    //   641  – 800  : perViewMd
    //   801  – 1024 : perViewLg
    //   1025 +      : perView
    var view = {
      sm: num(cfg.perViewSm, 1),
      md: num(cfg.perViewMd, 2),
      lg: num(cfg.perViewLg, 3),
      xl: num(cfg.perView, 3),
    };
    var loop = cfg.loop !== false;

    function num(v, fallback) {
      v = parseFloat(v);
      return isNaN(v) || v <= 0 ? fallback : v;
    }

    // ---- 1. Configure + load JobAdder (once) --------------------------------
    window._baseUrl = "//apps.jobadder.com/widgets";
    window._jaJobsSettings = {
      key: cfg.key,
      jobListSettings: {
        jobsPerPage: cfg.perPage || 50,
        animateScrollOnPageChange: false,
        titleIsLink: true,
      },
      applicationFormSettings: {
        useExternalApplicationForm: true,
        // false = apply form opens inside the modal; true = new tab.
        showExternalApplicationFormInNewWindow: false,
      },
    };

    if (!scriptInjected) {
      var s = document.createElement("script");
      s.src = cfg.scriptUrl || JA_SRC;
      s.async = true;
      document.head.appendChild(s);
      scriptInjected = true;
    }

    // ---- 2. Wait for the native job list ------------------------------------
    var tries = 0;
    var poll = setInterval(function () {
      tries++;
      if (widget.querySelector(".job")) {
        clearInterval(poll);
        build();
      } else if (tries > 60) {
        // ~15s timeout
        clearInterval(poll);
        if (loading) loading.textContent = "No jobs found.";
      }
    }, 250);

    // ---- helpers ------------------------------------------------------------
    function jobNodes() {
      return Array.prototype.slice.call(widget.querySelectorAll(".job"));
    }

    function readJob(job) {
      var titleEl =
        job.querySelector(".ja-job-title, .job-title, h1, h2, h3, h4") ||
        job.querySelector("a");
      var title = titleEl ? titleEl.textContent.trim() : "Untitled role";

      var bullets = Array.prototype.map
        .call(job.querySelectorAll("li"), function (li) {
          return li.textContent.trim();
        })
        .filter(Boolean);

      var location =
        bullets[locationIndex] || bullets[bullets.length - 1] || "";
      return { title: title, location: location };
    }

    // What to click to open a job's detail view.
    function detailTrigger(job) {
      return (
        job.querySelector(".view-details") ||
        job.querySelector("a.job-title") ||
        job.querySelector("a[href]")
      );
    }

    // The widget's "Back to search results" control.
    function backControl() {
      var nodes = widget.querySelectorAll("a, button");
      for (var i = 0; i < nodes.length; i++) {
        if (/back to search/i.test(nodes[i].textContent || "")) return nodes[i];
      }
      return null;
    }

    // Modal should stay open while a detail OR an application form is showing.
    function detailIsShowing() {
      return !!widget.querySelector(
        ".ja-job-details, #form-wrapper, form, [class*='application-form'], [class*='apply']",
      );
    }

    function makeSlide(data, index, isFiller) {
      var slide = document.createElement("div");
      slide.className = "swiper-slide";

      var card = document.createElement("button");
      card.type = "button";
      card.className = "ja-card";
      card.setAttribute("data-index", index);

      // Filler copies exist only so loop mode has enough slides;
      // keep them out of the tab order / screen reader output.
      if (isFiller) {
        slide.setAttribute("aria-hidden", "true");
        card.tabIndex = -1;
      }

      var t = document.createElement("span");
      t.className = "ja-card__title";
      t.textContent = data.title;
      card.appendChild(t);

      if (data.location) {
        var l = document.createElement("span");
        l.className = "ja-card__location";
        l.textContent = data.location;
        card.appendChild(l);
      }

      slide.appendChild(card);
      return slide;
    }

    // ---- 3. Build our own cards + Swiper ------------------------------------
    function build() {
      var jobs = jobNodes().map(readJob);
      if (!jobs.length) {
        if (loading) loading.textContent = "No jobs found.";
        return;
      }

      // Swiper's loop needs at least (2 × slidesPerView) slides, otherwise it
      // silently stops looping (v11) or shows gaps/jumps (v8). Repeat the full
      // job set until there are enough, so the order always cycles cleanly.
      var maxView = Math.ceil(Math.max(view.sm, view.md, view.lg, view.xl));
      var minSlides = loop ? maxView * 2 + 1 : jobs.length;
      var total = jobs.length;
      while (total < minSlides) total += jobs.length;

      var frag = document.createDocumentFragment();
      for (var i = 0; i < total; i++) {
        var idx = i % jobs.length;
        frag.appendChild(makeSlide(jobs[idx], idx, i >= jobs.length));
      }

      wrapper.appendChild(frag);
      if (loading) loading.remove();
      root.classList.add("is-ready");

      var prevEl = root.querySelector(".swiper-button-prev");
      var nextEl = root.querySelector(".swiper-button-next");
      var pagEl = root.querySelector(".swiper-pagination");

      var opts = {
        loop: loop,
        loopAdditionalSlides: loop ? maxView : 0, // v8: extra clones each side
        centeredSlides: !!cfg.center,
        spaceBetween: cfg.space || 24,
        slidesPerView: view.sm,
        speed: 600,
        grabCursor: true,
        watchOverflow: !loop,
        observer: true, // re-measure if the parent was hidden / resized
        observeParents: true,
        breakpoints: {
          641: { slidesPerView: view.md },
          801: { slidesPerView: view.lg },
          1025: { slidesPerView: view.xl },
        },
      };

      if (cfg.autoplay > 0) {
        opts.autoplay = {
          delay: cfg.autoplay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        };
      }
      if (prevEl && nextEl)
        opts.navigation = { prevEl: prevEl, nextEl: nextEl };
      if (pagEl) opts.pagination = { el: pagEl, clickable: true };

      var swiper = new Swiper(swiperEl, opts);

      // Elementor containers can finish sizing after our init; re-measure once.
      window.addEventListener("load", function () {
        swiper.update();
      });

      // Delegation (survives Swiper's loop-mode slide cloning).
      swiperEl.addEventListener("click", function (e) {
        var card = e.target.closest(".ja-card");
        if (!card) return;
        // Ignore the click that ends a drag.
        if (swiper.allowClick === false) return;
        openDetail(parseInt(card.getAttribute("data-index"), 10));
      });

      if (modal && modalBody) wireModal();
    }

    // ---- 4. Modal / popup ---------------------------------------------------
    var state = { open: false, waiting: false, busy: false, lastFocus: null };

    function wireModal() {
      new MutationObserver(function () {
        if (state.busy) return;
        var showing = detailIsShowing();
        if (state.waiting && widget.querySelector(".ja-job-details")) {
          state.waiting = false;
          showModal();
        } else if (state.open && !showing) {
          // widget returned to the list on its own (e.g. its Back link)
          closeModal(true);
        }
      }).observe(widget, { childList: true, subtree: true });

      Array.prototype.forEach.call(
        modal.querySelectorAll("[data-ja-close]"),
        function (el) {
          el.addEventListener("click", function () {
            closeModal(false);
          });
        },
      );

      document.addEventListener("keydown", function (e) {
        if (state.open && e.key === "Escape") closeModal(false);
      });
    }

    function openDetail(index) {
      if (state.busy || state.open || state.waiting) return;
      var job = jobNodes()[index];
      var trigger = job && detailTrigger(job);
      if (!trigger) return;

      state.waiting = true;
      state.lastFocus = document.activeElement;
      trigger.click();

      // If no in-widget detail view appears, give up quietly.
      setTimeout(function () {
        if (state.waiting) state.waiting = false;
      }, 6000);
    }

    function showModal() {
      state.busy = true;
      modalBody.appendChild(widget); // relocate live widget; keeps its listeners
      modal.hidden = false;
      document.body.classList.add("ja-modal-open");
      state.open = true;
      var closeBtn = modal.querySelector(".ja-modal__close");
      if (closeBtn) closeBtn.focus();
      state.busy = false;
    }

    function closeModal(fromWidget) {
      if (!state.open) return;
      state.busy = true;

      if (!fromWidget) {
        var back = backControl();
        if (back) back.click(); // reset widget to list state for the next open
      }

      staging.appendChild(widget); // park it off-screen again
      modal.hidden = true;
      document.body.classList.remove("ja-modal-open");
      state.open = false;

      if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();

      setTimeout(function () {
        state.busy = false; // let the reset mutations settle first
      }, 50);
    }
  }

  function boot() {
    document.querySelectorAll(".ja-carousel").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

/* Empty-state fallback: no slides within `timeout` ms -> show empty_text; late slides restore the carousel. */
(function () {
  function init() {
    document.querySelectorAll('.ja-carousel').forEach(function (root) {
      var wrapper = root.querySelector('.swiper-wrapper');
      var empty = root.querySelector('.ja-carousel__empty[role="status"]');
      if (!wrapper || !empty) return;

      var cfg = {};
      try { cfg = JSON.parse(root.getAttribute('data-ja-config')) || {}; } catch (e) {}

      function hasSlides() { return !!wrapper.querySelector('.swiper-slide'); }
      function setState(isEmpty) {
        root.classList.toggle('is-empty', isEmpty);
        root.classList.toggle('is-ready', !isEmpty);
        empty.hidden = !isEmpty;
      }

      if (hasSlides()) { setState(false); return; }

      var obs = new MutationObserver(function () {
        if (hasSlides()) { setState(false); obs.disconnect(); }
      });
      obs.observe(wrapper, { childList: true });

      setTimeout(function () {
        if (!hasSlides()) setState(true);
      }, cfg.timeout || 8000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
