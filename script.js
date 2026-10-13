let audioCtx;

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Fungsi membuat suara Water Drop (Pop lembut)
function playWaterDropSound() {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    osc.type = 'sine';

    // Pitch naik cepat
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    // Volume attack & decay
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.6, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.25);
}

// Fungsi membuat Efek Ripple Visual
function createRipple(event, element) {
    const circle = document.createElement("span");
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;

    const rect = element.getBoundingClientRect();

    // Handle touch vs mouse event for accurate position
    let clientX, clientY;
    if (event.type.includes('touch') && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX || rect.left + radius;
        clientY = event.clientY || rect.top + radius;
    }

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${clientX - rect.left - radius}px`;
    circle.style.top = `${clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const existingRipple = element.querySelector('.ripple');
    if(existingRipple) existingRipple.remove();

    element.appendChild(circle);

    setTimeout(() => {
        if(circle && circle.parentNode) circle.remove();
    }, 800);
}

function updateDots(container, dotsId) {
    const scrollLeft = container.scrollLeft;
    const slideWidth = container.clientWidth;

    // Dapatkan index aktif berdasarkan posisi scroll
    const activeIndex = Math.round(scrollLeft / slideWidth);

    const dotsContainer = document.getElementById(dotsId);
    if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const interactiveElements = document.querySelectorAll('.interactive-element');

    interactiveElements.forEach(el => {
        // Gunakan pointerdown agar mensupport mouse & touch secara bersamaan
        el.addEventListener('pointerdown', (e) => {
            initAudio();
            playWaterDropSound();

            if(getComputedStyle(el).position === 'static') {
                el.style.position = 'relative';
                el.style.overflow = 'hidden';
            }
            requestAnimationFrame(() => {
                createRipple(e, el);
            });
        });
    });

    const projectToggleBtn = document.getElementById('projectToggleBtn');
    const projectWrapper = document.getElementById('projectWrapper');

    const viewCategories = document.getElementById('viewCategories');
    const viewProjects = document.getElementById('viewProjects');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const btnBackCategories = document.getElementById('btnBackCategories');
    const projectLists = document.querySelectorAll('.project-list');

    projectToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        projectToggleBtn.classList.toggle('is-open');
        projectWrapper.classList.toggle('open');

        // Auto-scroll ke bawah saat menu dibuka
        if(projectWrapper.classList.contains('open')) {
            setTimeout(() => {
                window.scrollBy({ top: 350, behavior: 'smooth' });
            }, 300); 
        } else {
            // Reset ke menu awal kategori jika ditutup
            setTimeout(() => {
                viewProjects.classList.add('hidden');
                viewProjects.classList.remove('flex');
                viewCategories.classList.remove('hidden');
                viewCategories.classList.add('flex');
            }, 500);
        }
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            // Sembunyikan semua list anak
            projectLists.forEach(list => {
                list.classList.add('hidden');
                list.classList.remove('flex');
            });

            // Tampilkan hanya list yang dipilih
            const targetList = document.getElementById('list-' + targetId);
            if(targetList) {
                targetList.classList.remove('hidden');
                targetList.classList.add('flex');
                // Reset scroll horizontal slider ke paling kiri
                const carousel = targetList.querySelector('.carousel-container');
                if (carousel) carousel.scrollLeft = 0;
            }

            // Ganti view
            viewCategories.classList.add('hidden');
            viewCategories.classList.remove('flex');

            viewProjects.classList.remove('hidden');
            viewProjects.classList.add('flex');
        });
    });

    btnBackCategories.addEventListener('click', () => {
        viewProjects.classList.add('hidden');
        viewProjects.classList.remove('flex');

        viewCategories.classList.remove('hidden');
        viewCategories.classList.add('flex');
    });

    // Logika Custom Modal
    const modal = document.getElementById('warningModal');
    const btnCancel = document.getElementById('btnCancel');
    const btnProceed = document.getElementById('btnProceed');
    let pendingUrl = '';

    document.querySelectorAll('.project-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            pendingUrl = link.href;
            modal.classList.add('active'); 
        });
    });

    btnCancel.addEventListener('click', () => {
        modal.classList.remove('active');
        pendingUrl = '';
    });

    btnProceed.addEventListener('click', () => {
        if(pendingUrl) {
            window.open(pendingUrl, '_blank');
        }
        modal.classList.remove('active');
        pendingUrl = '';
    });
});