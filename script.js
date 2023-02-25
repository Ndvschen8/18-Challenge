
const express = require('express');
const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/social-network', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});


const User = mongoose.model('User', {
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Thought = mongoose.model('Thought', {
  thoughtText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  username: { type: String, required: true },
  reactions: [{
    reactionId: { type: mongoose.Schema.Types.ObjectId, default: new mongoose.Types.ObjectId() },
    reactionBody: { type: String, required: true },
    username: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

const Reaction = mongoose.model('Reaction', {
  reactionBody: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


const app = express();


app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

app.put('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});

app.delete('/api/users/:id', async (req, res) => {
  const result = await User.findByIdAndDelete(req.params.id);
  res.json(result);
});


app.get('/api/thoughts', async (req, res) => {
  const thoughts = await Thought.find().populate('reactions');
  res.json(thoughts);
});

app.post('/api/thoughts', async (req, res) => {
  const thought = await Thought.create(req.body);
  res.json(thought);
});

app.put('/api/thoughts/:id', async (req, res) => {
  const thought = await Thought.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(thought);
});

app.delete('/api/thoughts/:id', async (req, res) => {
  const result = await Thought.findByIdAndDelete(req.params.id);
  res.json(result);
});


app.post('/api/thoughts/:thoughtId/reactions', async (req, res) => {
  const reaction = await Reaction.create(req.body);
  const thought = await Thought.findByIdAndUpdate(
    req.params.thoughtId,
    { $push: { reactions: reaction } },
    { new: true }
  ).populate('reactions');
  res.json(thought);
});

app.delete('/api/thoughts/:thoughtId/reactions/:reactionId', async (req, res) => {
  const reaction = await Reaction.findByIdAndDelete(req.params.reactionId);
  res.json(reaction);
});