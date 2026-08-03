// ============================================================
// SUPABASE CONFIG
// ============================================================
const SUPABASE_URL = "https://aslkopamkdnvofjqzgjz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yZ8KyiOxJT3GBR_6wX1Plw_Yt_5IQ6f";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global articles array
let allArticles = [];

// ============================================================
// FETCH ARTICLES
// ============================================================
async function fetchArticles() {
    console.log('🔵 fetchArticles() called');
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        allArticles = data || [];
        console.log(`🔵 Fetched ${allArticles.length} articles`);
    } catch (e) {
        console.warn('⚠️ Supabase fetch failed:', e);
        allArticles = [];
    }
}

// ============================================================
// RENDER FUNCTIONS (unchanged – keep your existing ones)
// ============================================================
function renderArticleCard(article, colClass = 'col-md-6 col-lg-4') {
    const image = article.image || 'https://picsum.photos/seed/default/600/300';
    return `
        <div class="${colClass}">
            <div class="article-card">
                <img src="${image}" alt="${article.title}" loading="lazy" />
                <div class="card-body">
                    <span class="badge bg-primary mb-2">${article.category}</span>
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text">${article.excerpt || article.content?.substring(0, 120) || ''}…</p>
                    <div class="card-meta">${article.author} • ${article.date}</div>
                </div>
            </div>
        </div>
    `;
}

function renderLatest(containerId = 'latestArticlesContainer', limit = 6) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const latest = allArticles.slice(0, limit);
    if (latest.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No articles found.</div>`;
        return;
    }
    container.innerHTML = latest.map(a => renderArticleCard(a, 'col-md-6 col-lg-4')).join('');
}

function renderTrending(containerId = 'trendingContainer', limit = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const trending = allArticles.filter(a => a.trending).slice(0, limit);
    if (trending.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No trending stories.</div>`;
        return;
    }
    container.innerHTML = trending.map(a => renderArticleCard(a, 'col-md-6 col-lg-3')).join('');
}

let currentPage = 1;
const pageSize = 6;

function renderBlogArticles(containerId = 'blogArticlesContainer', category = 'all', page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let articles = category === 'all' ? allArticles : allArticles.filter(a => a.category?.toLowerCase() === category.toLowerCase());
    const totalArticles = articles.length;
    const totalPages = Math.ceil(totalArticles / pageSize) || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageArticles = articles.slice(start, end);

    if (pageArticles.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-5">No articles in this category.</div>`;
    } else {
        container.innerHTML = pageArticles.map(a => renderArticleCard(a, 'col-md-6 col-lg-4')).join('');
    }

    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        resultCount.textContent = `Showing ${start + 1}–${Math.min(end, totalArticles)} of ${totalArticles} articles`;
    }

    renderPagination(totalPages, page, category);
}

function renderPagination(totalPages, currentPage, category) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    let html = '';
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage - 1}" data-category="${category}">Previous</a></li>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}" data-category="${category}">${i}</a></li>`;
    }
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage + 1}" data-category="${category}">Next</a></li>`;
    container.innerHTML = html;

    container.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.dataset.page);
            const cat = this.dataset.category || 'all';
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                renderBlogArticles('blogArticlesContainer', cat, page);
                window.scrollTo({ top: document.getElementById('articleGrid').offsetTop - 20, behavior: 'smooth' });
            }
        });
    });
}

function renderFeatured(containerId = 'featuredContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const featured = allArticles.find(a => a.featured === true) || allArticles[0];
    if (!featured) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No featured story.</div>`;
        return;
    }
    container.innerHTML = `
        <div class="col-md-6">
            <img src="${featured.image || 'https://picsum.photos/seed/featured/600/400'}" alt="${featured.title}" class="img-fluid rounded-3" />
        </div>
        <div class="col-md-6">
            <span class="badge bg-primary mb-2">Featured</span>
            <h2 class="fw-bold">${featured.title}</h2>
            <p>${featured.excerpt || featured.content?.substring(0, 200) || ''}…</p>
            <div class="text-muted small">${featured.author} • ${featured.date}</div>
            <a href="blog.html" class="btn btn-primary mt-2">Read more</a>
        </div>
    `;
}

function renderHeroFeatured(containerId = 'heroRow') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const featured = allArticles.find(a => a.featured === true) || allArticles[0];
    if (!featured) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No featured article.</div>`;
        return;
    }
    container.innerHTML = `
        <div class="col-md-6">
            <img src="${featured.image || 'https://picsum.photos/seed/hero/800/500'}" alt="${featured.title}" class="img-fluid rounded-3" />
        </div>
        <div class="col-md-6">
            <span class="badge bg-primary me-2">Exclusive</span>
            <span class="badge bg-secondary">${featured.date || 'Recent'}</span>
            <h2 class="hero-title mt-2">${featured.title}</h2>
            <div class="article-meta text-muted small mb-3">
                By <strong>${featured.author}</strong> • ${featured.readTime || '4 min read'} • <i class="fas fa-comment"></i> ${featured.comments || 0} comments
            </div>
            <p>${featured.excerpt || featured.content?.substring(0, 160) || ''}…</p>
            <div class="d-flex gap-2">
                <a href="blog.html" class="btn btn-primary">Read full story →</a>
                <a href="#" class="btn btn-outline-secondary" aria-label="Share"><i class="fas fa-share-alt"></i> Share</a>
                <a href="#" class="btn btn-outline-secondary" aria-label="Save"><i class="fas fa-bookmark"></i> Save</a>
            </div>
        </div>
    `;
}

function renderCategoryCards(containerId = 'categoriesContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const categoryMap = {};
    allArticles.forEach(article => {
        const cat = article.category || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categories = Object.keys(categoryMap);
    if (categories.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No categories found.</div>`;
        return;
    }
    const iconMap = {
        'world': 'fa-globe-americas',
        'technology': 'fa-microchip',
        'business': 'fa-chart-pie',
        'sports': 'fa-football-ball',
        'culture': 'fa-paint-brush',
        'science': 'fa-flask',
        'health': 'fa-heartbeat',
        'travel': 'fa-plane'
    };
    let html = '';
    categories.forEach(cat => {
        const key = cat.toLowerCase();
        const icon = iconMap[key] || 'fa-tag';
        const count = categoryMap[cat];
        html += `
            <div class="col-6 col-md-3">
                <a href="blog.html?category=${encodeURIComponent(cat)}" class="category-card d-block text-center p-3 border rounded-3 text-decoration-none">
                    <i class="fas ${icon} text-primary fa-2x"></i>
                    <h5 class="mt-2">${cat}</h5>
                    <span class="text-muted small category-count">${count} articles</span>
                </a>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderFilterButtons() {
    const container = document.getElementById('filterButtons');
    if (!container) return;
    const categories = [...new Set(allArticles.map(a => a.category).filter(Boolean))];
    if (categories.length === 0) {
        container.innerHTML = `<span class="text-muted">No categories available.</span>`;
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category') || 'all';
    let html = `<button class="btn btn-sm btn-${currentCategory === 'all' ? 'primary' : 'outline-primary'} filter-btn" data-category="all" aria-pressed="${currentCategory === 'all' ? 'true' : 'false'}">All</button>`;
    categories.forEach(cat => {
        const isActive = cat.toLowerCase() === currentCategory.toLowerCase();
        html += `<button class="btn btn-sm btn-${isActive ? 'primary' : 'outline-primary'} filter-btn" data-category="${cat}" aria-pressed="${isActive ? 'true' : 'false'}">${cat}</button>`;
    });
    container.innerHTML = html;
    setupCategoryFilters();
}

function renderFooterCategories() {
    const container = document.getElementById('footerCategoryList');
    if (!container) return;
    const categoryMap = {};
    allArticles.forEach(article => {
        const cat = article.category || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categories = Object.keys(categoryMap);
    if (categories.length === 0) {
        container.innerHTML = `<li class="text-muted small">No categories</li>`;
        return;
    }
    let html = '';
    categories.forEach(cat => {
        const count = categoryMap[cat];
        html += `<li><a href="blog.html?category=${encodeURIComponent(cat)}" class="text-muted text-decoration-none">${cat}</a> (${count})</li>`;
    });
    container.innerHTML = html;
}

function setupCategoryFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.removeEventListener('click', handleFilterClick);
        btn.addEventListener('click', handleFilterClick);
    });
}

function handleFilterClick(e) {
    const btn = e.currentTarget;
    const category = btn.dataset.category;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-primary');
        b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.remove('btn-outline-primary');
    btn.classList.add('btn-primary');
    btn.setAttribute('aria-pressed', 'true');
    const url = new URL(window.location);
    url.searchParams.set('category', category);
    window.history.pushState({}, '', url);
    renderBlogArticles('blogArticlesContainer', category, 1);
    renderFilterButtons();
}

function updateBreakingNews() {
    const el = document.getElementById('breakingText');
    if (!el) return;
    if (allArticles.length === 0) {
        el.textContent = 'No breaking news at the moment.';
        return;
    }
    const breaking = allArticles.find(a => a.breaking) || allArticles[0];
    el.textContent = breaking.title;
}

function updateArticleCount() {
    const el = document.getElementById('articleCount');
    if (el) el.textContent = allArticles.length;
}
function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (!el) return;
    if (allArticles.length === 0) {
        el.textContent = 'never';
        return;
    }
    const latest = allArticles[0];
    const date = latest.date || new Date(latest.created_at).toLocaleDateString();
    el.textContent = date;
}

// ============================================================
// SEARCH
// ============================================================
function performSearch(query) {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
        container.style.display = 'none';
        return;
    }
    const results = allArticles.filter(article =>
        article.title?.toLowerCase().includes(q) ||
        article.excerpt?.toLowerCase().includes(q) ||
        article.content?.toLowerCase().includes(q) ||
        article.category?.toLowerCase().includes(q) ||
        article.author?.toLowerCase().includes(q) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(q)))
    );
    if (results.length === 0) {
        container.innerHTML = '<div class="p-2 text-muted">No articles found.</div>';
        container.style.display = 'block';
        return;
    }
    let html = '';
    results.slice(0, 8).forEach(article => {
        html += `
            <div class="result-item">
                <div class="result-title"><a href="blog.html" class="text-decoration-none">${article.title}</a></div>
                <div class="result-meta">${article.category} • ${article.author} • ${article.date}</div>
            </div>
        `;
    });
    container.innerHTML = html;
    container.style.display = 'block';
}

// ============================================================
// DARK MODE – WITH LOGGING
// ============================================================
function initDarkMode() {
    console.log('🔵 initDarkMode() called');
    const toggle = document.getElementById('darkModeToggle');
    console.log('🔵 toggle element:', toggle);
    if (!toggle) {
        console.warn('⚠️ Dark mode toggle not found!');
        return;
    }
    // Restore saved state
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const icon = toggle.querySelector('i');
        if (icon) icon.className = 'fas fa-sun';
        console.log('🔵 Dark mode restored from localStorage');
    }
    // Add click listener
    toggle.addEventListener('click', function() {
        console.log('🔵 Dark mode toggle clicked');
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        if (!icon) return;
        const isDark = document.body.classList.contains('dark-mode');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('darkMode', isDark);
        console.log('🔵 Dark mode now:', isDark ? 'ON' : 'OFF');
    });
}

// ============================================================
// MOBILE MENU – WITH LOGGING
// ============================================================
function initMobileMenu() {
    console.log('🔵 initMobileMenu() called');
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('mobileNav');
    console.log('🔵 toggle:', toggle, 'nav:', nav);
    if (!toggle || !nav) {
        console.warn('⚠️ Mobile menu elements not found!');
        return;
    }
    toggle.addEventListener('click', function() {
        console.log('🔵 Mobile toggle clicked');
        const isOpen = nav.style.display === 'block';
        nav.style.display = isOpen ? 'none' : 'block';
        this.setAttribute('aria-expanded', !isOpen);
        console.log('🔵 Mobile menu now:', isOpen ? 'closed' : 'open');
    });
    // Auto-close on window resize (desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            nav.style.display = 'none';
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================================
// SEARCH EVENTS
// ============================================================
function initSearchEvents() {
    const navInput = document.getElementById('navSearchInput');
    const navBtn = document.getElementById('navSearchBtn');
    const mobileInput = document.getElementById('mobileSearchInput');
    const mobileBtn = document.getElementById('mobileSearchBtn');
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;

    function handleSearch(input) {
        if (input) performSearch(input.value);
    }

    if (navInput) {
        navInput.addEventListener('input', function() { handleSearch(this); });
        navInput.addEventListener('blur', function() { setTimeout(() => { container.style.display = 'none'; }, 300); });
        navInput.addEventListener('focus', function() { if (this.value.length > 0) handleSearch(this); });
        if (navBtn) navBtn.addEventListener('click', function(e) { e.preventDefault(); handleSearch(navInput); });
    }
    if (mobileInput) {
        mobileInput.addEventListener('input', function() { handleSearch(this); });
        if (mobileBtn) mobileBtn.addEventListener('click', function(e) { e.preventDefault(); handleSearch(mobileInput); });
    }
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#searchResultsContainer') && !e.target.closest('.search-nav-item') && !e.target.closest('.search-mobile')) {
            container.style.display = 'none';
        }
    });
}

// ============================================================
// NEWSLETTER FORM
// ============================================================
async function subscribeNewsletter(email, frequency) {
    try {
        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email, frequency }]);
        if (error) {
            if (error.code === '23505') return { success: false, message: 'You are already subscribed!' };
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (e) {
        let subs = JSON.parse(localStorage.getItem('newsletter_subs') || '[]');
        if (subs.find(s => s.email === email)) {
            return { success: false, message: 'You are already subscribed!' };
        }
        subs.push({ email, frequency, created_at: new Date().toISOString() });
        localStorage.setItem('newsletter_subs', JSON.stringify(subs));
        return { success: true };
    }
}

function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const emailInput = document.getElementById('newsletterEmail');
        const selectInput = document.getElementById('newsletterFrequency');
        const email = emailInput.value.trim();
        const frequency = selectInput ? selectInput.value : 'daily';

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please enter a valid email address.', 'error');
            emailInput.focus();
            return;
        }

        const submitBtn = document.getElementById('newsletterSubmitBtn');
        const text = document.getElementById('newsletterSubmitText');
        const spinner = document.getElementById('newsletterSubmitSpinner');
        text.classList.add('d-none');
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;

        const result = await subscribeNewsletter(email, frequency);

        text.classList.remove('d-none');
        spinner.classList.add('d-none');
        submitBtn.disabled = false;

        if (result.success) {
            document.getElementById('newsletterSuccess').classList.remove('d-none');
            form.reset();
            showToast('You\'re on the list!', 'success');
        } else {
            showToast(result.message || 'Something went wrong.', 'error');
        }
    });
}

// ============================================================
// CONTACT FORM
// ============================================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value.trim();
        const agree = document.getElementById('agreeCheck').checked;
        const newsletter = document.getElementById('newsletterOptIn')?.checked || false;

        if (!name || !email || !subject || !message || !agree) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        const submitBtn = document.getElementById('contactSubmitBtn');
        const text = document.getElementById('contactSubmitText');
        const spinner = document.getElementById('contactSubmitSpinner');
        text.classList.add('d-none');
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;

        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([{ name, email, phone, subject, message, newsletter_optin: newsletter }]);
            if (error) throw error;
            document.getElementById('contactSuccess').classList.remove('d-none');
            form.reset();
            showToast('Message sent! We\'ll get back to you soon.', 'success');
        } catch (e) {
            showToast('Failed to send. Please try again later.', 'error');
        } finally {
            text.classList.remove('d-none');
            spinner.classList.add('d-none');
            submitBtn.disabled = false;
        }
    });
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toastMessage');
    if (!toast) {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;background:#fff;border-radius:12px;padding:12px 20px;box-shadow:0 8px 24px rgba(0,0,0,0.15);border-left:4px solid ' + (type === 'error' ? '#dc3545' : '#1e8449') + ';max-width:350px;';
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4000);
        return;
    }
    toast.textContent = message;
    toast.className = 'toast';
    if (type === 'error') toast.classList.add('error');
    toast.style.display = 'block';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

// ============================================================
// SINGLE INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔵 DOMContentLoaded fired');
    await fetchArticles();
    console.log('🔵 Articles loaded:', allArticles.length);

    // ---- HOMEPAGE ----
    const isHome = document.getElementById('heroRow') !== null;
    const isBlog = document.getElementById('blogArticlesContainer') !== null;

    if (isHome) {
        console.log('🔵 Homepage detected');
        renderHeroFeatured('heroRow');
        renderLatest('latestArticlesContainer');
        renderTrending('trendingContainer');
        updateBreakingNews();
        renderCategoryCards('categoriesContainer');
    }

    if (isBlog) {
        console.log('🔵 Blog page detected');
        renderFeatured('featuredContainer');
        renderFilterButtons();
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || 'all';
        renderBlogArticles('blogArticlesContainer', category, 1);
        updateArticleCount();
        updateLastUpdated();
        renderTrending('trendingContainerBlog', 4);
    }

    // ---- ALWAYS RUN THESE ----
    console.log('🔵 Initializing dark mode...');
    initDarkMode();
    console.log('🔵 Initializing mobile menu...');
    initMobileMenu();
    console.log('🔵 Initializing search...');
    initSearchEvents();
    console.log('🔵 Initializing newsletter...');
    initNewsletter();
    console.log('🔵 Initializing contact form...');
    initContactForm();
    console.log('🔵 Rendering footer categories...');
    renderFooterCategories();

    console.log('✅ The Raptor site initialized.');
});
