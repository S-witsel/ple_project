import { useEffect, useMemo, useState } from 'react';
import TasklistStage from './TasklistStage';
import CharacterSheet from './CharacterSheet';
import BattleArena from './BattleArena';
import {
  acquireAbility,
  acquireEquipment,
  equipAbility,
  equipEquipment,
  getAvailableAbilities,
  getAvailableEquipment,
  getPlayerCharacter,
  calculateCharacterStats,
} from '../services/gameService';

export default function ProjectWorkspace({
  activeProject,
  activeUser,
  activeTeam,
  tasklists,
  activeTasklist,
  tasklistMenuId,
  setTasklistMenuId,
  tasklistMenuName,
  setTasklistMenuName,
  showTasklistForm,
  setShowTasklistForm,
  newTasklistName,
  setNewTasklistName,
  createTasklist,
  onSelectTasklist,
  openTaskModal,
  groupedTasks,
  statusOrder,
  editTasklistName,
  deleteTasklist,
  resetToProject,
  taskModalOpen,
  taskModalMode,
  taskModalTitle,
  taskModalDescription,
  taskModalStatus,
  taskModalDirty,
  setTaskModalTitle,
  setTaskModalDescription,
  setTaskModalStatus,
  onModalClose,
  onModalSave,
  onModalDelete,
}) {
  const [activeView, setActiveView] = useState('tasklist');
  const [playerCharacter, setPlayerCharacter] = useState(() =>
    getPlayerCharacter(activeUser.id, activeProject.id)
  );

  useEffect(() => {
    setPlayerCharacter(getPlayerCharacter(activeUser.id, activeProject.id));
  }, [activeUser.id, activeProject.id]);

  const availableAbilities = useMemo(() => getAvailableAbilities(), []);
  const availableEquipment = useMemo(() => getAvailableEquipment(), []);
  const computedStats = useMemo(() => calculateCharacterStats(playerCharacter), [playerCharacter]);

  const handleEquipAbility = (slotIndex, abilityId) => {
    if (abilityId === null || abilityId === '') {
      setPlayerCharacter(equipAbility(activeUser.id, activeProject.id, slotIndex, null));
      return;
    }
    setPlayerCharacter(equipAbility(activeUser.id, activeProject.id, slotIndex, abilityId));
  };

  const handleEquipEquipment = (slotKey, equipmentId) => {
    if (equipmentId === null || equipmentId === '') {
      setPlayerCharacter(equipEquipment(activeUser.id, activeProject.id, slotKey, null));
      return;
    }
    setPlayerCharacter(equipEquipment(activeUser.id, activeProject.id, slotKey, equipmentId));
  };

  const handleAcquireAbility = (abilityId) => {
    setPlayerCharacter(acquireAbility(activeUser.id, activeProject.id, abilityId));
  };

  const handleAcquireEquipment = (equipmentId) => {
    setPlayerCharacter(acquireEquipment(activeUser.id, activeProject.id, equipmentId));
  };

  return (
    <div>
      <div className="tasklist-tabs">
        <button
          className={activeView === 'tasklist' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveView('tasklist')}
        >
          Tasklist
        </button>
        <button
          className={activeView === 'character' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveView('character')}
        >
          Character Sheet
        </button>
        <button
          className={activeView === 'arena' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveView('arena')}
        >
          Battle Arena
        </button>
      </div>

      {activeView === 'tasklist' && (
        <TasklistStage
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
          onSelectTasklist={onSelectTasklist}
          openTaskModal={openTaskModal}
          groupedTasks={groupedTasks}
          statusOrder={statusOrder}
          editTasklistName={editTasklistName}
          deleteTasklist={deleteTasklist}
          resetToProject={resetToProject}
          taskModalOpen={taskModalOpen}
          taskModalMode={taskModalMode}
          taskModalTitle={taskModalTitle}
          taskModalDescription={taskModalDescription}
          taskModalStatus={taskModalStatus}
          taskModalDirty={taskModalDirty}
          setTaskModalTitle={setTaskModalTitle}
          setTaskModalDescription={setTaskModalDescription}
          setTaskModalStatus={setTaskModalStatus}
          onModalClose={onModalClose}
          onModalSave={onModalSave}
          onModalDelete={onModalDelete}
        />
      )}

      {activeView === 'character' && (
        <CharacterSheet
          activeUser={activeUser}
          activeProject={activeProject}
          character={{ ...playerCharacter, stats: computedStats }}
          availableAbilities={availableAbilities}
          availableEquipment={availableEquipment}
          onEquipAbility={handleEquipAbility}
          onEquipEquipment={handleEquipEquipment}
          onAcquireAbility={handleAcquireAbility}
          onAcquireEquipment={handleAcquireEquipment}
        />
      )}

      {activeView === 'arena' && (
        <BattleArena activeProject={activeProject} activeUser={activeUser} />
      )}
    </div>
  );
}
