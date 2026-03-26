"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface LogoAnimationProps {
  size?: number;
  className?: string;
  isHovered?: boolean;
}

/**
 * Animated logo that transitions from the filled icon to the empty icon on hover.
 *
 * Animation:
 * - Initial load: starts with empty icon quadrants visible, fades them out one-by-one
 *   with exponential speed (each quadrant fades faster than the previous)
 * - Hover in: quadrants fade in one-by-one with exponential speed, then full empty shows
 * - Hover out: quadrants fade out one-by-one with exponential speed
 */
export function LogoAnimation({
  size = 28,
  className = "",
  isHovered: externalHovered,
}: LogoAnimationProps) {
  const [internalHovered, setInternalHovered] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const hovered = externalHovered ?? internalHovered;

  // Track which quadrants are visible (0-4, where 0 = none, 4 = all)
  // Also track if full empty is shown (separate state)
  const [visibleCount, setVisibleCount] = useState(4); // Start with all 4 visible
  const [showFullEmpty, setShowFullEmpty] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  // Play initial animation on mount: fade out quadrants exponentially
  useEffect(() => {
    // Exponential delays: each subsequent quadrant fades faster
    const delays = [250, 180, 120, 80];
    let cumulative = 0;
    delays.forEach((delay) => {
      cumulative += delay;
      timerRef.current.push(
        setTimeout(() => setVisibleCount((prev) => Math.max(0, prev - 1)), cumulative),
      );
    });
    timerRef.current.push(setTimeout(() => setIsInitial(false), cumulative + 100));

    return clearTimers;
  }, [clearTimers]);

  // Hover animation (only after initial)
  useEffect(() => {
    if (isInitial) return;

    clearTimers();

    if (hovered) {
      // Fade in quadrants with exponential speed
      setShowFullEmpty(false);
      const delays = [200, 140, 90, 60];
      let cumulative = 0;
      delays.forEach((delay) => {
        cumulative += delay;
        timerRef.current.push(
          setTimeout(() => setVisibleCount((prev) => Math.min(4, prev + 1)), cumulative),
        );
      });
      // Show full empty after all quadrants (don't hide quadrants - full empty covers them)
      timerRef.current.push(setTimeout(() => setShowFullEmpty(true), cumulative + 100));
    } else {
      // Fade out quadrants with exponential speed
      setShowFullEmpty(false);
      const delays = [180, 120, 80, 50];
      let cumulative = 0;
      delays.forEach((delay) => {
        cumulative += delay;
        timerRef.current.push(
          setTimeout(() => setVisibleCount((prev) => Math.max(0, prev - 1)), cumulative),
        );
      });
    }

    return clearTimers;
  }, [hovered, isInitial, clearTimers]);

  // Quadrant clip regions (top-left, top-right, bottom-left, bottom-right)
  const quadrants: Array<{ x: number; y: number; q: number }> = [
    { x: 0, y: 0, q: 1 }, // top-left
    { x: 50, y: 0, q: 2 }, // top-right
    { x: 0, y: 50, q: 3 }, // bottom-left
    { x: 50, y: 50, q: 4 }, // bottom-right
  ];

  // Bouncy easing for opacity
  const bounceEasing = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  const radius = size * 0.25;

  return (
    <div
      className={className}
      role="img"
      aria-label="Struktur"
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
      onMouseEnter={() => setInternalHovered(true)}
      onMouseLeave={() => setInternalHovered(false)}
      onFocus={() => setInternalHovered(true)}
      onBlur={() => setInternalHovered(false)}
    >
      {/* Base layer: filled icon */}
      <img
        src="/struktur-icon.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius: radius,
          display: "block",
        }}
        draggable={false}
      />

      {/* 4 quadrant slices of the empty icon */}
      {quadrants.map(({ x, y, q }) => {
        const visible = q <= visibleCount;

        return (
          <div
            key={q}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              opacity: visible ? 1 : 0,
              transition: `opacity 120ms ${bounceEasing}`,
              pointerEvents: "none",
              clipPath: `inset(${y}% ${x === 0 ? 50 : 0}% ${y === 0 ? 50 : 0}% ${x}%)`,
              borderRadius: radius,
            }}
          >
            <img
              src="/struktur-icon-empty.webp"
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                borderRadius: radius,
                display: "block",
              }}
              draggable={false}
            />
          </div>
        );
      })}

      {/* Full empty icon – on top of quadrants, shown when all are faded in */}
      <img
        src="/struktur-icon-empty.webp"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius: radius,
          display: "block",
          opacity: showFullEmpty ? 1 : 0,
          transition: `opacity 150ms ${bounceEasing}`,
          pointerEvents: "none",
        }}
        draggable={false}
      />
    </div>
  );
}
