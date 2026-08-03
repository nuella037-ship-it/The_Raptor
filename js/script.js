// ============================================================
// SUPABASE CONFIG
// ============================================================
const SUPABASE_URL = "https://aslkopamkdnvofjqzgjz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yZ8KyiOxJT3GBR_6wX1Plw_Yt_5IQ6f";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// MOCK DATA (fallback if Supabase fails)
// ============================================================
const mockArticles = [
    {
        id: 1,
        title: "AI Breakthrough in Medical Imaging Detects Early-Stage Cancers",
        category: "Technology",
        excerpt: "Researchers at Stanford have developed a new deep-learning model that analyses MRI and CT scans with 98.7% accuracy…",
        content: "Full content here...",
        author: "Dr. Elena Moore",
        date: "May 17, 2026",
        image: "https://picsum.photos/seed/tech/600/300",
        tags: ["AI", "Healthcare"],
        featured: true,
        trending: true
    },
    {
        id: 2,
        title: "Global Markets Rally as Tech Giants Post Record Earnings",
        category: "Business",
        excerpt: "The S&P 500 and NASDAQ surged over 3% after Apple, Microsoft, and Nvidia reported quarterly results…",
        content: "Full content here...",
        author: "James Carter",
        date: "May 16, 2026",
        image: "https://picsum.photos/seed/business/600/300",
        tags: ["Finance", "Stocks"],
        featured: false,
        trending: true
    },
    {
        id: 3,
        title: "Champions League Final: Underdogs Stun Favourites in Extra Time",
        category: "Sports",
        excerpt: "In one of the most dramatic finals in recent memory, Borussia Dortmund defeated Real Madrid 3–2…",
        content: "Full content here...",
        author: "Maria Santos",
        date: "May 15, 2026",
        image: "https://picsum.photos/seed/sports/600/300",
        tags: ["Football", "UEFA"],
        featured: false,
        trending: true
    },
    {
        id: 4,
        title: "Street Art Festival Transforms Downtown with 50+ Murals",
        category: "Culture",
        excerpt: "Over 150 international artists descended on the city for the annual Mural Fest…",
        content: "Full content here...",
        author: "Liam O'Brien",
        date: "May 14, 2026",
        image: "https://picsum.photos/seed/culture/600/300",
        tags: ["Art", "Community"],
        featured: false,
        trending: false
    },
    {
        id: 5,
        title: "Scientists Successfully Grow Mini-Brains with Functional Neural Networks",
        category: "Science",
        excerpt: "In a groundbreaking study published in Nature, a team from MIT has cultivated cerebral organoids…",
        content: "Full content here...",
        author: "Dr. Aisha Khan",
        date: "May 13, 2026",
        image: "https://picsum.photos/seed/science/600/300",
        tags: ["Neuroscience", "Research"],
        featured: false,
        trending: false
    }
];

// Global articles array (will be populated from Supabase or mock)
let allArticles = [];

// ============================================================
// FETCH ARTICLES
// ============================================================
async function fetchArticles() {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
            allArticles = data;
            return;
        }
    } catch (e) {
        console.warn('Supabase fetch failed, using mock data', e);
    }
    // Fallback to mock
    allArticles = mockArticles;
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================

// Render a single article card (Bootstrap column)
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

// Render latest stories on homepage
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

// Render trending on homepage or blog
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

// Render blog articles with category filter
let currentCategory = 'all';
let filteredArticles = [];

function renderBlogArticles(containerId = 'blogArticlesContainer', category = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;
    currentCategory = category;
    if (category === 'all') {
        filteredArticles = allArticles;
    } else {
        filteredArticles = allArticles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }
    if (filteredArticles.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-5">No articles in this category.</div>`;
        document.getElementById('resultCount').textContent = `Showing 0 articles`;
        return;
    }
    container.innerHTML = filteredArticles.map(a => renderArticleCard(a, 'col-md-6 col-lg-4')).join('');
    document.getElementById('resultCount').textContent = `Showing ${filteredArticles.length} articles`;
}

// Render featured story on blog page
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

// ============================================================
// BREAKING NEWS TICKER
// ============================================================
function updateBreakingNews() {
    const el = document.getElementById('breakingText');
    if (!el) return;
    if (allArticles.length === 0) {
        el.textContent = 'No breaking news at the moment.';
        return;
    }
    // Use the latest article as breaking, or pick one with a 'breaking' flag
    const breaking = allArticles.find(a => a.breaking) || allArticles[0];
    el.textContent = breaking.title;
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
        article.title.toLowerCase().includes(q) ||
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
// DARK MODE
// ============================================================
function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        toggle.querySelector('i').className = 'fas fa-sun';
    }
    toggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        const isDark = document.body.classList.contains('dark-mode');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('darkMode', isDark);
    });
}

// ============================================================
// MOBILE MENU
// ============================================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('mobileNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function() {
        const isOpen = nav.style.display === 'block';
        nav.style.display = isOpen ? 'none' : 'block';
        this.setAttribute('aria-expanded', !isOpen);
    });
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
    // Close on outside click
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
        // Fallback: store in localStorage
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
// BLOG CATEGORY FILTERS
// ============================================================
function setupCategoryFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    if (!buttons.length) return;
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            buttons.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-primary');
                b.setAttribute('aria-pressed', 'false');
            });
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
            this.setAttribute('aria-pressed', 'true');
            renderBlogArticles('blogArticlesContainer', category);
        });
    });
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toastMessage');
    if (!toast) {
        // Fallback alert-style
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
// INITIALIZE EVERYTHING
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
    // Load articles
    await fetchArticles();

    // Homepage: latest & trending
    renderLatest('latestArticlesContainer');
    renderTrending('trendingContainer');
    updateBreakingNews();

    // Blog page: featured, all articles, trending
    if (document.getElementById('featuredContainer')) {
        renderFeatured('featuredContainer');
    }
    if (document.getElementById('blogArticlesContainer')) {
        renderBlogArticles('blogArticlesContainer', 'all');
    }
    if (document.getElementById('trendingContainerBlog')) {
        renderTrending('trendingContainerBlog');
    }

    // Category filters (blog)
    setupCategoryFilters();

    // Dark mode
    initDarkMode();

    // Mobile menu
    initMobileMenu();

    // Search
    initSearchEvents();

    // Newsletter
    initNewsletter();

    // Contact form
    initContactForm();

    console.log('✅ The Raptor site initialized.');
});
