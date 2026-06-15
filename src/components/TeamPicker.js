import { useState } from 'react';

export default function TeamPicker({
  activeUser,
  userTeams,
  showTeamForm,
  toggleTeamForm,
  newTeamName,
  setNewTeamName,
  createTeam,
  onSelectTeam,
  getTeamInviteCode,
  joinByInviteCode,
  leaveTeam,
}) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [modalError, setModalError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const openInviteModal = async (teamId) => {
    setInviteModalOpen(true);
    setInviteCode('');
    setModalError('');
    setIsGenerating(true);
    const code = await getTeamInviteCode(teamId);
    setIsGenerating(false);
    if (code) setInviteCode(code);
  };

  const handleJoinCode = async () => {
    if (!joinCode.trim()) {
      setModalError('Enter an invite code to join a team.');
      return;
    }
    setIsJoining(true);
    setModalError('');
    await joinByInviteCode(joinCode.trim());
    setIsJoining(false);
    setJoinCode('');
    setInviteModalOpen(false);
  };

  const handleCloseModal = () => {
    setInviteModalOpen(false);
    setInviteCode('');
    setJoinCode('');
    setModalError('');
  };

  return (
    <section className="panel">
      <h2>Choose a team</h2>
      <p>
        Signed in as <strong>{activeUser.name}</strong>.
      </p>
      <div className="card-grid">
        {userTeams.map((team) => (
          <div key={team.id}>
            <button
              className="select-card"
              onClick={() => onSelectTeam(team.id)}
            >
              {team.name}
            </button>
            <div className="action-row" style={{ marginTop: 8 }}>
              {team.role === 'owner' && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => openInviteModal(team.id)}
                >
                  Invite
                </button>
              )}
              <button
                type="button"
                className="secondary-button"
                onClick={() => leaveTeam(team.id)}
              >
                Leave
              </button>
            </div>
          </div>
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

      <div className="form-card" style={{ marginTop: 16 }}>
        <h3>Join a team</h3>
        <p>Enter a team invite code to join an existing team.</p>
        <div className="field-row">
          <input
            className="input-field"
            type="text"
            value={joinCode}
            placeholder="Invite code"
            onChange={(e) => {
              setJoinCode(e.target.value);
              if (modalError) setModalError('');
            }}
          />
          <button className="primary-button" onClick={handleJoinCode} disabled={isJoining}>
            {isJoining ? 'Joining…' : 'Join team'}
          </button>
        </div>
        {modalError && <div className="unsaved-alert" style={{ marginTop: 10 }}>{modalError}</div>}
      </div>

      {inviteModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Team invite code</h3>
                <p>Share this code with other users to give them access.</p>
              </div>
              <button type="button" className="icon-button small" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="field-row" style={{ flexDirection: 'column', gap: 12 }}>
              <input
                className="input-field"
                type="text"
                readOnly
                value={isGenerating ? 'Generating…' : inviteCode}
                placeholder="Invite code will appear here"
              />
              <button type="button" className="secondary-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
