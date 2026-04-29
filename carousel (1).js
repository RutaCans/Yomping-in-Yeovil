
(function(){
  const track = document.getElementById('tours-carousel');
  if (!track) return;
  const prev = document.querySelector('.carousel-btn.prev');
  const next = document.querySelector('.carousel-btn.next');

  function scrollAmount(){
    const firstCard = track.querySelector('.card');
    const gapStr = getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0';
    const gap = parseInt(gapStr, 10) || 0;
    const cardWidth = firstCard?.getBoundingClientRect().width || 0;
    return cardWidth + gap;
  }

  // Helper: wrap-around detection
  function atEnd(){
    return Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth - 1;
  }
  function atStart(){
    return Math.floor(track.scrollLeft) <= 0;
  }

  // Fade + jump/scroll utility (keeps layout; adds a quick cross-fade)
  function fadeScroll(delta){
    const amount = delta;
    track.classList.add('is-fading');
    // After fade-out begins, jump or scroll, then fade back in
    setTimeout(() => {
      if (amount > 0 && atEnd()) {
        // wrap to start instantly for infinite loop
        track.scrollTo({ left: 0, behavior: 'auto' });
      } else if (amount < 0 && atStart()) {
        // wrap to end instantly for reverse navigation
        track.scrollTo({ left: track.scrollWidth, behavior: 'auto' });
      } else {
        // normal move with smooth behavior
        track.scrollBy({ left: amount, behavior: 'smooth' });
      }
      // Allow the browser to apply the scroll position, then fade in
      requestAnimationFrame(() => {
        setTimeout(() => track.classList.remove('is-fading'), 160);
      });
    }, 120);
  }

  function goNext(){ fadeScroll(scrollAmount()); }
  function goPrev(){ fadeScroll(-scrollAmount()); }

  prev?.addEventListener('click', goPrev);
  next?.addEventListener('click', goNext);

  // Keyboard support
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  // --- Autoplay with speed control ---
  let FAST = 2000;   // 2s default (faster than 4s)
  let SLOW = 6000;   // 6s when hovering/focused
  let autoplay = null;

  function startAutoplay(interval){
    stopAutoplay();
    autoplay = setInterval(goNext, interval);
  }
  function stopAutoplay(){
    if (autoplay) clearInterval(autoplay);
    autoplay = null;
  }

  // Start fast by default
  startAutoplay(FAST);

  // Slow down (don’t pause) on hover/focus for usability
  function slowDown(){ startAutoplay(SLOW); }
  function speedUp(){ startAutoplay(FAST); }

  track.addEventListener('mouseenter', slowDown);
  track.addEventListener('mouseleave', speedUp);
  track.addEventListener('focusin', slowDown);
  track.addEventListener('focusout', speedUp);

  // Clean up if the page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay(FAST);
  });
})();
