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

app.get('/api/character/:userId/:projectId', async (req, res) => {
  const { userId, projectId } = req.params;
  try {
    const result = await query(
      'SELECT stats, abilities, equipment, inventory, created_at, updated_at FROM characters WHERE user_id = $1 AND project_id = $2',
      [userId, projectId]
    );
    if (result.rows.length === 0) return res.status(404).json({ ok: false, message: 'Character not found' });
    return res.json({ ok: true, character: result.rows[0] });
  } catch (err) {
    console.error('GET /api/character error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.post('/api/character/:userId/:projectId', async (req, res) => {
  const { userId, projectId } = req.params;
  const character = req.body;
  try {
    await query(
      `INSERT INTO characters (user_id, project_id, stats, abilities, equipment, inventory, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,now(),now())
       ON CONFLICT (user_id, project_id)
       DO UPDATE SET stats = $3, abilities = $4, equipment = $5, inventory = $6, updated_at = now()`,
      [userId, projectId, character.stats || {}, character.abilities || [], character.equipment || {}, character.inventory || {}]
    );
    return res.json({ ok: true, userId, projectId });
  } catch (err) {
    console.error('POST /api/character error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
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
