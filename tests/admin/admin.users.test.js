import request from 'supertest';
import app from '../../app.js';
import Admin from '../../models/Admin.js';
import User from '../../models/User.js';
import bcrypt from 'bcrypt';
import { mongoConnect, mongoDisconnect } from '../../services/mongo.js';

describe('User Controller', () => {
    let savedAdmins;
    let superadminToken;
    let adminToken;
    let vendorToken;
    let dispatcherToken;

    beforeAll(async () => {
        await mongoConnect();
        await Admin.deleteMany();
        await User.deleteMany();
    });

    afterAll(async () => {
        await Admin.deleteMany();
        await User.deleteMany();
        await mongoDisconnect();
    });

    afterEach(async () => {
        await User.deleteMany();
    });

    describe('GET /api/v1/admin/user', () => {
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

        it('should get list of users for superadmin', async () => {
            const salt = await bcrypt.genSalt();
            const users = [
                new User({
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Kathmandu',
                    occupation: 'Student'
                }),
                new User({
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Chennai',
                    occupation: 'Student'
                }),
                new User({
                    firstName: 'User3',
                    lastName: "Something",
                    email: 'user3@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Delhi',
                    occupation: 'Developer'
                })
            ]
            const savedUsers = await User.insertMany(users);

            const response = await request(app)
                .get('/api/v1/admin/user')
                .set('Cookie', [superadminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.users.length).toBe(3);
            expect(response.body.users).toMatchObject([
                {
                    _id: savedUsers[0]._id.toString(),
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    address: 'Kathmandu',
                    occupation: 'Student',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    cart: []
                },
                {
                    _id: savedUsers[1]._id.toString(),
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    address: 'Chennai',
                    occupation: 'Student',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    cart: []
                },
                {
                    _id: savedUsers[2]._id.toString(),
                    firstName: 'User3',
                    lastName: "Something",
                    email: 'user3@gmail.com',
                    address: 'Delhi',
                    occupation: 'Developer',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    cart: []
                }
            ]);
        });

        it('should get list of users for admin', async () => {
            const salt = await bcrypt.genSalt();
            const users = [
                new User({
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Kathmandu',
                    occupation: 'Student'
                }),
                new User({
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Chennai',
                    occupation: 'Student'
                })
            ]
            const savedUsers = await User.insertMany(users);

            const response = await request(app)
                .get('/api/v1/admin/user')
                .set('Cookie', [adminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.users.length).toBe(2);
            expect(response.body.users).toMatchObject([
                {
                    _id: savedUsers[0]._id.toString(),
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    address: 'Kathmandu',
                    occupation: 'Student',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    cart: []
                },
                {
                    _id: savedUsers[1]._id.toString(),
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    address: 'Chennai',
                    occupation: 'Student',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    cart: []
                }
            ]);
        });

        it('should throw error to get list of users for vendor', async () => {
            const response = await request(app)
                .get('/api/v1/admin/user')
                .set('Cookie', [vendorToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });

        it('should get list of users for dispatcher', async () => {
            const salt = await bcrypt.genSalt();
            const users = [
                new User({
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Kathmandu',
                    occupation: 'Student'
                }),
                new User({
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Chennai',
                    occupation: 'Student'
                })
            ]
            const savedUsers = await User.insertMany(users);

            const response = await request(app)
                .get('/api/v1/admin/user')
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.users.length).toBe(2);
            expect(response.body.users).toMatchObject([
                {
                    _id: savedUsers[0]._id.toString(),
                    firstName: 'User1',
                    lastName: "Something",
                    address: 'Kathmandu',
                },
                {
                    _id: savedUsers[1]._id.toString(),
                    firstName: 'User2',
                    lastName: "Something",
                    address: 'Chennai',
                }
            ]);
        });
    });

    describe('GET /api/v1/admin/user/:id', () => {
        it('should get user for superadmin', async () => {
            const salt = await bcrypt.genSalt();
            const users = [
                new User({
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Kathmandu',
                    occupation: 'Student'
                }),
                new User({
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Chennai',
                    occupation: 'Student'
                })
            ]
            const savedUsers = await User.insertMany(users);

            const response = await request(app)
                .get(`/api/v1/admin/user/${savedUsers[0]._id.toString()}`)
                .set('Cookie', [superadminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toMatchObject(
                {
                    _id: savedUsers[0]._id.toString(),
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    address: 'Kathmandu',
                    occupation: 'Student',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    cart: []
                });
        });

        it('should get user for admin', async () => {
            const salt = await bcrypt.genSalt();
            const users = [
                new User({
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Kathmandu',
                    occupation: 'Student'
                }),
                new User({
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Chennai',
                    occupation: 'Student'
                })
            ]
            const savedUsers = await User.insertMany(users);

            const response = await request(app)
                .get(`/api/v1/admin/user/${savedUsers[0]._id.toString()}`)
                .set('Cookie', [adminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toMatchObject(
                {
                    _id: savedUsers[0]._id.toString(),
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    address: 'Kathmandu',
                    occupation: 'Student',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    cart: []
                });
        });

        it('should throw error to get user for vendor', async () => {
            const response = await request(app)
                .get('/api/v1/admin/user/1234')
                .set('Cookie', [vendorToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });

        it('should get user for dispatcher', async () => {
            const salt = await bcrypt.genSalt();
            const users = [
                new User({
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Kathmandu',
                    occupation: 'Student'
                }),
                new User({
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Chennai',
                    occupation: 'Student'
                })
            ]
            const savedUsers = await User.insertMany(users);

            const response = await request(app)
                .get(`/api/v1/admin/user/${savedUsers[0]._id.toString()}`)
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toMatchObject(
                {
                    _id: savedUsers[0]._id.toString(),
                    firstName: 'User1',
                    lastName: "Something",
                    address: 'Kathmandu',
                });
        });
    });

    describe('DELETE /api/v1/admin/user', () => {
        it('should delete user for superadmin', async () => {
            const salt = await bcrypt.genSalt();
            const users = [
                new User({
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Kathmandu',
                    occupation: 'Student'
                }),
                new User({
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Chennai',
                    occupation: 'Student'
                })
            ]
            const savedUsers = await User.insertMany(users);

            const response = await request(app)
                .delete(`/api/v1/admin/user?id=${savedUsers[0]._id.toString()}`)
                .set('Cookie', [superadminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User deleted");
        });

        it('should delete user for admin', async () => {
            const salt = await bcrypt.genSalt();
            const users = [
                new User({
                    firstName: 'User1',
                    lastName: "Something",
                    email: 'user1@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Kathmandu',
                    occupation: 'Student'
                }),
                new User({
                    firstName: 'User2',
                    lastName: "Something",
                    email: 'user2@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    address: 'Chennai',
                    occupation: 'Student'
                })
            ]
            const savedUsers = await User.insertMany(users);

            const response = await request(app)
                .delete(`/api/v1/admin/user?id=${savedUsers[1]._id.toString()}`)
                .set('Cookie', [adminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User deleted");
        });

        it('should throw error to delete user for vendor', async () => {
            const response = await request(app)
                .delete('/api/v1/admin/user?id=1234')
                .set('Cookie', [vendorToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });

        it('should throw error to delete user for dispatcher', async () => {
            const response = await request(app)
                .delete('/api/v1/admin/user?id=1234')
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });
    });
});