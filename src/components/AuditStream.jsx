import { useEffect, useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

const STEPS = [
  { key: 'clone', label: 'Cloning repository', match: /clon/i },
  { key: 'semgrep', label: 'Running analysis', match: /semgrep/i },
  { key: 'depgraph', label: 'Building dependency graph', match: /dependen|graph/i },
  { key: 'synthesize', label: 'Synthesizing findings with AI', match: /synthesiz|finding/i },
  { key: 'complete', label: 'Report complete', match: /complete|done/i },
];

function formatElapsed(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function parseSynthesizeProgress(message) {
  const match = (message || '').match(/Synthesized\s+(\d+)\s+of\s+(\d+)\s+finding/i);
  return match ? { completed: parseInt(match[1], 10), total: parseInt(match[2], 10) } : null;
}

function StepSpinner() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden>
      <svg className="h-4 w-4 animate-spin text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </span>
  );
}

function StepCheck() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

export default function AuditStream({ reportId, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [activeStepKey, setActiveStepKey] = useState('clone');
  const [elapsed, setElapsed] = useState(0);
  const [streamDone, setStreamDone] = useState(false);
  const streamStartRef = useRef(null);
  const startedReportIdRef = useRef(null);
  const activeStepKeyRef = useRef('clone');
  activeStepKeyRef.current = activeStepKey;

  useEffect(() => {
    if (!reportId) return;
    if (startedReportIdRef.current !== reportId) {
      startedReportIdRef.current = reportId;
      streamStartRef.current = Date.now();
    }
    setStreamDone(false);
    const url = `${API_URL}/api/audit/${reportId}/stream`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'progress') {
          const msg = data.message || '';
          setMessages((prev) => [...prev, msg]);
          for (const step of STEPS) {
            if (step.match.test(msg)) {
              const prevActive = activeStepKeyRef.current;
              if (prevActive && prevActive !== step.key) {
                setCompletedSteps((prev) => new Set([...prev, prevActive]));
              }
              if (step.key === 'complete') {
                setCompletedSteps((prev) => new Set([...prev, 'complete']));
                setActiveStepKey(null);
              } else {
                setActiveStepKey(step.key);
              }
              break;
            }
          }
        }
        if (data.type === 'complete') {
          setStreamDone(true);
          setCompletedSteps((prev) => new Set([...prev, 'complete']));
          setActiveStepKey(null);
          es.close();
          onComplete?.();
        }
        if (data.type === 'error') {
          setStreamDone(true);
          setError(data.message || 'Something went wrong');
          es.close();
        }
      } catch (_) {}
    };

    es.onerror = () => {
      setStreamDone(true);
      es.close();
      setError((err) => err || 'Connection lost');
    };

    return () => es.close();
  }, [reportId, onComplete]);

  useEffect(() => {
    if (!reportId || error || streamDone) return;
    const interval = setInterval(() => {
      const start = streamStartRef.current;
      if (start) setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [reportId, error, streamDone]);

  useEffect(() => {
    if (messages.length === 0 && !error) {
      setActiveStepKey('clone');
      return;
    }
    const last = messages[messages.length - 1] || '';
    for (let i = 0; i < STEPS.length; i++) {
      if (STEPS[i].match.test(last)) {
        const prevActive = activeStepKeyRef.current;
        if (prevActive && prevActive !== STEPS[i].key) {
          setCompletedSteps((prev) => new Set([...prev, prevActive]));
        }
        if (STEPS[i].key === 'complete') {
          setCompletedSteps((prev) => new Set([...prev, 'complete']));
          setActiveStepKey(null);
        } else {
          setActiveStepKey(STEPS[i].key);
        }
        return;
      }
    }
  }, [messages]);

  const displaySteps = STEPS.filter((s) => s.key !== 'complete' || completedSteps.has('complete'));
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : '';
  const synthesizeProgress = parseSynthesizeProgress(lastMessage);

  return (
    <div className="w-full max-w-xl">
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Generating report</h2>
          {!streamDone && (
            <span className="text-slate-400 text-sm tabular-nums font-mono">{formatElapsed(elapsed)}</span>
          )}
          {streamDone && completedSteps.has('complete') && (
            <span className="text-emerald-400 text-sm font-medium">Done</span>
          )}
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-400 text-sm">
            {error}
          </div>
        )}
        <ul className="space-y-2">
          {displaySteps.map((step) => {
            const done = completedSteps.has(step.key);
            const active = activeStepKey === step.key && !streamDone;
            return (
              <li
                key={step.key}
                className="flex items-center gap-3 py-1.5 px-2 rounded-lg text-sm"
              >
                {done ? (
                  <StepCheck />
                ) : active ? (
                  <StepSpinner />
                ) : (
                  <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-600 bg-transparent" aria-hidden />
                )}
                <span className={done ? 'text-slate-400' : active ? 'text-white' : 'text-slate-500'}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>
        {synthesizeProgress && synthesizeProgress.total > 0 && activeStepKey === 'synthesize' && (
          <div className="mt-3 px-2 py-2 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-cyan-500/80 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (100 * synthesizeProgress.completed) / synthesizeProgress.total)}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 tabular-nums">
                {synthesizeProgress.completed} / {synthesizeProgress.total} findings
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Large audits may take a few minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
