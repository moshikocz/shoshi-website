/* ============================================================
   TESTIMONIAL CAROUSEL — dot-nav synced via IntersectionObserver,
   with autoplay that loops in one direction (clone-and-snap trick).
   Source: course-isha-magalit.html
   Pairs with the `.testimonial-carousel/.testimonial-track/
   .testimonial-nav/.testimonial-dot` CSS in components.css.

   Markup contract:
   <div class="testimonial-carousel">
     <div class="testimonial-track" id="testimonial-track" tabindex="0" role="region" aria-label="קרוסלת המלצות">
       <div data-aos="fade-up">...testimonial card 1...</div>
       <div data-aos="fade-up" data-aos-delay="100">...testimonial card 2...</div>
     </div>
     <div class="testimonial-nav" id="testimonial-nav" role="tablist" aria-label="בחירת המלצה"></div>
   </div>

   Place this <script> block before the AOS init script.

   Fully dynamic — DO NOT hardcode a slide count anywhere:
   - Add/remove testimonials by adding/removing `<div>` children of
     #testimonial-track. Nothing else needs updating: dots, slide
     count (`n`), and the loop-clone count are all read from the DOM
     at runtime. (The home-page carousel in index.html is a separate,
     single-slide-per-view variant — arrows + pause button instead of
     a scroll-snap track — but follows the same rule: it also reads
     its slide count from #testimonial-slides' children at runtime
     and loops via the same clone-and-snap trick. Neither carousel
     needs a manually maintained slide count or dot list anymore.)
   - Every real testimonial card must be a *direct child* of
     #testimonial-track (that's what `track.children` walks).
   - Don't hand-add extra "clone" slides for the loop effect — the
     script clones the first 1-2 slides itself on load (marked
     `aria-hidden="true"`) to make autoplay appear to keep scrolling
     in one direction, then snaps back to the real first slide
     instantly once the clone is fully in view (imperceptible since
     the clone is pixel-identical to the real slide it copies).
   - Autoplay: advances every 5s, pauses on hover/keyboard focus,
     resumes on leave/blur, and is skipped entirely when the user
     has `prefers-reduced-motion: reduce`. Needs at least 2 real
     slides to run at all.
   ============================================================ */
(function () {
  var track = document.getElementById('testimonial-track');
  var nav = document.getElementById('testimonial-nav');
  if (!track || !nav) return;
  var slides = Array.prototype.slice.call(track.children);
  var dots = slides.map(function (slide, i) {
    var dot = document.createElement('button');
    dot.className = 'testimonial-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', 'המלצה ' + (i + 1));
    dot.addEventListener('click', function () {
      slide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    nav.appendChild(dot);
    return dot;
  });
  var activeIndex = 0;
  function setActive(index) {
    activeIndex = index;
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
  }
  setActive(0);
  if ('IntersectionObserver' in window) {
    var slideObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(slides.indexOf(entry.target));
        }
      });
    }, { root: track, threshold: 0.6 });
    slides.forEach(function (slide) { slideObserver.observe(slide); });
  }

  // Append clones of the leading slides after the last one, so autoplay can keep
  // scrolling in the same direction and land on a clone that looks identical to
  // slide 1 — then snap back to the real slide 1 instantly, with no visible cut.
  var n = slides.length;
  var cloneCount = Math.min(2, n - 1);
  for (var ci = 0; ci < cloneCount; ci++) {
    var clone = slides[ci].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('data-aos');
    clone.removeAttribute('data-aos-delay');
    track.appendChild(clone);
  }
  var children = Array.prototype.slice.call(track.children);

  // Auto-advance, matching the site-wide carousel pattern: pause on hover/focus, resume on leave.
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timer, snapTimeout;
  function startTimer() {
    if (reduceMotion || n < 2) return;
    timer = setInterval(function () {
      var nextPos = activeIndex + 1;
      if (nextPos >= n) {
        children[n].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        snapTimeout = setTimeout(function () {
          slides[0].scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }, 450);
      } else {
        slides[nextPos].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 5000);
  }
  function stopTimer() { clearInterval(timer); clearTimeout(snapTimeout); }
  track.addEventListener('mouseenter', stopTimer);
  track.addEventListener('mouseleave', startTimer);
  track.addEventListener('focusin', stopTimer);
  track.addEventListener('focusout', startTimer);
  startTimer();
})();

/* ============================================================
   BONUS — WhatsApp float button show/hide on scroll
   (a common companion pattern seen alongside the carousel in the
   source file; not required by the carousel itself)

   Markup: <a class="wa-float" id="float-whatsapp-link">...</a>
   Requires an element with id="hero-whatsapp-link" as the
   scroll-position reference (typically the hero's primary CTA).
   ============================================================ */
(function () {
  var floatBtn = document.querySelector('.wa-float');
  var heroCta = document.getElementById('hero-whatsapp-link');
  if (!floatBtn || !heroCta) return;
  var ctaBottom = heroCta.getBoundingClientRect().bottom + window.scrollY;
  window.addEventListener('scroll', function () {
    floatBtn.classList.toggle('is-visible', window.scrollY > ctaBottom);
  }, { passive: true });
})();
