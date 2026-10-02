/*!
 * script.js - Interactive behavior for the birthday page
 * Features:
 *   • Smooth scrolling for internal anchor links
 *   • Animated greeting reveal on page load
 *   • Simple confetti effect triggered by a button click
 *
 * Dependencies: Bootstrap 5, Font Awesome 6, AOS (included via CDN in HTML)
 * No external libraries are required for this script.
 */

(() => {
  'use strict';

  /** @type {HTMLCanvasElement|null} */
  let confettiCanvas = null;
  /** @type {CanvasRenderingContext2D|null} */
  let confettiCtx = null;
  /** @type {Array<ConfettiParticle>} */
  let particles = [];
  /** @type {number|null} */
  let animationFrameId = null;
  /** @type {number|null} */
  let confettiTimeoutId = null;

  /**
   * Represents a single confetti particle.
   * @typedef {Object} ConfettiParticle
   * @property {number} x - Horizontal position.
   * @property {number} y - Vertical position.
   * @property {number} size - Size of the particle.
   * @property {number} tilt - Current tilt angle.
   * @property {number} tiltAngleIncrement - Increment for tilt animation.
   * @property {number} tiltAngle - Current tilt angle value.
   * @property {number} velocityX - Horizontal velocity.
   * @property {number} velocityY - Vertical velocity.
   * @property {string} color - Fill color.
   */

  /**
   * Initialize the script once the DOM is fully loaded.
   */
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initSmoothScrolling();
      revealGreeting();
      initConfettiButton();
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  });

  /**
   * Enables smooth scrolling for all internal anchor links.
   */
  function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', event => {
        const targetId = (link.getAttribute('href') || '').substring(1);
        if (!targetId) return;
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          event.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /**
   * Reveals the greeting element with a subtle fade-in animation.
   * Expects an element with id="greeting" in the DOM.
   */
  function revealGreeting() {
    const greetingEl = document.getElementById('greeting');
    if (!greetingEl) {
      console.warn('Greeting element with id="greeting" not found.');
      return;
    }
    // Ensure the element is initially hidden via CSS (opacity:0, transform)
    setTimeout(() => {
      greetingEl.classList.add('greeting-reveal');
    }, 300); // slight delay for effect
  }

  /**
   * Sets up the confetti button to trigger the confetti animation.
   * Expects a button with id="confettiBtn".
   */
  function initConfettiButton() {
    const btn = document.getElementById('confettiBtn');
    if (!btn) {
      console.warn('Confetti button with id="confettiBtn" not found.');
      return;
    }
    btn.addEventListener('click', () => {
      startConfetti();
    });
  }

  /**
   * Starts the confetti animation.
   * The animation runs for 5 seconds and then stops automatically.
   */
  function startConfetti() {
    try {
      if (confettiCanvas) {
        // If already running, reset timer
        resetConfettiTimeout();
        return;
      }
      createCanvas();
      generateParticles();
      renderConfetti();
      // Stop after 5 seconds
      confettiTimeoutId = window.setTimeout(stopConfetti, 5000);
    } catch (err) {
      console.error('Failed to start confetti:', err);
    }
  }

  /**
   * Stops and cleans up the confetti animation.
   */
  function stopConfetti() {
    try {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (confettiCanvas && confettiCanvas.parentNode) {
        confettiCanvas.parentNode.removeChild(confettiCanvas);
      }
      confettiCanvas = null;
      confettiCtx = null;
      particles = [];
      if (confettiTimeoutId !== null) {
        clearTimeout(confettiTimeoutId);
        confettiTimeoutId = null;
      }
    } catch (err) {
      console.error('Error while stopping confetti:', err);
    }
  }

  /**
   * Resets the automatic stop timeout for the confetti animation.
   */
  function resetConfettiTimeout() {
    if (confettiTimeoutId !== null) {
      clearTimeout(confettiTimeoutId);
    }
    confettiTimeoutId = window.setTimeout(stopConfetti, 5000);
  }

  /**
   * Creates a full-screen canvas element for rendering confetti.
   */
  function createCanvas() {
    confettiCanvas = document.createElement('canvas');
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.top = '0';
    confettiCanvas.style.left = '0';
    confettiCanvas.style.width = '100%';
    confettiCanvas.style.height = '100%';
    confettiCanvas.style.pointerEvents = 'none';
    confettiCanvas.style.zIndex = '9999';
    document.body.appendChild(confettiCanvas);
    confettiCtx = confettiCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  /**
   * Adjusts the canvas size to match the viewport.
   */
  function resizeCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  /**
   * Generates an initial set of confetti particles.
   */
  function generateParticles() {
    const particleCount = Math.min(150, Math.max(80, Math.floor(window.innerWidth / 10)));
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
  }

  /**
   * Creates a single confetti particle with random properties.
   * @returns {ConfettiParticle}
   */
  function createParticle() {
    const colors = ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63'];
    const size = randomRange(5, 12);
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      size,
      tilt: randomRange(-10, 10),
      tiltAngleIncrement: randomRange(0.05, 0.12),
      tiltAngle: 0,
      velocityX: randomRange(-2, 2),
      velocityY: randomRange(2, 5),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }

  /**
   * Main render loop for the confetti animation.
   */
  function renderConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach(p => {
      // Update physics
      p.tiltAngle += p.tiltAngleIncrement;
      p.tilt = Math.sin(p.tiltAngle) * 15;

      p.x += p.velocityX;
      p.y += p.velocityY;
      p.velocityY += 0.05; // gravity

      // Recycle particles that fall off-screen
      if (p.y > confettiCanvas.height + 20) {
        Object.assign(p, createParticle(), { y: -20 });
      }

      // Draw particle
      confettiCtx.beginPath();
      confettiCtx.lineWidth = p.size;
      confettiCtx.strokeStyle = p.color;
      confettiCtx.moveTo(p.x + p.tilt + p.size / 2, p.y);
      confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.size / 2);
      confettiCtx.stroke();
    });

    animationFrameId = requestAnimationFrame(renderConfetti);
  }

  /**
   * Returns a random number between min (inclusive) and max (exclusive).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Expose functions for potential external use (e.g., testing)
  window.BirthdayPage = {
    startConfetti,
    stopConfetti,
    revealGreeting,
    initSmoothScrolling
  };
})();