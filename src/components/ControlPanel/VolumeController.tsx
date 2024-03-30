import {
  Accordion,
  ActionIcon,
  Center,
  Checkbox,
  FileInput,
  Group,
  Popover,
  Table,
} from '@mantine/core';
import { NVImage } from '@niivue/niivue';
import { IconDotsVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import Papa from 'papaparse';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ColorMapPopoverSelector } from './NiivueIconActions';

const TableHeaderMap = new Map<string, string>([
  ['ID', 'id'],
  ['Bundle Name', 'bundle'],
  ['File Name', 'file'],
  ['#HCP', 'hcp'],
  ['#BLSA', 'blsa'],
  ['#VU', 'vu'],
  ['#ALL', 'all'],
]);

export interface VolumeDescription {
  id: number;
  bundle: string;
  file: string;
  hcp: string;
  blsa: number;
  vu: number;
  all: number;
}

export interface NVVolume {
  volume: NVImage;
  desc?: VolumeDescription[];
}

const Volume4DSelector: React.FC<{
  desces: VolumeDescription[];
  on4DChange: (desc: VolumeDescription) => void;
}> = ({ desces, on4DChange }) => {
  const [selectedId, setSelectedId] = useState<number>(0);

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th />
          {Array.from(TableHeaderMap.keys()).map((k) => (
            <Table.Th key={k}>{k}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {desces.map((desc) => (
          <Table.Tr
            key={desc.id}
            bg={selectedId === desc.id ? 'var(--mantine-color-blue-light)' : undefined}
          >
            <Table.Td>
              <Checkbox
                checked={selectedId === desc.id}
                onChange={() => {
                  setSelectedId(desc.id);
                  on4DChange(desc);
                }}
              />
            </Table.Td>
            <Table.Td>{desc.id}</Table.Td>
            <Table.Td>{desc.bundle}</Table.Td>
            <Table.Td>{desc.file}</Table.Td>
            <Table.Td>{desc.hcp}</Table.Td>
            <Table.Td>{desc.blsa}</Table.Td>
            <Table.Td>{desc.vu}</Table.Td>
            <Table.Td>{desc.all}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

const VolumeItem: React.FC<{
  volume: NVVolume;
  onVolumeDelete: (volume: NVVolume) => void;
  onVolumeChange4D?: (nvVolume: NVImage, index: VolumeDescription) => void;

  colorMaps?: string[];
  onColorMapChange?: (cm: string) => void;

  gamma?: number;
  onGammaChange?: (gamma: number) => void;
}> = ({
  volume,
  onVolumeDelete,
  onVolumeChange4D,
  colorMaps,
  onColorMapChange,
  gamma,
  onGammaChange,
}) => {
  const [currentColorMap, setCurrentColorMap] = useState<string | undefined>(
    colorMaps && colorMaps[0]
  );

  return (
    <Accordion.Item value={volume.volume.name}>
      <Center>
        <Accordion.Control>{volume.volume.name}</Accordion.Control>

        {colorMaps && currentColorMap && onColorMapChange && (
          <ColorMapPopoverSelector
            colorMaps={colorMaps}
            currentColorMap={currentColorMap}
            onColorMapChange={(cm) => {
              onColorMapChange(cm);
              setCurrentColorMap(cm);
            }}
            gamma={gamma}
            onGammaChange={onGammaChange}
          />
        )}

        <ActionIcon size="lg" variant="subtle" color="red" onClick={() => onVolumeDelete(volume)}>
          <IconTrash />
        </ActionIcon>

        {volume.desc && onVolumeChange4D && (
          <Popover>
            <Popover.Target>
              <ActionIcon size="lg" variant="subtle" color="grey">
                <IconDotsVertical />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Volume4DSelector
                desces={volume.desc}
                on4DChange={(desc) => onVolumeChange4D(volume.volume, desc)}
              />
            </Popover.Dropdown>
          </Popover>
        )}
      </Center>
    </Accordion.Item>
  );
};

export const VolumeController: React.FC<{
  volumes: NVVolume[];
  onVolumeAdd: (volume: NVVolume) => void;
  onVolumeDelete: (volume: NVVolume) => void;
  onVolumeChange4D?: (nvVolume: NVImage, index: VolumeDescription) => void;

  colorMaps?: string[];
  onColorMapChange?: (volume: NVVolume, cm: string) => void;

  onGammaChange?: (gamma: number) => void;
}> = ({
  volumes,
  onVolumeAdd,
  onVolumeDelete,
  onVolumeChange4D,
  colorMaps,
  onColorMapChange,
  onGammaChange,
}) => {
  const [volumeFile, setVolumeFile] = useState<File | null>(null);
  const [volumeDescFile, setVolumeDescFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const [gamma, setGamma] = useState(1);

  const parseCSVAsync = (file: File) =>
    new Promise<VolumeDescription[]>((resolve, reject) => {
      Papa.parse<VolumeDescription>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => TableHeaderMap.get(header) ?? header,
        complete: (result) => resolve(result.data),
        error: (err) => reject(err),
      });
    });

  const handleVolumeAdd = async () => {
    if (!volumeFile) {
      toast.error('Add volume failed: please choose volume first');
      return;
    }

    setLoading(true);

    try {
      const nvImage = await NVImage.loadFromFile({
        file: volumeFile,
        colormap: 'gray',
        opacity: 1,
      });

      if (volumeDescFile) {
        const desc = await parseCSVAsync(volumeDescFile);
        onVolumeAdd({ volume: nvImage, desc });
        return;
      }
      onVolumeAdd({ volume: nvImage });
    } finally {
      setLoading(false);
      setVolumeFile(null);
      setVolumeDescFile(null);
    }
  };

  return (
    <Accordion chevron={false} maw="24em" mx="auto" multiple>
      <Group>
        <FileInput
          size="xs"
          radius="md"
          placeholder="Volume File"
          value={volumeFile}
          onChange={setVolumeFile}
        />
        <FileInput
          size="xs"
          radius="md"
          placeholder="Volume Description"
          accept="text/csv"
          value={volumeDescFile}
          onChange={setVolumeDescFile}
        />
        <ActionIcon
          size="input-xs"
          loading={loading}
          loaderProps={{ type: 'dots' }}
          variant="filled"
          radius="md"
          onClick={handleVolumeAdd}
        >
          <IconPlus />
        </ActionIcon>
      </Group>

      {volumes.map((volume) => (
        <VolumeItem
          key={volume.volume.id}
          volume={volume}
          onVolumeChange4D={onVolumeChange4D}
          onVolumeDelete={onVolumeDelete}
          colorMaps={colorMaps}
          onColorMapChange={(cm) => onColorMapChange && onColorMapChange(volume, cm)}
          gamma={gamma}
          onGammaChange={(g) => {
            onGammaChange && onGammaChange(g);
            setGamma(g);
          }}
        />
      ))}
    </Accordion>
  );
};
