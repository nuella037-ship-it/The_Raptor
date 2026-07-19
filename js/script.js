
// ============================================
// DATA
// ============================================

const skillsData = [
    { name: 'HTML5', icon: 'fab fa-html5', level: 95 },
    { name: 'CSS3', icon: 'fab fa-css3-alt', level: 90 },
    { name: 'JavaScript', icon: 'fab fa-js', level: 88 },
    { name: 'React', icon: 'fab fa-react', level: 82 },
    { name: 'Vue.js', icon: 'fab fa-vuejs', level: 75 },
    { name: 'Node.js', icon: 'fab fa-node-js', level: 80 },
    { name: 'Python', icon: 'fab fa-python', level: 78 },
    { name: 'PHP', icon: 'fab fa-php', level: 72 },
    { name: 'Git', icon: 'fab fa-git-alt', level: 85 },
    { name: 'Figma', icon: 'fab fa-figma', level: 70 },
    { name: 'AWS', icon: 'fab fa-aws', level: 65 },
    { name: 'Docker', icon: 'fab fa-docker', level: 60 },
];

const projectsData = [
    { id: 1, title: 'E-Commerce Platform', desc: 'Full-featured online store with payment integration.', category: 'web', icon: 'fas fa-shopping-cart', tag: 'Web App' },
    { id: 2, title: 'AI Chat Assistant', desc: 'Intelligent chatbot powered by NLP that understands context.', category: 'ai', icon: 'fas fa-robot', tag: 'AI/ML' },
    { id: 3, title: 'Fitness Tracker Mobile App', desc: 'Cross-platform app for tracking workouts and nutrition.', category: 'mobile', icon: 'fas fa-heartbeat', tag: 'Mobile' },
    { id: 4, title: 'Brand Identity Suite', desc: 'Complete branding package including logo and design system.', category: 'design', icon: 'fas fa-paint-brush', tag: 'Design' },
    { id: 5, title: 'Real Estate Dashboard', desc: 'Interactive dashboard for property management with analytics.', category: 'web', icon: 'fas fa-building', tag: 'Web App' },
    { id: 6, title: 'Smart Home IoT Hub', desc: 'Centralized control system for smart devices with voice commands.', category: 'ai', icon: 'fas fa-microchip', tag: 'AI/ML' },
];

const testimonialsData = [
    { name: 'Sarah Johnson', role: 'CEO, TechStart Inc.', text: 'John delivers high-quality work on time. His attention to detail is outstanding.', initials: 'SJ' },
    { name: 'Michael Chen', role: 'Product Manager, CloudWare', text: 'Working with John was a game-changer. He brought creative solutions that exceeded our expectations.', initials: 'MC' },
    { name: 'Emily Rodriguez', role: 'Founder, DesignLab', text: 'John has a rare combination of design sensibility and technical prowess.', initials: 'ER' },
];

// ============================================
// THEME TOGGLE
// ============================================

const toggle = document.getElementById('themeToggle');
if (toggle) {
    let theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    toggle.innerHTML = `<i class="fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}"></i>`;
    toggle.addEventListener('click', () => {
        const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        toggle.innerHTML = `<i class="fas ${t === 'dark' ? 'fa-moon' : 'fa-sun'}"></i>`;
    });
}

// ============================================
// TYPING EFFECT (only on index.html)
// ============================================

const typedText = document.getElementById('typedText');
if (typedText) {
    const roles = ['Full-Stack Developer', 'UI/UX Enthusiast', 'Problem Solver', 'Creative Thinker', 'Tech Innovator'];
    let roleIndex = 0, charIndex = 0, isDeleting = false;

    function typeEffect() {
        const current = roles[roleIndex];
        if (!isDeleting) {
            typedText.textContent = current.slice(0, charIndex + 1);
            charIndex++;
            if (charIndex === current.length) {
                isDeleting = true;
                setTimeout(typeEffect, 2400);
                return;
            }
            setTimeout(typeEffect, 80);
        } else {
            typedText.textContent = current.slice(0, charIndex);
            charIndex--;
            if (charIndex < 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                setTimeout(typeEffect, 400);
                return;
            }
            setTimeout(typeEffect, 50);
        }
    }
    typeEffect();
}

// ============================================
// RENDER SKILLS
// ============================================

const skillsGrid = document.getElementById('skillsGrid');
if (skillsGrid) {
    skillsData.forEach(skill => {
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
            <span class="icon"><i class="${skill.icon}"></i></span>
            <div class="name">${skill.name}</div>
            <div class="level"><div class="bar" data-width="${skill.level}"></div></div>
        `;
        skillsGrid.appendChild(div);
    });

    // Animate skill bars on scroll
    const skillBars = document.querySelectorAll('.skill-item .bar');
    const animateSkills = () => {
        skillBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            if (rect.top < window.innerHeight - 60) {
                bar.style.width = bar.dataset.width + '%';
            }
        });
    };
    window.addEventListener('scroll', animateSkills);
    setTimeout(animateSkills, 400);
}

// ============================================
// RENDER PROJECTS
// ============================================

const projectsGrid = document.getElementById('projectsGrid');
const featuredGrid = document.getElementById('featuredGrid');

function renderProjects(container, projects, filter = 'all') {
    if (!container) return;
    container.innerHTML = '';
    const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);
    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'project-card';
        div.innerHTML = `
            <div class="thumb"><i class="${p.icon}"></i></div>
            <div class="body">
                <span class="tag">${p.tag}</span>
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

// Featured (only 3 projects on homepage)
if (featuredGrid) {
    renderProjects(featuredGrid, projectsData.slice(0, 3));
}

// Full projects page with filters
if (projectsGrid) {
    renderProjects(projectsGrid, projectsData, 'all');

    const filters = document.getElementById('projectFilters');
    if (filters) {
        filters.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProjects(projectsGrid, projectsData, btn.dataset.filter);
        });
    }
}

// ============================================
// RENDER TESTIMONIALS
// ============================================

const testimonialsGrid = document.getElementById('testimonialsGrid');
if (testimonialsGrid) {
    testimonialsData.forEach(t => {
        const div = document.createElement('div');
        div.className = 'testimonial-card';
        div.innerHTML = `
            <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
            <blockquote>"${t.text}"</blockquote>
            <div class="author">
                <div class="avatar-sm">${t.initials}</div>
                <div class="info">
                    <div class="name">${t.name}</div>
                    <div class="role">${t.role}</div>
                </div>
            </div>
        `;
        testimonialsGrid.appendChild(div);
    });
}

// ============================================
// CONTACT FORM
// ============================================

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName')?.value.trim();
        const email = document.getElementById('contactEmail')?.value.trim();
        const message = document.getElementById('contactMessage')?.value.trim();
        const feedback = document.getElementById('contactFeedback');

        if (!name || !email || !message) {
            feedback.textContent = 'Please fill in all required fields.';
            feedback.className = 'form-feedback error';
            feedback.style.display = 'block';
            return;
        }

        feedback.textContent = 'Sending message...';
        feedback.className = 'form-feedback';
        feedback.style.display = 'block';

        setTimeout(() => {
            feedback.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
            feedback.className = 'form-feedback success';
            contactForm.reset();
            setTimeout(() => { feedback.style.display = 'none'; }, 5000);
        }, 1200);
    });
}

// ============================================
// HAMBURGER MENU
// ============================================

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });
}

// ============================================
// ACTIVE NAV LINK
// ============================================

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

console.log('🚀 Portfolio loaded successfully!');
