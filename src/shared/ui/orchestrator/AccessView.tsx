/** WBS: Orchestrator (FULL), rows 4–8. Interactive presentation on mock records. */
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Heading, Text } from "@/shared/ui/typography";

export type AccessMode = "sign-in" | "recover" | "reset" | "session-ended" | "access-denied";
type Props = { mode?: AccessMode; errorState?: "invalid" | "locked" | "expired"; appBase?: string; onNavigate?: (mode: AccessMode | "workspace") => void };
export function AccessView({ mode = "sign-in", errorState, appBase = "", onNavigate }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const go = (next: AccessMode | "workspace") => onNavigate ? onNavigate(next) : window.location.assign(next === "workspace" ? `${appBase}/monitoring/all` : `${appBase}/access/${next}`);
  const title = mode === "sign-in" ? "Sign in" : mode === "recover" ? sent ? "Check your email" : "Recover access" : mode === "reset" ? sent ? "Password updated" : "Choose a new password" : mode === "session-ended" ? "Your session has ended" : "Access unavailable";
  return <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12 text-foreground"><Toaster /><main className="w-full max-w-md"><div className="mb-8 text-center"><Text className="font-heading text-3xl font-bold tracking-tight text-primary">CARE<span className="text-foreground">.</span></Text></div><section className="clinical-panel p-6 sm:p-8"><div className="mb-6"><Heading level={1} className="text-2xl">{title}</Heading>{mode === "session-ended" && <Text variant="muted" className="mt-3">Sign in again to continue your work.</Text>}{mode === "access-denied" && <Text variant="muted" className="mt-3">Your account does not have access to this page. Contact your administrator if you need access.</Text>}</div>
    {mode === "session-ended" || mode === "access-denied" ? <Button className="w-full" onClick={() => go("sign-in")}>Return to sign in</Button> : sent ? <div className="space-y-5"><ShieldCheck className="size-7 text-success" /><Text>{mode === "recover" ? "If an account matches this email, recovery instructions will be sent to it." : "Use your new password to sign in."}</Text><Button className="w-full" onClick={() => go("sign-in")}>Back to sign in</Button></div> : errorState === "expired" && mode === "reset" ? <div className="space-y-5"><Text role="alert" className="text-destructive">This reset link has expired.</Text><Button className="w-full" onClick={() => go("recover")}>Request a new link</Button></div> : <form className="space-y-6" onSubmit={(event) => {
      event.preventDefault(); setError("");
      if (mode === "sign-in") { if (errorState === "invalid") setError("The email or password is incorrect."); else if (errorState === "locked") setError("This account is locked. Contact your administrator to restore access."); else go("workspace"); }
      else if (mode === "recover") { setSent(true); toast.success("Recovery request submitted."); }
      else if (password !== confirmation) setError("Passwords do not match.");
      else { setSent(true); toast.success("Password updated."); }
    }}>
    {mode !== "reset" && <div className="space-y-2"><Label htmlFor="access-email">Email *</Label><Input id="access-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>}
    {mode !== "recover" && <div className="space-y-2"><Label htmlFor="access-password">{mode === "reset" ? "New password" : "Password"} *</Label><div className="relative"><Input id="access-password" type={visible ? "text" : "password"} required autoComplete={mode === "reset" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="pr-12" /><Button variant="ghost" size="icon" type="button" className="absolute top-0 right-0" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button></div></div>}
    {mode === "reset" && <div className="space-y-2"><Label htmlFor="access-confirm">Confirm password *</Label><Input id="access-confirm" type={visible ? "text" : "password"} required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>}
    {error && <Text role="alert" className="text-destructive">{error}</Text>}
    <Button type="submit" className="w-full">{mode === "sign-in" ? "Sign in" : mode === "recover" ? "Send recovery link" : "Update password"}</Button>
    {mode === "sign-in" ? <><Button variant="link" type="button" className="w-full" onClick={() => go("recover")}>Forgot password?</Button><Button variant="outline" type="button" className="w-full" onClick={() => go("workspace")}>Continue with your organization</Button></> : <Button variant="ghost" type="button" className="w-full" onClick={() => go("sign-in")}><ArrowLeft className="size-4" />Back to sign in</Button>}
    </form>}
    </section></main></div>;
}
