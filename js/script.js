// ============================================================
// SUPABASE CONFIG
// ============================================================
const SUPABASE_URL = "https://aslkopamkdnvofjqzgjz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yZ8KyiOxJT3GBR_6wX1Plw_Yt_5IQ6f";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global articles array
let allArticles = [];

// ============================================================
// FETCH ARTICLES
// ============================================================
async function fetchArticles() {
    try {
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        allArticles = data || [];
    } catch (e) {
        console.error('Failed to fetch articles:', e);
        allArticles = [];
    }
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderArticleCard(article, colClass = 'col-md-6 col-lg-4') {
    const image = article.image || 'https://picsum.photos/seed/default/600/300';
    const excerpt = article.excerpt || (article.content ? article.content.substring(0, 120) + '…' : '');
    return `
        <div class="${colClass}">
            <div class="article-card">
                <img src="${image}" alt="${article.title}" loading="lazy" />
                <div class="card-body">
                    <span class="badge bg-primary mb-2">${article.category || 'Uncategorized'}</span>
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text">${excerpt}</p>
                    <div class="card-meta">${article.author || 'Unknown'} • ${article.date || 'Recent'}</div>
                    <a href="blog.html?id=${article.id}" class="btn btn-sm btn-outline-primary mt-2">Read more →</a>
                </div>
            </div>
        </div>
    `;
}

function renderSingleArticle(containerId = 'blogArticlesContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const articleId = parseInt(urlParams.get('id'));

    if (!articleId) {
        renderBlogArticles(containerId, 'all', 1);
        return;
    }

    const article = allArticles.find(a => a.id === articleId);
    if (!article) {
        container.innerHTML = `<div class="col-12 text-center py-5"><h3>Article not found.</h3><a href="blog.html" class="btn btn-primary mt-3">Back to all articles</a></div>`;
        return;
    }

    const image = article.image || 'https://picsum.photos/seed/default/800/400';
    let content = article.content || article.excerpt || '';

    // Format content: convert newlines to paragraphs
    if (content.includes('\n\n')) {
        const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
        content = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    } else {
        content = content.replace(/\n/g, '<br>');
    }

    container.innerHTML = `
        <div class="col-12">
            <div class="article-single-wrapper">
                <a href="blog.html" class="btn btn-outline-primary back-btn mb-4"><i class="fas fa-arrow-left"></i> Back to all articles</a>
                <article class="article-single">
                    <img src="${image}" alt="${article.title}" class="img-fluid featured-image" />
                    <div class="article-header">
                        <div class="article-meta">
                            <span class="badge bg-primary category-badge">${article.category || 'Uncategorized'}</span>
                            <span class="meta-text"><i class="far fa-user"></i> ${article.author || 'Unknown'}</span>
                            <span class="meta-text"><i class="far fa-calendar-alt"></i> ${article.date || 'Recent'}</span>
                            ${article.readTime ? `<span class="meta-text"><i class="far fa-clock"></i> ${article.readTime}</span>` : ''}
                            ${article.comments ? `<span class="meta-text"><i class="far fa-comment"></i> ${article.comments} comments</span>` : ''}
                        </div>
                        <h1 class="article-title">${article.title}</h1>
                    </div>
                    <div class="article-body">
                        ${content}
                    </div>
                    ${article.tags && article.tags.length > 0 ? `<div class="article-tags"><strong>Tags:</strong> ${article.tags.map(tag => `<span class="badge bg-secondary tag-badge">${tag}</span>`).join(' ')}</div>` : ''}
                </article>
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

function renderBlogArticles(containerId = 'blogArticlesContainer', category = 'all', page = 1, searchQuery = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Check if we're viewing a single article
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('id')) {
        renderSingleArticle(containerId);
        return;
    }

    let articles = allArticles;
    if (category !== 'all') {
        articles = articles.filter(a => (a.category || '').toLowerCase() === category.toLowerCase());
    }
    if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        articles = articles.filter(a =>
            (a.title || '').toLowerCase().includes(q) ||
            (a.excerpt || '').toLowerCase().includes(q) ||
            (a.content || '').toLowerCase().includes(q) ||
            (a.category || '').toLowerCase().includes(q) ||
            (a.author || '').toLowerCase().includes(q) ||
            (a.tags && a.tags.some(tag => (tag || '').toLowerCase().includes(q)))
        );
    }

    const totalArticles = articles.length;
    const totalPages = Math.ceil(totalArticles / pageSize) || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageArticles = articles.slice(start, end);

    if (pageArticles.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-5">No articles match your criteria.</div>`;
    } else {
        container.innerHTML = pageArticles.map(a => renderArticleCard(a, 'col-md-6 col-lg-4')).join('');
    }

    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        if (searchQuery.trim() !== '') {
            resultCount.textContent = `Showing ${start + 1}–${Math.min(end, totalArticles)} of ${totalArticles} results for "${searchQuery}"`;
        } else {
            resultCount.textContent = `Showing ${start + 1}–${Math.min(end, totalArticles)} of ${totalArticles} articles`;
        }
    }

    renderPagination(totalPages, page, category, searchQuery);
}

function renderPagination(totalPages, currentPage, category, searchQuery) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    let html = '';
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage - 1}" data-category="${category}" data-search="${searchQuery}">Previous</a></li>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}" data-category="${category}" data-search="${searchQuery}">${i}</a></li>`;
    }
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage + 1}" data-category="${category}" data-search="${searchQuery}">Next</a></li>`;
    container.innerHTML = html;

    container.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.dataset.page);
            const cat = this.dataset.category || 'all';
            const search = this.dataset.search || '';
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                renderBlogArticles('blogArticlesContainer', cat, page, search);
                const grid = document.getElementById('articleGrid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            <a href="blog.html?id=${featured.id}" class="btn btn-primary mt-2">Read more →</a>
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
                <a href="blog.html?id=${featured.id}" class="btn btn-primary">Read full story →</a>
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
    const searchQuery = urlParams.get('search') || '';
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
    if (category === 'all') {
        url.searchParams.delete('category');
    } else {
        url.searchParams.set('category', category);
    }
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    const searchQuery = url.searchParams.get('search') || '';
    renderBlogArticles('blogArticlesContainer', category, 1, searchQuery);
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
    const date = latest.date || (latest.created_at ? new Date(latest.created_at).toLocaleDateString() : 'Recent');
    el.textContent = date;
}

// ============================================================
// GLOBAL SEARCH
// ============================================================
function redirectSearch(query) {
    const q = query.trim();
    if (q.length === 0) {
        const container = document.getElementById('searchResultsContainer');
        if (container) container.style.display = 'none';
        return;
    }
    window.location.href = `blog.html?search=${encodeURIComponent(q)}`;
}

function previewSearch(query) {
    const q = query.trim();
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;
    if (q.length === 0) {
        container.style.display = 'none';
        return;
    }
    const results = allArticles.filter(article =>
        (article.title || '').toLowerCase().includes(q) ||
        (article.excerpt || '').toLowerCase().includes(q) ||
        (article.content || '').toLowerCase().includes(q) ||
        (article.category || '').toLowerCase().includes(q) ||
        (article.author || '').toLowerCase().includes(q) ||
        (article.tags && article.tags.some(tag => (tag || '').toLowerCase().includes(q)))
    );
    if (results.length === 0) {
        container.innerHTML = '<div class="p-2 text-muted">No articles found. <a href="blog.html?search=' + encodeURIComponent(q) + '">Search all articles</a></div>';
        container.style.display = 'block';
        return;
    }
    let html = '';
    results.slice(0, 5).forEach(article => {
        html += `
            <div class="result-item">
                <div class="result-title"><a href="blog.html?id=${article.id}" class="text-decoration-none">${article.title}</a></div>
                <div class="result-meta">${article.category} • ${article.author} • ${article.date}</div>
            </div>
        `;
    });
    if (results.length > 5) {
        html += `<div class="result-item"><a href="blog.html?search=${encodeURIComponent(q)}" class="text-primary">View all ${results.length} results →</a></div>`;
    } else {
        html += `<div class="result-item"><a href="blog.html?search=${encodeURIComponent(q)}" class="text-primary">See all results →</a></div>`;
    }
    container.innerHTML = html;
    container.style.display = 'block';
}

// ============================================================
// SEARCH EVENTS
// ============================================================
function initSearchEvents() {
    const navInput = document.getElementById('navSearchInput');
    const navBtn = document.getElementById('navSearchBtn');
    const container = document.getElementById('searchResultsContainer');

    function handleSearchSubmit(input) {
        if (input) {
            const query = input.value.trim();
            if (query.length > 0) {
                redirectSearch(query);
            } else {
                if (container) {
                    container.innerHTML = '<div class="p-2 text-muted">Please enter a search term.</div>';
                    container.style.display = 'block';
                    setTimeout(() => { container.style.display = 'none'; }, 2000);
                }
            }
        }
    }

    function handleSearchInput(input) {
        if (input) {
            const query = input.value.trim();
            if (query.length === 0) {
                if (container) container.style.display = 'none';
                return;
            }
            previewSearch(query);
        }
    }

    if (navInput) {
        navInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchSubmit(this);
            }
        });
        navInput.addEventListener('input', function() {
            handleSearchInput(this);
        });
        navInput.addEventListener('blur', function() {
            setTimeout(() => { if (container) container.style.display = 'none'; }, 300);
        });
        navInput.addEventListener('focus', function() {
            if (this.value.trim().length > 0) {
                previewSearch(this.value.trim());
            }
        });
        if (navBtn) {
            navBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleSearchSubmit(navInput);
            });
        }
    }

    document.addEventListener('click', function(e) {
        if (!e.target.closest('#searchResultsContainer') && !e.target.closest('.search-nav-item')) {
            if (container) container.style.display = 'none';
        }
    });
}

// ============================================================
// NEWSLETTER FORM
// ============================================================
async function subscribeNewsletter(email, frequency) {
    try {
        const { error } = await supabaseClient
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
            const successEl = document.getElementById('newsletterSuccess');
            if (successEl) successEl.classList.remove('d-none');
            form.reset();
            showToast('You\'re on the list!', 'success');
        } else {
            showToast(result.message || 'Something went wrong.', 'error');
        }
    });
}

// ============================================================
// COMMENTS - BLOG (Frontend)
// ============================================================

// Load approved comments for a given article
async function loadComments(articleId) {
    const container = document.getElementById('commentsList');
    const countEl = document.getElementById('commentCount');
    if (!container) return;

    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('article_id', articleId)
            .eq('is_approved', true)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const comments = data || [];
        if (countEl) countEl.textContent = comments.length;

        if (comments.length === 0) {
            container.innerHTML = '<p class="text-muted">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }

        let html = '';
        comments.forEach(c => {
            html += `
                <div class="comment-item border-bottom py-3">
                    <div class="d-flex justify-content-between">
                        <strong>${c.author || 'Anonymous'}</strong>
                        <small class="text-muted">${new Date(c.created_at).toLocaleDateString()}</small>
                    </div>
                    <p class="mb-0">${c.content}</p>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error('Failed to load comments:', err);
        container.innerHTML = '<p class="text-danger">Could not load comments.</p>';
    }
}

// Submit a new comment
async function submitComment(articleId, author, email, content) {
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .insert([{
                article_id: articleId,
                author: author,
                email: email || null,
                content: content,
                is_approved: false
            }])
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// ============================================================
// COMMENTS - ADMIN
// ============================================================

async function loadAdminComments() {
    const container = document.getElementById('adminCommentList');
    if (!container) return;

    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*, articles(title)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-comments"></i><p>No comments yet.</p></div>`;
            return;
        }

        const total = data.length;
        const pending = data.filter(c => !c.is_approved).length;
        document.getElementById('commentStats').textContent = `${total} total · ${pending} pending`;

        // Update pending badge
        const badge = document.getElementById('pendingBadge');
        if (pending > 0) {
            badge.textContent = pending;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }

        let html = '';
        data.forEach(c => {
            const isPending = !c.is_approved;
            html += `
                <div class="list-group-item d-flex justify-content-between align-items-start ${isPending ? 'border-left-warning' : ''}" style="${isPending ? 'border-left-color: #ffc107;' : ''}">
                    <div class="flex-grow-1">
                        <div class="d-flex flex-wrap align-items-center gap-2">
                            <strong>${c.author}</strong>
                            <span class="badge ${isPending ? 'bg-warning text-dark' : 'bg-success'}">${isPending ? 'Pending' : 'Approved'}</span>
                            <span class="badge bg-secondary">${c.articles?.title || 'Unknown article'}</span>
                        </div>
                        <div class="text-muted small">
                            <i class="fas fa-envelope"></i> ${c.email || 'No email'} • ${new Date(c.created_at).toLocaleString()}
                        </div>
                        <div class="mt-1">${c.content}</div>
                    </div>
                    <div class="d-flex gap-1 flex-shrink-0">
                        ${isPending ? `<button class="btn btn-sm btn-outline-success" onclick="approveComment('${c.id}')"><i class="fas fa-check"></i> Approve</button>` : ''}
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteComment('${c.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error('Failed to load comments:', err);
        container.innerHTML = '<div class="text-danger">Error loading comments.</div>';
    }
}

// Approve a comment
window.approveComment = async function(id) {
    if (!confirm('Approve this comment?')) return;
    try {
        const { error } = await supabaseClient
            .from('comments')
            .update({ is_approved: true })
            .eq('id', id);
        if (error) throw error;
        showToast('Comment approved.', 'success');
        loadAdminComments();
        updateStats();
    } catch (err) {
        showToast('Failed to approve: ' + err.message, 'error');
    }
};

// Delete a comment (from admin)
window.deleteComment = async function(id) {
    if (!confirm('Delete this comment permanently?')) return;
    try {
        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .eq('id', id);
        if (error) throw error;
        showToast('Comment deleted.', 'success');
        loadAdminComments();
        updateStats();
    } catch (err) {
        showToast('Failed to delete: ' + err.message, 'error');
    }
};

// Delete all comments
window.deleteAllComments = async function() {
    if (!confirm('Delete ALL comments? This cannot be undone.')) return;
    try {
        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .neq('id', 0);
        if (error) throw error;
        showToast('All comments deleted.', 'success');
        loadAdminComments();
        updateStats();
    } catch (err) {
        showToast('Failed: ' + err.message, 'error');
    }
};

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
            const { error } = await supabaseClient
                .from('contact_messages')
                .insert([{ name, email, phone, subject, message, newsletter_optin: newsletter }]);
            if (error) throw error;
            const successEl = document.getElementById('contactSuccess');
            if (successEl) successEl.classList.remove('d-none');
            form.reset();
            showToast('Message sent! We\'ll get back to you soon.', 'success');
        } catch (e) {
            try {
                let msgs = JSON.parse(localStorage.getItem('contact_messages') || '[]');
                msgs.push({ name, email, phone, subject, message, newsletter_optin: newsletter, created_at: new Date().toISOString() });
                localStorage.setItem('contact_messages', JSON.stringify(msgs));
                const successEl = document.getElementById('contactSuccess');
                if (successEl) successEl.classList.remove('d-none');
                form.reset();
                showToast('Message sent (offline)! We\'ll get back to you soon.', 'success');
            } catch (err) {
                showToast('Failed to send. Please try again later.', 'error');
            }
        } finally {
            text.classList.remove('d-none');
            spinner.classList.add('d-none');
            submitBtn.disabled = false;
        }
    });
}

// ============================================================
// COMMENT FORM
// ============================================================

function setupCommentForm(articleId) {
    const form = document.getElementById('commentForm');
    if (!form) return;

    // Remove any previous listener
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const author = document.getElementById('commentAuthor').value.trim();
        const email = document.getElementById('commentEmail').value.trim();
        const content = document.getElementById('commentContent').value.trim();

        if (!author || !content) {
            showToast('Please enter your name and comment.', 'error');
            return;
        }

        const submitBtn = document.getElementById('commentSubmitBtn');
        const text = document.getElementById('commentSubmitText');
        const spinner = document.getElementById('commentSubmitSpinner');
        const status = document.getElementById('commentStatus');

        text.classList.add('d-none');
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;
        status.textContent = 'Submitting...';

        const result = await submitComment(articleId, author, email, content);

        text.classList.remove('d-none');
        spinner.classList.add('d-none');
        submitBtn.disabled = false;
        status.textContent = '';

        if (result.success) {
            document.getElementById('commentSuccess').classList.remove('d-none');
            newForm.reset();
            showToast('Comment submitted for approval!', 'success');
        } else {
            showToast('Failed to post comment: ' + result.error, 'error');
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
// PAGE INITIALISATION FUNCTIONS
// ============================================================
function initHome() {
    renderHeroFeatured('heroRow');
    renderLatest('latestArticlesContainer');
    renderTrending('trendingContainer');
    updateBreakingNews();
    renderCategoryCards('categoriesContainer');
}

function initBlog() {
    renderFeatured('featuredContainer');
    renderFilterButtons();
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'all';
    const searchQuery = urlParams.get('search') || '';
    const articleId = urlParams.get('id');

    if (articleId) {
        renderSingleArticle('blogArticlesContainer');
        // Hide category filter and pagination
        const filterSection = document.getElementById('categoryFilter');
        const paginationSection = document.querySelector('#articleGrid nav');
        if (filterSection) filterSection.style.display = 'none';
        if (paginationSection) paginationSection.style.display = 'none';

        // Show comments section and load comments
        const commentsSection = document.getElementById('commentsSection');
        if (commentsSection) commentsSection.style.display = 'block';
        loadComments(parseInt(articleId));

        // Set up comment form submission
        setupCommentForm(parseInt(articleId));
    } else {
        renderBlogArticles('blogArticlesContainer', category, 1, searchQuery);
        const filterSection = document.getElementById('categoryFilter');
        const paginationSection = document.querySelector('#articleGrid nav');
        if (filterSection) filterSection.style.display = 'block';
        if (paginationSection) paginationSection.style.display = 'block';
        // Hide comments section when not on single article
        const commentsSection = document.getElementById('commentsSection');
        if (commentsSection) commentsSection.style.display = 'none';
    }
    updateArticleCount();
    updateLastUpdated();
    renderTrending('trendingContainerBlog', 4);
}

function initAbout() {}
function initContact() {}
function initComingSoon() {}

// ============================================================
// GLOBAL INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
    await fetchArticles();

    const isHome = document.getElementById('heroRow') !== null;
    const isBlog = document.getElementById('blogArticlesContainer') !== null;
    const isAbout = document.getElementById('aboutHero') !== null;
    const isContact = document.getElementById('contactHero') !== null;
    const isComingSoon = document.querySelector('.coming-soon-wrapper') !== null;

    if (isHome) initHome();
    else if (isBlog) initBlog();
    else if (isAbout) initAbout();
    else if (isContact) initContact();
    else if (isComingSoon) initComingSoon();

    initSearchEvents();
    initNewsletter();
    initContactForm();
    renderFooterCategories();
});
