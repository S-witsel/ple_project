import { useMemo, useState } from 'react';
import './App.css';
import UserPicker from './components/UserPicker';
import TeamPicker from './components/TeamPicker';
import ProjectPicker from './components/ProjectPicker';
import ProjectWorkspace from './components/ProjectWorkspace';
import {
  fetchUserDetails,
  createTeam as apiCreateTeam,
  fetchInviteCode,
  joinTeamWithInvite,
  leaveTeam as apiLeaveTeam,
  createProject as apiCreateProject,
  createTasklist as apiCreateTasklist,
  renameTasklist as apiRenameTasklist,
  deleteTasklist as apiDeleteTasklist,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from './services/api';

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

  const loadUserData = async (userId) => {
    const payload = await fetchUserDetails(userId);
    if (payload && payload.ok) {
      setData({ users: [payload.user], teams: payload.teams, projects: payload.projects });
      return payload;
    }
    return null;
  };

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

  const getTeamInviteCode = async (teamId) => {
    if (!activeUser) return null;
    const response = await fetchInviteCode(teamId, activeUser.id);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not generate invite code.');
      return null;
    }
    return response.code;
  };

  const joinByInviteCode = async (code) => {
    if (!activeUser) return;
    const response = await joinTeamWithInvite(activeUser.id, code);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not join team.');
      return;
    }

    const payload = await loadUserData(activeUser.id);
    if (payload) {
      setSelectedTeamId(response.teamId);
      setSelectedProjectId('');
      setSelectedTasklistId('');
    }
  };

  const leaveTeam = async (teamId) => {
    if (!activeUser) return;
    const confirmed = window.confirm('Leave this team? You can rejoin later with an invite code.');
    if (!confirmed) return;

    const response = await apiLeaveTeam(teamId, activeUser.id);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not leave team.');
      return;
    }

    await loadUserData(activeUser.id);
    if (teamId === selectedTeamId) {
      setSelectedTeamId('');
      setSelectedProjectId('');
      setSelectedTasklistId('');
    }
  };

  const deleteAccount = async () => {
    if (!activeUser) return;
    const confirmed = window.confirm(`Delete account ${activeUser.name}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/users/${activeUser.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        resetBelow('login');
      } else {
        alert(data.error || data.message || 'Could not delete account.');
      }
    } catch (err) {
      alert('Could not delete account.');
    }
  };

  const createTeam = async () => {
    const name = newTeamName.trim();
    if (!name || !activeUser) return;

    const response = await apiCreateTeam(name, activeUser.id);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not create team.');
      return;
    }

    await loadUserData(activeUser.id);
    setSelectedTeamId(response.team.id);
    setSelectedProjectId('');
    setSelectedTasklistId('');
    setNewTeamName('');
    setShowTeamForm(false);
  };

  const createProject = async () => {
    const name = newProjectName.trim();
    if (!name || !activeTeam) return;

    const response = await apiCreateProject(activeTeam.id, name);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not create project.');
      return;
    }

    setData((current) => ({
      ...current,
      projects: [...current.projects, response.project],
    }));
    setSelectedProjectId(response.project.id);
    setSelectedTasklistId(response.project.tasklists[0]?.id || '');
    setNewProjectName('');
    setShowProjectForm(false);
  };

  const createTasklist = async () => {
    const name = newTasklistName.trim();
    if (!name || !activeProject) return;

    const response = await apiCreateTasklist(activeProject.id, name);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not create tasklist.');
      return;
    }

    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id !== activeProject.id
          ? project
          : {
              ...project,
              tasklists: [...project.tasklists, { ...response.tasklist, tasks: [] }],
            }
      ),
    }));
    setSelectedTasklistId(response.tasklist.id);
    setNewTasklistName('');
    setShowTasklistForm(false);
  };

  const openTaskModal = (mode, status = 'to do', task = null) => {
    setTaskModalMode(mode);
    setTaskModalStatus(status);
    setTaskModalTitle(task?.title ?? '');
    setTaskModalDescription(task?.description ?? '');
    setTaskModalTaskId(task?.id ?? '');
    setTaskModalOpen(true);
  };

  const addTask = async ({ title, description, status = 'to do' }) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !activeProject || !activeTasklist) return;

    const response = await apiCreateTask(activeTasklist.id, trimmedTitle, description, status);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not create task.');
      return;
    }

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
                      tasks: [...list.tasks, response.task],
                    }
              ),
            }
      ),
    }));

    setTaskModalOpen(false);
    setTaskModalTaskId('');
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setTaskModalTaskId('');
  };

  const saveModalTask = async () => {
    if (taskModalMode === 'create') {
      await addTask({
        title: taskModalTitle,
        description: taskModalDescription,
        status: taskModalStatus,
      });
    } else {
      await updateTask(taskModalTaskId, {
        title: taskModalTitle,
        description: taskModalDescription,
        status: taskModalStatus,
      });
      closeTaskModal();
    }
  };

  const updateTask = async (taskId, updates) => {
    if (!activeProject || !activeTasklist) return;
    const response = await apiUpdateTask(taskId, updates.title, updates.description, updates.status);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not update task.');
      return;
    }

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

  const deleteTask = async (taskId) => {
    if (!activeProject || !activeTasklist) return;
    const response = await apiDeleteTask(taskId);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not delete task.');
      return;
    }

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

  const deleteTasklist = async (tasklistId) => {
    if (!activeProject) return;
    const response = await apiDeleteTasklist(tasklistId);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not delete tasklist.');
      return;
    }

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

  const editTasklistName = async (tasklistId, name) => {
    if (!activeProject) return;
    const response = await apiRenameTasklist(tasklistId, name);
    if (!response || !response.ok) {
      alert(response?.error || response?.message || 'Could not rename tasklist.');
      return;
    }

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

  const taskModalOriginal = useMemo(() => {
    if (taskModalMode !== 'edit' || !taskModalTaskId) return null;
    return activeTasklist?.tasks?.find((task) => task.id === taskModalTaskId) ?? null;
  }, [activeTasklist, taskModalMode, taskModalTaskId]);

  const taskModalDirty = useMemo(() => {
    if (!taskModalOpen) return false;
    if (taskModalMode === 'create') {
      return (
        taskModalTitle.trim() !== '' ||
        taskModalDescription.trim() !== '' ||
        taskModalStatus !== statusOrder[1]
      );
    }

    if (!taskModalOriginal) return false;
    return (
      taskModalTitle !== taskModalOriginal.title ||
      (taskModalDescription ?? '') !== (taskModalOriginal.description ?? '') ||
      taskModalStatus !== taskModalOriginal.status
    );
  }, [taskModalOpen, taskModalMode, taskModalTitle, taskModalDescription, taskModalStatus, taskModalOriginal]);

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
          <button className={`link-button ${stage === 'login' ? 'active' : ''}`} onClick={() => resetBelow('login')}>
            Login
          </button>
          <span> / </span>
          <button
            className={`link-button ${stage === 'team' ? 'active' : ''}`}
            disabled={!activeUser}
            onClick={() => resetBelow('team')}
          >
            Teams
          </button>
          <span> / </span>
          <button
            className={`link-button ${stage === 'project' ? 'active' : ''}`}
            disabled={!activeTeam}
            onClick={() => resetBelow('project')}
          >
            Projects
          </button>
          <span> / </span>
          <button className={`link-button ${stage === 'tasklist' ? 'active' : ''}`} disabled={!activeProject}>
            Tasklists
          </button>
          {activeUser && (
            <button
              type="button"
              className="secondary-button"
              style={{ marginLeft: 16 }}
              onClick={deleteAccount}
            >
              Delete account
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {stage === 'login' && (
          <UserPicker
            onSelectUser={async (user) => {
              const payload = await loadUserData(user.id);
              if (!payload) return;
              setSelectedUserId(payload.user.id);
              setSelectedTeamId('');
              setSelectedProjectId('');
              setSelectedTasklistId('');
            }}
          />
        )}

        {stage === 'team' && (
          <TeamPicker
            activeUser={activeUser}
            userTeams={userTeams}
            showTeamForm={showTeamForm}
            toggleTeamForm={() => setShowTeamForm((current) => !current)}
            newTeamName={newTeamName}
            setNewTeamName={setNewTeamName}
            createTeam={createTeam}
            onSelectTeam={(teamId) => {
              setSelectedTeamId(teamId);
              setSelectedProjectId('');
              setSelectedTasklistId('');
            }}
            getTeamInviteCode={getTeamInviteCode}
            joinByInviteCode={joinByInviteCode}
            leaveTeam={leaveTeam}
          />
        )}

        {stage === 'project' && (
          <ProjectPicker
            activeUser={activeUser}
            activeTeam={activeTeam}
            teamProjects={teamProjects}
            showProjectForm={showProjectForm}
            toggleProjectForm={() => setShowProjectForm((current) => !current)}
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
            createProject={createProject}
            onSelectProject={(projectId) => {
              setSelectedProjectId(projectId);
              setSelectedTasklistId(
                data.projects.find((project) => project.id === projectId)?.tasklists[0]?.id ?? ''
              );
            }}
          />
        )}

        {stage === 'tasklist' && activeProject && (
          <ProjectWorkspace
            activeProject={activeProject}
            activeUser={activeUser}
            activeTeam={activeTeam}
            tasklists={tasklists}
            activeTasklist={activeTasklist}
            tasklistMenuId={tasklistMenuId}
            setTasklistMenuId={setTasklistMenuId}
            tasklistMenuName={tasklistMenuName}
            setTasklistMenuName={setTasklistMenuName}
            showTasklistForm={showTasklistForm}
            setShowTasklistForm={setShowTasklistForm}
            newTasklistName={newTasklistName}
            setNewTasklistName={setNewTasklistName}
            createTasklist={createTasklist}
            onSelectTasklist={setSelectedTasklistId}
            openTaskModal={openTaskModal}
            groupedTasks={groupedTasks}
            statusOrder={statusOrder}
            editTasklistName={editTasklistName}
            deleteTasklist={deleteTasklist}
            resetToProject={() => resetBelow('project')}
            taskModalOpen={taskModalOpen}
            taskModalMode={taskModalMode}
            taskModalTitle={taskModalTitle}
            taskModalDescription={taskModalDescription}
            taskModalStatus={taskModalStatus}
            taskModalDirty={taskModalDirty}
            setTaskModalTitle={setTaskModalTitle}
            setTaskModalDescription={setTaskModalDescription}
            setTaskModalStatus={setTaskModalStatus}
            onModalClose={closeTaskModal}
            onModalSave={saveModalTask}
            onModalDelete={() => deleteTask(taskModalTaskId)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
