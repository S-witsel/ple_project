export default function ProjectPicker({
  activeUser,
  activeTeam,
  teamProjects,
  showProjectForm,
  toggleProjectForm,
  newProjectName,
  setNewProjectName,
  createProject,
  onSelectProject,
}) {
  return (
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
            onClick={() => onSelectProject(project.id)}
          >
            {project.name}
          </button>
        ))}
      </div>

      <div className="form-card">
        <h3>Create a new project</h3>
        <button className="secondary-button" onClick={toggleProjectForm}>
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
  );
}
