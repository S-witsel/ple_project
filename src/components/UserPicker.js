export default function UserPicker({ users, onSelectUser }) {
  return (
    <section className="panel">
      <h2>Login as a user</h2>
      <div className="card-grid">
        {users.map((user) => (
          <button
            key={user.id}
            className="select-card"
            onClick={() => onSelectUser(user.id)}
          >
            {user.name}
          </button>
        ))}
      </div>
    </section>
  );
}
