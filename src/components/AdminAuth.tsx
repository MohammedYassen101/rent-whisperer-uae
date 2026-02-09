import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const ADMIN_SESSION_KEY = "alyassia_admin_session";
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export function isAdminAuthenticated(): boolean {
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) return false;
    const { expiresAt } = JSON.parse(session);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function setAdminSession() {
  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({ expiresAt: Date.now() + SESSION_DURATION })
  );
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export default function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (attempts >= 5) {
      setError("Too many attempts. Please try again later.");
      return;
    }

    // Simple hash check — not cryptographically secure but better than plaintext
    const hash = Array.from(password).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
    if (hash === 1454268421) {
      setAdminSession();
      onAuthenticated();
    } else {
      setAttempts((a) => a + 1);
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Admin Access</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Enter the admin password to continue.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={50}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={!password || attempts >= 5}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
