const router = require("express").Router();
const { Task, validate } = require("../models/task");

// Create a new task
router.post("/", async (req, res) => {
  try {
    // Log incoming request body for debugging
    console.log("Incoming request body:", req.body);

    // Validate the incoming task data
    const { error } = validate(req.body);
    if (error) {
      console.log("Validation error:", error.details); // Log validation error
      return res.status(400).send({ message: error.details[0].message });
    }

    // Create the new task
    const task = new Task({
      name: req.body.name,
      description: req.body.description,
      status: req.body.status || false, // Default to false (incomplete)
      priority: req.body.priority,
      email: req.body.email,
    });

    // Log task before saving
    console.log("Creating task:", task);

    // Save the task to the database
    await task.save();

    // Send response with the created task
    res.status(201).send({ data: task, message: "Task created successfully" });
  } catch (error) {
    console.error("Error occurred during task creation:", error); // Log error details
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const { email, priority } = req.query; // Get email and priority from query params

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    // Build the filter object, starting with the email filter
    const filter = { email };

    // If priority is provided and is not 'all', add it to the filter
    if (priority && priority !== "all") {
      filter.priority = priority;
    }

    // Get tasks for the specific user from the database with the applied filter
    const tasks = await Task.find(filter);

    if (!tasks || tasks.length === 0) {
      return res.status(404).send({ message: "No tasks found" });
    }

    res
      .status(200)
      .send({ data: tasks, message: "Tasks retrieved successfully" });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// PATCH update task status
router.patch("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body; // Get the new status from the request body

    // Validate if status is a boolean
    if (typeof status !== "boolean") {
      return res
        .status(400)
        .send({ message: "Status must be a boolean value" });
    }

    // Find the task by ID and update its status
    const task = await Task.findByIdAndUpdate(
      taskId,
      { status: status },
      { new: true } // Return the updated task
    );

    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }

    res
      .status(200)
      .send({ data: task, message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error occurred during task status update:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// Update a task
router.put("/:id", async (req, res) => {
  // Changed from PATCH to PUT
  try {
    const { id } = req.params;
    const { name, description, priority, status, email } = req.body;

    // Find the task and update all fields (instead of just partial update like PATCH)
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { name, description, priority, status, email },
      { new: true, overwrite: true } // `overwrite: true` will completely replace the task
    );

    if (!updatedTask) {
      return res.status(404).send({ message: "Task not found" });
    }

    res
      .status(200)
      .send({ data: updatedTask, message: "Task updated successfully" });
  } catch (error) {
    console.error("Error occurred during task update:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// Delete a task
// DELETE a task by ID
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find the task by ID and delete it
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }

    res.status(200).send({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error occurred during task deletion:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
