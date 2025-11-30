// API Base URL - Update this if your backend runs on different port
const API_BASE_URL = 'https://rcvj-company.onrender.com/api';/* 'http://localhost:3000/api'; */

class JobsManager {
    constructor() {
        this.jobs = [];
        this.filteredJobs = [];
        this.currentFilters = {
            title: '',
            location: '',
            jobType: ''
        };
        
        this.init();
    }

    async init() {
        await this.loadJobs();
        this.setupEventListeners();
    }

    async loadJobs() {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }
            
            this.jobs = await response.json();
            this.filteredJobs = [...this.jobs];
            this.renderJobs();
            this.updateJobsCount();
            
        } catch (error) {
            console.error('Error loading jobs:', error);
            this.showError('Failed to load jobs. Please try again later.');
        }
    }

    setupEventListeners() {
    // Search button - manual filtering
    document.getElementById('search-btn').addEventListener('click', () => {
        // Update currentFilters from input values
        this.currentFilters.title = document.getElementById('search-title').value;
        this.currentFilters.location = document.getElementById('search-location').value;
        this.currentFilters.jobType = document.getElementById('job-type').value;
        this.applyFilters();
    });

    // Enter key support
    document.getElementById('search-title').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            this.currentFilters.title = e.target.value;
            this.applyFilters();
        }
    });

    document.getElementById('search-location').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            this.currentFilters.location = e.target.value;
            this.applyFilters();
        }
    });

    // Remove all real-time input event listeners
    // Only keep change listener for select (optional)
    document.getElementById('job-type').addEventListener('change', (e) => {
        // Optional: if you want dropdown to work immediately
        this.currentFilters.jobType = e.target.value;
        this.applyFilters();
    });
}

    applyFilters() {
        const titleFilter = this.currentFilters.title.toLowerCase();
        const locationFilter = this.currentFilters.location.toLowerCase();
        const jobTypeFilter = this.currentFilters.jobType;

        this.filteredJobs = this.jobs.filter(job => {
            const matchesTitle = !titleFilter || 
                job.title.toLowerCase().includes(titleFilter) ||
                job.company.toLowerCase().includes(titleFilter);

            const matchesLocation = !locationFilter ||
                job.location.toLowerCase().includes(locationFilter);

            const matchesJobType = !jobTypeFilter ||
                job.job_type === jobTypeFilter;

            return matchesTitle && matchesLocation && matchesJobType;
        });

        this.renderJobs();
        this.updateJobsCount();
    }

    renderJobs() {
        const container = document.getElementById('jobs-container');
        const noJobsElement = document.getElementById('no-jobs');

        if (this.filteredJobs.length === 0) {
            container.innerHTML = '';
            noJobsElement.style.display = 'block';
            return;
        }

        noJobsElement.style.display = 'none';

        const jobsHTML = this.filteredJobs.map(job => this.createJobCard(job)).join('');
        container.innerHTML = jobsHTML;

        // Add event listeners to view buttons
        this.attachViewJobListeners();
    }

    createJobCard(job) {
        const truncatedDescription = job.description.length > 150 
            ? job.description.substring(0, 150) + '...' 
            : job.description;

        return `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-card-header">
                    <h3 class="job-title">${this.escapeHtml(job.title)}</h3>
                    <div class="job-company">${this.escapeHtml(job.company)}</div>
                    <div class="job-meta">
                        <div class="job-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${this.escapeHtml(job.location)}</span>
                        </div>
                        <div class="job-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${this.formatJobType(job.job_type)}</span>
                        </div>
                        <div class="job-meta-item">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>${job.salary_range || 'Salary negotiable'}</span>
                        </div>
                    </div>
                </div>
                
                <p class="job-description">${this.escapeHtml(truncatedDescription)}</p>
                
                <div class="job-tags">
                    <span class="job-tag">${this.formatJobType(job.job_type)}</span>
                    <span class="job-tag">${this.getTimeAgo(job.created_at)}</span>
                </div>
                
                <div class="job-actions">
                    <a href="../pages/job-details.html?id=${job.id}" class="view-job-btn">
                        <i class="fas fa-eye"></i> View Details
                    </a>
                    <button class="quick-apply-btn" data-job-id="${job.id}">
                        <i class="fas fa-paper-plane"></i> Quick Apply
                    </button>
                </div>
            </div>
        `;
    }

    attachViewJobListeners() {
        // Quick apply buttons
        document.querySelectorAll('.quick-apply-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const jobId = e.target.closest('.quick-apply-btn').dataset.jobId;
                this.handleQuickApply(jobId);
            });
        });
    }

handleQuickApply(jobId) {
    window.location.href = `../pages/job-details.html?id=${jobId}`;
}


    updateJobsCount() {
        const countElement = document.getElementById('jobs-count');
        countElement.textContent = this.filteredJobs.length;
    }

    formatJobType(jobType) {
        const types = {
            'full-time': 'Full Time',
            'part-time': 'Part Time',
            'contract': 'Contract',
            'temporary': 'Temporary'
        };
        return types[jobType] || jobType;
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showError(message) {
        const container = document.getElementById('jobs-container');
        container.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Error Loading Jobs</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="jobsManager.loadJobs()" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Initialize the jobs manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.jobsManager = new JobsManager();
});

//bubbles effect//
// Modern Dynamic Tweets
class DynamicTweets {
    constructor() {
        this.tweets = [
            {
                username: "CareerSuccess",
                handle: "@JobSeeker123",
                avatar: "🚀",
                message: "Just landed my dream job through RCVJ! The process was smooth and the support was incredible. Highly recommend!",
                likes: 12,
                retweets: 3,
                time: "2h ago"
            },
            {
                username: "TechRecruiter",
                handle: "@HiringPro",
                avatar: "💼",
                message: "As an HR manager, I'm impressed with RCVJ's quality of candidates. They really understand what companies need.",
                likes: 24,
                retweets: 8,
                time: "4h ago"
            },
            {
                username: "CareerGrowth",
                handle: "@AmbitiousPro",
                avatar: "⭐",
                message: "Switched from retail to tech in 3 months! RCVJ's career guidance made all the difference. Life-changing!",
                likes: 18,
                retweets: 5,
                time: "1d ago"
            },
            {
                username: "JobHunter",
                handle: "@FindMyPath",
                avatar: "🎯",
                message: "Multiple offers in just 2 weeks! The interview preparation and resume tips were game-changers.",
                likes: 15,
                retweets: 4,
                time: "6h ago"
            },
            {
                username: "HRManager",
                handle: "@TalentAcquisition",
                avatar: "🏢",
                message: "Our company has partnered with RCVJ for 2 years. Consistent quality and professional service every time.",
                likes: 31,
                retweets: 12,
                time: "3h ago"
            },
            {
                username: "CareerChanger",
                handle: "@NewBeginnings",
                avatar: "✨",
                message: "From hospitality to IT support! RCVJ believed in me when no one else did. Forever grateful!",
                likes: 22,
                retweets: 7,
                time: "8h ago"
            }
        ];
        
        this.init();
    }
    
    init() {
        this.renderTweets();
        this.setupShuffle();
    }
    
    renderTweets() {
        const container = document.querySelector('.tweets-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Shuffle and take 3 random tweets
        const shuffled = [...this.tweets].sort(() => 0.5 - Math.random());
        const selectedTweets = shuffled.slice(0, 3);
        
        selectedTweets.forEach((tweet, index) => {
            const tweetCard = this.createTweetCard(tweet, index);
            container.appendChild(tweetCard);
        });
    }
    
    createTweetCard(tweet, index) {
        const card = document.createElement('div');
        card.className = 'tweet-card';
        card.style.animationDelay = `${index * 0.2}s`;
        
        card.innerHTML = `
            <div class="tweet-header">
                <div class="tweet-avatar">${tweet.avatar}</div>
                <div class="tweet-user-info">
                    <h4>${tweet.username}</h4>
                    <span>${tweet.handle}</span>
                </div>
            </div>
            <p class="tweet-message">${tweet.message}</p>
            <div class="tweet-stats">
                <div class="tweet-stat">
                    <i class="fas fa-heart"></i>
                    <span>${tweet.likes}</span>
                </div>
                <div class="tweet-stat">
                    <i class="fas fa-retweet"></i>
                    <span>${tweet.retweets}</span>
                </div>
            </div>
            <div class="tweet-time">
                <i class="far fa-clock"></i>
                <span>${tweet.time}</span>
            </div>
        `;
        
        return card;
    }
    
    setupShuffle() {
        const shuffleBtn = document.getElementById('shuffleTweets');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                this.renderTweets();
                
                // Add button feedback
                shuffleBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    shuffleBtn.style.transform = '';
                }, 150);
            });
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DynamicTweets();
});


//person thinking //
// Motivational Messages Manager
class MotivationalCharacter {
    constructor() {
        this.messages = [
            "What are you waiting for?",
            "Your dream job is waiting!",
            "Apply now and transform your career!",
            "Don't just dream it, achieve it!",
            "Great opportunities are waiting!",
            "Take the first step today!",
            "Your future self will thank you!",
            "New career, new possibilities!",
            "Make your move now!",
            "Success starts with action!",
            "Your perfect job is one click away!",
            "Unlock your potential today!",
            "Career happiness awaits!",
            "Start your journey now!",
            "Amazing jobs are waiting for you!"
        ];
        
        this.init();
    }
    
    init() {
        this.startMessageCycle();
        this.setupInteractions();
    }
    
    startMessageCycle() {
        // Show first message immediately
        
        this.showRandomMessage();
        
        // Change message every 4 seconds
        setInterval(() => {
            this.showRandomMessage();
        }, 4000);
    }
    
    showRandomMessage() {
        const bubble = document.getElementById('bubbleMessage');
        if (!bubble) return;
        
        // Fade out
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            // Get random message
            const randomMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
            bubble.textContent = randomMessage;
            
            // Fade in
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0)';
        }, 300);
    }
    
    setupInteractions() {
        const character = document.querySelector('.animated-character');
        if (character) {
            character.addEventListener('click', () => {
                this.showRandomMessage();
                
                // Add click feedback
                character.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    character.style.transform = '';
                }, 150);
            });
            
            character.style.cursor = 'pointer';
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MotivationalCharacter();
});