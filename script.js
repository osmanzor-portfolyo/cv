document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const navbar = document.getElementById('navbar');
    const themeToggle = document.getElementById('themeToggle');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const cursorGlow = document.getElementById('cursorGlow');
    const editorialFrame = document.getElementById('editorialFrame');

    // 1. Çift Tema Yönetimi (Koyu Kahve <-> Açık Krem-Kahve)
    const savedTheme = localStorage.getItem('oz_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        html.setAttribute('data-theme', savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('oz_theme', next);
    });

    // 2. Kaydırmada Navbar Arka Planı
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 24);
    }, { passive: true });

    // 3. Mobil Menü Aç/Kapat
    hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // 4. Masaüstünde Fareyi Takip Eden Yumuşak Bronz Işık
    if (window.matchMedia('(pointer: fine)').matches && cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.opacity = '1';
            cursorGlow.style.left = `${e.clientX}px`;
            cursorGlow.style.top = `${e.clientY}px`;
        });

        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });
    }

    // 5. Portre Çerçevesinde Hafif 3D Eğim Efekti
    if (editorialFrame && window.matchMedia('(pointer: fine)').matches) {
        editorialFrame.addEventListener('mousemove', (e) => {
            const rect = editorialFrame.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            editorialFrame.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
        });

        editorialFrame.addEventListener('mouseleave', () => {
            editorialFrame.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
        });
    }
    // 6. Kaydırma Animasyonları (IntersectionObserver — tüm bölümler için ortak)
    const revealItems = document.querySelectorAll('.scroll-reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14 });

        revealItems.forEach((el) => revealObserver.observe(el));
    } else {
        revealItems.forEach((el) => el.classList.add('is-visible'));
    }

    // 7. Kaydırmada Aktif Menü Linkini Güncelleme
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 180;
        sections.forEach((sec) => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // 8. Telefon ve E-posta Tek Tıkla Kopyalama
    document.querySelectorAll('.info-copy').forEach((btn) => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-copy');
            const hint = btn.querySelector('.copy-hint');
            if (!text) return;

            const onSuccess = () => {
                btn.classList.add('copied');
                if (hint) hint.textContent = 'Kopyalandı ✓';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    if (hint) hint.textContent = 'Kopyala';
                }, 2000);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(onSuccess).catch(() => { });
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                onSuccess();
            }
        });
    });
    // 9. Galeri & Lightbox (Klavye + Mobil Swipe + Thumbnail Destekli)
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxStage = document.getElementById('lightboxStage');
    const lightboxThumbs = document.getElementById('lightboxThumbs');

    if (galleryItems.length && lightbox) {
        const photos = galleryItems.map((item) => {
            const img = item.querySelector('img');
            return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
        });

        let currentIndex = 0;

        // Alt thumbnail şeridini oluştur
        photos.forEach((photo, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'lb-thumb';
            btn.setAttribute('aria-label', `Fotoğraf ${idx + 1}`);
            btn.innerHTML = `<img src="${photo.src}" alt="${photo.alt}" />`;
            btn.addEventListener('click', () => showPhoto(idx));
            lightboxThumbs.appendChild(btn);
        });

        const thumbBtns = Array.from(lightboxThumbs.querySelectorAll('.lb-thumb'));

        function showPhoto(index) {
            currentIndex = (index + photos.length) % photos.length;
            const photo = photos[currentIndex];

            lightboxImg.classList.add('switching');
            setTimeout(() => {
                lightboxImg.src = photo.src;
                lightboxImg.alt = photo.alt;
                lightboxImg.classList.remove('switching');
            }, 130);

            const num = String(currentIndex + 1).padStart(2, '0');
            const total = String(photos.length).padStart(2, '0');
            lightboxCounter.textContent = `${num} / ${total}`;

            thumbBtns.forEach((b, i) => b.classList.toggle('active', i === currentIndex));
        }

        function openLightbox(index) {
            showPhoto(index);
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        galleryItems.forEach((item, idx) => {
            item.addEventListener('click', () => openLightbox(idx));
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', () => showPhoto(currentIndex - 1));
        lightboxNext.addEventListener('click', () => showPhoto(currentIndex + 1));

        // Boş alana tıklayınca kapat
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightboxStage) {
                closeLightbox();
            }
        });

        // Klavye kontrolleri (ESC, Sol/Sağ Ok)
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPhoto(currentIndex - 1);
            if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
        });

        // Mobilde parmakla kaydırma (Swipe)
        let touchStartX = 0;
        lightboxStage.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });

        lightboxStage.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 45) {
                if (diff > 0) showPhoto(currentIndex - 1);
                else showPhoto(currentIndex + 1);
            }
        }, { passive: true });
    }
});