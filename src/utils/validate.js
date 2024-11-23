const  Joi  = require("joi");
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    fullName: Joi.string().max(100).required(),
    gender: Joi.string().max(50).required(),
    telephone: Joi.string().min(4).max(15).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,}$')).required().messages({
        'string.pattern.base': 'Password must contain 8-30 characters'
    }),
    ConfirmPassword: Joi.string().valid(Joi.ref("password")).messages({
        'any.only': 'Confirm password must be same as password'
    })
})
const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
}

const ProductSchema = Joi.object({
    name: Joi.string().max(20).required(),
    description: Joi.string().min(4).max(15),
    price: Joi.number().min(4).max(15).required(),
})


module.exports = { registerSchema, options, ProductSchema}