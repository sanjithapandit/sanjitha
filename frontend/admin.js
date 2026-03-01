const API_URL = 'https://sanju-portfolio-backend.onrender.com';

// State for editing
let editingMode = {};

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const section = btn.dataset.section;
        
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show active section
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
        
        // Load section data
        if (section === 'about') loadAbout();
        else if (section === 'stats') loadStats();
        else if (section === 'skills') loadSkills();
        else if (section === 'achievements') loadAchievements();
        else if (section === 'contact-info') loadContactInfo();
        else if (section === 'messages') loadMessages();
    });
});

// ===== ABOUT SECTION =====
async function loadAbout() {
    try {
        const response = await fetch(`${API_URL}/api/about`);
        const about = await response.json();
        
        if (about && about._id) {
            document.getElementById('aboutTitle').value = about.title || '';
            document.getElementById('aboutDescription').value = about.description || '';
        }
    } catch (error) {
        console.error('Error loading about:', error);
    }
}

document.getElementById('aboutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('aboutTitle').value;
    const description = document.getElementById('aboutDescription').value;
    
    try {
        const response = await fetch(`${API_URL}/api/about`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        
        if (response.ok) {
            showAlert('About section updated successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving about:', error);
        showAlert('Error saving about section', 'error');
    }
});

// ===== STATS SECTION =====
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/stats`);
        const stats = await response.json();
        
        const container = document.getElementById('statsContainer');
        container.innerHTML = '';
        
        if (stats.length === 0) {
            container.innerHTML = '<p>No stats yet</p>';
            return;
        }
        
        stats.forEach(stat => {
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-content">
                    <strong>${stat.number}</strong> ${stat.label}
                </div>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editStat('${stat._id}', '${stat.number}', '${stat.label}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteStat('${stat._id}')">Delete</button>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function editStat(id, number, label) {
    document.getElementById('statNumber').value = number;
    document.getElementById('statLabel').value = label;
    editingMode.stat = id;
    
    const btn = document.querySelector('#statForm button[type="submit"]');
    btn.textContent = 'Update Stat';
    btn.classList.add('btn-warning');
}

document.getElementById('statForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const number = document.getElementById('statNumber').value;
    const label = document.getElementById('statLabel').value;
    const isEditing = editingMode.stat ? true : false;
    
    try {
        const url = editingMode.stat 
            ? `${API_URL}/api/stats/${editingMode.stat}`
            : `${API_URL}/api/stats`;
        
        const method = editingMode.stat ? 'PUT' : 'POST';
        
        console.log(`${method} request to: ${url}`);
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, label })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            
            document.getElementById('statForm').reset();
            document.querySelector('#statForm button[type="submit"]').textContent = 'Add Stat';
            document.querySelector('#statForm button[type="submit"]').classList.remove('btn-warning');
            editingMode.stat = null;
            
            loadStats();
            showAlert(isEditing ? 'Stat updated successfully!' : 'Stat added successfully!', 'success');
        } else {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            showAlert('Error saving stat: ' + errorText, 'error');
        }
    } catch (error) {
        console.error('Error saving stat:', error);
        showAlert('Error saving stat: ' + error.message, 'error');
    }
});

async function deleteStat(id) {
    if (confirm('Are you sure?')) {
        try {
            await fetch(`${API_URL}/api/stats/${id}`, { method: 'DELETE' });
            loadStats();
            showAlert('Stat deleted!', 'success');
        } catch (error) {
            console.error('Error deleting stat:', error);
            showAlert('Error deleting stat', 'error');
        }
    }
}

// ===== SKILLS SECTION =====
async function loadSkills() {
    try {
        const response = await fetch(`${API_URL}/api/skills`);
        const skills = await response.json();
        
        const container = document.getElementById('skillsContainer');
        container.innerHTML = '';
        
        if (skills.length === 0) {
            container.innerHTML = '<p>No skills yet</p>';
            return;
        }
        
        skills.forEach(skill => {
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-content">
                    <strong>${skill.category}</strong>
                    <p>${skill.items.join(', ')}</p>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editSkill('${skill._id}', '${skill.category}', '${skill.items.join(', ')}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSkill('${skill._id}')">Delete</button>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

function editSkill(id, category, items) {
    document.getElementById('skillCategory').value = category;
    document.getElementById('skillItems').value = items;
    editingMode.skill = id;
    
    const btn = document.querySelector('#skillForm button[type="submit"]');
    btn.textContent = 'Update Skill';
    btn.classList.add('btn-warning');
}

document.getElementById('skillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const category = document.getElementById('skillCategory').value;
    const items = document.getElementById('skillItems').value.split(',').map(item => item.trim());
    const isEditing = editingMode.skill ? true : false;
    
    try {
        const url = editingMode.skill
            ? `${API_URL}/api/skills/${editingMode.skill}`
            : `${API_URL}/api/skills`;
        
        const method = editingMode.skill ? 'PUT' : 'POST';
        
        console.log(`${method} request to: ${url}`);
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, items })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            
            document.getElementById('skillForm').reset();
            document.querySelector('#skillForm button[type="submit"]').textContent = 'Add Skill';
            document.querySelector('#skillForm button[type="submit"]').classList.remove('btn-warning');
            editingMode.skill = null;
            
            loadSkills();
            showAlert(isEditing ? 'Skill updated successfully!' : 'Skill added successfully!', 'success');
        } else {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            showAlert('Error saving skill: ' + errorText, 'error');
        }
    } catch (error) {
        console.error('Error saving skill:', error);
        showAlert('Error saving skill: ' + error.message, 'error');
    }
});

async function deleteSkill(id) {
    if (confirm('Are you sure?')) {
        try {
            await fetch(`${API_URL}/api/skills/${id}`, { method: 'DELETE' });
            loadSkills();
            showAlert('Skill deleted!', 'success');
        } catch (error) {
            console.error('Error deleting skill:', error);
            showAlert('Error deleting skill', 'error');
        }
    }
}

// ===== ACHIEVEMENTS SECTION =====
async function loadAchievements() {
    try {
        const response = await fetch(`${API_URL}/api/achievements`);
        const achievements = await response.json();
        
        const container = document.getElementById('achievementsContainer');
        container.innerHTML = '';
        
        if (achievements.length === 0) {
            container.innerHTML = '<p>No achievements yet</p>';
            return;
        }
        
        achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-content">
                    <span class="icon">${achievement.icon}</span>
                    <div>
                        <strong>${achievement.title}</strong>
                        <p>${achievement.description}</p>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editAchievement('${achievement._id}', '${achievement.icon}', '${achievement.title}', '${achievement.description.replace(/'/g, "\\'")}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAchievement('${achievement._id}')">Delete</button>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
}

function editAchievement(id, icon, title, description) {
    document.getElementById('achievementIcon').value = icon;
    document.getElementById('achievementTitle').value = title;
    document.getElementById('achievementDescription').value = description;
    editingMode.achievement = id;
    
    const btn = document.querySelector('#achievementForm button[type="submit"]');
    btn.textContent = 'Update Achievement';
    btn.classList.add('btn-warning');
}

document.getElementById('achievementForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const icon = document.getElementById('achievementIcon').value;
    const title = document.getElementById('achievementTitle').value;
    const description = document.getElementById('achievementDescription').value;
    const isEditing = editingMode.achievement ? true : false;
    
    try {
        const url = editingMode.achievement
            ? `${API_URL}/api/achievements/${editingMode.achievement}`
            : `${API_URL}/api/achievements`;
        
        const method = editingMode.achievement ? 'PUT' : 'POST';
        
        console.log(`${method} request to: ${url}`);
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ icon, title, description })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            
            document.getElementById('achievementForm').reset();
            document.querySelector('#achievementForm button[type="submit"]').textContent = 'Add Achievement';
            document.querySelector('#achievementForm button[type="submit"]').classList.remove('btn-warning');
            editingMode.achievement = null;
            
            loadAchievements();
            showAlert(isEditing ? 'Achievement updated successfully!' : 'Achievement added successfully!', 'success');
        } else {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            showAlert('Error saving achievement: ' + errorText, 'error');
        }
    } catch (error) {
        console.error('Error saving achievement:', error);
        showAlert('Error saving achievement: ' + error.message, 'error');
    }
});

async function deleteAchievement(id) {
    if (confirm('Are you sure?')) {
        try {
            await fetch(`${API_URL}/api/achievements/${id}`, { method: 'DELETE' });
            loadAchievements();
            showAlert('Achievement deleted!', 'success');
        } catch (error) {
            console.error('Error deleting achievement:', error);
            showAlert('Error deleting achievement', 'error');
        }
    }
}

// ===== CONTACT INFO SECTION =====
async function loadContactInfo() {
    try {
        const response = await fetch(`${API_URL}/api/contact-info`);
        const contactInfo = await response.json();
        
        const container = document.getElementById('contactInfoContainer');
        container.innerHTML = '';
        
        if (contactInfo.length === 0) {
            container.innerHTML = '<p>No contact info yet</p>';
            return;
        }
        
        contactInfo.forEach(info => {
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-content">
                    <strong>${info.type}</strong>
                    <p>${info.value}</p>
                    ${info.link ? `<small>${info.link}</small>` : ''}
                </div>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editContactInfo('${info._id}', '${info.type}', '${info.value}', '${info.link || ''}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteContactInfo('${info._id}')">Delete</button>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading contact info:', error);
    }
}

function editContactInfo(id, type, value, link) {
    document.getElementById('infoType').value = type;
    document.getElementById('infoValue').value = value;
    document.getElementById('infoLink').value = link;
    editingMode.contactInfo = id;
    
    const btn = document.querySelector('#contactInfoForm button[type="submit"]');
    btn.textContent = 'Update Contact Info';
    btn.classList.add('btn-warning');
}

document.getElementById('contactInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const type = document.getElementById('infoType').value;
    const value = document.getElementById('infoValue').value;
    const link = document.getElementById('infoLink').value || undefined;
    const isEditing = editingMode.contactInfo ? true : false;
    
    try {
        const url = editingMode.contactInfo
            ? `${API_URL}/api/contact-info/${editingMode.contactInfo}`
            : `${API_URL}/api/contact-info`;
        
        const method = editingMode.contactInfo ? 'PUT' : 'POST';
        
        console.log(`${method} request to: ${url}`);
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, value, link })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            
            document.getElementById('contactInfoForm').reset();
            document.querySelector('#contactInfoForm button[type="submit"]').textContent = 'Add Contact Info';
            document.querySelector('#contactInfoForm button[type="submit"]').classList.remove('btn-warning');
            editingMode.contactInfo = null;
            
            loadContactInfo();
            showAlert(isEditing ? 'Contact info updated successfully!' : 'Contact info added successfully!', 'success');
        } else {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            showAlert('Error saving contact info: ' + errorText, 'error');
        }
    } catch (error) {
        console.error('Error saving contact info:', error);
        showAlert('Error saving contact info: ' + error.message, 'error');
    }
});

async function deleteContactInfo(id) {
    if (confirm('Are you sure?')) {
        try {
            await fetch(`${API_URL}/api/contact-info/${id}`, { method: 'DELETE' });
            loadContactInfo();
            showAlert('Contact info deleted!', 'success');
        } catch (error) {
            console.error('Error deleting contact info:', error);
            showAlert('Error deleting contact info', 'error');
        }
    }
}

// ===== MESSAGES SECTION =====
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/api/contacts`);
        const messages = await response.json();
        
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        if (messages.length === 0) {
            container.innerHTML = '<p>No messages yet</p>';
            return;
        }
        
        messages.forEach(message => {
            const date = new Date(message.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const item = document.createElement('div');
            item.className = 'message-card';
            item.innerHTML = `
                <div class="message-header">
                    <strong>${message.name}</strong>
                    <span class="message-date">${date}</span>
                </div>
                <p class="message-email">${message.email}</p>
                <p class="message-text">${message.message}</p>
                <button class="btn btn-danger btn-sm" onclick="deleteMessage('${message._id}')">Delete</button>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

async function deleteMessage(id) {
    if (confirm('Are you sure?')) {
        try {
            await fetch(`${API_URL}/api/contacts/${id}`, { method: 'DELETE' });
            loadMessages();
            showAlert('Message deleted!', 'success');
        } catch (error) {
            console.error('Error deleting message:', error);
            showAlert('Error deleting message', 'error');
        }
    }
}

// ===== UTILITY FUNCTIONS =====
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        alert.style.backgroundColor = '#10b981';
    } else {
        alert.style.backgroundColor = '#ef4444';
    }
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Load About section on page load
document.addEventListener('DOMContentLoaded', loadAbout);
