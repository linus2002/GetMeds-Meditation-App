// Global App Logic for Getmeds Meditation App

document.addEventListener('DOMContentLoaded', () => {
    // Navigation interaction
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Circular Progress Animation
    window.animateProgress = () => {
        const circles = document.querySelectorAll('.circular-progress');
        circles.forEach(circle => {
            const target = circle.getAttribute('data-percent');
            let current = 0;
            const step = () => {
                if (current < target) {
                    current++;
                    circle.style.setProperty('--percent', current);
                    requestAnimationFrame(step);
                }
            };
            step();
        });
    };

    // Status bar time update
    const updateTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = `${hours}:${minutes}`;
        }
    };

    setInterval(updateTime, 1000);
    updateTime();

    // Horizontal scroll mouse wheel support
    const scrolls = document.querySelectorAll('.practices-scroll, .notes-scroll');
    scrolls.forEach(el => {
        el.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            el.scrollLeft += evt.deltaY;
        });
    });

    // Color indicators for status bar
    const updateStatusBar = (forceLight) => {
        const bar = document.querySelector('.status-bar');
        if (bar) {
            const isDarkMode = document.body.classList.contains('dark-theme');
            let color = isDarkMode ? 'var(--white)' : (forceLight ? 'var(--white)' : 'var(--text-main)');
            bar.style.setProperty('--status-color', color);
        }
    };

    window.nextOnboarding = (index) => {
        const screens = document.querySelectorAll('.onboarding-screen');
        screens.forEach(s => s.classList.remove('active'));
        if (screens[index]) {
            screens[index].classList.add('active');
        }
        updateStatusBar(false);
    };

    // Initialize per page dynamically
    const page = document.body.getAttribute('data-page');
    if (page === 'onboarding') {
        updateStatusBar(false);
    } else if (page === 'login' || page === 'signup') {
        updateStatusBar(true);
    } else if (page === 'home') {
        setTimeout(window.animateProgress, 300);
        initTypingGreeting();
    }

    // Themes & Local Storage load
    if (localStorage.getItem('darkMode') === 'enabled' && page !== 'login' && page !== 'onboarding') {
        document.body.classList.add('dark-theme');
        updateStatusBar(true);
    }

    // Update Profile UI
    loadProfileData();

    // Global Search database items logic
    initSearch();

    // Synchronize Likes across UI
    syncLikesUI();

    // Profile page specifics
    if (page === 'profile' || document.getElementById('likes-count-badge')) {
        updateLikedCount();
    }
});

// Ensure data reloads if coming back via browser back button (BFCache)
window.addEventListener('pageshow', (event) => {
    if (event.persisted || window.performance && window.performance.navigation.type === 2) {
        loadProfileData();
    }
});

function initTypingGreeting() {
    const el = document.getElementById('typing-greeting');
    if (!el) return;
    const profileData = JSON.parse(localStorage.getItem('meditationUserProfile'));
    const firstName = profileData && profileData.firstName ? profileData.firstName : 'Elena';
    const text = `Hello, ${firstName}!`;
    
    el.innerHTML = ''; // Clear it first
    let i = 0;
    const speed = 100;
    function type() {
        if (i < text.length) {
            el.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            const cursor = document.querySelector('.typing-cursor');
            if (cursor) cursor.style.animation = 'blink 1s step-end infinite';
        }
    }
    type();
}

// Profile Management Logic
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('edit-profile-preview');
            if (preview) preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function saveProfileChanges() {
    const firstName = document.getElementById('edit-first-name')?.value || 'Elena';
    const lastName = document.getElementById('edit-last-name')?.value || 'Rodriguez';
    const email = document.getElementById('edit-email')?.value || 'elena.r@example.com';
    const avatar = document.getElementById('edit-profile-preview')?.src;

    const profile = { firstName, lastName, email, avatar };
    localStorage.setItem('meditationUserProfile', JSON.stringify(profile));
    
    alert('Changes saved successfully!');
    window.location.href = 'profile.html';
}

function loadProfileData() {
    const saved = localStorage.getItem('meditationUserProfile');
    if (saved) {
        const { firstName, lastName, email } = JSON.parse(saved);
        const cardTitle = document.querySelector('.user-card-details h2');
        if (cardTitle) cardTitle.textContent = `${firstName} ${lastName}`;
        const cardEmail = document.querySelector('.user-card-details p');
        if (cardEmail) cardEmail.textContent = email;
    }
    
    // Load Avatar Sprite globally
    const avatarIndex = parseInt(localStorage.getItem('selectedAvatarIndex')) || 0;
    const offsets = [0, 25, 50, 75, 100];
    const col = avatarIndex % 5;
    const row = Math.floor(avatarIndex / 5);
    const xPos = offsets[col];
    const yPos = offsets[row];

    document.querySelectorAll('.small-avatar, .profile-card-img, #edit-profile-preview').forEach(el => {
        const isImg = el.tagName === 'IMG';
        
        let container = el;
        if (isImg) {
            container = document.createElement('div');
            container.className = el.className;
            container.id = el.id;
            
            // Preserve inline styles
            container.style.cssText = el.style.cssText;
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            container.style.overflow = 'hidden';
            container.style.backgroundColor = 'var(--bg-light)';
            if(el.onclick) container.onclick = el.onclick;
            
            el.parentNode.replaceChild(container, el);
        }
        
        container.style.backgroundImage = "url('assets/avatars_new.png')";
        container.style.backgroundSize = "500% auto";
        container.style.backgroundRepeat = "no-repeat";
        container.style.backgroundPosition = `${xPos}% ${yPos}%`;
    });
}

function toggleDarkMode(element) {
    const isActive = document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkMode', isActive ? 'enabled' : 'disabled');
    const bar = document.querySelector('.status-bar');
    if (bar) bar.style.setProperty('--status-color', isActive ? 'var(--white)' : 'var(--text-main)');
}

// Like Management Logic
function toggleLike(id, title, img, dur, cat, element) {
    let likes = JSON.parse(localStorage.getItem('liked_items')) || [];
    const index = likes.findIndex(item => item.id === id);
    
    if (index === -1) {
        // Add Like
        likes.push({ id, title, img, dur, cat });
        if (element) {
            element.classList.replace('far', 'fas');
            element.style.color = '#F43F5E';
        }
    } else {
        // Remove Like
        likes.splice(index, 1);
        if (element) {
            element.classList.replace('fas', 'far');
            element.style.color = '#94A3B8';
        }
    }
    localStorage.setItem('liked_items', JSON.stringify(likes));
    updateLikedCount();
}

function updateLikedCount() {
    const likes = JSON.parse(localStorage.getItem('liked_items')) || [];
    const countEl = document.getElementById('likes-count-badge');
    if (countEl) countEl.textContent = `${likes.length} Items`;
}

function syncLikesUI() {
    const likes = JSON.parse(localStorage.getItem('liked_items')) || [];
    const likeButtons = document.querySelectorAll('[data-like-id]');
    likeButtons.forEach(btn => {
        const id = btn.getAttribute('data-like-id');
        const icon = btn.querySelector('i');
        if (likes.some(item => item.id === id)) {
            if (icon) {
                icon.classList.replace('far', 'fas');
                icon.style.color = '#F43F5E';
            }
        } else {
            if (icon) {
                icon.classList.replace('fas', 'far');
                icon.style.color = '#94A3B8';
            }
        }
    });
}

// Global Search Logic
const searchContent = [
    { id: 'b1', title: 'Basics 1: Mindfulness', cat: 'Course', dur: '10m', img: 'assets/breathing_hero.png' },
    { id: 'b2', title: 'Basics 2: Focus', cat: 'Course', dur: '12m', img: 'assets/relaxation_hero.png' },
    { id: 'dr', title: 'Deep Release', cat: 'Calm', dur: '5m', img: 'assets/illus2.jpg' },
    { id: 'fe', title: 'Forest Echoes', cat: 'Soundscape', dur: '∞', img: 'assets/nature_sounds_hero.png' },
    { id: 'tr', title: 'Thunder Ridge', cat: 'Soundscape', dur: '∞', img: 'assets/illus1.jpg' },
    { id: 'ow', title: 'The Ocean Whisper', cat: 'Sleep Story', dur: '45m', img: 'assets/bedtime_stories_hero.png' }
];

function initSearch() {
    const searchInputs = document.querySelectorAll('.input-group input');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const targetId = input.id || 'default-search';
            let resultsContainer = document.getElementById('global-search-results-' + targetId);
            
            if (!resultsContainer) {
                resultsContainer = document.createElement('div');
                resultsContainer.id = 'global-search-results-' + targetId;
                resultsContainer.className = 'search-results-overlay';
                const inputGroup = input.parentElement;
                inputGroup.appendChild(resultsContainer);
            }

            if (query.length < 2) {
                resultsContainer.style.display = 'none';
                return;
            }

            const results = searchContent.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.cat.toLowerCase().includes(query)
            );

            renderResults(results, resultsContainer);
        });
    });
}

function renderResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px;">No results found</p>';
    } else {
        container.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="window.location.href='audio-player.html?title=${encodeURIComponent(item.title)}&type=${item.cat}'">
                <img src="${item.img}">
                <div>
                    <p class="search-res-title">${item.title}</p>
                    <p class="search-res-meta">${item.cat} • ${item.dur}</p>
                </div>
            </div>
        `).join('');
    }
    container.style.display = 'block';

    const closeListener = (e) => {
        if (!container.contains(e.target) && !e.target.closest('.input-group')) {
            container.style.display = 'none';
            document.removeEventListener('click', closeListener);
        }
    };
    document.addEventListener('click', closeListener);
}
