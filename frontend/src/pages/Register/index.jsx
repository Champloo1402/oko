import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authRegister } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { OkoLogo } from '../../components/Logo';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ username: '', email: '', password: '', displayName: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authRegister(form);
      login(data);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-oko-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link to="/"><OkoLogo size="lg" /></Link>
        </div>

        <div className="bg-oko-surface border border-oko-border rounded-xl p-8">
          <h1 className="text-lg font-semibold text-oko-text mb-6 text-center">Create your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Display name" type="text"     value={form.displayName} onChange={set('displayName')} placeholder="Jane Smith" />
            <Field label="Username"     type="text"     value={form.username}    onChange={set('username')}    placeholder="janesmith" />
            <Field label="Email"        type="email"    value={form.email}       onChange={set('email')}       placeholder="jane@example.com" />
            <Field label="Password"     type="password" value={form.password}    onChange={set('password')}    placeholder="••••••••" />

            {error && <p className="text-oko-red text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-oko-red hover:bg-oko-red-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-oko-subtle mt-4">
          Already a member?{' '}
          <Link to="/" className="text-oko-red hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-oko-muted mb-1.5">{label}</label>
      <input
        {...props}
        required
        className="w-full bg-oko-bg border border-oko-border rounded-md px-3 py-2 text-sm text-oko-text placeholder-oko-faint focus:outline-none focus:border-oko-red transition-colors"
      />
    </div>
  );
}
