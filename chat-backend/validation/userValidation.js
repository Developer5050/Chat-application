const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .pattern(
        new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{6,}$")
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      }),

    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
      "any.only": "Confirm password must match password",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = { registerValidation, loginValidation };
