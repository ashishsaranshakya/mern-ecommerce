import { body } from "express-validator";

export const validateProductData = [
    body("name", 'Product name should be between 2 and 30 characters long.').isLength({
        min:4,
        max:50
    }),
    body("description", 'Description should be between 10 and 500 characters long.').isLength({
        min:10,
        max:500
    }),
    body("cost", 'Cost has to be a number.').isNumeric()
        .custom((value, { req }) => {
            return Number(value)>0;
        })
        .withMessage('Cost has to be greater than 0.'),
    body("imageUrl")
        .custom((value, { req }) => {
            const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
            return urlRegex.test(value);
        })
        .withMessage('Invalid url'),
    body("quantity", 'Quantity has to be a number.').isNumeric()
        .custom((value, { req }) => {
            return Number(value)>0;
        })
        .withMessage('Quantity has to be greater than 0.')
];