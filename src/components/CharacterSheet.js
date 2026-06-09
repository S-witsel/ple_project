import { useMemo } from 'react';

export default function CharacterSheet({
  activeUser,
  activeProject,
  character,
  availableAbilities,
  availableEquipment,
  onEquipAbility,
  onEquipEquipment,
  onAcquireAbility,
  onAcquireEquipment,
}) {
  const ownedAbilities = useMemo(
    () => availableAbilities.filter((ability) => character.inventory.abilities.includes(ability.id)),
    [availableAbilities, character.inventory.abilities]
  );

  const ownedEquipment = useMemo(
    () => availableEquipment.filter((item) => character.inventory.equipment.includes(item.id)),
    [availableEquipment, character.inventory.equipment]
  );

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{activeProject.name} — Character Sheet</h2>
          <p>{activeUser.name} can tune their build here.</p>
        </div>
      </div>

      <div className="status-grid status-list">
        <div className="status-column">
          <h3>Stats</h3>
          <ul>
            {Object.entries(character.stats).map(([key, value]) => (
              <li key={key}>
                <strong>{key}</strong>: {value}
              </li>
            ))}
          </ul>
        </div>

        <div className="status-column">
          <h3>Ability Slots</h3>
          {character.abilities.map((abilityId, index) => (
            <div key={index} className="task-card">
              <div>
                <strong>Slot {index + 1}</strong>
                <div>{abilityId || 'Empty'}</div>
              </div>
              <label>
                Choose ability
                <select
                  className="select-field"
                  value={abilityId || ''}
                  onChange={(e) => onEquipAbility(index, e.target.value || null)}
                >
                  <option value="">Empty</option>
                  {ownedAbilities.map((ability) => (
                    <option key={ability.id} value={ability.id}>
                      {ability.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>

        <div className="status-column">
          <h3>Equipment Slots</h3>
          {Object.entries(character.equipment).map(([slot, equipmentId]) => (
            <div key={slot} className="task-card">
              <div>
                <strong>{slot}</strong>
                <div>{equipmentId || 'Empty'}</div>
              </div>
              <label>
                Choose equipment
                <select
                  className="select-field"
                  value={equipmentId || ''}
                  onChange={(e) => onEquipEquipment(slot, e.target.value || null)}
                >
                  <option value="">Empty</option>
                  {ownedEquipment
                    .filter((item) => item.slot === slot)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-header" style={{ marginTop: '24px' }}>
        <div>
          <h3>Collection</h3>
          <p>Choose from your collected abilities and equipment.</p>
        </div>
      </div>

      <div className="status-grid">
        <div className="status-column">
          <h3>Abilities</h3>
          {availableAbilities.map((ability) => (
            <div key={ability.id} className="task-card">
              <strong>{ability.name}</strong>
              <p>{ability.description}</p>
              <div>Type: {ability.type}</div>
              <div>Power: {ability.power}</div>
              <div className="action-row">
                <button
                  className="secondary-button"
                  onClick={() => onAcquireAbility(ability.id)}
                  disabled={character.inventory.abilities.includes(ability.id)}
                >
                  {character.inventory.abilities.includes(ability.id) ? 'Owned' : 'Acquire'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="status-column">
          <h3>Equipment</h3>
          {availableEquipment.map((item) => (
            <div key={item.id} className="task-card">
              <strong>{item.name}</strong>
              <p>{item.description}</p>
              <div>Slot: {item.slot}</div>
              <div>
                {Object.entries(item.stats).map(([stat, value]) => (
                  <div key={stat}>
                    {stat}: {value > 0 ? `+${value}` : value}
                  </div>
                ))}
              </div>
              <div className="action-row">
                <button
                  className="secondary-button"
                  onClick={() => onAcquireEquipment(item.id)}
                  disabled={character.inventory.equipment.includes(item.id)}
                >
                  {character.inventory.equipment.includes(item.id) ? 'Owned' : 'Acquire'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
