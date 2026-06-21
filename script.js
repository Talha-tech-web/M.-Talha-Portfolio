(function () {
  'use strict';
  var root = document.documentElement;
  var STORAGE_KEY = 'talha-portfolio-theme';

  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function storeTheme(t) {
    try { localStorage.setItem(STORAGE_KEY, t); } catch (e) { /* ignore */ }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    storeTheme(theme);
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  function initTheme() {
    var stored = getStoredTheme();
    var theme = stored || 'dark'; // dark is the spec default
    root.setAttribute('data-theme', theme);
  }
  initTheme();

  function bindThemeToggles() {
    var toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    });
  }

  function initParticleNetwork(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: null, y: null };
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var colors = { text: '#8a8a8a', muted: '#525252', accent: '#d4d4d4' };

    function readColors() {
      var cs = getComputedStyle(root);
      colors.text = cs.getPropertyValue('--particle-text').trim() || cs.getPropertyValue('--text-secondary').trim() || colors.text;
      colors.muted = cs.getPropertyValue('--particle-muted').trim() || cs.getPropertyValue('--text-muted').trim() || colors.muted;
      colors.accent = cs.getPropertyValue('--particle-accent').trim() || cs.getPropertyValue('--accent').trim() || colors.accent;
    }
    readColors();
    document.addEventListener('themechange', readColors);

    function hexToRgba(hex, alpha) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex.split('').map(function (c) { return c + c; }).join('');
      }
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    var width, height, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = document.documentElement.scrollHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function particleCount() {
      var area = width * height;
      var base = Math.round(area / 24000);
      if (width < 560) base = Math.round(base * 0.45);
      else if (width < 980) base = Math.round(base * 0.7);
      return Math.max(36, Math.min(base, 180));
    }

    function buildParticles() {
      var count = particleCount();
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          r: Math.random() * 1.4 + 0.8,
          accent: Math.random() < 0.08
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      var linkDist = width < 760 ? 100 : 140;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (mouse.x !== null) {
            var dxm = mouse.x - p.x, dym = mouse.y - p.y;
            var dm = Math.sqrt(dxm * dxm + dym * dym);
            if (dm < 180) {
              p.x -= dxm / dm * 0.06;
              p.y -= dym / dm * 0.06;
            }
          }
          if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
        }
      }

      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var p1 = particles[a], p2 = particles[b];
          var dx = p1.x - p2.x, dy = p1.y - p2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            var alpha = (1 - dist / linkDist) * 0.16;
            ctx.strokeStyle = hexToRgba(colors.text, alpha);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      for (var j = 0; j < particles.length; j++) {
        var pt = particles[j];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fillStyle = pt.accent ? hexToRgba(colors.accent, 0.85) : hexToRgba(colors.muted, 0.6);
        ctx.fill();
      }

      requestAnimationFrame(step);
    }

    window.addEventListener('resize', debounce(resize, 200));
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    });
    window.addEventListener('mouseleave', function () { mouse.x = null; mouse.y = null; });

    var resizeObserver = new ResizeObserver(debounce(resize, 250));
    resizeObserver.observe(document.body);

    resize();
    if (reduceMotion) {
      step(); // draw a single static frame
    } else {
      requestAnimationFrame(step);
    }
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

    //  2. TYPEWRITER ROLE LINE
  function initTypewriter(elId, roles) {
    var el = document.getElementById(elId);
    if (!el) return;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var textNode = el.querySelector('.type-text');
    if (!textNode) return;

    if (reduceMotion) {
      textNode.textContent = roles[0];
      return;
    }

    var roleIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      var word = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        textNode.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          setTimeout(tick, 1700);
          return;
        }
        setTimeout(tick, 70);
      } else {
        charIndex--;
        textNode.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(tick, 350);
          return;
        }
        setTimeout(tick, 35);
      }
    }
    tick();
  }

    //  3. SCROLL REVEALS
  function initReveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (item) { observer.observe(item); });
  }

    //  4. COUNT-UP STATS
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-counter'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1200;
        var start = null;

        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { observer.observe(c); });
  }

    //  5. NAVBAR — scroll shrink + active link highlight
  function initNavbar() {
    var navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', debounce(function () {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
      }, 10));
    }

    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) sections.push({ link: link, section: section });
    });
    if (!sections.length) return;

    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.section === entry.target; });
        if (!match) return;
        if (entry.isIntersecting) {
          sections.forEach(function (s) { s.link.classList.remove('active'); });
          match.link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sections.forEach(function (s) { spyObserver.observe(s.section); });
  }

    //  6. MOBILE MENU
  function initMobileMenu() {
    var hamburger = document.querySelector('.hamburger');
    var menu = document.querySelector('.mobile-menu');
    var overlay = document.querySelector('.menu-overlay');
    if (!hamburger || !menu) return;

    function close() {
      hamburger.classList.remove('open');
      menu.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    function toggle() {
      var isOpen = menu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      if (overlay) overlay.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    hamburger.addEventListener('click', toggle);
    if (overlay) overlay.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  }

    //  7. PROJECT CARD — cursor-follow ambient glow
  function initCardGlow() {
    var cards = document.querySelectorAll('.project-card');
    cards.forEach(function (card) {
      var glow = card.querySelector('.card-glow');
      if (!glow) return;
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left) + 'px';
        glow.style.top = (e.clientY - rect.top) + 'px';
      });
    });
  }

  // Modal container state
  function showEmailModal(emailAddress, subject, body) {
    var modal = document.getElementById('email-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'email-modal';
      modal.style.cssText = 'position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);';
      
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.65); backdrop-filter:blur(5px);';
      modal.appendChild(overlay);
      
      var content = document.createElement('div');
      content.id = 'email-modal-content';
      content.style.cssText = 'position:relative; width:90%; max-width:440px; background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:32px; box-shadow:0 24px 48px var(--shadow-color); transform:scale(0.92); transition:transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);';
      
      var closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = 'position:absolute; top:16px; right:16px; font-size:24px; color:var(--text-muted); cursor:pointer; line-height:1; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:background-color 0.2s, color 0.2s;';
      closeBtn.addEventListener('mouseenter', function() { closeBtn.style.backgroundColor = 'var(--surface-hover)'; closeBtn.style.color = 'var(--text-primary)'; });
      closeBtn.addEventListener('mouseleave', function() { closeBtn.style.backgroundColor = 'transparent'; closeBtn.style.color = 'var(--text-muted)'; });
      closeBtn.addEventListener('click', closeEmailModal);
      content.appendChild(closeBtn);
      
      var title = document.createElement('h3');
      title.innerText = 'Send Email';
      title.style.cssText = 'font-size:22px; font-weight:600; margin-bottom:8px; color:var(--text-primary); font-family:"Space Grotesk", sans-serif;';
      content.appendChild(title);
      
      var desc = document.createElement('p');
      desc.innerText = 'Choose your preferred email client to contact Muhammad Talha Jameel:';
      desc.style.cssText = 'font-size:14px; color:var(--text-secondary); margin-bottom:24px; line-height:1.5; font-family:"Space Grotesk", sans-serif;';
      content.appendChild(desc);
      
      var btnsContainer = document.createElement('div');
      btnsContainer.style.cssText = 'display:flex; flex-direction:column; gap:12px;';
      
      var gmailBtn = document.createElement('a');
      gmailBtn.id = 'email-modal-gmail-btn';
      gmailBtn.target = '_blank';
      gmailBtn.style.cssText = 'display:flex; align-items:center; justify-content:center; gap:10px; font-family:"JetBrains Mono", monospace; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; padding:14px; border-radius:8px; background:var(--accent); color:var(--bg); border:1px solid var(--accent); transition:transform 0.2s, box-shadow 0.2s; text-align:center; cursor:pointer;';
      gmailBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> Open in Gmail (Web)';
      gmailBtn.addEventListener('mouseenter', function() { gmailBtn.style.transform = 'translateY(-2px)'; gmailBtn.style.boxShadow = '0 8px 20px var(--accent-glow)'; });
      gmailBtn.addEventListener('mouseleave', function() { gmailBtn.style.transform = 'none'; gmailBtn.style.boxShadow = 'none'; });
      gmailBtn.addEventListener('click', closeEmailModal);
      btnsContainer.appendChild(gmailBtn);
      
      var defaultBtn = document.createElement('a');
      defaultBtn.id = 'email-modal-default-btn';
      defaultBtn.style.cssText = 'display:flex; align-items:center; justify-content:center; gap:10px; font-family:"JetBrains Mono", monospace; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; padding:14px; border-radius:8px; background:transparent; color:var(--text-primary); border:1px solid var(--border-hover); transition:transform 0.2s, border-color 0.2s, background-color 0.2s; text-align:center; cursor:pointer;';
      defaultBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Default Mail App';
      defaultBtn.addEventListener('mouseenter', function() { defaultBtn.style.transform = 'translateY(-2px)'; defaultBtn.style.borderColor = 'var(--accent)'; defaultBtn.style.backgroundColor = 'var(--surface-hover)'; });
      defaultBtn.addEventListener('mouseleave', function() { defaultBtn.style.transform = 'none'; defaultBtn.style.borderColor = 'var(--border-hover)'; defaultBtn.style.backgroundColor = 'transparent'; });
      defaultBtn.addEventListener('click', closeEmailModal);
      btnsContainer.appendChild(defaultBtn);
      
      var copyBtn = document.createElement('button');
      copyBtn.id = 'email-modal-copy-btn';
      copyBtn.style.cssText = 'display:flex; align-items:center; justify-content:center; gap:10px; font-family:"JetBrains Mono", monospace; font-size:12px; text-transform:uppercase; letter-spacing:0.06em; padding:10px; border-radius:8px; background:transparent; color:var(--text-secondary); border:1px solid transparent; transition:color 0.2s, background-color 0.2s; cursor:pointer; width:100%;';
      copyBtn.innerHTML = 'Copy Email Address';
      copyBtn.addEventListener('click', function() {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          window.prompt('Copy this email address:', emailAddress);
          return;
        }
        navigator.clipboard.writeText(emailAddress).then(function() {
          var originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg> Address Copied!';
          copyBtn.style.color = 'var(--text-primary)';
          setTimeout(function() {
            copyBtn.innerHTML = originalText;
            copyBtn.style.color = 'var(--text-secondary)';
          }, 2000);
        });
      });
      copyBtn.addEventListener('mouseenter', function() { copyBtn.style.backgroundColor = 'var(--surface-hover)'; });
      copyBtn.addEventListener('mouseleave', function() { copyBtn.style.backgroundColor = 'transparent'; });
      btnsContainer.appendChild(copyBtn);
      
      content.appendChild(btnsContainer);
      modal.appendChild(content);
      
      document.body.appendChild(modal);
      overlay.addEventListener('click', closeEmailModal);
    }
    
    var gmailBtn = document.getElementById('email-modal-gmail-btn');
    var defaultBtn = document.getElementById('email-modal-default-btn');
    
    var gmailComposeUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + emailAddress;
    var mailtoUrl = 'mailto:' + emailAddress;
    
    if (subject) {
      gmailComposeUrl += '&su=' + subject;
      mailtoUrl += '?subject=' + subject;
      if (body) {
        gmailComposeUrl += '&body=' + body;
        mailtoUrl += '&body=' + body;
      }
    } else if (body) {
      gmailComposeUrl += '&body=' + body;
      mailtoUrl += '?body=' + body;
    }
    
    gmailBtn.href = gmailComposeUrl;
    defaultBtn.href = mailtoUrl;
    
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    document.getElementById('email-modal-content').style.transform = 'scale(1)';
    document.body.style.overflow = 'hidden';
  }

  function closeEmailModal() {
    var modal = document.getElementById('email-modal');
    if (!modal) return;
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    var content = document.getElementById('email-modal-content');
    if (content) content.style.transform = 'scale(0.92)';
    document.body.style.overflow = '';
  }

  function bindEmailLinks() {
    document.addEventListener('click', function(e) {
      var target = e.target.closest('a');
      if (target && target.getAttribute('href') && target.getAttribute('href').startsWith('mailto:')) {
        var href = target.getAttribute('href');
        var parts = href.split('?');
        var email = parts[0].replace('mailto:', '').trim();
        var subject = '';
        var body = '';
        if (parts[1]) {
          var params = new URLSearchParams(parts[1]);
          subject = params.get('subject') || '';
          body = params.get('body') || '';
        }
        e.preventDefault();
        showEmailModal(email, encodeURIComponent(subject), encodeURIComponent(body));
      }
    });
  }

  //  8. CONTACT FORM -> mailto:
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('#cf-name') || {}).value || '';
      var email = (form.querySelector('#cf-email') || {}).value || '';
      var message = (form.querySelector('#cf-message') || {}).value || '';
      var target = form.getAttribute('data-mail-to') || '';
      var subject = 'Portfolio inquiry from ' + name;
      var body = message + '\n\n— ' + name + ' (' + email + ')';
      showEmailModal(target, encodeURIComponent(subject), encodeURIComponent(body));
    });
  }

    //  BOOT
  document.addEventListener('DOMContentLoaded', function () {
    bindThemeToggles();
    initNavbar();
    initMobileMenu();
    initReveals();
    initCounters();
    initCardGlow();
    initContactForm();
    bindEmailLinks();

    if (document.getElementById('particle-canvas')) {
      initParticleNetwork('particle-canvas');
    }
    if (document.getElementById('hero-role')) {
      initTypewriter('hero-role', [
        'Software Engineering Student',
        'Web Developer (MERN + AI)',
        'AI/ML Learner'
      ]);
    }
  });
})();
