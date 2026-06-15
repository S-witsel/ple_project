const express = require('express');
const http = require('http');
const crypto = require('crypto');
const { Server } = require('socket.io');
const { query } = require('./db');
const bcrypt = require('bcryptjs');

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

async function buildUserData(userId) {
  const userResult = await query('SELECT id, name FROM users WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) return null;

  const teamResult = await query(
    `SELECT t.id, t.name, tm.role
     FROM teams t
     JOIN team_members tm ON t.id = tm.team_id
     WHERE tm.user_id = $1
     ORDER BY t.name`,
    [userId]
  );

  const teamIds = teamResult.rows.map((team) => team.id);
  const projectResult = teamIds.length
    ? await query('SELECT id, name, team_id FROM projects WHERE team_id = ANY($1) ORDER BY name', [teamIds])
    : { rows: [] };

  const projectIds = projectResult.rows.map((project) => project.id);
  const tasklistResult = projectIds.length
    ? await query('SELECT id, project_id, name FROM tasklists WHERE project_id = ANY($1) ORDER BY name', [projectIds])
    : { rows: [] };

  const tasklistIds = tasklistResult.rows.map((tasklist) => tasklist.id);
  const tasksResult = tasklistIds.length
    ? await query('SELECT id, tasklist_id, title, description, status FROM tasks WHERE tasklist_id = ANY($1) ORDER BY created_at', [tasklistIds])
    : { rows: [] };

  const characterResult = await query(
    'SELECT project_id, stats, abilities, equipment, inventory FROM characters WHERE user_id = $1',
    [userId]
  );

  const projects = projectResult.rows.map((project) => ({
    id: project.id,
    name: project.name,
    teamId: project.team_id,
    tasklists: tasklistResult.rows
      .filter((list) => list.project_id === project.id)
      .map((list) => ({
        ...list,
        tasks: tasksResult.rows.filter((task) => task.tasklist_id === list.id),
      })),
  }));

  const characters = characterResult.rows.reduce((acc, row) => {
    acc[row.project_id] = {
      stats: row.stats || {},
      abilities: row.abilities || [],
      equipment: row.equipment || {},
      inventory: row.inventory || { abilities: [], equipment: [] },
    };
    return acc;
  }, {});

  return {
    user: { ...userResult.rows[0], teamIds },
    teams: teamResult.rows,
    projects,
    characters,
  };
}

app.get('/api/users/:id', async (req, res) => {
  try {
    const payload = await buildUserData(req.params.id);
    if (!payload) return res.status(404).json({ ok: false, message: 'User not found' });
    return res.json({ ok: true, ...payload });
  } catch (err) {
    console.error('GET /api/users/:id error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.post('/api/teams', async (req, res) => {
  const { name, ownerId } = req.body;
  if (!name || !ownerId) return res.status(400).json({ ok: false, message: 'name and ownerId required' });

  const teamId = `t${Date.now()}`;
  try {
    await query('INSERT INTO teams (id, name) VALUES ($1, $2)', [teamId, name]);
    await query('INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)', [teamId, ownerId, 'owner']);
    return res.json({ ok: true, team: { id: teamId, name, role: 'owner' } });
  } catch (err) {
    console.error('POST /api/teams error', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/teams/:teamId/invite', async (req, res) => {
  const { teamId } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ ok: false, message: 'userId required' });

  try {
    const member = await query('SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
    if (member.rows.length === 0 || member.rows[0].role !== 'owner') {
      return res.status(403).json({ ok: false, message: 'Only team owners can generate invite codes.' });
    }

    let invite = await query('SELECT code FROM team_invites WHERE team_id = $1 AND active = true ORDER BY created_at DESC LIMIT 1', [teamId]);
    if (invite.rows.length === 0) {
      const code = crypto.randomBytes(4).toString('hex').slice(0, 8).toUpperCase();
      await query('INSERT INTO team_invites (team_id, code, active) VALUES ($1, $2, true)', [teamId, code]);
      invite = { rows: [{ code }] };
    }

    return res.json({ ok: true, code: invite.rows[0].code });
  } catch (err) {
    console.error('POST /api/teams/:teamId/invite error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.post('/api/teams/join', async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ ok: false, message: 'userId and code required' });

  try {
    const invite = await query('SELECT team_id FROM team_invites WHERE code = $1 AND active = true', [code]);
    if (invite.rows.length === 0) return res.status(404).json({ ok: false, message: 'Invite code not found' });

    const teamId = invite.rows[0].team_id;
    const existing = await query('SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
    if (existing.rows.length > 0) return res.json({ ok: true, teamId });

    await query('INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)', [teamId, userId, 'member']);
    return res.json({ ok: true, teamId });
  } catch (err) {
    console.error('POST /api/teams/join error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.post('/api/teams/:teamId/leave', async (req, res) => {
  const { teamId } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ ok: false, message: 'userId required' });

  try {
    const membership = await query('SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
    if (membership.rows.length === 0) return res.status(404).json({ ok: false, message: 'Membership not found' });
    const role = membership.rows[0].role;

    if (role === 'owner') {
      const owners = await query('SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND role = $2', [teamId, 'owner']);
      if (parseInt(owners.rows[0].count, 10) <= 1) {
        return res.status(400).json({ ok: false, message: 'Cannot leave as the only owner. Transfer ownership or delete the team first.' });
      }
    }

    await query('DELETE FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/teams/:teamId/leave error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.post('/api/projects', async (req, res) => {
  const { teamId, name } = req.body;
  if (!teamId || !name) return res.status(400).json({ ok: false, message: 'teamId and name required' });

  const projectId = `p${Date.now()}`;
  const tasklistId = `l${Date.now()}0`;

  try {
    await query('INSERT INTO projects (id, name, team_id) VALUES ($1, $2, $3)', [projectId, name, teamId]);
    await query('INSERT INTO tasklists (id, project_id, name) VALUES ($1, $2, $3)', [tasklistId, projectId, 'General']);
    return res.json({ ok: true, project: { id: projectId, name, teamId, tasklists: [{ id: tasklistId, project_id: projectId, name: 'General', tasks: [] }] } });
  } catch (err) {
    console.error('POST /api/projects error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.post('/api/tasklists', async (req, res) => {
  const { projectId, name } = req.body;
  if (!projectId || !name) return res.status(400).json({ ok: false, message: 'projectId and name required' });

  const tasklistId = `l${Date.now()}`;
  try {
    await query('INSERT INTO tasklists (id, project_id, name) VALUES ($1, $2, $3)', [tasklistId, projectId, name]);
    return res.json({ ok: true, tasklist: { id: tasklistId, project_id: projectId, name, tasks: [] } });
  } catch (err) {
    console.error('POST /api/tasklists error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.put('/api/tasklists/:tasklistId', async (req, res) => {
  const { tasklistId } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ ok: false, message: 'name required' });

  try {
    await query('UPDATE tasklists SET name = $1 WHERE id = $2', [name, tasklistId]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/tasklists/:tasklistId error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.delete('/api/tasklists/:tasklistId', async (req, res) => {
  const { tasklistId } = req.params;
  try {
    await query('DELETE FROM tasklists WHERE id = $1', [tasklistId]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/tasklists/:tasklistId error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { tasklistId, title, description, status } = req.body;
  if (!tasklistId || !title) return res.status(400).json({ ok: false, message: 'tasklistId and title required' });

  const taskId = `task${Date.now()}`;
  try {
    await query(
      'INSERT INTO tasks (id, tasklist_id, title, description, status, created_at) VALUES ($1, $2, $3, $4, $5, now())',
      [taskId, tasklistId, title, description || '', status || 'to do']
    );
    return res.json({ ok: true, task: { id: taskId, tasklist_id: tasklistId, title, description: description || '', status: status || 'to do' } });
  } catch (err) {
    console.error('POST /api/tasks error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.put('/api/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status } = req.body;
  if (!title || !status) return res.status(400).json({ ok: false, message: 'title and status required' });

  try {
    await query('UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4', [title, description || '', status, taskId]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/tasks/:taskId error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    await query('DELETE FROM tasks WHERE id = $1', [taskId]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/tasks/:taskId error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

app.get('/api/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const projectResult = await query('SELECT id, name, team_id FROM projects WHERE id = $1', [projectId]);
    if (projectResult.rows.length === 0) return res.status(404).json({ ok: false, message: 'Project not found' });
    const project = projectResult.rows[0];

    const tasklistsResult = await query('SELECT id, project_id, name FROM tasklists WHERE project_id = $1 ORDER BY name', [projectId]);
    const tasklistIds = tasklistsResult.rows.map((tasklist) => tasklist.id);
    const tasksResult = tasklistIds.length
      ? await query('SELECT id, tasklist_id, title, description, status FROM tasks WHERE tasklist_id = ANY($1) ORDER BY created_at', [tasklistIds])
      : { rows: [] };

    const tasklists = tasklistsResult.rows.map((tasklist) => ({
      ...tasklist,
      tasks: tasksResult.rows.filter((task) => task.tasklist_id === tasklist.id),
    }));

    return res.json({ ok: true, project: { ...project, tasklists } });
  } catch (err) {
    console.error('GET /api/project/:projectId error', err);
    return res.status(500).json({ ok: false, error: 'database error' });
  }
});

// Users API: create, list, delete
app.get('/api/users', async (req, res) => {
  try {
    const result = await query('SELECT id, name FROM users ORDER BY name');
    return res.json({ ok: true, users: result.rows });
  } catch (err) {
    console.error('GET /api/users error', err);
    return res.status(500).json({ ok: false });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ ok: false, message: 'name and password required' });
  try {
    const hashed = bcrypt.hashSync(password, 10);
    const id = `u${Date.now()}`;
    await query('INSERT INTO users (id, name, password) VALUES ($1,$2,$3)', [id, name, hashed]);
    return res.json({ ok: true, user: { id, name } });
  } catch (err) {
    console.error('POST /api/users error', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/users error', err);
    return res.status(500).json({ ok: false });
  }
});

app.post('/api/login', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ ok: false, message: 'name and password required' });
  try {
    const result = await query('SELECT id, name, password FROM users WHERE name = $1', [name]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ ok: false, message: 'invalid credentials' });
    const match = bcrypt.compareSync(password, user.password || '');
    if (!match) return res.status(401).json({ ok: false, message: 'invalid credentials' });
    return res.json({ ok: true, user: { id: user.id, name: user.name } });
  } catch (err) {
    console.error('POST /api/login error', err);
    return res.status(500).json({ ok: false });
  }
});

app.get('/api/character/:userId/:projectId', async (req, res) => {
  const { userId, projectId } = req.params;
  try {
    const result = await query(
      'SELECT stats, abilities, equipment, inventory, created_at, updated_at FROM characters WHERE user_id = $1 AND project_id = $2',
      [userId, projectId]
    );
    if (result.rows.length === 0) {
      return res.json({ ok: false, message: 'Character not found', character: null });
    }
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
