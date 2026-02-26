require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for seeding'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define schemas and models
const aboutSchema = new mongoose.Schema({
    title: String,
    description: String,
    updatedAt: { type: Date, default: Date.now },
});

const statSchema = new mongoose.Schema({
    number: String,
    label: String,
});

const skillSchema = new mongoose.Schema({
    category: String,
    items: [String],
});

const achievementSchema = new mongoose.Schema({
    icon: String,
    title: String,
    description: String,
});

const contactInfoSchema = new mongoose.Schema({
    type: String,
    value: String,
    link: String,
});

const About = mongoose.model('About', aboutSchema);
const Stat = mongoose.model('Stat', statSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const ContactInfo = mongoose.model('ContactInfo', contactInfoSchema);

async function seedDatabase() {
    try {
        // Clear existing data
        await About.deleteMany({});
        await Stat.deleteMany({});
        await Skill.deleteMany({});
        await Achievement.deleteMany({});
        await ContactInfo.deleteMany({});

        console.log('Cleared existing data...');

        // Seed About
        const about = new About({
            title: 'About Me',
            description: `Hello! I'm Sanjitha S Pandit, a passionate full-stack developer with expertise in creating beautiful, functional, and scalable web applications. I specialize in modern web technologies including React, Node.js, and MongoDB, with a focus on delivering elegant solutions to complex problems.

I'm dedicated to writing clean, maintainable code and staying updated with the latest industry trends. When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or mentoring fellow developers. I'm always eager to learn and grow in this dynamic field.`,
        });
        await about.save();
        console.log('✓ About section added');

        // Seed Stats
        const stats = [
            new Stat({ number: '25+', label: 'Projects Completed' }),
            new Stat({ number: '15+', label: 'Happy Clients' }),
            new Stat({ number: '3+', label: 'Years Experience' }),
        ];
        await Stat.insertMany(stats);
        console.log('✓ Stats added');

        // Seed Skills
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
        console.log('✓ Skills added');

        // Seed Achievements
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
        console.log('✓ Achievements added');

        // Seed Contact Info
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
        console.log('✓ Contact Info added');

        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
