import { TinyColor } from '@ctrl/tinycolor';
import {
  Accordion,
  ActionIcon,
  Center,
  ColorInput,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { LabelLineTerminator, LabelTextAlignment, NVLabel3D } from '@niivue/niivue';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const LabelItem: React.FC<{
  id: string;
  label: NVLabel3D;
  onLabelHide: (label: NVLabel3D, hide: boolean) => void;
  onLabelDelete: (label: NVLabel3D) => void;
}> = ({ id, label, onLabelDelete }) => (
  <Accordion.Item value={id}>
    <Center>
      <Accordion.Control>
        <Text>{label.text}</Text>
      </Accordion.Control>
      <ActionIcon size="lg" variant="subtle" color="red" onClick={() => onLabelDelete(label)}>
        <IconTrash />
      </ActionIcon>
    </Center>
    <Accordion.Panel>
      <Text>Size: {label.style.lineWidth}</Text>
      <Text>Position: {label.points?.map((p) => (p as number).toFixed(2)).join(', ')}</Text>
    </Accordion.Panel>
  </Accordion.Item>
);

export const LabelPanel: React.FC<{
  position: number[];
  labels: NVLabel3D[];
  onLabelAdd: (label: NVLabel3D) => void;
  onLabelDelete: (label: NVLabel3D) => void;
  onLabelHide: (label: NVLabel3D, hide: boolean) => void;
}> = ({ position, labels, onLabelAdd, onLabelHide, onLabelDelete }) => {
  const [currentColor, setCurrentColor] = useState('#C5D899');
  const [currentSize, setCurrentSize] = useState(2);

  const [currentText, setCurrentText] = useState<string | undefined>(undefined);

  const handleLabelAdd = () => {
    if (!currentText || currentText.trim().length === 0) {
      toast.error('add label failed: label text cannot be empty');
      return;
    }

    const color = new TinyColor(currentColor).toRgb();
    const rgbColor = [color.r, color.g, color.b, 1.0];

    const nvlabel = new NVLabel3D(
      currentText,
      {
        textColor: rgbColor,
        textScale: 1.0,
        textAlignment: LabelTextAlignment.RIGHT,
        lineWidth: currentSize,
        lineColor: rgbColor,
        lineTerminator: LabelLineTerminator.NONE,
        bulletScale: 0.0,
      },
      position
    );

    onLabelAdd(nvlabel);
  };

  return (
    <Stack>
      <Group p="md">
        <ColorInput
          value={currentColor}
          label="color"
          style={{ width: '8em' }}
          onChangeEnd={setCurrentColor}
          format="hex"
        />
        <NumberInput
          label="size"
          value={currentSize}
          style={{ width: '5em' }}
          onChange={(val) => typeof val === 'number' && setCurrentSize(val)}
          min={0.8}
          step={0.1}
          max={5}
        />
        <TextInput value={position.map((p) => p.toFixed(2)).join(', ')} disabled label="position" />
      </Group>

      <Accordion chevron={false} p="md">
        <Accordion.Item value="add new">
          <Center>
            <Accordion.Control>
              <TextInput
                size="xs"
                radius="md"
                placeholder="label"
                value={currentText}
                onChange={(e) => setCurrentText(e.currentTarget.value)}
              />
            </Accordion.Control>
            <ActionIcon size="input-xs" variant="filled" radius="md" onClick={handleLabelAdd}>
              <IconPlus />
            </ActionIcon>
          </Center>
        </Accordion.Item>
      </Accordion>

      <Accordion multiple>
        {labels.map((label, idx) => (
          <LabelItem
            key={idx}
            id={`${idx}`}
            label={label}
            onLabelHide={onLabelHide}
            onLabelDelete={onLabelDelete}
          />
        ))}
      </Accordion>
    </Stack>
  );
};
