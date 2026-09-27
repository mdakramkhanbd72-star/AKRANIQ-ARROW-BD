import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ArrowDirectionType,
  ArrowModel,
  GameThemePalette,
  SlidingArrowAnimation,
  ARROW_DIRECTIONS,
} from '../types/game';
import { getGroupColor } from '../core/constants';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ArrowBoardViewProps {
  gridSize: number;
  arrows: ArrowModel[];
  mask: Set<string>;
  slidingArrows: Record<string, SlidingArrowAnimation>;
  shakingArrows: Set<string>;
  onArrowTapped: (arrowId: string) => void;
  boardOpacity?: number;
  theme: GameThemePalette;
  isDark?: boolean;
}

export const ArrowBoardView: React.FC<ArrowBoardViewProps> = ({
  gridSize,
  arrows,
  mask,
  slidingArrows,
  shakingArrows,
  onArrowTapped,
  boardOpacity = 1.0,
  theme,
  isDark = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scale, setScale] = useState<number>(1.0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number }>({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // Reset zoom & pan when gridSize changes
  useEffect(() => {
    const initialScale = gridSize <= 8 ? 1.1 : gridSize <= 14 ? 1.0 : 0.9;
    setScale(initialScale);
    setOffset({ x: 0, y: 0 });
  }, [gridSize]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const boardPixelSize = Math.min(width, height) * 0.9 * scale;
      const cellSize = boardPixelSize / gridSize;
      const boardStartX = (width - boardPixelSize) / 2 + offset.x;
      const boardStartY = (height - boardPixelSize) / 2 + offset.y;

      const cellBaseColor = isDark ? theme.cellColorDark : theme.cellColorLight;
      const standardArrowColor = isDark ? theme.arrowColorDark : theme.arrowColorLight;
      const blockedColor = '#E53935';

      // 1. Clean board surface without four-cornered square cell boxes ("চার কোন আইক্কা ঘর")
      if (boardOpacity > 0.05) {
        ctx.globalAlpha = Math.max(0.05, Math.min(0.5, boardOpacity * 0.4));
        ctx.fillStyle = cellBaseColor;
        ctx.beginPath();
        ctx.roundRect(
          boardStartX - cellSize * 0.2,
          boardStartY - cellSize * 0.2,
          boardPixelSize + cellSize * 0.4,
          boardPixelSize + cellSize * 0.4,
          cellSize * 0.8
        );
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 2. Draw Idle & Shaking Arrows
      const now = Date.now();
      for (const arrow of arrows) {
        if (arrow.state === 'SLIDING' || slidingArrows[arrow.id]) continue;

        const isShaking = shakingArrows.has(arrow.id);
        let shakeX = 0;
        let shakeY = 0;
        if (isShaking) {
          const mag = cellSize * 0.16;
          const val = Math.sin(now * 0.04) * mag;
          if (arrow.direction === 'LEFT' || arrow.direction === 'RIGHT') {
            shakeY = val;
          } else {
            shakeX = val;
          }
        }

        const arrowColor = isShaking
          ? blockedColor
          : arrow.colorGroup !== null && arrow.colorGroup !== undefined
          ? getGroupColor(arrow.colorGroup, isDark)
          : standardArrowColor;

        drawArrowBodyAndHead(
          ctx,
          arrow.path,
          arrow.direction,
          boardStartX + shakeX,
          boardStartY + shakeY,
          cellSize,
          arrowColor,
          isDark
        );
      }

      // 3. Draw Sliding / Exiting Arrows with Luminous Laser Corridor
      for (const [id, anim] of Object.entries(slidingArrows)) {
        const arrow = arrows.find((a) => a.id === id);
        if (!arrow || !anim.waypoints || anim.waypoints.length === 0) continue;

        const arrowColor =
          arrow.colorGroup !== null && arrow.colorGroup !== undefined
            ? getGroupColor(arrow.colorGroup, isDark)
            : standardArrowColor;

        const waypoints = anim.waypoints;

        // Draw laser trajectory corridor beam
        if (waypoints.length > 1) {
          const fadeAlpha = Math.max(0.15, 1.0 - anim.progress * 0.5);

          // Outer aura glow
          ctx.save();
          ctx.beginPath();
          const p0 = waypoints[0];
          ctx.moveTo(
            boardStartX + (p0[1] + 0.5) * cellSize,
            boardStartY + (p0[0] + 0.5) * cellSize
          );
          for (let i = 1; i < waypoints.length; i++) {
            const pt = waypoints[i];
            ctx.lineTo(
              boardStartX + (pt[1] + 0.5) * cellSize,
              boardStartY + (pt[0] + 0.5) * cellSize
            );
          }
          ctx.strokeStyle = theme.laserGlowColor;
          ctx.lineWidth = cellSize * 0.52;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = 0.6 * fadeAlpha;
          ctx.stroke();

          // Bright inner core beam
          ctx.strokeStyle = theme.laserCoreColor;
          ctx.lineWidth = cellSize * 0.22;
          ctx.globalAlpha = 0.95 * fadeAlpha;
          ctx.stroke();
          ctx.restore();
        }

        // Animated position along waypoints
        const totalSegments = Math.max(1, waypoints.length - 1);
        const globalT = anim.progress * totalSegments;
        const segIdx = Math.min(waypoints.length - 2, Math.floor(globalT));
        const localT = Math.max(0, Math.min(1, globalT - segIdx));

        const pt0 = waypoints[segIdx];
        const pt1 = waypoints[segIdx + 1];

        const curHeadR = pt0[0] + (pt1[0] - pt0[0]) * localT;
        const curHeadC = pt0[1] + (pt1[1] - pt0[1]) * localT;

        const origHead = arrow.path[0];
        const deltaR = curHeadR - origHead[0];
        const deltaC = curHeadC - origHead[1];

        const animatedPath: [number, number][] = arrow.path.map(([r, c]) => [
          r + deltaR,
          c + deltaC,
        ]);

        const dr = pt1[0] - pt0[0];
        const dc = pt1[1] - pt0[1];
        let curDir: ArrowDirectionType = arrow.direction;
        if (dr < -0.1) curDir = 'UP';
        else if (dr > 0.1) curDir = 'DOWN';
        else if (dc < -0.1) curDir = 'LEFT';
        else if (dc > 0.1) curDir = 'RIGHT';

        ctx.save();
        ctx.globalAlpha = Math.max(0.2, 1.0 - anim.progress * 0.4);
        drawArrowBodyAndHead(
          ctx,
          animatedPath,
          curDir,
          boardStartX,
          boardStartY,
          cellSize,
          arrowColor,
          isDark
        );
        ctx.restore();
      }

      ctx.restore();

      // Continue animation if arrows are sliding or shaking
      if (Object.keys(slidingArrows).length > 0 || shakingArrows.size > 0) {
        animFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [
    gridSize,
    arrows,
    mask,
    slidingArrows,
    shakingArrows,
    scale,
    offset,
    boardOpacity,
    theme,
    isDark,
  ]);

  // Helper: draw arrow body and triangular head
  const drawArrowBodyAndHead = (
    ctx: CanvasRenderingContext2D,
    path: [number, number][],
    dir: ArrowDirectionType,
    boardStartX: number,
    boardStartY: number,
    cellSize: number,
    color: string,
    darkMode: boolean
  ) => {
    if (path.length === 0) return;
    const strokeWidth = cellSize * 0.42;
    const head = path[0];
    const headCenterX = boardStartX + (head[1] + 0.5) * cellSize;
    const headCenterY = boardStartY + (head[0] + 0.5) * cellSize;

    // Draw body segments if multi-cell
    if (path.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(
        boardStartX + (path[0][1] + 0.5) * cellSize,
        boardStartY + (path[0][0] + 0.5) * cellSize
      );
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(
          boardStartX + (path[i][1] + 0.5) * cellSize,
          boardStartY + (path[i][0] + 0.5) * cellSize
        );
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }

    // Draw Arrow Head Triangle
    const rot = (ARROW_DIRECTIONS[dir].rotationDegrees * Math.PI) / 180;
    const arrowSize = cellSize * 0.42;

    ctx.save();
    ctx.translate(headCenterX, headCenterY);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.moveTo(arrowSize * 1.15, 0);
    ctx.lineTo(-arrowSize * 0.55, -arrowSize * 0.95);
    ctx.lineTo(-arrowSize * 0.55, arrowSize * 0.95);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Tactile accent dot on head
    const dotColor = darkMode ? '#1E231C' : '#F2EFEA';
    ctx.beginPath();
    ctx.arc(0, 0, cellSize * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();

    ctx.restore();
  };

  // Click & Tap Handling with Mobile Smart Hit-Testing
  const touchStartTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only handle primary touch / left click
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    touchStartTimeRef.current = performance.now();
    touchStartPosRef.current = { x: clientX, y: clientY };
    isDraggingRef.current = false;

    dragStartRef.current = {
      x: clientX,
      y: clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // If not pressing pointer, ignore
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    if (touchStartTimeRef.current === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    const distSq = dx * dx + dy * dy;

    // Mobile drag threshold: 12px (so finger micro-movements on mobile screen are never treated as dragging)
    const dragThreshold = e.pointerType === 'touch' ? 14 : 8;

    if (distSq > dragThreshold * dragThreshold) {
      isDraggingRef.current = true;
      setIsDragging(true);
      setOffset({
        x: dragStartRef.current.offsetX + dx,
        y: dragStartRef.current.offsetY + dy,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const wasDragging = isDraggingRef.current;
    const startTime = touchStartTimeRef.current;
    touchStartTimeRef.current = 0;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (wasDragging) return;

    // Discard slow press-and-hold gestures (longer than 600ms) from being accidental taps
    const pressDuration = performance.now() - startTime;
    if (pressDuration > 650) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const boardPixelSize = Math.min(width, height) * 0.9 * scale;
    const cellSize = boardPixelSize / gridSize;
    const boardStartX = (width - boardPixelSize) / 2 + offset.x;
    const boardStartY = (height - boardPixelSize) / 2 + offset.y;

    const relX = tapX - boardStartX;
    const relY = tapY - boardStartY;

    // Floating fractional row/col of tap
    const tapColFraction = relX / cellSize;
    const tapRowFraction = relY / cellSize;

    // 1. Precise Smart Arrow Hit-Testing:
    // Instead of selecting whichever arrow random grid-cell rounding lands on,
    // evaluate the distance from the tap point to each idle arrow's path points,
    // prioritizing the arrow head, and picking the arrow closest to the finger center!
    interface ArrowCandidate {
      id: string;
      distSq: number;
      isHead: boolean;
    }

    const candidates: ArrowCandidate[] = [];

    // Max reach in cell units (e.g. 0.65 of a cell radius from arrow point center)
    const maxReachSq = 0.58 * 0.58;

    for (const arrow of arrows) {
      if (arrow.state !== 'IDLE' || slidingArrows[arrow.id]) continue;

      for (let i = 0; i < arrow.path.length; i++) {
        const pt = arrow.path[i];
        const centerR = pt[0] + 0.5;
        const centerC = pt[1] + 0.5;
        const dr = tapRowFraction - centerR;
        const dc = tapColFraction - centerC;
        const dSq = dr * dr + dc * dc;

        if (dSq <= maxReachSq) {
          candidates.push({
            id: arrow.id,
            // If tapping near head, give a slight priority boost
            distSq: i === 0 ? dSq * 0.85 : dSq,
            isHead: i === 0,
          });
        }
      }
    }

    if (candidates.length > 0) {
      // Sort candidates by closest distance to user tap center
      candidates.sort((a, b) => a.distSq - b.distSq);
      const bestTargetId = candidates[0].id;
      onArrowTapped(bestTargetId);
      return;
    }

    // Fallback: direct cell grid test
    const col = Math.floor(tapColFraction);
    const row = Math.floor(tapRowFraction);

    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      const hitArrow = arrows.find(
        (a) =>
          a.state === 'IDLE' &&
          !slidingArrows[a.id] &&
          a.path.some((pt) => pt[0] === row && pt[1] === col)
      );

      if (hitArrow) {
        onArrowTapped(hitArrow.id);
      }
    }
  };

  const handlePointerCancel = () => {
    touchStartTimeRef.current = 0;
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.6, Math.min(3.5, prev * zoomDelta)));
  };

  const handleZoomIn = () => setScale((prev) => Math.min(3.5, prev * 1.15));
  const handleZoomOut = () => setScale((prev) => Math.max(0.6, prev * 0.85));
  const handleReset = () => {
    setScale(1.0);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden touch-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer touch-none"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleWheel}
      />

      {/* Floating Zoom & Pan Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 p-1 bg-white/80 dark:bg-stone-800/80 backdrop-blur rounded-2xl shadow-md border border-stone-200/50 dark:border-stone-700/50">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
