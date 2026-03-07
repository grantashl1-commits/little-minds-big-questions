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

const FloatingBubbles = ({ count = 6, className = "" }: FloatingBubblesProps) => {
  const bubbles = Array.from({ length: count }, (_, i) => {
    const size = 16 + (i % 4) * 12;
    const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
    const top = `${10 + ((i * 37) % 70)}%`;
    const left = `${5 + ((i * 23) % 85)}%`;
    const delay = `${(i * 0.7) % 3}s`;

    return (
      <div
        key={i}
        className={`absolute rounded-full ${color} opacity-20 animate-float pointer-events-none`}
        style={{
          width: size,
          height: size,
          top,
          left,
          animationDelay: delay,
          animationDuration: `${4 + (i % 3)}s`,
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
