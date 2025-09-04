import Joi from "joi";

export const registerValidation = Joi.object({
  fullname: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter valid email",
  }),
  password: Joi.string()
    .required()
    .min(6)
    .max(20)
    .messages({
      "string.empty": "Password is required",
      "string.min": "Name must be at least 6 characters long",
    })
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]{6,20}/
    ),
    plan: Joi.string().valid("basic", "standard", "premium").required().messages({
    "string.empty": "Plan is required",
    "any.only": "Plan must be either basic, standard, or premium",
  })
});

export const registerMemberValidation = Joi.object({
  fullname: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter valid email",
  }),
  password: Joi.string()
    .required()
    .min(6)
    .max(20)
    .messages({
      "string.empty": "Password is required",
      "string.min": "Name must be at least 6 characters long",
    })
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]{6,20}/
    ),
  // role: Joi.string().valid("admin", "cashier").required(),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),
});

// export const updateValidation = Joi.object({
//   fullname: Joi.string().min(3).max(30).messages({
//     "string.min": "Name must be at least 3 characters long",
//   }).optional(),
//   email: Joi.string().email().messages({
//     "string.email": "Please enter a valid email",
//   }).optional(),
//   password: Joi.string()
//     .min(6)
//     .max(20)
//     .regex(
//       /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]{6,20}/
//     ).optional(),
//   role: Joi.string().valid("admin", "cashier").optional(),
// });
