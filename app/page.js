"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [savedUsername, setSavedUsername] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("username");
      if (savedToken) setToken(savedToken);
      if (savedUser) setSavedUsername(savedUser);
    }
  }, []);

  const isSignup = useMemo(() => mode === "signup", [mode]);

  const passwordChecks = useMemo(() => {
    const lengthOk = password.length >= 8;
    const upperOk = /[A-Z]/.test(password);
    const lowerOk = /[a-z]/.test(password);
    const numberOk = /[0-9]/.test(password);
    const specialOk = /[^A-Za-z0-9]/.test(password);
    const matchOk = !isSignup || (confirmPassword.length > 0 && password === confirmPassword);
    return { lengthOk, upperOk, lowerOk, numberOk, specialOk, matchOk };
  }, [password, confirmPassword, isSignup]);

  const emailValid = useMemo(() => {
    if (!isSignup) return true;
    if (!email) return false;
    return /.+@.+\..+/.test(email);
  }, [email, isSignup]);

  const submit = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      if (isSignup) {
        if (!fullName || !email || !username || !password || !confirmPassword) {
          setMessage("Please fill all fields");
          return;
        }
        if (!emailValid) {
          setMessage("Please enter a valid email address");
          return;
        }
        const unmet = Object.entries(passwordChecks).filter(([k, v]) => !v).map(([k]) => k);
        if (unmet.length > 0) {
          setMessage("Password does not meet the required format");
          return;
        }
      }
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.msg || "Request failed");
        return;
      }
      if (!isSignup) {
        if (data?.token) {
          localStorage.setItem("auth_token", data.token);
          setToken(data.token);
        }
        if (data?.username) {
          localStorage.setItem("username", data.username);
          setSavedUsername(data.username);
        }
      }
      setMessage(data?.msg || (isSignup ? "Signed up" : "Logged in"));
    } catch (e) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }, [isSignup, username, password, fullName, email, confirmPassword, emailValid, passwordChecks]);

  const testProtected = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/protected", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      setMessage(data?.msg || (res.ok ? "OK" : "Unauthorized"));
    } catch (e) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("username");
    setToken("");
    setSavedUsername("");
    setMessage("Logged out");
  }, []);

  const requirements = [
    { ok: passwordChecks.lengthOk, label: "At least 8 characters" },
    { ok: passwordChecks.upperOk, label: "At least 1 uppercase letter" },
    { ok: passwordChecks.lowerOk, label: "At least 1 lowercase letter" },
    { ok: passwordChecks.numberOk, label: "At least 1 number" },
    { ok: passwordChecks.specialOk, label: "At least 1 special character" },
  ];

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (isSignup) {
      const allReqs = requirements.every(r => r.ok) && passwordChecks.matchOk && emailValid;
      return allReqs && !!fullName && !!email && !!username && !!password && !!confirmPassword;
    }
    return !!username && !!password;
  }, [loading, isSignup, requirements, passwordChecks.matchOk, emailValid, fullName, email, username, password, confirmPassword]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-6 bg-white dark:bg-black sm:items-start">
        <div className="flex w-full items-center justify-between">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded-full border ${mode === "login" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent"}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 rounded-full border ${mode === "signup" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent"}`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>
        </div>

        <section className="mt-10 w-full max-w-md">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
            {isSignup ? "Create an account" : "Welcome back"}
          </h1>
          <div className="flex flex-col gap-4">
            {isSignup ? (
              <>
                <input
                  className="w-full rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black px-4 py-3 text-black dark:text-white outline-none"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
                <input
                  className={`w-full rounded-md border ${email && !emailValid ? "border-red-500" : "border-black/10 dark:border-white/15"} bg-white dark:bg-black px-4 py-3 text-black dark:text-white outline-none`}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </>
            ) : null}

            <input
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black px-4 py-3 text-black dark:text-white outline-none"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />

            <input
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black px-4 py-3 text-black dark:text-white outline-none"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />

            {isSignup ? (
              <>
                <input
                  className={`w-full rounded-md border ${confirmPassword && !passwordChecks.matchOk ? "border-red-500" : "border-black/10 dark:border-white/15"} bg-white dark:bg-black px-4 py-3 text-black dark:text-white outline-none`}
                  placeholder="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <div className="rounded-md border border-black/10 dark:border-white/15 p-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <p className="mb-2 font-medium">Password must include:</p>
                  <ul className="space-y-1">
                    {requirements.map((r) => (
                      <li key={r.label} className={`flex items-center gap-2 ${r.ok ? "text-green-600" : "text-red-600"}`}>
                        <span className={`inline-block h-2 w-2 rounded-full ${r.ok ? "bg-green-600" : "bg-red-600"}`} />
                        {r.label}
                      </li>
                    ))}
                    <li className={`flex items-center gap-2 ${passwordChecks.matchOk ? "text-green-600" : "text-red-600"}`}>
                      <span className={`inline-block h-2 w-2 rounded-full ${passwordChecks.matchOk ? "bg-green-600" : "bg-red-600"}`} />
                      Passwords match
                    </li>
                  </ul>
                </div>
              </>
            ) : null}

            <button
              onClick={submit}
              disabled={!canSubmit}
              className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-3 disabled:opacity-50"
            >
              {loading ? (isSignup ? "Signing up..." : "Logging in...") : (isSignup ? "Sign up" : "Login")}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={testProtected}
              className="rounded-md border px-4 py-2"
            >
              Test Protected
            </button>
            {token ? (
              <button onClick={logout} className="rounded-md border px-4 py-2">
                Logout
              </button>
            ) : null}
          </div>

          {message ? (
            <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">{message}</p>
          ) : null}

          {token ? (
            <div className="mt-6 rounded-md border border-black/10 dark:border-white/15 p-4">
              <h2 className="mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">Dashboard</h2>
              <p className="text-xs text-zinc-500">Logged in. Token and username stored.</p>
              {savedUsername ? (
                <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-300">Username: <span className="font-medium">{savedUsername}</span></p>
              ) : null}
              <p className="mt-2 break-all text-xs text-zinc-500">Token: {token.slice(0, 24)}...{token.slice(-12)}</p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">No token stored</p>
          )}

          {isSignup ? (
            <p className="mt-3 text-xs text-zinc-500">
              Note: extra signup fields (name, email) are validated on the client. With your approval, I can update the backend and database to store them.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
