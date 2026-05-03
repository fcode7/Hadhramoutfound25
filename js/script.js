let chartsInitialized = false;
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(viewId);
    if(targetView) {
        targetView.classList.add('active');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    initScrollAnimations();

    if (viewId === 'dashboard-view') {
        if (!chartsInitialized) {
            setTimeout(initCharts, 100);
            chartsInitialized = true;
        }
        
        setTimeout(() => {
            initSmartCounters();
            initDynamicMajors();
        }, 150);
    }
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.view-section.active .animate-on-scroll');
    animatedElements.forEach(el => el.classList.remove('fade-in-up'));

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => scrollObserver.observe(el));
}

function initDynamicMajors() {
    const cards = document.querySelectorAll('.alumni-card');
    const total = cards.length;
    if (total === 0) return;

    let counts = { med: 0, eng: 0, it: 0, other: 0, male: 0, female: 0 };

    cards.forEach(card => {
        const major = card.querySelector('.alumni-major')?.textContent || '';
        const center = card.querySelector('.alumni-location')?.textContent || '';

        if (major.includes('طب') || major.includes('صحي') || major.includes('جراح') || major.includes('صيدل')) counts.med++;
        else if (major.includes('هندس') || major.includes('عمار')) counts.eng++;
        else if (major.includes('حاسوب') || major.includes('تقني') || major.includes('برمج') || major.includes('ذكاء')) counts.it++;
        else counts.other++;

        if (center.includes('خديجة')) {
            counts.female++;
        } else {
            counts.male++;
        }
    });

    const getPct = (count, max) => Math.round((count / max) * 100) || 0;
    
    const pcts = {
        med: getPct(counts.med, total),
        eng: getPct(counts.eng, total),
        it: getPct(counts.it, total),
        other: getPct(counts.other, total)
    };

    const totalGender = counts.male + counts.female;
    const femalePct = getPct(counts.female, totalGender);
    const malePct = getPct(counts.male, totalGender);

    const genderCircles = document.querySelectorAll('.circle-chart');
    const animateCircle = (el, targetPct) => {
        if(!el) return;
        let curr = 0;
        let step = Math.max(Math.ceil(targetPct / 30), 1);
        let timer = setInterval(() => {
            curr += step;
            if(curr >= targetPct) {
                curr = targetPct;
                clearInterval(timer);
            }
            el.textContent = curr + '٪';
        }, 40);
    };

    const progressItems = document.querySelectorAll('.progress-item');
    const animateProgress = (item, pct) => {
        if(!item) return;
        const span = item.querySelector('.progress-labels span:nth-child(2)');
        const bar = item.querySelector('.progress-fill');
        
        if (bar) bar.style.width = '0%'; 

        if (span && bar) {
            let curr = 0;
            let step = Math.max(Math.ceil(pct / 20), 1);
            let timer = setInterval(() => {
                curr += step;
                if(curr >= pct) {
                    curr = pct;
                    clearInterval(timer);
                }
                span.textContent = curr + '٪';
            }, 50);

            setTimeout(() => {
                bar.style.transition = 'width 1.5s ease-in-out';
                bar.style.width = pct + '%';
            }, 100);
        }
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                if(progressItems.length >= 4) {
                    animateProgress(progressItems[0], pcts.med);
                    animateProgress(progressItems[1], pcts.eng);
                    animateProgress(progressItems[2], pcts.it);
                    animateProgress(progressItems[3], pcts.other);
                }
                if(genderCircles.length >= 2) {
                    animateCircle(genderCircles[0], femalePct);
                    animateCircle(genderCircles[1], malePct);   
                }
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const banner = document.querySelector('.progress-section');
    if(banner) observer.observe(banner);
}

function initSmartCounters() {
    const counters = document.querySelectorAll('.smart-counter');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const targetValue = parseInt(el.getAttribute('data-value')) || 0;
                const prefix = el.getAttribute('data-prefix') || '';
                const suffix = el.getAttribute('data-suffix') || '';
                
                let currentValue = 0;
                const duration = 2000;
                const step = Math.max(Math.ceil(targetValue / (duration / 30)), 1); 
                
                const timer = setInterval(() => {
                    currentValue += step;
                    if (currentValue >= targetValue) {
                        el.textContent = prefix + targetValue.toLocaleString('en-US') + suffix;
                        clearInterval(timer);
                    } else {
                        el.textContent = prefix + currentValue.toLocaleString('en-US') + suffix;
                    }
                }, 30);
                
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initSmartCounters();
    initDynamicMajors();

    const header = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('.nav-links .nav-item').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetView = this.getAttribute('data-target');
            if (targetView && !document.getElementById(targetView).classList.contains('active')) {
                e.preventDefault();
                switchView(targetView);
            }

            document.querySelectorAll('.nav-links .nav-item').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelector('.nav-links').classList.remove('active-menu');
        });
    });
});

function initCharts() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.font.family = "'Tajawal', sans-serif";
    Chart.defaults.color = '#636e72';

    const ctxMajors = document.getElementById('majorsChart');
    if(ctxMajors) {
        new Chart(ctxMajors, {
            type: 'doughnut',
            data: {
                labels: ['الهندسة', 'الطب', 'التقنية', 'أخرى'],
                datasets: [{
                    data: [350, 160, 50, 20],
                    backgroundColor: ['#0f6c51', '#d99645', '#2d3436', '#e0e0e0'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
            }
        });
    }

    const ctxGrowth = document.getElementById('growthChart');
    if(ctxGrowth) {
        new Chart(ctxGrowth, {
            type: 'line',
            data: {
                labels: ['2002', '2005', '2010', '2015', '2020', '2025'],
                datasets: [{
                    label: 'عدد الخريجين',
                    data: [100, 250, 350, 450, 600, 850],
                    borderColor: '#0f6c51',
                    backgroundColor: 'rgba(15, 108, 81, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { borderDash: [5, 5], color: '#f0f0f0' }, beginAtZero: true }
                }
            }
        });
    }

    const ctxYears = document.getElementById('yearsChart');
    if(ctxYears) {
        new Chart(ctxYears, {
            type: 'bar',
            data: {
                labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
                datasets: [{
                    label: 'الخريجون',
                    data: [26, 24, 28, 22, 30, 38, 14, 34],
                    backgroundColor: '#0f6c51',
                    borderRadius: 4 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { display: false }
                }
            }
        });
    }
}

function showAllAlumni() {
    const hiddenCards = document.querySelectorAll('.hidden-card');
    hiddenCards.forEach(card => {
        card.classList.remove('hidden-card');
        card.classList.add('show-card');
    });
    
    const loadMoreWrapper = document.getElementById('load-more-wrapper');
    if(loadMoreWrapper) loadMoreWrapper.style.display = 'none';
}

function openAlumniModal(name, major, year, center, age, gender, imgSrc, quote) {
    document.getElementById('modal-name').innerText = name;
    document.getElementById('modal-major').innerText = major;
    document.getElementById('modal-year').innerHTML = year + ' <i class="far fa-calendar-alt"></i>';
    document.getElementById('modal-center').innerHTML = center + ' <i class="far fa-building"></i>';
    document.getElementById('modal-age').innerHTML = age + ' سنة <i class="far fa-user"></i>';
    document.getElementById('modal-gender').innerHTML = gender + (gender === 'ذكر' ? ' <i class="fas fa-mars"></i>' : ' <i class="fas fa-venus"></i>');
    document.getElementById('modal-img').src = imgSrc;
    
    const quoteElement = document.getElementById('modal-quote-text');
    if (quote) {
        quoteElement.innerText = '"' + quote + '"';
    } else {
        quoteElement.innerText = '"كانت رحلتي في المؤسسة أكثر من مجرد مسار أكاديمي، لقد كانت بيئة لبناء الشخصية."';
    }
    
    const modal = document.getElementById('alumni-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeAlumniModal() {
    const modal = document.getElementById('alumni-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

async function shareAlumniProfile() {
    const modalContent = document.querySelector('.modal-content'); 
    const name = document.getElementById('modal-name').innerText;
    
    const shareText = `نحتفي اليوم بخريجنا المتميز ${name}. \nشاهد مسيرته وكلمته الملهمة عبر الرابط:`;
    const shareUrl = window.location.href; 

    const shareBtn = document.querySelector('.btn-print');
    const originalBtnText = shareBtn.innerHTML;
    shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التجهيز...';
    shareBtn.disabled = true;

    try {
        const canvas = await html2canvas(modalContent, {
            scale: 5, 
            useCORS: true, 
            allowTaint: true,
            backgroundColor: '#ffffff',
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight,
            onclone: (clonedDoc) => {
                const clonedModal = clonedDoc.querySelector('.modal-content');
                if (clonedModal) {
                    clonedModal.style.maxHeight = 'none';
                    clonedModal.style.height = 'auto';
                    clonedModal.style.overflow = 'visible';
                    clonedModal.style.position = 'relative';
                    clonedModal.style.boxShadow = 'none'; 
                    clonedModal.style.transform = 'none'; 
                    clonedModal.style.margin = '0'; 
                }

                const clonedActions = clonedDoc.querySelector('.modal-actions');
                if (clonedActions) clonedActions.style.display = 'none';

                const closeIcon = clonedDoc.querySelector('.fa-times, .close, button[onclick="closeAlumniModal()"]');
                if (closeIcon) closeIcon.style.display = 'none';
            }
        });

        const imageDataUrl = canvas.toDataURL('image/png');

        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `alumni-${name}.png`, { type: 'image/png' });

        const shareData = {
            title: `بطاقة خريج: ${name}`,
            text: `${shareText}\n${shareUrl}`, 
            files: [file] 
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            const link = document.createElement('a');
            link.download = `alumni-${name}.png`;
            link.href = imageDataUrl;
            link.click();
        }

    } catch (error) {
        console.error(error);
        alert('عذراً، حدث خطأ غير متوقع أثناء تجهيز البطاقة للمشاركة.');
    } finally {
        shareBtn.innerHTML = originalBtnText;
        shareBtn.disabled = false;
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('alumni-modal');
    if (event.target == modal) {
        closeAlumniModal();
    }
}

function goToPage(targetId) {
    const navLink = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if (navLink) navLink.click();

    setTimeout(() => {
        window.scrollTo(0, 1);
        window.dispatchEvent(new Event('scroll'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

function filterAlumni() {
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
    const majorValue = document.getElementById('majorFilter').value;
    const centerValue = document.getElementById('centerFilter').value;
    const alumniCards = document.querySelectorAll('.alumni-card');
    const loadMoreBtn = document.getElementById('load-more-wrapper');
    
    let isFiltering = searchText !== "" || majorValue !== "all" || centerValue !== "all";

    if (loadMoreBtn) loadMoreBtn.style.display = isFiltering ? 'none' : 'flex';

    alumniCards.forEach(card => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const major = card.querySelector('.alumni-major')?.textContent || '';
        const center = card.querySelector('.alumni-location')?.textContent || '';

        const matchSearch = name.includes(searchText) || major.includes(searchText);
        let matchMajor = false;
        
        if (majorValue === 'all') {
            matchMajor = true;
        } else if (majorValue === 'طب') {
            matchMajor = major.includes('طب') || major.includes('تمريض') || major.includes('صيدلة') || major.includes('مختبرات');
        } else if (majorValue === 'حاسوب') {
            matchMajor = major.includes('حاسوب') || major.includes('تقنية');
        } else if (majorValue === 'محاسبة') {
            matchMajor = major.includes('محاسبة') || major.includes('إدارة أعمال') || major.includes('نظم معلومات') || major.includes('لغة');
        } else {
            matchMajor = major.includes(majorValue);
        }
        // ==========================================

        const matchCenter = (centerValue === 'all' || center.includes(centerValue));

        if (matchSearch && matchMajor && matchCenter) {
            card.style.display = ''; 
            if(isFiltering) card.classList.remove('hidden-card');
        } else {
            card.style.display = 'none';
        }
    });

    if (!isFiltering) {
        const hiddenCards = document.querySelectorAll('.alumni-grid .alumni-card:nth-child(n+5)');
        hiddenCards.forEach(c => {
            c.classList.add('hidden-card');
            c.style.display = '';
        });
    }
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active-menu');
}
