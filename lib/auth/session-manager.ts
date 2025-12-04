import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SessionWarning {
  issued: boolean;
  lastWarning: number;
}

class SessionManager {
  private warningState: SessionWarning = {
    issued: false,
    lastWarning: 0,
  };

  private checkInterval: NodeJS.Timeout | null = null;
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly CHECK_INTERVAL = 60 * 1000; // Check every minute

  startSessionMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkSessionExpiry();
    }, this.CHECK_INTERVAL);

    // Also check immediately
    this.checkSessionExpiry();
  }

  stopSessionMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkSessionExpiry() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        this.resetWarningState();
        return;
      }

      const expiresAt = session.expires_at;
      if (!expiresAt) return;

      const expiryTime = expiresAt * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      // If session expires within warning threshold and we haven't warned recently
      if (timeUntilExpiry <= this.WARNING_THRESHOLD &&
          timeUntilExpiry > 0 &&
          !this.warningState.issued) {

        this.showExpiryWarning(Math.ceil(timeUntilExpiry / (60 * 1000))); // Convert to minutes
        this.warningState.issued = true;
        this.warningState.lastWarning = now;
      }

      // Reset warning state if session was refreshed and we have more time
      if (timeUntilExpiry > this.WARNING_THRESHOLD && this.warningState.issued) {
        this.resetWarningState();
      }

    } catch (error) {
      console.error("Error checking session expiry:", error);
    }
  }

  private showExpiryWarning(minutesLeft: number) {
    const message = `Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`;

    toast.warning(message, {
      description: "Please save your work. You'll be redirected to sign in again.",
      duration: 8000,
      action: {
        label: "Extend Session",
        onClick: () => this.extendSession(),
      },
    });
  }

  private async extendSession() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Force a token refresh
      const { error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Failed to extend session:", error);
        toast.error("Failed to extend session", {
          description: "Please sign in again.",
        });
      } else {
        toast.success("Session extended successfully!");
        this.resetWarningState();
      }
    } catch (error) {
      console.error("Error extending session:", error);
      toast.error("Failed to extend session");
    }
  }

  private resetWarningState() {
    this.warningState = {
      issued: false,
      lastWarning: 0,
    };
  }

  // Get current session info
  async getSessionInfo() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) return null;

      const expiresAt = session.expires_at;
      if (!expiresAt) return null;

      const expiryTime = expiresAt * 1000;
      const now = Date.now();

      return {
        expiresAt: expiryTime,
        timeUntilExpiry: expiryTime - now,
        isExpiringSoon: (expiryTime - now) <= this.WARNING_THRESHOLD,
        user: session.user,
      };
    } catch (error) {
      console.error("Error getting session info:", error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
