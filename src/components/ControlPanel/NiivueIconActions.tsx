import { ActionIcon, Box, Popover, Select, Slider } from '@mantine/core';
import { IconColorFilter } from '@tabler/icons-react';

export const ColorMapSelector: React.FC<{
  colorMaps: string[];
  currentColorMap: string;
  onColorMapChange: (cm: string) => void;
}> = ({ colorMaps, currentColorMap, onColorMapChange }) => (
  <Select data={colorMaps} value={currentColorMap} onChange={(cm) => cm && onColorMapChange(cm)} />
);

export const GammaSlider: React.FC<{ gamma: number; onGammaChange: (gamma: number) => void }> = ({
  gamma,
  onGammaChange,
}) => (
  <Slider
    color="blue"
    value={gamma}
    onChangeEnd={onGammaChange}
    min={0.1}
    max={4}
    step={0.01}
    marks={[0.1, 1, 2.5, 4].map((s) => ({ value: s, label: `${s}` }))}
  />
);

export const ColorMapPopoverSelector: React.FC<{
  colorMaps: string[];
  currentColorMap: string;
  onColorMapChange: (cm: string) => void;
  gamma?: number;
  onGammaChange?: (gamma: number) => void;
}> = ({ colorMaps, currentColorMap, onColorMapChange, gamma, onGammaChange }) => (
  <Popover>
    <Popover.Target>
      <ActionIcon size="lg" variant="subtle" gradient={{ from: 'red', to: 'blue', deg: 120 }}>
        <IconColorFilter />
      </ActionIcon>
    </Popover.Target>
    <Popover.Dropdown>
      <ColorMapSelector
        colorMaps={colorMaps}
        currentColorMap={currentColorMap}
        onColorMapChange={onColorMapChange}
      />
      {gamma && onGammaChange && (
        <Box py="sm">
          <GammaSlider gamma={gamma} onGammaChange={onGammaChange} />
        </Box>
      )}
    </Popover.Dropdown>
  </Popover>
);
