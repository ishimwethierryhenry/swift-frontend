import Joi from "joi";

export const userSchema = Joi.object({
  fname: Joi.string().required(),
  lname: Joi.string().required(),
  phone: Joi.string().required(),
  location: Joi.string().required(),
  gender: Joi.string().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
});
