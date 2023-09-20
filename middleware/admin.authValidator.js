import { body } from "express-validator";

export const validateRegisterData = [
    body("name", 'First name should be between 2 and 20 characters long.').isLength({
        min:2,
        max:20
    }),
    body("email", 'Email is invalid.').isEmail(),
    body("password", 'Password should be at least 8 characters long.')
        .isLength({
            min:8
        })
        .custom((value, { req }) => {
            const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/;
            return passwordPattern.test(value);
        })
        .withMessage('Password must contain atleast one uppercase letter, one number and one special character'),
    body("role", 'Role cannot be empty').notEmpty()
        .custom((value, { req }) => {
            const rolePattern = /^(Admin|Vendor|Dispatcher)$/;
            return rolePattern.test(value);
        })
        .withMessage('Invalid role')
];

export const validateLoginData = [
    body("email", 'Email is invalid.').isEmail(),
    body("password", 'Password cannot be empty.').notEmpty()
];