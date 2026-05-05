export default function GlowBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <div className="absolute w-1 h-1 bg-[#00ffc2] rounded-full top-[200px] left-[80px] shadow-[0_0_12px_#00ffc2]" />
      <div className="absolute w-1.5 h-1.5 bg-[#00ffc2] rounded-full top-[400px] left-[240px] shadow-[0_0_12px_#00ffc2]" />
      <div className="absolute w-1 h-1 bg-[#00ffc2] rounded-full top-[650px] left-[180px] shadow-[0_0_12px_#00ffc2]" />
    </div>
  );
}