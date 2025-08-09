const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/user-management-test');
    });

    afterAll(async () => {
        // Clean up and disconnect
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear users before each test
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                gmail: 'test@example.com',
                password: 'password123',
                sdt: '0123456789',
                gender: 'male',
                age: 25
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Đăng ký thành công');
            expect(response.body.data.user.name).toBe(userData.name);
            expect(response.body.data.user.gmail).toBe(userData.gmail);
            expect(response.body.data.tokens).toBeDefined();
            expect(response.body.data.tokens.access).toBeDefined();
            expect(response.body.data.tokens.refresh).toBeDefined();
        });

        it('should return error for duplicate email', async () => {
            const userData = {
                name: 'Test User',
                gmail: 'test@example.com',
                password: 'password123',
                sdt: '0123456789',
                gender: 'male',
                age: 25
            };

            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Try to register with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Email hoặc số điện thoại đã tồn tại');
        });

        it('should return validation errors for invalid data', async () => {
            const invalidData = {
                name: 'A', // Too short
                gmail: 'invalid-email',
                password: '123', // Too short
                sdt: '123', // Invalid phone
                age: 150 // Invalid age
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            const userData = {
                name: 'Test User',
                gmail: 'test@example.com',
                password: 'password123',
                sdt: '0123456789',
                gender: 'male',
                age: 25
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData);
        });

        it('should login successfully with correct credentials', async () => {
            const loginData = {
                gmail: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Đăng nhập thành công');
            expect(response.body.data.user.gmail).toBe(loginData.gmail);
            expect(response.body.data.tokens).toBeDefined();
        });

        it('should return error for incorrect password', async () => {
            const loginData = {
                gmail: 'test@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Thông tin đăng nhập không chính xác');
        });

        it('should return error for non-existent user', async () => {
            const loginData = {
                gmail: 'nonexistent@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Thông tin đăng nhập không chính xác');
        });
    });

    describe('GET /api/auth/profile', () => {
        let authToken;

        beforeEach(async () => {
            // Create and login a user
            const userData = {
                name: 'Test User',
                gmail: 'test@example.com',
                password: 'password123',
                sdt: '0123456789',
                gender: 'male',
                age: 25
            };

            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);

            authToken = registerResponse.body.data.tokens.access;
        });

        it('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Test User');
            expect(response.body.data.gmail).toBe('test@example.com');
            expect(response.body.data.password).toBeUndefined(); // Password should be excluded
        });

        it('should return error for invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Token không hợp lệ');
        });

        it('should return error for missing token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Không có token');
        });
    });
}); 