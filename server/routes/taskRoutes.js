const express = require('express');
const Task = require('../models/Task');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title required hai' });
    }

    const newTask = new Task({
      title,
      description,
      owner: req.userId
    });

    await newTask.save();
    res.status(201).json(newTask);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.userId });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task nahi mila' });
    }

    if (task.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Aap is task ko edit nahi kar sakte' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedTask);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task nahi mila' });
    }

    if (task.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Aap is task ko delete nahi kar sakte' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task delete ho gaya' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;