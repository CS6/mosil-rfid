import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

beforeAll(async () => {
  // Setup test environment
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Cleanup
  console.log('Cleaning up test environment...');
});

beforeEach(async () => {
  // Setup for each test
  console.log('Setting up test case...');
});