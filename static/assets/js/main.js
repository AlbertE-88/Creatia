/**
 * Template Name: MyResume
 * Updated: Nov 17 2023 with Bootstrap v5.3.2
 * Template URL: https://bootstrapmade.com/free-html-bootstrap-template-my-resume/
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */
(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach((e) => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  const safeJsonParse = (val, fallback) => {
    if (!val) return fallback;
    try {
      return JSON.parse(val);
    } catch (err) {
      return fallback;
    }
  };

  const escapeHtml = (str = "") =>
    String(str).replace(/[&<>\"']/g, (ch) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return map[ch] || ch;
    });

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos,
      behavior: "smooth",
    });
  };

  /**
   * Back to top button
   */
  let backtotop = select(".back-to-top");
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add("active");
      } else {
        backtotop.classList.remove("active");
      }
    };
    window.addEventListener("load", toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
   * Mobile nav toggle
   */
  on("click", ".mobile-nav-toggle", function (e) {
    select("body").classList.toggle("mobile-nav-active");
    this.classList.toggle("is-active");
    const expanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", (!expanded).toString());
  });

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on(
    "click",
    ".scrollto",
    function (e) {
      if (select(this.hash)) {
        e.preventDefault();

        let body = select("body");
        if (body.classList.contains("mobile-nav-active")) {
          body.classList.remove("mobile-nav-active");
          let navbarToggle = select(".mobile-nav-toggle");
          navbarToggle?.classList.remove("is-active");
          navbarToggle?.setAttribute("aria-expanded", "false");
        }
        scrollto(this.hash);
      }
    },
    true
  );

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener("load", () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  /**
   * Hero type effect
   */
  const typed = select(".typed");
  if (typed && typeof Typed !== "undefined") {
    let typed_strings = typed.getAttribute("data-typed-items");
    typed_strings = typed_strings.split(",");
    new Typed(".typed", {
      strings: typed_strings,
      loop: true,
      typeSpeed: 70,
      backSpeed: 30,
      backDelay: 2000,
    });
  }

  /**
   * Skills animation
   */
  let skilsContent = select(".skills-content");
  if (skilsContent && typeof Waypoint !== "undefined") {
    new Waypoint({
      element: skilsContent,
      offset: "80%",
      handler: function () {
        let progress = select(".progress .progress-bar", true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute("aria-valuenow") + "%";
        });
      },
    });
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener("load", () => {
    let portfolioContainer = select(".portfolio-container");
    if (portfolioContainer && typeof Isotope !== "undefined") {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: ".portfolio-item",
      });

      let portfolioFilters = select("#portfolio-flters li", true);

      on(
        "click",
        "#portfolio-flters li",
        function (e) {
          e.preventDefault();
          portfolioFilters.forEach(function (el) {
            el.classList.remove("filter-active");
          });
          this.classList.add("filter-active");

          portfolioIsotope.arrange({
            filter: this.getAttribute("data-filter"),
          });
          portfolioIsotope.on("arrangeComplete", function () {
            if (typeof AOS !== "undefined") {
              AOS.refresh();
            }
          });
        },
        true
      );
    }
  });

  /**
   * Initiate portfolio lightbox
   */
  const portfolioLightbox =
    typeof GLightbox !== "undefined"
      ? GLightbox({
          selector: ".portfolio-lightbox",
        })
      : null;

  /**
   * Initiate portfolio details lightbox
   */
  const portfolioDetailsLightbox =
    typeof GLightbox !== "undefined"
      ? GLightbox({
          selector: ".portfolio-details-lightbox",
          width: "90%",
          height: "90vh",
        })
      : null;

  /**
   * Portfolio details slider
   */
  if (typeof Swiper !== "undefined") {
    new Swiper(".portfolio-details-slider", {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        clickable: true,
      },
    });
  }

  /**
   * Testimonials slider
   */
  if (typeof Swiper !== "undefined") {
    new Swiper(".testimonials-slider", {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      slidesPerView: "auto",
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        clickable: true,
      },
    });
  }

  const serviceLinks = [
    { id: "webDevServ", text: "Request for Web Development Services" },
    { id: "webDesServ", text: "Request for Web Design Services" },
    { id: "prAIServ", text: "Request for Programming and AI Services" },
    { id: "grDesServ", text: "Request for Graphics Design Services" },
    { id: "logoDesServ", text: "Request for Logo Design Services" },
    { id: "photoEdServ", text: "Request for Photo Editing Services" },
  ];

  serviceLinks.forEach(({ id, text }) => {
    const link = document.getElementById(id);
    if (!link) return;
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const contact = document.getElementById("contact");
      if (contact) contact.scrollIntoView({ behavior: "smooth" });
      const subject = document.getElementById("subject");
      if (subject) subject.value = text;
    });
  });

  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("page-fade-ready");
  });

  const dualCalUtils = {
    toPersianDigits(value) {
      return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
    },
    jalaliToGregorian(jy, jm, jd) {
      const jDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
      const gDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let jyAdj = Math.floor(jy) - 979;
      let jmAdj = Math.floor(jm) - 1;
      let jdAdj = Math.floor(jd) - 1;
      let jDayNo =
        365 * jyAdj +
        Math.floor(jyAdj / 33) * 8 +
        Math.floor(((jyAdj % 33) + 3) / 4);
      for (let i = 0; i < jmAdj; ++i) jDayNo += jDays[i];
      jDayNo += jdAdj;

      let gDayNo = jDayNo + 79;
      let gy = 1600 + 400 * Math.floor(gDayNo / 146097);
      gDayNo %= 146097;

      let leap = true;
      if (gDayNo >= 36525) {
        gDayNo--;
        gy += 100 * Math.floor(gDayNo / 36524);
        gDayNo %= 36524;
        if (gDayNo >= 365) gDayNo++;
        else leap = false;
      }

      gy += 4 * Math.floor(gDayNo / 1461);
      gDayNo %= 1461;
      if (gDayNo >= 366) {
        leap = false;
        gDayNo--;
        gy += Math.floor(gDayNo / 365);
        gDayNo %= 365;
      }

      let gm = 0;
      for (; gm < 12; gm++) {
        const days = gDays[gm] + (gm === 1 && leap ? 1 : 0);
        if (gDayNo < days) break;
        gDayNo -= days;
      }
      const gd = gDayNo + 1;
      return { year: gy, month: gm + 1, day: gd };
    },
    gregorianToJalali(gy, gm, gd) {
      const gDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let gDayNo =
        365 * (gy - 1600) +
        Math.floor((gy - 1600 + 3) / 4) -
        Math.floor((gy - 1600 + 99) / 100) +
        Math.floor((gy - 1600 + 399) / 400);
      for (let i = 0; i < gm - 1; ++i) gDayNo += gDays[i];
      if (gm > 2 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0))
        gDayNo++;
      gDayNo += gd - 1;
      let jDayNo = gDayNo - 79;
      const jNp = Math.floor(jDayNo / 12053);
      jDayNo %= 12053;
      let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461);
      jDayNo %= 1461;
      if (jDayNo >= 366) {
        jy += Math.floor((jDayNo - 1) / 365);
        jDayNo = (jDayNo - 1) % 365;
      }
      const jm =
        jDayNo < 186
          ? 1 + Math.floor(jDayNo / 31)
          : 7 + Math.floor((jDayNo - 186) / 30);
      const jd = 1 + (jDayNo < 186 ? jDayNo % 31 : (jDayNo - 186) % 30);
      return { jy, jm, jd };
    },
    persianMonthName(m) {
      return [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
        "دی",
        "بهمن",
        "اسفند",
      ][m - 1];
    },
    gregMonthName(m) {
      return [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ][m - 1];
    },
    daysInJalaliMonth(y, m) {
      const days = [
        31,
        31,
        31,
        31,
        31,
        31,
        30,
        30,
        30,
        30,
        30,
        this.isLeapJalali(y) ? 30 : 29,
      ];
      return days[m - 1];
    },
    isLeapJalali(y) {
      return ((((y - 474) % 2820) + 474 + 38) * 682) % 2816 < 682;
    },
    todayTehran() {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tehran",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .formatToParts(new Date())
        .reduce((acc, part) => {
          if (part.type !== "literal") acc[part.type] = Number(part.value);
          return acc;
        }, {});
      return { gy: parts.year, gm: parts.month, gd: parts.day };
    },
  };

  class DualCalendar {
    constructor(root, taskMap = {}) {
      this.root = root;
      this.grid = root.querySelector('[data-role="grid"]');
      this.persianTitle = root
        .closest(".dual-calendar-card")
        ?.querySelector('[data-role="persian-title"]');
      this.current = null;
      this.tasks = taskMap;
      this.attachNav();
      this.setToday();
    }

    storageKey() {
      return "dualcal-tasks";
    }

    setTasks(map) {
      this.tasks = map || {};
      this.render();
    }

    attachNav() {
      const nav = this.root
        .closest(".dual-calendar-card")
        ?.querySelectorAll("[data-cal-action]");
      nav?.forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.calAction;
          if (action === "prev") this.shiftMonth(-1);
          if (action === "next") this.shiftMonth(1);
          if (action === "today") this.setToday();
        });
      });
    }

    attachModal() {
      if (this.modalClose) {
        this.modalClose.addEventListener("click", () => this.hideModal());
      }
    }

    setToday() {
      const today = dualCalUtils.todayTehran();
      const j = dualCalUtils.gregorianToJalali(today.gy, today.gm, today.gd);
      this.current = { jy: j.jy, jm: j.jm };
      this.render();
    }

    shiftMonth(delta) {
      let { jy, jm } = this.current;
      jm += delta;
      if (jm < 1) {
        jm = 12;
        jy -= 1;
      } else if (jm > 12) {
        jm = 1;
        jy += 1;
      }
      this.current = { jy, jm };
      this.render();
    }

    render() {
      if (!this.grid || !this.current) return;
      const { jy, jm } = this.current;
      const gregStart = dualCalUtils.jalaliToGregorian(jy, jm, 1);
      const startDay = new Date(
        gregStart.year,
        gregStart.month - 1,
        gregStart.day
      ).getDay(); // 0=Sun
      const offset = (startDay + 1) % 7; // make Saturday index 0
      const daysInMonth = dualCalUtils.daysInJalaliMonth(jy, jm);
      const prevMonth = jm === 1 ? 12 : jm - 1;
      const prevYear = jm === 1 ? jy - 1 : jy;
      const daysPrev = dualCalUtils.daysInJalaliMonth(prevYear, prevMonth);
      const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
      const todayG = dualCalUtils.todayTehran();
      const todayJ = dualCalUtils.gregorianToJalali(
        todayG.gy,
        todayG.gm,
        todayG.gd
      );
      const isPastDate = (jyVal, jmVal, jdVal) =>
        jyVal < todayJ.jy ||
        (jyVal === todayJ.jy && jmVal < todayJ.jm) ||
        (jyVal === todayJ.jy && jmVal === todayJ.jm && jdVal < todayJ.jd);

      this.grid.innerHTML = "";
      if (this.persianTitle)
        this.persianTitle.textContent = `${dualCalUtils.persianMonthName(
          jm
        )} ${dualCalUtils.toPersianDigits(jy)}`;

      for (let i = 0; i < totalCells; i++) {
        let jyCell,
          jmCell,
          jdCell,
          type = "current";
        if (i < offset) {
          jdCell = daysPrev - offset + i + 1;
          jmCell = prevMonth;
          jyCell = prevYear;
          type = "other";
        } else if (i < offset + daysInMonth) {
          jdCell = i - offset + 1;
          jmCell = jm;
          jyCell = jy;
        } else {
          jdCell = i - (offset + daysInMonth) + 1;
          jmCell = jm === 12 ? 1 : jm + 1;
          jyCell = jm === 12 ? jy + 1 : jy;
          type = "other";
        }

        const cell = document.createElement("div");
        cell.className = `dualcal-day${
          type === "other" ? " dualcal-day--other" : ""
        }`;

        const persian = document.createElement("div");
        persian.className = "dualcal-date persian-script";
        persian.textContent = dualCalUtils.toPersianDigits(jdCell);

        const key = this.makeKey(jyCell, jmCell, jdCell);
        const dayTasks = this.tasks[key] || [];
        if (dayTasks.length) {
          const indicatorState = indicatorStateForTasks(dayTasks);
          const indicator = document.createElement("div");
          indicator.className = `dualcal-indicator dualcal-indicator--${indicatorState}`;
          indicator.setAttribute(
            "aria-label",
            `${dayTasks.length} task${dayTasks.length === 1 ? "" : "s"}`
          );
          indicator.title = `${dayTasks.length} task${
            dayTasks.length === 1 ? "" : "s"
          }`;
          cell.classList.add(
            "dualcal-day--has",
            `dualcal-day--${indicatorState}`
          );
          cell.appendChild(indicator);
        }

        cell.dataset.key = key;
        const isPast = isPastDate(jyCell, jmCell, jdCell);
        if (type === "current") {
          const allowClick = !isPast || dayTasks.length > 0;
          if (allowClick) {
            cell.classList.add("clickable");
            cell.addEventListener("click", () => {
              if (isPast) {
                if (dayTasks.length) openDayModal(jyCell, jmCell, jdCell, dayTasks);
              } else {
                if (dayTasks.length) openDayModal(jyCell, jmCell, jdCell, dayTasks);
                else openTaskModal(jyCell, jmCell, jdCell);
              }
            });
          }
          if (jyCell === todayJ.jy && jmCell === todayJ.jm) {
            if (jdCell === todayJ.jd) {
              cell.classList.add("dualcal-day--today");
              const todayTag = document.createElement("div");
              todayTag.className = "dualcal-today-label";
              todayTag.textContent = "امروز";
              cell.append(persian, todayTag);
            } else if (jdCell < todayJ.jd) {
              cell.classList.add("dualcal-day--past");
              cell.append(persian);
            } else {
              cell.append(persian);
            }
          } else {
            if (isPast) cell.classList.add("dualcal-day--past");
            cell.append(persian);
          }
        } else {
          if (isPast) cell.classList.add("dualcal-day--past");
          cell.append(persian);
        }
        this.grid.appendChild(cell);
      }
    }

    makeKey(y, m, d) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }

    refreshDay(y, m, d) {
      this.render();
    }
  }

  const initDualCalendars = (taskMap) => {
    const calendars = [];
    document
      .querySelectorAll("[data-dualcal]")
      .forEach((node) => calendars.push(new DualCalendar(node, taskMap)));
    return calendars;
  };

  let chatUnreadTimer = null;
  const fetchChatUnread = async () => {
    const badgeEls = document.querySelectorAll(".chat-link .btn-mail__badge");
    if (!badgeEls.length) return;
    badgeEls.forEach((el) => {
      el.hidden = true;
    });
    try {
      const res = await fetch("/api/chat/unread", { cache: "no-cache" });
      if (res.status === 401) {
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      const group = Number(data?.group) || 0;
      const total =
        group +
        Object.values(data?.privates || {}).reduce(
          (a, b) => a + (Number(b) || 0),
          0
        );
      badgeEls.forEach((el) => {
        if (total > 0) {
          el.textContent = total;
          el.hidden = false;
        } else {
          el.hidden = true;
        }
      });
    } catch (err) {
      badgeEls.forEach((el) => (el.hidden = true));
    }
  };

  const initUserCardProgress = () => {
    document
      .querySelectorAll(".user-card__progress-bar[data-progress]")
      .forEach((bar) => {
        const raw = Number(bar.dataset.progress);
        const pct = Math.max(0, Math.min(100, Number.isFinite(raw) ? raw : 0));
        bar.style.width = `${pct}%`;
        bar.setAttribute("aria-valuenow", String(pct));
      });
  };

  const initChatPage = () => {
    const chatRoot = document.querySelector(".chat-page");
    if (!chatRoot) return;
    const userPairs = safeJsonParse(chatRoot.dataset.chatUserMap, []);
    const userLookup = {};
    userPairs.forEach((pair) => {
      if (!Array.isArray(pair) || pair.length < 2) return;
      const [id, name] = pair;
      userLookup[String(id)] = name;
    });
    const targetButtons = chatRoot.querySelectorAll(".chat-target");
    const messagesBox = chatRoot.querySelector("[data-chat-messages]");
    const titleEl = chatRoot.querySelector("[data-chat-title]");
    const subtitleEl = chatRoot.querySelector("[data-chat-subtitle]");
    const form = document.getElementById("chatForm");
    const textarea = form?.querySelector("textarea[name='body']");
    const groupBadge = chatRoot.querySelector("[data-badge='group']");
    const privateBadges = chatRoot.querySelectorAll("[data-badge]");

    let currentTarget = "group";
    let lastId = null;
    let poller = null;

    const labelFor = (target) => {
      if (target === "group") {
        return { title: "گپ گروهی", subtitle: "همه کاربران" };
      }
      const name = userLookup[target] || "کاربر";
      return { title: `گفتگو با ${name}`, subtitle: "پیام خصوصی" };
    };

    const renderMessages = (msgs, append = false) => {
      if (!messagesBox) return;
      if (!append) messagesBox.innerHTML = "";
      if (!msgs.length && !append) {
        messagesBox.innerHTML = '<p class="chat-empty">پیامی ثبت نشده است.</p>';
        return;
      }
      if (append && msgs.length) {
        messagesBox.querySelectorAll(".chat-empty").forEach((n) => n.remove());
      }
      msgs.forEach((m) => {
        const item = document.createElement("div");
        item.className = `chat-msg${m.is_mine ? " chat-msg--mine" : ""}`;
        const author = document.createElement("div");
        author.className = "chat-msg__meta";
        author.textContent = m.is_mine ? "شما" : m.sender_name || "کاربر";
        const body = document.createElement("div");
        body.className = "chat-msg__body";
        body.textContent = m.body;
        item.append(author, body);
        if (m.can_delete) {
          const actions = document.createElement("div");
          actions.className = "chat-msg__actions";
          const delBtn = document.createElement("button");
          delBtn.type = "button";
          delBtn.className = "chat-msg__delete";
          delBtn.textContent = "حذف";
          delBtn.addEventListener("click", async () => {
            const ok = confirm("این پیام حذف شود؟");
            if (!ok) return;
            await deleteMessage(m.id);
          });
          actions.appendChild(delBtn);
          item.appendChild(actions);
        }
        messagesBox.appendChild(item);
      });
      messagesBox.scrollTop = messagesBox.scrollHeight;
    };

    const refreshUnread = async () => {
      try {
        const res = await fetch("/api/chat/unread", { cache: "no-cache" });
        if (!res.ok) return;
        const data = await res.json();
        if (groupBadge) {
          const g = Number(data.group) || 0;
          groupBadge.textContent = g;
          groupBadge.hidden = g <= 0;
        }
        privateBadges.forEach((b) => {
          const peer = b.dataset.badge;
          const rawVal =
            peer === "group" ? data.group : (data.privates || {})[peer];
          const num = Number(rawVal) || 0;
          b.textContent = num;
          b.hidden = num <= 0;
        });
      } catch (err) {
        /* ignore */
      }
    };

    const loadMessages = async (initial = false) => {
      const url = new URL("/api/chat/messages", window.location.origin);
      url.searchParams.set("target", currentTarget);
      if (lastId) url.searchParams.set("after", lastId);
      url.searchParams.set("mark_read", "1");
      try {
        const res = await fetch(url.toString(), { cache: "no-cache" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.length) {
          lastId = data[data.length - 1].id;
          renderMessages(data, true);
        } else if (initial) {
          renderMessages([], false);
        }
        await refreshUnread();
      } catch (err) {
        console.warn("Chat load failed", err);
      }
    };

    const deleteMessage = async (id) => {
      try {
        const res = await fetch(`/api/chat/messages/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "امکان حذف پیام نیست.");
          return;
        }
        await refreshUnread();
        resetAndLoad();
      } catch (err) {
        alert("حذف پیام انجام نشد.");
      }
    };

    const resetAndLoad = () => {
      lastId = null;
      renderMessages([], false);
      loadMessages(true);
      if (poller) clearInterval(poller);
      poller = setInterval(() => loadMessages(false), 5000);
    };

    const activateTarget = (target) => {
      const btn = chatRoot.querySelector(`.chat-target[data-target="${target}"]`);
      if (!btn) return false;
      targetButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTarget = target;
      const labels = labelFor(target);
      if (titleEl) titleEl.textContent = labels.title;
      if (subtitleEl) subtitleEl.textContent = labels.subtitle;
      form?.querySelector('input[name="target"]')?.setAttribute("value", target);
      resetAndLoad();
      return true;
    };

    targetButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target || "group";
        if (target === currentTarget) return;
        activateTarget(target);
      });
    });

    const params = new URLSearchParams(window.location.search);
    const initialTarget = params.get("target");
    const activated =
      initialTarget && initialTarget !== "group"
        ? activateTarget(initialTarget)
        : false;
    if (!activated) {
      resetAndLoad();
    }

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!textarea || !textarea.value.trim()) return;
      const body = textarea.value.trim();
      try {
        const res = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: currentTarget, body }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "ارسال پیام با خطا مواجه شد.");
          return;
        }
        const msg = await res.json();
        textarea.value = "";
        lastId = msg.id;
        renderMessages([msg], true);
        await refreshUnread();
      } catch (err) {
        alert("ارتباط با سرور برقرار نشد.");
      }
    });

    textarea?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form?.requestSubmit?.();
      }
    });

    refreshUnread().then(resetAndLoad);
  };

  const initManageUsersPage = () => {
    const root = document.querySelector("[data-manage-users]");
    if (!root) return;
    const roles = safeJsonParse(root.dataset.roleOptions, []);
    const groupForm = document.getElementById("createGroupForm");
    const userForm = document.getElementById("createUserForm");

    groupForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(groupForm);
      const rolesSelect = Array.from(
        document.getElementById("groupRoles")?.selectedOptions || []
      ).map((o) => o.value);
      const newRole = (fd.get("new_role") || "").trim();
      if (newRole) rolesSelect.push(newRole);
      const payload = {
        name: fd.get("name"),
        permissions: JSON.stringify({
          roles: rolesSelect,
          note: fd.get("permissions") || "",
        }),
      };
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        alert("Could not create group");
      } else {
        location.reload();
      }
    });

    userForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(userForm);
      const payload = {
        username: fd.get("username"),
        email: fd.get("email"),
        password: fd.get("password"),
        role: fd.get("role"),
      };
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        alert("Could not create user");
      } else {
        location.reload();
      }
    });

    const passwordInput = userForm?.querySelector('input[name="password"]');
    const showPw = document.getElementById("showCreatePassword");
    showPw?.addEventListener("change", () => {
      if (passwordInput) passwordInput.type = showPw.checked ? "text" : "password";
    });

    const buildRoleOptions = (current) =>
      roles
        .map((role) => {
          const value = escapeHtml(role);
          const selected = role === current ? ' selected="selected"' : "";
          return `<option value="${value}"${selected}>${value}</option>`;
        })
        .join("");

    const openEditModal = (user) => {
      const overlay = document.createElement("div");
      overlay.className = "manage-modal";
      const dialog = document.createElement("div");
      dialog.className = "manage-modal__card";
      dialog.innerHTML = `
        <h3>Edit User</h3>
        <form class="stacked-form manage-form" id="editUserForm">
          <input type="text" name="username" value="${escapeHtml(
            user.username || ""
          )}" required />
          <input type="email" name="email" value="${escapeHtml(
            user.email || ""
          )}" required />
          <input type="password" name="password" placeholder="New password (optional)" />
          <label class="compact-label checkbox-inline"><input type="checkbox" id="editShowPw"> Show password</label>
          <select name="role">
            ${buildRoleOptions(user.role)}
          </select>
          <label class="compact-label checkbox-inline"><input type="checkbox" name="is_active" ${
            user.is_active ? "checked" : ""
          }> Active</label>
          <div class="manage-modal__actions">
            <button type="submit" class="submit-btn">Save</button>
            <button type="button" class="ghost-btn" id="editCancel">Cancel</button>
          </div>
        </form>
      `;
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      const form = dialog.querySelector("#editUserForm");
      const select = form.querySelector('select[name="role"]');
      select.value = user.role;
      const pwInput = form.querySelector('input[name="password"]');
      const show = form.querySelector("#editShowPw");
      show?.addEventListener("change", () => {
        if (pwInput) pwInput.type = show.checked ? "text" : "password";
      });
      dialog.querySelector("#editCancel")?.addEventListener("click", () => overlay.remove());
      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const fd = new FormData(form);
        const payload = {
          username: fd.get("username"),
          email: fd.get("email"),
          role: fd.get("role"),
          is_active: form.querySelector('input[name="is_active"]').checked,
        };
        const pw = fd.get("password");
        if (pw) payload.password = pw;
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          alert("Could not update user");
        } else {
          location.reload();
        }
      });
    };

    document.querySelectorAll("[data-edit-user]")?.forEach((btn) => {
      btn.addEventListener("click", () => {
        const user = {
          id: btn.dataset.editUser,
          username: btn.dataset.username,
          email: btn.dataset.email,
          role: btn.dataset.role,
          is_active:
            btn.dataset.active === "True" ||
            btn.dataset.active === "true" ||
            btn.dataset.active === "1",
        };
        openEditModal(user);
      });
    });

    document.querySelectorAll("[data-delete-user]")?.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.deleteUser;
        if (!confirm("Are you sure you want to delete this user?")) return;
        const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        if (!res.ok) {
          alert("Could not delete user");
        } else {
          location.reload();
        }
      });
    });
  };

  const initProfilePage = () => {
    const page = document.querySelector("[data-profile-page]");
    if (!page) return;
    window.history.scrollRestoration = "manual";
    const editBtn = document.getElementById("editProfileBtn");
    const cancelBtn = document.getElementById("cancelProfileEdit");
    const form = document.getElementById("profileForm");
    const editPens = document.querySelectorAll(".edit-pen");
    const showPw = document.getElementById("showProfilePw");
    const pwInput = form?.querySelector('input[name="password"]');
    const pwField = document.querySelector(".editable-password");
    const pwLink = document.getElementById("togglePasswordField");
    const editableDisplays = document.querySelectorAll("[data-edit-target]");
    const joinDateEl = document.querySelector("[data-join-date]");
    const defaultEditText = editBtn?.dataset.defaultText || "Edit profile";
    const saveText = "Save";
    const scrollKey = "profileScrollY";
    const resumeClip = document.querySelector(".resume-clip");
    const resumeInput = document.getElementById("resumeInput");
    const resumePlaceholder = document.querySelector("[data-resume-placeholder]");
    const resumeError = document.querySelector("[data-resume-error]");
    const resumeLink = document.querySelector(".profile-resume-link");
    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.querySelector("[data-avatar-preview]");
    const avatarHandles = document.querySelectorAll(".avatar-handle");
    const avatarScaleInput = form?.querySelector('input[name="avatar_scale"]');
    const avatarOffsetXInput = form?.querySelector('input[name="avatar_offset_x"]');
    const avatarOffsetYInput = form?.querySelector('input[name="avatar_offset_y"]');
    const avatarControls = document.querySelector(".avatar-controls");
    const responsibilityInput = form?.querySelector('input[name="responsibility"]');
    const fileRows = document.querySelectorAll(".files-card .file-row");
    const fileInputs = document.querySelectorAll('.files-card input[type="file"]');
    const filePills = document.querySelectorAll(".files-card .file-upload-pill");
    const fileRemoveButtons = document.querySelectorAll(".files-card [data-remove-btn]");
    const fileRemoveInputs = document.querySelectorAll(".files-card [data-remove-input]");
    const uploadBase = page.dataset.uploadBase || "";

    const initialState = {
      avatar: {
        src: avatarPreview?.getAttribute("src") || "",
        scale: avatarScaleInput?.value || "1",
        offsetX: avatarOffsetXInput?.value || "0",
        offsetY: avatarOffsetYInput?.value || "0",
      },
      resume: {
        href: resumeLink?.getAttribute("href") || "#",
        storedPath: resumeLink?.dataset.storedPath || "",
        hidden: resumeLink?.hasAttribute("hidden"),
        placeholderText:
          resumePlaceholder?.textContent?.trim() || "رزومه ثبت نشده",
        placeholderHidden: resumePlaceholder?.hasAttribute("hidden"),
      },
    };

    const isEditing = () => page?.classList.contains("editing");
    const openFileInput = (input) => {
      if (!input) return;
      input.disabled = false;
      input.removeAttribute("disabled");
      input.tabIndex = 0;
      if (typeof input.showPicker === "function") {
        try {
          input.showPicker();
          return;
        } catch (err) {
          /* fall back to click when showPicker is not available */
        }
      }
      input.click();
    };
    const toggleFileMode = (editing) => {
      fileInputs.forEach((input) => {
        if (editing) {
          input.disabled = false;
          input.removeAttribute("disabled");
          input.tabIndex = 0;
        } else {
          input.disabled = true;
          input.setAttribute("disabled", "disabled");
          input.tabIndex = -1;
        }
      });
      fileRemoveButtons.forEach((btn) => {
        btn.disabled = !editing;
      });
    };
    const showFileAttachment = (row, input) => {
      const label =
        row.querySelector(".file-label")?.textContent?.trim() || "File";
      const link = row.querySelector("[data-file-link]");
      const nameSpan = row.querySelector("[data-file-name]");
      const storedPath = row.dataset.storedPath;
      const chosen =
        input.dataset.selectedName ||
        input.files?.[0]?.name ||
        nameSpan?.textContent?.trim();
      if (storedPath && link && !link.hasAttribute("hidden")) {
        window.open(link.href, "_blank");
        return;
      }
      alert(
        chosen ? `${label}: ${chosen}` : `${label}: هیچ فایلی پیوست نشده است`
      );
    };

    const syncFormFromDisplays = () => {
      editableDisplays.forEach((el) => {
        const key = el.dataset.editTarget;
        const input = form?.querySelector(`[name="${key}"]`);
        if (input) input.value = el.textContent.trim();
      });
      if (avatarInput && avatarInput.files?.length === 0) {
        avatarInput.value = "";
      }
      if (responsibilityInput) {
        responsibilityInput.value =
          document
            .querySelector('[data-edit-target="responsibility"]')
            ?.textContent.trim() || responsibilityInput.value;
      }
    };

    const syncDisplays = () => {
      const displays = document.querySelectorAll("[data-display]");
      const active = document.activeElement;
      displays.forEach((el) => {
        if (el === active && el.getAttribute("contenteditable") === "true") {
          return;
        }
        const key = el.dataset.display;
        const formInput = form?.querySelector(`[name="${key}"]`);
        const val = formInput?.value?.trim();
        el.textContent = val || el.dataset.placeholder || "";
      });
    };

    const startEditing = () => {
      page?.classList.add("editing");
      toggleFileMode(true);
      syncFormFromDisplays();
      if (editBtn) editBtn.textContent = saveText;
      if (cancelBtn) cancelBtn.hidden = false;
      editableDisplays.forEach((el) => {
        el.contentEditable = "true";
        el.classList.add("is-editing");
      });
      if (avatarControls) avatarControls.style.display = "flex";
    };
    const stopEditing = () => {
      form?.reset();
      page?.classList.remove("editing");
      toggleFileMode(false);
      fileInputs.forEach((input) => {
        input.dataset.selectedName = "";
      });
      fileRows.forEach((row) => {
        const nameSpan = row.querySelector("[data-file-name]");
        const link = row.querySelector("[data-file-link]");
        const removeInput = row.querySelector("[data-remove-input]");
        const storedName = row.dataset.storedName || "";
        const storedPath = row.dataset.storedPath || "";
        if (nameSpan) nameSpan.textContent = storedName;
        if (link) {
          if (storedPath) {
            link.href = `${uploadBase}${storedPath}`;
            link.removeAttribute("hidden");
          } else {
            link.setAttribute("hidden", "");
            link.href = "#";
          }
        }
        if (removeInput) removeInput.disabled = true;
        row.classList.remove("file-removed");
      });
      document
        .querySelectorAll(".editable-field.field-editing")
        .forEach((node) => node.classList.remove("field-editing"));
      syncDisplays();
      if (resumeInput) resumeInput.value = "";
      if (avatarInput) avatarInput.value = "";
      if (avatarPreview && initialState.avatar.src) {
        avatarPreview.src = initialState.avatar.src;
        avatarPreview.style.transform = `translate(${initialState.avatar.offsetX}%, ${initialState.avatar.offsetY}%) scale(${initialState.avatar.scale})`;
      }
      if (avatarScaleInput) avatarScaleInput.value = initialState.avatar.scale;
      if (avatarOffsetXInput) avatarOffsetXInput.value = initialState.avatar.offsetX;
      if (avatarOffsetYInput) avatarOffsetYInput.value = initialState.avatar.offsetY;
      if (resumeLink) {
        if (initialState.resume.hidden) resumeLink.setAttribute("hidden", "");
        else resumeLink.removeAttribute("hidden");
        resumeLink.href = initialState.resume.href || "#";
        resumeLink.dataset.storedPath = initialState.resume.storedPath || "";
        resumeLink.onclick = null;
      }
      if (resumeError) resumeError.hidden = true;
      if (resumePlaceholder) {
        resumePlaceholder.textContent = initialState.resume.placeholderText;
        if (initialState.resume.placeholderHidden) {
          resumePlaceholder.hidden = true;
        } else {
          resumePlaceholder.hidden = false;
        }
      }
      if (pwInput) pwInput.type = showPw?.checked ? "text" : "password";
      if (editBtn) editBtn.textContent = defaultEditText;
      if (cancelBtn) cancelBtn.hidden = true;
      editableDisplays.forEach((el) => {
        el.contentEditable = "false";
        el.classList.remove("is-editing");
      });
      if (avatarControls) avatarControls.style.display = "none";
    };

    editBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const editing = page?.classList.contains("editing");
      if (editing) {
        syncFormFromDisplays();
        sessionStorage.setItem(scrollKey, String(window.scrollY || 0));
        if (form?.requestSubmit) form.requestSubmit();
        else form?.submit();
      } else {
        startEditing();
      }
    });
    cancelBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      stopEditing();
    });

    editPens.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        const isHero = btn.classList.contains("edit-pen--hero");
        startEditing();
        if (isHero) {
          const editable = document.querySelector(
            `[data-edit-target="${target}"]`
          );
          if (editable) {
            editable.focus();
            const range = document.createRange();
            range.selectNodeContents(editable);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } else {
          const input = form?.querySelector(`[name="${target}"]`);
          if (input) {
            input.focus();
            if (input.setSelectionRange && input.value.length) {
              input.setSelectionRange(input.value.length, input.value.length);
            }
          }
        }
      });
    });

    if (joinDateEl?.dataset.joinDate) {
      const formatted = window.formatJalaliDate?.(joinDateEl.dataset.joinDate);
      if (formatted) joinDateEl.textContent = formatted;
    }

    resumeClip?.addEventListener("click", (e) => {
      e.preventDefault();
      startEditing();
      openFileInput(resumeInput);
    });
    resumeLink?.addEventListener("click", (e) => {
      const storedPath = resumeLink.dataset.storedPath;
      if (!storedPath && !isEditing()) {
        e.preventDefault();
        return;
      }
      if (!resumeInput || isEditing()) return;
      e.preventDefault();
      showFileAttachment(
        resumeLink.closest(".profile-hero__resume"),
        resumeInput
      );
    });
    resumeInput?.addEventListener("change", () => {
      resumeError && (resumeError.hidden = true);
      if (!resumeInput.files?.length) return;
      const file = resumeInput.files[0];
      if (file.type !== "application/pdf") {
        resumeError.textContent = "فقط فایل PDF مجاز است.";
        resumeError.hidden = false;
        resumeInput.value = "";
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        resumeError.textContent = "حجم فایل باید کمتر از ۴ مگابایت باشد.";
        resumeError.hidden = false;
        resumeInput.value = "";
        return;
      }
      if (resumePlaceholder) {
        resumePlaceholder.textContent = file.name;
        resumePlaceholder.hidden = false;
      }
      if (resumeLink) {
        resumeLink.setAttribute("hidden", "");
        resumeLink.href = "#";
        resumeLink.dataset.storedPath = "";
      }
    });

    const updatePwField = (show) => {
      if (!pwField) return;
      const field = pwField.querySelector("input");
      if (!field) return;
      field.type = show ? "text" : "password";
    };

    showPw?.addEventListener("change", () => {
      updatePwField(showPw.checked);
    });

    pwLink?.addEventListener("click", (e) => {
      e.preventDefault();
      const active = pwField?.classList.contains("field-editing");
      if (!active) {
        pwField?.classList.add("field-editing");
        const input = pwField?.querySelector("input");
        input?.focus();
      } else {
        pwField?.classList.remove("field-editing");
        const input = pwField?.querySelector("input");
        if (input) input.value = "";
      }
    });

    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const applyTransform = () => {
      const scale = clamp(Number(avatarScaleInput?.value || 1), 0.6, 2.8);
      const x = clamp(Number(avatarOffsetXInput?.value || 0), -50, 50);
      const y = clamp(Number(avatarOffsetYInput?.value || 0), -50, 50);
      if (avatarPreview)
        avatarPreview.style.transform = `translate(${x}%, ${y}%) scale(${scale})`;
      if (avatarScaleInput) avatarScaleInput.value = String(scale);
      if (avatarOffsetXInput) avatarOffsetXInput.value = String(x);
      if (avatarOffsetYInput) avatarOffsetYInput.value = String(y);
    };
    avatarHandles.forEach((handle) => {
      handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (!avatarControls?.style.display || avatarControls.style.display === "none")
          return;
        let startX = e.clientX;
        let startY = e.clientY;
        const startScale = Number(avatarScaleInput?.value || 1);
        const startOffsetX = Number(avatarOffsetXInput?.value || 0);
        const startOffsetY = Number(avatarOffsetYInput?.value || 0);
        const onMove = (ev) => {
          ev.preventDefault();
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          const factor = handle.classList.contains("avatar-handle--tl")
            ? -1
            : 1;
          avatarScaleInput.value = String(startScale + (dx + dy) * 0.01 * factor);
          avatarOffsetXInput.value = String(startOffsetX + dx * 0.2);
          avatarOffsetYInput.value = String(startOffsetY + dy * 0.2);
          applyTransform();
        };
        const onUp = () => {
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      });
    });

    avatarInput?.addEventListener("change", () => {
      if (!avatarInput.files?.length || !avatarPreview) return;
      const file = avatarInput.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        avatarPreview.src = ev.target?.result || avatarPreview.src;
        applyTransform();
      };
      reader.readAsDataURL(file);
    });

    document.querySelectorAll("[data-edit-target]").forEach((node) => {
      node.addEventListener("focus", (e) => {
        e.target.classList.add("field-editing");
      });
      node.addEventListener("blur", (e) => {
        e.target.classList.remove("field-editing");
      });
      node.addEventListener("input", () => {
        syncFormFromDisplays();
      });
    });

    filePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const input = pill.querySelector('input[type="file"]');
        if (input) {
          input.dataset.selectedName = "";
          openFileInput(input);
        }
      });
      pill.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const input = pill.querySelector('input[type="file"]');
          if (input) {
            input.dataset.selectedName = "";
            openFileInput(input);
          }
        }
      });
    });

    fileInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const row = input.closest(".file-row");
        if (!row) return;
        const label = row.querySelector(".file-label")?.textContent?.trim();
        const nameSpan = row.querySelector("[data-file-name]");
        const removeInput = row.querySelector("[data-remove-input]");
        const file = input.files?.[0];
        const maxSize = Number(row.dataset.maxSize || 4 * 1024 * 1024);
        const allowExt = (row.dataset.allowExt || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        if (!file) {
          if (nameSpan) nameSpan.textContent = row.dataset.storedName || "";
          if (removeInput) removeInput.disabled = true;
          row.classList.remove("file-removed");
          return;
        }
        if (file.size > maxSize) {
          alert(
            `${label || "File"} should be smaller than ${Math.round(
              maxSize / 1024 / 1024
            )}MB`
          );
          input.value = "";
          return;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (allowExt.length && !allowExt.includes(ext)) {
          alert(`Allowed file types: ${allowExt.join(", ")}`);
          input.value = "";
          return;
        }
        if (nameSpan) nameSpan.textContent = file.name;
        input.dataset.selectedName = file.name;
        if (removeInput) removeInput.disabled = true;
        row.classList.remove("file-removed");
      });
    });

    fileRemoveButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".file-row");
        if (!row) return;
        const input = row.querySelector('input[type="file"]');
        const removeInput = row.querySelector("[data-remove-input]");
        const nameSpan = row.querySelector("[data-file-name]");
        if (input) input.value = "";
        if (nameSpan) nameSpan.textContent = row.dataset.storedName || "";
        if (removeInput) removeInput.disabled = false;
        row.classList.add("file-removed");
      });
    });

    document.querySelectorAll("[data-toggle-profile-form]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = btn.dataset.toggleProfileForm;
        const section = document.getElementById(target);
        if (!section) return;
        const isHidden = section.hasAttribute("hidden");
        if (isHidden) {
          section.removeAttribute("hidden");
          btn.textContent = "بستن فرم";
        } else {
          section.setAttribute("hidden", "");
          btn.textContent = "افزودن فایل جدید";
        }
      });
    });

    document.querySelectorAll(".editable-field").forEach((field) => {
      const editControl = field.querySelector(".field-edit-btn");
      const input = field.querySelector("input, textarea");
      const tag = input?.tagName?.toLowerCase();
      editControl?.addEventListener("click", () => {
        field.classList.toggle("field-editing");
        if (tag === "textarea") {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        } else {
          input?.focus();
        }
      });
    });

    const storedScroll = sessionStorage.getItem(scrollKey);
    if (storedScroll) {
      window.scrollTo({ top: Number(storedScroll) || 0 });
      sessionStorage.removeItem(scrollKey);
    }

    toggleFileMode(false);
    syncDisplays();
    applyTransform();
  };

  const taskStore = {
    list: [],
    map: {},
    calendars: [],
    isAdmin: false,
    currentUserId: null,
    assignees: [],
    modal: null,
    modalContent: null,
    modalClose: null,
  };

  const initGlobalsFromDom = () => {
    const el = document.getElementById("taskGlobals");
    if (!el) return;
    const uid = Number(el.dataset.userId);
    if (!window.currentUserId) window.currentUserId = Number.isFinite(uid) ? uid : null;
    if (!window.currentUserRole) window.currentUserRole = el.dataset.userRole || "";
    if (!window.taskAssignees && el.dataset.assignees) {
      try {
        window.taskAssignees = JSON.parse(el.dataset.assignees);
      } catch {
        window.taskAssignees = [];
      }
    }
  };

  const formatJalaliDate = (iso) => {
    const parts = (iso || "").split("-");
    if (parts.length !== 3) return iso || "";
    const [gy, gm, gd] = parts.map((n) => Number(n));
    if (!gy || !gm || !gd) return iso || "";
    const j = dualCalUtils.gregorianToJalali(gy, gm, gd);
    return `${dualCalUtils.toPersianDigits(j.jd)} ${dualCalUtils.persianMonthName(j.jm)} ${dualCalUtils.toPersianDigits(j.jy)}`;
  };

  const formatJalaliDateTime = (iso) => {
    if (!iso) return "";
    const datePart = iso.split("T")[0];
    return formatJalaliDate(datePart);
  };

  // Expose for pages that need lightweight Jalali formatting
  window.formatJalaliDate = formatJalaliDate;

  const jalaliToIso = (jy, jm, jd) => {
    const g = dualCalUtils.jalaliToGregorian(Number(jy), Number(jm), Number(jd));
    return `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`;
  };

  const buildTaskMap = (tasks) => {
    const byDate = {};
    tasks.forEach((t) => {
      const [gy, gm, gd] = (t.due_date || "").split("-").map((n) => Number(n));
      if (!gy || !gm || !gd) return;
      const j = dualCalUtils.gregorianToJalali(gy, gm, gd);
      const key = `${j.jy}-${String(j.jm).padStart(2, "0")}-${String(
        j.jd
      ).padStart(2, "0")}`;
      t._jalaliDisplay = `${dualCalUtils.toPersianDigits(
        j.jd
      )} ${dualCalUtils.persianMonthName(j.jm)} ${dualCalUtils.toPersianDigits(j.jy)}`;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(t);
    });
    return byDate;
  };

  const relativeDueText = (iso) => {
    if (!iso) {
      return { text: "", status: "upcoming" };
    }
    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const due = new Date(`${iso}T00:00:00`);
    const diffMs = due.getTime() - todayMid.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    if (diffDays === 0) {
      return { text: "امروز", status: "today" };
    }
    if (diffDays < 0) {
      const days = dualCalUtils.toPersianDigits(Math.abs(diffDays));
      return { text: `${days} روز پیش`, status: "overdue" };
    }
    const days = dualCalUtils.toPersianDigits(diffDays);
    return { text: `${days} روز مانده`, status: "upcoming" };
  };

  const pad2 = (n) => String(n).padStart(2, "0");
  const isoToJalaliString = (iso) => {
    if (!iso) return "";
    const [gy, gm, gd] = iso.split("-").map((n) => Number(n));
    if (!gy || !gm || !gd) return "";
    const j = dualCalUtils.gregorianToJalali(gy, gm, gd);
    return `${j.jy}-${pad2(j.jm)}-${pad2(j.jd)}`;
  };
  const jalaliToIsoString = (jstr) => {
    if (!jstr) return "";
    const parts = jstr.split("-").map((n) => Number(n));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return "";
    const [jy, jm, jd] = parts;
    const g = dualCalUtils.jalaliToGregorian(jy, jm, jd);
    if (!g || !g.year || !g.month || !g.day) return "";
    return `${g.year}-${pad2(g.month)}-${pad2(g.day)}`;
  };

  const indicatorStateForTasks = (tasks = []) => {
    if (!tasks.length) return "active";
    const doneLike = (s) => ["done", "done-overdue"].includes((s || "").toLowerCase());
    const hasOverdue = tasks.some((t) => t.overdue && !doneLike(t.status));
    if (hasOverdue) return "overdue";
    const hasActive = tasks.some((t) => !doneLike(t.status));
    if (hasActive) return "active";
    return "done";
  };

  const renderTaskRow = (task, opts) => {
    const doneStatuses = ["done", "done-overdue"];
    const isDoneLike = doneStatuses.includes(task.status);
    const isOverdueNow = !!task.overdue;
    const row = document.createElement("div");
    row.className = `task-row slim${isOverdueNow ? " task-row--overdue" : ""}${
      isDoneLike ? " task-row--done" : ""
    }`;

    const title = document.createElement("span");
    title.className = "task-row__title";
    title.textContent = task.title;

    const date = document.createElement("span");
    date.className = "task-row__date";
    const readableDate =
      task._jalaliDisplay || formatJalaliDate(task.due_date) || "";
    const relative = relativeDueText(task.due_date);
    if (relative.status === "overdue") date.classList.add("task-row__date--overdue");
    else if (relative.status === "today") date.classList.add("task-row__date--today");
    else date.classList.add("task-row__date--upcoming");
    let dateText = readableDate
      ? `تاریخ سررسید: ${readableDate}${relative.text ? ` (${relative.text})` : ""}`
      : "";
    if (task.approved_at) {
      dateText += `، تاریخ تایید: ${formatJalaliDate(task.approved_at.split("T")[0])}`;
    }
    date.textContent = dateText;

    const metaHead = document.createElement("div");
    metaHead.className = "task-row__head";
    metaHead.append(title, date);

    const meta = document.createElement("div");
    meta.className = "task-row__meta";
    meta.appendChild(metaHead);

    if (opts.isAdmin && task.assigned_to?.username) {
      const assignee = document.createElement("small");
      assignee.className = "task-row__assignee";
      assignee.textContent = `→ ${task.assigned_to.username}`;
      meta.appendChild(assignee);
    }

    const actions = document.createElement("div");
    actions.className = "task-row__actions";

    const doneToggle = document.createElement("label");
    doneToggle.className = "task-row__done";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const shouldCheck = isDoneLike || (task.approval_pending && !opts.isAdmin);
    checkbox.checked = shouldCheck;
    checkbox.addEventListener("change", () =>
      updateTaskStatus(
        task.id,
        checkbox.checked ? (isOverdueNow ? "done-overdue" : "done") : "pending"
      )
    );
    const checkText = document.createElement("span");
    const createdByAdmin = task.created_by?.role === "admin";
    const assigneeRole = task.assigned_to?.role;
    const assignedToCurrent = task.assigned_to?.id === taskStore.currentUserId;
    const baseLabel = !opts.isAdmin && createdByAdmin ? "Submit" : "Done";
    checkText.textContent = isOverdueNow ? `${baseLabel} overdue` : baseLabel;
    doneToggle.append(checkbox, checkText);
    if (task.approval_pending) {
      const waiting = document.createElement("span");
      waiting.className = "task-row__approval";
      waiting.textContent = "در انتظار تایید";
      doneToggle.appendChild(waiting);
    }

    const commentBtn = document.createElement("button");
    commentBtn.type = "button";
    commentBtn.className = "submit-btn submit-btn--small";
    commentBtn.textContent = "Comment";
    commentBtn.addEventListener("click", () => openActionModal(task, "comment"));

    const attachBtn = document.createElement("button");
    attachBtn.type = "button";
    attachBtn.className = "submit-btn submit-btn--small";
    attachBtn.textContent = "+File";
    attachBtn.addEventListener("click", () => triggerAttach(task.id));

    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "submit-btn submit-btn--small";
    viewBtn.textContent = "Details";
    viewBtn.addEventListener("click", () => openViewModal(task));

    const sameActor =
      task.created_by?.id &&
      task.assigned_to?.id &&
      task.created_by.id === task.assigned_to.id;
    const isSelf = sameActor && task.assigned_to?.id === taskStore.currentUserId;
    const editAllowed = opts.isAdmin || isSelf;
    const deleteAllowed = opts.isAdmin || isSelf;
    const extAllowed =
      !opts.isAdmin &&
      createdByAdmin &&
      assignedToCurrent &&
      task.status !== "done" &&
      !task.approval_pending;

    const hideDoneForResearcher =
      !opts.isAdmin &&
      (task.status === "done-overdue" || (createdByAdmin && task.status === "done"));
    const restrictToViewOnly =
      !opts.isAdmin &&
      (task.status === "done-overdue" || (createdByAdmin && task.status === "done"));

    if (!hideDoneForResearcher) {
      actions.append(doneToggle);
    }
    if (restrictToViewOnly) {
      actions.append(viewBtn);
    } else {
      actions.append(commentBtn, attachBtn, viewBtn);
    }

    if (!restrictToViewOnly && editAllowed) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "submit-btn submit-btn--small";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openEditModal(task));
      actions.append(editBtn);
    }

    if (!restrictToViewOnly && extAllowed) {
      const extBtn = document.createElement("button");
      extBtn.type = "button";
      extBtn.className = "submit-btn submit-btn--small";
      extBtn.textContent = "Req Extension";
      extBtn.addEventListener("click", () => openActionModal(task, "extension"));
      actions.append(extBtn);
    }

    if (!restrictToViewOnly && deleteAllowed) {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn-logout submit-btn--small";
      deleteBtn.textContent = "Delete";
      deleteBtn.title = "Delete task";
      deleteBtn.addEventListener("click", async () => {
        const ok = await confirmPopup("Are you sure you want to delete the task?");
        if (ok) deleteTask(task.id);
      });
      actions.append(deleteBtn);
    }

    row.append(meta, actions);

    if (task.attachments && task.attachments.length) {
      const files = document.createElement("div");
      files.className = "task-row__attachments";
      task.attachments.forEach((att) => {
        const link = document.createElement("a");
        link.href = att.url;
        link.textContent = att.filename;
        link.target = "_blank";
        files.appendChild(link);
      });
      row.appendChild(files);
    }

    return row;
  };

  const mailUiState = {
    count: 0,
    fetched: false,
    folder: "inbox",
    polls: null,
    selected: new Set(),
    currentMailId: null,
    mails: [],
    seenMailIds: new Set(),
  };

  const renderMailBadge = (count) => {
    const btn = document.querySelector(".btn-mail");
    const badge = document.querySelector(".btn-mail__badge");
    if (!btn || !badge) return;
    if (count > 0) {
      badge.hidden = false;
      badge.textContent = count;
      btn.classList.add("btn-mail--attention");
    } else {
      badge.hidden = true;
      badge.textContent = "";
      btn.classList.remove("btn-mail--attention");
    }
  };

  const ensureMailToastStack = () => {
    let stack = document.querySelector(".mail-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "mail-toast-stack";
      document.body.appendChild(stack);
    }
    return stack;
  };

  const showMailToast = (mail) => {
    const stack = ensureMailToastStack();
    const toast = document.createElement("div");
    toast.className = "mail-toast";
    const title = document.createElement("strong");
    title.textContent = mail.subject || "New mail";
    const snippet = document.createElement("p");
    snippet.textContent = (mail.body || "").slice(0, 80);

    const actions = document.createElement("div");
    actions.className = "mail-toast__actions";
    const viewBtn = document.createElement("button");
    viewBtn.className = "submit-btn submit-btn--small";
    viewBtn.textContent = "View mail";
    viewBtn.addEventListener("click", () => {
      window.location.href = `/mails?open=${mail.id}`;
    });
    const markBtn = document.createElement("button");
    markBtn.className = "submit-btn submit-btn--small";
    markBtn.textContent = "Mark as read";
    markBtn.addEventListener("click", async () => {
      await mailApi.markRead([mail.id]);
      toast.remove();
      fetchUnreadMailCount();
    });
    const closeBtn = document.createElement("button");
    closeBtn.className = "ghost-btn";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => toast.remove());
    actions.append(viewBtn, markBtn, closeBtn);

    toast.append(title, snippet, actions);
    stack.appendChild(toast);
  };

  const confirmPopup = (message) => {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "confirm-overlay";
      const dialog = document.createElement("div");
      dialog.className = "confirm-dialog";
      const msg = document.createElement("p");
      msg.textContent = message;
      const actions = document.createElement("div");
      actions.className = "confirm-actions";
      const yes = document.createElement("button");
      yes.className = "btn-logout submit-btn--small";
      yes.textContent = "yes";
      const cancel = document.createElement("button");
      cancel.className = "submit-btn";
      cancel.textContent = "cancel";
      yes.addEventListener("click", () => {
        document.body.removeChild(overlay);
        resolve(true);
      });
      cancel.addEventListener("click", () => {
        document.body.removeChild(overlay);
        resolve(false);
      });
      actions.append(yes, cancel);
      dialog.append(msg, actions);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
    });
  };

  const fetchUnreadMailCount = async () => {
    const btn = document.querySelector(".btn-mail");
    if (!btn) return;
    const initial = Number(btn.dataset.unread || 0);
    mailUiState.count = initial;
    renderMailBadge(initial);
    try {
      const res = await fetch("/api/mails/unread_count", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = await res.json();
      const count = Number(data.count || 0);
      const newlyArrived = Math.max(count - mailUiState.count, 0);
      mailUiState.count = count;
      renderMailBadge(count);
      if (newlyArrived > 0 || (!mailUiState.fetched && count > 0)) {
        showMailToast(count);
      }
    } catch (err) {
      console.error(err);
    } finally {
      mailUiState.fetched = true;
    }
  };

  const mailApi = {
    async list(folder = "inbox") {
      const res = await fetch(`/api/mails?folder=${folder}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Mail list failed");
      return res.json();
    },
    async markRead(ids) {
      await fetch(`/api/mails/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "read" }),
      });
    },
    async delete(ids, opts = {}) {
      await fetch(`/api/mails/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: opts.purge ? "purge" : "delete" }),
      });
    },
    async restore(ids) {
      await fetch(`/api/mails/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "restore" }),
      });
    },
    async move(ids, target) {
      await fetch(`/api/mails/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "move", target }),
      });
    },
    async compose(payload) {
      const res = await fetch(`/api/mails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Compose failed");
      return res.json();
    },
  };

  const renderMailList = (mails) => {
    const list = document.getElementById("mailList");
    const detail = document.getElementById("mailDetail");
    if (!list) return;
    list.innerHTML = "";
    if (!mails.length) {
      list.innerHTML = `<div class="empty-state">No mails here.</div>`;
      detail.hidden = true;
      return;
    }
    mails.forEach((mail) => {
      const item = document.createElement("article");
      item.className = `mailbox__item ${
        mail.is_read ? "mailbox__item--read" : "mailbox__item--unread"
      }`;
      item.dataset.mailId = mail.id;
      item.draggable = true;
      item.addEventListener("dragstart", (e) => {
        const ids = mailUiState.selected.size
          ? [...mailUiState.selected]
          : [mail.id];
        e.dataTransfer.setData("text/plain", ids.join(","));
      });
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.addEventListener("change", (e) => {
        if (e.target.checked) mailUiState.selected.add(mail.id);
        else mailUiState.selected.delete(mail.id);
        item.classList.toggle("mailbox__item--selected", e.target.checked);
      });
      item.appendChild(cb);
      const main = document.createElement("div");
      main.className = "mailbox__item-main";
      const subj = document.createElement("div");
      subj.className = "mailbox__subject";
      subj.textContent = mail.subject;
      const snippet = document.createElement("div");
      snippet.className = "mailbox__snippet";
      snippet.textContent = (mail.body || "").slice(0, 80);
      const date = document.createElement("div");
      date.className = "mailbox__date";
      const jalali = formatJalaliDate((mail.created_at || "").slice(0, 10));
      date.textContent = jalali ? `تاریخ: ${jalali}` : "";
      main.append(subj, snippet, date);
      item.appendChild(main);
      const selectItem = (checked) => {
        cb.checked = checked;
        item.classList.toggle("mailbox__item--selected", checked);
        if (checked) mailUiState.selected.add(mail.id);
        else mailUiState.selected.delete(mail.id);
      };

      item.addEventListener("click", async (e) => {
        if (e.target.tagName.toLowerCase() === "input") return;
        selectItem(true);
        await openMailDetail(mail);
        // update inline styles to reflect read state
        item.classList.remove("mailbox__item--unread");
        item.classList.add("mailbox__item--read");
        subj.style.fontWeight = "600";
      });

      if (mailUiState.selected.has(mail.id)) {
        cb.checked = true;
        item.classList.add("mailbox__item--selected");
      }
      list.appendChild(item);
    });
  };

  const openMailDetail = async (mail) => {
    const detail = document.getElementById("mailDetail");
    const subj = document.getElementById("mailDetailSubject");
    const meta = document.getElementById("mailDetailMeta");
    const body = document.getElementById("mailDetailBody");
    if (!detail || !subj || !meta || !body) return;
    subj.textContent = mail.subject;
    const jalaliDate = formatJalaliDate((mail.created_at || "").slice(0, 10));
    const dateText = jalaliDate
      ? `تاریخ ثبت: ${jalaliDate}`
      : (mail.created_at || "").replace("T", " ").slice(0, 16);
    meta.textContent = `${mail.sender || "System"} • ${dateText}`;
    body.textContent = mail.body;
    detail.hidden = false;
    mailUiState.currentMailId = mail.id;
    if (!mail.is_read) {
      await mailApi.markRead([mail.id]);
      mail.is_read = true;
      // keep local cache in sync without forcing a re-render to preserve selections
      mailUiState.mails = (mailUiState.mails || []).map((m) =>
        m.id === mail.id ? { ...m, is_read: true } : m
      );
      fetchUnreadMailCount();
    }
  };

  const refreshMails = async (showToast = true) => {
    const list = document.getElementById("mailList");
    const hadData = mailUiState.mails && mailUiState.mails.length;
    if (list && !hadData) list.innerHTML = `<div class="empty-state">Loading…</div>`;
    try {
      const prevMails = mailUiState.mails || [];
      const prevIds = prevMails.map((m) => m.id);
      const currentIndex = mailUiState.currentMailId
        ? prevIds.indexOf(mailUiState.currentMailId)
        : -1;
      const mails = await mailApi.list(mailUiState.folder);
      mailUiState.mails = mails;
      if (mailUiState.folder === "inbox") {
        mails.forEach((m) => {
          if (!mailUiState.seenMailIds.has(m.id)) {
            mailUiState.seenMailIds.add(m.id);
            if (!m.is_read) showMailToast(m);
          }
        });
      }
      renderMailList(mails);
      if (showToast) fetchUnreadMailCount();
      if (mailUiState.currentMailId) {
        const stillHere = mails.find((m) => m.id === mailUiState.currentMailId);
        if (stillHere) {
          openMailDetail(stillHere);
        } else {
          const nextMail =
            mails[currentIndex] || mails[currentIndex - 1] || mails[0];
          if (nextMail) {
            openMailDetail(nextMail);
          } else {
            const detail = document.getElementById("mailDetail");
            if (detail) detail.hidden = true;
            mailUiState.currentMailId = null;
          }
        }
      }
    } catch (err) {
      if (list) list.innerHTML = `<div class="empty-state">Could not load mails.</div>`;
    }
  };

  const initMailboxPage = () => {
    if (!document.querySelector(".mailbox-page")) return;
    const navBtns = document.querySelectorAll(".mailbox__nav-btn");
    const dropTargets = document.querySelectorAll("[data-folder='trash'], [data-folder='saved'], [data-folder='inbox']");
    dropTargets.forEach((btn) => {
      btn.addEventListener("dragover", (e) => {
        e.preventDefault();
        btn.classList.add("active");
      });
      btn.addEventListener("dragleave", () => btn.classList.remove("active"));
      btn.addEventListener("drop", async (e) => {
        e.preventDefault();
        btn.classList.remove("active");
        const data = e.dataTransfer.getData("text/plain") || "";
        const ids = data
          .split(",")
          .map((n) => Number(n))
          .filter((n) => Number.isFinite(n));
        if (!ids.length) return;
        const target = btn.dataset.folder;
        // Restrict moves based on current folder
        const allowed = ["trash", "saved", "inbox"];
        if (!allowed.includes(target)) return;
        await mailApi.move(ids, target === "saved" ? "saved" : target);
        await refreshMails(false);
        fetchUnreadMailCount();
      });
    });
    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        mailUiState.folder = btn.dataset.folder;
        refreshMails();
        highlightActiveFolder();
      });
    });
    const highlightActiveFolder = () => {
      navBtns.forEach((b) => {
        const isActive = b.dataset.folder === mailUiState.folder;
        b.classList.toggle("active", isActive);
      });
    };
    highlightActiveFolder();
    const refreshBtn = document.getElementById("refreshMails");
    refreshBtn?.addEventListener("click", () => refreshMails(false));
    const selectAllBtn = document.getElementById("toggleSelectAll");
    selectAllBtn?.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(".mailbox__item input[type='checkbox']");
      const total = checkboxes.length;
      const selectedCount = mailUiState.selected.size;
      const shouldSelectAll = selectedCount !== total;
      mailUiState.selected.clear();
      checkboxes.forEach((cb) => {
        cb.checked = shouldSelectAll;
        const id = Number(cb.closest(".mailbox__item")?.dataset.mailId);
        const item = cb.closest(".mailbox__item");
        if (shouldSelectAll && id) mailUiState.selected.add(id);
        item?.classList.toggle("mailbox__item--selected", shouldSelectAll);
      });
    });
    const markRead = document.getElementById("markRead");
    markRead?.addEventListener("click", async () => {
      if (!mailUiState.selected.size) return;
      await mailApi.markRead([...mailUiState.selected]);
      await refreshMails(false);
      fetchUnreadMailCount();
    });
    const delBtn = document.getElementById("deleteMails");
    delBtn?.addEventListener("click", async () => {
      let targets = [...mailUiState.selected];
      if (!targets.length && mailUiState.currentMailId) {
        targets = [mailUiState.currentMailId];
      }
      if (!targets.length) return;
      if (mailUiState.folder === "trash") {
        const confirmed = await confirmPopup("delete the selected mails permanently?");
        if (!confirmed) return;
        await mailApi.delete(targets, { purge: true });
      } else {
        await mailApi.delete(targets);
      }
      mailUiState.selected.clear();
      await refreshMails(false);
      fetchUnreadMailCount();
    });
    const restoreBtn = document.getElementById("restoreMails");
    restoreBtn?.addEventListener("click", async () => {
      if (mailUiState.folder !== "trash") return;
      let targets = [...mailUiState.selected];
      if (!targets.length && mailUiState.currentMailId) {
        targets = [mailUiState.currentMailId];
      }
      if (!targets.length) return;
      await mailApi.restore(targets);
      mailUiState.selected.clear();
      await refreshMails(false);
      fetchUnreadMailCount();
    });
    const composePanel = document.getElementById("composePanel");
    const composeBtn = document.getElementById("composeBtn");
    const composeCancel = document.getElementById("composeCancel");
    const composeForm = document.getElementById("composeForm");
    composeBtn?.addEventListener("click", () => {
      composePanel.hidden = false;
    });
    composeCancel?.addEventListener("click", () => {
      if (composePanel) composePanel.hidden = true;
    });
    composeForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(composeForm);
      const payload = {
        recipient_id: Number(fd.get("recipient_id")),
        subject: fd.get("subject"),
        body: fd.get("body"),
        is_draft: false,
      };
      try {
        await mailApi.compose(payload);
        composeForm.reset();
        composePanel.hidden = true;
        await refreshMails(false);
      } catch {
        alert("Could not send mail.");
      }
    });
    mailUiState.polls = setInterval(() => {
      refreshMails(false);
      fetchUnreadMailCount();
    }, 10000);
    const params = new URLSearchParams(window.location.search || "");
    const openId = Number(params.get("open"));
    if (openId) mailUiState.currentMailId = openId;
    refreshMails(false);
    fetchUnreadMailCount();
  };

  const renderTasksPanel = (container, tasks, opts) => {
    if (!container) return;
    container.innerHTML = "";
    const filterKey = (container.dataset.taskFilter || "active").toLowerCase();
    const doneLike = (s) => ["done", "done-overdue"].includes((s || "").toLowerCase());
    const filters = {
      active: (t) => !t.overdue && !doneLike(t.status),
      overdue: (t) => t.overdue && !doneLike(t.status),
      done: (t) => doneLike(t.status),
    };
    const emptyCopy = {
      active: "No active tasks.",
      overdue: "No overdue tasks 🎉",
      done: "No completed tasks yet.",
    };
    const subset = tasks.filter(filters[filterKey] || (() => true));
    if (!subset.length) {
      const p = document.createElement("p");
      p.className = "empty-state";
      p.textContent = emptyCopy[filterKey] || "No tasks.";
      container.appendChild(p);
      return;
    }
    subset.forEach((task) => container.appendChild(renderTaskRow(task, opts)));
  };

  const fetchTasks = async (isAdmin) => {
    const res = await fetch(`/api/tasks${isAdmin ? "?all=1" : ""}`, {
      credentials: "same-origin",
      cache: "no-cache",
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return [];
    }
    if (!res.ok) throw new Error("Failed to load tasks");
    return await res.json();
  };

  const updateTaskStatus = async (taskId, status) => {
    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not update task status.");
      await reloadTasks();
      return;
    }
    await reloadTasks();
  };

  const deleteTask = async (taskId) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      await reloadTasks();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not delete task.");
    }
  };

  const triggerAttach = (taskId) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/tasks/${taskId}/attach`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Attachment failed.");
      }
      await reloadTasks();
      document.body.removeChild(fileInput);
    });
    fileInput.click();
  };

  const ensureCalendars = (map) => {
    if (!taskStore.calendars.length) {
      taskStore.calendars = initDualCalendars(map);
    } else {
      taskStore.calendars.forEach((cal) => cal.setTasks(map));
    }
  };

  const reloadTasks = async () => {
    const panels = document.querySelectorAll('[data-role="tasks-panel"]');
    if (!panels.length) return;
    try {
      const tasks = await fetchTasks(taskStore.isAdmin);
      taskStore.list = tasks;
      taskStore.map = buildTaskMap(tasks);
      panels.forEach((panel) =>
        renderTasksPanel(panel, tasks, { isAdmin: taskStore.isAdmin })
      );
      const doneLike = (s) => ["done", "done-overdue"].includes((s || "").toLowerCase());
      const overdueCount = tasks.filter(
        (t) => t.overdue && !doneLike(t.status)
      ).length;
      const activeCount = tasks.filter(
        (t) => !t.overdue && !doneLike(t.status)
      ).length;
      document
        .querySelectorAll("[data-overdue-badge]")
        .forEach((badge) => {
          if (overdueCount > 0) {
            badge.textContent = overdueCount;
            badge.hidden = false;
          } else {
            badge.hidden = true;
          }
        });
      document.querySelectorAll("[data-active-badge]").forEach((badge) => {
        if (activeCount > 0) {
          badge.textContent = activeCount;
          badge.hidden = false;
        } else {
          badge.hidden = true;
        }
      });
      ensureCalendars(taskStore.map);
    } catch (err) {
      panels.forEach((panel) => {
        panel.innerHTML = `<p class="empty-state">Could not load tasks.</p>`;
      });
      ensureCalendars(taskStore.map);
      console.error(err);
    }
  };

  const applyTaskUpdate = (updatedTask) => {
    if (!updatedTask) return;
    const idx = taskStore.list.findIndex((t) => t.id === updatedTask.id);
    if (idx !== -1) {
      taskStore.list[idx] = updatedTask;
      taskStore.map = buildTaskMap(taskStore.list);
      const panels = document.querySelectorAll('[data-role="tasks-panel"]');
      panels.forEach((panel) =>
        renderTasksPanel(panel, taskStore.list, { isAdmin: taskStore.isAdmin })
      );
      ensureCalendars(taskStore.map);
    }
  };

  const initTaskForm = () => {
    const form = document.querySelector('[data-role="task-form"]');
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const assignedRaw = formData.get("assigned_to_id");
      const payload = {
        title: formData.get("title"),
        due_date: formData.get("due_date"),
        assigned_to_id:
          assignedRaw === "all_researchers" ? "all_researchers" : Number(assignedRaw),
        description: formData.get("description") || null,
        recurrence_type: formData.get("recurrence_type") || "one_time",
      };
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not create task.");
        return;
      }
      form.reset();
      await reloadTasks();
    });
  };

  const ensureModal = () => {
    if (taskStore.modal) return;
    taskStore.modal = document.getElementById("taskModal");
    taskStore.modalContent = document.getElementById("taskModalContent");
    taskStore.modalClose = document.getElementById("taskModalClose");
    taskStore.modalClose?.addEventListener("click", closeTaskModal);
    taskStore.modal?.addEventListener("click", (e) => {
      if (e.target === taskStore.modal) closeTaskModal();
    });
  };

  const closeTaskModal = () => {
    if (taskStore.modal) taskStore.modal.classList.remove("open");
  };

  const openDayModal = (jy, jm, jd, tasksForDay) => {
    ensureModal();
    if (!taskStore.modal || !taskStore.modalContent) return;
    taskStore.modalContent.innerHTML = "";
    const card = document.createElement("div");
    card.className = "task-modal-card dashboard-card";

    const dateLabel = document.createElement("div");
    dateLabel.className = "task-row__date";
    dateLabel.textContent = `تاریخ: ${dualCalUtils.toPersianDigits(
      jd
    )} ${dualCalUtils.persianMonthName(jm)} ${dualCalUtils.toPersianDigits(jy)}`;
    card.appendChild(dateLabel);

    const list = document.createElement("div");
    list.className = "modal-task-list modal-task-list--day";
    if (tasksForDay && tasksForDay.length) {
      tasksForDay.forEach((t) => {
        const row = document.createElement("div");
        row.className = "task-row slim task-row--mini";
        const title = document.createElement("div");
        title.className = "task-row__title";
        title.textContent = t.title;
        const meta = document.createElement("small");
        meta.className = "task-row__date";
        meta.textContent = `تاریخ سررسید: ${t._jalaliDisplay || formatJalaliDate(t.due_date) || ""}`;
        const status = document.createElement("small");
        status.className = "task-row__assignee";
        status.textContent = t.status === "done" ? "✔ تایید شده" : t.approval_pending ? "در انتظار تایید" : "فعال";
        row.append(title, meta, status);
        row.addEventListener("click", () =>
          openViewModal(t, { type: "day", jy, jm, jd, tasks: tasksForDay })
        );
        list.appendChild(row);
      });
    } else {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No tasks for this day.";
      list.appendChild(empty);
    }
    card.appendChild(list);

    const actions = document.createElement("div");
    actions.className = "task-modal-actions";
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "submit-btn";
    addBtn.textContent = "Add Task";
    addBtn.addEventListener("click", () => {
      closeTaskModal();
      openTaskModal(jy, jm, jd);
    });
    const viewAny = document.createElement("button");
    viewAny.type = "button";
    viewAny.className = "submit-btn";
    viewAny.textContent = "Details";
    viewAny.disabled = !tasksForDay || !tasksForDay.length;
    viewAny.addEventListener("click", () => {
      const first = tasksForDay && tasksForDay[0];
      if (first) openViewModal(first);
    });
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "ghost-btn ghost-btn--inline";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", closeTaskModal);
    actions.append(addBtn, viewAny, closeBtn);
    card.appendChild(actions);

    taskStore.modalContent.appendChild(card);
    taskStore.modal.classList.add("open");
  };

  const openTaskModal = (jy, jm, jd) => {
    ensureModal();
    if (!taskStore.modal || !taskStore.modalContent) return;
    const g = dualCalUtils.jalaliToGregorian(jy, jm, jd);
    const due_date = `${g.year}-${String(g.month).padStart(2, "0")}-${String(
      g.day
    ).padStart(2, "0")}`;

    taskStore.modalContent.innerHTML = "";
    const card = document.createElement("div");
    card.className = "task-modal-card dashboard-card";

    const heading = document.createElement("h3");
    heading.textContent = `تاریخ: ${dualCalUtils.toPersianDigits(
      jd
    )} ${dualCalUtils.persianMonthName(jm)} ${dualCalUtils.toPersianDigits(jy)}`;
    card.appendChild(heading);

    const form = document.createElement("form");
    form.className = "task-modal-form";
    form.innerHTML = `
      <input type="text" name="title" placeholder="Task title" required />
      <textarea name="description" rows="3" placeholder="Task description"></textarea>
      ${
        taskStore.isAdmin
          ? `<select name="assigned_to_id" required>
               <option value="all_researchers">Assign to all researchers</option>
               ${taskStore.assignees
                 .map((u) => `<option value="${u.id}">${u.username}</option>`)
                 .join("")}
             </select>`
          : `<input type="hidden" name="assigned_to_id" value="${
              taskStore.currentUserId || ""
            }">`
      }
      <select name="recurrence_type">
        <option value="one_time">One time</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <input type="file" name="attachment" aria-label="Attachment" />
    `;

    const actions = document.createElement("div");
    actions.className = "task-modal-actions";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "submit-btn";
    submit.textContent = "Save Task";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "ghost-btn ghost-btn--inline";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", closeTaskModal);
    actions.append(submit, cancel);

    form.appendChild(actions);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const assignedRaw = fd.get("assigned_to_id");
      const payload = {
        title: fd.get("title"),
        description: fd.get("description") || null,
        assigned_to_id: taskStore.isAdmin
          ? assignedRaw === "all_researchers"
            ? "all_researchers"
            : Number(assignedRaw) || taskStore.currentUserId
          : taskStore.currentUserId,
        due_date,
        recurrence_type: fd.get("recurrence_type") || "one_time",
      };
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not create task.");
        return;
      }
      const created = await res.json();
      const attachFile = fd.get("attachment");
      if (attachFile && attachFile.size) {
        const formData = new FormData();
        formData.append("file", attachFile);
        await fetch(`/api/tasks/${created.id}/attach`, { method: "POST", body: formData });
      }
      closeTaskModal();
      await reloadTasks();
    });

    card.appendChild(form);
    taskStore.modalContent.appendChild(card);
    taskStore.modal.classList.add("open");
  };

  const openActionModal = (task, mode) => {
    ensureModal();
    if (!taskStore.modal || !taskStore.modalContent) return;
    const titleText = mode === "comment" ? "Add Comment" : "Request Extension";
    const placeholder = mode === "comment" ? "Write your comment" : "Describe your extension request";

    taskStore.modalContent.innerHTML = "";
    const card = document.createElement("div");
    card.className = "task-modal-card dashboard-card";

    const heading = document.createElement("h3");
    heading.textContent = `${titleText} - ${task.title}`;
    card.appendChild(heading);

    const form = document.createElement("form");
    form.className = "task-modal-form";
    form.innerHTML = `
      <textarea name="details" rows="4" placeholder="${placeholder}"></textarea>
    `;

    const actions = document.createElement("div");
    actions.className = "task-modal-actions";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "submit-btn";
    submit.textContent = "Submit";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "submit-btn submit-btn--small";
    cancel.textContent = "Close";
    cancel.addEventListener("click", closeTaskModal);
    actions.append(submit, cancel);

    form.appendChild(actions);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      closeTaskModal();
      alert(`${titleText} submitted.`);
    });

    card.appendChild(form);
    taskStore.modalContent.appendChild(card);
    taskStore.modal.classList.add("open");
  };

  const openViewModal = async (task, origin) => {
    ensureModal();
    if (!taskStore.modal || !taskStore.modalContent) return;
    const assigneeId =
      task.assigned_to?.id || task.assigned_to?.assigned_to_id || task.assigned_to_id;
    const isAssignee =
      assigneeId && taskStore.currentUserId && assigneeId === taskStore.currentUserId;
    if (isAssignee && task.view_status !== "seen") {
      try {
        const res = await fetch(`/api/tasks/${task.id}/seen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const updated = await res.json().catch(() => null);
          if (updated) {
            task = updated;
            applyTaskUpdate(updated);
          }
        }
      } catch (err) {
        /* ignore notify failure; UI remains open */
      }
    }
    taskStore.modalContent.innerHTML = "";
    const card = document.createElement("div");
    card.className = "task-modal-card dashboard-card";

    const heading = document.createElement("h3");
    heading.textContent = `${task.title}`;
    card.appendChild(heading);

    const metaBlock = document.createElement("div");
    metaBlock.className = "task-detail-list";
    const addRow = (label, val, fallback) => {
      const row = document.createElement("div");
      row.className = "task-detail-row";
      const text = `${label}: ${val || fallback || "نامشخص"}`;
      row.textContent = text;
      metaBlock.appendChild(row);
    };
    addRow("توضیحات", task.description || "ندارد");
    addRow("تاریخ ثبت", formatJalaliDateTime(task.created_at));
    addRow("تاریخ سررسید", task._jalaliDisplay || formatJalaliDate(task.due_date));
    addRow("تاریخ مشاهده", formatJalaliDateTime(task.viewed_at), "هنوز دیده نشده است");
    addRow("تاریخ ارسال برای تایید", formatJalaliDateTime(task.submitted_at), "هنوز ارسال نشده است");
    addRow("تاریخ تایید", formatJalaliDateTime(task.approved_at), "هنوز تایید نشده است");
    addRow("نوع تکرار", task.recurrence_type || "یکبار");
    addRow(
      "وضعیت",
      task.status === "done" ? "انجام شده" : task.approval_pending ? "در انتظار تایید" : "فعال"
    );
    if (task.assigned_to?.username) addRow("مسئول", task.assigned_to.username);
    if (task.created_by?.username) addRow("ایجاد کننده", task.created_by.username);

    if (task.attachments && task.attachments.length) {
      const files = document.createElement("div");
      files.className = "task-detail-files";
      const label = document.createElement("div");
      label.className = "task-detail-label";
      label.textContent = "فایل‌ها";
      files.appendChild(label);
      task.attachments.forEach((att) => {
        const link = document.createElement("a");
        link.href = att.url;
        link.target = "_blank";
        link.textContent = att.filename;
        files.appendChild(link);
      });
      metaBlock.appendChild(files);
    }
    card.appendChild(metaBlock);

    const actions = document.createElement("div");
    actions.className = "task-modal-actions";
    if (origin && origin.type === "day") {
      const backBtn = document.createElement("button");
      backBtn.type = "button";
      backBtn.className = "ghost-btn";
      backBtn.textContent = "Back";
      backBtn.addEventListener("click", () => openDayModal(origin.jy, origin.jm, origin.jd, origin.tasks));
      actions.append(backBtn);
    }
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "submit-btn submit-btn--small";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", closeTaskModal);
    actions.append(closeBtn);
    card.appendChild(actions);

    taskStore.modalContent.appendChild(card);
    taskStore.modal.classList.add("open");
  };

  const openEditModal = (task) => {
    ensureModal();
    if (!taskStore.modal || !taskStore.modalContent) return;
    taskStore.modalContent.innerHTML = "";
    const card = document.createElement("div");
    card.className = "task-modal-card dashboard-card";

    const heading = document.createElement("h3");
    heading.textContent = `Edit Task - ${task.title}`;
    card.appendChild(heading);

    const jalaliVal = isoToJalaliString(task.due_date || "");

    const form = document.createElement("form");
    form.className = "task-modal-form";
    form.innerHTML = `
      <input type="text" name="title" value="${task.title}" placeholder="Task title" required />
      <textarea name="description" rows="3" placeholder="Task description">${task.description || ""}</textarea>
      <input type="text" name="due_date_j" value="${jalaliVal}" placeholder="YYYY-MM-DD (Jalali)" />
    `;

    const actions = document.createElement("div");
    actions.className = "task-modal-actions";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "submit-btn";
    submit.textContent = "Save";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "submit-btn submit-btn--small";
    cancel.textContent = "Close";
    cancel.addEventListener("click", closeTaskModal);
    actions.append(submit, cancel);

    form.appendChild(actions);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const jalaliInput = (fd.get("due_date_j") || "").trim();
      let dueIso = null;
      if (jalaliInput) {
        dueIso = jalaliToIsoString(jalaliInput);
        if (!dueIso) {
          alert("تاریخ نامعتبر است. قالب: YYYY-MM-DD (جلالی)");
          return;
        }
      }
      const payload = {
        title: fd.get("title"),
        description: fd.get("description") || null,
        due_date: dueIso,
      };
      const res = await fetch(`/api/tasks/${task.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not edit task.");
        return;
      }
      closeTaskModal();
      await reloadTasks();
    });

    card.appendChild(form);
    taskStore.modalContent.appendChild(card);
    taskStore.modal.classList.add("open");
  };

  const projectTreeStore = {
    nodes: [],
    lookup: new Map(),
    container: null,
    adminPanel: null,
    assignees: [],
    canEdit: false,
  };

  const getSelectedAssigneeIds = (select) =>
    Array.from(select?.selectedOptions || [])
      .map((o) => o.value)
      .filter((v) => v !== "");

  const normalizeAssignees = (raw = []) =>
    raw
      .filter((u) => u && (u.id !== undefined || u.username))
      .map((u) => ({
        id: Number(u.id),
        username: u.username || "",
        full_name: u.full_name || "",
        role: u.role || "",
      }));

  const treeAssigneesFromDom = () => {
    const panel = document.querySelector("[data-project-tree-admin]");
    const fallback = Array.isArray(window.taskAssignees) ? window.taskAssignees : [];
    if (!panel || !panel.dataset.treeAssignees) {
      return normalizeAssignees(fallback);
    }
    try {
      return normalizeAssignees(JSON.parse(panel.dataset.treeAssignees));
    } catch {
      return normalizeAssignees(fallback);
    }
  };

  const buildProjectTree = (nodes = []) => {
    const clones = nodes.map((n) => {
      const normalizedAssignees =
        Array.isArray(n.assignees) && n.assignees.length
          ? normalizeAssignees(n.assignees)
          : n.researcher
          ? normalizeAssignees([n.researcher])
          : [];
      const primaryAssigneeId =
        normalizedAssignees[0]?.id ??
        (n.researcher_id === null || n.researcher_id === undefined
          ? null
          : Number(n.researcher_id));
      return {
        ...n,
        id: Number(n.id),
        parent_id:
          n.parent_id === null || n.parent_id === undefined
            ? null
            : Number(n.parent_id),
        researcher_id: primaryAssigneeId,
        researcher: normalizedAssignees[0] || null,
        assignees: normalizedAssignees,
        assignee_ids: normalizedAssignees.map((a) => a.id).filter((id) => Number.isFinite(id)),
        children: [],
      };
    });
    const byId = new Map();
    clones.forEach((n) => byId.set(n.id, n));
    const roots = [];
    clones.forEach((n) => {
      const parent = byId.get(n.parent_id);
      if (parent) parent.children.push(n);
      else roots.push(n);
    });
    return { roots, byId };
  };

  const populateResearcherSelects = () => {
    if (!projectTreeStore.adminPanel) return;
    const branchSelect = projectTreeStore.adminPanel.querySelector("[data-tree-researcher]");
    const editSelect = projectTreeStore.adminPanel.querySelector("[data-tree-researcher-edit]");
    const options = projectTreeStore.assignees || [];
    const trunkSelect = projectTreeStore.adminPanel.querySelector("[data-tree-researcher-trunk]");
    const fillMulti = (select, opts) => {
      if (!select) return;
      select.multiple = true;
      select.size = Math.max(3, Math.min(6, (options && options.length) || 4));
      const prev = Array.from(select.selectedOptions).map((o) => o.value);
      select.innerHTML = opts.join("");
      options.forEach((u) => {
        const label = u.full_name || u.username || `User ${u.id}`;
        const opt = new Option(label, u.id);
        select.appendChild(opt);
      });
      prev.forEach((v) => {
        const opt = Array.from(select.options).find((o) => o.value === v);
        if (opt) opt.selected = true;
      });
    };
    fillMulti(
      branchSelect,
      ['<option value="" disabled>اختیاری: محقق مسئول (چند انتخاب)</option>']
    );
    fillMulti(
      trunkSelect,
      ['<option value="" disabled>اختیاری: محقق مسئول (چند انتخاب)</option>']
    );
    fillMulti(
      editSelect,
      ['<option value="" disabled>انتخاب مسئولین (چند انتخاب)</option>']
    );
  };

  const populateParentOptions = (select, opts = {}) => {
    if (!select) return;
    const prev = select.value;
    const { includePlaceholder = false, includeKeep = false, includeRoot = true } = opts;
    select.innerHTML = "";
    if (includeKeep) {
      const keepOpt = new Option("Keep parent", "__keep");
      select.appendChild(keepOpt);
    }
    if (includePlaceholder) {
      const placeholder = new Option("Choose parent trunk", "");
      placeholder.disabled = false;
      select.appendChild(placeholder);
    }
    if (!includeKeep && includeRoot) {
      const rootOpt = new Option("Main trunk", "");
      select.appendChild(rootOpt);
    }
    projectTreeStore.nodes.forEach((n) => {
      const opt = new Option(n.name, n.id);
      select.appendChild(opt);
    });
    select.value = prev;
  };

  const populateNodeSelect = () => {
    if (!projectTreeStore.adminPanel) return;
    const nodeSelect = projectTreeStore.adminPanel.querySelector("[data-tree-node]");
    if (!nodeSelect) return;
    const prev = nodeSelect.value;
    nodeSelect.innerHTML = '<option value="">Select node to edit</option>';
    projectTreeStore.nodes.forEach((n) => {
      const label = `${n.name}${n.parent_id ? " (شاخه)" : " (پروژه اصلی)"}`;
      const opt = new Option(label, n.id);
      nodeSelect.appendChild(opt);
    });
    nodeSelect.value = prev;
  };

  const refreshTreeAdminControls = () => {
    if (!projectTreeStore.adminPanel) return;
    populateResearcherSelects();
    populateParentOptions(
      projectTreeStore.adminPanel.querySelector("[data-tree-parent]"),
      { includePlaceholder: true, includeRoot: false }
    );
    populateParentOptions(
      projectTreeStore.adminPanel.querySelector("[data-tree-parent-edit]"),
      { includeKeep: true }
    );
    populateNodeSelect();
  };

  const prefillBranchForm = (parentId) => {
    if (!projectTreeStore.adminPanel) return;
    const form = projectTreeStore.adminPanel.querySelector('[data-tree-form="branch"]');
    const parentSelect = projectTreeStore.adminPanel.querySelector("[data-tree-parent]");
    if (parentSelect) {
      parentSelect.value = parentId || "";
    }
    if (form) {
      const nameInput = form.querySelector('input[name="name"]');
      if (nameInput) nameInput.focus();
      form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const prefillEditForm = (nodeId) => {
    if (!projectTreeStore.adminPanel) return;
    const node = projectTreeStore.lookup.get(Number(nodeId));
    if (!node) return;
    const form = projectTreeStore.adminPanel.querySelector('[data-tree-form="edit"]');
    const nodeSelect = projectTreeStore.adminPanel.querySelector("[data-tree-node]");
    const parentSelect = projectTreeStore.adminPanel.querySelector("[data-tree-parent-edit]");
    const researcherSelect = projectTreeStore.adminPanel.querySelector("[data-tree-researcher-edit]");
    const appendToggle = projectTreeStore.adminPanel.querySelector("[data-tree-append-assignees]");
    if (nodeSelect) nodeSelect.value = String(node.id);
    if (form) {
      const nameInput = form.querySelector('input[name="name"]');
      if (nameInput) nameInput.value = node.name || "";
    }
    if (parentSelect) {
      parentSelect.value = node.parent_id === null || node.parent_id === undefined ? "" : String(node.parent_id);
      parentSelect.querySelectorAll("option").forEach((opt) => {
        opt.disabled = opt.value && Number(opt.value) === node.id;
      });
    }
    if (researcherSelect) {
      const values = (node.assignees || []).map((a) => String(a.id));
      Array.from(researcherSelect.options).forEach((opt) => {
        opt.selected = values.includes(opt.value);
      });
    }
    if (appendToggle) appendToggle.checked = true;
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const focusRosterCard = (userId) => {
    if (!userId) return;
    const rosterSection = document.querySelector("[data-team-roster]");
    const card = document.querySelector(`[data-user-card="${userId}"]`);
    const target = card || rosterSection;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (card) {
      card.classList.remove("is-blinking");
      // Force reflow so the animation can restart
      // eslint-disable-next-line no-unused-expressions
      card.offsetHeight;
      card.classList.add("is-blinking");
      setTimeout(() => card.classList.remove("is-blinking"), 2000);
    }
  };

  const renderAssignees = (node) => {
    const wrap = document.createElement("div");
    wrap.className = "tree-node__meta";
    const addChip = (label, cls = "tree-chip", userId = null) => {
      const chip = document.createElement("span");
      chip.className = cls;
      const dot = document.createElement("span");
      dot.className = "tree-chip__dot";
      const txt = document.createElement("span");
      txt.textContent = label;
      chip.append(dot, txt);
      if (userId) {
        chip.dataset.userId = String(userId);
        chip.classList.add("tree-chip--clickable");
        chip.addEventListener("click", (e) => {
          e.preventDefault();
          focusRosterCard(userId);
        });
      }
      wrap.appendChild(chip);
    };
    const list =
      Array.isArray(node.assignees) && node.assignees.length
        ? node.assignees
        : node.researcher
        ? [node.researcher]
        : [];
    if (!list.length) {
      addChip("بدون مسئول", "tree-chip tree-chip--unassigned");
    } else {
      list.forEach((a) => addChip(a.full_name || a.username || "مسئول", "tree-chip", a.id));
    }
    return wrap;
  };

  const buildParentSelect = (currentId, parentId) => {
    const select = document.createElement("select");
    const rootOpt = new Option("پروژه اصلی", "");
    select.appendChild(rootOpt);
    projectTreeStore.nodes.forEach((n) => {
      if (n.id === currentId) return;
      const opt = new Option(n.name, n.id);
      if (Number(parentId) === n.id) opt.selected = true;
      select.appendChild(opt);
    });
    return select;
  };

  const buildResearcherSelect = (selectedIds = []) => {
    const select = document.createElement("select");
    select.multiple = true;
    select.size = Math.max(3, Math.min(6, (projectTreeStore.assignees || []).length || 4));
    const selectedSet = new Set((selectedIds || []).map((id) => String(id)));
    projectTreeStore.assignees.forEach((u) => {
      const label = u.full_name || u.username || `User ${u.id}`;
      const opt = new Option(label, u.id);
      if (selectedSet.has(String(u.id))) opt.selected = true;
      select.appendChild(opt);
    });
    return select;
  };

  const openInlineEditor = (node, opts = {}) => {
    if (!projectTreeStore.canEdit) return;
    const target = opts.container || projectTreeStore.container;
    if (!target) return;
    target.querySelectorAll(".tree-inline-editor").forEach((el) => el.remove());

    const editor = document.createElement("div");
    editor.className = "tree-inline-editor";

    const nameRow = document.createElement("div");
    nameRow.className = "tree-inline-editor__row";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "نام پروژه / شاخه";
    nameInput.value = node?.name || "";
    nameRow.appendChild(nameInput);
    editor.appendChild(nameRow);

    const parentRow = document.createElement("div");
    parentRow.className = "tree-inline-editor__row";
    const parentLabel = document.createElement("span");
    parentLabel.textContent = "والد:";
    const parentSelect = buildParentSelect(node?.id, node?.parent_id ?? null);
    parentRow.append(parentLabel, parentSelect);
    editor.appendChild(parentRow);

    const resRow = document.createElement("div");
    resRow.className = "tree-inline-editor__row";
    const resLabel = document.createElement("span");
    resLabel.textContent = "مسئولین:";
    const resSelect = buildResearcherSelect(
      Array.isArray(node?.assignees) ? node.assignees.map((a) => a.id) : []
    );
    resRow.append(resLabel, resSelect);
    editor.appendChild(resRow);

    const actions = document.createElement("div");
    actions.className = "tree-inline-editor__row";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "submit-btn submit-btn--small";
    saveBtn.textContent = node && node.id ? "بروزرسانی" : "ذخیره";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "ghost-btn";
    cancelBtn.textContent = "بستن";
    cancelBtn.addEventListener("click", () => editor.remove());
    actions.append(saveBtn, cancelBtn);
    editor.appendChild(actions);

    saveBtn.addEventListener("click", async () => {
      const payload = {
        name: (nameInput.value || "").trim(),
        parent_id: parentSelect.value || null,
        assignee_ids: getSelectedAssigneeIds(resSelect),
      };
      if (!payload.name) {
        alert("نام را وارد کنید.");
        return;
      }
      const url = node && node.id ? `/api/project-tree/${node.id}` : "/api/project-tree";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "خطا در ذخیره.");
        return;
      }
      editor.remove();
      loadProjectTree();
    });

    target.appendChild(editor);
  };

  const renderTreeNode = (node) => {
    const wrapper = document.createElement("div");
    wrapper.className = "tree-node";
    wrapper.dataset.nodeId = node.id;

    const head = document.createElement("div");
    head.className = "tree-node__head";

    const title = document.createElement("div");
    title.className = "tree-node__title";
    title.textContent = node.name;
    const badge = document.createElement("span");
    badge.className = "tree-node__badge";
    badge.textContent = node.parent_id ? "شاخه" : "پروژه اصلی";
    title.appendChild(badge);
    head.appendChild(title);

    if (projectTreeStore.canEdit) {
      const actions = document.createElement("div");
      actions.className = "tree-node__actions";
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "tree-action";
      addBtn.textContent = "+ شاخه";
      addBtn.addEventListener("click", () =>
        openInlineEditor(
          { id: null, name: "", parent_id: node.id, assignees: [] },
          { isCreate: true, container: wrapper }
        )
      );
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "tree-action";
      editBtn.textContent = "ویرایش";
      editBtn.addEventListener("click", () => openInlineEditor(node, { container: wrapper }));
      actions.append(addBtn, editBtn);
      head.appendChild(actions);
    }

    wrapper.appendChild(head);

    const people = renderAssignees(node);
    wrapper.appendChild(people);

    return wrapper;
  };

  const renderProjectTree = () => {
    if (!projectTreeStore.container) return;
    projectTreeStore.container.innerHTML = "";
    if (!projectTreeStore.nodes.length) {
      const p = document.createElement("p");
      p.className = "empty-state";
      p.textContent = "No project structure yet. Admins can add a trunk to get started.";
      projectTreeStore.container.appendChild(p);
      return;
    }
    const { roots, byId } = buildProjectTree(projectTreeStore.nodes);
    projectTreeStore.lookup = byId;
    const renderList = (nodes, isRoot = false) => {
      const ul = document.createElement("ul");
      ul.className = isRoot ? "tree-list" : "tree-children";
      nodes.forEach((node) => {
        const li = document.createElement("li");
        li.appendChild(renderTreeNode(node));
        if (node.children && node.children.length) {
          li.appendChild(renderList(node.children, false));
        }
        ul.appendChild(li);
      });
      return ul;
    };
    if (projectTreeStore.canEdit) {
      const addTrunkBtn = document.createElement("button");
      addTrunkBtn.type = "button";
      addTrunkBtn.className = "tree-action";
      addTrunkBtn.textContent = "+ پروژه اصلی";
      addTrunkBtn.addEventListener("click", () =>
        openInlineEditor(
          { id: null, name: "", parent_id: null, assignees: [] },
          { isCreate: true, container: projectTreeStore.container }
        )
      );
      projectTreeStore.container.appendChild(addTrunkBtn);
    }
    projectTreeStore.container.appendChild(renderList(roots, true));
  };

  const loadProjectTree = async () => {
    if (!projectTreeStore.container) return;
    projectTreeStore.container.innerHTML = '<p class="empty-state">Loading project map…</p>';
    try {
      const res = await fetch("/api/project-tree");
      let data = [];
      if (res.ok) {
        data = await res.json();
      }
      projectTreeStore.nodes = Array.isArray(data) ? data : [];
      refreshTreeAdminControls();
      renderProjectTree();
    } catch (err) {
      projectTreeStore.nodes = [];
      renderProjectTree();
    }
  };

  const attachTreeAdminForms = () => {
    if (!projectTreeStore.adminPanel) return;
    const trunkForm = projectTreeStore.adminPanel.querySelector('[data-tree-form="trunk"]');
    const branchForm = projectTreeStore.adminPanel.querySelector('[data-tree-form="branch"]');
    const editForm = projectTreeStore.adminPanel.querySelector('[data-tree-form="edit"]');
    if (trunkForm) {
      trunkForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = (trunkForm.querySelector('input[name="name"]')?.value || "").trim();
        if (!name) return;
        const assigneeIds = getSelectedAssigneeIds(
          trunkForm.querySelector("[data-tree-researcher-trunk]")
        );
        const payload = { name, assignee_ids: assigneeIds };
        const res = await fetch("/api/project-tree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Could not add trunk.");
          return;
        }
        trunkForm.reset();
        loadProjectTree();
      });
    }
    if (branchForm) {
      branchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = (branchForm.querySelector('input[name="name"]')?.value || "").trim();
        const parentVal = branchForm.querySelector("[data-tree-parent]")?.value;
        const assigneeIds = getSelectedAssigneeIds(
          branchForm.querySelector("[data-tree-researcher]")
        );
        if (!name || !parentVal) {
          alert("Choose a parent and name for the branch.");
          return;
        }
        const payload = { name, parent_id: parentVal || null, assignee_ids: assigneeIds };
        const res = await fetch("/api/project-tree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Could not add branch.");
          return;
        }
        branchForm.reset();
        loadProjectTree();
      });
    }
    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nodeId = editForm.querySelector("[data-tree-node]")?.value;
        if (!nodeId) {
          alert("Select a node to edit.");
          return;
        }
        const name = (editForm.querySelector('input[name="name"]')?.value || "").trim();
        const parentVal = editForm.querySelector("[data-tree-parent-edit]")?.value;
        const researcherSelect = editForm.querySelector("[data-tree-researcher-edit]");
        const appendToggle = editForm.querySelector("[data-tree-append-assignees]");
        const currentNode = projectTreeStore.lookup.get(Number(nodeId));
        const payload = {};
        if (name) payload.name = name;
        if (parentVal !== "__keep") payload.parent_id = parentVal || null;
        if (researcherSelect) {
          const vals = Array.from(researcherSelect.selectedOptions)
            .map((o) => o.value)
            .filter((v) => v !== "");
          const existing = (currentNode?.assignees || []).map((a) => String(a.id));
          if (appendToggle?.checked) {
            // If nothing selected, keep existing; otherwise merge.
            const merged = vals.length ? Array.from(new Set([...existing, ...vals])) : existing;
            payload.assignee_ids = merged;
          } else {
            // Replace with selected (empty means clear).
            payload.assignee_ids = vals;
          }
        }
        const res = await fetch(`/api/project-tree/${nodeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Could not update node.");
          return;
        }
        editForm.reset();
        loadProjectTree();
      });
      const deleteBtn = editForm.querySelector("[data-tree-delete]");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          const nodeId = editForm.querySelector("[data-tree-node]")?.value;
          if (!nodeId) return;
          const ok = window.confirm("Delete this branch (and its children)?");
          if (!ok) return;
          const res = await fetch(`/api/project-tree/${nodeId}`, { method: "DELETE" });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.error || "Could not delete node.");
            return;
          }
          editForm.reset();
          loadProjectTree();
        });
      }
    }
  };

  const initProjectTree = () => {
    const container = document.querySelector("[data-project-tree]");
    if (!container) return;
    projectTreeStore.container = container;
    projectTreeStore.canEdit =
      container.dataset.treeCanEdit === "1" || container.dataset.treeCanEdit === "true";
    projectTreeStore.adminPanel = document.querySelector("[data-project-tree-admin]");
    projectTreeStore.assignees = treeAssigneesFromDom();
    if (projectTreeStore.canEdit) {
      refreshTreeAdminControls();
      attachTreeAdminForms();
    }
    loadProjectTree();
  };

  const initPasswordVisibility = () => {
    const passwordCheckboxes = document.querySelectorAll(".password-checkbox");
    passwordCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const passwordWrapper = this.closest(".checkbox-wrapper");
        const formGroup = passwordWrapper?.closest(".form-group");
        const passwordInput = formGroup?.querySelector(
          'input[type="password"], input[type="text"]'
        );

        if (passwordInput) {
          passwordInput.type = this.checked ? "text" : "password";
        }
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initGlobalsFromDom();
    initUserCardProgress();
    initChatPage();
    initManageUsersPage();
    initProfilePage();
    initPasswordVisibility();
    fetchUnreadMailCount();
    fetchChatUnread();
    if (chatUnreadTimer) clearInterval(chatUnreadTimer);
    chatUnreadTimer = setInterval(fetchChatUnread, 10000);
    const initTaskTabs = () => {
      document.querySelectorAll(".tasks-tabs").forEach((tabBar) => {
        const card = tabBar.closest(".tasks-side-card") || tabBar.parentElement;
        const panels = card.querySelectorAll(".tasks-tab-panel");
        const buttons = tabBar.querySelectorAll("[data-task-tab]");
        const activate = (filter) => {
          buttons.forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.taskTab === filter);
          });
          panels.forEach((panel) => {
            panel.classList.toggle(
              "is-active",
              panel.dataset.taskFilter === filter
            );
          });
        };
        buttons.forEach((btn) => {
          btn.addEventListener("click", () => {
            activate(btn.dataset.taskTab);
          });
        });
        const defaultTab =
          tabBar.querySelector(".tasks-tab.active")?.dataset.taskTab ||
          buttons[0]?.dataset.taskTab;
        if (defaultTab) activate(defaultTab);
      });
    };
    initTaskTabs();
    initMailboxPage();
    initProjectTree();

    const hasTaskContext = document.getElementById("taskGlobals");
    if (!hasTaskContext) {
      return;
    }

    taskStore.currentUserId = window.currentUserId || null;
    if (!taskStore.currentUserId) {
      return;
    }

    taskStore.isAdmin =
      (window.currentUserRole || "").toLowerCase() === "admin";
    taskStore.assignees = Array.isArray(window.taskAssignees)
      ? window.taskAssignees
      : [];
    initTaskForm();
    // Render calendars immediately (even if tasks API fails) then hydrate with tasks data
    ensureCalendars(taskStore.map);
    reloadTasks();
    setInterval(reloadTasks, 10000);
  });
  /**
   * Animation on scroll
   */
  window.addEventListener("load", () => {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 1000,
        easing: "ease-in-out",
        once: true,
        mirror: false,
      });
    }
  });

  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== "undefined") {
    new PureCounter();
  }
})();
