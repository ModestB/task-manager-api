const express = require('express');
const Task = require('../models/task');
const authMiddleware = require('../middleware/auth');

const router = new express.Router()

router.post('/tasks', authMiddleware, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save();
    res.status(201).send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/tasks/:id', authMiddleware, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})

// GET /tasks?completed=true

// GET /tasks?limit=10&skip=10
// skip naudojama puslapiavimui pvz. skip=10 reiškia praleisti 10 įrašų
// rezultate esame 2 puslapyje, bes limit = 10 skip = 10, t.y matome 10 įrašų praleidia 10 t.y matome 11-20 įrašus

// GET /tasks?sortBy=fieldNameToSort:asc /tasks?sortBy=fieldNameToSort:desc
// GET /tasks?sortBy=createdAt:asc /tasks?sortBy=createdA:desc
// for asc sort 1
// for desc sort -1
router.get('/tasks', authMiddleware, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    const sortOptions = req.query.sortBy.split(':');
    sort[sortOptions[0]] = sortOptions[1] === 'asc' ? 1 : -1;
  }

  try {
    // OPTION 1
    // const tasks = await Task.find({ owner: req.user._id })
    // res.send(tasks)
    // SAME RESULTS 

    // OPTION 2
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate();
    res.send(req.user.tasks)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.patch('/tasks/:id', authMiddleware,  async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'description',
    'completed'
  ]
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    res.status(400).send({ error: 'Not valid update' })
  }

  try {
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }
    updates.forEach(update => task[update] = req.body[update])
    await task.save()

    res.send(task)
  } catch (error) {
    res.status(400).send(error)
  }

})

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user.id });

    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (error) {
    return res.status(500).send()
  }
})

module.exports = router;