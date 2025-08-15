import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

beforeAll(async () => {
  // Setup test environment
});

afterAll(async () => {
  // Cleanup
});

beforeEach(async () => {
  // Setup for each test
});