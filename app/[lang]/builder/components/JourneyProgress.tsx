"use client";

import React from "react";

/**
 * Purely presentational. Six lighting "scenes" (city haze -> deep mountains ->
 * sunrise arrival) are pre-rendered as stacked SVG groups and crossfaded by
 * opacity; only the active scene, the marker's cx/cy and the route reveal
 * change with `currentStep`, so advancing a step is a handful of attribute/
 * opacity transitions, not a re-render of the scene. No JS animation loop, no
 * external assets. `prefers-reduced-motion` is already handled sitewide in
 * globals.css (zeroes all animation/transition durations), so this component
 * needs no reduced-motion branching of its own.
 */

const VIEWBOX_W = 640;
const VIEWBOX_H = 150;
const LEFT_PAD = 24;
const USABLE_W = VIEWBOX_W - LEFT_PAD * 2;

const FAR_POINTS = `0,${VIEWBOX_H} 0,100 80,65 170,95 260,50 360,85 460,40 560,75 ${VIEWBOX_W},55 ${VIEWBOX_W},${VIEWBOX_H}`;
const NEAR_POINTS = `0,${VIEWBOX_H} 0,122 100,90 190,115 300,75 420,110 540,70 ${VIEWBOX_W},100 ${VIEWBOX_W},${VIEWBOX_H}`;

interface Scene {
  sky: [string, string, string];
  far: [string, string];
  near: [string, string];
  clouds: number;
  glow: string;
  glowR: number;
  glowY: number;
  ridgeLight: string;
}

// city haze -> leaving the city -> foothills -> inside the mountains ->
// deep valley -> sunrise arrival at the peak.
const SCENES: Scene[] = [
  { sky: ["#eef2f7", "#dbe4ee", "#dbe4ee"], far: ["#dbe4ee", "#aebccb"], near: ["#aebccb", "#7c8fa3"], clouds: 0.55, glow: "#fef3c7", glowR: 14, glowY: 0.82, ridgeLight: "transparent" },
  { sky: ["#e2e8f0", "#c9d8dc", "#b6cdbf"], far: ["#c3d6cd", "#8fae9c"], near: ["#8fae9c", "#5d8a74"], clouds: 0.35, glow: "#fde68a", glowR: 15, glowY: 0.68, ridgeLight: "transparent" },
  { sky: ["#c9d8dc", "#9dbfae", "#6fa88d"], far: ["#93c0a6", "#5c9a7c"], near: ["#4f8a70", "#2f6b52"], clouds: 0.15, glow: "#fcd34d", glowR: 16, glowY: 0.5, ridgeLight: "transparent" },
  { sky: ["#7fae95", "#3f8d6c", "#1f7a5c"], far: ["#5fa483", "#2f7a5c"], near: ["#1f6b4f", "#0f4a37"], clouds: 0, glow: "#fbbf24", glowR: 17, glowY: 0.36, ridgeLight: "transparent" },
  { sky: ["#1f7a5c", "#10543f", "#0c342a"], far: ["#2f6b52", "#123f30"], near: ["#0c3d2e", "#06251c"], clouds: 0, glow: "#f59e0b", glowR: 18, glowY: 0.22, ridgeLight: "rgba(251,191,36,0.35)" },
  { sky: ["#3b2410", "#7a4a1f", "#f5b942"], far: ["#3a2a1c", "#1c130d"], near: ["#170f0a", "#0a0705"], clouds: 0, glow: "#fbbf24", glowR: 30, glowY: 0.12, ridgeLight: "rgba(251,191,36,0.9)" },
];

interface Waypoint {
  x: number;
  y: number;
}

function buildWaypoints(totalSteps: number): Waypoint[] {
  const points: Waypoint[] = [];
  for (let i = 1; i <= totalSteps; i++) {
    const fraction = i / totalSteps;
    points.push({
      x: LEFT_PAD + fraction * USABLE_W,
      y: 112 - fraction * 92, // ascend from near the base to near the peak
    });
  }
  return points;
}

// Catmull-Rom -> cubic-bezier so the trail reads as a natural curve rather
// than a graph-line of straight segments.
function buildSmoothPath(points: Waypoint[]): string {
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

interface JourneyProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

export default function JourneyProgress({ currentStep, totalSteps, stepLabel }: JourneyProgressProps) {
  const waypoints = buildWaypoints(totalSteps);
  const activeIndex = Math.min(Math.max(currentStep, 1), totalSteps) - 1;
  const marker = waypoints[activeIndex];
  const progressFraction = currentStep / totalSteps;
  const fullPath = buildSmoothPath(waypoints);
  const isArrived = currentStep >= totalSteps;
  const showDiscoveryPins = currentStep >= 4;
  const scene = SCENES[Math.min(activeIndex, SCENES.length - 1)];

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuetext={stepLabel}
      className="relative w-full overflow-hidden rounded-2xl shadow-sm h-24 sm:h-32"
    >
      {/* Sky: 6 stacked gradients crossfaded by opacity — city haze -> dusk mountains -> sunrise. */}
      {SCENES.map((s, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            backgroundImage: `linear-gradient(150deg, ${s.sky[0]} 0%, ${s.sky[1]} 50%, ${s.sky[2]} 100%)`,
            opacity: currentStep === i + 1 ? 1 : 0,
          }}
        />
      ))}

      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          {SCENES.map((s, i) => (
            <React.Fragment key={i}>
              <linearGradient id={`far-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.far[0]} />
                <stop offset="100%" stopColor={s.far[1]} />
              </linearGradient>
              <linearGradient id={`near-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.near[0]} />
                <stop offset="100%" stopColor={s.near[1]} />
              </linearGradient>
            </React.Fragment>
          ))}
          <filter id="journey-cloud-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Shaded mountain layers per scene — light-to-shadow gradients read as
            faceted terrain (depth) without any 3D transforms. */}
        {SCENES.map((s, i) => (
          <g key={i} style={{ opacity: currentStep === i + 1 ? 1 : 0, transition: "opacity 0.7s ease-out" }}>
            <polygon points={FAR_POINTS} fill={`url(#far-${i})`} />
            {s.clouds > 0 && (
              <>
                <ellipse cx={150} cy={78} rx={46} ry={10} fill="white" opacity={s.clouds} filter="url(#journey-cloud-blur)" />
                <ellipse cx={420} cy={60} rx={36} ry={8} fill="white" opacity={s.clouds * 0.7} filter="url(#journey-cloud-blur)" />
              </>
            )}
            <polygon
              points={NEAR_POINTS}
              fill={`url(#near-${i})`}
              stroke={s.ridgeLight}
              strokeWidth={1.5}
            />
          </g>
        ))}

        {/* The road ahead — always faintly visible, full length. */}
        <path d={fullPath} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2} strokeDasharray="3 7" strokeLinecap="round" />

        {/* Traveled portion — reveals via stroke-dashoffset as steps complete. */}
        <path
          d={fullPath}
          fill="none"
          stroke="#34d399"
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          style={{ strokeDashoffset: 100 - progressFraction * 100, transition: "stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)" }}
        />

        {/* Discovery pins — small optional-experience markers, from step 4 on. */}
        {showDiscoveryPins &&
          [waypoints[2], waypoints[3]].map((p, i) => (
            <circle
              key={i}
              cx={p.x + 18}
              cy={p.y - 14}
              r={3.5}
              fill="#fde68a"
              stroke="#f59e0b"
              strokeWidth={1}
              style={{ opacity: showDiscoveryPins ? 0.9 : 0, transition: "opacity 0.7s ease-out" }}
            />
          ))}

        {/* Sun / arrival glow — rises and warms as the journey progresses. */}
        <circle
          cx={waypoints[totalSteps - 1].x - 4}
          cy={VIEWBOX_H * scene.glowY}
          r={scene.glowR}
          className={isArrived ? "animate-pulse" : ""}
          style={{ fill: scene.glow, opacity: isArrived ? 0.55 : 0.28, filter: "blur(7px)", transition: "fill 0.7s ease-out, opacity 0.7s ease-out, r 0.7s ease-out" }}
        />

        {/* Grounded shadow — keeps the marker feeling attached to the slope. */}
        <ellipse
          cx={marker.x}
          cy={marker.y + 7}
          rx={7}
          ry={2}
          fill="rgba(0,0,0,0.28)"
          style={{ transition: "cx 0.7s cubic-bezier(0.16,1,0.3,1), cy 0.7s cubic-bezier(0.16,1,0.3,1)" }}
        />

        {/* Traveler marker — rides the traveled portion of the route. */}
        <circle
          cx={marker.x}
          cy={marker.y}
          r={6}
          fill="#059669"
          stroke="white"
          strokeWidth={2}
          className={isArrived ? "animate-bounce-slow" : ""}
          style={{ transition: "cx 0.7s cubic-bezier(0.16,1,0.3,1), cy 0.7s cubic-bezier(0.16,1,0.3,1)" }}
        />
        {isArrived && (
          <circle
            cx={marker.x}
            cy={marker.y}
            r={11}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={1.5}
            className="animate-pulse"
            style={{ opacity: 0.7 }}
          />
        )}
      </svg>

      {/* Step ticks — legible fallback with motion off, and on its own without the visual. */}
      <div className="absolute bottom-1.5 sm:bottom-2 left-0 right-0 flex justify-center gap-1.5 sm:gap-2" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
              i + 1 <= currentStep ? "bg-emerald-400" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
