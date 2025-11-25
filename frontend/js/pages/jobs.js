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
        // Search button
        document.getElementById('search-btn').addEventListener('click', () => {
            this.applyFilters();
        });

        // Enter key in search fields
        document.getElementById('search-title').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.applyFilters();
        });

        document.getElementById('search-location').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.applyFilters();
        });

        // Real-time filtering on input change
        document.getElementById('search-title').addEventListener('input', (e) => {
            this.currentFilters.title = e.target.value;
            this.applyFilters();
        });

        document.getElementById('search-location').addEventListener('input', (e) => {
            this.currentFilters.location = e.target.value;
            this.applyFilters();
        });

        document.getElementById('job-type').addEventListener('change', (e) => {
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

//follower//
const pngPupils = document.querySelectorAll('.png-pupil');
const pngEmojiBox = document.querySelector('.png-emoji-container').getBoundingClientRect();


document.addEventListener('mousemove', (e) => {
const centerX = pngEmojiBox.left + pngEmojiBox.width / 2;
const centerY = pngEmojiBox.top + pngEmojiBox.height / 2;


const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);


const offsetX = Math.cos(angle) * 7;
const offsetY = Math.sin(angle) * 7;


pngPupils.forEach(p => {
p.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
});
});

