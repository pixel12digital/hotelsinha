// ---------- Smooth Scroll (fallback em browsers antigos)
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){
      const el = document.querySelector(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
    }
  });
});

// ---------- ScrollSpy simples
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
function setActive() {
  let idx = -1, fromTop = window.scrollY + 120;
  sections.forEach((s,i)=>{ if(s.offsetTop <= fromTop) idx = i; });
  navLinks.forEach(l=>l.classList.remove('active'));
  if(idx>=0){
    const id = '#' + sections[idx].id;
    const link = navLinks.find(l=>l.getAttribute('href')===id);
    if(link) link.classList.add('active');
  }
}
setActive(); window.addEventListener('scroll', setActive);

// ---------- Lazy helper (para imagens não nativas ou backgrounds)
const io = ('IntersectionObserver' in window) ? new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){
      const t=e.target, ds=t.dataset;
      if(ds.src){ t.src = ds.src; t.removeAttribute('data-src'); }
      if(ds.bg){ t.style.backgroundImage = `url('${ds.bg}')`; t.removeAttribute('data-bg'); }
      io.unobserve(t);
    }
  });
}, {rootMargin: '200px'}) : null;

function mountModernGallery(){
  
  // A galeria já está no HTML, não precisamos criar dinamicamente
  // Apenas garantir que o lightbox funcione
}

// ---------- Lightbox acessível (sem libs pesadas)
(function lightbox(){
  let overlay, currentIdx=0, items=[];
  function open(idx){
    if(!overlay){
      overlay = document.createElement('div');
      overlay.className = 'lb-overlay';
      overlay.innerHTML = `
        <button class="lb-close" aria-label="Fechar">×</button>
        <button class="lb-prev" aria-label="Anterior">‹</button>
        <img class="lb-img" alt="">
        <button class="lb-next" aria-label="Próxima">›</button>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e=>{ if(e.target===overlay) close(); });
      overlay.querySelector('.lb-close').addEventListener('click', close);
      overlay.querySelector('.lb-prev').addEventListener('click', ()=>show(currentIdx-1));
      overlay.querySelector('.lb-next').addEventListener('click', ()=>show(currentIdx+1));
      document.addEventListener('keydown', e=>{
        if(!overlay.classList.contains('open')) return;
        if(e.key==='Escape') close();
        if(e.key==='ArrowLeft') show(currentIdx-1);
        if(e.key==='ArrowRight') show(currentIdx+1);
      });
    }
    items = [...document.querySelectorAll('a[data-lightbox="gal"]')];
    overlay.classList.add('open');
    show(idx);
  }
  function close(){ overlay.classList.remove('open'); }
  function show(idx){
    if(idx<0) idx = items.length-1;
    if(idx>=items.length) idx = 0;
    currentIdx = idx;
    const src = items[currentIdx].href;
    const img = overlay.querySelector('.lb-img');
    img.src = src;
    img.focus();
  }
  document.addEventListener('click', e=>{
    const a = e.target.closest('a[data-lightbox="gal"]');
    if(!a) return;
    e.preventDefault();
    const nodes=[...document.querySelectorAll('a[data-lightbox="gal"]')];
    open(nodes.indexOf(a));
  });
})();

// ---------- Eventos para métricas (GTM/GA4) via data-evt
document.querySelectorAll('[data-evt]').forEach(el=>{
  el.addEventListener('click', ()=>{
    const id = el.dataset.evt;
    // if(window.dataLayer){ dataLayer.push({event:'cta_click', element:id}); }
  });
});

// ---------- Carrossel moderno
function initCarousel() {
  
  const carousel = document.querySelector('.carousel-container');
  if (!carousel) return;
  
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  
  let currentSlide = 0;
  let autoplayInterval;
  
  function showSlide(index) {
    // Remover classe active de todos os slides e dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Adicionar classe active ao slide e dot atual
    if (slides[index]) slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    
    currentSlide = index;
  }
  
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }
  
  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }
  
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 4000);
  }
  
  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
  }
  
  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  
  // Dots navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      stopAutoplay();
      startAutoplay();
    });
  });
  
  // Autoplay
  startAutoplay();
  
  // Pause autoplay on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!carousel.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });
  
}

// ---------- Controles de visualização
function initViewControls() {
  
  const viewToggles = document.querySelectorAll('.view-toggle');
  const gridView = document.querySelector('.grid-view');
  const carouselView = document.querySelector('.carousel-view');
  
  if (!viewToggles.length || !gridView || !carouselView) return;
  
  viewToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const view = toggle.dataset.view;
      
      // Atualizar botões ativos
      viewToggles.forEach(t => t.classList.remove('active'));
      toggle.classList.add('active');
      
      // Mostrar/ocultar visualizações
      if (view === 'grid') {
        gridView.classList.add('active');
        carouselView.classList.remove('active');
      } else if (view === 'carousel') {
        gridView.classList.remove('active');
        carouselView.classList.add('active');
        initCarousel(); // Reinicializar carrossel se necessário
      }
    });
  });
  
}

// ---------- Executar quando DOM estiver pronto
function initGallery() {
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mountModernGallery();
      initViewControls();
    });
  } else {
    mountModernGallery();
    initViewControls();
  }
}

// Executar imediatamente
initGallery();

// Fallback adicional
setTimeout(() => {
  const grid = document.querySelector('#experiencias .gallery');
  if (grid && grid.children.length === 0) {
    mountModernGallery();
  }
}, 1000);

// ============================================
// ANIMAÇÕES DE DEPOIMENTOS
// ============================================
function initTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const statsNumbers = document.querySelectorAll('.stat-number');
    
    // Animação de entrada dos cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }, observerOptions);
    
    testimonialCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(card);
    });
    
    // Animação dos números das estatísticas
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsNumbers.forEach(number => {
        statsObserver.observe(number);
    });
}

function animateNumbers(element) {
    const finalValue = element.textContent;
    const isPercentage = finalValue.includes('%');
    const isDecimal = finalValue.includes('.');
    const numericValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
    
    let currentValue = 0;
    const increment = numericValue / 60; // 1 segundo de animação (60fps)
    
    const timer = setInterval(() => {
        currentValue += increment;
        
        if (currentValue >= numericValue) {
            currentValue = numericValue;
            clearInterval(timer);
        }
        
        if (isDecimal) {
            element.textContent = currentValue.toFixed(1);
        } else {
            element.textContent = Math.floor(currentValue);
        }
        
        if (isPercentage) {
            element.textContent += '%';
        } else if (finalValue.includes('+')) {
            element.textContent += '+';
        }
    }, 16);
}

// Inicializar depoimentos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initTestimonials();
});