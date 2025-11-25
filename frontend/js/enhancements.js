// Enhanced Interactivity Manager
class WebsiteEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupBackToTop();
        this.setupScrollAnimations();
        this.setupSmoothScrolling();
        this.setupInteractiveElements();
        this.setupLoadingStates();
        
        // Initialize counters if they exist
        this.setupCounters();
    }

    // Back to Top Button
    setupBackToTop() {
        // Only create if it doesn't exist
        if (document.querySelector('.back-to-top')) return;
        
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTop.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(backToTop);

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Scroll Animations
    setupScrollAnimations() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        if (revealElements.length === 0) return;
        
        const revealOnScroll = () => {
            revealElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementTop < windowHeight - 100) {
                    element.classList.add('revealed');
                }
            });
        };

        // Initial check
        revealOnScroll();
        
        // Check on scroll
        window.addEventListener('scroll', revealOnScroll);
    }

    // Smooth Scrolling for Anchor Links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Interactive Elements
    setupInteractiveElements() {
        // Add hover effects to cards
        document.querySelectorAll('.job-card, .service-card, .feature-card, .stat-card').forEach(card => {
            card.classList.add('hover-lift', 'smooth-transition');
        });

        // Enhanced form interactions
        document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });

        // Click outside to close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(modal => {
                    modal.classList.remove('show');
                });
            }
        });
    }

    // Loading States
    setupLoadingStates() {
        // Add loading states to buttons
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function() {
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.classList.add('loading');
                }
            });
        });
    }

    // Animated Counters
    setupCounters() {
        const counters = document.querySelectorAll('.counter');
        if (counters.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateNumber(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }
    

    // Utility: Show Notification
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }
    showApplicationSuccess(applicationId) {
    if (window.websiteEnhancer && window.websiteEnhancer.showNotification) {
        window.websiteEnhancer.showNotification(
            `✅ Application Submitted! (ID: ${applicationId})`,
            'success'
        );
    } else {
        // Fallback to simple alert
        alert(`Application submitted successfully! ID: ${applicationId}`);
    }
}


showApplicationError(message) {
    if (window.websiteEnhancer && window.websiteEnhancer.showNotification) {
        window.websiteEnhancer.showNotification(message, 'error');
    } else {
        alert('Error: ' + message);
    }
}

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if the enhancer class exists
    if (typeof WebsiteEnhancer !== 'undefined') {
        window.websiteEnhancer = new WebsiteEnhancer();
    }
    
    // Add enhanced classes to elements
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.add('btn-enhanced', 'smooth-transition');
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const circles = document.querySelectorAll(".circle");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const circle = entry.target;
                const percent = circle.dataset.percentage;
                const deg = (percent / 100) * 360;

                circle.style.background = `conic-gradient(var(--white) ${deg}deg, rgba(255,255,255,0.3) ${deg}deg)`;
            }
        });
    });

    circles.forEach(circle => observer.observe(circle));
});


  