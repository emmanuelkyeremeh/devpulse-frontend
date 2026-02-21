/** Logo SVG for header – matches favicon mark, scalable */
export default function Logo({ className = '', size = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M9 8h4a5 5 0 1 1 0 10H9V8zm2 2v6h2a3 3 0 1 0 0-6h-2z"
        fill="currentColor"
        className="text-cyan-400"
      />
      <circle cx="22" cy="12" r="1.5" fill="currentColor" className="text-cyan-400" />
      <circle cx="26" cy="16" r="1.5" fill="currentColor" className="text-cyan-400" />
      <circle cx="22" cy="20" r="1.5" fill="currentColor" className="text-cyan-400" />
    </svg>
  );
}
