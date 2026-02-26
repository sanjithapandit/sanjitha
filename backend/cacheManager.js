require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'cache.json');

let dbConnected = false;

// Initialize cache from file
function loadCacheFromFile() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading cache from file:', error.message);
    }
    return {
        about: [],
        stats: [],
        skills: [],
        achievements: [],
        contactInfo: [],
        lastUpdated: null,
    };
}

// Save cache to file
function saveCacheToFile(data) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
        console.log('✓ Cache updated and saved to', CACHE_FILE);
    } catch (error) {
        console.error('Error saving cache to file:', error.message);
    }
}

// Fetch all data from MongoDB
async function fetchAllDataFromDB(models) {
    try {
        if (!models) {
            console.log('⚠️  Models not provided, skipping DB fetch');
            return null;
        }
        
        const { About, Stat, Skill, Achievement, ContactInfo } = models;
        
        const [about, stats, skills, achievements, contactInfo] = await Promise.all([
            About.find(),
            Stat.find(),
            Skill.find(),
            Achievement.find(),
            ContactInfo.find(),
        ]);

        return {
            about,
            stats,
            skills,
            achievements,
            contactInfo,
            lastUpdated: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error fetching data from DB:', error.message);
        return null;
    }
}

// Compare if data has changed
function hasDataChanged(newData, oldData) {
    if (!newData || !oldData) return true;
    
    const serialize = (data) => JSON.stringify(data);
    
    return (
        serialize(newData.about) !== serialize(oldData.about) ||
        serialize(newData.stats) !== serialize(oldData.stats) ||
        serialize(newData.skills) !== serialize(oldData.skills) ||
        serialize(newData.achievements) !== serialize(oldData.achievements) ||
        serialize(newData.contactInfo) !== serialize(oldData.contactInfo)
    );
}

// Sync data from DB to cache
async function syncCacheWithDB(models) {
    if (!dbConnected || !models) return false;

    const newData = await fetchAllDataFromDB(models);
    
    if (!newData) {
        console.log('✗ Failed to fetch from DB, using cache');
        return false;
    }

    const cachedData = loadCacheFromFile();
    
    if (hasDataChanged(newData, cachedData)) {
        console.log('✓ Data changed detected, updating cache...');
        saveCacheToFile(newData);
        return true;
    }
    
    console.log('✓ Cache is up to date');
    return false;
}

// Get specific collection with fallback to cache
async function getNonBlocking(collection, models) {
    // First try DB if connected
    if (dbConnected) {
        try {
            const { About, Stat, Skill, Achievement, ContactInfo } = models;
            const Model = {
                about: About,
                stats: Stat,
                skills: Skill,
                achievements: Achievement,
                contactInfo: ContactInfo,
            }[collection];

            if (Model) {
                const data = await Promise.race([
                    Model.find(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('DB timeout')), 5000)
                    ),
                ]);
                return data;
            }
        } catch (error) {
            console.log(`✗ DB unavailable for ${collection}, using cache`);
        }
    }

    // Fallback to cache
    const cachedData = loadCacheFromFile();
    return cachedData[collection] || [];
}

// Initialize MongoDB connection
async function initializeDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        dbConnected = true;
        console.log('✓ MongoDB connected');
        
        // Sync cache on successful connection
        await syncCacheWithDB();
        
        return true;
    } catch (error) {
        dbConnected = false;
        console.log('✗ MongoDB connection failed, using cache as fallback');
        console.log('  Error:', error.message);
        return false;
    }
}

// Start periodic sync (check every 5 minutes for updates)
let syncInterval;

function startPeriodicSync(intervalSeconds = 300, models) {
    syncInterval = setInterval(async () => {
        if (dbConnected && models) {
            console.log('📦 Checking for database updates...');
            await syncCacheWithDB(models);
        }
    }, intervalSeconds * 1000);
    
    console.log(`✓ Periodic sync started (every ${intervalSeconds}s)`);
}

function stopPeriodicSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        console.log('✗ Periodic sync stopped');
    }
}

// Seed database (one time, when needed)
async function seedDatabase(models) {
    try {
        if (!dbConnected) {
            console.log('Database not connected, skipping seed');
            return;
        }

        const { About, Stat, Skill, Achievement, ContactInfo } = models;
        
        const aboutCount = await About.countDocuments();
        
        if (aboutCount === 0) {
            console.log('🌱 Seeding database with initial data...');

            // Seed About
            const about = new About({
                title: 'About Me',
                description: `Hello! I'm Sanjitha S Pandit, a passionate full-stack developer with expertise in creating beautiful, functional, and scalable web applications. I specialize in modern web technologies including React, Node.js, and MongoDB, with a focus on delivering elegant solutions to complex problems.

I'm dedicated to writing clean, maintainable code and staying updated with the latest industry trends. When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or mentoring fellow developers. I'm always eager to learn and grow in this dynamic field.`,
            });
            await about.save();

            const stats = [
                new Stat({ number: '25+', label: 'Projects Completed' }),
                new Stat({ number: '15+', label: 'Happy Clients' }),
                new Stat({ number: '3+', label: 'Years Experience' }),
            ];
            await Stat.insertMany(stats);

            const skills = [
                new Skill({
                    category: 'Frontend Development',
                    items: ['HTML5 & CSS3', 'JavaScript', 'React.js', 'Vue.js', 'Responsive Design'],
                }),
                new Skill({
                    category: 'Backend Development',
                    items: ['Node.js', 'Express.js', 'Python', 'MongoDB', 'PostgreSQL'],
                }),
                new Skill({
                    category: 'Tools & Technologies',
                    items: ['Git & GitHub', 'Docker', 'AWS', 'REST APIs', 'GraphQL'],
                }),
                new Skill({
                    category: 'Soft Skills',
                    items: ['Problem Solving', 'Team Collaboration', 'Project Management', 'Communication', 'Leadership'],
                }),
            ];
            await Skill.insertMany(skills);

            const achievements = [
                new Achievement({
                    icon: '🏆',
                    title: 'Best Developer Award',
                    description: 'Recognized for outstanding contributions to web development in 2023',
                }),
                new Achievement({
                    icon: '⭐',
                    title: 'Open Source Contributor',
                    description: 'Active contributor to multiple popular open-source projects',
                }),
                new Achievement({
                    icon: '📚',
                    title: 'Technical Speaker',
                    description: 'Delivered talks at 10+ tech conferences and meetups',
                }),
                new Achievement({
                    icon: '🎓',
                    title: 'Certifications',
                    description: 'AWS Certified Solutions Architect and Google Cloud Professional',
                }),
            ];
            await Achievement.insertMany(achievements);

            const contactInfo = [
                new ContactInfo({
                    type: 'Email',
                    value: 'sanjitha@example.com',
                    link: 'mailto:sanjitha@example.com',
                }),
                new ContactInfo({
                    type: 'Phone',
                    value: '+91 (999) 999-9999',
                    link: 'tel:+919999999999',
                }),
                new ContactInfo({
                    type: 'Location',
                    value: 'Bangalore, India',
                }),
            ];
            await ContactInfo.insertMany(contactInfo);

            // Sync to cache after seeding
            await syncCacheWithDB(models);
            console.log('✅ Database seeded and cache updated!');
        } else {
            console.log('Database already has data, skipping seed...');
            await syncCacheWithDB(models);
        }
    } catch (error) {
        console.error('Error during seeding:', error.message);
    }
}

// Export functions
module.exports = {
    initializeDB,
    seedDatabase,
    syncCacheWithDB,
    getNonBlocking,
    loadCacheFromFile,
    saveCacheToFile,
    startPeriodicSync,
    stopPeriodicSync,
    fetchAllDataFromDB,
    CACHE_FILE,
};
