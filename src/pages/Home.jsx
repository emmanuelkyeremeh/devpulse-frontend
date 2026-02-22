import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingBackground from "../components/LandingBackground";
import Logo from "../components/Logo";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      if (data.reportId) {
        navigate(`/report/${data.reportId}`);
        return;
      }
      setError("Invalid response from server");
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <LandingBackground />

      <header className="flex items-center justify-between px-6 py-5 w-full max-w-5xl mx-auto">
        <a
          href="/"
          className="flex items-center gap-2 text-white hover:text-cyan-400/90 transition"
        >
          <Logo size={28} />
          <span className="text-xl font-semibold tracking-tight">DevPulse</span>
        </a>
        <a
          href="https://github.com/emmanuelkyeremeh/devpulse-frontend"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-slate-200 text-sm transition"
        >
          GitHub
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Code intelligence, on demand
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
            Audit any public GitHub repo. Get structured security and quality
            reports like an automated senior engineer review.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-400/40 bg-slate-900/80 hover:bg-slate-800/90 hover:border-cyan-400/60 shadow-[0_0_20px_-4px_rgba(34,211,238,0.25)] hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]"
            >
              {loading ? "Starting audit…" : "Audit repository"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-red-400/90 text-sm text-center">{error}</p>
          )}

          <p className="mt-8 text-slate-500 text-sm">
            No sign-up. Public repos only. Reports are shareable.
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} DevPulse
      </footer>
    </div>
  );
}
