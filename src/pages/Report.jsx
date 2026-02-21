import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AuditStream from '../components/AuditStream';
import HealthScore from '../components/HealthScore';
import ReportCard from '../components/ReportCard';
import SeverityBadge from '../components/SeverityBadge';
import LandingBackground from '../components/LandingBackground';
import Logo from '../components/Logo';

const API_URL = import.meta.env.VITE_API_URL || '';

function reportToMarkdown(report) {
  const lines = [
    `# ${report.repoName}`,
    report.repoUrl ? `${report.repoUrl}\n` : '',
    `**Health score:** ${report.healthScore}`,
    '',
    '## Summary',
    report.summary || '',
    '',
    '## Findings by severity',
  ];
  const bySeverity = ['critical', 'high', 'medium', 'low', 'info'].filter((s) =>
    report.findings.some((f) => f.severity === s)
  );
  for (const severity of bySeverity) {
    const list = report.findings.filter((f) => f.severity === severity);
    lines.push('', `### ${severity} (${list.length} finding(s))`, '');
    for (const f of list) {
      lines.push(`#### ${f.title}`, `- **File:** ${f.file}${f.lineStart != null ? ` (line ${f.lineStart}${f.lineEnd != null && f.lineEnd !== f.lineStart ? `–${f.lineEnd}` : ''})` : ''}`, '', f.explanation || '', '', '**Suggested fix:**', '```', (f.suggestedFix || '').trim(), '```', '');
    }
  }
  return lines.join('\n');
}

function reportToHtml(report) {
  const md = reportToMarkdown(report);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${report.repoName} – Audit Report</title></head>
<body><pre style="font-family: system-ui; white-space: pre-wrap;">${md.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body>
</html>`;
}

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const shareRef = useRef(null);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/report/${id}` : '';
  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyFeedback('Link copied');
      setTimeout(() => setCopyFeedback(''), 2000);
      setShareOpen(false);
    });
  };
  const handleCopyReport = () => {
    if (!report) return;
    navigator.clipboard.writeText(reportToMarkdown(report)).then(() => {
      setCopyFeedback('Report copied');
      setTimeout(() => setCopyFeedback(''), 2000);
      setShareOpen(false);
    });
  };
  const handleDownloadMarkdown = () => {
    if (!report) return;
    const blob = new Blob([reportToMarkdown(report)], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(report.repoName || 'report').replace(/\s+/g, '-')}-audit.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    setShareOpen(false);
  };
  const handleDownloadHtml = () => {
    if (!report) return;
    const blob = new Blob([reportToHtml(report)], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(report.repoName || 'report').replace(/\s+/g, '-')}-audit.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    setShareOpen(false);
  };
  const handlePrint = () => {
    window.print();
    setShareOpen(false);
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchReport() {
      try {
        const res = await fetch(`${API_URL}/api/audit/${id}`);
        if (cancelled) return;
        if (res.status === 404) {
          setError('Report not found');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setReport(data);
        if (data.status === 'complete' || data.status === 'failed') setLoading(false);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load report');
        setLoading(false);
      }
    }
    fetchReport();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!report || report.status === 'complete' || report.status === 'failed') return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/audit/${id}`);
        const data = await res.json();
        setReport(data);
        if (data.status === 'complete' || data.status === 'failed') setLoading(false);
      } catch (_) {}
    }, 2000);
    return () => clearInterval(t);
  }, [id, report?.status]);

  useEffect(() => {
    function onDocClick(e) {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false);
    }
    if (shareOpen) document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [shareOpen]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <LandingBackground />
        <p className="text-red-400 relative z-10">{error}</p>
        <a href="/" className="mt-4 text-cyan-400 hover:text-cyan-300 transition relative z-10">← Back to home</a>
      </div>
    );
  }

  if (loading && (!report || report.status !== 'complete')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <LandingBackground />
        <div className="relative z-10 w-full max-w-xl">
          <AuditStream reportId={id} onComplete={() => setLoading(false)} />
        </div>
      </div>
    );
  }

  if (report?.status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <LandingBackground />
        <p className="text-red-400 mb-4 relative z-10">{report.errorMessage || 'Audit failed'}</p>
        <a href="/" className="text-cyan-400 hover:text-cyan-300 transition relative z-10">← Back to home</a>
      </div>
    );
  }

  if (!report || report.status !== 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <LandingBackground />
        <p className="text-slate-400 relative z-10">Loading report…</p>
      </div>
    );
  }

  const bySeverity = ['critical', 'high', 'medium', 'low', 'info'].filter((s) =>
    report.findings.some((f) => f.severity === s)
  );

  return (
    <div className="min-h-screen relative">
      <LandingBackground />
      <div className="relative z-10 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-4xl lg:max-w-6xl mx-auto w-full">
        <header className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition">
            <Logo size={24} />
            <span>Back</span>
          </a>
          <div className="relative" ref={shareRef}>
            <button
              type="button"
              onClick={() => setShareOpen((o) => !o)}
              className="px-4 py-2 rounded-xl border border-cyan-400/40 bg-slate-900/80 hover:bg-slate-800/90 hover:border-cyan-400/60 text-white text-sm font-medium transition shadow-[0_0_16px_-4px_rgba(34,211,238,0.2)] flex items-center gap-2"
            >
              {copyFeedback || 'Share / Export'}
              <span className="text-slate-500">▾</span>
            </button>
            {shareOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 min-w-[200px] rounded-lg border border-slate-700/60 bg-slate-900/95 shadow-xl z-20">
                <button type="button" onClick={handleCopyLink} className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/80 rounded-t-lg">
                  Copy link
                </button>
                <button type="button" onClick={handleCopyReport} className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/80">
                  Copy report
                </button>
                <button type="button" onClick={handleDownloadMarkdown} className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/80">
                  Download Markdown
                </button>
                <button type="button" onClick={handleDownloadHtml} className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/80">
                  Download HTML
                </button>
                <button type="button" onClick={handlePrint} className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/80 rounded-b-lg">
                  Print / Save as PDF
                </button>
              </div>
            )}
          </div>
        </header>

        <HealthScore score={report.healthScore} className="mb-8" />
        <h1 className="text-xl font-semibold text-white mb-2">{report.repoName}</h1>
        <p className="text-slate-400 text-sm mb-6">{report.repoUrl}</p>
        <p className="text-slate-300 mb-8">{report.summary}</p>

        <h2 className="text-lg font-semibold text-slate-200 mb-4">Findings by severity</h2>
        <div className="space-y-6">
          {bySeverity.map((severity) => (
            <div key={severity}>
              <div className="flex items-center gap-2 mb-3">
                <SeverityBadge severity={severity} />
                <span className="text-slate-400 text-sm">
                  {report.findings.filter((f) => f.severity === severity).length} finding(s)
                </span>
              </div>
              <div className="space-y-4">
                {report.findings
                  .filter((f) => f.severity === severity)
                  .map((f) => (
                    <ReportCard key={f.id} finding={f} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
