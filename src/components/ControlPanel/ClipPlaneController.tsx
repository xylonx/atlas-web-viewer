import { Box, Center, Group, NumberInput, Text } from '@mantine/core';

export const ClipPlaneController: React.FC<{
  clipPlane: number[];
  onClipPlaneChange: (cp: number[]) => void;
  decimal?: number;
}> = ({ clipPlane, onClipPlaneChange, decimal }) => {
  const handleClipPlaneCoordinatesChange = (coor: number, idx: number) => {
    const newCP = [clipPlane[0], clipPlane[1], clipPlane[2]];
    newCP[idx] = coor;
    onClipPlaneChange(newCP);
  };

  return (
    <Box>
      <Group gap={4}>
        {clipPlane.map((coor, idx) => (
          <Center key={idx}>
            <NumberInput
              style={{ width: '4em' }}
              value={coor}
              hideControls
              onChange={(pos) =>
                typeof pos === 'number' && handleClipPlaneCoordinatesChange(pos, idx)
              }
              decimalScale={decimal ?? 2}
              size="xs"
              radius="md"
            />
            {idx !== clipPlane.length - 1 && <Text size="md">,</Text>}
          </Center>
        ))}
      </Group>
    </Box>
  );
};
