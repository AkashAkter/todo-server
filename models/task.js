const Joi = require("joi"); // Add this to import Joi for validation
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: Boolean, default: false },
  priority: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to user
  email: { type: String, required: true }, // Store the user's email
});

const Task = mongoose.model("Task", taskSchema);

const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Task Name"),
    description: Joi.string().required().label("Description"),
    status: Joi.boolean().label("Status"),
    priority: Joi.string()
      .valid("low", "medium", "high")
      .required()
      .label("Priority"),
    email: Joi.string().email().required().label("Email"), // Ensure email is valid
  });
  return schema.validate(data);
};

module.exports = { Task, validate };
