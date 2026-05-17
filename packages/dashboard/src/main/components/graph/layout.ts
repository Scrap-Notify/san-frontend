type Position = {
  top: string;
  left: string;
};

export function createPlanetMarkerPositions(count: number): Position[] {
  if (count <= 0) return [];

  const centerX = 50;
  const centerY = 50;
  const radiusX = 25;
  const radiusY = 23;
  const startAngle = -90;

  return Array.from({ length: count }, (_, index) => {
    const angle = ((startAngle + (360 / count) * index) * Math.PI) / 180;
    const wobble = index % 2 === 0 ? 0.94 : 1.06;

    return {
      left: `${centerX + Math.cos(angle) * radiusX * wobble}%`,
      top: `${centerY + Math.sin(angle) * radiusY}%`,
    };
  });
}

export function createCanopyLeafPositions(count: number): Position[] {
  if (count <= 0) return [];

  const centerX = 50;
  const centerY = 35;
  const minRadiusX = 12;
  const minRadiusY = 8;
  const maxRadiusX = 30;
  const maxRadiusY = 21;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  return Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0 : index / (count - 1);
    const radiusX = minRadiusX + (maxRadiusX - minRadiusX) * progress;
    const radiusY = minRadiusY + (maxRadiusY - minRadiusY) * progress;
    const angle = index * goldenAngle - Math.PI / 2;

    return {
      left: `${clamp(centerX + Math.cos(angle) * radiusX, 18, 82)}%`,
      top: `${clamp(centerY + Math.sin(angle) * radiusY, 14, 60)}%`,
    };
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
