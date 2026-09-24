import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { saveUser, clearUser } from '../../utils/auth';

const inputCls =
  'w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-smooth';

const Field = ({ icon, type, name, value, onChange, placeholder, label }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <div className="relative">
      <Icon
        name={icon}
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  </div>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [tab, setTab] = useState(location.state?.tab === 'register' ? 'register' : 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [login, setLogin] = useState({ email: '', password: '' });
  const [reg, setReg] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirm: ''
  });

  const handleLoginChange = (e) => {
    setLogin((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };
  const handleRegChange = (e) => {
    setReg((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!login.email || !login.password) return setError('Please enter email and password.');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // Check if registered user exists
    const stored = localStorage.getItem('pv_users');
    const users = stored ? JSON.parse(stored) : [];
    const found = users.find((u) => u.email === login.email && u.password === login.password);
    if (!found && users.length > 0 && users.find((u) => u.email === login.email)) {
      setLoading(false);
      return setError('Incorrect password.');
    }
    // If no registered users or user not found, allow login with email (guest-like)
    const userData = found || {
      email: login.email,
      name: login.email.split('@')[0],
      phone: '',
      location: '',
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      totalSavings: '0',
      dealsFound: 0,
      watchlistItems: 0
    };
    saveUser(userData);
    setLoading(false);
    navigate(from, { replace: true });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!reg.name || !reg.email || !reg.password)
      return setError('Name, email and password are required.');
    if (reg.password.length < 6) return setError('Password must be at least 6 characters.');
    if (reg.password !== reg.confirm) return setError('Passwords do not match.');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const stored = localStorage.getItem('pv_users');
    const users = stored ? JSON.parse(stored) : [];
    if (users.find((u) => u.email === reg.email)) {
      setLoading(false);
      return setError('An account with this email already exists.');
    }
    const newUser = {
      email: reg.email,
      name: reg.name,
      phone: reg.phone,
      location: reg.location,
      password: reg.password,
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      totalSavings: '0',
      dealsFound: 0,
      watchlistItems: 0
    };
    users.push(newUser);
    localStorage.setItem('pv_users', JSON.stringify(users));
    saveUser(newUser);
    setLoading(false);
    setSuccess('Account created! Redirecting...');
    setTimeout(() => navigate(from, { replace: true }), 800);
  };

  const handleGuest = () => {
    clearUser();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="Zap" size={28} color="white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Price Vision AI Pro</h1>
          <p className="text-sm text-muted-foreground mt-1">Smart shopping, smarter savings</p>
        </div>

        <div className="glassmorphism border border-border rounded-2xl shadow-elevated overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-smooth capitalize ${tab === t ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field
                  icon="Mail"
                  type="email"
                  name="email"
                  value={login.email}
                  onChange={handleLoginChange}
                  placeholder="you@example.com"
                  label="Email"
                />
                <Field
                  icon="Lock"
                  type="password"
                  name="password"
                  value={login.password}
                  onChange={handleLoginChange}
                  placeholder="••••••••"
                  label="Password"
                />
                {error && (
                  <p className="text-sm text-error flex items-center gap-1.5">
                    <Icon name="AlertCircle" size={14} />
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="LogIn" size={16} />
                  )}
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <Field
                  icon="User"
                  type="text"
                  name="name"
                  value={reg.name}
                  onChange={handleRegChange}
                  placeholder="Your full name"
                  label="Full Name *"
                />
                <Field
                  icon="Mail"
                  type="email"
                  name="email"
                  value={reg.email}
                  onChange={handleRegChange}
                  placeholder="you@example.com"
                  label="Email *"
                />
                <Field
                  icon="Phone"
                  type="tel"
                  name="phone"
                  value={reg.phone}
                  onChange={handleRegChange}
                  placeholder="+91 98765 43210"
                  label="Phone (optional)"
                />
                <Field
                  icon="MapPin"
                  type="text"
                  name="location"
                  value={reg.location}
                  onChange={handleRegChange}
                  placeholder="City, State"
                  label="Location (optional)"
                />
                <Field
                  icon="Lock"
                  type="password"
                  name="password"
                  value={reg.password}
                  onChange={handleRegChange}
                  placeholder="Min 6 characters"
                  label="Password *"
                />
                <Field
                  icon="ShieldCheck"
                  type="password"
                  name="confirm"
                  value={reg.confirm}
                  onChange={handleRegChange}
                  placeholder="Repeat password"
                  label="Confirm Password *"
                />
                {error && (
                  <p className="text-sm text-error flex items-center gap-1.5">
                    <Icon name="AlertCircle" size={14} />
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-sm text-success flex items-center gap-1.5">
                    <Icon name="CheckCircle" size={14} />
                    {success}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="UserPlus" size={16} />
                  )}
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            )}

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface text-xs text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGuest}
              className="w-full border border-border text-foreground hover:bg-muted py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Icon name="UserX" size={16} />
              Continue as Guest
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Login is optional — all features work as guest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
