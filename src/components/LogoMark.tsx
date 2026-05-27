interface LogoMarkProps {
  size?: number;
  navy?: string;
  orange?: string;
}

export function LogoMark({ size = 40, navy = "#14375F", orange = "#E86C1C" }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={{ display: "block" }}>
      <path d="M9 32 L32 11 L55 32 L55 55 L9 55 Z" fill="none" stroke={navy} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M20 21 L20 14 L26 14 L26 26" fill="none" stroke={navy} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M22 34 L30 43 L47 20" fill="none" stroke={orange} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
