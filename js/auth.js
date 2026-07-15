/**
 * auth.js — Supabase auth (login, register, session)
 *
 * SETUP: Replace these two values with your Supabase project credentials.
 * Find them at: Supabase Dashboard → Settings → API
 *   URL  = https://<your-project>.supabase.co
 *   KEY  = anon/public key (starts with "eyJ...")
 */

const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';   // ← REPLACE ME
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // ← REPLACE ME

let supabase = null;

try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.error('Supabase init failed. Check SUPABASE_URL/KEY in js/auth.js', e);
}

/* ── DOM ready ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initForms();
  checkSession();   // fire-and-forget — never blocks form wiring
});

/* ── Form wiring ────────────────────────────────────────────────── */
function initForms() {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm)    loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
}

/* ── Session check ──────────────────────────────────────────────── */
async function checkSession() {
  if (!supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const page = location.pathname.split('/').pop();
    if (session && (page === 'login.html' || page === 'register.html')) {
      location.href = 'dashboard.html';
    }
  } catch (_) { /* network error — harmless, user will retry */ }
}

/* ── Login ──────────────────────────────────────────────────────── */
async function handleLogin(e) {
  e.preventDefault();
  clearErrors();
  if (!supabase) return showError('Auth service unavailable. Check your connection.');

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('submitBtn');

  if (!email || !password) return showError('Please fill in all fields.');

  setLoading(btn, true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(btn, false);
      return showError(error.message);
    }

    // Log session (non-critical)
    supabase.from('user_sessions').insert({
      user_id: data.user.id, user_agent: navigator.userAgent,
    }).catch(() => {});

    location.href = 'dashboard.html';
  } catch (err) {
    setLoading(btn, false);
    showError('Network error. Please check your connection and try again.');
  }
}

/* ── Register ───────────────────────────────────────────────────── */
async function handleRegister(e) {
  e.preventDefault();
  clearErrors();
  if (!supabase) return showError('Auth service unavailable. Check your connection.');

  const email       = document.getElementById('email').value.trim();
  const password    = document.getElementById('password').value;
  const confirm     = document.getElementById('confirmPassword').value;
  const fullName    = document.getElementById('fullName')?.value.trim() || '';
  const btn         = document.getElementById('submitBtn');

  if (!email || !password || !confirm) return showError('Please fill in all fields.');
  if (password.length < 8)            return showError('Password must be at least 8 characters.');
  if (password !== confirm)           return showError('Passwords do not match.');

  setLoading(btn, true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setLoading(btn, false);
      return showError(error.message);
    }

    if (data.user?.identities?.length === 0) {
      setLoading(btn, false);
      return showError('This email is already registered. Try signing in instead.');
    }

    if (!data.session) {
      setLoading(btn, false);
      showSuccess('Account created! Check your email for a confirmation link, then sign in.');
    } else {
      location.href = 'dashboard.html';
    }
  } catch (err) {
    setLoading(btn, false);
    showError('Network error. Please check your connection and try again.');
  }
}

/* ── UI helpers ─────────────────────────────────────────────────── */
function showError(msg) {
  const el = document.getElementById('formError');
  if (!el) return;
  el.textContent = msg;
  el.style.display    = 'block';
  el.style.background = 'rgba(239,68,68,0.1)';
  el.style.borderColor = 'rgba(239,68,68,0.2)';
  el.style.color      = '#fca5a5';
}

function showSuccess(msg) {
  const el = document.getElementById('formError');
  if (!el) return;
  el.textContent = msg;
  el.style.display     = 'block';
  el.style.background  = 'rgba(34,197,94,0.12)';
  el.style.borderColor = 'rgba(34,197,94,0.3)';
  el.style.color       = '#86efac';
}

function clearErrors() {
  const el = document.getElementById('formError');
  if (!el) return;
  el.style.display = 'none';
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    if (!btn._originalText) btn._originalText = btn.textContent;
    btn.textContent = 'Please wait…';
  } else {
    btn.textContent = btn._originalText || btn.getAttribute('data-original') || 'Submit';
  }
}
