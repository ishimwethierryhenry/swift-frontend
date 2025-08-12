import Joi from "joi";

export const poolSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  depth: Joi.string().required(),
  l: Joi.string().required(),
  w: Joi.string().required(),
  assigned_to: Joi.string().required(),
});
