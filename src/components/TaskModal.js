export default function TaskModal({
  open,
  mode,
  title,
  description,
  status,
  statusOrder,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onClose,
  onSave,
  onDelete,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{mode === 'create' ? 'Create task' : 'Task details'}</h3>
          <button
            type="button"
            className="icon-button small"
            onClick={onClose}
            aria-label="Close task modal"
          >
            ×
          </button>
        </div>

        <label>
          Title
          <input
            className="input-field"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            className="input-field"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </label>

        <label>
          Status
          <select
            className="select-field"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {statusOrder.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="action-row">
          <button type="button" className="primary-button" onClick={onSave}>
            {mode === 'create' ? 'Create task' : 'Save changes'}
          </button>
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          {mode === 'edit' && onDelete && (
            <button type="button" className="secondary-button danger" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
