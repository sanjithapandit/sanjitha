// ===========================
// Mobile Menu Toggle
// ===========================

const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link');

// API URL
const API_URL = 'http://localhost:5000';

// ===== OFFLINE/ONLINE STATUS MANAGER =====
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
    isOnline = true;
    console.log('🟢 Back online! Syncing with database...');
    showStatusNotification('Back online! Updates synced with database.', 'success');
    // Reload data from server
    reloadAllSections();
});

window.addEventListener('offline', () => {
    isOnline = false;
    console.log('🔴 Offline! Using cached data...');
    showStatusNotification('You are offline. Using cached data from last sync.', 'warning');
});

function showStatusNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `status-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function reloadAllSections() {
    loadAboutSection();
    loadSkillsSection();
    loadAchievementsSection();
    loadContactInfoSection();
    loadAllContacts();
}

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    navList.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ===========================
// Smooth Scrolling for Navigation Links
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===========================
// Active Navigation Link Highlighting
// ===========================

window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ===========================
// Contact Form Handling
// ===========================

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validate form
    if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Send form submission to backend
    const submitButton = this.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    // API call to backend
    fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Message sent successfully:', data);
        showNotification('Message sent successfully! I will get back to you soon.', 'success');
        contactForm.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        // Reload contacts list after successful submission
        setTimeout(() => {
            loadAllContacts();
        }, 1000);
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to send message. Please try again.', 'error');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
});

// ===========================
// Notification System
// ===========================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;

    // Set background color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#3b82f6';
        notification.style.color = 'white';
    }

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ===========================
// Scroll Animation for Elements
// ===========================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe skill cards and achievement cards
document.querySelectorAll('.skill-card, .achievement-card, .stat').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// ===========================
// Add CSS animations to document
// ===========================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .nav-link.active {
        color: #2563eb;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// ===========================
// Scroll to Top Button
// ===========================

const scrollTopButton = document.createElement('button');
scrollTopButton.innerHTML = '↑';
scrollTopButton.className = 'scroll-to-top';
scrollTopButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #2563eb;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 24px;
    display: none;
    z-index: 999;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

document.body.appendChild(scrollTopButton);

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopButton.style.display = 'flex';
        scrollTopButton.style.alignItems = 'center';
        scrollTopButton.style.justifyContent = 'center';
    } else {
        scrollTopButton.style.display = 'none';
    }
});

// Scroll to top on button click
scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Hover effect for scroll to top button
scrollTopButton.addEventListener('mouseover', () => {
    scrollTopButton.style.backgroundColor = '#1e40af';
    scrollTopButton.style.transform = 'scale(1.1)';
});

scrollTopButton.addEventListener('mouseout', () => {
    scrollTopButton.style.backgroundColor = '#2563eb';
    scrollTopButton.style.transform = 'scale(1)';
});

// ===========================
// Page Load Animation
// ===========================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===========================
// Hamburger Menu Animation
// ===========================

const style2 = document.createElement('style');
style2.textContent = `
    .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(10px, 10px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -7px);
    }
`;
document.head.appendChild(style2);

// ===========================
// Utility Functions
// ===========================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===========================
// Fetch and Display All Contacts
// ===========================

async function loadAllContacts() {
    try {
        const response = await fetch(`${API_URL}/api/contacts`);
        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }
        const contacts = await response.json();
        displayContacts(contacts);
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

function displayContacts(contacts) {
    const contactsContainer = document.getElementById('contactsList');
    if (!contactsContainer) return;

    if (contacts.length === 0) {
        contactsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">No messages yet.</p>';
        return;
    }

    contactsContainer.innerHTML = '';
    
    contacts.forEach(contact => {
        const contactCard = document.createElement('div');
        contactCard.className = 'contact-card';
        contactCard.style.cssText = `
            background: white;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #2563eb;
        `;
        
        const date = new Date(contact.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        contactCard.innerHTML = `
            <div style="margin-bottom: 10px;">
                <h4 style="margin: 0 0 5px 0; color: #1f2937;">${contact.name}</h4>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${contact.email}</p>
                <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">${date}</p>
            </div>
            <p style="margin: 10px 0 0 0; color: #374151; line-height: 1.6;">${contact.message}</p>
        `;
        
        contactsContainer.appendChild(contactCard);
    });
}

// ===========================
// Fetch and Display About Section
// ===========================

async function loadAboutSection() {
    try {
        const [aboutRes, statsRes] = await Promise.all([
            fetch(`${API_URL}/api/about`),
            fetch(`${API_URL}/api/stats`)
        ]);

        const about = await aboutRes.json();
        const stats = await statsRes.json();

        displayAboutSection(about, stats);
    } catch (error) {
        console.error('Error loading about section:', error);
    }
}

function displayAboutSection(about, stats) {
    const aboutText = document.querySelector('.about-text');
    const aboutStats = document.querySelector('.about-stats');

    if (about && about.description) {
        aboutText.innerHTML = `<p>${about.description.split('\n').join('</p><p>')}</p>`;
    }

    if (stats && stats.length > 0) {
        aboutStats.innerHTML = '';
        stats.forEach(stat => {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat';
            statDiv.innerHTML = `
                <h3>${stat.number}</h3>
                <p>${stat.label}</p>
            `;
            aboutStats.appendChild(statDiv);
        });
    }
}

// ===========================
// Fetch and Display Skills Section
// ===========================

async function loadSkillsSection() {
    try {
        const response = await fetch(`${API_URL}/api/skills`);
        const skills = await response.json();
        displaySkillsSection(skills);
    } catch (error) {
        console.error('Error loading skills section:', error);
    }
}

function displaySkillsSection(skills) {
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) return;

    if (skills.length === 0) return;

    skillsGrid.innerHTML = '';
    skills.forEach(skill => {
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card';
        skillCard.innerHTML = `
            <h3>${skill.category}</h3>
            <ul>
                ${skill.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        skillsGrid.appendChild(skillCard);
    });
}

// ===========================
// Fetch and Display Achievements Section
// ===========================

async function loadAchievementsSection() {
    try {
        const response = await fetch(`${API_URL}/api/achievements`);
        const achievements = await response.json();
        displayAchievementsSection(achievements);
    } catch (error) {
        console.error('Error loading achievements section:', error);
    }
}

function displayAchievementsSection(achievements) {
    const achievementsGrid = document.querySelector('.achievements-grid');
    if (!achievementsGrid) return;

    if (achievements.length === 0) return;

    achievementsGrid.innerHTML = '';
    achievements.forEach(achievement => {
        const achievementCard = document.createElement('div');
        achievementCard.className = 'achievement-card';
        achievementCard.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
        `;
        achievementsGrid.appendChild(achievementCard);
    });
}

// ===========================
// Fetch and Display Contact Info Section
// ===========================

async function loadContactInfoSection() {
    try {
        const response = await fetch(`${API_URL}/api/contact-info`);
        const contactInfo = await response.json();
        displayContactInfoSection(contactInfo);
    } catch (error) {
        console.error('Error loading contact info section:', error);
    }
}

function displayContactInfoSection(contactInfo) {
    const contactInfoDiv = document.querySelector('.contact-info');
    if (!contactInfoDiv) return;

    if (contactInfo.length === 0) return;

    contactInfoDiv.innerHTML = '';
    contactInfo.forEach(info => {
        const infoItem = document.createElement('div');
        infoItem.className = 'info-item';
        
        let html = `<h4>${info.type}</h4>`;
        if (info.link) {
            html += `<p><a href="${info.link}">${info.value}</a></p>`;
        } else {
            html += `<p>${info.value}</p>`;
        }
        
        infoItem.innerHTML = html;
        contactInfoDiv.appendChild(infoItem);
    });
}

// Load all sections on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAboutSection();
    loadSkillsSection();
    loadAchievementsSection();
    loadContactInfoSection();
    loadAllContacts();
});

// Log page load time
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
});

// ===========================
// Initialize
// ===========================

console.log('Portfolio website initialized successfully!');
