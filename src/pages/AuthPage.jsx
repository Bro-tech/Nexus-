import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Sparkles, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const formVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

const fieldVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Forgot Password: Step 1 — Enter Email ────────────────────────────────────
function ForgotEmailStep({ inputClass, onBack, onSuccess }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPassword(email);
      onSuccess(result); // { resetToken, email }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div key="forgot-email" variants={formVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }} className="w-full max-w-sm mx-auto">
      <motion.div variants={fieldVariants} className="mb-8">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-purple-500 text-xs font-semibold mb-5 transition-colors">
          <ArrowLeft size={13} /> Back to sign in
        </button>
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center mb-5 border border-purple-300/30 dark:border-purple-400/20">
          <Mail size={22} className="text-purple-500 dark:text-purple-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 tracking-tight">Forgot password?</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Enter the email you signed up with and we'll send you a reset link.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <motion.div variants={fieldVariants}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            className={inputClass(error)}
          />
          {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
        </motion.div>

        <motion.div variants={fieldVariants}>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(139,92,246,0.35)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-full py-3.5 rounded-xl gradient-vibrant text-white font-bold text-sm shadow-lg disabled:opacity-60 mt-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}

// ─── Forgot Password: Step 2 — Set New Password ───────────────────────────────
function ForgotNewPasswordStep({ resetData, inputClass, onSuccess }) {
  const { updateUserPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!/(?=.*[A-Z])(?=.*[!@#$&*]).{8,}/.test(password)) {
      e.password = 'Min 8 chars, 1 uppercase, 1 special character';
    }
    if (password !== confirm) e.confirm = 'Passwords do not match';
    if (Object.keys(e).length) { setErrors(e); return; }
    setIsLoading(true);
    try {
      await updateUserPassword(resetData.email, resetData.resetToken, password);
      onSuccess();
    } catch (err) {
      setErrors({ password: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div key="forgot-newpw" variants={formVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }} className="w-full max-w-sm mx-auto">
      <motion.div variants={fieldVariants} className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center mb-5 border border-purple-300/30 dark:border-purple-400/20">
          <Mail size={22} className="text-purple-500 dark:text-purple-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 tracking-tight">Set new password</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Reset link verified for <span className="font-semibold text-purple-500 dark:text-purple-400">{resetData.email}</span>. Go ahead and set a new password.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <motion.div variants={fieldVariants}>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              className={`${inputClass(errors.password ? 'error' : '')} pr-12`}
            />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
        </motion.div>

        <motion.div variants={fieldVariants}>
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
            className={inputClass(errors.confirm ? 'error' : '')}
          />
          {errors.confirm && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirm}</p>}
        </motion.div>

        <motion.div variants={fieldVariants}>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(139,92,246,0.35)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-full py-3.5 rounded-xl gradient-vibrant text-white font-bold text-sm shadow-lg disabled:opacity-60 mt-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update Password'}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}

// ─── Forgot Password: Step 3 — Success ───────────────────────────────────────
function ForgotSuccessStep({ onGoToLogin }) {
  return (
    <motion.div key="forgot-success" variants={formVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }} className="w-full max-w-sm mx-auto text-center">
      <motion.div variants={fieldVariants} className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center mb-6 border border-emerald-300/30 dark:border-emerald-400/20">
          <CheckCircle2 size={30} className="text-emerald-500 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Password updated!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your password has been successfully reset. You can now sign in with your new password.</p>
      </motion.div>
      <motion.div variants={fieldVariants}>
        <motion.button
          onClick={onGoToLogin}
          whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(139,92,246,0.35)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full py-3.5 rounded-xl gradient-vibrant text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
        >
          Go to Sign In
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main AuthPage ─────────────────────────────────────────────────────────────
const AuthPage = ({ isLogin = true }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { login, signup, loginWithGoogle, loginWithApple } = useAuth();

  // 'auth' | 'forgot-email' | 'forgot-newpw' | 'forgot-success'
  const [screen, setScreen] = useState('auth');
  const [resetData, setResetData] = useState(null); // { email, resetToken }

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!isLogin && !name.trim()) e.name = 'Name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required';
    if (!isLogin) {
      if (!/(?=.*[A-Z])(?=.*[!@#$&*]).{8,}/.test(password)) {
        e.password = 'Min 8 chars, 1 uppercase, 1 special character';
      }
    } else {
      if (!password) e.password = 'Password is required';
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setErrors({});
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate('/dashboard');
    } catch (err) {
      setErrors({ email: err.message.replace('Firebase: ', '') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    try { await loginWithGoogle(); navigate('/dashboard'); } 
    catch (err) { setErrors({ email: err.message.replace('Firebase: ', '') }); }
  };

  const handleApple = async () => {
    try { await loginWithApple(); navigate('/dashboard'); } 
    catch (err) { setErrors({ email: err.message.replace('Firebase: ', '') }); }
  };

  // Used by forgot-email step: field has error if truthy value passed
  const forgotInputClass = (hasError) =>
    `w-full bg-white dark:bg-white/5 border-2 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-white outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
      hasError
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-slate-200 dark:border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
    }`;

  const inputClass = (field) =>
    `w-full bg-white dark:bg-white/5 border-2 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-white outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
      errors[field]
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-slate-200 dark:border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
    }`;

  const leftCopy = () => {
    if (screen === 'forgot-email' || screen === 'forgot-newpw')
      return { title: 'Reset your password.', sub: "We'll have you back in no time." };
    if (screen === 'forgot-success')
      return { title: "You're all set!", sub: 'Your password has been updated successfully.' };
    return {
      title: isLogin ? 'Welcome back to your space.' : 'Start building a calmer routine.',
      sub: 'A focused, professional experience for daily wellbeing.'
    };
  };
  const copy = leftCopy();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-ocean transition-colors duration-300">
      {/* ── Left Decorative Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 dark:bg-charcoal flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_10%,rgba(139,92,246,0.18),transparent_60%),radial-gradient(700px_circle_at_85%_30%,rgba(34,211,238,0.12),transparent_55%)]" />
        <div className="absolute inset-0 noise-soft opacity-40" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-8">
            <ArrowLeft size={14} /> Back to home
          </Link>
          <Logo link="/" iconSize={26} textSize="text-2xl text-white" />
        </div>

        <motion.div
          className="relative z-10 max-w-md"
          key={screen}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-bold mb-6 backdrop-blur-md border border-white/20 uppercase tracking-widest">
            <Sparkles size={12} className="text-rose-300" />
            Designed for calm
          </span>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">{copy.title}</h2>
          <p className="text-white/50 leading-relaxed font-medium">{copy.sub}</p>
        </motion.div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 bg-slate-50 dark:bg-ocean transition-colors duration-300 relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-white/8 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:scale-110 transition-all shadow-sm"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex justify-center">
          <Logo />
        </div>

        <AnimatePresence mode="wait">
          {/* ── Forgot Password: Step 1 — Email ── */}
          {screen === 'forgot-email' && (
            <ForgotEmailStep
              key="forgot-email"
              inputClass={forgotInputClass}
              onBack={() => setScreen('auth')}
              onSuccess={(data) => { setResetData(data); setScreen('forgot-newpw'); }}
            />
          )}

          {/* ── Forgot Password: Step 2 — New Password ── */}
          {screen === 'forgot-newpw' && resetData && (
            <ForgotNewPasswordStep
              key="forgot-newpw"
              resetData={resetData}
              inputClass={forgotInputClass}
              onSuccess={() => setScreen('forgot-success')}
            />
          )}

          {/* ── Forgot Password: Step 3 — Success ── */}
          {screen === 'forgot-success' && (
            <ForgotSuccessStep
              key="forgot-success"
              onGoToLogin={() => { setScreen('auth'); navigate('/login'); }}
            />
          )}

          {/* ── Normal Login / Register ── */}
          {screen === 'auth' && (
            <motion.div
              key={isLogin ? 'login' : 'register'}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
              className="w-full max-w-sm mx-auto"
            >
              {/* Heading */}
              <motion.div variants={fieldVariants} className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Your Account'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {isLogin ? 'Sign in to pick up where you left off.' : 'Create your free account — takes 30 seconds.'}
                </p>
              </motion.div>

              {/* Social logins */}
              <motion.div variants={fieldVariants} className="flex flex-col gap-3 mb-6">
                <motion.button
                  onClick={handleGoogle}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </motion.button>
                
                <motion.button
                  onClick={handleApple}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5" />
                  Continue with Apple
                </motion.button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={fieldVariants} className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-slate-50 dark:bg-ocean text-slate-400 font-medium">or continue with email</span>
                </div>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {!isLogin && (
                  <motion.div variants={fieldVariants}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                      className={inputClass('name')}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
                  </motion.div>
                )}

                <motion.div variants={fieldVariants}>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
                </motion.div>

                <motion.div variants={fieldVariants}>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                      className={`${inputClass('password')} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
                </motion.div>

                {isLogin && (
                  <motion.div variants={fieldVariants} className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setScreen('forgot-email')}
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </motion.div>
                )}

                <motion.div variants={fieldVariants}>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(139,92,246,0.35)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-full py-3.5 rounded-xl gradient-vibrant text-white font-bold text-sm shadow-lg disabled:opacity-60 mt-1 flex items-center justify-center gap-2"
                  >
                    {isLoading
                      ? <><Loader2 size={16} className="animate-spin" /> {isLogin ? 'Signing in...' : 'Creating account...'}</>
                      : isLogin ? 'Welcome Back' : 'Begin Your Journey'
                    }
                  </motion.button>
                </motion.div>
              </form>

              <motion.p variants={fieldVariants} className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Link
                  to={isLogin ? '/register' : '/login'}
                  className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline underline-offset-4"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Link>
              </motion.p>


            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;
