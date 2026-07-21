// ============================================
//  GLOBALS
// ============================================
let currentCategory = 'all';
let allArticles = [];
let supabaseClient = window.supabaseClient; // set by inline script on each page

// ============================================
//  FETCH ARTICLES FROM SUPABASE
// ============================================
async function fetchArticles(category = 'all') {
    if (!supabaseClient) {
        console.error('Supabase client not initialized.');
        return [];
    }
    let query = supabaseClient
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

    if (category !== 'all') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
    return data;
}

// ============================================
//  LOAD FUNCTIONS (called from HTML)
// ============================================

// ----- Homepage: Latest Stories -----
async function loadLatestArticles() {
    const container = document.getElementById('latestArticlesContainer');
    if (!container) return;

    const articles = await fetchArticles('all');
    const latest = articles.slice(0, 6);
    allArticles = articles; // store for search

    if (latest.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No articles yet. Check back soon!</div>`;
        return;
    }

    container.innerHTML = latest.map(article => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm">
                <img src="${article.image || 'https://picsum.photos/seed/' + article.category + '/600/300'}" class="card-img-top" alt="${article.title}" />
                <div class="card-body">
                    <span class="badge bg-primary mb-2">${article.category}</span>
                    <h5 class="card-title"><a href="#" class="text-decoration-none text-dark">${article.title}</a></h5>
                    <div class="text-muted small">By <strong>${article.author || 'Editor'}</strong> • ${article.date || new Date(article.created_at).toLocaleDateString()}</div>
                    <p class="card-text mt-2">${article.excerpt || article.content.substring(0, 120) + '…'}</p>
                    <div class="d-flex justify-content-between text-muted small">
                        <span><i class="fas fa-tag"></i> ${article.category}</span>
                        <span><i class="fas fa-comment"></i> ${article.comments || 0}</span>
                        <span><i class="fas fa-clock"></i> ${article.timeAgo || 'recent'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ----- Homepage: Trending -----
async function loadTrendingArticles() {
    const container = document.getElementById('trendingContainer');
    if (!container) return;

    const articles = await fetchArticles('all');
    const trending = articles.slice(0, 6);
    const colors = ['bg-primary', 'bg-green', 'bg-primary', 'bg-green', 'bg-primary', 'bg-green'];

    if (trending.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No trending stories.</div>`;
        return;
    }

    container.innerHTML = trending.map((article, index) => `
        <div class="col-md-6">
            <div class="d-flex gap-3 align-items-start">
                <span class="badge ${colors[index % colors.length]} rounded-circle p-3 fs-5">${String(index+1).padStart(2, '0')}</span>
                <div>
                    <h5><a href="#" class="text-decoration-none text-dark">${article.title}</a></h5>
                    <span class="text-muted small">By ${article.author || 'Editor'} • ${article.date || new Date(article.created_at).toLocaleDateString()}</span>
                    <p class="text-muted small">${article.excerpt || article.content.substring(0, 80) + '…'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// ----- Blog Page: Featured Story -----
async function loadFeaturedArticle() {
    const container = document.getElementById('featuredContainer');
    if (!container) return;

    const articles = await fetchArticles('all');
    if (articles.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No featured article.</div>`;
        return;
    }

    const featured = articles[0]; // most recent

    container.innerHTML = `
        <div class="col-lg-6">
            <img src="${featured.image || 'https://picsum.photos/seed/featured/800/500'}" alt="${featured.title}" class="img-fluid rounded-3 shadow featured-image" />
        </div>
        <div class="col-lg-6">
            <span class="badge bg-danger mb-2">Featured</span>
            <h2 class="fw-bold">${featured.title}</h2>
            <div class="text-muted small">
                By <strong>${featured.author || 'Editor'}</strong> • ${featured.date || new Date(featured.created_at).toLocaleDateString()} • ${featured.readTime || '5 min read'} • <i class="fas fa-comment"></i> ${featured.comments || 0} comments
            </div>
            <p>${featured.excerpt || featured.content.substring(0, 200) + '…'}</p>
            <a href="#" class="btn btn-primary">Read full story →</a>
        </div>
    `;
}

// ----- Blog Page: Article Grid (with category filter) -----
async function loadBlogArticles(category = 'all') {
    const container = document.getElementById('blogArticlesContainer');
    const countDisplay = document.getElementById('resultCount');
    if (!container) return;

    currentCategory = category;
    const articles = await fetchArticles(category);
    allArticles = articles; // for search

    if (articles.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No articles found in this category.</div>`;
        if (countDisplay) countDisplay.textContent = 'Showing 0 articles';
        return;
    }

    if (countDisplay) {
        countDisplay.textContent = `Showing ${articles.length} articles`;
        // Update total article count in hero
        const articleCountSpan = document.getElementById('articleCount');
        if (articleCountSpan) articleCountSpan.textContent = articles.length;
        // Update last updated
        const lastUpdatedSpan = document.getElementById('lastUpdated');
        if (lastUpdatedSpan && articles.length > 0) {
            const latestDate = new Date(articles[0].created_at);
            lastUpdatedSpan.textContent = latestDate.toLocaleString();
        }
    }

    container.innerHTML = articles.map(article => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm position-relative">
                <span class="article-category">${article.category}</span>
                <img src="${article.image || 'https://picsum.photos/seed/' + article.category + '/600/300'}" class="card-img-top" alt="${article.title}" />
                <div class="card-body">
                    <h5 class="card-title"><a href="#" class="text-decoration-none text-dark">${article.title}</a></h5>
                    <div class="text-muted small">By <strong>${article.author || 'Editor'}</strong> • ${article.date || new Date(article.created_at).toLocaleDateString()}</div>
                    <p class="card-text mt-2">${article.excerpt || article.content.substring(0, 120) + '…'}</p>
                    <div class="d-flex justify-content-between text-muted small">
                        <span><i class="fas fa-tag"></i> ${article.category}</span>
                        <span><i class="fas fa-comment"></i> ${article.comments || 0}</span>
                        <span><i class="fas fa-clock"></i> ${article.timeAgo || 'recent'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'btn-primary');
        btn.classList.add('btn-outline-primary');
        if (btn.dataset.category === category) {
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-primary', 'active');
        }
    });
}

// ----- Blog Page: Trending (separate from homepage) -----
async function loadTrendingArticlesBlog() {
    const container = document.getElementById('trendingContainerBlog');
    if (!container) return;

    const articles = await fetchArticles('all');
    const trending = articles.slice(0, 6);
    const colors = ['bg-primary', 'bg-green', 'bg-primary', 'bg-green', 'bg-primary', 'bg-green'];

    if (trending.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">No trending stories.</div>`;
        return;
    }

    container.innerHTML = trending.map((article, index) => `
        <div class="col-md-6">
            <div class="d-flex gap-3 align-items-start">
                <span class="badge ${colors[index % colors.length]} rounded-circle p-3 fs-5">${String(index+1).padStart(2, '0')}</span>
                <div>
                    <h5><a href="#" class="text-decoration-none text-dark">${article.title}</a></h5>
                    <span class="text-muted small">By ${article.author || 'Editor'} • ${article.date || new Date(article.created_at).toLocaleDateString()}</span>
                    <p class="text-muted small">${article.excerpt || article.content.substring(0, 80) + '…'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
//  SEARCH FUNCTIONALITY (all search inputs)
// ============================================
async function performSearch(query) {
    if (!query || query.trim().length === 0) {
        hideSearchResults();
        return;
    }
    const q = query.trim().toLowerCase();
    // If we haven't loaded all articles yet, fetch them
    if (allArticles.length === 0) {
        allArticles = await fetchArticles('all');
    }
    const results = allArticles.filter(article =>
        article.title.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        (article.author && article.author.toLowerCase().includes(q)) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(q)))
    );
    renderSearchResults(results);
}

function renderSearchResults(results) {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = `<div class="p-3 text-muted">No articles found.</div>`;
        container.style.display = 'block';
        return;
    }

    let html = '';
    results.slice(0, 10).forEach(article => {
        html += `
            <div class="result-item">
                <div class="result-title">${article.title}</div>
                <div class="result-meta">${article.category} • ${article.author || 'Editor'} • ${article.date || new Date(article.created_at).toLocaleDateString()}</div>
            </div>
        `;
    });
    if (results.length > 10) {
        html += `<div class="result-item text-muted small">… and ${results.length - 10} more</div>`;
    }
    container.innerHTML = html;
    container.style.display = 'block';
}

function hideSearchResults() {
    const container = document.getElementById('searchResultsContainer');
    if (container) container.style.display = 'none';
}

// Attach search events to all search inputs
function initSearch() {
    const searchInputs = [
        document.getElementById('navSearchInput'),
        document.getElementById('mobileSearchInput')
    ];
    searchInputs.forEach(input => {
        if (!input) return;
        input.addEventListener('input', function(e) {
            performSearch(this.value);
        });
        // Optional: close on blur with delay
        input.addEventListener('blur', function() {
            setTimeout(hideSearchResults, 300);
        });
        input.addEventListener('focus', function() {
            if (this.value.trim().length > 0) {
                performSearch(this.value);
            }
        });
    });
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        const container = document.getElementById('searchResultsContainer');
        if (container && !container.contains(e.target) && !e.target.closest('.search-nav-item') && !e.target.closest('.search-mobile')) {
            hideSearchResults();
        }
    });
}

// ============================================
//  CATEGORY FILTER BUTTONS
// ============================================
function initCategoryFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            loadBlogArticles(category);
        });
    });
}

// ============================================
//  DARK MODE TOGGLE
// ============================================
function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    // Load saved preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const icon = toggle.querySelector('i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

// ============================================
//  MOBILE MENU TOGGLE
// ============================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('mobileNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function() {
        const isVisible = nav.style.display === 'block';
        nav.style.display = isVisible ? 'none' : 'block';
    });
    // Auto-hide on resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && nav) {
            nav.style.display = 'none';
        }
    });
}

// ============================================
//  NEWSLETTER & CONTACT FORMS
// ============================================
function initForms() {
    // Newsletter forms
    document.querySelectorAll('#newsletterForm').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for subscribing! (Demo)');
            this.reset();
        });
    });
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Your message has been sent! (Demo)');
            this.reset();
        });
    }
}

// ============================================
//  INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    initMobileMenu();
    initSearch();
    initCategoryFilters();
    initForms();

    // The page-specific load functions are called from the inline script
    // (e.g., loadBlogArticles('all'), loadFeaturedArticle(), etc.)
    // They are already invoked in each page's inline script block.
});
