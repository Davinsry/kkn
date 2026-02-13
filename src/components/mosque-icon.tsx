export const MosqueIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {/* Ground */}
        <path d="M2 21h20" />

        {/* Side Minarets */}
        <path d="M4 21V10" />
        <path d="M3 10h2" />
        <path d="M4 10V8" />
        <path d="M4 8l-1-1 1-1 1 1-1 1z" />

        <path d="M20 21V10" />
        <path d="M19 10h2" />
        <path d="M20 10V8" />
        <path d="M20 8l-1-1 1-1 1 1-1 1z" />

        {/* Dome Building */}
        <path d="M6 21v-5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5" />
        <path d="M7 16c0-4 2.2-7 5-7s5 3 5 7" />

        {/* Crescent Moon and Star Spire */}
        <path d="M12 9V5" />
        <path d="M11 5a2 2 0 1 1 2 0" />
        <circle cx="12" cy="2" r="0.5" fill="currentColor" stroke="none" />
    </svg>
);
