import { useState } from 'react';

export default function UserPicker({ onSelectUser }) {
  const [page, setPage] = useState('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async () => {
    if (!name || !password) {
      setError('Enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (data.ok) {
        onSelectUser(data.user);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createAccount = async () => {
    if (!name || !password) {
      setError('Enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (data.ok) {
        onSelectUser(data.user);
      } else {
        setError(data.error || data.message || 'Could not create account.');
      }
    } catch (err) {
      setError('Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPage = (target) => {
    setError('');
    setPage(target);
    setName('');
    setPassword('');
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (page === 'login') {
      await login();
    } else {
      await createAccount();
    }
  };

  return (
    <section className="panel">
      <h2>{page === 'login' ? 'Login' : 'Create account'}</h2>

      {error && <div className="unsaved-alert">{error}</div>}

      <form className="form-card" onSubmit={submitForm}>
        <label>
          Username
          <input
            className="input-field"
            placeholder="Username"
            autoComplete="username"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
          />
        </label>

        <label>
          Password
          <input
            className="input-field"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
          />
        </label>

        <div className="action-row">
          <button type="submit" className="primary-button" disabled={isSubmitting || !name || !password}>
            {isSubmitting ? (page === 'login' ? 'Logging in...' : 'Creating...') : page === 'login' ? 'Login' : 'Create account'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => goToPage(page === 'login' ? 'create' : 'login')}
            disabled={isSubmitting}
          >
            {page === 'login' ? 'Create new account' : 'Back to login'}
          </button>
        </div>
      </form>
    </section>
  );
}
