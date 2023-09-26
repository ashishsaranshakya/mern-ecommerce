import request from 'supertest';
import User from '../models/User.js'
import bcrypt from 'bcrypt';
import app from '../app.js';
import { mongoConnect, mongoDisconnect } from '../services/mongo.js';

describe('Product endpoints', () => {
    const password = 'P@ssw0rd';
    let cookie = null;

    beforeAll(async () => {
        await mongoConnect();
        await User.deleteMany();
    });

    afterAll(async () => {
        await User.deleteMany();
        await mongoDisconnect();
    });

    afterEach(async () => {
        await User.deleteMany();
    });

    describe('GET /api/v1/', () => {
        it('should return cittaa backend message', async () => {
            const response = await request(app)
                .get('/api/v1/');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Cittaa Ecommerce API');
        });
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register new user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(
                    {
                        firstName: 'Ashish',
                        lastName: "Something",
                        email: 'register@gmail.com',
                        password,
                        address: 'Kathmandu'
                    }
                )
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User created successfully');
        });

        it('should throw error for invalid data to register new user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(
                    {
                        firstName: 'Ashish',
                        lastName: "This last name is too long to be accepted by the schema",
                        email: 'register@gmail.com',
                        password
                    }
                )
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors.length).toBe(2);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login registered user', async () => {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({
                firstName: 'Ashish',
                lastName: "Something",
                email: 'testing@gmail.com',
                password: hashedPassword,
                address: 'Kathmandu',
            })
            const savedUser = await user.save();

            const response = await request(app)
                .post(`/api/v1/auth/login`)
                .send(
                    {
                        email: savedUser.email,
                        password: password
                    }
                )
                .set('Accept', 'application/json');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toMatchObject({
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                address: savedUser.address,
                cart: [],
                occupation: null
            });
            
            cookie = response.headers['set-cookie'][0].split(';')[0];
        })

        it('should throw error for invalid credentials by registered user', async () => {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({
                firstName: 'Ashish',
                lastName: "Something",
                email: 'testing@gmail.com',
                password: hashedPassword,
                address: 'Kathmandu',
            })
            const savedUser = await user.save();

            const response = await request(app)
                .post(`/api/v1/auth/login`)
                .send(
                    {
                        email: savedUser.email,
                        password: password+'1'
                    }
                )
                .set('Accept', 'application/json');
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid credentials');
        })
    });

    describe('GET /api/v1/auth/logout', () => {
        it('should logout user', async () => {
            const response = await request(app)
                .post(`/api/v1/auth/logout`)
                .set('Cookie', [cookie]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.headers['set-cookie'].length).toBe(1);
            expect(response.headers['set-cookie'][0]).toBe('token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
        })
    });
});