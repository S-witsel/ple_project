export async function fetchUserDetails(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }
    return response.json();
  } catch (error) {
    console.warn('API fetchUserDetails failed', error);
    return null;
  }
}

export async function createTeam(name, ownerId) {
  try {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ownerId }),
    });
    if (!response.ok) {
      throw new Error('Failed to create team');
    }
    return response.json();
  } catch (error) {
    console.warn('API createTeam failed', error);
    return null;
  }
}

export async function fetchInviteCode(teamId, userId) {
  try {
    const response = await fetch(`/api/teams/${teamId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch invite code');
    }
    return response.json();
  } catch (error) {
    console.warn('API fetchInviteCode failed', error);
    return null;
  }
}

export async function joinTeamWithInvite(userId, code) {
  try {
    const response = await fetch('/api/teams/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code }),
    });
    if (!response.ok) {
      throw new Error('Failed to join team');
    }
    return response.json();
  } catch (error) {
    console.warn('API joinTeamWithInvite failed', error);
    return null;
  }
}

export async function fetchTeamMembers(teamId) {
  try {
    const response = await fetch(`/api/teams/${teamId}/members`);
    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }
    return response.json();
  } catch (error) {
    console.warn('API fetchTeamMembers failed', error);
    return null;
  }
}

export async function leaveTeam(teamId, userId) {
  try {
    const response = await fetch(`/api/teams/${teamId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to leave team');
    }
    return response.json();
  } catch (error) {
    console.warn('API leaveTeam failed', error);
    return null;
  }
}

export async function createProject(teamId, name) {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, name }),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  } catch (error) {
    console.warn('API createProject failed', error);
    return null;
  }
}

export async function createTasklist(projectId, name) {
  try {
    const response = await fetch('/api/tasklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, name }),
    });
    if (!response.ok) {
      throw new Error('Failed to create tasklist');
    }
    return response.json();
  } catch (error) {
    console.warn('API createTasklist failed', error);
    return null;
  }
}

export async function renameTasklist(tasklistId, name) {
  try {
    const response = await fetch(`/api/tasklists/${tasklistId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error('Failed to rename tasklist');
    }
    return response.json();
  } catch (error) {
    console.warn('API renameTasklist failed', error);
    return null;
  }
}

export async function deleteTasklist(tasklistId) {
  try {
    const response = await fetch(`/api/tasklists/${tasklistId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete tasklist');
    }
    return response.json();
  } catch (error) {
    console.warn('API deleteTasklist failed', error);
    return null;
  }
}

export async function createTask(tasklistId, title, description, status) {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasklistId, title, description, status }),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return response.json();
  } catch (error) {
    console.warn('API createTask failed', error);
    return null;
  }
}

export async function updateTask(taskId, title, description, status) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return response.json();
  } catch (error) {
    console.warn('API updateTask failed', error);
    return null;
  }
}

export async function deleteTask(taskId) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    return response.json();
  } catch (error) {
    console.warn('API deleteTask failed', error);
    return null;
  }
}

export async function fetchCharacterBuild(userId, projectId) {
  try {
    const response = await fetch(`/api/character/${userId}/${projectId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to load character build');
    return response.json();
  } catch (error) {
    console.warn('API fetchCharacterBuild failed', error);
    return null;
  }
}

export async function saveCharacterBuild(userId, projectId, character) {
  try {
    const response = await fetch(`/api/character/${userId}/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(character),
    });
    if (!response.ok) {
      throw new Error('Failed to save character build');
    }
    return response.json();
  } catch (error) {
    console.warn('API saveCharacterBuild failed', error);
    return null;
  }
}

export async function syncBattleAction(projectId, payload) {
  try {
    const response = await fetch(`/api/battle/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to sync battle action');
    }
    return response.json();
  } catch (error) {
    console.warn('API syncBattleAction failed', error);
    return null;
  }
}
