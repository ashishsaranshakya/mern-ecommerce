import { body } from "express-validator";

export const validateRegisterData = [
    body("firstName", 'First name should be between 2 and 20 characters long.').isLength({
        min:2,
        max:20
    }),
    body("lastName", 'Last name should be between 2 and 20 characters long.').isLength({
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
    body("address", 'Address should be less than 50 characters long.').isLength({
        min:2,
        max:50
    }),
    body("occupation", 'Occupation should be less than 20 characters long.').isLength({
        max:20
    })
];

export const validateLoginData = [
    body("email", 'Email is invalid.').isEmail(),
    body("password", 'Password cannot be empty.').notEmpty()
];