"use client";

import { useEffect, useRef, useCallback } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: "language" | "tool";
  highlighted: boolean;
}

interface Edge {
  source: string;
  target: string;
}

const LANGUAGES = [
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "java", label: "Java" },
];

const TOOLS = [
  { id: "django", label: "Django" },
  { id: "flask", label: "Flask" },
  { id: "fastapi", label: "FastAPI" },
  { id: "aspnet", label: "ASP.NET" },
  { id: "nodejs", label: "Node.js" },
  { id: "playwright", label: "Playwright" },
  { id: "sklearn", label: "Scikit-Learn" },
  { id: "numpy", label: "NumPy" },
  { id: "pandas", label: "Pandas" },
  { id: "aws", label: "AWS" },
  { id: "gcp", label: "GCP" },
  { id: "docker", label: "Docker" },
  { id: "jenkins", label: "Jenkins" },
  { id: "mongodb", label: "MongoDB" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "git", label: "Git" },
  { id: "cicd", label: "CI/CD" },
];

const EDGES: Edge[] = [
  { source: "python", target: "django" },
  { source: "python", target: "flask" },
  { source: "python", target: "fastapi" },
  { source: "python", target: "sklearn" },
  { source: "python", target: "numpy" },
  { source: "python", target: "pandas" },
  { source: "javascript", target: "nodejs" },
  { source: "typescript", target: "nodejs" },
  { source: "typescript", target: "playwright" },
  { source: "csharp", target: "aspnet" },
  { source: "go", target: "docker" },
  { source: "go", target: "cicd" },
  { source: "java", target: "jenkins" },
  { source: "python", target: "aws" },
  { source: "python", target: "gcp" },
  { source: "typescript", target: "aws" },
  { source: "csharp", target: "mongodb" },
  { source: "python", target: "postgresql" },
  { source: "typescript", target: "postgresql" },
];

const REPULSION = 800;
const ATTRACTION = 0.006;
const REST_LENGTH = 120;
const DAMPING = 0.85;
const MAX_FORCE = 3;
const VELOCITY_CUTOFF = 0.05;
const GRAVITY_RADIUS = 150;
const GRAVITY_STRENGTH = 0.2;

function getConnected(nodeId: string): Set<string> {
  const set = new Set<string>();
  for (const e of EDGES) {
    if (e.source === nodeId) set.add(e.target);
    if (e.target === nodeId) set.add(e.source);
  }
  return set;
}

export default function TechConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const hoveredRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initNodes = useCallback((w: number, h: number) => {
    const nodes: Node[] = [];
    const cx = w / 2;
    const cy = h / 2;

    LANGUAGES.forEach((l, i) => {
      const angle = (i / LANGUAGES.length) * Math.PI * 2;
      const r = Math.min(w, h) * 0.2;
      nodes.push({
        ...l,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: 24,
        type: "language",
        highlighted: false,
      });
    });

    TOOLS.forEach((t, i) => {
      const angle = (i / TOOLS.length) * Math.PI * 2;
      const r = Math.min(w, h) * 0.35;
      nodes.push({
        ...t,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 60,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        radius: 16,
        type: "tool",
        highlighted: false,
      });
    });

    nodesRef.current = nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);

      if (nodesRef.current.length === 0) {
        initNodes(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Hit test for hover
      let found: string | null = null;
      for (const node of nodesRef.current) {
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 4) {
          found = node.id;
          break;
        }
      }
      hoveredRef.current = found;
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
      hoveredRef.current = null;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    let frameId: number;

    const simulate = () => {
      const nodes = nodesRef.current;
      const w = canvas.width / Math.min(window.devicePixelRatio, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio, 2);

      // Helper: clamp force magnitude
      const clampF = (v: number) =>
        Math.max(-MAX_FORCE, Math.min(MAX_FORCE, v));

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = REPULSION / (dist * dist);
          const fx = clampF((force * dx) / dist);
          const fy = clampF((force * dy) / dist);
          nodes[i].vx += fx;
          nodes[i].vy += fy;
          nodes[j].vx -= fx;
          nodes[j].vy -= fy;
        }
      }

      // Attraction along edges
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      for (const edge of EDGES) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (dist - REST_LENGTH) * ATTRACTION;
        const fx = clampF((force * dx) / dist);
        const fy = clampF((force * dy) / dist);
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }

      // Center gravity
      const cx = w / 2;
      const cy = h / 2;
      for (const node of nodes) {
        node.vx += (cx - node.x) * 0.0005;
        node.vy += (cy - node.y) * 0.0005;
      }

      // Mouse gravity
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        for (const node of nodes) {
          const dx = mx - node.x;
          const dy = my - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < GRAVITY_RADIUS && dist > 1) {
            const strength = GRAVITY_STRENGTH * (1 - dist / GRAVITY_RADIUS);
            node.vx += (dx / dist) * strength;
            node.vy += (dy / dist) * strength;
          }
        }
      }

      // Update positions
      const margin = 40;
      for (const node of nodes) {
        // Soft repulsion from edges
        const dl = margin - (node.x - node.radius);
        const dr = margin - (w - node.radius - node.x);
        const dt = margin - (node.y - node.radius);
        const db = margin - (h - node.radius - node.y);
        if (dl > 0) node.vx += (dl / margin) * 0.3;
        if (dr > 0) node.vx -= (dr / margin) * 0.3;
        if (dt > 0) node.vy += (dt / margin) * 0.3;
        if (db > 0) node.vy -= (db / margin) * 0.3;

        node.vx *= DAMPING;
        node.vy *= DAMPING;

        // Kill micro-velocities to let nodes settle
        if (Math.abs(node.vx) < VELOCITY_CUTOFF) node.vx = 0;
        if (Math.abs(node.vy) < VELOCITY_CUTOFF) node.vy = 0;

        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(node.radius, Math.min(w - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(h - node.radius, node.y));
      }

      // Highlight state
      const hovered = hoveredRef.current;
      const connectedSet = hovered ? getConnected(hovered) : null;
      for (const node of nodes) {
        node.highlighted =
          !hovered ||
          node.id === hovered ||
          (connectedSet !== null && connectedSet.has(node.id));
      }

      // Draw
      const dpr = Math.min(window.devicePixelRatio, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Edges
      for (const edge of EDGES) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;

        const edgeHighlighted =
          !hovered ||
          edge.source === hovered ||
          edge.target === hovered;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = edgeHighlighted
          ? "rgba(232, 115, 74, 0.2)"
          : "rgba(160, 152, 144, 0.06)";
        ctx.lineWidth = edgeHighlighted ? 1.5 : 0.5;
        ctx.stroke();
      }

      // Nodes
      for (const node of nodes) {
        const alpha = node.highlighted ? 1 : 0.25;

        // Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        if (node.type === "language") {
          ctx.fillStyle =
            node.id === hovered
              ? `rgba(232, 115, 74, ${alpha})`
              : `rgba(46, 42, 40, ${alpha})`;
          ctx.strokeStyle = `rgba(232, 115, 74, ${0.5 * alpha})`;
          ctx.lineWidth = node.id === hovered ? 2 : 1;
        } else {
          ctx.fillStyle = `rgba(36, 33, 32, ${alpha})`;
          ctx.strokeStyle = `rgba(160, 152, 144, ${0.2 * alpha})`;
          ctx.lineWidth = 1;
        }
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = `rgba(237, 232, 227, ${0.9 * alpha})`;
        ctx.font =
          node.type === "language"
            ? "bold 11px Inter, sans-serif"
            : "10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, node.x, node.y);
      }

      frameId = requestAnimationFrame(simulate);
    };

    frameId = requestAnimationFrame(simulate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [initNodes]);

  return (
    <div ref={containerRef} className="constellation">
      <canvas ref={canvasRef} />
    </div>
  );
}
