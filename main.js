// Memories of Friends - Main JavaScript with Supabase Integration
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Global variables
let currentLightboxIndex = 0;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let currentAudioPlayer = null;
let allPhotos = [];
let allStories = [];
let allMedia = [];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
async function initializeApp() {
    initializeHeroAnimations();
    initializeCarousels();
    initializeScrollAnimations();
    initializeParticleEffect();
    initializeFilters();
    initializeModals();
    initializeUploadHandlers();
    
    // Load data from Supabase
    await loadDataFromSupabase();
    
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

// Load all data from Supabase
async function loadDataFromSupabase() {
    try {
        // Load stories
        const { data: stories, error: storiesError } = await supabase
            .from('stories')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (storiesError) throw storiesError;
        allStories = stories || [];
        
        // Load photos
        const { data: photos, error: photosError } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (photosError) throw photosError;
        allPhotos = photos || [];
        
        // Load media
        const { data: media, error: mediaError } = await supabase
            .from('media')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (mediaError) throw mediaError;
        allMedia = media || [];
        
        // Render content based on current page
        const currentPage = getCurrentPage();
        if (currentPage === 'stories') renderStories();
        if (currentPage === 'gallery') renderPhotos();
        if (currentPage === 'media') renderMedia();
        if (currentPage === 'index') renderRecentMemories();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data. Please refresh the page.', 'error');
    }
}

// Render stories on stories page
function renderStories() {
    const container = document.getElementById('stories-grid');
    if (!container) return;
    
    if (allStories.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-soft-grey text-lg">No stories yet. Be the first to share a memory!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allStories.map(story => `
        <article class="story-card bg-white rounded-2xl p-6 border border-lavender-mist" data-category="${story.category}">
            <div class="flex items-center mb-4">
                <img src="${story.author_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(story.author_name)}" 
                     alt="${story.author_name}" class="w-12 h-12 rounded-full object-cover mr-4">
                <div>
                    <h3 class="font-semibold text-warm-grey">${story.author_name}</h3>
                    <p class="text-sm text-soft-grey">${story.title}</p>
                </div>
            </div>
            
            <div class="story-content text-soft-grey leading-relaxed mb-4">
                ${story.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button class="like-button flex items-center space-x-2 text-soft-grey hover:text-lavender-dream" 
                            onclick="toggleLikeStory('${story.id}', ${story.likes}, this)">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
                        </svg>
                        <span>${story.likes}</span>
                    </button>
                    <button class="flex items-center space-x-2 text-soft-grey hover:text-warm-grey" 
                            onclick="toggleComments(this)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <span>${story.comments_count || 0}</span>
                    </button>
                </div>
                <button class="text-lavender-dream hover:text-lavender-mist text-sm font-medium" 
                        onclick="toggleStoryExpansion(this)">
                    Read More
                </button>
            </div>
            
            <div class="comments-section mt-4 hidden" data-story-id="${story.id}">
                <div class="border-t border-lavender-mist pt-4">
                    <div class="comments-list space-y-3 mb-4" id="comments-${story.id}"></div>
                    <div class="flex items-center space-x-3">
                        <input type="text" placeholder="Add a comment..." 
                               class="flex-1 border border-lavender-mist rounded-lg px-3 py-2 text-sm"
                               id="comment-input-${story.id}">
                        <button class="bg-lavender-dream text-white px-4 py-2 rounded-lg text-sm hover:bg-lavender-mist"
                                onclick="addComment('${story.id}', 'story')">
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

// Render photos on gallery page
function renderPhotos() {
    const container = document.getElementById('photo-gallery');
    if (!container) return;
    
    if (allPhotos.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-soft-grey text-lg">No photos yet. Be the first to share a memory!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allPhotos.map((photo, index) => `
        <div class="masonry-item photo-card bg-white rounded-2xl border border-lavender-mist overflow-hidden cursor-pointer" 
             data-category="${photo.category}" onclick="openLightbox(${index})">
            <img src="${photo.image_url}" alt="${photo.title}" class="w-full h-auto object-cover">
            <div class="p-4">
                <div class="flex items-center mb-3">
                    <img src="${photo.author_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(photo.author_name)}" 
                         alt="${photo.author_name}" class="w-8 h-8 rounded-full object-cover mr-3">
                    <div>
                        <h4 class="font-semibold text-warm-grey text-sm">${photo.author_name}</h4>
                        <p class="text-xs text-soft-grey">${formatTimeAgo(photo.created_at)}</p>
                    </div>
                </div>
                <h3 class="font-playfair text-lg font-semibold text-warm-grey mb-2">${photo.title}</h3>
                <p class="text-soft-grey text-sm leading-relaxed">${photo.description}</p>
                <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center space-x-4">
                        <button class="flex items-center space-x-2 text-lavender-dream hover:text-lavender-mist"
                                onclick="event.stopPropagation(); toggleLikePhoto('${photo.id}', ${photo.likes}, this)">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
                            </svg>
                            <span class="text-sm">${photo.likes}</span>
                        </button>
                    </div>
                    <span class="text-xs text-soft-grey">${photo.category}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Render media on media page
function renderMedia() {
    const container = document.querySelector('#media-page .grid');
    if (!container) return;
    
    if (allMedia.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-soft-grey text-lg">No media yet. Be the first to share!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allMedia.map(media => {
        if (media.media_type === 'audio') {
            return renderAudioCard(media);
        } else {
            return renderVideoCard(media);
        }
    }).join('');
}

// Render audio card
function renderAudioCard(media) {
    return `
        <div class="media-card bg-white rounded-2xl p-6 border border-lavender-mist" data-type="audio">
            <div class="flex items-center mb-4">
                <img src="${media.author_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(media.author_name)}" 
                     alt="${media.author_name}" class="w-12 h-12 rounded-full object-cover mr-4">
                <div>
                    <h3 class="font-semibold text-warm-grey">${media.author_name}</h3>
                    <p class="text-sm text-soft-grey">${formatTimeAgo(media.created_at)}</p>
                </div>
            </div>
            
            <h4 class="font-playfair text-xl font-semibold text-warm-grey mb-4">${media.title}</h4>
            
            <div class="audio-player rounded-lg p-4 mb-4">
                <audio src="${media.media_url}" class="w-full" controls></audio>
            </div>
            
            <p class="text-soft-grey text-sm leading-relaxed mb-4">${media.description}</p>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button class="flex items-center space-x-2 text-lavender-dream hover:text-lavender-mist"
                            onclick="toggleLikeMedia('${media.id}', ${media.likes}, this)">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
                        </svg>
                        <span class="text-sm">${media.likes}</span>
                    </button>
                </div>
                <span class="text-xs text-soft-grey bg-gentle-rose px-2 py-1 rounded-full">Audio</span>
            </div>
        </div>
    `;
}

// Render video card
function renderVideoCard(media) {
    return `
        <div class="media-card bg-white rounded-2xl p-6 border border-lavender-mist" data-type="video">
            <div class="aspect-w-16 aspect-h-9 mb-4">
                <iframe src="${getEmbedUrl(media.media_url)}" 
                        class="w-full rounded-lg" 
                        style="aspect-ratio: 16/9;"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            </div>
            
            <div class="flex items-center mb-3">
                <img src="${media.author_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(media.author_name)}" 
                     alt="${media.author_name}" class="w-10 h-10 rounded-full object-cover mr-3">
                <div>
                    <h3 class="font-semibold text-warm-grey">${media.author_name}</h3>
                    <p class="text-sm text-soft-grey">${formatTimeAgo(media.created_at)}</p>
                </div>
            </div>
            
            <h4 class="font-playfair text-xl font-semibold text-warm-grey mb-2">${media.title}</h4>
            <p class="text-soft-grey text-sm leading-relaxed mb-4">${media.description}</p>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button class="flex items-center space-x-2 text-lavender-dream hover:text-lavender-mist"
                            onclick="toggleLikeMedia('${media.id}', ${media.likes}, this)">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
                        </svg>
                        <span class="text-sm">${media.likes}</span>
                    </button>
                </div>
                <span class="text-xs text-soft-grey bg-gentle-rose px-2 py-1 rounded-full">Video</span>
            </div>
        </div>
    `;
}

// Convert YouTube URL to embed URL
function getEmbedUrl(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
            ? url.split('youtu.be/')[1]?.split('?')[0]
            : url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
}

// Toggle like for story
async function toggleLikeStory(storyId, currentLikes, button) {
    try {
        const newLikes = currentLikes + 1;
        
        const { error } = await supabase
            .from('stories')
            .update({ likes: newLikes })
            .eq('id', storyId);
        
        if (error) throw error;
        
        // Update UI
        button.querySelector('span').textContent = newLikes;
        button.classList.add('liked');
        
        // Animation
        anime({
            targets: button,
            scale: [1, 1.2, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
        });
        
        showNotification('Thank you for your support! 💜');
    } catch (error) {
        console.error('Error liking story:', error);
        showNotification('Error liking story. Please try again.', 'error');
    }
}

// Toggle like for photo
async function toggleLikePhoto(photoId, currentLikes, button) {
    try {
        const newLikes = currentLikes + 1;
        
        const { error } = await supabase
            .from('photos')
            .update({ likes: newLikes })
            .eq('id', photoId);
        
        if (error) throw error;
        
        button.querySelector('span').textContent = newLikes;
        
        anime({
            targets: button,
            scale: [1, 1.2, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
        });
        
        showNotification('Thank you for your support! 💜');
    } catch (error) {
        console.error('Error liking photo:', error);
        showNotification('Error liking photo. Please try again.', 'error');
    }
}

// Toggle like for media
async function toggleLikeMedia(mediaId, currentLikes, button) {
    try {
        const newLikes = currentLikes + 1;
        
        const { error } = await supabase
            .from('media')
            .update({ likes: newLikes })
            .eq('id', mediaId);
        
        if (error) throw error;
        
        button.querySelector('span').textContent = newLikes;
        
        anime({
            targets: button,
            scale: [1, 1.2, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
        });
        
        showNotification('Thank you for your support! 💜');
    } catch (error) {
        console.error('Error liking media:', error);
        showNotification('Error. Please try again.', 'error');
    }
}

// Add comment
async function addComment(contentId, contentType) {
    const input = document.getElementById(`comment-input-${contentId}`);
    const commentText = input.value.trim();
    
    if (!commentText) {
        showNotification('Please enter a comment.', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('comments')
            .insert([{
                content_id: contentId,
                content_type: contentType,
                author_name: 'Anonymous',
                comment_text: commentText
            }]);
        
        if (error) throw error;
        
        // Update comments count
        await supabase
            .from(contentType === 'story' ? 'stories' : 'photos')
            .update({ comments_count: supabase.raw('comments_count + 1') })
            .eq('id', contentId);
        
        input.value = '';
        showNotification('Comment added!');
        
        // Reload comments
        loadComments(contentId, contentType);
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Error adding comment. Please try again.', 'error');
    }
}

// Load comments for content
async function loadComments(contentId, contentType) {
    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('content_id', contentId)
            .eq('content_type', contentType)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const container = document.getElementById(`comments-${contentId}`);
        if (!container) return;
        
        container.innerHTML = comments.map(comment => `
            <div class="flex items-start space-x-3">
                <img src="${comment.author_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author_name)}" 
                     alt="${comment.author_name}" class="w-8 h-8 rounded-full object-cover">
                <div class="flex-1">
                    <div class="bg-gentle-rose rounded-lg p-3">
                        <p class="text-sm font-medium text-warm-grey">${comment.author_name}</p>
                        <p class="text-sm text-soft-grey">${comment.comment_text}</p>
                    </div>
                    <p class="text-xs text-soft-grey mt-1">${formatTimeAgo(comment.created_at)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Submit new story
async function submitStory(event) {
    event.preventDefault();
    
    const authorName = document.getElementById('author-name').value;
    const title = document.getElementById('story-title').value;
    const category = document.getElementById('story-category').value;
    const content = document.getElementById('story-content').value;
    
    try {
        const { error } = await supabase
            .from('stories')
            .insert([{
                author_name: authorName,
                title: title,
                category: category,
                content: content
            }]);
        
        if (error) throw error;
        
        showNotification('Story shared successfully! 🎉');
        closeStoryModal();
        event.target.reset();
        
        // Reload stories
        await loadDataFromSupabase();
    } catch (error) {
        console.error('Error submitting story:', error);
        showNotification('Error submitting story. Please try again.', 'error');
    }
}

// Upload photo
async function uploadPhotos(event) {
    event.preventDefault();
    
    const title = document.getElementById('photo-title').value;
    const description = document.getElementById('photo-description').value;
    const category = document.getElementById('photo-category').value;
    const fileInput = document.getElementById('photo-input');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Please select a photo.', 'error');
        return;
    }
    
    try {
        showNotification('Uploading photo...');
        
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `photos/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('memories')
            .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('memories')
            .getPublicUrl(filePath);
        
        // Insert photo record
        const { error: insertError } = await supabase
            .from('photos')
            .insert([{
                author_name: 'Anonymous',
                title: title,
                description: description,
                category: category,
                image_url: publicUrl
            }]);
        
        if (insertError) throw insertError;
        
        showNotification('Photo uploaded successfully! 📸');
        closeUploadModal();
        event.target.reset();
        
        // Reload photos
        await loadDataFromSupabase();
    } catch (error) {
        console.error('Error uploading photo:', error);
        showNotification('Error uploading photo. Please try again.', 'error');
    }
}

// Upload media
async function uploadMedia() {
    const title = document.getElementById('media-title').value;
    const description = document.getElementById('media-description').value;
    const author = document.getElementById('media-author').value;
    const videoUrl = document.getElementById('video-url')?.value;
    
    if (!title || !videoUrl) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('media')
            .insert([{
                author_name: author || 'Anonymous',
                title: title,
                description: description,
                media_type: 'video',
                media_url: videoUrl
            }]);
        
        if (error) throw error;
        
        showNotification('Media shared successfully! 🎬');
        closeUploadModal();
        
        // Clear form
        document.getElementById('media-title').value = '';
        document.getElementById('media-description').value = '';
        document.getElementById('media-author').value = '';
        if (document.getElementById('video-url')) {
            document.getElementById('video-url').value = '';
        }
        
        // Reload media
        await loadDataFromSupabase();
    } catch (error) {
        console.error('Error uploading media:', error);
        showNotification('Error uploading media. Please try again.', 'error');
    }
}

// Format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'error' ? 'bg-red-500' : 'bg-lavender-dream'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuart'
    });
    
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 400,
            easing: 'easeInQuart',
            complete: () => document.body.removeChild(notification)
        });
    }, 3000);
}

// Get current page
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('stories')) return 'stories';
    if (path.includes('gallery')) return 'gallery';
    if (path.includes('media')) return 'media';
    return 'index';
}

// Placeholder functions for existing functionality
function initializeHeroAnimations() {
    // Hero animation logic
}

function initializeCarousels() {
    // Carousel initialization
}

function initializeScrollAnimations() {
    // Scroll animation logic
}

function initializeParticleEffect() {
    // Particle effect logic
}

function initializeFilters() {
    // Filter logic
}

function initializeModals() {
    // Modal initialization
}

function initializeUploadHandlers() {
    // Upload handlers
}

function initializeHomePage() {
    // Home page specific logic
}

function initializeStoriesPage() {
    // Stories page specific logic
}

function initializeGalleryPage() {
    // Gallery page specific logic
}

function initializeMediaPage() {
    // Media page specific logic
}

function renderRecentMemories() {
    // Render recent memories on home page
}

function openLightbox(index) {
    currentLightboxIndex = index;
    // Lightbox logic
}

function closeLightbox() {
    // Close lightbox
}

function nextPhoto() {
    // Next photo logic
}

function previousPhoto() {
    // Previous photo logic
}

function toggleComments(element) {
    // Toggle comments logic
}

function toggleStoryExpansion(element) {
    // Toggle story expansion
}

function toggleAudioPlayback(button) {
    // Toggle audio playback
}

function playVideo() {
    // Play video logic
}

function toggleRecording() {
    // Toggle recording logic
}

function openStoryModal() {
    // Open story modal
}

function closeStoryModal() {
    // Close story modal
}

function openUploadModal() {
    // Open upload modal
}

function closeUploadModal() {
    // Close upload modal
}

// Export functions for global access
window.scrollToSection = () => {};
window.openStoryModal = openStoryModal;
window.closeStoryModal = closeStoryModal;
window.openUploadModal = openUploadModal;
window.closeUploadModal = closeUploadModal;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextPhoto = nextPhoto;
window.previousPhoto = previousPhoto;
window.toggleLikeStory = toggleLikeStory;
window.toggleLikePhoto = toggleLikePhoto;
window.toggleLikeMedia = toggleLikeMedia;
window.toggleComments = toggleComments;
window.toggleStoryExpansion = toggleStoryExpansion;
window.toggleAudioPlayback = toggleAudioPlayback;
window.playVideo = playVideo;
window.toggleRecording = toggleRecording;
window.submitStory = submitStory;
window.uploadPhotos = uploadPhotos;
window.uploadMedia = uploadMedia;
window.addComment = addComment;
