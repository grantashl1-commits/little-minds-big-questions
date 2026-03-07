interface FloatingBubblesProps {
  count?: number;
  className?: string;
}

const BUBBLE_COLORS = [
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-sage",
  "bg-peach",
];

const FloatingBubbles = ({ count = 8, className = "" }: FloatingBubblesProps) => {
  const bubbles = Array.from({ length: count }, (_, i) => {
    const size = 12 + (i % 5) * 10;
    const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
    const top = `${5 + ((i * 31) % 80)}%`;
    const left = `${3 + ((i * 19) % 90)}%`;
    const delay = `${(i * 0.6) % 4}s`;
    const duration = `${6 + (i % 4) * 2}s`;

    return (
      <div
        key={i}
        className={`absolute rounded-full ${color} opacity-15 animate-float pointer-events-none`}
        style={{
          width: size,
          height: size,
          top,
          left,
          animationDelay: delay,
          animationDuration: duration,
        }}
      />
    );
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {bubbles}
    </div>
  );
};

export default FloatingBubbles;
