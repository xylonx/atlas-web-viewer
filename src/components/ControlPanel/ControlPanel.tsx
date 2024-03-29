import { Accordion, AccordionItem, Box, Group, Text } from '@mantine/core';
import { NVImage, NVMesh } from '@niivue/niivue';
import { ReactNode } from 'react';
import { ClipPlaneController } from './ClipPlaneController';
import { MeshController } from './MeshController';
import { ScaleController } from './ScaleController';
import { NVVolume, VolumeController, VolumeDescription } from './VolumeController';

const ControlItem: React.FC<{ name: string; description: string; children?: ReactNode }> = ({
  name,
  description,
  children,
}) => (
  <AccordionItem value={name} key={name}>
    <Accordion.Control>
      <Group wrap="nowrap">
        <div>
          <Text truncate>{name}</Text>
          <Text size="sm" c="dimmed" fw={400} truncate>
            {description}
          </Text>
        </div>
      </Group>
    </Accordion.Control>
    <Accordion.Panel>{children}</Accordion.Panel>
  </AccordionItem>
);

export const ControlPanel: React.FC<{
  volumes: NVVolume[];
  onVolumeAdd: (volume: NVVolume) => void;
  onVolumeDelete: (volume: NVVolume) => void;
  onVolumeChange4D?: (nvVolume: NVImage, index: VolumeDescription) => void;
  // onVolumeIndex4DChange: (volume: NVImage, idx: number) => void;

  meshes: NVMesh[];
  onMeshAdd: (meshBuilder: (gl: WebGL2RenderingContext) => Promise<NVMesh>) => void;
  onMeshDelete: (mesh: NVMesh) => void;

  scale: number;
  onScaleChange: (scale: number) => void;

  clipPlane: number[];
  onClipPlaneChange: (plane: number[]) => void;
}> = ({
  volumes,
  onVolumeAdd,
  onVolumeDelete,
  onVolumeChange4D,
  meshes,
  onMeshAdd,
  onMeshDelete,
  scale,
  onScaleChange,
  clipPlane,
  onClipPlaneChange,
}) => (
  <>
    <Accordion
      chevronPosition="right"
      variant="contained"
      multiple
      defaultValue={['volumes', 'meshes', 'scale', 'clipPlane']}
    >
      <ControlItem name="volumes" description={volumes.map((v) => v.volume.name).join(', ')}>
        <VolumeController
          volumes={volumes}
          onVolumeAdd={onVolumeAdd}
          onVolumeDelete={onVolumeDelete}
          onVolumeChange4D={onVolumeChange4D}
        />
      </ControlItem>

      <ControlItem name="meshes" description={meshes.map((m) => m.name).join(', ')}>
        <MeshController meshes={meshes} onMeshAdd={onMeshAdd} onMeshDelete={onMeshDelete} />
      </ControlItem>

      <ControlItem name="scale" description={`${scale}x`}>
        {/* <MeshController meshes={meshes} onMeshAdd={onMeshAdd} onMeshDelete={onMeshDelete} /> */}
        <Box style={{ paddingBottom: '1em' }}>
          <ScaleController scale={scale} onScaleChange={onScaleChange} />
        </Box>
      </ControlItem>

      <ControlItem name="clipPlane" description={clipPlane.map((c) => c.toFixed(2)).join(', ')}>
        <ClipPlaneController
          clipPlane={clipPlane}
          onClipPlaneChange={onClipPlaneChange}
          decimal={2}
        />
      </ControlItem>
    </Accordion>
  </>
);
