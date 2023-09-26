import request from 'supertest';
import app from '../../app.js';
import Admin from '../../models/Admin.js';
import bcrypt from 'bcrypt';
import { mongoConnect, mongoDisconnect } from '../../services/mongo.js';

describe('Admin Controller', () => {
    let savedAdmins;
    let superadminToken;
    let adminToken;
    let vendorToken;
    let dispatcherToken;

    beforeAll(async () => {
        await mongoConnect();
        await Admin.deleteMany();
    });

    afterAll(async () => {
        await Admin.deleteMany();
        await mongoDisconnect();
    });

    afterEach(async () => {
        
    });

    describe('GET /api/v1/admin/list', () => {
        it('should get tokens for all roles', async () => {
            const salt = await bcrypt.genSalt();
            const admins = [
                new Admin({
                    name: 'Super',
                    email: 'super-admin@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    role: 'Super-admin'
                }),
                new Admin({
                    name: 'Admin',
                    email: 'admin@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    role: 'Admin'
                }),
                new Admin({
                    name: 'Vendor',
                    email: 'vendor@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    role: 'Vendor'
                }),
                new Admin({
                    name: 'Dispatcher',
                    email: 'dispatcher@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    role: 'Dispatcher'
                })
            ]
            savedAdmins = await Admin.insertMany(admins);

            let response = await request(app)
                .post(`/api/v1/admin/login`)
                .send(
                    {
                        email: savedAdmins[0].email,
                        password: "P@ssw0rd"
                    }
                )
                .set('Accept', 'application/json');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            superadminToken = response.headers['set-cookie'][0].split(';')[0];

            response = await request(app)
                .post(`/api/v1/admin/login`)
                .send(
                    {
                        email: savedAdmins[1].email,
                        password: "P@ssw0rd"
                    }
                )
                .set('Accept', 'application/json');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            adminToken = response.headers['set-cookie'][0].split(';')[0];

            response = await request(app)
                .post(`/api/v1/admin/login`)
                .send(
                    {
                        email: savedAdmins[2].email,
                        password: "P@ssw0rd"
                    }
                )
                .set('Accept', 'application/json');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            vendorToken = response.headers['set-cookie'][0].split(';')[0];

            response = await request(app)
                .post(`/api/v1/admin/login`)
                .send(
                    {
                        email: savedAdmins[3].email,
                        password: "P@ssw0rd"
                    }
                )
                .set('Accept', 'application/json');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            dispatcherToken = response.headers['set-cookie'][0].split(';')[0];;
        });

        it('should get list of admins for superadmin', async () => {
            const response = await request(app)
                .get('/api/v1/admin/list')
                .set('Cookie', [superadminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admins.length).toBe(3);
            expect(response.body.admins).toMatchObject([
                {
                    _id: savedAdmins[1]._id.toString(),
                    name: 'Admin',
                    email: 'admin@gmail.com',
                    role: 'Admin'
                },
                {
                    _id: savedAdmins[2]._id.toString(),
                    name: 'Vendor',
                    email: 'vendor@gmail.com',
                    role: 'Vendor'
                },
                {
                    _id: savedAdmins[3]._id.toString(),
                    name: 'Dispatcher',
                    email: 'dispatcher@gmail.com',
                    role: 'Dispatcher'
                }
            ]);
        });

        it('should get list of admins for admin', async () => {
            const response = await request(app)
                .get('/api/v1/admin/list')
                .set('Cookie', [adminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admins.length).toBe(2);
            expect(response.body.admins).toMatchObject([
                {
                    _id: savedAdmins[2]._id.toString(),
                    name: 'Vendor',
                    email: 'vendor@gmail.com',
                    role: 'Vendor'
                },
                {
                    _id: savedAdmins[3]._id.toString(),
                    name: 'Dispatcher',
                    email: 'dispatcher@gmail.com',
                    role: 'Dispatcher'
                }
            ]);
        });

        it('should throw error to get list of admins for vendor', async () => {
            const response = await request(app)
                .get('/api/v1/admin/list')
                .set('Cookie', [vendorToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });

        it('should throw error to get list of admins for dispatcher', async () => {
            const response = await request(app)
                .get('/api/v1/admin/list')
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });
    });

    describe('GET /api/v1/admin/profile', () => {
        it('should get profile of superadmin', async () => {
            const response = await request(app)
                .get('/api/v1/admin/profile')
                .set('Cookie', [superadminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admin).toMatchObject({
                _id: savedAdmins[0]._id.toString(),
                name: 'Super',
                email: 'super-admin@gmail.com',
                role: 'Super-admin'
            });
        });

        it('should get profile of admin', async () => {
            const response = await request(app)
                .get('/api/v1/admin/profile')
                .set('Cookie', [adminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admin).toMatchObject({
                _id: savedAdmins[1]._id.toString(),
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'Admin'
            });
        });

        it('should get profile of vendor', async () => {
            const response = await request(app)
                .get('/api/v1/admin/profile')
                .set('Cookie', [vendorToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admin).toMatchObject({
                _id: savedAdmins[2]._id.toString(),
                name: 'Vendor',
                email: 'vendor@gmail.com',
                role: 'Vendor'
            });
        });

        it('should get profile of vendor', async () => {
            const response = await request(app)
                .get('/api/v1/admin/profile')
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admin).toMatchObject({
                _id: savedAdmins[3]._id.toString(),
                name: 'Dispatcher',
                email: 'dispatcher@gmail.com',
                role: 'Dispatcher'
            });
        });

        it('should throw error to get profile without cookie', async () => {
            const response = await request(app)
                .get('/api/v1/admin/profile');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Unauthorized");
        });
    });
});