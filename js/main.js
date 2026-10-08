/* KorTechX — site interactions (v2) */
(function () {
  "use strict";

  /* ---------- Sound engine (Web Audio, generated blips) ---------- */
  var Sound = (function () {
    var ctx = null, on = (localStorage.getItem("kx_sound") || "on") === "on";
    function ensure() {
      if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
      if (ctx && ctx.state === "suspended") ctx.resume();
    }
    function blip(freq, dur, type, vol) {
      if (!on) return; ensure(); if (!ctx) return;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g); g.connect(ctx.destination);
      var t = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(vol || 0.06, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.12));
      o.start(t); o.stop(t + (dur || 0.12));
    }
    return {
      isOn: function () { return on; },
      toggle: function () { on = !on; localStorage.setItem("kx_sound", on ? "on" : "off"); if (on) blip(660, 0.1, "sine", 0.05); return on; },
      hover: function () { blip(880, 0.06, "sine", 0.02); },
      click: function () { blip(523, 0.09, "triangle", 0.05); blip(784, 0.07, "sine", 0.03); },
      init: ensure
    };
  })();

  document.addEventListener("DOMContentLoaded", function () {
    // Header scroll
    var header = document.getElementById("header");
    if (header) {
      var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
    // Mobile nav
    var burger = document.getElementById("burger"), mobileNav = document.getElementById("mobileNav");
    if (burger && mobileNav) {
      burger.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        burger.classList.toggle("open", open);
        document.body.style.overflow = open ? "hidden" : "";
      });
      mobileNav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { mobileNav.classList.remove("open"); burger.classList.remove("open"); document.body.style.overflow = ""; });
      });
    }
    // Sound toggle
    var st = document.getElementById("soundToggle");
    if (st) {
      st.textContent = Sound.isOn() ? "🔊" : "🔇";
      st.classList.toggle("off", !Sound.isOn());
      st.addEventListener("click", function () { var o = Sound.toggle(); st.textContent = o ? "🔊" : "🔇"; st.classList.toggle("off", !o); });
    }
    // First interaction unlocks audio
    window.addEventListener("pointerdown", function once() { Sound.init(); window.removeEventListener("pointerdown", once); });
    // UI sounds on buttons/links/cards
    document.querySelectorAll(".btn, .nav-links a, .svc-link, .pf-card, .card").forEach(function (el) {
      el.addEventListener("mouseenter", Sound.hover);
    });
    document.querySelectorAll(".btn, .pf-filter, .blog-cat").forEach(function (el) {
      el.addEventListener("click", Sound.click);
    });

    // Reveal on scroll
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.12 });
      reveals.forEach(function (el) { io.observe(el); });
    } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

    // Count-up
    var counters = document.querySelectorAll(".countup");
    if (counters.length) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return; cio.unobserve(e.target);
          var el = e.target, to = parseFloat(el.getAttribute("data-to")) || 0, suffix = el.getAttribute("data-suffix") || "", start = null, dur = 1400;
          function fmt(n) { return (to >= 1000 ? Math.round(n).toLocaleString() : Math.round(n)) + suffix; }
          function step(ts) { if (!start) start = ts; var p = Math.min((ts - start) / dur, 1); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    }

    // Contact form
    var form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var btn = form.querySelector('button[type="submit"]'), status = document.getElementById("formStatus");
        btn.textContent = "Sending…"; btn.disabled = true; Sound.click();
        function show(msg, ok) {
          status.style.display = "block";
          status.style.color = ok ? "var(--primary)" : "#dc2626";
          status.textContent = msg;
        }
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form)
        }).then(function (r) { return r.json(); }).then(function (data) {
          if (data.success) {
            form.reset();
            show("✓ Thanks! Redirecting you…", true);
            window.location.href = "thank-you";
          } else {
            show("⚠ Sorry, something went wrong. Please email sales@kortechx.com and we'll get right back to you.", false);
          }
        }).catch(function () {
          show("⚠ Network error. Please email sales@kortechx.com and we'll get right back to you.", false);
        }).finally(function () {
          btn.textContent = "Send message →"; btn.disabled = false;
        });
      });
    }

    // Portfolio filter
    var pfCards = [].slice.call(document.querySelectorAll(".pf-card"));
    if (pfCards.length) {
      document.querySelectorAll(".pf-filter").forEach(function (f) {
        f.addEventListener("click", function () {
          document.querySelectorAll(".pf-filter").forEach(function (x) { x.classList.remove("active"); });
          f.classList.add("active");
          var cat = f.getAttribute("data-cat");
          pfCards.forEach(function (c) { c.classList.toggle("pf-hidden", !(cat === "all" || c.getAttribute("data-cat") === cat)); });
        });
      });
      // Lightbox
      var lb = document.getElementById("lightbox");
      if (lb) {
        function openLb(c) {
          document.getElementById("lbImg").src = c.getAttribute("data-img");
          document.getElementById("lbImg").alt = c.getAttribute("data-title");
          document.getElementById("lbCat").textContent = c.getAttribute("data-cat");
          document.getElementById("lbTitle").textContent = c.getAttribute("data-title");
          document.getElementById("lbSummary").textContent = c.getAttribute("data-summary");
          document.getElementById("lbScope").textContent = c.getAttribute("data-scope");
          var tags = (c.getAttribute("data-tags") || "").split(",").map(function (t) { return '<span class="tag">' + t.trim() + "</span>"; }).join("");
          document.getElementById("lbTags").innerHTML = tags;
          var mets = []; try { mets = JSON.parse(c.getAttribute("data-metrics") || "[]"); } catch (e) {}
          document.getElementById("lbMetrics").innerHTML = mets.map(function (m) { return '<div class="m"><div class="v">' + m[0] + '</div><div class="k">' + m[1] + "</div></div>"; }).join("");
          lb.classList.add("open"); document.body.style.overflow = "hidden"; Sound.click();
        }
        pfCards.forEach(function (c) { c.addEventListener("click", function () { openLb(c); }); });
        function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }
        document.getElementById("lbClose").addEventListener("click", closeLb);
        lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
      }
    }
  });
})();

/* Testimonials carousel + mobile services accordion */
document.addEventListener("DOMContentLoaded", function () {
  var ms = document.getElementById("mServices"), msub = document.getElementById("mSub");
  if (ms && msub) ms.addEventListener("click", function () { msub.classList.toggle("open"); });

  var car = document.getElementById("tcar");
  if (car) {
    var slides = [].slice.call(car.querySelectorAll(".tslide"));
    var dots = [].slice.call(document.querySelectorAll("#tdots .tdot"));
    var i = 0, timer = null;
    function go(n) {
      slides[i].classList.remove("active"); if (dots[i]) dots[i].classList.remove("active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("active"); if (dots[i]) dots[i].classList.add("active");
    }
    function start() { timer = setInterval(function () { go(i + 1); }, 9000); }
    dots.forEach(function (d, n) { d.addEventListener("click", function () { clearInterval(timer); go(n); start(); }); });
    if (slides.length > 1) start();
  }
});

/* Cookie consent banner */
(function () {
  var KEY = "ktechx_consent";
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored) return;
  var b = document.getElementById("cookieBanner");
  if (!b) return;
  function decide(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    b.style.display = "none";
    document.dispatchEvent(new CustomEvent("consentchange", { detail: v }));
  }
  var acc = document.getElementById("cookieAccept"), dec = document.getElementById("cookieDecline");
  if (acc) acc.addEventListener("click", function () { decide("accepted"); });
  if (dec) dec.addEventListener("click", function () { decide("declined"); });
  b.style.display = "flex";
})();

/* Google Analytics 4 — loaded only after consent, otherwise privacy-first */
(function () {
  var GA4_ID = "G-MSFLE8NK9Z";
  function load() {
    if (!GA4_ID || GA4_ID.indexOf("G-") !== 0 || window.kxGA) return;
    window.kxGA = 1;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
    gtag("config", GA4_ID, { anonymize_ip: true });
  }
  var s = null;
  try { s = localStorage.getItem("ktechx_consent"); } catch (e) {}
  if (s === "accepted") load();
  document.addEventListener("consentchange", function (e) {
    if (e.detail === "accepted") load();
  });
})();

/* ============================================
   Motion engine — loader, cursor glow, typewriter,
   3D tilt, magnetic buttons, parallax blobs, dock spring
   ============================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    var ld = document.getElementById("loader");
    if (ld && ld.parentNode) ld.parentNode.removeChild(ld);
    return;
  }

  /* Branded intro loader */
  var loader = document.getElementById("loader");
  if (loader) {
    var killed = false;
    function kill() {
      if (killed) return; killed = true;
      loader.classList.add("done");
      setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 620);
    }
    window.addEventListener("load", kill);
    setTimeout(kill, 1100);
  }

  /* Ambient cursor glow (desktop, fine pointer) */
  if (window.matchMedia("(pointer: fine)").matches) {
    var glow = document.getElementById("cursorGlow");
    if (glow) {
      var gx = -1000, gy = -1000, tx = -1000, ty = -1000, graf = null, armed = false;
      window.addEventListener("pointermove", function (e) {
        tx = e.clientX; ty = e.clientY;
        if (!armed) { armed = true; document.documentElement.classList.add("cursor-arm"); }
        if (!graf) graf = requestAnimationFrame(function () {
          graf = null;
          gx += (tx - gx) * 0.16; gy += (ty - gy) * 0.16;
          glow.style.transform = "translate(" + (gx - 260) + "px," + (gy - 260) + "px)";
        });
      }, { passive: true });
    }
  }

  /* Typewriter on #heroWord (home hero) */
  var hw = document.getElementById("heroWord");
  if (hw) {
    var words = [];
    try { words = JSON.parse(hw.getAttribute("data-words") || "[]"); } catch (e) {}
    if (!words.length) words = [(hw.textContent || "best salesperson").trim()];
    var wi = 0, ci = 0, del = false, tw = null;
    function typeStep() {
      var w = words[wi];
      if (!del) {
        ci += 1;
        hw.textContent = w.slice(0, ci);
        if (ci >= w.length) { del = true; tw = setTimeout(typeStep, 1900); }
        else tw = setTimeout(typeStep, 60 + Math.random() * 45);
      } else {
        ci -= 1;
        hw.textContent = w.slice(0, ci);
        if (ci <= 0) { del = false; wi = (wi + 1) % words.length; tw = setTimeout(typeStep, 350); }
        else tw = setTimeout(typeStep, 26);
      }
    }
    window.addEventListener("load", function () { hw.textContent = ""; typeStep(); }, { once: true });
    setTimeout(function () { if (!hw.textContent) { hw.textContent = words[0]; } }, 2200);
  }

  /* 3D tilt cards */
  if (window.matchMedia("(pointer: fine)").matches) {
    var tiltEls = document.querySelectorAll(".svc-card, .step, .price, .blog-card, .rel-card");
    tiltEls.forEach(function (el) {
      el.classList.add("tilt-ready");
      var rx = 0, ry = 0, tRun = null;
      function apply() { el.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)"; }
      el.addEventListener("mousemove", function (e) {
        var b = el.getBoundingClientRect();
        var px = (e.clientX - b.left) / b.width - 0.5;
        var py = (e.clientY - b.top) / b.height - 0.5;
        rx = -py * 5; ry = px * 6;
        if (!tRun) tRun = requestAnimationFrame(function () { tRun = null; apply(); });
      });
      el.addEventListener("mouseleave", function () {
        rx = 0; ry = 0;
        el.style.transform = "";
      });
    });

    /* Magnetic primary buttons */
    var magEls = document.querySelectorAll(".hero-cta .btn, .cta-band .btn");
    magEls.forEach(function (btn) {
      var mRun = null;
      btn.addEventListener("mousemove", function (e) {
        var b = btn.getBoundingClientRect();
        var dx = (e.clientX - b.left - b.width / 2) * 0.3;
        var dy = (e.clientY - b.top - b.height / 2) * 0.35;
        if (!mRun) mRun = requestAnimationFrame(function () { mRun = null; btn.style.transform = "translate(" + dx + "px," + dy + "px)"; });
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });

    /* Scroll parallax on hero blobs */
    var blobs = [].slice.call(document.querySelectorAll(".blob"));
    if (blobs.length) {
      var speeds = [0.12, 0.08, 0.05], pRun = null;
      function par() {
        var y = window.scrollY;
        blobs.forEach(function (b, i) {
          b.style.transform = "translate3d(0," + Math.max(-140, Math.min(140, y * speeds[i % 3])) + "px,0)";
        });
      }
      window.addEventListener("scroll", function () {
        if (!pRun) pRun = requestAnimationFrame(function () { pRun = null; par(); });
      }, { passive: true });
    }
  }

  /* Dock island spring on tap */
  document.querySelectorAll(".dock-menu .dm").forEach(function (a) {
    a.addEventListener("click", function () {
      a.classList.remove("spring");
      void a.offsetWidth;
      a.classList.add("spring");
      setTimeout(function () { a.classList.remove("spring"); }, 500);
    });
  });
})();
