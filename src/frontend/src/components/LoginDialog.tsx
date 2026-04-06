import { LogIn, LogOut, Shield, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    login: iiLogin,
    clear,
    loginStatus,
    identity,
    isLoggingIn,
  } = useInternetIdentity();
  const { actor } = useActor();
  const { isLoggedIn, login, logout, setLoading } = useAuthStore();
  const authState = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await iiLogin();
    } catch {
      addNotification({ message: "Login failed", type: "error" });
      setLoading(false);
    }
  };

  const handleCheckRole = async () => {
    if (!identity || !actor) return;
    setIsCheckingRole(true);
    try {
      const principal = identity.getPrincipal().toString();
      let role: "admin" | "user" | "guest" = "user";
      try {
        const isAdmin = await actor.isCallerAdmin();
        if (isAdmin) role = "admin";
      } catch {
        role = "user";
      }
      login(principal, role);
      addNotification({
        message: `Signed in as ${role === "admin" ? "Administrator" : "User"}`,
        type: "success",
      });
      onClose();
    } catch {
      addNotification({ message: "Failed to fetch role", type: "error" });
    } finally {
      setIsCheckingRole(false);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clear();
    logout();
    addNotification({ message: "Signed out", type: "info" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(3px)",
            }}
          />
          <motion.div
            className="relative w-full max-w-sm rounded border border-[var(--border)] shadow-2xl overflow-hidden"
            style={{ background: "var(--bg-sidebar)" }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            data-ocid="login.modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <User size={14} style={{ color: "var(--accent)" }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {isLoggedIn ? "Account" : "Sign In"}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                data-ocid="login.close_button"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-5">
              {isLoggedIn ? (
                <div className="space-y-4">
                  <div
                    className="flex items-center gap-3 p-3 rounded border border-[var(--border)]"
                    style={{ background: "var(--bg-activity)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "var(--accent)" }}
                    >
                      <User size={14} style={{ color: "white" }} />
                    </div>
                    <div>
                      <p
                        className="text-xs font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {authState.role === "admin" ? "Administrator" : "User"}
                      </p>
                      <p
                        className="text-[10px] font-mono"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {authState.principal?.slice(0, 20)}...
                      </p>
                    </div>
                    {authState.isAdmin && (
                      <Shield
                        size={14}
                        style={{ color: "var(--warning)", marginLeft: "auto" }}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs rounded font-medium transition-colors"
                    style={{
                      background: "var(--error)22",
                      color: "var(--error)",
                      border: "1px solid var(--error)44",
                    }}
                    data-ocid="login.delete_button"
                  >
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                      style={{ background: "var(--bg-activity)" }}
                    >
                      <User size={20} style={{ color: "var(--text-muted)" }} />
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Sign in with Internet Identity to unlock admin features
                      and persist settings.
                    </p>
                  </div>

                  {loginStatus === "success" && identity ? (
                    <button
                      type="button"
                      onClick={handleCheckRole}
                      disabled={isCheckingRole}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-xs rounded font-medium transition-colors"
                      style={{ background: "var(--accent)", color: "white" }}
                      data-ocid="login.primary_button"
                    >
                      {isCheckingRole
                        ? "Verifying..."
                        : "Continue as Authenticated User"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLogin}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-xs rounded font-medium transition-colors"
                      style={{ background: "var(--accent)", color: "white" }}
                      data-ocid="login.primary_button"
                    >
                      <LogIn size={13} />
                      {isLoggingIn
                        ? "Signing in..."
                        : "Sign in with Internet Identity"}
                    </button>
                  )}

                  <p
                    className="text-[10px] text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Internet Identity is a secure, passwordless authentication
                    system for the Internet Computer.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
