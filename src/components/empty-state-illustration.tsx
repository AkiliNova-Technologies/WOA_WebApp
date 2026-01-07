export function EmptyStateIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Person sitting at desk with question mark */}
      <g transform="translate(60, 80)">
        {/* Question mark */}
        <path
          d="M 80 10 Q 80 0, 90 0 Q 100 0, 100 10 Q 100 20, 90 25 L 90 35"
          stroke="#F4A261"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="90" cy="45" r="3" fill="#F4A261" />

        {/* Desk */}
        <rect x="20" y="80" width="80" height="8" rx="2" fill="#E9C46A" />
        <rect x="22" y="88" width="4" height="20" fill="#E9C46A" />
        <rect x="94" y="88" width="4" height="20" fill="#E9C46A" />

        {/* Laptop on desk */}
        <path
          d="M 40 70 L 40 78 L 75 78 L 75 70 Z"
          fill="#2A9D8F"
          stroke="#264653"
          strokeWidth="1.5"
        />
        <rect x="38" y="78" width="40" height="2" rx="1" fill="#264653" />

        {/* Person body */}
        <ellipse cx="35" cy="60" rx="8" ry="10" fill="#8B4C84" />
        
        {/* Person head */}
        <circle cx="35" cy="45" r="8" fill="#E76F51" />
        
        {/* Person arms */}
        <path
          d="M 35 55 Q 25 60, 20 70"
          stroke="#E76F51"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 35 55 Q 45 58, 48 65"
          stroke="#E76F51"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Person legs */}
        <path
          d="M 35 70 L 30 90"
          stroke="#2A9D8F"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 35 70 L 40 90"
          stroke="#2A9D8F"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Small decorative plants */}
        <path
          d="M 5 100 Q 5 95, 8 93 M 5 100 Q 5 96, 2 94"
          stroke="#2A9D8F"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 110 100 Q 110 95, 107 93 M 110 100 Q 110 96, 113 94"
          stroke="#2A9D8F"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}