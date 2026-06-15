const { query, pool } = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Clearing existing data...');
    // Clear content in dependency order
    await query('DELETE FROM characters');
    await query('DELETE FROM tasks');
    await query('DELETE FROM tasklists');
    await query('DELETE FROM projects');
    await query('DELETE FROM team_invites');
    await query('DELETE FROM team_members');
    await query('DELETE FROM teams');
    await query('DELETE FROM users');

    console.log('Inserting test user, team, project, and sample content...');
    const userId = 'u_test';
    const userName = 'testuser';
    const passwordHash = bcrypt.hashSync('password', 10);
    await query('INSERT INTO users (id, name, password) VALUES ($1,$2,$3)', [userId, userName, passwordHash]);

    const teamId = 't_test';
    const teamName = 'Test Team';
    await query('INSERT INTO teams (id, name) VALUES ($1,$2)', [teamId, teamName]);

    await query('INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,$3)', [teamId, userId, 'owner']);

    const projectId = 'p_test';
    const projectName = 'Test Project';
    await query('INSERT INTO projects (id, name, team_id) VALUES ($1,$2,$3)', [projectId, projectName, teamId]);

    const tasklistId = 'l_test';
    await query('INSERT INTO tasklists (id, project_id, name) VALUES ($1,$2,$3)', [tasklistId, projectId, 'Backlog']);

    await query(
      'INSERT INTO tasks (id, tasklist_id, title, description, status) VALUES ($1,$2,$3,$4,$5)',
      ['task_test', tasklistId, 'Demo task', 'This task was created by the seed script.', 'to do']
    );

    const stats = { hp: 10, mp: 5, level: 1 };
    const abilities = [];
    const equipment = [];
    const inventory = [];

    await query(
      'INSERT INTO characters (user_id, project_id, stats, abilities, equipment, inventory) VALUES ($1,$2,$3,$4,$5,$6)',
      [userId, projectId, stats, abilities, equipment, inventory]
    );

    // Create a second user who can later join the team
    const userId2 = 'u_test2';
    const userName2 = 'testuser2';
    const passwordHash2 = bcrypt.hashSync('password', 10);
    await query('INSERT INTO users (id, name, password) VALUES ($1,$2,$3)', [userId2, userName2, passwordHash2]);

    // Insert a reusable invite code for the team so the second user can join immediately
    try {
      const inviteCode = 'TESTINV1';
      await query('INSERT INTO team_invites (team_id, code, active) VALUES ($1,$2,true)', [teamId, inviteCode]);
      console.log('Inserted invite code:', inviteCode);
    } catch (err) {
      console.warn('Could not insert invite code (table may be missing or code exists):', err.message);
    }

    console.log('Seed complete: user=testuser (password="password"), user2=testuser2, team=Test Team, project=Test Project');
  } catch (err) {
    console.error('Seed error', err);
  } finally {
    await pool.end();
  }
}

seed();
