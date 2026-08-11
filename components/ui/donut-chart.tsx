import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

export interface DonutChartDatum {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartDatum[];
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

/**
 * A minimal SVG donut chart. Slices are drawn as rounded-cap ring arcs with
 * a small angular gap between them (the "surface gap" that keeps touching
 * marks visually separated), in the fixed categorical order the caller
 * passes — never re-sorted or re-colored here.
 */
export function DonutChart({ data, size = 160, strokeWidth = 24, trackColor = '#e2e8f0' }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  if (total <= 0) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
      </Svg>
    );
  }

  const visibleSlices = data.filter((d) => d.value > 0);

  // A single 100% slice can't be drawn as an SVG arc (start and end points
  // coincide on a full 360deg sweep, producing an invisible path) — draw a
  // plain full circle in that case instead.
  if (visibleSlices.length === 1) {
    return (
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={visibleSlices[0].color}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>
    );
  }

  const gapDegrees = 3;

  let cumulativeAngle = 0;

  return (
    <Svg width={size} height={size}>
      <G>
        {visibleSlices.map((slice, i) => {
          const angle = (slice.value / total) * 360;
          const startAngle = cumulativeAngle + gapDegrees / 2;
          const endAngle = cumulativeAngle + angle - gapDegrees / 2;
          cumulativeAngle += angle;

          if (endAngle <= startAngle) return null;

          return (
            <Path
              key={`${slice.label}-${i}`}
              d={describeArc(cx, cy, radius, startAngle, endAngle)}
              stroke={slice.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
      </G>
    </Svg>
  );
}
