export interface FSNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FSNode[];
  language?: string;
  content?: string;
  isExpanded?: boolean;
}

export const FILE_CONTENTS: Record<string, string> = {
  "src/components/Button.tsx": `import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
  outline: 'bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-6 py-3 text-base rounded-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium border transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
`,

  "src/components/Modal.tsx": `import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
          <motion.div
            className={\`relative bg-white rounded-xl shadow-2xl w-full \${sizeMap[size]} flex flex-col max-h-[90vh]\`}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', damping: 25 }}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 p-6 border-t">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
`,

  "src/pages/Home.tsx": `import React from 'react';
import { ArrowRight, Zap, Shield, Globe, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Lightning Fast',
    description: 'Built on ICP for sub-second response times and global edge deployment.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Truly Decentralized',
    description: 'No servers, no central control. Your data lives on-chain, secured by cryptography.',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Web3 Native',
    description: 'Internet Identity authentication. No passwords, no seed phrases to manage.',
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Open Source',
    description: 'Fully transparent codebase. Audit, fork, and contribute on GitHub.',
  },
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Hero */}
      <section className="container mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-blue-300">Now live on ICP Mainnet</span>
        </div>
        <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
          Build the Future,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            On-Chain
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          A fully decentralized application platform built on the Internet Computer Protocol.
          Deploy, scale, and own your infrastructure — no cloud providers needed.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-all"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 pb-32">
        <h2 className="text-3xl font-bold text-white text-center mb-16">Why Choose Us?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
`,

  "src/pages/Dashboard.tsx": `import React, { useState } from 'react';
import { BarChart2, Users, Activity, TrendingUp, FileText, Clock, Settings, LogOut } from 'lucide-react';

const stats = [
  { label: 'Total Users', value: '12,847', change: '+8.2%', icon: <Users className="w-5 h-5" />, color: 'blue' },
  { label: 'Active Sessions', value: '1,429', change: '+2.1%', icon: <Activity className="w-5 h-5" />, color: 'green' },
  { label: 'API Calls Today', value: '94,231', change: '+15.3%', icon: <BarChart2 className="w-5 h-5" />, color: 'purple' },
  { label: 'Revenue MRR', value: '$24,891', change: '+4.7%', icon: <TrendingUp className="w-5 h-5" />, color: 'orange' },
];

const recentActivity = [
  { user: 'alice.icp', action: 'Updated profile settings', time: '2 min ago', type: 'settings' },
  { user: 'bob.eth', action: 'Deployed new canister v2.1.0', time: '15 min ago', type: 'deploy' },
  { user: 'carol.nft', action: 'Transferred 50 ICP tokens', time: '1 hr ago', type: 'transfer' },
  { user: 'dave.web3', action: 'Created new project workspace', time: '3 hr ago', type: 'create' },
  { user: 'eve.dao', action: 'Voted on governance proposal #42', time: '5 hr ago', type: 'vote' },
];

export const Dashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState('overview');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">ICP Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">v2.0 · Mainnet</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {['overview', 'analytics', 'users', 'deployments', 'settings'].map(item => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={\`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors \${
                activeNav === item
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }\`}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b px-8 py-5">
          <h2 className="text-2xl font-semibold text-gray-900 capitalize">{activeNav}</h2>
        </header>
        <div className="p-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">{stat.label}</span>
                  <span className="text-blue-600">{stat.icon}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-green-600 text-sm mt-1">{stat.change} this week</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y">
              {recentActivity.map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {item.user[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{item.user}</span>
                    <span className="text-gray-500"> — {item.action}</span>
                  </div>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
`,

  "src/hooks/useAuth.ts": `import { useState, useCallback, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  clearError: () => void;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      if (password.length < 6) throw new Error('Invalid credentials');

      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).slice(2),
        email,
        displayName: email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      const token = 'tok_' + Math.random().toString(36).slice(2, 18);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (password.length < 8) throw new Error('Password must be at least 8 characters');

      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).slice(2),
        email,
        displayName,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { user, isLoading, isAuthenticated, error, login, logout, register, clearError };
}
`,

  "src/hooks/useTheme.ts": `import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'app_theme';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'system';
  });

  const resolvedTheme = getResolvedTheme(theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(getSystemTheme());
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme);
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return { theme, resolvedTheme, setTheme, toggleTheme, isDark: resolvedTheme === 'dark' };
}
`,

  "src/utils/helpers.ts": `/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number, ellipsis = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Combine class names, filtering falsy values
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Parse URL query string into an object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => { result[key] = value; });
  return result;
}

/**
 * Deep clone an object using JSON serialization
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate a random unique ID
 */
export function generateId(prefix = 'id'): string {
  return \`\${prefix}_\${Date.now().toString(36)}_\${Math.random().toString(36).slice(2, 9)}\`;
}

/**
 * Format a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return \`\${bytes} B\`;
  if (bytes < 1024 * 1024) return \`\${(bytes / 1024).toFixed(1)} KB\`;
  if (bytes < 1024 * 1024 * 1024) return \`\${(bytes / (1024 * 1024)).toFixed(1)} MB\`;
  return \`\${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB\`;
}

/**
 * Throttle a function to only execute at most once per interval
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  };
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
`,

  "src/utils/api.ts": `interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: \`Bearer \${token}\` } : {};
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = \`\${this.baseUrl}\${path}\`;
    if (!params || Object.keys(params).length === 0) return url;
    const query = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    );
    return \`\${url}?\${query.toString()}\`;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, ...init } = options;
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      ...init,
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...(init.headers as Record<string, string>),
      },
    });

    let data: T;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json() as T;
    } else {
      data = await response.text() as unknown as T;
    }

    if (!response.ok) {
      throw new ApiError(
        \`Request failed with status \${response.status}\`,
        response.status,
        data
      );
    }

    return { data, status: response.status, ok: true };
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const response = await this.request<T>(path, { method: 'GET', params });
    return response.data;
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.data;
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return response.data;
  }

  async delete<T>(path: string): Promise<T> {
    const response = await this.request<T>(path, { method: 'DELETE' });
    return response.data;
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const response = await this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data;
  }
}

export const api = new ApiClient(import.meta.env.VITE_API_URL || 'https://api.example.com');
export { ApiClient, ApiError };
`,

  "src/App.tsx": `import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
`,

  "src/main.tsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,

  "src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}
`,

  "backend/canisters/main.mo": `import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

import Types "./types";

actor Main {
  // Stable state for upgrades
  stable var counter: Nat = 0;
  stable var userEntries: [(Principal, Types.UserProfile)] = [];

  // In-memory HashMap, rebuilt on upgrade
  var users = HashMap.HashMap<Principal, Types.UserProfile>(
    16, Principal.equal, Principal.hash
  );

  // Reconstruct from stable storage on upgrade
  system func preupgrade() {
    userEntries := Array.tabulate(
      users.size(),
      func(i: Nat): (Principal, Types.UserProfile) {
        // Simplified - real impl would iterate HashMap
        userEntries[i]
      }
    );
  };

  system func postupgrade() {
    for ((p, profile) in userEntries.vals()) {
      users.put(p, profile);
    };
  };

  // ============================
  // Public Query Functions
  // ============================

  /// Returns a greeting message for the given name
  public query func greet(name: Text) : async Text {
    return "Hello, " # name # "! Welcome to CodeForge on ICP.";
  };

  /// Returns the current counter value
  public query func getCounter() : async Nat {
    return counter;
  };

  /// Returns the caller's user profile if it exists
  public query (msg) func getMyProfile() : async ?Types.UserProfile {
    return users.get(msg.caller);
  };

  /// Returns all user profiles (admin only in production)
  public query func getAllUsers() : async [Types.UserProfile] {
    var profiles: [Types.UserProfile] = [];
    for ((_, profile) in users.entries()) {
      profiles := Array.append(profiles, [profile]);
    };
    return profiles;
  };

  // ============================
  // Public Update Functions
  // ============================

  /// Increments the global counter and returns the new value
  public func increment() : async Nat {
    counter += 1;
    return counter;
  };

  /// Resets the counter to zero
  public func resetCounter() : async () {
    counter := 0;
  };

  /// Creates or updates the caller's user profile
  public shared (msg) func upsertProfile(displayName: Text, bio: Text) : async Types.Result<Types.UserProfile, Text> {
    let caller = msg.caller;

    let existing = users.get(caller);
    let profile: Types.UserProfile = {
      id = caller;
      displayName = displayName;
      bio = bio;
      createdAt = Option.get(Option.map(existing, func(p: Types.UserProfile): Int { p.createdAt }), Time.now());
      updatedAt = Time.now();
    };

    users.put(caller, profile);
    return #ok(profile);
  };

  /// Deletes the caller's user profile
  public shared (msg) func deleteProfile() : async Types.Result<(), Text> {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case null { return #err("Profile not found"); };
      case (?_) {
        users.delete(caller);
        return #ok(());
      };
    };
  };
};
`,

  "backend/canisters/types.mo": `import Principal "mo:base/Principal";

module Types {
  // ============================
  // Core Types
  // ============================

  /// Generic Result type for operations that can fail
  public type Result<T, E> = {
    #ok: T;
    #err: E;
  };

  /// Paginated response wrapper
  public type PaginatedResult<T> = {
    items: [T];
    total: Nat;
    page: Nat;
    pageSize: Nat;
  };

  // ============================
  // User Types
  // ============================

  /// Full user profile stored on-chain
  public type UserProfile = {
    id: Principal;
    displayName: Text;
    bio: Text;
    createdAt: Int;   // Unix timestamp in nanoseconds
    updatedAt: Int;
  };

  /// Public-facing user summary (safe to expose)
  public type UserSummary = {
    id: Principal;
    displayName: Text;
  };

  /// User role for access control
  public type UserRole = {
    #admin;
    #moderator;
    #user;
    #viewer;
  };

  // ============================
  // Content Types
  // ============================

  /// A post or document created by a user
  public type Post = {
    id: Text;
    authorId: Principal;
    title: Text;
    content: Text;
    tags: [Text];
    createdAt: Int;
    updatedAt: Int;
    isPublished: Bool;
  };

  /// A comment on a post
  public type Comment = {
    id: Text;
    postId: Text;
    authorId: Principal;
    content: Text;
    createdAt: Int;
    isDeleted: Bool;
  };

  // ============================
  // Transaction Types
  // ============================

  /// A token transfer record
  public type Transfer = {
    from: Principal;
    to: Principal;
    amount: Nat;
    memo: ?Text;
    timestamp: Int;
  };

  /// Transfer status
  public type TransferStatus = {
    #pending;
    #completed;
    #failed: Text;
  };
};
`,

  "package.json": `{
  "name": "codeforge-ide",
  "version": "1.0.0",
  "description": "A VS Code-like web IDE built with React, TypeScript, and the Internet Computer Protocol",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "@tanstack/react-query": "^5.24.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.1",
    "vitest": "^1.6.0"
  }
}
`,

  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`,

  "README.md": `# CodeForge IDE

A production-grade, web-based VS Code-like code editor built with React, TypeScript, and the Internet Computer Protocol.

## Features

- 🖥️ **Full Monaco Editor** — The same editor powering VS Code, running in your browser
- 📁 **File Explorer** — Tree view with folders, file icons, rename & delete support
- 🗂️ **Multi-tab Editing** — Open multiple files with drag-to-reorder tabs
- ⌨️ **Command Palette** — Ctrl+Shift+P for quick command access
- 🌙 **Theme System** — Dark, Light, and High Contrast themes
- 🔍 **Search Across Files** — Full-text search through all open files
- ✂️ **Split Editor** — Horizontal or vertical split view
- 📊 **Status Bar** — Language mode, cursor position, encoding info
- 🎛️ **Settings Panel** — Font size, family, tab size, word wrap, minimap
- 🔔 **Notifications** — Toast notifications with auto-dismiss
- ⚙️ **Extension System** — Prepared hooks for Phase 2 plugin support
- 🤖 **AI Assistant** — Placeholder panel ready for Phase 2 integration

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Monaco Editor | Core editing engine |
| Zustand | State management |
| Framer Motion | Animations |
| Tailwind CSS | Styling |
| Vite | Build tool |
| Internet Computer | Blockchain backend |

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
\`\`\`

## Project Structure

\`\`\`
src/
  features/
    editor/          # Editor panes, tabs, breadcrumbs
    filesystem/      # File explorer, tree, icons, search
    theme/           # Theme definitions and provider
    extensions/      # Extension registry (Phase 2 stubs)
  stores/
    editorStore.ts   # Open files, active tab, split mode
    filesystemStore.ts  # File tree, selection
    themeStore.ts    # Theme, persisted
    settingsStore.ts # Settings, persisted
    notificationStore.ts  # Notifications
  components/
    ActivityBar.tsx  # Far-left icon rail
    Sidebar.tsx      # Left sidebar container
    BottomPanel.tsx  # Problems/Output/Terminal
    StatusBar.tsx    # Bottom status bar
    MenuBar.tsx      # Top menu bar
    CommandPalette.tsx  # Ctrl+Shift+P overlay
    QuickOpen.tsx    # Ctrl+P file open
    SettingsPanel.tsx   # Settings modal
    NotificationToast.tsx  # Toast system
    ResizeHandle.tsx    # Drag resize handles
  App.tsx            # Root layout
  index.css          # Global styles + CSS variables
\`\`\`

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+P | Quick Open file |
| Ctrl+Shift+P | Command Palette |
| Ctrl+W | Close current tab |
| Ctrl+S | Save file |
| Ctrl+B | Toggle sidebar |
| Ctrl+\` | Toggle bottom panel |
| Ctrl+\\ | Split editor |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+F | Find in file |
| Ctrl+H | Find and replace |

## Phase 2 Roadmap

- [ ] AI Assistant integration (OpenAI / Anthropic)
- [ ] Extension marketplace
- [ ] Real file system via ICP canister storage
- [ ] Collaborative editing (CRDTs)
- [ ] Git integration (via Juno or custom canister)
- [ ] Terminal emulator (via xterm.js)
- [ ] Debugger protocol support
- [ ] Remote development containers

## License

MIT © CodeForge IDE Team
`,
};

export const MOCK_FILE_TREE: FSNode[] = [
  {
    id: "folder-src",
    name: "src",
    path: "src",
    type: "folder",
    isExpanded: true,
    children: [
      {
        id: "folder-components",
        name: "components",
        path: "src/components",
        type: "folder",
        isExpanded: true,
        children: [
          {
            id: "file-button",
            name: "Button.tsx",
            path: "src/components/Button.tsx",
            type: "file",
            language: "typescript",
          },
          {
            id: "file-modal",
            name: "Modal.tsx",
            path: "src/components/Modal.tsx",
            type: "file",
            language: "typescript",
          },
        ],
      },
      {
        id: "folder-pages",
        name: "pages",
        path: "src/pages",
        type: "folder",
        isExpanded: false,
        children: [
          {
            id: "file-home",
            name: "Home.tsx",
            path: "src/pages/Home.tsx",
            type: "file",
            language: "typescript",
          },
          {
            id: "file-dashboard",
            name: "Dashboard.tsx",
            path: "src/pages/Dashboard.tsx",
            type: "file",
            language: "typescript",
          },
        ],
      },
      {
        id: "folder-hooks",
        name: "hooks",
        path: "src/hooks",
        type: "folder",
        isExpanded: false,
        children: [
          {
            id: "file-useauth",
            name: "useAuth.ts",
            path: "src/hooks/useAuth.ts",
            type: "file",
            language: "typescript",
          },
          {
            id: "file-usetheme",
            name: "useTheme.ts",
            path: "src/hooks/useTheme.ts",
            type: "file",
            language: "typescript",
          },
        ],
      },
      {
        id: "folder-utils",
        name: "utils",
        path: "src/utils",
        type: "folder",
        isExpanded: false,
        children: [
          {
            id: "file-helpers",
            name: "helpers.ts",
            path: "src/utils/helpers.ts",
            type: "file",
            language: "typescript",
          },
          {
            id: "file-api",
            name: "api.ts",
            path: "src/utils/api.ts",
            type: "file",
            language: "typescript",
          },
        ],
      },
      {
        id: "file-app",
        name: "App.tsx",
        path: "src/App.tsx",
        type: "file",
        language: "typescript",
      },
      {
        id: "file-main",
        name: "main.tsx",
        path: "src/main.tsx",
        type: "file",
        language: "typescript",
      },
      {
        id: "file-css",
        name: "index.css",
        path: "src/index.css",
        type: "file",
        language: "css",
      },
    ],
  },
  {
    id: "folder-backend",
    name: "backend",
    path: "backend",
    type: "folder",
    isExpanded: false,
    children: [
      {
        id: "folder-canisters",
        name: "canisters",
        path: "backend/canisters",
        type: "folder",
        isExpanded: false,
        children: [
          {
            id: "file-mainmo",
            name: "main.mo",
            path: "backend/canisters/main.mo",
            type: "file",
            language: "plaintext",
          },
          {
            id: "file-typesmo",
            name: "types.mo",
            path: "backend/canisters/types.mo",
            type: "file",
            language: "plaintext",
          },
        ],
      },
    ],
  },
  {
    id: "file-pkgjson",
    name: "package.json",
    path: "package.json",
    type: "file",
    language: "json",
  },
  {
    id: "file-tsconfig",
    name: "tsconfig.json",
    path: "tsconfig.json",
    type: "file",
    language: "json",
  },
  {
    id: "file-readme",
    name: "README.md",
    path: "README.md",
    type: "file",
    language: "markdown",
  },
];

export function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    py: "python",
    mo: "plaintext",
    sh: "shell",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    sql: "sql",
    rs: "rust",
    go: "go",
    java: "java",
    cpp: "cpp",
    c: "c",
    toml: "toml",
    ini: "ini",
  };
  return map[ext] ?? "plaintext";
}
