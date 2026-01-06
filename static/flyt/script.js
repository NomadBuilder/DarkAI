// Waitlist Form Handler - Simple Custom Form
document.addEventListener('DOMContentLoaded', function() {
    // Only run on flyt page
    if (!document.querySelector('.flyt-page')) {
        return;
    }
    
    const form = document.getElementById('waitlistForm');
    const success = document.getElementById('waitlist-success');
    const error = document.getElementById('waitlist-error');
    const errorText = document.getElementById('error-text');
    const emailInput = document.getElementById('email');
    const submitButton = form?.querySelector('.submit-button');
    
    // Email validation function
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Real-time email validation
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();
            const isValid = validateEmail(email);
            
            // Remove previous error styling
            this.style.borderColor = '';
            this.style.boxShadow = '';
            
            if (email && !isValid) {
                // Show error state
                this.style.borderColor = '#ef4444';
                this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            } else if (isValid) {
                // Show success state
                this.style.borderColor = '#10b981';
                this.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            }
        });
        
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !validateEmail(email)) {
                this.style.borderColor = '#ef4444';
                this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = emailInput.value.trim();
            
            // Validate email before submission
            if (!email) {
                if (emailInput) {
                    emailInput.style.borderColor = '#ef4444';
                    emailInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                    emailInput.focus();
                }
                showErrorMessage('Please enter your email address');
                return;
            }
            
            if (!validateEmail(email)) {
                if (emailInput) {
                    emailInput.style.borderColor = '#ef4444';
                    emailInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                    emailInput.focus();
                }
                showErrorMessage('Please enter a valid email address');
                return;
            }
            
                // Show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.style.opacity = '0.6';
                submitButton.style.cursor = 'not-allowed';
                const buttonText = submitButton.querySelector('span');
                if (buttonText) buttonText.textContent = 'Submitting...';
            }
            
            // Hide previous messages
            if (error) error.style.display = 'none';
            if (success) success.style.display = 'none';
            
            try {
                // Determine API URL based on environment
                const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'http://localhost:5000/api/waitlist'
                    : 'https://darkai.ca/api/waitlist';
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Submission failed');
                }
                
                console.log('Email submitted successfully:', email);
                
                // Show success message
                if (form) form.style.display = 'none';
                if (error) error.style.display = 'none';
                if (success) success.style.display = 'block';
                
            } catch (error) {
                console.error('Error submitting email:', error);
                
                // Show user-friendly error message
                let errorMessage = 'Something went wrong. Please try again.';
                if (error.message && error.message.includes('fetch')) {
                    errorMessage = 'Unable to connect to server. Please check your connection.';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                // Show error message
                if (errorText) errorText.textContent = errorMessage;
                if (error) error.style.display = 'block';
                if (success) success.style.display = 'none';
                
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.style.cursor = 'pointer';
                    const buttonText = submitButton.querySelector('span');
                    if (buttonText) buttonText.textContent = 'Enter Waiting List';
                }
            }
        });
    }
    
    function showErrorMessage(message) {
        // Use the new error display system
        if (errorText) errorText.textContent = message;
        if (error) error.style.display = 'block';
        if (success) success.style.display = 'none';
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Parallax effect for hero background
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all feature cards and use case cards
    document.querySelectorAll('.feature-card, .use-case-card, .step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        observer.observe(el);
    });

    // Cursor trail effect
    let cursorTrail = [];
    const maxTrailLength = 20;
    
    document.addEventListener('mousemove', (e) => {
        cursorTrail.push({
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        });
        
        if (cursorTrail.length > maxTrailLength) {
            cursorTrail.shift();
        }
        
        updateCursorTrail();
    });

    function updateCursorTrail() {
        // Remove old trail elements
        document.querySelectorAll('.cursor-trail').forEach(el => el.remove());
        
        cursorTrail.forEach((point, index) => {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = point.x + 'px';
            trail.style.top = point.y + 'px';
            trail.style.opacity = (index / cursorTrail.length) * 0.3;
            trail.style.transform = `scale(${index / cursorTrail.length})`;
            document.body.appendChild(trail);
            
            setTimeout(() => trail.remove(), 300);
        });
    }

    // Magnetic button effect
    document.querySelectorAll('.cta-primary, .cta-secondary, .submit-button').forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const moveX = (x - centerX) * 0.1;
            const moveY = (y - centerY) * 0.1;
            
            this.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0, 0)';
        });
    });

    // Text reveal animation on scroll
    const textRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target;
                const words = text.textContent.split(' ');
                text.innerHTML = words.map((word, i) => 
                    `<span style="opacity: 0; animation: fadeInUp 0.3s ease forwards ${i * 0.02}s">${word}</span>`
                ).join(' ');
                textRevealObserver.unobserve(text);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.section-title, .hero-title').forEach(title => {
        textRevealObserver.observe(title);
    });

    // Gradient orb animation enhancement
    const orbs = document.querySelectorAll('.gradient-orb');
    orbs.forEach((orb, index) => {
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 100;
            const randomY = (Math.random() - 0.5) * 100;
            orb.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 3000 + index * 1000);
    });

    // Navbar scroll effect
    let lastScroll = 0;
    const nav = document.querySelector('.nav');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.style.background = 'rgba(10, 14, 26, 0.95)';
            nav.style.backdropFilter = 'blur(30px)';
        } else {
            nav.style.background = 'rgba(10, 14, 26, 0.8)';
            nav.style.backdropFilter = 'blur(20px)';
        }
        
        lastScroll = currentScroll;
    });

    // Card tilt effect on hover
    document.querySelectorAll('.feature-card, .use-case-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // Number counter animation
    const stats = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = entry.target.textContent;
                
                if (target === '∞') {
                    // Animate infinity symbol
                    entry.target.style.animation = 'pulse 2s ease infinite';
                } else if (target.includes('%')) {
                    const num = parseInt(target);
                    animateNumber(entry.target, 0, num, 1000, '%');
                }
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => statObserver.observe(stat));

    function animateNumber(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Glitch effect on logo hover
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseenter', function() {
            this.style.animation = 'glitch 0.3s ease';
        });
        
        logo.addEventListener('animationend', function() {
            this.style.animation = '';
        });
    }

    // Particle system for hero section
    createParticleSystem();
});

function createParticleSystem() {
    try {
        const hero = document.querySelector('.flyt-page .hero');
        if (!hero) return; // Exit if hero doesn't exist
        
        const canvas = document.createElement('canvas');
        canvas.className = 'particle-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        canvas.style.opacity = '0.3';
        
        hero.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return; // Exit if canvas context not available
        
        let animationFrameId = null;
        let isAnimating = false;
        
        function resizeCanvas() {
            canvas.width = hero.offsetWidth || window.innerWidth;
            canvas.height = hero.offsetHeight || window.innerHeight;
        }
        
        resizeCanvas();
        
        const particles = [];
        const particleCount = 30; // Reduced for better performance
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            
            draw() {
                ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function animate() {
            if (!isAnimating) return;
            
            try {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });
                
                // Connect nearby particles (simplified for performance)
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 100) {
                            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }
                
                animationFrameId = requestAnimationFrame(animate);
            } catch (e) {
                console.error('Particle animation error:', e);
                isAnimating = false;
            }
        }
        
        isAnimating = true;
        animate();
        
        const resizeHandler = () => {
            resizeCanvas();
        };
        
        window.addEventListener('resize', resizeHandler);
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            isAnimating = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            window.removeEventListener('resize', resizeHandler);
        });
    } catch (e) {
        console.error('Particle system error:', e);
        // Fail silently - particle system is not critical
    }
}
