export async function fetchProjectData(projectId) {
  try {
    const response = await fetch(`/api/project/${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project data');
    }
    return response.json();
  } catch (error) {
    console.warn('API fetchProjectData failed', error);
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
