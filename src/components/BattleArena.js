export default function BattleArena({ activeProject, activeUser }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{activeProject.name} — Battle Arena</h2>
          <p>This arena is reserved for turn-based battles, with real-time support added later.</p>
        </div>
      </div>

      <div className="status-grid status-list">
        <div className="status-column">
          <h3>Battle Preview</h3>
          <p>Placeholder area for future multiplayer combat, socket synchronization, and battle rounds.</p>
          <p>
            Each player character can be sent into a battle and the arena will eventually sync actions across
            devices.
          </p>
        </div>
      </div>

      <div className="status-grid">
        <div className="status-column">
          <h3>Your party</h3>
          <div className="empty-state">Player character roster will appear here.</div>
        </div>
        <div className="status-column">
          <h3>Opponent</h3>
          <div className="empty-state">Opponent slots and battle details will appear here.</div>
        </div>
      </div>
    </section>
  );
}
