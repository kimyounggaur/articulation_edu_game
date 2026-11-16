import { forwardRef } from 'react';
export interface PenguinProps { pose?: 'stand' | 'jump' | 'land' | 'slide'; sx?: number; sy?: number }
/** Foot contact is the origin, so all postures can be swapped for new art later. */
export const Penguin = forwardRef<SVGGElement, PenguinProps>(function Penguin({ pose = 'stand', sx = 1, sy = 1 }, ref) {
  return <g ref={ref} transform={`rotate(${pose === 'slide' ? 78 : 0}) scale(${sx} ${sy})`}>
    <ellipse cx={-5} cy={-1.5} rx={5} ry={2.4} fill="#F28A3C" />
    <ellipse cx={5} cy={-1.5} rx={5} ry={2.4} fill="#F28A3C" />
    <ellipse cx={0} cy={-18} rx={12} ry={17} fill="var(--ink, #1B2145)" />
    <ellipse cx={2.5} cy={-14.5} rx={8} ry={12} fill="var(--paper, #FFFFFF)" />
    <ellipse cx={-8} cy={-15} rx={3.4} ry={9} fill="var(--ink, #1B2145)" transform="rotate(-8 -8 -15)" />
    <path d="M10.5 -26 L17.5 -23.4 L10.5 -21 Z" fill="#F28A3C" />
    <circle cx={5.4} cy={-27.4} r={2.2} fill="var(--paper, #FFFFFF)" /><circle cx={6.1} cy={-27.4} r={1.15} fill="var(--ink, #1B2145)" />
    <path d="M-11.2 -22.6 H11.2 V-18.4 H-11.2 Z" fill="var(--accent, #E4572E)" />
    <path d="M-9.5 -19 L-15.5 -11.5 L-10.6 -10.4 L-6 -18.4 Z" fill="var(--accent, #E4572E)" />
  </g>;
});
