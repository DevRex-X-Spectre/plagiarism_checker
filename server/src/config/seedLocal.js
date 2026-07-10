// Seed local-data.json with sample data for testing.
// Usage: node src/config/seedLocal.js
//
// Login credentials after seeding:
//   admin@gmail.com       /  Admin1234     (admin)
//   student@faculty.edu.ng /  password123  (student)

import bcrypt from 'bcrypt';
import { localStore } from './localStore.js';

async function seed() {
  console.log('🌱 Seeding local store...');

  // Reset
  await localStore._reset();

  const adminPasswordHash = await bcrypt.hash('Admin1234', 10);
  const studentPasswordHash = await bcrypt.hash('password123', 10);
  // Users
  await localStore.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, is_active, created_at`,
    ['admin@gmail.com', adminPasswordHash, 'Faculty Admin', 'admin']
  );
  const data = localStore._getData();

  await localStore.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, is_active, created_at`,
    ['student@faculty.edu.ng', studentPasswordHash, 'Ada Lovelace', 'student']
  );

  const studentId = data.users.find(u => u.email === 'student@faculty.edu.ng').id;

  // Departments
  const deptData = [
    { name: 'Software Engineering', code: 'SWE' },
    { name: 'Computer Science', code: 'CS' },
    { name: 'Information System', code: 'IS' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Cyber Security', code: 'CYB' },
  ];

  const deptIds = [];
  for (const d of deptData) {
    await localStore.query(
      'INSERT INTO departments (name, code) VALUES ($1, $2)',
      [d.name, d.code]
    );
  }
  for (const dept of data.departments) {
    deptIds.push(dept.id);
  }

  // Sample projects with realistic-looking content
  // Embeddings are random 384-dim vectors — real embeddings require the model
  // The similarity check still works (uses cosine similarity on whatever embeddings exist)
  function mockEmbedding(seed) {
    const vec = new Array(384);
    let s = seed;
    for (let i = 0; i < 384; i++) {
      s = (s * 9301 + 49297) % 233280;
      vec[i] = ((s / 233280) - 0.5) * 2;
    }
    // Normalize
    let mag = 0;
    for (const v of vec) mag += v * v;
    mag = Math.sqrt(mag);
    return vec.map(v => v / mag);
  }

  const sampleProjects = [
    {
      title: 'AI-Based Student Attendance System Using Facial Recognition',
      abstract: 'This project presents an intelligent attendance management system that uses facial recognition technology to automatically mark student attendance in classrooms. The system employs convolutional neural networks for face detection and recognition, reducing proxy attendance and administrative overhead.',
      author: 'John Adebayo',
      deptIdx: 0, // CS
      year: 2023,
      uploaderId: studentId,
      embeddingSeed: 1,
    },
    {
      title: 'Automated Attendance Tracking with Convolutional Neural Networks',
      abstract: 'An automated system for tracking student attendance using deep learning techniques. The proposed solution captures classroom images and identifies students through face recognition algorithms built on convolutional neural networks.',
      author: 'Fatima Ibrahim',
      deptIdx: 0, // CS
      year: 2024,
      uploaderId: studentId,
      embeddingSeed: 2,
    },
    {
      title: 'Fingerprint-Based Attendance Management System for Universities',
      abstract: 'A biometric attendance system leveraging fingerprint authentication. The system uses Arduino-based hardware and a web interface to record and manage student attendance across multiple courses.',
      author: 'Chinedu Okafor',
      deptIdx: 3, // EE
      year: 2023,
      uploaderId: studentId,
      embeddingSeed: 3,
    },
    {
      title: 'Library Management System with Online Catalog',
      abstract: 'A web-based library management system that allows students to search for books, reserve items, and track borrowing history. The system includes an admin interface for librarians to manage the catalog.',
      author: 'Aisha Mohammed',
      deptIdx: 0, // CS
      year: 2022,
      uploaderId: studentId,
      embeddingSeed: 4,
    },
    {
      title: 'E-Commerce Platform for Local Artisans',
      abstract: 'A web application that connects local artisans with buyers across Nigeria. Features include product listings, secure payments via Paystack, order tracking, and a review system.',
      author: 'Tunde Bakare',
      deptIdx: 0, // CS
      year: 2024,
      uploaderId: studentId,
      embeddingSeed: 5,
    },
    {
      title: 'Mathematical Modeling of Malaria Transmission Dynamics',
      abstract: 'A differential equation model simulating malaria transmission in endemic regions. The study uses SEIR compartmental models to evaluate intervention strategies and predict disease spread under various control scenarios.',
      author: 'Oluwaseun Akinola',
      deptIdx: 1, // Math
      year: 2023,
      uploaderId: studentId,
      embeddingSeed: 6,
    },
    {
      title: 'Sentiment Analysis of Nigerian Twitter Data Using NLP',
      abstract: 'Natural language processing techniques applied to analyze public sentiment on Nigerian political and social topics from Twitter data. The project compares traditional ML classifiers with transformer-based models for sentiment classification.',
      author: 'Bisi Adeleke',
      deptIdx: 0, // CS
      year: 2024,
      uploaderId: studentId,
      embeddingSeed: 7,
    },
    {
      title: 'Solar-Powered Cold Storage for Rural Pharmacies',
      abstract: 'Design and construction of a solar-powered refrigeration unit suitable for storing vaccines and medicines in rural areas without reliable grid electricity. Includes thermal modeling and prototype testing.',
      author: 'Yusuf Aliyu',
      deptIdx: 2, // Physics
      year: 2023,
      uploaderId: studentId,
      embeddingSeed: 8,
    },
  ];

  for (const proj of sampleProjects) {
    const embedding = mockEmbedding(proj.embeddingSeed);
    await localStore.query(
      `INSERT INTO projects (title, abstract, author_name, department_id, year, uploaded_by, embedding, file_name, original_file_name, mime_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [proj.title, proj.abstract, proj.author, deptIds[proj.deptIdx], proj.year, proj.uploaderId, embedding, null, null, null, null]
    );
  }

  // Print summary
  console.log('✅ Seed complete!');
  console.log('');
  console.log('📧 Test accounts:');
  console.log('   admin@gmail.com         / Admin1234    (admin)');
  console.log('   student@faculty.edu.ng  / password123  (student)');
  console.log('');
  console.log(`📁 ${data.departments.length} departments`);
  console.log(`📚 ${data.projects.length} sample projects`);
  console.log('');
  console.log('🚀 Start the server:  npm run dev');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
