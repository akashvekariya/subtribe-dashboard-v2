import React, {
  memo,
  useState,
  useEffect,
  useId,
  useMemo,
  useCallback,
} from "react";
import { getColor, getScoreColor, type ColorSet } from "./colors";
import type { CategoryScore } from "./types";

// Re-export types
export type { CategoryScore };

interface ScoreRingProps {
  categories: CategoryScore[];
  totalScore: number;
  maxTotalScore: number;
  size?: number;
  strokeWidth?: number;
  gapDegrees?: number;
}

// SVG Arc utilities
const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeRoundedArc = (
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  start: number,
  end: number,
  corner: number = 6
): string => {
  const arcDeg = end - start;
  if (arcDeg < 0.5) return "";

  const mid = (outer + inner) / 2;
  const thickness = outer - inner;
  const arcLen = ((arcDeg * Math.PI) / 180) * mid;
  const cr = Math.min(corner, thickness / 2, arcLen / 4);
  const offset = (cr / mid) * (180 / Math.PI);

  const adjStart = start + offset;
  const adjEnd = end - offset;
  const pt = (r: number, a: number) => polarToCartesian(cx, cy, r, a);

  if (adjEnd <= adjStart) {
    const flag = arcDeg <= 180 ? "0" : "1";
    return `M ${pt(outer, start).x} ${pt(outer, start).y} A ${outer} ${outer} 0 ${flag} 1 ${pt(outer, end).x} ${pt(outer, end).y} L ${pt(inner, end).x} ${pt(inner, end).y} A ${inner} ${inner} 0 ${flag} 0 ${pt(inner, start).x} ${pt(inner, start).y} Z`;
  }

  const flag = adjEnd - adjStart <= 180 ? "0" : "1";
  const os = pt(outer, adjStart),
    oe = pt(outer, adjEnd);
  const is = pt(inner, adjStart),
    ie = pt(inner, adjEnd);
  const osc = pt(outer - cr, start),
    oec = pt(outer - cr, end);
  const isc = pt(inner + cr, start),
    iec = pt(inner + cr, end);
  const osq = pt(outer, start),
    oeq = pt(outer, end);
  const isq = pt(inner, start),
    ieq = pt(inner, end);

  return `M ${osc.x} ${osc.y} Q ${osq.x} ${osq.y} ${os.x} ${os.y} A ${outer} ${outer} 0 ${flag} 1 ${oe.x} ${oe.y} Q ${oeq.x} ${oeq.y} ${oec.x} ${oec.y} L ${iec.x} ${iec.y} Q ${ieq.x} ${ieq.y} ${ie.x} ${ie.y} A ${inner} ${inner} 0 ${flag} 0 ${is.x} ${is.y} Q ${isq.x} ${isq.y} ${isc.x} ${isc.y} Z`;
};

// Segment component (memoized for performance)
interface SegmentProps {
  segment: {
    id: string;
    colors: ColorSet;
    start: number;
    end: number;
    filledEnd: number;
    score: number;
  };
  center: number;
  inner: number;
  outer: number;
  expandSize: number;
  isHovered: boolean;
  isPulsing: boolean;
  isDimmed: boolean;
  patternId: string;
  clipId: string;
}

const Segment = memo<SegmentProps>(
  ({
    segment: s,
    center,
    inner,
    outer,
    expandSize,
    isHovered,
    isPulsing,
    isDimmed,
    patternId,
    clipId,
  }) => {
    const isExpanded = isHovered || isPulsing;
    const expandOuter = outer + 6;
    const expandInner = inner - 2;

    return (
      <g
        style={{
          opacity: isDimmed ? 0.4 : 1,
          transition: "opacity 150ms",
          pointerEvents: "none",
        }}
      >
        <g
          style={{
            opacity: isExpanded ? 0 : 1,
            transition: "opacity 150ms ease-in-out",
          }}
        >
          <path
            d={describeRoundedArc(
              center,
              center,
              inner,
              outer,
              s.start,
              s.end,
              6
            )}
            fill={s.colors.bg}
          />
          <rect
            width={expandSize}
            height={expandSize}
            fill={`url(#${patternId})`}
            clipPath={`url(#${clipId})`}
          />
          {s.score > 0 && (
            <path
              d={describeRoundedArc(
                center,
                center,
                inner,
                outer,
                s.start,
                s.filledEnd,
                6
              )}
              fill={s.colors.filled}
            />
          )}
        </g>
        <g
          style={{
            opacity: isExpanded ? 1 : 0,
            transition: "opacity 150ms ease-in-out",
          }}
        >
          <path
            d={describeRoundedArc(
              center,
              center,
              expandInner,
              expandOuter,
              s.start,
              s.end,
              6
            )}
            fill={s.colors.bg}
          />
          <rect
            width={expandSize}
            height={expandSize}
            fill={`url(#${patternId})`}
            clipPath={`url(#${clipId})`}
          />
          {s.score > 0 && (
            <path
              d={describeRoundedArc(
                center,
                center,
                expandInner,
                expandOuter,
                s.start,
                s.filledEnd,
                6
              )}
              fill={s.colors.filled}
            />
          )}
        </g>
      </g>
    );
  }
);

// Main component
export const ScoreRing = memo<ScoreRingProps>(
  ({
    categories,
    totalScore,
    maxTotalScore,
    size = 280,
    strokeWidth = 24,
    gapDegrees = 2,
  }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [pulseId, setPulseId] = useState<string | null>(null);
    const id = useId();

    // Idle animation
    useEffect(() => {
      if (hoveredId) return;

      const runPulse = () => {
        let i = 0;
        const pulse = () => {
          if (i < categories.length) {
            setPulseId(categories[i].id);
            i++;
            setTimeout(pulse, 120);
          } else {
            setPulseId(null);
          }
        };
        pulse();
      };

      const interval = setInterval(runPulse, 8000);
      const initialDelay = setTimeout(runPulse, 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(initialDelay);
      };
    }, [hoveredId, categories]);

    // Memoized calculations
    const {
      center,
      outer,
      inner,
      innerRingOuter,
      innerRingInner,
      centerRadius,
      expandSize,
    } = useMemo(() => {
      const expandSize = size + 16;
      const center = expandSize / 2;
      const outer = (size - 20) / 2;
      const inner = outer - strokeWidth;
      const innerRingOuter = inner - 8;
      const innerRingInner = innerRingOuter - 8;
      const centerRadius = innerRingInner - 8;
      return {
        center,
        outer,
        inner,
        innerRingOuter,
        innerRingInner,
        centerRadius,
        expandSize,
      };
    }, [size, strokeWidth]);

    // Memoized segments
    const segments = useMemo(() => {
      const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);
      const availDeg = 360 - gapDegrees * categories.length;

      let angle = 0;
      return categories.map((cat) => {
        const segDeg = (cat.weight / totalWeight) * availDeg;
        const seg = {
          ...cat,
          colors: getColor(cat.color),
          start: angle,
          end: angle + segDeg,
          filledEnd: angle + segDeg * (cat.score / cat.maxScore),
        };
        angle = seg.end + gapDegrees;
        return seg;
      });
    }, [categories, gapDegrees]);

    const pct = useMemo(
      () => Math.round((totalScore / maxTotalScore) * 100),
      [totalScore, maxTotalScore]
    );
    const scoreColors = useMemo(() => getScoreColor(pct), [pct]);
    const hoveredSegment = hoveredId
      ? segments.find((s) => s.id === hoveredId)
      : null;

    const handleMouseEnter = useCallback(
      (segId: string) => setHoveredId(segId),
      []
    );
    const handleMouseLeave = useCallback(() => setHoveredId(null), []);

    return (
      <div
        className="relative inline-flex items-center justify-center overflow-hidden"
        style={{ width: expandSize, height: expandSize }}
      >
        <svg
          width={expandSize}
          height={expandSize}
          viewBox={`0 0 ${expandSize} ${expandSize}`}
        >
          <defs>
            {segments.map((s) => (
              <React.Fragment key={s.id}>
                <pattern
                  id={`dot-${id}-${s.id}`}
                  patternUnits="userSpaceOnUse"
                  width="3"
                  height="3"
                >
                  <circle cx="1.5" cy="1.5" r="0.5" fill={s.colors.dot} />
                </pattern>
                <clipPath id={`clip-${id}-${s.id}`}>
                  <path
                    d={describeRoundedArc(
                      center,
                      center,
                      inner,
                      outer,
                      s.start,
                      s.end,
                      6
                    )}
                  />
                </clipPath>
              </React.Fragment>
            ))}
          </defs>

          {segments.map((s) => (
            <Segment
              key={s.id}
              segment={s}
              center={center}
              inner={inner}
              outer={outer}
              expandSize={expandSize}
              isHovered={hoveredId === s.id}
              isPulsing={pulseId === s.id && !hoveredId}
              isDimmed={hoveredId !== null && hoveredId !== s.id}
              patternId={`dot-${id}-${s.id}`}
              clipId={`clip-${id}-${s.id}`}
            />
          ))}

          {segments.map((s) => (
            <path
              key={`hit-${s.id}`}
              d={describeRoundedArc(
                center,
                center,
                inner,
                outer,
                s.start,
                s.end,
                6
              )}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => handleMouseEnter(s.id)}
              onMouseLeave={handleMouseLeave}
            />
          ))}

          <g
            style={{
              opacity: hoveredId ? 0.4 : 1,
              transition: "opacity 150ms",
            }}
          >
            <path
              d={describeRoundedArc(
                center,
                center,
                innerRingInner,
                innerRingOuter,
                0,
                359.99,
                4
              )}
              fill={scoreColors.bg}
            />
            {pct > 0 && (
              <path
                d={describeRoundedArc(
                  center,
                  center,
                  innerRingInner,
                  innerRingOuter,
                  0,
                  (pct / 100) * 360,
                  4
                )}
                fill={scoreColors.filled}
              />
            )}
          </g>

          <circle
            cx={center}
            cy={center}
            r={centerRadius}
            fill="white"
            className="drop-shadow-sm"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredSegment ? (
            <>
              <span
                className="text-3xl font-bold"
                style={{ color: hoveredSegment.colors.filled }}
              >
                {hoveredSegment.score}/{hoveredSegment.maxScore}
              </span>
              <span className="text-sm text-zinc-600 mt-1 max-w-[120px] text-center leading-tight">
                {hoveredSegment.name}
              </span>
              <span className="text-xs text-zinc-400 mt-0.5">
                Accounts for {hoveredSegment.weight}%
              </span>
            </>
          ) : (
            <>
              <span
                className="text-3xl font-bold"
                style={{ color: scoreColors.filled }}
              >
                {parseFloat(((totalScore / maxTotalScore) * 10).toFixed(2))}/10
              </span>
              <span className="text-sm text-zinc-600 mt-1">Overall Score</span>
            </>
          )}
        </div>
      </div>
    );
  }
);

// Legend component
export const ScoreRingLegend = memo<{ categories: CategoryScore[] }>(
  ({ categories }) => (
    <div className="flex flex-col gap-2">
      {categories.map((cat) => {
        const colors = getColor(cat.color);
        const pct = Math.round((cat.score / cat.maxScore) * 100);
        return (
          <div key={cat.id} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors.filled }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <span className="text-sm font-medium text-zinc-700 truncate">
                  {cat.name}
                </span>
                <span className="text-sm text-zinc-500">
                  {cat.score}/{cat.maxScore}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: colors.filled }}
                  />
                </div>
                <span className="text-xs text-zinc-400 w-8 text-right">
                  {cat.weight}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
);

// Combined component
export const ScoreRingWithLegend = memo<
  ScoreRingProps & { showLegend?: boolean }
>(({ showLegend = true, ...props }) => (
  <div className="flex items-start gap-8">
    <ScoreRing {...props} />
    {showLegend && (
      <div className="flex-1 min-w-[200px] pt-4">
        <ScoreRingLegend categories={props.categories} />
      </div>
    )}
  </div>
));

export default ScoreRing;
