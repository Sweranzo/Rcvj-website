  // Tab Navigation Functionality
        document.addEventListener('DOMContentLoaded', function() {
            const tabButtons = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            
            // Function to switch tabs
            function switchTab(tabId) {
                // Remove active class from all
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Add active class to clicked tab
                const activeButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
                if (activeButton) {
                    activeButton.classList.add('active');
                }
                
                // Show corresponding content
                const activeContent = document.getElementById(tabId);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
                
                // Update URL without page reload
                history.pushState(null, null, `#${tabId}`);
            }
            
            // Add click event to tab buttons
            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    switchTab(tabId);
                    
                    // Add click animation
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            });
            
            // Check URL hash on page load
            // Replace your checkHash function with this:
function checkHash() {
    const hash = window.location.hash.substring(1);
    const validTabs = ['story', 'mission', 'values', 'timeline', 'team', 'stats'];
    
    if (hash && validTabs.includes(hash) && document.getElementById(hash)) {
        switchTab(hash);
    } else {
        // Reset to first tab and clear hash
        switchTab('story');
        history.replaceState(null, null, window.location.pathname);
    }
}
            
            // Initialize
            checkHash();
            
            // Listen for hash changes
            window.addEventListener('hashchange', checkHash);
            
            // Team Filtering
            const filterButtons = document.querySelectorAll('.filter-btn');
            const teamCards = document.querySelectorAll('.team-card');
            
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    const filter = this.getAttribute('data-filter');
                    
                    // Filter team cards
                    teamCards.forEach(card => {
                        const dept = card.getAttribute('data-dept');
                        
                        if (filter === 'all' || filter === dept) {
                            card.style.display = 'block';
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            }, 10);
                        } else {
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                card.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
            
            // Animated counter for stats
            const statNumbers = document.querySelectorAll('.stat-number');
            const statsSection = document.querySelector('.stats-section');
            
            const animateCounter = (element, target) => {
                let current = 0;
                const increment = target / 100;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        element.textContent = target + (element.getAttribute('data-count') > 100 ? '+' : '');
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.floor(current);
                    }
                }, 20);
            };
            
            // Start counter when stats tab is viewed
            const statsTab = document.getElementById('stats');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        statNumbers.forEach(stat => {
                            const target = parseInt(stat.getAttribute('data-count'));
                            animateCounter(stat, target);
                        });
                    }
                });
            }, { threshold: 0.5 });
            
            if (statsTab) {
                observer.observe(statsTab);
            }
            
            // Mobile menu toggle
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            
            if (menuToggle && navLinks) {
                menuToggle.addEventListener('click', function() {
                    navLinks.classList.toggle('active');
                });
            }
        });