require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cacheManager = require('./cacheManager');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Contact Schema and Model
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Contact = mongoose.model('Contact', contactSchema);

// About Schema and Model
const aboutSchema = new mongoose.Schema({
    title: String,
    description: String,
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const About = mongoose.model('About', aboutSchema);

// Stat Schema for About section
const statSchema = new mongoose.Schema({
    number: String,
    label: String,
});

const Stat = mongoose.model('Stat', statSchema);

// Skills Schema and Model
const skillSchema = new mongoose.Schema({
    category: String,
    items: [String],
});

const Skill = mongoose.model('Skill', skillSchema);

// Achievements Schema and Model
const achievementSchema = new mongoose.Schema({
    icon: String,
    title: String,
    description: String,
});

const Achievement = mongoose.model('Achievement', achievementSchema);

// Contact Info Schema and Model
const contactInfoSchema = new mongoose.Schema({
    type: String,
    value: String,
    link: String,
});

const ContactInfo = mongoose.model('ContactInfo', contactInfoSchema);

// Initialize Database and Cache (after models are defined)
(async () => {
    await cacheManager.initializeDB();
    
    // Create models object to pass to cache manager
    const models = { About, Stat, Skill, Achievement, ContactInfo };
    
    await cacheManager.seedDatabase(models);
    cacheManager.startPeriodicSync(300, models); // Check for updates every 5 minutes
})();

// Routes
app.get('/', (req, res) => {
    res.send('Portfolio Backend API is running with offline-first cache support');
});

// ===== ABOUT ROUTES =====
app.get('/api/about', async (req, res) => {
    try {
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        const about = await cacheManager.getNonBlocking('about', models);
        res.json(about.length > 0 ? about[0] : {});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        const stats = await cacheManager.getNonBlocking('stats', models);
        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/about', async (req, res) => {
    const { title, description } = req.body;
    try {
        let about = await About.findOne();
        if (about) {
            about.title = title;
            about.description = description;
            about.updatedAt = Date.now();
            await about.save();
        } else {
            about = new About({ title, description });
            await about.save();
        }
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json(about);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/stats', async (req, res) => {
    const { number, label } = req.body;
    try {
        const stat = new Stat({ number, label });
        await stat.save();
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json(stat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===== SKILLS ROUTES =====
app.get('/api/skills', async (req, res) => {
    try {
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        const skills = await cacheManager.getNonBlocking('skills', models);
        res.json(skills);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/skills', async (req, res) => {
    const { category, items } = req.body;
    try {
        const skill = new Skill({ category, items });
        await skill.save();
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json(skill);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===== ACHIEVEMENTS ROUTES =====
app.get('/api/achievements', async (req, res) => {
    try {
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        const achievements = await cacheManager.getNonBlocking('achievements', models);
        res.json(achievements);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/achievements', async (req, res) => {
    const { icon, title, description } = req.body;
    try {
        const achievement = new Achievement({ icon, title, description });
        await achievement.save();
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json(achievement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===== CONTACT INFO ROUTES =====
app.get('/api/contact-info', async (req, res) => {
    try {
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        const contactInfo = await cacheManager.getNonBlocking('contactInfo', models);
        res.json(contactInfo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/contact-info', async (req, res) => {
    const { type, value, link } = req.body;
    try {
        const contactInfo = new ContactInfo({ type, value, link });
        await contactInfo.save();
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json(contactInfo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===== CONTACT MESSAGES ROUTES =====

// Get all contacts
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        const newContact = new Contact({
            name,
            email,
            message,
        });

        await newContact.save();
        res.status(201).json({ msg: 'Message sent successfully', contact: newContact });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===== DELETE ROUTES =====
app.delete('/api/stats/:id', async (req, res) => {
    try {
        const stat = await Stat.findByIdAndDelete(req.params.id);
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json({ msg: 'Stat deleted', stat });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/skills/:id', async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json({ msg: 'Skill deleted', skill });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/achievements/:id', async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndDelete(req.params.id);
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json({ msg: 'Achievement deleted', achievement });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/contact-info/:id', async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findByIdAndDelete(req.params.id);
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json({ msg: 'Contact info deleted', contactInfo });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Contact deleted', contact });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===== UPDATE ROUTES =====
app.put('/api/stats/:id', async (req, res) => {
    try {
        const stat = await Stat.findByIdAndUpdate(req.params.id, req.body, { new: true });
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json(stat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/skills/:id', async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json(skill);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/achievements/:id', async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json(achievement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/contact-info/:id', async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        const models = { About, Stat, Skill, Achievement, ContactInfo };
        await cacheManager.syncCacheWithDB(models);
        res.json(contactInfo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===== CACHE STATUS ENDPOINT =====
app.get('/api/cache-status', (req, res) => {
    const cacheData = cacheManager.loadCacheFromFile();
    res.json({
        lastUpdated: cacheData.lastUpdated,
        cached: {
            aboutCount: cacheData.about.length,
            statsCount: cacheData.stats.length,
            skillsCount: cacheData.skills.length,
            achievementsCount: cacheData.achievements.length,
            contactInfoCount: cacheData.contactInfo.length,
        },
    });
});

// Start the server
app.listen(PORT, () => console.log(`\n🚀 Server running on port ${PORT}`));
