import TaskModal from './TaskModal';

export default function TasklistStage({
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
  setTaskModalTitle,
  setTaskModalDescription,
  setTaskModalStatus,
  onModalClose,
  onModalSave,
  onModalDelete,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{activeProject.name}</h2>
          <p>
            {activeUser.name} / {activeTeam.name}
          </p>
        </div>
        <button className="secondary-button" onClick={resetToProject}>
          Change project
        </button>
      </div>

      <div className="tasklist-tabs">
        {tasklists.map((list) => (
          <div key={list.id} className="tab-item">
            <button
              className={list.id === activeTasklist?.id ? 'tab-button active' : 'tab-button'}
              onClick={() => onSelectTasklist(list.id)}
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

      <TaskModal
        open={taskModalOpen}
        mode={taskModalMode}
        title={taskModalTitle}
        description={taskModalDescription}
        status={taskModalStatus}
        statusOrder={statusOrder}
        onTitleChange={setTaskModalTitle}
        onDescriptionChange={setTaskModalDescription}
        onStatusChange={setTaskModalStatus}
        onClose={onModalClose}
        onSave={onModalSave}
        onDelete={onModalDelete}
      />
    </section>
  );
}
