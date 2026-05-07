export default function GlowBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <div className="absolute w-1 h-1 rounded-full bg-primary-signal top-[200px] left-[80px] shadow-neon" />
      <div className="absolute w-1.5 h-1.5 rounded-full bg-primary-signal top-[400px] left-[240px] shadow-neon" />
      <div className="absolute w-1 h-1 rounded-full bg-primary-signal top-[650px] left-[180px] shadow-neon" />
    </div>
  );
}