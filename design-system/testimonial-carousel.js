/* ============================================================
   TESTIMONIAL CAROUSEL — dot-nav synced via IntersectionObserver
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
  function setActive(index) {
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
