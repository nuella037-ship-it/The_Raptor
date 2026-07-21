// ============================================================
//  SUPABASE CONFIG – REPLACE WITH YOUR ACTUAL KEYS
// ============================================================
const SUPABASE_URL = "https://aslkopamkdnvofjqzgjz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yZ8KyiOxJT3GBR_6wX1Plw_Yt_5IQ6f";

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it globally available so all functions can use it
window.supabaseClient = supabase;

// ============================================
//  GLOBALS
// ============================================
let currentCategory = 'all';
let allArticles = [];
let supabaseClient = window.supabaseClient;
let searchTimeout = null;

// ============================================
//  FETCH ARTICLES FROM SUPABASE
// ============================================
async function fetchArticles(category = 'all') {
    if (!supabaseClient) {
        console.error('Supabase client not initialized.');
        return [];
    }
    try {
        let query = supabaseClient
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching articles:', err);
        return [];
    }
}

// ============================================
//  LOAD FUNCTIONS (called from HTML)
// ============================================

// ----- Homepage: Latest Stories -----
async function loadLatestArticles() {
    const container = document.getElementById('latestArticlesContainer');
    if (!container) return;

    try {
        const articles = await fetchArticles('all');
        const latest = articles.slice(0, 6);
        allArticles = articles;

        if (latest.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-5">No articles yet. Check back soon!</div>`;
            return;
        }

        container.innerHTML = latest.map(article => `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm">
                    <img src="${article.image || 'https://picsum.photos/seed/' + article.category + '/600/300'}" class="card-img-top" alt="${article.title}" loading="lazy" />
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
    } catch (err) {
        console.error('Error loading latest articles:', err);
        container.innerHTML = `<div class="col-12 text-center text-danger">Failed to load articles.</div>`;
    }
}

// ----- Homepage: Trending -----
async function loadTrendingArticles() {
    const container = document.getElementById('trendingContainer');
    if (!container) return;

    try {
        const articles = await fetchArticles('all');
        const trending = articles.slice(0, 6);
        const colors = ['bg-primary', 'bg-green', 'bg-primary', 'bg-green', 'bg-primary', 'bg-green'];

        if (trending.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-3">No trending stories.</div>`;
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
    } catch (err) {
        console.error('Error loading trending:', err);
        container.innerHTML = `<div class="col-12 text-center text-danger">Failed to load trending.</div>`;
    }
}

// ----- Blog Page: Featured Story -----
async function loadFeaturedArticle() {
    const container = document.getElementById('featuredContainer');
    if (!container) return;

    try {
        const articles = await fetchArticles('all');
        if (articles.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-5">No featured article available.</div>`;
            return;
        }

        const featured = articles[0];

        container.innerHTML = `
            <div class="col-lg-6">
                <img src="${featured.image || 'https://picsum.photos/seed/featured/800/500'}" alt="${featured.title}" class="img-fluid rounded-3 shadow featured-image" loading="lazy" />
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
    } catch (err) {
        console.error('Error loading featured:', err);
        container.innerHTML = `<div class="col-12 text-center text-danger">Failed to load featured article.</div>`;
    }
}

// ----- Blog Page: Article Grid (with category filter) -----
async function loadBlogArticles(category = 'all') {
    const container = document.getElementById('blogArticlesContainer');
    const countDisplay = document.getElementById('resultCount');
    if (!container) return;

    try {
        currentCategory = category;
        const articles = await fetchArticles(category);
        allArticles = articles;

        if (articles.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-5">No articles found in this category.</div>`;
            if (countDisplay) countDisplay.textContent = 'Showing 0 articles';
            return;
        }

        if (countDisplay) {
            countDisplay.textContent = `Showing ${articles.length} articles`;
            const articleCountSpan = document.getElementById('articleCount');
            if (articleCountSpan) articleCountSpan.textContent = articles.length;
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
                    <img src="${article.image || 'https://picsum.photos/seed/' + article.category + '/600/300'}" class="card-img-top" alt="${article.title}" loading="lazy" />
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
    } catch (err) {
        console.error('Error loading blog articles:', err);
        container.innerHTML = `<div class="col-12 text-center text-danger">Failed to load articles.</div>`;
    }
}

// ----- Blog Page: Trending (separate from homepage) -----
async function loadTrendingArticlesBlog() {
    const container = document.getElementById('trendingContainerBlog');
    if (!container) return;

    try {
        const articles = await fetchArticles('all');
        const trending = articles.slice(0, 6);
        const colors = ['bg-primary', 'bg-green', 'bg-primary', 'bg-green', 'bg-primary', 'bg-green'];

        if (trending.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-3">No trending stories.</div>`;
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
    } catch (err) {
        console.error('Error loading trending blog:', err);
        container.innerHTML = `<div class="col-12 text-center text-danger">Failed to load trending.</div>`;
    }
}

// ============================================
//  SEARCH FUNCTIONALITY (all search inputs)
// ============================================
async function performSearch(query) {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;

    if (!query || query.trim().length === 0) {
        container.style.display = 'none';
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
        (article.tags && Array.isArray(article.tags) && article.tags.some(tag => tag.toLowerCase().includes(q)))
    );

    if (results.length === 0) {
        container.innerHTML = `<div class="p-3 text-muted">No articles found for "<strong>${q}</strong>".</div>`;
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

        // Debounced input handler
        input.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const query = this.value;
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });

        // Close on blur with delay (allow click on results)
        input.addEventListener('blur', function() {
            setTimeout(hideSearchResults, 300);
        });

        // Show results on focus if there's a query
        input.addEventListener('focus', function() {
            if (this.value.trim().length > 0) {
                performSearch(this.value);
            }
        });

        // Clear search on escape key
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                hideSearchResults();
                this.blur();
            }
        });
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        const container = document.getElementById('searchResultsContainer');
        if (container && !container.contains(e.target) &&
            !e.target.closest('.search-nav-item') &&
            !e.target.closest('.search-mobile')) {
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
            // Scroll to articles section
            const grid = document.getElementById('articleGrid');
            if (grid) {
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============================================
//  DARK MODE TOGGLE
// ============================================
function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    // Load saved preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
        const icon = toggle.querySelector('i');
        if (icon) icon.className = 'fas fa-sun';
    }

    toggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        if (isDark) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        localStorage.setItem('darkMode', isDark);
    });
}

// ============================================
//  MOBILE MENU TOGGLE (Improved)
// ============================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('mobileNav');

    if (!toggle || !nav) return;

    // Toggle mobile nav on button click
    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        nav.classList.toggle('open');
        const isOpen = nav.classList.contains('open');
        nav.style.display = isOpen ? 'block' : 'none';
        // Update aria-expanded for accessibility
        this.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile nav when clicking a link inside it
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('open');
            nav.style.display = 'none';
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Auto-hide on resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992) {
            nav.classList.remove('open');
            nav.style.display = 'none';
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================
//  CONTACT FORM (send to Supabase)
// ============================================
async function submitContactForm(formData) {
    try {
        const { data, error } = await supabaseClient
            .from('contact_messages')
            .insert([{
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                subject: formData.subject,
                message: formData.message
            }])
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('Contact form error:', err);
        return { success: false, error: err.message };
    }
}

// ============================================
//  NEWSLETTER SUBSCRIPTION
// ============================================
async function subscribeNewsletter(email, frequency = 'daily') {
    try {
        const { data, error } = await supabaseClient
            .from('newsletter_subscribers')
            .insert([{ email, frequency }])
            .select();

        if (error) {
            if (error.code === '23505') {
                return { success: false, message: 'You are already subscribed!' };
            }
            throw error;
        }
        return { success: true, data };
    } catch (err) {
        console.error('Newsletter error:', err);
        return { success: false, error: err.message };
    }
}

// ============================================
//  NEWSLETTER & CONTACT FORMS (INIT)
// ============================================
function initForms() {
    // --- NEWSLETTER FORM ---
    document.querySelectorAll('#newsletterForm').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const selectInput = this.querySelector('select');

            if (!emailInput || !emailInput.value.trim()) {
                showToast('Please enter your email address.', 'error');
                emailInput?.focus();
                return;
            }

            const email = emailInput.value.trim();
            const frequency = selectInput ? selectInput.value : 'daily';

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast('Please enter a valid email address.', 'error');
                emailInput.focus();
                return;
            }

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';

            const result = await subscribeNewsletter(email, frequency);

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            if (result.success) {
                showToast('🎉 Thank you for subscribing to The Raptor newsletter!', 'success');
                this.reset();
            } else {
                showToast(result.message || '❌ Something went wrong. Please try again.', 'error');
            }
        });
    });

    // --- CONTACT FORM ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('contactName')?.value.trim();
            const email = document.getElementById('contactEmail')?.value.trim();
            const phone = document.getElementById('contactPhone')?.value.trim() || null;
            const subject = document.getElementById('contactSubject')?.value;
            const message = document.getElementById('contactMessage')?.value.trim();

            // Validation
            if (!name) {
                showToast('Please enter your name.', 'error');
                document.getElementById('contactName')?.focus();
                return;
            }
            if (!email) {
                showToast('Please enter your email address.', 'error');
                document.getElementById('contactEmail')?.focus();
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast('Please enter a valid email address.', 'error');
                document.getElementById('contactEmail')?.focus();
                return;
            }
            if (!subject || subject === '') {
                showToast('Please select a subject.', 'error');
                document.getElementById('contactSubject')?.focus();
                return;
            }
            if (!message) {
                showToast('Please enter your message.', 'error');
                document.getElementById('contactMessage')?.focus();
                return;
            }

            const formData = { name, email, phone, subject, message };

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const result = await submitContactForm(formData);

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            if (result.success) {
                showToast('✅ Your message has been sent! We\'ll get back to you within 24 hours.', 'success');
                this.reset();
            } else {
                showToast('❌ Failed to send your message. Please try again or contact us directly at info@theraptor.com', 'error');
            }
        });
    }
}

// ============================================
//  TOAST NOTIFICATIONS (Replaces alert boxes)
// ============================================
function showToast(message, type = 'success') {
    // Check if toast container exists, create if not
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.cssText = 'z-index: 9999; max-width: 350px;';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0 show`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    toast.style.cssText = 'display: block; margin-bottom: 0.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease;';

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 4000);

    // Close button handler
    toast.querySelector('.btn-close')?.addEventListener('click', function() {
        toast.remove();
    });
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(50px); }
        to { opacity: 1; transform: translateX(0); }
    }
`;
document.head.appendChild(style);

// ============================================
//  INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    initMobileMenu();
    initSearch();
    initCategoryFilters();
    initForms();

    // Update current year in footer
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Log successful initialization
    console.log('✅ The Raptor initialized successfully!');
});
