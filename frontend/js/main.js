// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });

    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {

    const slides = document.querySelectorAll(".job-slide");
    let currentIndex = 0;

    function updateSlide(nextIndex) {
        slides[currentIndex].classList.remove("active");
        slides[nextIndex].classList.add("active");
        currentIndex = nextIndex;
    }


});


const phrases = [
    "Find Your Next Career",
    "Discover Amazing Opportunities",
    "Unlock Your Potential",
    "Connect With Top Employers"
];

let currentPhrase = 0;
let currentChar = 0;
let isDeleting = false;

const speed = 60;       // typing speed
const deleteSpeed = 40; // delete speed
const delayAfterWord = 800;

const typewriter = document.getElementById("typewriter");

function typeLoop() {
    let phrase = phrases[currentPhrase];

    if (!isDeleting) {
        // TYPE FORWARD
        typewriter.textContent = phrase.slice(0, currentChar + 1);
        currentChar++;

        // Finished typing the full phrase
        if (currentChar === phrase.length) {
            isDeleting = true;
            setTimeout(typeLoop, delayAfterWord);
            return;
        }
    } else {
        // DELETE BACKWARD
        typewriter.textContent = phrase.slice(0, currentChar - 1);
        currentChar--;

        // Finished deleting
        if (currentChar === 0) {
            isDeleting = false;
            currentPhrase = (currentPhrase + 1) % phrases.length;
        }
    }

    setTimeout(typeLoop, isDeleting ? deleteSpeed : speed);
}

typeLoop();


// loading screen //

   let progress = 0;
        const percentageEl = document.getElementById('percentage');
        const progressFill = document.getElementById('progressFill');
        const loadingScreen = document.getElementById('loadingScreen');

        // Simulate loading progress
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            percentageEl.textContent = Math.round(progress) + '%';
            progressFill.style.width = progress + '%';
            
            if (progress === 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 500);
            }
        }, 300);