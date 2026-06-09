export default function TeamPicker({
  activeUser,
  userTeams,
  showTeamForm,
  toggleTeamForm,
  newTeamName,
  setNewTeamName,
  createTeam,
  onSelectTeam,
}) {
  return (
    <section className="panel">
      <h2>Choose a team</h2>
      <p>
        Signed in as <strong>{activeUser.name}</strong>.
      </p>
      <div className="card-grid">
        {userTeams.map((team) => (
          <button
            key={team.id}
            className="select-card"
            onClick={() => onSelectTeam(team.id)}
          >
            {team.name}
          </button>
        ))}
      </div>

      <div className="form-card">
        <h3>Create a new team</h3>
        <button className="secondary-button" onClick={toggleTeamForm}>
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
  );
}
