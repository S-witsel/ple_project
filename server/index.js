const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { query } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ ok: true, message: 'Game backend is available.' });
});

app.get('/api/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  // TODO: Query the project details from PostgreSQL here.
  res.json({ projectId, message: 'Project data endpoint placeholder' });
});

app.post('/api/character/:userId/:projectId', async (req, res) => {
  const { userId, projectId } = req.params;
  const character = req.body;
  // TODO: Persist the player character build in PostgreSQL.
  res.json({ ok: true, userId, projectId, character });
});

app.post('/api/battle/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const action = req.body;
  // TODO: Persist or validate battle actions via PostgreSQL and broadcast through Socket.IO.
  res.json({ ok: true, projectId, action });
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinBattle', (payload) => {
    socket.join(`battle:${payload.projectId}`);
    socket.emit('battle:joined', { projectId: payload.projectId });
  });

  socket.on('battle:action', (action) => {
    io.to(`battle:${action.projectId}`).emit('battle:update', action);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Game backend server listening on port ${PORT}`);
});
