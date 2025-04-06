import "@jest/globals";

// Mock environment variables
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";
process.env.FACEPLUSPLUS_API_KEY = "test-key";
process.env.FACEPLUSPLUS_API_SECRET = "test-secret";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.PRIVATE_KEY = "test-private-key";
process.env.CONTRACT_ADDRESS = "0x123";
process.env.CHAIN_ID = "1";

jest.mock("bullmq");
jest.mock("pino");
