console.log("Partners page JS loaded");
document.addEventListener('click', function(e) {
    console.log('Clicked:', e.target);
});
// Partners Modal Functionality
class PartnersManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupPartnerModals();
    }

    setupPartnerModals() {
        // Partner data with descriptions
       // Partners data with descriptions
this.partnersData = {
    // Hospitals/Schools/Universities
    'Philippine Christian University': {
        description: 'A leading educational institution committed to academic excellence and character formation, offering diverse programs across multiple disciplines.',
        website: '#',
        contact: 'info@pcu.edu.ph',
        established: '1946'
    },
    'De La Salle': {
        description: 'Premier university system known for academic excellence, research innovation, and producing globally competitive graduates.',
        website: '#',
        contact: 'admissions@dlsu.edu.ph',
        established: '1911'
    },
    'NCST': {
        description: 'Technology and skills training institution providing industry-relevant education and technical vocational programs.',
        website: '#',
        contact: 'info@ncst.edu.ph',
        established: '1998'
    },
    'LPU': {
        description: 'Comprehensive university offering quality education with modern facilities and industry partnerships.',
        website: '#',
        contact: 'admissions@lpu.edu.ph',
        established: '1952'
    },

    // Banking & Insurance
    'Agricultural Bank of the Philippines': {
        description: 'Financial institution specializing in agricultural financing and rural development services.',
        website: '#',
        contact: 'customercare@abp.com.ph',
        established: '1963'
    },
    'Walter Mart': {
        description: 'Leading retail chain offering diverse shopping experiences and commercial services nationwide.',
        website: '#',
        contact: 'info@waltermart.com.ph',
        established: '2002'
    },
    'Toyota': {
        description: 'Global automotive industry leader providing quality vehicles and comprehensive automotive services.',
        website: '#',
        contact: 'customercare@toyota.com.ph',
        established: '1988'
    },
    'Saffron': {
        description: 'Retail and business services provider offering innovative commercial solutions.',
        website: '#',
        contact: 'info@saffron.com.ph',
        established: '2010'
    },

    // Real Estate Developer
    'SunRays': {
        description: 'Innovative property development company creating sustainable and modern living spaces.',
        website: '#',
        contact: 'inquiry@sunrays.com.ph',
        established: '2015'
    },
    'SunTrust': {
        description: 'Trusted real estate developer known for quality projects and reliable property solutions.',
        website: '#',
        contact: 'sales@suntrust.com.ph',
        established: '2012'
    },

    // Manufacturing & Electronics
    'Global Nexus': {
        description: 'Global manufacturing solutions provider specializing in innovative production technologies.',
        website: '#',
        contact: 'info@globalnexus.com.ph',
        established: '2005'
    },
    'Enometo': {
        description: 'Electronics and technology company providing advanced electronic components and solutions.',
        website: '#',
        contact: 'sales@enometo.com.ph',
        established: '2008'
    },
    'Sanno Philippines Manufacturing Corporation': {
        description: 'Comprehensive manufacturing services provider with state-of-the-art production facilities.',
        website: '#',
        contact: 'operations@sanno.com.ph',
        established: '1995'
    },
    'Camville Manufacturers Corporation': {
        description: 'Quality manufacturing solutions provider specializing in precision engineering.',
        website: '#',
        contact: 'info@camville.com.ph',
        established: '2000'
    },

    // Export Processing Zone (FCIE)
    'Fujisash Philippines, INC.': {
        description: 'Specialized manufacturer of glass products and construction materials for export markets.',
        website: '#',
        contact: 'exports@fujisash.ph',
        established: '1990'
    },
    'Pilipinas NM, Inc.': {
        description: 'Industrial manufacturing company producing quality components for international markets.',
        website: '#',
        contact: 'info@pilipinasnm.com',
        established: '1985'
    },
    'MAHLE': {
        description: 'Global automotive components manufacturer specializing in engine systems and filtration.',
        website: '#',
        contact: 'ph.operations@mahle.com',
        established: '1978'
    },
    'Ishida Philippines Tube CO. INC.': {
        description: 'Specialized tube manufacturing company serving various industrial applications.',
        website: '#',
        contact: 'sales@ishidatube.ph',
        established: '1992'
    },
    'Mitsuboshi Philippines Corporation': {
        description: 'Electrical components manufacturer producing quality products for global markets.',
        website: '#',
        contact: 'info@mitsuboshi.ph',
        established: '1987'
    },

    // Golf & Country Club
    'Eagle Ridge': {
        description: 'Premium golf and leisure destination offering world-class facilities and scenic courses.',
        website: '#',
        contact: 'reservations@eagleridge.com.ph',
        established: '1999'
    },
    'Science Park': {
        description: 'Innovation and recreation center combining technology with leisure activities.',
        website: '#',
        contact: 'info@sciencepark.ph',
        established: '2010'
    },
    'Gentri Water District': {
        description: 'Water services provider ensuring reliable water supply and facility management.',
        website: '#',
        contact: 'customercare@gentriwater.gov.ph',
        established: '1975'
    },
    'Riviera': {
        description: 'Exclusive country club offering premium recreational facilities and social amenities.',
        website: '#',
        contact: 'membership@rivieraclub.ph',
        established: '1980'
    }
};
        this.attachClickHandlers();
    }

    attachClickHandlers() {
    // Use event delegation for partner cards
    document.addEventListener('click', (e) => {
        const partnerCard = e.target.closest('.partner-card');
        if (partnerCard) {
            const partnerName = partnerCard.querySelector('h3').textContent;
            this.openPartnerModal(partnerName);
            return;
        }

        // Close modal when clicking close button (more specific)
        if (e.target.classList.contains('modal-close-btn') || 
            e.target.closest('.modal-close-btn')) {
            this.closePartnerModal();
            return;
        }

        // Close modal when clicking overlay
        if (e.target.classList.contains('modal-overlay')) {
            this.closePartnerModal();
            return;
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.closePartnerModal();
        }
    });
}
   openPartnerModal(partnerName) {
    const partnerData = this.partnersData[partnerName];
    if (!partnerData) return;

    const modalHTML = `
        <div class="modal-overlay">
            <div class="partner-modal">
                <button class="modal-close-btn" style="padding: 1rem;">
                    <i class="fas fa-times"></i>
                </button>
                <div class="partner-modal-header">
                    <h2>${partnerName}</h2>
                    <div class="partner-badge">Featured Partner</div>
                </div>
                <div class="partner-modal-content">
                    <div class="partner-description">
                        <p>${partnerData.description}</p>
                    </div>
                    <div class="partner-details">
                        <div class="detail-item">
                            <i class="fas fa-globe"></i>
                            <div>
                                <strong>Website</strong>
                                <a href="${partnerData.website}" target="_blank">${partnerData.website}</a>
                            </div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-envelope"></i>
                            <div>
                                <strong>Contact</strong>
                                <span>${partnerData.contact}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div>
                                <strong>Established</strong>
                                <span>${partnerData.established}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="partner-modal-footer">
                    <button class="btn btn-primary" onclick="window.open('${partnerData.website}', '_blank')">
                        <i class="fas fa-external-link-alt"></i>
                        Visit Website
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

    closePartnerModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }
}

// Initialize partners manager when on partners page
if (window.location.pathname.includes('partners.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.partnersManager = new PartnersManager();
    });
}

// Floating particles creation
function createFloatingParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) return;

    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Random properties
        const size = Math.random() * 8 + 4;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 20 + 10;
        const animationDelay = Math.random() * 5;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            animation-duration: ${animationDuration}s;
            animation-delay: ${animationDelay}s;
            opacity: ${Math.random() * 0.3 + 0.1};
        `;
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize when on partners page
if (window.location.pathname.includes('partners.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        createFloatingParticles();
        window.partnersManager = new PartnersManager();
    });
}