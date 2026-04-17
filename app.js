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

    // Navigation functions
    const updateStatusBar = (forceLight) => {
        const bar = document.querySelector('.status-bar');
        if (bar) {
            const isDarkMode = document.body.classList.contains('dark-theme');
            // If app is dark mode, status bar is ALWAYS white
            // If light mode, use forceLight (true for dark bg like login, false for light bg)
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
        updateStatusBar(false); // Onboarding has a white bg
    };

    // Initialize per page dynamically
    const page = document.body.getAttribute('data-page');
    if (page === 'onboarding') {
        updateStatusBar(false);
    } else if (page === 'login') {
        updateStatusBar(true);
    } else if (page === 'home') {
        setTimeout(window.animateProgress, 300);
    }

    // Remove background from illustration images dynamically
    const removeImageBackground = (imgEl) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = imgEl.naturalWidth;
        canvas.height = imgEl.naturalHeight;
        ctx.drawImage(imgEl, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Get bg color from top-left pixel
        const bgR = data[0], bgG = data[1], bgB = data[2];
        const tolerance = 45; // High tolerance for slightly varying AI backgrounds
        
        for (let i = 0; i < data.length; i += 4) {
            // If pixel is close to bg color, make transparent
            if (Math.abs(data[i] - bgR) < tolerance && 
                Math.abs(data[i+1] - bgG) < tolerance && 
                Math.abs(data[i+2] - bgB) < tolerance) {
                data[i+3] = 0; // Alpha to 0
            }
        }
        ctx.putImageData(imageData, 0, 0);
        imgEl.src = canvas.toDataURL();
    };

    document.querySelectorAll('.ob-image-wrap img.ob-img').forEach(img => {
        if (img.complete) {
            removeImageBackground(img);
        } else {
            img.addEventListener('load', () => removeImageBackground(img));
        }
    });

    // Load user profile data on all pages
    loadProfileData();
});

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
        const { firstName, lastName, email, avatar } = JSON.parse(saved);
        
        // Update all avatars (navbars and main profile card)
        document.querySelectorAll('.small-avatar, .profile-card-img').forEach(img => {
            if (avatar) img.src = avatar;
        });

        // Update profile card details
        const cardTitle = document.querySelector('.user-card-details h2');
        if (cardTitle) cardTitle.textContent = `${firstName} ${lastName}`;
        
        const cardEmail = document.querySelector('.user-card-details p');
        if (cardEmail) cardEmail.textContent = email;

        // Populate edit form if on subpage
        const editF = document.getElementById('edit-first-name');
        if (editF) {
            editF.value = firstName;
            document.getElementById('edit-last-name').value = lastName;
            document.getElementById('edit-email').value = email;
            if (avatar) document.getElementById('edit-profile-preview').src = avatar;
        }
    }
}

// Dark mode toggle functionality
function toggleDarkMode(element) {
    const isActive = document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkMode', isActive ? 'enabled' : 'disabled');
    
    // Update all theme icons in the app
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach(ic => {
        if (isActive) {
            ic.classList.remove('fas', 'fa-moon');
            ic.classList.add('far', 'fa-sun');
        } else {
            ic.classList.remove('far', 'fa-sun');
            ic.classList.add('fas', 'fa-moon');
        }
    });

    // Update all sliding toggles in the app
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(t => {
        if (isActive) t.classList.add('active');
        else t.classList.remove('active');
    });

    // Update status bar immediately
    const bar = document.querySelector('.status-bar');
    if (bar) {
        const color = isActive ? 'var(--white)' : 'var(--text-main)';
        bar.style.setProperty('--status-color', color);
    }
}

// Check dark mode on load
document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.getAttribute('data-page');
    const isLoggedOutPage = pageId === 'login' || pageId === 'onboarding';

    if (!isLoggedOutPage && localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-theme');
        
        // Ensure icons and toggles are correctly set on load
        const icons = document.querySelectorAll('.theme-icon');
        icons.forEach(ic => {
            ic.classList.remove('fas', 'fa-moon');
            ic.classList.add('far', 'fa-sun');
        });

        const toggles = document.querySelectorAll('.toggle-switch');
        toggles.forEach(t => t.classList.add('active'));
        
        // Ensure status bar starts white
        const bar = document.querySelector('.status-bar');
        if (bar) bar.style.setProperty('--status-color', 'var(--white)');
    }
});
