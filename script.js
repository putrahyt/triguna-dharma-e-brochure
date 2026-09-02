(() => {
  const book     = document.getElementById('book');
  const pages    = Array.from(book.querySelectorAll('.page'));
  const pageLeft = document.getElementById('pageLeft');
  const prevImg  = document.getElementById('prevImg');
  const spine    = document.getElementById('spine');
  const dotsWrap = document.getElementById('dots');
  const btnPrev  = document.getElementById('btnPrev');
  const btnNext  = document.getElementById('btnNext');

  const total = pages.length;   // jumlah lembar/gambar
  let current = 0;              // index halaman aktif (yang tampil di panel kanan)
  let isAnimating = false;

  // Ambil path gambar tiap halaman langsung dari markup (front face)
  const imageSrcs = pages.map(p => p.querySelector('.page__face--front img').src);

  // Titik indikator, satu per halaman
  const dots = [];
  for (let i = 0; i < total; i++) {
    const d = document.createElement('span');
    d.className = 'dot';
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
    dots.push(d);
  }

  function render() {
    pages.forEach((page, i) => {
      if (i < current) {
        // sudah dibalik ke kiri (tersembunyi di belakang panel kanan)
        page.style.transform = 'rotateY(-180deg)';
        page.style.zIndex = i;
      } else {
        // masih di tumpukan kanan (belum dibalik)
        page.style.transform = 'rotateY(0deg)';
        page.style.zIndex = total - i;
      }
    });

    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));

    // Panel kiri: tampilkan halaman sebelumnya, atau sembunyikan jika
    // sedang di halaman pertama (tidak pernah ditampilkan kosong/putih)
    if (current === 0) {
      pageLeft.classList.add('is-empty');
      spine.classList.add('is-empty');
    } else {
      prevImg.src = imageSrcs[current - 1];
      pageLeft.classList.remove('is-empty');
      spine.classList.remove('is-empty');
    }

    btnPrev.disabled = current === 0;
    btnNext.disabled = current === total - 1;
  }

  function withAnimLock(fn) {
    if (isAnimating) return;
    isAnimating = true;
    fn();
    window.setTimeout(() => { isAnimating = false; }, 850);
  }

  function next() {
    if (current >= total - 1) return;
    withAnimLock(() => { current++; render(); });
  }

  function prev() {
    if (current <= 0) return;
    withAnimLock(() => { current--; render(); });
  }

  function goTo(index) {
    if (index === current) return;
    withAnimLock(() => { current = index; render(); });
  }

  // Klik panel kanan (halaman aktif) = lanjut
  book.addEventListener('click', next);
  // Klik panel kiri (pratinjau halaman sebelumnya) = kembali
  pageLeft.addEventListener('click', prev);

  // Tombol navigasi eksplisit
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  // Navigasi keyboard
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Geser (swipe) untuk perangkat sentuh
  let touchStartX = null;
  book.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  book.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const SWIPE_THRESHOLD = 40;
    if (deltaX > SWIPE_THRESHOLD) prev();
    else if (deltaX < -SWIPE_THRESHOLD) next();
    touchStartX = null;
  });

  render();
})();