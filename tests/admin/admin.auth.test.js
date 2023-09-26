import request from 'supertest';
import app from '../../app.js';
import Admin from '../../models/Admin.js';
import bcrypt from 'bcrypt';
import { mongoConnect, mongoDisconnect } from '../../services/mongo.js';

describe('Admin auth Controller', () => {
    beforeAll(async () => {
        await mongoConnect();
        await Admin.deleteMany();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    afterEach(async () => {
        await Admin.deleteMany();
    });

    describe('POST /api/v1/admin/register', () => {
        it('should register admin from super-admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Super',
                email: 'super-admin@gmail.com',
                role: 'Super-admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'super-admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .post(`/api/v1/admin/register`)
                .send({
                    name: 'Admin',
                    email: 'admin@gmail.com',
                    password: 'P@ssw0rd',
                    role: 'Admin'
                })
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin created successfully');
        });

        it('should register vendor from super-admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Super',
                email: 'super-admin@gmail.com',
                role: 'Super-admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'super-admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .post(`/api/v1/admin/register`)
                .send({
                    name: 'Admin',
                    email: 'vendor@gmail.com',
                    password: 'P@ssw0rd',
                    role: 'Vendor'
                })
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin created successfully');
        });

        it('should register dispatcher from super-admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Super',
                email: 'super-admin@gmail.com',
                role: 'Super-admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'super-admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .post(`/api/v1/admin/register`)
                .send({
                    name: 'Admin',
                    email: 'dispatcher@gmail.com',
                    password: 'P@ssw0rd',
                    role: 'Dispatcher'
                })
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin created successfully');
        });

        it('should throw error for registering admin from admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'Admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .post(`/api/v1/admin/register`)
                .send({
                    name: 'Admin',
                    email: 'admin-2@gmail.com',
                    password: 'P@ssw0rd',
                    role: 'Admin'
                })
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Forbidden');
        });

        it('should register vendor from admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'Admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .post(`/api/v1/admin/register`)
                .send({
                    name: 'Admin',
                    email: 'vendor@gmail.com',
                    password: 'P@ssw0rd',
                    role: 'Vendor'
                })
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin created successfully');
        });

        it('should register dispatcher from admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'Admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .post(`/api/v1/admin/register`)
                .send({
                    name: 'Admin',
                    email: 'dispatcher@gmail.com',
                    password: 'P@ssw0rd',
                    role: 'Dispatcher'
                })
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin created successfully');
        });

        it('should throw error for registering by vendor', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'vendor@gmail.com',
                role: 'Vendor',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'vendor@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .post(`/api/v1/admin/register`)
                .send({
                    name: 'Admin',
                    email: 'admin-2@gmail.com',
                    password: 'P@ssw0rd',
                    role: 'Vendor'
                })
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Forbidden');
        });

        it('should throw error for registering by dispatcher', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'dispatcher@gmail.com',
                role: 'Dispatcher',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'dispatcher@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .post(`/api/v1/admin/register`)
                .send({
                    name: 'Admin',
                    email: 'admin-2@gmail.com',
                    password: 'P@ssw0rd',
                    role: 'Dispatcher'
                })
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Forbidden');
        });
    });

    describe('POST /api/v1/admin/login', () => {
        it('should login super-admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'super-admin@gmail.com',
                role: 'Super-admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();
            const response = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'super-admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admin).toMatchObject({
                _id: savedAdmin._id.toString(),
                name: 'Admin',
                email: 'super-admin@gmail.com',
                role: 'Super-admin'
            })
        });

        it('should login admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'Admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();
            const response = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admin).toMatchObject({
                _id: savedAdmin._id.toString(),
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'Admin'
            })
        });

        it('should login vendor', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'vendor@gmail.com',
                role: 'Vendor',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();
            const response = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'vendor@gmail.com',
                    password: 'P@ssw0rd'
                });
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admin).toMatchObject({
                _id: savedAdmin._id.toString(),
                name: 'Admin',
                email: 'vendor@gmail.com',
                role: 'Vendor'
            })
        });

        it('should login dispatcher', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'dispatcher@gmail.com',
                role: 'Dispatcher',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();
            const response = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'dispatcher@gmail.com',
                    password: 'P@ssw0rd'
                });
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.admin).toMatchObject({
                _id: savedAdmin._id.toString(),
                name: 'Admin',
                email: 'dispatcher@gmail.com',
                role: 'Dispatcher'
            })
        });

        it('should throw error for invalid credentials', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'dispatcher@gmail.com',
                role: 'Dispatcher',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();
            const response = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'dispatcher@gmail.com',
                    password: 'P@ssw0rd'+'1'
                });
            
            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Invalid credentials")
        });
    });

    describe('POST /api/v1/admin/logout', () => {
        it('should logout admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Super',
                email: 'super-admin@gmail.com',
                role: 'Super-admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'super-admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .post(`/api/v1/auth/logout`)
                .set('Cookie', [token]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.headers['set-cookie'].length).toBe(1);
            expect(response.headers['set-cookie'][0]).toBe('token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
        });
    });

    describe('DELETE /api/v1/admin/delete', () => {
        it('should delete admin from super-admin', async () => {
            const salt = await bcrypt.genSalt();
            const superadmin = new Admin({
                name: 'Super',
                email: 'super-admin@gmail.com',
                role: 'Super-admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            });
            const admin = new Admin({
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'Admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            });
            const savedSuperAdmin = await superadmin.save();
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'super-admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .delete(`/api/v1/admin/delete?id=${savedAdmin._id.toString()}`)
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin deleted successfully');
        });

        it('should delete vendor from super-admin', async () => {
            const salt = await bcrypt.genSalt();
            const superadmin = new Admin({
                name: 'Super',
                email: 'super-admin@gmail.com',
                role: 'Super-admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            });
            const admin = new Admin({
                name: 'Admin',
                email: 'vendor@gmail.com',
                role: 'Vendor',
                password: await bcrypt.hash("P@ssw0rd", salt)
            });
            const savedSuperAdmin = await superadmin.save();
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'super-admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .delete(`/api/v1/admin/delete?id=${savedAdmin._id.toString()}`)
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin deleted successfully');
        });

        it('should delete dispatcher from super-admin', async () => {
            const salt = await bcrypt.genSalt();
            const superadmin = new Admin({
                name: 'Super',
                email: 'super-admin@gmail.com',
                role: 'Super-admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            });
            const admin = new Admin({
                name: 'Admin',
                email: 'dispatcher@gmail.com',
                role: 'Dispatcher',
                password: await bcrypt.hash("P@ssw0rd", salt)
            });
            const savedSuperAdmin = await superadmin.save();
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'super-admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .delete(`/api/v1/admin/delete?id=${savedAdmin._id.toString()}`)
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin deleted successfully');
        });

        it('should throw error for deleteing admin from admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin1 = new Admin({
                name: 'Admin',
                email: 'admin1@gmail.com',
                role: 'Admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const admin2 = new Admin({
                name: 'Admin',
                email: 'admin2@gmail.com',
                role: 'Admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin1 = await admin1.save();
            const savedAdmin2 = await admin2.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'admin1@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .delete(`/api/v1/admin/delete?id=${savedAdmin2._id.toString()}`)
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Forbidden');
        });

        it('should delete vendor from admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'Admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const vendor = new Admin({
                name: 'Admin',
                email: 'vendor@gmail.com',
                role: 'Vendor',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedVendor = await vendor.save();
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .delete(`/api/v1/admin/delete?id=${savedVendor._id.toString()}`)
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin deleted successfully');
        });

        it('should delete dispatcher from admin', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'Admin',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const dispatcher = new Admin({
                name: 'Admin',
                email: 'vendor@gmail.com',
                role: 'Vendor',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedDispatcher = await dispatcher.save();
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'admin@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .delete(`/api/v1/admin/delete?id=${savedDispatcher._id.toString()}`)
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin deleted successfully');
        });

        it('should throw error for deleteing by vendor', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'vendor@gmail.com',
                role: 'Vendor',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'vendor@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .delete(`/api/v1/admin/delete?id=1234`)
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Forbidden');
        });

        it('should throw error for deleteing by dispatcher', async () => {
            const salt = await bcrypt.genSalt();
            const admin = new Admin({
                name: 'Admin',
                email: 'dispatcher@gmail.com',
                role: 'Dispatcher',
                password: await bcrypt.hash("P@ssw0rd", salt)
            })
            const savedAdmin = await admin.save();

            const responsek = await request(app)
                .post(`/api/v1/admin/login`)
                .send({
                    email: 'dispatcher@gmail.com',
                    password: 'P@ssw0rd'
                });
            const token = responsek.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .delete(`/api/v1/admin/delete?id=1234`)
                .set('Cookie', [token]);
            
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Forbidden');
        });
    });
});