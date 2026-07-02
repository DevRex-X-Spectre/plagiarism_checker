import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFields } from './fieldExtractor.service.js';

test('extractFields pulls common project metadata', () => {
  const fields = extractFields(`
    FACULTY OF SCIENCE
    AI-Based Attendance System
    BY Ada Lovelace
    DEPARTMENT OF Computer Science
    2024

    ABSTRACT
    This project checks attendance with facial recognition.
    CHAPTER ONE
    Introduction
  `);

  assert.equal(fields.title, 'AI-Based Attendance System');
  assert.equal(fields.authorName, 'Ada Lovelace');
  assert.equal(fields.department, 'Computer Science');
  assert.equal(fields.year, 2024);
  assert.equal(fields.abstract, 'This project checks attendance with facial recognition.');
});
