// admin.js (rewritten)
// API Base URL
const API_BASE_URL = 'https://rcvj-company.onrender.com/api';
/*  const API_BASE_URL = 'http://localhost:3000/api';  */

function getToken() {
    return localStorage.getItem('auth_token'); // this matches your login.js
}


class AdminManager {
    constructor() {
        this.jobs = [];
        this.applications = [];
        this.filteredApplications = [];

        this.currentFilters = { job: '', status: '', search: '' };
        this.currentEditingJob = null;
        this.currentEditingApplication = null;

        // Bind methods needed for event listeners
        this.handleKeydown = this.handleKeydown.bind(this);

        this.init();
    }

    async init() {
        if (!this.isAuthenticated()) {
            // Keep path relative to where admin.html lives
            window.location.href = 'login.html';
            return;
        }

        this.setupModalCloseHandlers(); // attach general modal handlers
        this.setupEventListeners();
        this.setupApplicationsListeners();

        // Load data
        await this.loadJobs();
        await this.loadApplications();

        this.displayUserInfo();
    }

    // ---------- Auth helpers ----------
    isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        if (!token || !userData) return false;
        try {
            const user = JSON.parse(userData);
            document.getElementById('admin-name').textContent = user.username;
            return true;
        } catch (err) {
            return false;
        }
    }

    displayUserInfo() {
        const userData = localStorage.getItem('user_data');
        if (!userData) return;
        try {
            const user = JSON.parse(userData);
            document.getElementById('admin-name').textContent = user.username;
        } catch (err) {
            // ignore
        }
    }

    // ---------- Centralized fetch with token ----------
    async apiFetch(path, options = {}) {
        const token = localStorage.getItem('auth_token') || '';
        const headers = options.headers ? { ...options.headers } : {};

        // If body is an object and content-type not set, set JSON
        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(options.body);
        }

        const res = await fetch(`${API_BASE_URL}${path}`, {
            credentials: 'same-origin',
            ...options,
            headers: {
                ...headers,
                Authorization: token ? `Bearer ${token}` : ''
            }
        });

        // Try parse JSON safely
        let data = null;
        const text = await res.text().catch(() => '');
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

        if (!res.ok) {
            const errMsg = data && data.error ? data.error : (data && typeof data === 'string' ? data : `Request failed: ${res.status}`);
            const error = new Error(errMsg);
            error.status = res.status;
            error.payload = data;
            throw error;
        }

        return data;
    }

    // ---------- Event listeners ----------
    setupEventListeners() {
        // Job management
        document.getElementById('add-job-btn').addEventListener('click', () => this.openAddJobModal());
        document.getElementById('refresh-btn').addEventListener('click', () => this.loadJobs());

        // Modal open/close for job modal
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeJobModal());
        document.getElementById('job-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleJobSubmit();
        });

        // Delete modal controls
        document.getElementById('cancel-delete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirm-delete').addEventListener('click', () => this.confirmDelete());

        // Logout
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());

        // Close modals on overlay click handled in setupModalCloseHandlers()

        // Keyboard: Escape to close any modal
        document.addEventListener('keydown', this.handleKeydown);
    }

    setupApplicationsListeners() {
        const refreshAppsBtn = document.getElementById('refresh-applications-btn');
        if (refreshAppsBtn) refreshAppsBtn.addEventListener('click', () => this.loadApplications());

        const filterJob = document.getElementById('filter-job');
        const filterStatus = document.getElementById('filter-status');
        const searchApplicant = document.getElementById('search-applicant');

        if (filterJob) filterJob.addEventListener('change', (e) => { this.currentFilters.job = e.target.value; this.filterApplications(); });
        if (filterStatus) filterStatus.addEventListener('change', (e) => { this.currentFilters.status = e.target.value; this.filterApplications(); });
        if (searchApplicant) searchApplicant.addEventListener('input', (e) => { this.currentFilters.search = e.target.value.toLowerCase(); this.filterApplications(); });

        // Status modal actions
        const cancelStatus = document.getElementById('cancel-status');
        const saveStatus = document.getElementById('save-status');
        if (cancelStatus) cancelStatus.addEventListener('click', () => this.closeStatusModal());
        if (saveStatus) saveStatus.addEventListener('click', () => this.updateApplicationStatus());
    }

    setupModalCloseHandlers() {
        // Close buttons inside modals should close their own modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.classList.remove('show');
            });
        });

        // Overlay click: close only that modal
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('show');
            });
        });
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
        }
    }

    // ---------- Jobs CRUD ----------
    async loadJobs() {
        try {
            const data = await this.apiFetch('/jobs', { method: 'GET' });
            this.jobs = Array.isArray(data) ? data : (data && data.rows ? data.rows : []);
            this.renderJobsTable();
            this.updateStats();
        } catch (err) {
            console.error('Error loading jobs:', err);
            this.showMessage('Failed to load jobs. Please try again.', 'error');
        }
    }

    renderJobsTable() {
        const tbody = document.getElementById('jobs-table-body');
        const noJobsMessage = document.getElementById('no-jobs-message');

        if (!tbody) return;

        if (!this.jobs || this.jobs.length === 0) {
            tbody.innerHTML = '';
            if (noJobsMessage) noJobsMessage.style.display = 'block';
            return;
        }

        if (noJobsMessage) noJobsMessage.style.display = 'none';
        tbody.innerHTML = this.jobs.map(job => this.createJobRow(job)).join('');
        this.attachRowEventListeners();
    }

    createJobRow(job) {
        const postedDate = job.created_at ? new Date(job.created_at).toLocaleDateString() : '-';
        return `
            <tr data-job-id="${job.id}">
                <td><strong>${this.escapeHtml(job.title || '')}</strong></td>
                <td>${this.escapeHtml(job.company || '')}</td>
                <td>${this.escapeHtml(job.location || '')}</td>
                <td><span class="job-type-badge">${this.formatJobType(job.job_type || '')}</span></td>
                <td>${this.escapeHtml(job.salary_range || 'Not specified')}</td>
                <td>${postedDate}</td>
                <td class="action-buttons-cell">
                    <button class="edit-btn" data-job-id="${job.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-job-id="${job.id}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `;
    }

    attachRowEventListeners() {
        // edit
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.removeEventListener('click', this._editHandler);
            const h = (e) => {
                const id = e.target.closest('.edit-btn').dataset.jobId;
                this.openEditJobModal(id);
            };
            btn.addEventListener('click', h);
            btn._editHandler = h;
        });

        // delete
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.removeEventListener('click', this._deleteHandler);
            const h = (e) => {
                const id = e.target.closest('.delete-btn').dataset.jobId;
                this.openDeleteModal(id);
            };
            btn.addEventListener('click', h);
            btn._deleteHandler = h;
        });
    }

    updateStats() {
        const totalJobsEl = document.getElementById('total-jobs');
        const activeJobsEl = document.getElementById('active-jobs');
        const companiesCountEl = document.getElementById('companies-count');

        if (totalJobsEl) totalJobsEl.textContent = this.jobs.length;
        if (activeJobsEl) activeJobsEl.textContent = this.jobs.length;
        if (companiesCountEl) companiesCountEl.textContent = this.getUniqueCompaniesCount();
    }

    getUniqueCompaniesCount() {
        try {
            const companies = new Set((this.jobs || []).map(j => j.company));
            return companies.size;
        } catch (e) {
            return 0;
        }
    }

    openAddJobModal() {
        this.currentEditingJob = null;
        const form = document.getElementById('job-form');
        if (form) form.reset();
        document.getElementById('modal-title').textContent = 'Post New Job';
        const btnText = document.querySelector('#submit-btn .btn-text');
        if (btnText) btnText.textContent = 'Post Job';
        document.getElementById('job-id').value = '';
        document.getElementById('job-modal').classList.add('show');
    }

    openEditJobModal(jobId) {
        const job = this.jobs.find(j => String(j.id) === String(jobId));
        if (!job) return;
        this.currentEditingJob = job;
        document.getElementById('modal-title').textContent = 'Edit Job';
        const btnText = document.querySelector('#submit-btn .btn-text');
        if (btnText) btnText.textContent = 'Update Job';

        // Populate form
        document.getElementById('job-id').value = job.id || '';
        document.getElementById('job-title').value = job.title || '';
        document.getElementById('job-company').value = job.company || '';
        document.getElementById('job-location').value = job.location || '';
        document.getElementById('job-salary').value = job.salary_range || '';
        document.getElementById('job-type').value = job.job_type || '';
        document.getElementById('job-description').value = job.description || '';
        document.getElementById('job-requirements').value = job.requirements || '';
        document.getElementById('job-responsibilities').value = job.responsibilities || '';

        document.getElementById('job-modal').classList.add('show');
    }

    async handleJobSubmit() {
        const payload = {
            title: document.getElementById('job-title').value.trim(),
            company: document.getElementById('job-company').value.trim(),
            location: document.getElementById('job-location').value.trim(),
            salary_range: document.getElementById('job-salary').value.trim(),
            job_type: document.getElementById('job-type').value,
            description: document.getElementById('job-description').value.trim(),
            requirements: document.getElementById('job-requirements').value.trim(),
            responsibilities: document.getElementById('job-responsibilities').value.trim()
        };

        // Basic validation
        if (!payload.title || !payload.company || !payload.location || !payload.job_type || !payload.description || !payload.requirements) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Show loading state
        this.setFormLoading(true);

        try {
            if (this.currentEditingJob) {
                // Update existing
                await this.apiFetch(`/jobs/${this.currentEditingJob.id}`, { method: 'PUT', body: payload });
                this.showMessage('Job updated successfully!', 'success');
            } else {
                // Create new
                await this.apiFetch(`/jobs`, { method: 'POST', body: payload });
                this.showMessage('Job posted successfully!', 'success');
            }
            this.closeJobModal();
            await this.loadJobs();
        } catch (err) {
            console.error('Error saving job:', err);
            this.showMessage(err.message || 'Failed to save job. Please try again.', 'error');
        } finally {
            this.setFormLoading(false);
        }
    }

    openDeleteModal(jobId) {
        const job = this.jobs.find(j => String(j.id) === String(jobId));
        if (!job) return;
        this.currentEditingJob = job;
        const el = document.getElementById('delete-job-title');
        if (el) el.textContent = job.title || 'This job';
        document.getElementById('delete-modal').classList.add('show');
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').classList.remove('show');
        this.currentEditingJob = null;
    }

    async confirmDelete() {
        if (!this.currentEditingJob) return;
        try {
            await this.apiFetch(`/jobs/${this.currentEditingJob.id}`, { method: 'DELETE' });
            this.showMessage('Job deleted successfully!', 'success');
            this.closeDeleteModal();
            await this.loadJobs();
        } catch (err) {
            console.error('Error deleting job:', err);
            this.showMessage(err.message || 'Failed to delete job. Please try again.', 'error');
        }
    }

    closeJobModal() {
        document.getElementById('job-modal').classList.remove('show');
        this.currentEditingJob = null;
    }

    setFormLoading(loading) {
        const button = document.getElementById('submit-btn');
        if (!button) return;
        const buttonText = button.querySelector('.btn-text');
        const buttonLoading = button.querySelector('.btn-loading');
        if (loading) {
            button.disabled = true;
            if (buttonText) buttonText.style.display = 'none';
            if (buttonLoading) buttonLoading.style.display = 'block';
        } else {
            button.disabled = false;
            if (buttonText) buttonText.style.display = 'block';
            if (buttonLoading) buttonLoading.style.display = 'none';
        }
    }

    // ---------- Applications ----------
    async loadApplications() {
        try {
            const data = await this.apiFetch('/applications', { method: 'GET' });
            // Accept array or { rows: [...] } structure
            this.applications = Array.isArray(data) ? data : (data && data.rows ? data.rows : []);
            this.filteredApplications = [...this.applications];
            this.renderApplicationsTable();
            this.populateJobFilter();
        } catch (err) {
            console.error('Error loading applications:', err);
            this.showMessage('Failed to load applications. Please try again.', 'error');
        }
    }

    renderApplicationsTable() {
        const tbody = document.getElementById('applications-table-body');
        const noApplicationsMessage = document.getElementById('no-applications-message');
        if (!tbody) return;

        if (!this.filteredApplications || this.filteredApplications.length === 0) {
            tbody.innerHTML = '';
            if (noApplicationsMessage) noApplicationsMessage.style.display = 'block';
            return;
        }

        if (noApplicationsMessage) noApplicationsMessage.style.display = 'none';
        tbody.innerHTML = this.filteredApplications.map(app => this.createApplicationRow(app)).join('');
        this.attachApplicationEventListeners();
    }

    createApplicationRow(application) {
        const appliedDate = application.applied_at ? new Date(application.applied_at).toLocaleDateString() : '-';
        // We add Delete and (optionally) Edit actions for applications
        return `
            <tr data-application-id="${application.application_id}">
                <td><strong>${this.escapeHtml(application.application_id || '')}</strong></td>
                <td>
                    <div><strong>${this.escapeHtml(application.applicant_name || '')}</strong></div>
                    <div style="font-size: 0.8rem; color: #666;">${this.escapeHtml(application.applicant_email || '')}</div>
                    <div style="font-size: 0.8rem; color: #666;">${this.escapeHtml(application.applicant_phone || '')}</div>
                </td>
                <td>${this.escapeHtml(application.job_title || '')}</td>
                <td>${this.escapeHtml(application.job_company || '')}</td>
                <td>${appliedDate}</td>
                <td><span class="status-badge status-${this.escapeHtml(application.status || '')}">${this.escapeHtml(application.status || '')}</span></td>
                <td class="application-actions">
                    <button class="view-app-btn" data-application-id="${application.application_id}"><i class="fas fa-eye"></i> View</button>
                    <button class="status-btn" data-application-id="${application.application_id}"><i class="fas fa-edit"></i> Status</button>
                    <button class="download-btn" data-application-id="${application.application_id}"><i class="fas fa-download"></i> Resume</button>
                    <button class="delete-app-btn" data-application-id="${application.application_id}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `;
    }

    attachApplicationEventListeners() {
        document.querySelectorAll('.view-app-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.view-app-btn').dataset.applicationId;
                this.viewApplicationDetails(id);
            });
        });

        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.status-btn').dataset.applicationId;
                this.openStatusModal(id);
            });
        });

        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.download-btn').dataset.applicationId;
                this.downloadResume(id);
            });
        });

        // Delete application
        document.querySelectorAll('.delete-app-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.closest('.delete-app-btn').dataset.applicationId;
                const confirmed = confirm('Are you sure you want to delete this application? This cannot be undone.');
                if (!confirmed) return;
                await this.deleteApplication(id);
            });
        });
    }

    populateJobFilter() {
        const jobFilter = document.getElementById('filter-job');
        if (!jobFilter) return;
        const uniqueJobs = [...new Set((this.applications || []).map(app => app.job_title).filter(Boolean))];
        jobFilter.innerHTML = '<option value="">All Jobs</option>' + uniqueJobs.map(job => `<option value="${this.escapeHtml(job)}">${this.escapeHtml(job)}</option>`).join('');
    }

    filterApplications() {
        const { job, status, search } = this.currentFilters;
        this.filteredApplications = (this.applications || []).filter(app => {
            const matchesJob = !job || app.job_title === job;
            const matchesStatus = !status || app.status === status;
            const matchesSearch = !search ||
                (app.applicant_name || '').toLowerCase().includes(search) ||
                (app.applicant_email || '').toLowerCase().includes(search) ||
                (String(app.application_id) || '').toLowerCase().includes(search);
            return matchesJob && matchesStatus && matchesSearch;
        });
        this.renderApplicationsTable();
    }

    async viewApplicationDetails(applicationId) {
        try {
            const application = (this.applications || []).find(a => String(a.application_id) === String(applicationId));
            if (!application) return this.showMessage('Application not found', 'error');

            const modal = document.getElementById('application-modal');
            const detailsContainer = document.getElementById('application-details');
            if (!modal || !detailsContainer) return;

            // Use safe HTML insertion
            detailsContainer.innerHTML = `
                <div class="application-details-grid">
                    <div class="application-detail-group">
                        <h3>Applicant Information</h3>
                        <div class="detail-item"><span class="detail-label">Full Name</span><div class="detail-value">${this.escapeHtml(application.applicant_name || '')}</div></div>
                        <div class="detail-item"><span class="detail-label">Email</span><div class="detail-value">${this.escapeHtml(application.applicant_email || '')}</div></div>
                        <div class="detail-item"><span class="detail-label">Phone</span><div class="detail-value">${this.escapeHtml(application.applicant_phone || '')}</div></div>
                        <div class="detail-item"><span class="detail-label">Application ID</span><div class="detail-value">${this.escapeHtml(application.application_id || '')}</div></div>
                    </div>
                    <div class="application-detail-group">
                        <h3>Job Information</h3>
                        <div class="detail-item"><span class="detail-label">Position</span><div class="detail-value">${this.escapeHtml(application.job_title || '')}</div></div>
                        <div class="detail-item"><span class="detail-label">Company</span><div class="detail-value">${this.escapeHtml(application.job_company || '')}</div></div>
                        <div class="detail-item"><span class="detail-label">Applied Date</span><div class="detail-value">${application.applied_at ? new Date(application.applied_at).toLocaleDateString() : '-'}</div></div>
                        <div class="detail-item"><span class="detail-label">Status</span><div class="detail-value"><span class="status-badge status-${this.escapeHtml(application.status || '')}">${this.escapeHtml(application.status || '')}</span></div></div>
                    </div>
                </div>
                ${application.cover_letter ? `<div class="cover-letter"><h4>Cover Letter</h4><div style="white-space: pre-line;">${this.escapeHtml(application.cover_letter)}</div></div>` : ''}
                <div class="detail-item">
                    <span class="detail-label">Resume File</span>
                    <div class="detail-value">
                        <button class="btn btn-primary" id="download-resume-btn"><i class="fas fa-download"></i> Download Resume</button>
                    </div>
                </div>
            `;

            // Attach download button inside modal
            const dlBtn = document.getElementById('download-resume-btn');
            if (dlBtn) {
                dlBtn.addEventListener('click', () => this.downloadResume(application.application_id));
            }

            modal.classList.add('show');
        } catch (err) {
            console.error('Error loading application details:', err);
            this.showMessage('Failed to load application details.', 'error');
        }
    }

    openStatusModal(applicationId) {
        const application = (this.applications || []).find(a => String(a.application_id) === String(applicationId));
        if (!application) return this.showMessage('Application not found', 'error');

        this.currentEditingApplication = application;
        const statusSelect = document.getElementById('status-select');
        const statusNotes = document.getElementById('status-notes');
        if (statusSelect) statusSelect.value = application.status || 'pending';
        if (statusNotes) statusNotes.value = application.notes || '';
        document.getElementById('status-modal').classList.add('show');
    }

    async updateApplicationStatus() {
        if (!this.currentEditingApplication) return;

        const newStatus = document.getElementById('status-select').value;
        const notes = document.getElementById('status-notes').value;

        // Optionally call API to update status
        try {
            // PUT to /applications/:id with { status, notes }
            await this.apiFetch(`/applications/${this.currentEditingApplication.application_id}`, {
                method: 'PUT',
                body: { status: newStatus, notes }
            });

            // Update local copy
            this.currentEditingApplication.status = newStatus;
            this.currentEditingApplication.notes = notes;

            this.showMessage('Application status updated successfully!', 'success');
            this.closeStatusModal();
            await this.loadApplications(); // refresh to get latest data
        } catch (err) {
            console.error('Error updating status:', err);
            this.showMessage(err.message || 'Failed to update application status.', 'error');
        }
    }

    closeStatusModal() {
        document.getElementById('status-modal').classList.remove('show');
        this.currentEditingApplication = null;
    }

    async deleteApplication(applicationId) {
        if (!applicationId) return;
        try {
            await this.apiFetch(`/applications/${applicationId}`, { method: 'DELETE' });
            this.showMessage('Application deleted', 'success');
            await this.loadApplications();
        } catch (err) {
            console.error('Failed to delete application:', err);
            this.showMessage(err.message || 'Failed to delete application', 'error');
        }
    }

    async downloadResume(applicationId) {
        const application = (this.applications || []).find(a => String(a.application_id) === String(applicationId));
        if (!application || !application.resume_filename) {
            return this.showMessage('Resume file not found.', 'error');
        }

        // Build download URL (static serve)
        const downloadUrl = `https://rcvj-company.onrender.com/uploads/${application.resume_filename}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        // safe filename
        const ext = this.getFileExtension(application.resume_filename);
        link.download = `Resume-${(application.applicant_name || 'applicant')}${ext ? '.' + ext : ''}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getFileExtension(filename) {
        if (!filename) return '';
        const idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.slice(idx + 1) : '';
    }

    // ---------- Utility ----------
    handleLogout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = 'login.html';
    }

    formatJobType(jobType) {
        const types = { 'full-time': 'Full Time', 'part-time': 'Part Time', 'contract': 'Contract', 'temporary': 'Temporary' };
        return types[jobType] || jobType || '';
    }

    escapeHtml(unsafe = '') {
        if (!unsafe) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showMessage(message, type = 'error') {
        // type: 'error' or 'success' or 'info'
        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i><span>${this.escapeHtml(message)}</span>`;
        Object.assign(toast.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: type === 'error' ? '#e74c3c' : '#27ae60',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 5000,
            animation: 'slideInRight 0.3s ease'
        });
        document.body.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 5000);
    }
}

// initialize
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});


document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            
            // remove active classes
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            // activate target tab
            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        });
    });
});
