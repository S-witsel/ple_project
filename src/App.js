import { useMemo, useState } from 'react';
import './App.css';

const initialData = {
  users: [
    { id: 'u1', name: 'Alex', teamIds: ['t1', 't2'] },
    { id: 'u2', name: 'Maya', teamIds: ['t2'] },
    { id: 'u3', name: 'Jordan', teamIds: ['t1'] },
  ],
  teams: [
    { id: 't1', name: 'Team Alpha' },
    { id: 't2', name: 'Team Bravo' },
  ],
  projects: [
    {
      id: 'p1',
      name: 'Website Redesign',
      teamId: 't1',
      tasklists: [
        {
          id: 'l1',
          name: 'Developers',
          tasks: [
            { id: 'task1', title: 'Build login page', status: 'in progress' },
            { id: 'task2', title: 'Connect API', status: 'to do' },
            { id: 'task3', title: 'Fix responsive layout', status: 'complete' },
          ],
        },
        {
          id: 'l2',
          name: 'Designers',
          tasks: [
            { id: 'task4', title: 'Create icon set', status: 'in review' },
            { id: 'task5', title: 'Update brand colors', status: 'on hold' },
          ],
        },
      ],
    },
    {
      id: 'p2',
      name: 'Mobile App Prototype',
      teamId: 't1',
      tasklists: [
        {
          id: 'l3',
          name: 'Developers',
          tasks: [
            { id: 'task6', title: 'Setup project shell', status: 'complete' },
            { id: 'task7', title: 'Implement auth flow', status: 'in progress' },
          ],
        },
        {
          id: 'l4',
          name: 'Artists',
          tasks: [
            { id: 'task8', title: 'Design splash screen', status: 'to do' },
            { id: 'task9', title: 'Produce illustrations', status: 'in progress' },
          ],
        },
      ],
    },
    {
      id: 'p3',
      name: 'Marketing Campaign',
      teamId: 't2',
      tasklists: [
        {
          id: 'l5',
          name: 'Content',
          tasks: [
            { id: 'task10', title: 'Write blog post', status: 'to do' },
            { id: 'task11', title: 'Review social copy', status: 'in review' },
          ],
        },
      ],
    },
  ],
};

const statusOrder = ['on hold', 'to do', 'in progress', 'in review', 'complete'];

function App() {
  const [data, setData] = useState(initialData);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTasklistId, setSelectedTasklistId] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newTasklistName, setNewTasklistName] = useState('');
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTasklistForm, setShowTasklistForm] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState('create');
  const [taskModalTaskId, setTaskModalTaskId] = useState('');
  const [taskModalTitle, setTaskModalTitle] = useState('');
  const [taskModalDescription, setTaskModalDescription] = useState('');
  const [taskModalStatus, setTaskModalStatus] = useState(statusOrder[1]);
  const [tasklistMenuId, setTasklistMenuId] = useState('');
  const [tasklistMenuName, setTasklistMenuName] = useState('');

  const activeUser = data.users.find((user) => user.id === selectedUserId);

  const userTeams = useMemo(() => {
    if (!activeUser) return [];
    return data.teams.filter((team) => activeUser.teamIds.includes(team.id));
  }, [activeUser, data.teams]);

  const activeTeam = data.teams.find((team) => team.id === selectedTeamId);
  const teamProjects = useMemo(() => {
    if (!activeTeam) return [];
    return data.projects.filter((project) => project.teamId === activeTeam.id);
  }, [activeTeam, data.projects]);

  const activeProject = data.projects.find((project) => project.id === selectedProjectId);
  const tasklists = activeProject?.tasklists ?? [];
  const activeTasklist = tasklists.find((list) => list.id === selectedTasklistId) || tasklists[0];

  const stage = !activeUser
    ? 'login'
    : !activeTeam
    ? 'team'
    : !activeProject
    ? 'project'
    : 'tasklist';

  const resetBelow = (level) => {
    if (level === 'login') {
      setSelectedUserId('');
      setSelectedTeamId('');
      setSelectedProjectId('');
      setSelectedTasklistId('');
    }
    if (level === 'team') {
      setSelectedTeamId('');
      setSelectedProjectId('');
      setSelectedTasklistId('');
    }
    if (level === 'project') {
      setSelectedProjectId('');
      setSelectedTasklistId('');
    }
    setShowTeamForm(false);
    setShowProjectForm(false);
    setShowTasklistForm(false);
    setTaskModalOpen(false);
    setTaskModalTaskId('');
  };

  const createTeam = () => {
    const name = newTeamName.trim();
    if (!name || !activeUser) return;

    const id = `t${Date.now()}`;
    setData((current) => ({
      ...current,
      teams: [...current.teams, { id, name }],
      users: current.users.map((user) =>
        user.id === activeUser.id
          ? { ...user, teamIds: [...user.teamIds, id] }
          : user
      ),
    }));
    setSelectedTeamId(id);
    setSelectedProjectId('');
    setSelectedTasklistId('');
    setNewTeamName('');
  };

  const createProject = () => {
    const name = newProjectName.trim();
    if (!name || !activeTeam) return;

    const projectId = `p${Date.now()}`;
    const tasklistId = `l${Date.now()}0`;
    const newProject = {
      id: projectId,
      name,
      teamId: activeTeam.id,
      tasklists: [{ id: tasklistId, name: 'General', tasks: [] }],
    };

    setData((current) => ({
      ...current,
      projects: [...current.projects, newProject],
    }));
    setSelectedProjectId(projectId);
    setSelectedTasklistId(tasklistId);
    setNewProjectName('');
  };

  const createTasklist = () => {
    const name = newTasklistName.trim();
    if (!name || !activeProject) return;

    const tasklistId = `l${Date.now()}`;
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id !== activeProject.id
          ? project
          : {
              ...project,
              tasklists: [...project.tasklists, { id: tasklistId, name, tasks: [] }],
            }
      ),
    }));
    setSelectedTasklistId(tasklistId);
    setNewTasklistName('');
  };

  const openTaskModal = (mode, status = 'to do', task = null) => {
    setTaskModalMode(mode);
    setTaskModalStatus(status);
    setTaskModalTitle(task?.title ?? '');
    setTaskModalDescription(task?.description ?? '');
    setTaskModalTaskId(task?.id ?? '');
    setTaskModalOpen(true);
  };

  const addTask = ({ title, description, status = 'to do' }) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !activeProject || !activeTasklist) return;

    const taskId = `task${Date.now()}`;
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id !== activeProject.id
          ? project
          : {
              ...project,
              tasklists: project.tasklists.map((list) =>
                list.id !== activeTasklist.id
                  ? list
                  : {
                      ...list,
                      tasks: [
                        ...list.tasks,
                        { id: taskId, title: trimmedTitle, description, status },
                      ],
                    }
              ),
            }
      ),
    }));

    setTaskModalOpen(false);
    setTaskModalTaskId('');
  };

  const updateTask = (taskId, updates) => {
    if (!activeProject || !activeTasklist) return;
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id !== activeProject.id
          ? project
          : {
              ...project,
              tasklists: project.tasklists.map((list) =>
                list.id !== activeTasklist.id
                  ? list
                  : {
                      ...list,
                      tasks: list.tasks.map((task) =>
                        task.id !== taskId ? task : { ...task, ...updates }
                      ),
                    }
              ),
            }
      ),
    }));
  };

  const deleteTask = (taskId) => {
    if (!activeProject || !activeTasklist) return;
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id !== activeProject.id
          ? project
          : {
              ...project,
              tasklists: project.tasklists.map((list) =>
                list.id !== activeTasklist.id
                  ? list
                  : {
                      ...list,
                      tasks: list.tasks.filter((task) => task.id !== taskId),
                    }
              ),
            }
      ),
    }));
    if (taskModalTaskId === taskId) {
      setTaskModalOpen(false);
      setTaskModalTaskId('');
    }
  };

  const deleteTasklist = (tasklistId) => {
    if (!activeProject) return;
    const remaining = activeProject.tasklists.filter((list) => list.id !== tasklistId);
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id !== activeProject.id
          ? project
          : {
              ...project,
              tasklists: remaining,
            }
      ),
    }));
    if (selectedTasklistId === tasklistId) {
      setSelectedTasklistId(remaining[0]?.id ?? '');
    }
  };

  const editTasklistName = (tasklistId, name) => {
    if (!activeProject) return;
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id !== activeProject.id
          ? project
          : {
              ...project,
              tasklists: project.tasklists.map((list) =>
                list.id !== tasklistId ? list : { ...list, name }
              ),
            }
      ),
    }));
    setTasklistMenuId('');
  };

  const groupedTasks = useMemo(() => {
    const groups = statusOrder.reduce((acc, status) => ({ ...acc, [status]: [] }), {});
    (activeTasklist?.tasks ?? []).forEach((task) => {
      if (!groups[task.status]) groups[task.status] = [];
      groups[task.status].push(task);
    });
    return groups;
  }, [activeTasklist]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Group Task Manager</h1>
          <p>Login, choose a team, select a project, and manage tasklists by role.</p>
        </div>
        <div className="breadcrumbs">
          <button className="link-button" onClick={() => resetBelow('login')}>
            Login
          </button>
          <span> / </span>
          <button
            className="link-button"
            disabled={!activeUser}
            onClick={() => resetBelow('team')}
          >
            Teams
          </button>
          <span> / </span>
          <button
            className="link-button"
            disabled={!activeTeam}
            onClick={() => resetBelow('project')}
          >
            Projects
          </button>
          <span> / </span>
          <button className="link-button" disabled={!activeProject}>
            Tasklists
          </button>
        </div>
      </header>

      <main className="app-main">
        {stage === 'login' && (
          <section className="panel">
            <h2>Login as a user</h2>
            <div className="card-grid">
              {data.users.map((user) => (
                <button
                  key={user.id}
                  className="select-card"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSelectedTeamId('');
                    setSelectedProjectId('');
                    setSelectedTasklistId('');
                  }}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {stage === 'team' && (
          <section className="panel">
            <h2>Choose a team</h2>
            <p>Signed in as <strong>{activeUser.name}</strong>.</p>
            <div className="card-grid">
              {userTeams.map((team) => (
                <button
                  key={team.id}
                  className="select-card"
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setSelectedProjectId('');
                    setSelectedTasklistId('');
                  }}
                >
                  {team.name}
                </button>
              ))}
            </div>

            <div className="form-card">
              <h3>Create a new team</h3>
              <button
                className="secondary-button"
                onClick={() => setShowTeamForm((current) => !current)}
              >
                {showTeamForm ? 'Cancel' : 'New team'}
              </button>
              {showTeamForm && (
                <div className="field-row">
                  <input
                    className="input-field"
                    type="text"
                    value={newTeamName}
                    placeholder="Team name"
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                  <button className="primary-button" onClick={createTeam}>
                    Create team
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {stage === 'project' && (
          <section className="panel">
            <h2>Pick a project</h2>
            <p>
              {activeUser.name} → <strong>{activeTeam.name}</strong>
            </p>
            <div className="card-grid">
              {teamProjects.map((project) => (
                <button
                  key={project.id}
                  className="select-card"
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSelectedTasklistId(project.tasklists[0]?.id ?? '');
                  }}
                >
                  {project.name}
                </button>
              ))}
            </div>

            <div className="form-card">
              <h3>Create a new project</h3>
              <button
                className="secondary-button"
                onClick={() => setShowProjectForm((current) => !current)}
              >
                {showProjectForm ? 'Cancel' : 'New project'}
              </button>
              {showProjectForm && (
                <div className="field-row">
                  <input
                    className="input-field"
                    type="text"
                    value={newProjectName}
                    placeholder="Project name"
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                  <button className="primary-button" onClick={createProject}>
                    Create project
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {stage === 'tasklist' && activeProject && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>{activeProject.name}</h2>
                <p>
                  {activeUser.name} / {activeTeam.name}
                </p>
              </div>
              <button className="secondary-button" onClick={() => resetBelow('project')}>
                Change project
              </button>
            </div>


            <div className="tasklist-tabs">
              {tasklists.map((list) => (
                <div key={list.id} className="tab-item">
                  <button
                    className={list.id === activeTasklist?.id ? 'tab-button active' : 'tab-button'}
                    onClick={() => setSelectedTasklistId(list.id)}
                  >
                    {list.name}
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Tasklist menu ${list.name}`}
                    onClick={() => {
                      setTasklistMenuId(tasklistMenuId === list.id ? '' : list.id);
                      setTasklistMenuName(list.name);
                    }}
                  >
                    ⋯
                  </button>
                  {tasklistMenuId === list.id && (
                    <div className="menu-popup">
                      <input
                        className="input-field"
                        value={tasklistMenuName}
                        onChange={(e) => setTasklistMenuName(e.target.value)}
                      />
                      <div className="action-row">
                        <button
                          className="primary-button"
                          onClick={() => editTasklistName(list.id, tasklistMenuName)}
                        >
                          Save
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            deleteTasklist(list.id);
                            setTasklistMenuId('');
                          }}
                        >
                          Delete
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => setTasklistMenuId('')}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="tab-item">
                <button
                  className="icon-button primary small"
                  aria-label="Add tasklist"
                  onClick={() => setShowTasklistForm((c) => !c)}
                >
                  +
                </button>
                {showTasklistForm && (
                  <div className="menu-popup">
                    <input
                      className="input-field"
                      type="text"
                      value={newTasklistName}
                      placeholder="Tasklist name"
                      onChange={(e) => setNewTasklistName(e.target.value)}
                    />
                    <div className="action-row">
                      <button className="primary-button" onClick={createTasklist}>
                        Add
                      </button>
                      <button className="secondary-button" onClick={() => setShowTasklistForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="status-grid">
              {statusOrder.map((status) => (
                <div key={status} className="status-column">
                  <div className="status-column-header">
                    <h3>{status}</h3>
                    <button
                      className="icon-button small"
                      onClick={() => openTaskModal('create', status)}
                      aria-label={`Add task to ${status}`}
                    >
                      +
                    </button>
                  </div>
                  {(groupedTasks[status] || []).map((task) => (
                    <button
                      key={task.id}
                      className="task-card"
                      onClick={() => openTaskModal('edit', task.status, task)}
                      aria-label={`Open details for ${task.title}`}
                    >
                      <strong>{task.title}</strong>
                    </button>
                  ))}
                  {(groupedTasks[status] || []).length === 0 && (
                    <div className="empty-state">No tasks</div>
                  )}
                </div>
              ))}
            </div>

            {taskModalOpen && (
              <div className="modal-backdrop" onClick={() => { setTaskModalOpen(false); setTaskModalTaskId(''); }}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{taskModalMode === 'create' ? 'Create task' : 'Task details'}</h3>
                    <button
                      className="icon-button small"
                      onClick={() => { setTaskModalOpen(false); setTaskModalTaskId(''); }}
                      aria-label="Close task modal"
                    >
                      ×
                    </button>
                  </div>
                  <label>
                    Title
                    <input
                      className="input-field"
                      value={taskModalTitle}
                      onChange={(e) => setTaskModalTitle(e.target.value)}
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      className="input-field"
                      value={taskModalDescription}
                      onChange={(e) => setTaskModalDescription(e.target.value)}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      className="select-field"
                      value={taskModalStatus}
                      onChange={(e) => setTaskModalStatus(e.target.value)}
                    >
                      {statusOrder.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="action-row">
                    <button
                      className="primary-button"
                      onClick={() => {
                        if (taskModalMode === 'create') {
                          addTask({
                            title: taskModalTitle,
                            description: taskModalDescription,
                            status: taskModalStatus,
                          });
                        } else {
                          updateTask(taskModalTaskId, {
                            title: taskModalTitle,
                            description: taskModalDescription,
                            status: taskModalStatus,
                          });
                          setTaskModalOpen(false);
                          setTaskModalTaskId('');
                        }
                      }}
                    >
                      {taskModalMode === 'create' ? 'Create task' : 'Save changes'}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => { setTaskModalOpen(false); setTaskModalTaskId(''); }}
                    >
                      Cancel
                    </button>
                    {taskModalMode === 'edit' && (
                      <button
                        className="secondary-button danger"
                        onClick={() => deleteTask(taskModalTaskId)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
