import { useMemo, useState } from 'react';
import './App.css';
import UserPicker from './components/UserPicker';
import TeamPicker from './components/TeamPicker';
import ProjectPicker from './components/ProjectPicker';
import ProjectWorkspace from './components/ProjectWorkspace';

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

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setTaskModalTaskId('');
  };

  const saveModalTask = () => {
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
      closeTaskModal();
    }
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
          <UserPicker
            users={data.users}
            onSelectUser={(userId) => {
              setSelectedUserId(userId);
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
