import SeverityBadge from './SeverityBadge';

/** Render suggestedFix text with inline `code` and fenced ``` blocks in green; no code = plain text. */
function SuggestedFixProse({ text }) {
  if (!text?.trim()) return null;
  const segments = [];
  const fence = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let m;
  while ((m = fence.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, m.index) });
    }
    segments.push({ type: 'code', value: m[2].trimEnd(), lang: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) segments.push({ type: 'text', value: text.slice(lastIndex) });

  return (
    <>
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <span key={i}>
            {seg.value.split(/(`[^`]+`)/g).map((part, j) =>
              part.startsWith('`') && part.endsWith('`') ? (
                <code
                  key={j}
                  className="rounded px-1 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[13px]"
                >
                  {part.slice(1, -1)}
                </code>
              ) : (
                part
              )
            )}
          </span>
        ) : (
          <pre
            key={i}
            className="mt-2 p-3 max-h-[20rem] overflow-auto scrollbar-report-green rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-slate-300 whitespace-pre-wrap break-words font-mono text-[13px] border-l-4 border-emerald-500/70 bg-emerald-500/5"
          >
            {seg.value}
          </pre>
        )
      )}
    </>
  );
}

function CodeSnippet({ snippet, lineStart, lineEnd, snippetStartLine }) {
  if (!snippet || !snippet.trim()) return null;
  const lines = snippet.split('\n');
  const firstLineNum = snippetStartLine ?? lineStart ?? 1;
  const problemStart = lineStart ?? firstLineNum;
  const problemEnd = lineEnd != null ? lineEnd : problemStart;
  return (
    <div className="rounded-lg bg-[#0d1117] border border-slate-700/60 overflow-hidden mb-3 font-mono text-[13px]">
      <div className="flex border-b border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-500">
        <span className="font-sans">Code</span>
        {firstLineNum != null && (
          <span className="ml-2 text-slate-600">
            {problemEnd !== problemStart ? `lines ${problemStart}–${problemEnd} highlighted` : `line ${problemStart} highlighted`}
          </span>
        )}
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[24rem] scrollbar-report">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => {
              const lineNum = firstLineNum + i;
              const isProblem = lineNum >= problemStart && lineNum <= problemEnd;
              return (
                <tr key={i} className={isProblem ? 'bg-red-500/10' : ''}>
                  <td
                    className={`select-none pr-3 py-0.5 text-right align-top border-l-4 min-w-[2.5rem] ${
                      isProblem ? 'border-red-500/80 bg-red-500/5 text-red-400/90' : 'border-transparent text-slate-600'
                    }`}
                  >
                    {lineNum}
                  </td>
                  <td className="py-0.5 pl-2 text-slate-300 whitespace-pre break-all">
                    {line || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportCard({ finding }) {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-white/[0.03] p-4 hover:border-slate-600/80 transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-slate-200">{finding.title}</h3>
        <SeverityBadge severity={finding.severity} />
      </div>
      <p className="text-slate-400 text-sm mb-2 font-mono">
        {finding.file}
        {finding.lineStart != null && (
          <span className="text-slate-500">
            {finding.lineEnd != null && finding.lineEnd !== finding.lineStart
              ? ` (lines ${finding.lineStart}–${finding.lineEnd})`
              : ` (line ${finding.lineStart})`}
          </span>
        )}
      </p>
      {finding.affectedFiles?.length > 0 && (
        <p className="text-slate-500 text-xs mb-2 font-mono">
          Also in: {finding.affectedFiles.length <= 5
            ? finding.affectedFiles.join(', ')
            : `${finding.affectedFiles.slice(0, 3).join(', ')} and ${finding.affectedFiles.length - 3} more`}
        </p>
      )}
      <p className="text-slate-300 text-sm mb-3">{finding.explanation}</p>
      <CodeSnippet
        snippet={finding.codeSnippet}
        lineStart={finding.lineStart}
        lineEnd={finding.lineEnd}
        snippetStartLine={finding.snippetStartLine}
      />
      <div className="mt-3">
        <div className="text-xs text-slate-500 mb-1">Suggested fix</div>
        <div className="text-slate-300 text-sm">
          {finding.suggestedFixCode?.trim() ? (
            <>
              <p className="mb-2">{finding.suggestedFix?.trim() || 'Apply the fixed code below.'}</p>
              <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 overflow-hidden font-mono text-[13px]">
                <div className="border-b border-emerald-500/30 bg-emerald-900/20 px-3 py-1.5 text-xs text-emerald-400/90">
                  Fixed code
                </div>
                <div className="max-h-[20rem] overflow-auto scrollbar-report-green border-l-4 border-emerald-500/70 bg-emerald-500/5">
                  <pre className="p-3 text-slate-300 whitespace-pre-wrap break-words min-w-0">
                    {finding.suggestedFixCode.trim()}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-3 border-l-4 border-emerald-500/70 bg-emerald-500/5 whitespace-pre-wrap">
              <SuggestedFixProse text={finding.suggestedFix?.trim() || 'Review and fix as needed.'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
