require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');
const Candidate = require('./models/Candidate');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected for seeding...');
};

const jobs = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA (Remote)',
    employmentType: 'Full-time',
    description: 'Build and maintain high-quality React applications. Collaborate with designers and backend engineers to deliver exceptional user experiences.',
    status: 'Open',
  },
  {
    title: 'Backend Engineer (Node.js)',
    department: 'Engineering',
    location: 'New York, NY (Hybrid)',
    employmentType: 'Full-time',
    description: 'Design and implement scalable RESTful APIs and microservices. Work with MongoDB, Redis, and cloud infrastructure.',
    status: 'Open',
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'Austin, TX',
    employmentType: 'Full-time',
    description: 'Define product vision and roadmap. Work cross-functionally with engineering, design, and business stakeholders.',
    status: 'Open',
  },
  {
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Remote',
    employmentType: 'Full-time',
    description: 'Create intuitive, accessible, and beautiful user interfaces. Conduct user research and usability testing.',
    status: 'Open',
  },
  {
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Seattle, WA (Hybrid)',
    employmentType: 'Full-time',
    description: 'Manage CI/CD pipelines, cloud infrastructure on AWS, containerization with Docker and Kubernetes.',
    status: 'Open',
  },
  {
    title: 'Data Analyst Intern',
    department: 'Analytics',
    location: 'Chicago, IL',
    employmentType: 'Internship',
    description: 'Analyze product and business data to surface insights. Build dashboards and reports using SQL and Python.',
    status: 'Open',
  },
  {
    title: 'Mobile Developer (React Native)',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'Contract',
    description: 'Develop cross-platform mobile apps for iOS and Android using React Native. Integrate with backend APIs.',
    status: 'Closed',
  },
];

const buildCandidates = (jobMap) => [
  {
    name: 'Alice Morgan',
    email: 'alice.morgan@gmail.com',
    phone: '+1-415-555-0101',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
    experience: 5,
    job: jobMap['Senior Frontend Engineer'],
    stage: 'Interview',
    appliedAt: new Date('2026-09-10'),
  },
  {
    name: 'Brian Okafor',
    email: 'brian.okafor@gmail.com',
    phone: '+1-212-555-0182',
    skills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
    experience: 4,
    job: jobMap['Backend Engineer (Node.js)'],
    stage: 'Offer',
    appliedAt: new Date('2026-09-05'),
  },
  {
    name: 'Carmen Reyes',
    email: 'carmen.reyes@gmail.com',
    phone: '+1-512-555-0223',
    skills: ['Product Strategy', 'Agile', 'JIRA', 'Data Analysis'],
    experience: 7,
    job: jobMap['Product Manager'],
    stage: 'Hired',
    appliedAt: new Date('2026-08-20'),
  },
  {
    name: 'David Chen',
    email: 'david.chen@gmail.com',
    phone: '+1-206-555-0314',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD'],
    experience: 6,
    job: jobMap['DevOps Engineer'],
    stage: 'Screening',
    appliedAt: new Date('2026-09-18'),
  },
  {
    name: 'Emily Zhao',
    email: 'emily.zhao@gmail.com',
    phone: '+1-415-555-0405',
    skills: ['Figma', 'User Research', 'Prototyping', 'CSS'],
    experience: 3,
    job: jobMap['UX/UI Designer'],
    stage: 'Applied',
    appliedAt: new Date('2026-09-25'),
  },
  {
    name: 'Frank Delgado',
    email: 'frank.delgado@gmail.com',
    phone: '+1-312-555-0536',
    skills: ['Python', 'SQL', 'Tableau', 'Excel'],
    experience: 1,
    job: jobMap['Data Analyst Intern'],
    stage: 'Interview',
    appliedAt: new Date('2026-09-12'),
  },
  {
    name: 'Grace Kim',
    email: 'grace.kim@gmail.com',
    phone: '+1-415-555-0627',
    skills: ['React', 'JavaScript', 'CSS', 'Webpack'],
    experience: 2,
    job: jobMap['Senior Frontend Engineer'],
    stage: 'Screening',
    appliedAt: new Date('2026-09-20'),
  },
  {
    name: 'Henry Adebayo',
    email: 'henry.adebayo@gmail.com',
    phone: '+1-212-555-0748',
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Microservices'],
    experience: 8,
    job: jobMap['Backend Engineer (Node.js)'],
    stage: 'Hired',
    appliedAt: new Date('2026-08-15'),
  },
  {
    name: 'Isabelle Laurent',
    email: 'isabelle.laurent@gmail.com',
    phone: '+1-512-555-0819',
    skills: ['Product Roadmap', 'OKRs', 'Stakeholder Management', 'SQL'],
    experience: 5,
    job: jobMap['Product Manager'],
    stage: 'Rejected',
    appliedAt: new Date('2026-08-28'),
  },
  {
    name: 'James Osei',
    email: 'james.osei@gmail.com',
    phone: '+1-206-555-0930',
    skills: ['React Native', 'iOS', 'Android', 'TypeScript'],
    experience: 4,
    job: jobMap['Mobile Developer (React Native)'],
    stage: 'Offer',
    appliedAt: new Date('2026-09-02'),
  },
  {
    name: 'Karen Nguyen',
    email: 'karen.nguyen@gmail.com',
    phone: '+1-415-555-0111',
    skills: ['Figma', 'Adobe XD', 'Illustrator', 'UX Writing'],
    experience: 4,
    job: jobMap['UX/UI Designer'],
    stage: 'Interview',
    appliedAt: new Date('2026-09-15'),
  },
  {
    name: 'Liam Patel',
    email: 'liam.patel@gmail.com',
    phone: '+1-312-555-0222',
    skills: ['Python', 'Machine Learning', 'Pandas', 'SQL'],
    experience: 2,
    job: jobMap['Data Analyst Intern'],
    stage: 'Applied',
    appliedAt: new Date('2026-09-28'),
  },
  {
    name: 'Maya Torres',
    email: 'maya.torres@gmail.com',
    phone: '+1-212-555-0333',
    skills: ['Go', 'Kubernetes', 'AWS', 'Prometheus'],
    experience: 5,
    job: jobMap['DevOps Engineer'],
    stage: 'Hired',
    appliedAt: new Date('2026-08-10'),
  },
  {
    name: 'Noah Williams',
    email: 'noah.williams@gmail.com',
    phone: '+1-512-555-0444',
    skills: ['React', 'Vue.js', 'TypeScript', 'Jest'],
    experience: 3,
    job: jobMap['Senior Frontend Engineer'],
    stage: 'Rejected',
    appliedAt: new Date('2026-09-08'),
  },
  {
    name: 'Olivia Martinez',
    email: 'olivia.martinez@gmail.com',
    phone: '+1-415-555-0555',
    skills: ['Node.js', 'GraphQL', 'MongoDB', 'AWS Lambda'],
    experience: 6,
    job: jobMap['Backend Engineer (Node.js)'],
    stage: 'Screening',
    appliedAt: new Date('2026-09-22'),
  },
  {
    name: 'Peter Nakamura',
    email: 'peter.nakamura@gmail.com',
    phone: '+1-206-555-0666',
    skills: ['Agile', 'Scrum', 'Product Analytics', 'Figma'],
    experience: 9,
    job: jobMap['Product Manager'],
    stage: 'Interview',
    appliedAt: new Date('2026-09-01'),
  },
  {
    name: 'Quinn Foster',
    email: 'quinn.foster@gmail.com',
    phone: '+1-312-555-0777',
    skills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
    experience: 3,
    job: jobMap['Mobile Developer (React Native)'],
    stage: 'Screening',
    appliedAt: new Date('2026-09-14'),
  },
];

const seed = async () => {
  try {
    await connectDB();

    // Drop collections entirely so stale unique-index conflicts can't occur
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(c => c.name);
    if (names.includes('candidates')) {
      await mongoose.connection.db.collection('candidates').drop();
    }
    if (names.includes('jobs')) {
      await mongoose.connection.db.collection('jobs').drop();
    }
    console.log('Dropped existing collections.');

    // Insert jobs
    const insertedJobs = await Job.insertMany(jobs);
    console.log(`Inserted ${insertedJobs.length} jobs.`);

    // Build job title → ObjectId map
    const jobMap = {};
    insertedJobs.forEach((j) => { jobMap[j.title] = j._id; });

    // Build and insert candidates
    const candidateData = buildCandidates(jobMap);
    const insertedCandidates = await Candidate.insertMany(candidateData);
    console.log(`Inserted ${insertedCandidates.length} candidates.`);

    console.log('\n✅  Database seeded successfully!');
    console.log(`   Jobs: ${insertedJobs.length}`);
    console.log(`   Candidates: ${insertedCandidates.length}`);
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seed();
