import {ecosystemOrbitColors} from '@/lib/ecosystem-brand';

export function SegmentedOrbit({ className, innerStroke = "#FFFFFF" }: {
  className: string;
  innerStroke?: string;
}) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 400" className={`pointer-events-none ${className}`}>
      <g fill="none" strokeWidth="28" strokeLinecap="round">
        {ecosystemOrbitColors.map((color, index) => (
          <circle key={`${color}-${index}`} cx="200" cy="200" r="150" pathLength="100" stroke={color} strokeDasharray="8 92" strokeDashoffset={String(index * -12.5)} />
        ))}
      </g>
      <circle cx="200" cy="200" r="112" fill="none" stroke={innerStroke} strokeWidth="2" opacity="0.55" />
    </svg>
  );
}

