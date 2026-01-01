$(document).ready(function () {
  ("use strict");

  /*==================================
* Author        : "ThemeSine"
* Template Name : Listrace directory HTML Template
* Version       : 1.0
==================================== */

  /*=========== TABLE OF CONTENTS ===========
1. Scroll To Top 
2. slick carousel
3. welcome animation support
4. feather icon
5. counter
======================================*/

  // 1. Scroll To Top
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 600) {
      $(".return-to-top").fadeIn();
    } else {
      $(".return-to-top").fadeOut();
    }
  });
  $(".return-to-top").on("click", function () {
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      1500
    );
    return false;
  });

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
   * Preloader
   */
  let preloader = select("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  // 2. slick carousel

  $(".testimonial-carousel").slick({
    infinite: true,
    centerMode: true,
    autoplay: true,
    slidesToShow: 5,
    slidesToScroll: 3,
    autoplaySpeed: 1500,
    // the magic
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          centerMode: false,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });

  // 3. welcome animation support

  $(window).load(function () {
    $(".welcome-hero-txt h2,.welcome-hero-txt p")
      .removeClass("animated fadeInUp")
      .css({ opacity: "0" });
    $(".welcome-hero-serch-box")
      .removeClass("animated fadeInDown")
      .css({ opacity: "0" });
  });

  $(window).load(function () {
    $(".welcome-hero-txt h2,.welcome-hero-txt p")
      .addClass("animated fadeInUp")
      .css({ opacity: "0" });
    $(".welcome-hero-serch-box")
      .addClass("animated fadeInDown")
      .css({ opacity: "0" });
  });

  // 4. feather icon

  feather.replace();

  // 5. counter
  $(window).on("load", function () {
    $(".counter").counterUp({
      delay: 10,
      time: 3000,
    });
  });
});
