// Job Details Manager
class JobDetailsManager {
    constructor() {
        this.jobId = this.getJobIdFromURL();
        this.init();
    }

    init() {
        if (this.jobId) {
            this.loadJobDetails();
            this.setupApplicationForm();
        } else {
            this.showError("No job specified");
        }
    }

    getJobIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("id");
    }

    async loadJobDetails() {
        try {
            const response = await fetch(`http://localhost:3000/api/jobs/${this.jobId}`);

            if (!response.ok) throw new Error("Job not found");

            const job = await response.json();
            this.displayJobDetails(job);
        } catch (error) {
            console.error("Error loading job details:", error);
            this.showError("Job not found. Please check the job ID.");
        }
    }

    displayJobDetails(job) {
        document.title = `${job.title} - RCVJ COMPANY`;

        document.getElementById("job-title").textContent = job.title;
        document.getElementById("job-company").textContent = job.company;
        document.getElementById("job-location").textContent = job.location;
        document.getElementById("job-type").textContent = this.formatJobType(job.job_type);
        document.getElementById("job-salary").textContent = job.salary_range || "Salary negotiable";
        document.getElementById("job-description-text").textContent = job.description;
        document.getElementById("job-requirements-text").textContent = job.requirements;
        document.getElementById("job-responsibilities-text").textContent = job.responsibilities || "Not specified";

        document.getElementById("apply-job-title").value = job.title;
        document.getElementById("apply-job-company").value = job.company;
        document.getElementById("apply-job-id").value = job.id;
    }

    setupApplicationForm() {
        const form = document.getElementById("application-form");
        if (!form) return;

        // block default submit
        form.addEventListener("submit", (e) => e.preventDefault());

        // submit button click
        const submitBtn = form.querySelector(".apply-btn");
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.handleApplicationSubmit();
        });

        // file input display
        const fileInput = document.getElementById("applicant-resume");
        const fileText = document.querySelector(".file-text");

        fileInput.addEventListener("change", (e) => {
            fileText.textContent =
                e.target.files.length > 0
                    ? e.target.files[0].name
                    : "Choose file (PDF, DOC, DOCX - max 5MB)";
        });
    }

    async handleApplicationSubmit() {
        const form = document.getElementById("application-form");
        const submitBtn = form.querySelector(".apply-btn");

        const formData = new FormData(form);

        // extra job info
        formData.append("jobTitle", document.getElementById("apply-job-title").value);
        formData.append("jobCompany", document.getElementById("apply-job-company").value);
        formData.append("jobId", document.getElementById("apply-job-id").value);

        if (!this.validateApplicationForm(formData)) return;

        this.setFormLoading(submitBtn, true);

        try {
            const response = await fetch("http://localhost:3000/api/applications/apply", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to submit application");

            this.showSuccessModal(data.applicationId);

            form.reset();
            document.querySelector(".file-text").textContent =
                "Choose file (PDF, DOC, DOCX - max 5MB)";
        } catch (error) {
            console.error("Application submission error:", error);
            this.showErrorModal(error.message);
        } finally {
            this.setFormLoading(submitBtn, false);
        }
    }

    validateApplicationForm(formData) {
        let isValid = true;

        document.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""));

        if (!formData.get("name")?.trim()) {
            document.getElementById("name-error").textContent = "Full name is required";
            isValid = false;
        }

        const email = formData.get("email");
        if (!email) {
            document.getElementById("email-error").textContent = "Email is required";
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            document.getElementById("email-error").textContent =
                "Please enter a valid email address";
            isValid = false;
        }

        if (!formData.get("phone")?.trim()) {
            document.getElementById("phone-error").textContent = "Phone number is required";
            isValid = false;
        }

        if (!formData.get("resume")?.name) {
            document.getElementById("resume-error").textContent = "Resume is required";
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    setFormLoading(button, loading) {
        const btnText = button.querySelector(".btn-text");
        const btnLoading = button.querySelector(".btn-loading");

        if (loading) {
            button.disabled = true;
            btnText.style.display = "none";
            btnLoading.style.display = "block";
        } else {
            button.disabled = false;
            btnText.style.display = "block";
            btnLoading.style.display = "none";
        }
    }

    // -------------------------------
    // FIXED MODAL (NO AUTO CLOSE BUG)
    // -------------------------------
    showSuccessModal(applicationId) {
        const overlay = this.createOverlay();
        const modal = this.createModal(`
            <div style="font-size:60px;color:#27ae60;margin-bottom:20px;">✅</div>
            <h2 style="color:#27ae60;margin-bottom:15px;">Application Submitted!</h2>
            <p style="font-size:16px;margin-bottom:10px;">Thank you for your application!</p>
            <p style="font-size:14px;color:#666;margin-bottom:20px;">
                <strong>Application ID:</strong> ${applicationId}
            </p>
            <button class="close-modal-btn"
                style="background:#27ae60;color:white;border:none;padding:12px 30px;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">
                OK
            </button>
        `);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        modal.querySelector(".close-modal-btn").addEventListener("click", () =>
            overlay.remove()
        );

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    showErrorModal(message) {
        const overlay = this.createOverlay();
        const modal = this.createModal(`
            <div style="font-size:60px;color:#e74c3c;margin-bottom:20px;">❌</div>
            <h2 style="color:#e74c3c;margin-bottom:15px;">Application Failed</h2>
            <p style="font-size:16px;margin-bottom:20px;">${message}</p>
            <button class="close-modal-btn"
                style="background:#e74c3c;color:white;border:none;padding:12px 30px;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">
                Try Again
            </button>
        `);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        modal.querySelector(".close-modal-btn").addEventListener("click", () =>
            overlay.remove()
        );

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    createOverlay() {
        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background: rgba(0,0,0,0.5);
            z-index:10000;
            display:flex; align-items:center; justify-content:center;
        `;
        return overlay;
    }

    createModal(html) {
        const modal = document.createElement("div");
        modal.style.cssText = `
            background:white; padding:40px; border-radius:15px; text-align:center;
            max-width:500px; width:90%; box-shadow:0 20px 50px rgba(0,0,0,0.3);
        `;
        modal.innerHTML = html;
        return modal;
    }

    showError(message) {
        const container = document.querySelector(".job-details-card");
        container.innerHTML = `
            <div style="text-align:center;padding:3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#e74c3c;"></i>
                <h3 style="color:#e74c3c;">Error Loading Job</h3>
                <p>${message}</p>
                <a href="jobs.html" class="btn btn-primary" style="margin-top:1rem;">
                    <i class="fas fa-arrow-left"></i> Back to Jobs
                </a>
            </div>
        `;
    }

    formatJobType(jobType) {
        const types = {
            "full-time": "Full Time",
            "part-time": "Part Time",
            contract: "Contract",
            temporary: "Temporary"
        };
        return types[jobType] || jobType;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.jobDetailsManager = new JobDetailsManager();
});
