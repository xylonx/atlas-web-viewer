import { Slider } from '@mantine/core';

export const ScaleController: React.FC<{
  scale: number;
  onScaleChange: (scale: number) => void;
}> = ({ scale, onScaleChange }) => (
  <Slider
    color="blue"
    value={scale}
    onChange={onScaleChange}
    min={0.01}
    max={5}
    step={0.05}
    marks={[0.01, 1, 5].map((s) => ({ value: s, label: `${s}x` }))}
  />
);
