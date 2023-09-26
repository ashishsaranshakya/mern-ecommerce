import request from 'supertest';
import app from '../app.js';
import { mongoConnect, mongoDisconnect } from '../services/mongo.js';

describe('Middlewares', () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    afterEach(async () => {
        
    });

    describe('GET /api/v1/invalidRoute', () => {
        it('should throw error for invalid route', async () => {
            const response = await request(app)
                .get('/api/v1/invalidRoute');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe(`Route /api/v1/invalidRoute does not exist`);
        });
    });

    describe('GET /api/v1/invalidRoute', () => {
        it('should throw error for invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/invalidRoute');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe(`Route /api/v1/invalidRoute does not exist`);
        });
    });
});
