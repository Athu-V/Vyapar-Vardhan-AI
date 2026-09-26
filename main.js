/* ============================================================================
   MAIN.JS - Intelligence Designed To Evolve
   Count-up stats, mobile menu, entrance animations
   ============================================================================ */

(function () {
  "use strict"

  // --- Count-Up Stats ---
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
  }

  function formatNumber(value, decimals, suffix) {
    const formatted = value.toFixed(decimals)
    return formatted + suffix
  }

  function animateStat(stat, delay) {
    const target = parseFloat(stat.dataset.target)
    const suffix = stat.dataset.suffix || ""
    const decimals = parseInt(stat.dataset.decimals, 10) || 0
    const valueEl = stat.querySelector(".stat-value")
    const duration = 1500 + Array.from(stat.parentElement.children).indexOf(stat) * 80

    setTimeout(function () {
      const start = performance.now()

      function tick(now) {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)
        const current = eased * target

        valueEl.textContent = formatNumber(current, decimals, suffix)

        if (progress < 1) {
          requestAnimationFrame(tick)
        }
      }

      requestAnimationFrame(tick)
    }, delay)
  }

  // Use IntersectionObserver to trigger count-up when stats are visible
  function initStats() {
    const stats = document.querySelectorAll(".stat")
    if (!stats.length) return

    let animated = false

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !animated) {
            animated = true
            stats.forEach(function (stat, i) {
              animateStat(stat, 480 + i * 90)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.25 }
    )

    stats.forEach(function (stat) {
      observer.observe(stat)
    })
  }

  // --- Mobile Menu ---
  function initMobileMenu() {
    const burger = document.querySelector(".burger")
    const overlay = document.querySelector(".overlay")
    const mobileMenu = document.querySelector(".mobile-menu")
    const mobileLinks = document.querySelectorAll(".mobile-link")

    if (!burger || !overlay || !mobileMenu) return

    function openMenu() {
      burger.setAttribute("aria-expanded", "true")
      overlay.hidden = false
      mobileMenu.hidden = false
      document.body.classList.add("menu-open")
    }

    function closeMenu() {
      burger.setAttribute("aria-expanded", "false")
      overlay.hidden = true
      mobileMenu.hidden = true
      document.body.classList.remove("menu-open")
    }

    function toggleMenu() {
      if (burger.getAttribute("aria-expanded") === "true") {
        closeMenu()
      } else {
        openMenu()
      }
    }

    burger.addEventListener("click", toggleMenu)
    overlay.addEventListener("click", closeMenu)

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        closeMenu()
      }
    })

    // Close on link click
    mobileLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu)
    })

    // Close on resize to desktop
    let resizeTimer
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 720 && burger.getAttribute("aria-expanded") === "true") {
          closeMenu()
        }
      }, 100)
    })
  }

  // --- Smooth Scroll for Anchor Links ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href")
        if (targetId === "#") return

        const target = document.querySelector(targetId)
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      })
    })
  }

  // --- Active Nav Link Tracking ---
  function initActiveNav() {
    const navLinks = document.querySelectorAll(".nav-link")
    const mobileLinks = document.querySelectorAll(".mobile-link")

    navLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        navLinks.forEach(function (l) { l.classList.remove("active") })
        this.classList.add("active")

        // Sync mobile menu
        const idx = Array.from(navLinks).indexOf(this)
        mobileLinks.forEach(function (l) { l.classList.remove("active") })
        if (mobileLinks[idx]) mobileLinks[idx].classList.add("active")
      })
    })

    mobileLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        mobileLinks.forEach(function (l) { l.classList.remove("active") })
        this.classList.add("active")

        // Sync desktop nav
        const idx = Array.from(mobileLinks).indexOf(this)
        navLinks.forEach(function (l) { l.classList.remove("active") })
        if (navLinks[idx]) navLinks[idx].classList.add("active")
      })
    })
  }

  // --- Init ---
  document.addEventListener("DOMContentLoaded", function () {
    initStats()
    initMobileMenu()
    initSmoothScroll()
    initActiveNav()
  })
})()
