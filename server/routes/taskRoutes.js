const express = require('express');
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('attachment'), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const newTask = new Task({
      title,
      description,
      owner: req.userId,
      attachment: req.file ? ('/uploads/' + req.file.filename) : null
    });

    await newTask.save();
    res.status(201).json(newTask);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const query = { owner: req.userId };

    if (req.query.completed === 'true' || req.query.completed === 'false') {
      query.completed = req.query.completed === 'true';
    }

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    const allowedSortFields = ['createdAt', 'title'];
    let sortField = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    let sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sortOption = {};
    sortOption[sortField] = sortOrder;

    const totalTasks = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    res.status(200).json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(totalTasks / limit),
      totalTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const tasks = await Task.find().populate('owner', 'name email');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'You cannot edit this task' });
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
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'You cannot delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;