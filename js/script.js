// ============================================
//  GLOBAL SEARCH (indexes all articles)
// ============================================

// Article database (static – extend this array when adding new articles)
const articles = [
    { title: "AI Breakthrough in Medical Imaging Detects Early-Stage Cancers", category: "Technology", content: "Researchers at Stanford have developed a new deep-learning model that analyses MRI and CT scans with 98.7% accuracy, identifying malignancies up to 18 months earlier than traditional methods. The system has already been tested on over 50,000 patients.", author: "Dr. Elena Moore", date: "May 17, 2026" },
    { title: "Global Markets Rally as Tech Giants Post Record Earnings", category: "Business", content: "The S&P 500 and NASDAQ surged over 3% after Apple, Microsoft, and Nvidia reported quarterly results that exceeded all analyst expectations. The rally was further fuelled by optimistic forward guidance and increased AI infrastructure spending.", author: "James Carter", date: "May 16, 2026" },
    { title: "Champions League Final: Underdogs Stun Favourites in Extra Time", category: "Sports", content: "In one of the most dramatic finals in recent memory, Borussia Dortmund defeated Real Madrid 3–2 with a 118th-minute header from captain Marco Reus. The match saw three lead changes and a record-breaking 28 shots on target.", author: "Maria Santos", date: "May 15, 2026" },
    { title: "Street Art Festival Transforms Downtown with 50+ Murals", category: "Culture", content: "Over 150 international artists descended on the city for the annual Mural Fest, painting vibrant large-scale works on building facades, bridges, and public plazas. Organisers expect over 200,000 visitors this weekend.", author: "Liam O'Brien", date: "May 14, 2026" },
    { title: "Scientists Successfully Grow Mini-Brains with Functional Neural Networks", category: "Science", content: "In a groundbreaking study published in Nature, a team from MIT has cultivated cerebral organoids that exhibit spontaneous electrical activity and synaptic connectivity, opening new avenues for Alzheimer's and Parkinson's research.", author: "Dr. Aisha Khan", date: "May 13, 2026" },
    { title: "Election Reform Bill Passes First Reading with Bipartisan Support", category: "Politics", content: "The proposed Fair Representation Act, which includes ranked-choice voting, independent redistricting, and campaign finance transparency, cleared its first major hurdle in parliament with a 68–32 vote. Final reading is scheduled for next month.", author: "Sarah Chen", date: "May 12, 2026" },
    { title: "UN Announces $50 Billion Food Security Initiative for Africa", category: "World", content: "The program aims to boost local farming, irrigation, and supply chains across 30 nations, with a focus on sustainable agriculture and resilience against climate shocks.", author: "Global Affairs", date: "May 11, 2026" },
    { title: "Blockchain Adoption Surges as Major Banks Launch Crypto Services", category: "Technology", content: "JPMorgan, HSBC, and BNP Paribas now offer custodial and trading services for institutional clients, signaling a major shift in traditional finance toward digital assets.", author: "Finance Weekly", date: "May 10, 2026" },
    { title: "Mediterranean Diet Slows Brain Ageing by 5 Years, New Study Finds", category: "Health", content: "Long‑term research shows that olive oil, fish, and leafy greens boost cognitive resilience, with participants showing the brain age of someone five years younger.", author: "Health Desk", date: "May 9, 2026" },
    { title: "SpaceX Launches First All‑Civilian Mission to Lunar Orbit", category: "Space", content: "The four‑person crew will spend 8 days in lunar orbit, conducting scientific experiments and testing new life‑support systems for future deep‑space travel.", author: "Space Today", date: "May 8, 2026" },
    { title: "Record‑Breaking Heatwave Grips Southern Europe – Emergency Plans Activated", category: "Climate", content: "Temperatures exceed 45°C in Spain and Italy, with authorities issuing red alerts and opening cooling centres across the region.", author: "Weather Desk", date: "May 7, 2026" },
    { title: "Hollywood Writers' Union Reaches Tentative Deal with Studios", category: "Entertainment", content: "The new contract includes AI protections, residual increases, and minimum staffing guarantees, ending the 3‑month strike that had halted production.", author: "Entertainment Weekly", date: "May 6, 2026" }
];

// Search UI elements
const searchTrigger = document.getElementById('navSearchTrigger');
const searchBar = document.getElementById('globalSearchBar');
const searchInput = document.getElementById('globalSearchInput');
const searchClose = document.getElementById('globalSearchClose');
const searchResults = document.getElementById('searchResults');

// Toggle search bar
if (searchTrigger) {
    searchTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        searchBar.style.display = searchBar.style.display === 'none' ? '' : 'none';
        if (searchBar.style.display !== 'none') {
            searchInput.focus();
        }
    });
}
if (searchClose) {
    searchClose.addEventListener('click', function() {
        searchBar.style.display = 'none';
        searchResults.innerHTML = '';
    });
}

// Live search
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        if (query.length === 0) {
            searchResults.innerHTML = '';
            return;
        }
        const results = articles.filter(article =>
            article.title.toLowerCase().includes(query) ||
            article.content.toLowerCase().includes(query) ||
            article.category.toLowerCase().includes(query) ||
            article.author.toLowerCase().includes(query)
        );
        renderSearchResults(results);
    });
}

function renderSearchResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="p-2 text-muted">No articles found.</div>';
        return;
    }
    let html = '';
    results.forEach(article => {
        html += `
            <div class="result-item">
                <div class="result-title">${article.title}</div>
                <div class="result-meta">${article.category} • ${article.author} • ${article.date}</div>
            </div>
        `;
    });
    searchResults.innerHTML = html;
}

// ============================================
//  DARK MODE TOGGLE
// ============================================
const darkToggle = document.getElementById('darkModeToggle');
if (darkToggle) {
    darkToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        // Save preference
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    // Load saved preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkToggle.querySelector('i').className = 'fas fa-sun';
    }
}

// ============================================
//  MOBILE MENU TOGGLE
// ============================================
const mobileToggle = document.getElementById('mobileMenuToggle');
const mobileNav = document.getElementById('mobileNav');
if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function() {
        const isVisible = mobileNav.style.display === 'block';
        mobileNav.style.display = isVisible ? 'none' : 'block';
    });
}

// ============================================
//  NEWSLETTER FORM (prevent default)
// ============================================
const newsletterForms = document.querySelectorAll('#newsletterForm');
newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for subscribing! (This is a demo)');
        this.reset();
    });
});

// ============================================
//  CONTACT FORM (prevent default)
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Your message has been sent! (Demo)');
        this.reset();
    });
}
