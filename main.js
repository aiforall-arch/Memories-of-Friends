// Memories of Friends - Main JavaScript File
// Comprehensive interactive functionality for the memorial website

// Global variables and state management
let currentLightboxIndex = 0;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let currentAudioPlayer = null;

// Sample data for demonstration
const samplePhotos = [
    {
        src: "https://kimi-web-img.moonshot.cn/img/shastone.com/738958de78ea84e024a61d8a460f0425a4443734.jpg",
        title: "Light in Remembrance",
        author: "Sarah M.",
        avatar: "https://kimi-web-img.moonshot.cn/img/images.stockcake.com/853005650ed6505cb38c89ae965a2bd34952de82.jpg",
        description: "Lighting these candles in memory of my grandmother on the anniversary of her passing. Her light continues to guide us.",
        category: "Memorial",
        likes: 42,
        timeAgo: "2 hours ago"
    },
    {
        src: "https://kimi-web-img.moonshot.cn/img/media.istockphoto.com/0609284a80c28f1c96dc40cd0383e3c1146f1455.jpg",
        title: "Sunset at Lavender Fields",
        author: "Michael R.",
        avatar: "https://kimi-web-img.moonshot.cn/img/petaldriven.com/3e833abd85621bb4800faadc2f7345b89aa52528.jpg",
        description: "This photo reminds me of the trip we took to Provence. Mom loved lavender more than anything.",
        category: "Nature",
        likes: 31,
        timeAgo: "5 hours ago"
    }
];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    initializeHeroAnimations();
    initializeCarousels();
    initializeScrollAnimations();
    initializeParticleEffect();
    initializeFilters();
    initializeModals();
    initializeUploadHandlers();
    
    // Page-specific initializations
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'stories':
            initializeStoriesPage();
            break;
        case 'gallery':
            initializeGalleryPage();
            break;
        case 'media':
            initializeMediaPage();
            break;
    }
}

// Get current page identifier
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('stories')) return 'stories';
    if (path.includes('gallery')) return 'gallery';
    if (path.includes('media')) return 'media';
    return 'index';
}

// Hero section animations
function initializeHeroAnimations() {
    // Typewriter effect for hero text
    if (document.getElementById('hero-text')) {
        const heroMessages = [
            "Where love, laughter, and stories stay alive",
            "Preserving precious memories forever",
            "A place of remembrance and healing"
        ];
        
        let messageIndex = 0;
        
        const typed = new Typed('#hero-text', {
            strings: [heroMessages[0]],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 3000,
            loop: false,
            showCursor: true,
            cursorChar: '|',
            onComplete: function() {
                // Add gentle fade-in animation to hero elements
                anime({
                    targets: '.hero-bg .content-layer > div:not(:first-child)',
                    opacity: [0, 1],
                    translateY: [30, 0],
                    delay: anime.stagger(200),
                    duration: 800,
                    easing: 'easeOutQuart'
                });
            }
        });
    }
}

// Initialize carousels and sliders
function initializeCarousels() {
    // Memory carousel on homepage
    if (document.getElementById('memory-carousel')) {
        const memoryCarousel = new Splide('#memory-carousel', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            gap: '2rem',
            autoplay: true,
            interval: 5000,
            pauseOnHover: true,
            breakpoints: {
                768: {
                    perPage: 1,
                },
                1024: {
                    perPage: 2,
                }
            }
        });
        
        memoryCarousel.mount();
        
        // Animate cards as they come into view
        memoryCarousel.on('moved', function() {
            animateVisibleCards();
        });
    }
}

// Scroll-triggered animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.classList.contains('memory-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateY: [30, 0],
                        duration: 600,
                        easing: 'easeOutQuart',
                        delay: Math.random() * 200
                    });
                }
                
                if (element.classList.contains('story-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateY: [40, 0],
                        duration: 800,
                        easing: 'easeOutQuart'
                    });
                }
                
                if (element.classList.contains('photo-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        scale: [0.9, 1],
                        duration: 600,
                        easing: 'easeOutQuart',
                        delay: Math.random() * 300
                    });
                }
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    document.querySelectorAll('.memory-card, .story-card, .photo-card, .media-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Particle effect for hero background
function initializeParticleEffect() {
    if (document.getElementById('particles')) {
        // Simple particle system using p5.js
        new p5((p) => {
            let particles = [];
            
            p.setup = function() {
                const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                canvas.parent('particles');
                canvas.style('position', 'absolute');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('z-index', '1');
                
                // Create particles
                for (let i = 0; i < 50; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        size: p.random(2, 6),
                        speedX: p.random(-0.5, 0.5),
                        speedY: p.random(-0.5, 0.5),
                        opacity: p.random(0.1, 0.3)
                    });
                }
            };
            
            p.draw = function() {
                p.clear();
                
                particles.forEach(particle => {
                    p.fill(216, 191, 216, particle.opacity * 255);
                    p.noStroke();
                    p.ellipse(particle.x, particle.y, particle.size);
                    
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                });
            };
            
            p.windowResized = function() {
                p.resizeCanvas(window.innerWidth, window.innerHeight);
            };
        });
    }
}

// Filter functionality
function initializeFilters() {
    // Filter buttons
    document.querySelectorAll('.filter-button').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const container = this.closest('section').querySelector('[data-items]') || 
                             this.closest('section').nextElementSibling.querySelector('#stories-grid, #photo-gallery, .grid');
            
            // Update active button
            this.parentElement.querySelectorAll('.filter-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Filter items
            if (container) {
                filterItems(container, filter);
            }
        });
    });
    
    // Tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Update active tab
            this.parentElement.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show/hide content
            const section = this.closest('section').nextElementSibling;
            if (section) {
                filterItems(section, tab);
            }
        });
    });
}

// Filter items based on category
function filterItems(container, filter) {
    const items = container.querySelectorAll('[data-category], [data-type]');
    
    items.forEach(item => {
        const itemFilter = item.dataset.category || item.dataset.type;
        
        if (filter === 'all' || itemFilter === filter) {
            anime({
                targets: item,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 400,
                easing: 'easeOutQuart',
                begin: function() {
                    item.style.display = 'block';
                }
            });
        } else {
            anime({
                targets: item,
                opacity: [1, 0],
                scale: [1, 0.8],
                duration: 300,
                easing: 'easeInQuart',
                complete: function() {
                    item.style.display = 'none';
                }
            });
        }
    });
}

// Modal functionality
function initializeModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop') || 
            e.target.classList.contains('lightbox')) {
            closeAllModals();
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Upload handlers
function initializeUploadHandlers() {
    // File upload drag and drop
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
        const input = area.querySelector('input[type="file"]');
        
        area.addEventListener('click', () => input?.click());
        
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                input.files = files;
                handleFileSelect(files);
            }
        });
    });
}

// Page-specific initializations
function initializeHomePage() {
    // Animate statistics counter
    animateCounters();
    
    // Initialize memory type cards hover effects
    document.querySelectorAll('.memory-type-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            anime({
                targets: this.querySelector('.memory-type-icon'),
                scale: [1, 1.1],
                duration: 300,
                easing: 'easeOutQuart'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            anime({
                targets: this.querySelector('.memory-type-icon'),
                scale: [1.1, 1],
                duration: 300,
                easing: 'easeOutQuart'
            });
        });
    });
}

function initializeStoriesPage() {
    // Initialize story expansion functionality
    initializeStoryExpansion();
    
    // Initialize like buttons
    initializeLikeButtons();
    
    // Initialize comment sections
    initializeComments();
}

function initializeGalleryPage() {
    // Initialize lightbox
    initializeLightbox();
    
    // Initialize masonry layout
    initializeMasonryLayout();
}

function initializeMediaPage() {
    // Initialize audio players
    initializeAudioPlayers();
    
    // Initialize video players
    initializeVideoPlayers();
    
    // Initialize recording functionality
    initializeRecording();
    
    // Initialize upload tabs
    initializeUploadTabs();
}

// Story functionality
function initializeStoryExpansion() {
    // Already handled by inline onclick functions
}

function toggleStoryExpansion(button) {
    const storyCard = button.closest('.story-card');
    const content = storyCard.querySelector('.story-content');
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        content.classList.remove('expanded');
        button.textContent = 'Read More';
        
        anime({
            targets: content,
            maxHeight: '120px',
            duration: 400,
            easing: 'easeInOutQuart'
        });
    } else {
        content.classList.add('expanded');
        button.textContent = 'Read Less';
        
        anime({
            targets: content,
            maxHeight: 'none',
            duration: 400,
            easing: 'easeInOutQuart'
        });
    }
}

function initializeLikeButtons() {
    // Like button functionality is handled by inline onclick
}

function toggleLike(button) {
    const isLiked = button.classList.contains('liked');
    const countSpan = button.querySelector('span');
    let count = parseInt(countSpan.textContent);
    
    if (isLiked) {
        button.classList.remove('liked');
        count--;
        
        anime({
            targets: button,
            scale: [1.2, 1],
            duration: 200,
            easing: 'easeOutQuart'
        });
    } else {
        button.classList.add('liked');
        count++;
        
        anime({
            targets: button,
            scale: [1, 1.2, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
        });
    }
    
    countSpan.textContent = count;
}

function initializeComments() {
    // Comment toggle functionality
}

function toggleComments(button) {
    const storyCard = button.closest('.story-card');
    const commentsSection = storyCard.querySelector('.comments-section');
    
    if (commentsSection.classList.contains('hidden')) {
        commentsSection.classList.remove('hidden');
        
        anime({
            targets: commentsSection,
            opacity: [0, 1],
            translateY: [-20, 0],
            duration: 400,
            easing: 'easeOutQuart'
        });
    } else {
        anime({
            targets: commentsSection,
            opacity: [1, 0],
            translateY: [0, -20],
            duration: 300,
            easing: 'easeInQuart',
            complete: function() {
                commentsSection.classList.add('hidden');
            }
        });
    }
}

// Gallery functionality
function initializeLightbox() {
    // Lightbox functionality is handled by global functions
}

function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const photo = samplePhotos[index] || samplePhotos[0];
    
    // Populate lightbox content
    document.getElementById('lightbox-image').src = photo.src;
    document.getElementById('lightbox-title').textContent = photo.title;
    document.getElementById('lightbox-description').textContent = photo.description;
    document.getElementById('lightbox-author-name').textContent = photo.author;
    document.getElementById('lightbox-author-avatar').src = photo.avatar;
    document.getElementById('lightbox-upload-date').textContent = photo.timeAgo;
    document.getElementById('lightbox-likes').textContent = photo.likes;
    document.getElementById('lightbox-category').textContent = photo.category;
    
    // Show lightbox with animation
    lightbox.classList.remove('hidden');
    
    anime({
        targets: lightbox,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    anime({
        targets: lightbox.querySelector('.lightbox-content'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutElastic(1, .8)',
        delay: 100
    });
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    anime({
        targets: lightbox,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuart',
        complete: function() {
            lightbox.classList.add('hidden');
        }
    });
}

function nextPhoto() {
    currentLightboxIndex = (currentLightboxIndex + 1) % samplePhotos.length;
    openLightbox(currentLightboxIndex);
}

function previousPhoto() {
    currentLightboxIndex = (currentLightboxIndex - 1 + samplePhotos.length) % samplePhotos.length;
    openLightbox(currentLightboxIndex);
}

function initializeMasonryLayout() {
    // Masonry layout is handled by CSS
}

// Media functionality
function initializeAudioPlayers() {
    // Audio player functionality is handled by inline onclick
}

function toggleAudioPlayback(button) {
    const playIcon = button.querySelector('svg');
    const isPlaying = button.classList.contains('playing');
    
    // Stop other players
    if (currentAudioPlayer && currentAudioPlayer !== button) {
        stopAudioPlayback(currentAudioPlayer);
    }
    
    if (isPlaying) {
        stopAudioPlayback(button);
    } else {
        startAudioPlayback(button);
        currentAudioPlayer = button;
    }
}

function startAudioPlayback(button) {
    const playIcon = button.querySelector('svg');
    button.classList.add('playing');
    
    // Change play icon to pause
    playIcon.innerHTML = '<path d="M6 4h4v12H6V4zm8 0h4v12h-4V4z"></path>';
    
    // Animate button
    anime({
        targets: button,
        scale: [1, 0.95, 1],
        duration: 200,
        easing: 'easeOutQuart'
    });
    
    // Simulate waveform animation
    const waveform = button.closest('.audio-player').querySelector('.waveform::before');
    if (waveform) {
        waveform.style.animationPlayState = 'running';
    }
}

function stopAudioPlayback(button) {
    const playIcon = button.querySelector('svg');
    button.classList.remove('playing');
    
    // Change pause icon to play
    playIcon.innerHTML = '<path d="M8 5v10l7-5z"></path>';
    
    if (currentAudioPlayer === button) {
        currentAudioPlayer = null;
    }
}

function initializeVideoPlayers() {
    // Video player functionality
}

function playVideo(button) {
    // Simulate video play
    const playIcon = button.querySelector('svg');
    
    anime({
        targets: button,
        scale: [1, 0.9, 1],
        duration: 200,
        easing: 'easeOutQuart'
    });
    
    // Show notification
    showNotification('Video playback would start here');
}

function initializeRecording() {
    // Recording functionality
}

function toggleRecording() {
    const button = document.getElementById('record-button');
    const indicator = document.querySelector('.recording-indicator');
    
    if (isRecording) {
        stopRecording();
        button.textContent = 'Start Recording';
        button.classList.remove('bg-red-500');
        button.classList.add('bg-lavender-dream');
    } else {
        startRecording();
        button.textContent = 'Stop Recording';
        button.classList.remove('bg-lavender-dream');
        button.classList.add('bg-red-500');
    }
    
    isRecording = !isRecording;
}

function startRecording() {
    // Simulate recording start
    showNotification('Recording started...');
}

function stopRecording() {
    // Simulate recording stop
    showNotification('Recording stopped. Audio saved.');
}

function initializeUploadTabs() {
    document.querySelectorAll('[data-upload-tab]').forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.uploadTab;
            
            // Update active tab
            this.parentElement.querySelectorAll('.tab-button').forEach(t => {
                t.classList.remove('active', 'border-lavender-dream');
            });
            this.classList.add('active', 'border-lavender-dream');
            
            // Show/hide upload sections
            document.querySelectorAll('.upload-section').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(targetTab + '-upload').classList.remove('hidden');
        });
    });
}

// Modal functions
function openStoryModal() {
    const modal = document.getElementById('story-modal');
    modal.classList.remove('hidden');
    
    anime({
        targets: modal,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutElastic(1, .8)',
        delay: 100
    });
}

function closeStoryModal() {
    const modal = document.getElementById('story-modal');
    
    anime({
        targets: modal,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuart',
        complete: function() {
            modal.classList.add('hidden');
        }
    });
}

function openUploadModal() {
    const modal = document.getElementById('upload-modal');
    modal.classList.remove('hidden');
    
    anime({
        targets: modal,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutElastic(1, .8)',
        delay: 100
    });
}

function closeUploadModal() {
    const modal = document.getElementById('upload-modal');
    
    anime({
        targets: modal,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuart',
        complete: function() {
            modal.classList.add('hidden');
        }
    });
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal-backdrop, .lightbox');
    modals.forEach(modal => {
        if (!modal.classList.contains('hidden')) {
            if (modal.classList.contains('lightbox')) {
                closeLightbox();
            } else {
                modal.classList.add('hidden');
            }
        }
    });
}

// Form submissions
function submitStory(event) {
    event.preventDefault();
    
    const formData = {
        author: document.getElementById('author-name').value,
        title: document.getElementById('story-title').value,
        category: document.getElementById('story-category').value,
        content: document.getElementById('story-content').value
    };
    
    // Simulate story submission
    showNotification('Story submitted successfully!');
    closeStoryModal();
    
    // Reset form
    event.target.reset();
}

function uploadPhotos(event) {
    event.preventDefault();
    
    showNotification('Photos uploaded successfully!');
    closeUploadModal();
}

function uploadMedia() {
    showNotification('Media uploaded successfully!');
    closeUploadModal();
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.counter);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current).toLocaleString();
        }, 16);
    });
}

function animateVisibleCards() {
    const cards = document.querySelectorAll('.recent-memory:not(.visible)');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
            anime({
                targets: card,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 600,
                easing: 'easeOutQuart'
            });
        }, index * 100);
    });
}

function handleFileSelect(files) {
    // Handle file selection
    console.log('Files selected:', files);
    showNotification(`${files.length} file(s) selected`);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-lavender-dream text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuart'
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 400,
            easing: 'easeInQuart',
            complete: function() {
                document.body.removeChild(notification);
            }
        });
    }, 3000);
}

// Handle responsive navigation
function toggleMobileNav() {
    // Mobile navigation toggle functionality
    console.log('Mobile navigation toggled');
}

// Export functions for global access
window.scrollToSection = scrollToSection;
window.openStoryModal = openStoryModal;
window.closeStoryModal = closeStoryModal;
window.openUploadModal = openUploadModal;
window.closeUploadModal = closeUploadModal;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextPhoto = nextPhoto;
window.previousPhoto = previousPhoto;
window.toggleLike = toggleLike;
window.toggleComments = toggleComments;
window.toggleStoryExpansion = toggleStoryExpansion;
window.toggleAudioPlayback = toggleAudioPlayback;
window.playVideo = playVideo;
window.toggleRecording = toggleRecording;
window.submitStory = submitStory;
window.uploadPhotos = uploadPhotos;
window.uploadMedia = uploadMedia;