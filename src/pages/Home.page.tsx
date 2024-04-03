import {
  ActionIcon,
  Box,
  Center,
  Flex,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DRAG_MODE, NVImage, NVLabel3D, NVMesh, Niivue, SLICE_TYPE } from '@niivue/niivue';
import { IconHelp, IconSun, IconSunOff } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { ControlPanel } from '@/components/ControlPanel/ControlPanel';
import { NVVolume, VolumeDescription } from '@/components/ControlPanel/VolumeController';
import { LabelPanel } from '@/components/LabelPanel/LabelPanel';
import { NiivueCanvas } from '@/components/NiivueCanvas/NiivueCanvas';

export function HomePage() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const nv3DRef = useRef<Niivue>(
    new Niivue({
      logLevel: 'error',
      dragAndDropEnabled: true,
      show3Dcrosshair: true,
      backColor: [0.3, 0.3, 0.3, 1],
      clipPlaneColor: [0, 0, 0, 0.2],
      isOrientCube: true,
      dragMode: DRAG_MODE.pan,
      multiplanarForceRender: true,
    })
  );

  const nv2DRef = useRef<Niivue>(
    new Niivue({
      logLevel: 'error',
      dragAndDropEnabled: true,
      show3Dcrosshair: false,
      backColor: [0.3, 0.3, 0.3, 1],
      isOrientCube: false,
      dragMode: DRAG_MODE.slicer3D,
      multiplanarForceRender: false,
    })
  );

  // init Niivue instance and callback
  useEffect(() => {
    nv3DRef.current.setSliceType(SLICE_TYPE.RENDER);

    nv2DRef.current.setHighResolutionCapable(true);
    nv3DRef.current.setHighResolutionCapable(true);

    nv3DRef.current.setRadiologicalConvention(false);
    nv2DRef.current.setRadiologicalConvention(false);

    nv2DRef.current.setInterpolation(false);
    nv3DRef.current.setInterpolation(false);

    // only sync 2d data
    nv2DRef.current.broadcastTo(nv3DRef.current, { '2d': true, '3d': false });
    nv3DRef.current.broadcastTo(nv2DRef.current, { '2d': true, '3d': false });
  }, []);

  const [volumes, setVolumes] = useState<NVVolume[]>([]);

  const handleVolumeAdd = (volume: NVVolume) => {
    try {
      nv3DRef.current.addVolume(volume.volume);
      nv2DRef.current.addVolume(volume.volume);

      setVolumes([volume, ...volumes]);
    } catch (e) {
      toast.error(`add volume failed: ${e}`);
    } finally {
      nv3DRef.current.updateGLVolume();
      nv2DRef.current.updateGLVolume();
    }
  };

  const handleVolumeChange4D = (nvVol: NVImage, desc: VolumeDescription) => {
    nv3DRef.current.setFrame4D(nvVol.id, desc.id);
  };

  const handleVolumeDelete = (volume: NVVolume) => {
    const vol = volumes.find((v) => v.volume.id === volume.volume.id);
    if (vol) {
      nv3DRef.current.removeVolume(vol.volume);
      nv2DRef.current.removeVolume(vol.volume);
    }

    setVolumes(volumes.filter((v) => v !== vol));

    nv3DRef.current.updateGLVolume();
    nv2DRef.current.updateGLVolume();
  };

  const [meshes, setMeshes] = useState<NVMesh[]>([]);

  const handleMeshAdd = async (meshBuilder: (gl: WebGL2RenderingContext) => Promise<NVMesh>) => {
    try {
      const mesh = await meshBuilder(nv3DRef.current.gl);

      nv3DRef.current.addMesh(mesh);
      nv2DRef.current.addMesh(mesh);

      setMeshes([mesh, ...meshes]);
    } catch (e) {
      toast.error(`add mesh failed: ${e}`);
    } finally {
      nv3DRef.current.updateGLVolume();
      nv2DRef.current.updateGLVolume();
    }
  };

  const handleMeshDelete = (mesh: NVMesh) => {
    const me = meshes.find((m) => m.id === mesh.id);
    if (me) {
      nv3DRef.current.removeMesh(mesh);
      nv2DRef.current.removeMesh(mesh);
    }

    setMeshes(meshes.filter((m) => m !== me));

    // nv2DRef.current.meshes[0].nodes

    nv3DRef.current.updateGLVolume();
    nv2DRef.current.updateGLVolume();
  };

  const [scale, setScale] = useState(1);
  const [clipPlane, setClipPlane] = useState([0, 120, 120, 0]);

  const handleClipPlaneChange = (cp: number[]) => {
    nv3DRef.current.setClipPlane(cp);
    setClipPlane(cp);
  };

  const [position, setPosition] = useState([0, 0, 0]);

  const [labels, setLabels] = useState<NVLabel3D[]>([]);

  const isLabelExist = (point: number[], tolerance: number = 15) =>
    labels.find((l) => {
      if (!l.points) {
        return undefined;
      }
      const lb = l.points as number[];
      const dis = (lb[0] - point[0]) ** 2 + (lb[1] - point[1]) ** 2 + (lb[2] - point[2]) ** 2;
      return dis <= tolerance ** 2;
    });

  const appendNVLabel = (nv: React.MutableRefObject<Niivue>, label: NVLabel3D) => {
    nv.current.document.labels.push(label);
  };

  const removeNVLabel = (nv: React.MutableRefObject<Niivue>, label: NVLabel3D) => {
    const nvLabels = nv.current.getAllLabels();
    nv.current.document.labels = nvLabels.filter((l) => l.points !== label.points);
  };

  const handleLabelAdd = (label: NVLabel3D) => {
    const aroundLabel = label.points && isLabelExist(label.points as number[]);
    if (aroundLabel) {
      toast.error(`add label failed: label eixts around: ${aroundLabel.text}`);
      return;
    }

    setLabels([label, ...labels]);
    appendNVLabel(nv3DRef, label);
  };

  const handleLabelHide = (label: NVLabel3D, hide: boolean) => {
    if (!isLabelExist(label.points as number[])) {
      toast.error(`hide label failed: label does not exist around: ${label.text}`);
      return;
    }

    hide ? removeNVLabel(nv3DRef, label) : appendNVLabel(nv3DRef, label);
  };

  const handleLabelRemove = (label: NVLabel3D) => {
    if (!isLabelExist(label.points as number[])) {
      toast.error(`remove label failed: label does not exist around: ${label.text}`);
      return;
    }

    setLabels(labels.filter((l) => l !== label));
    removeNVLabel(nv3DRef, label);
  };

  const handleVolumeColorMapChange = (vol: NVVolume, cm: string) => {
    nv3DRef.current.setColormap(vol.volume.id, cm);
    nv2DRef.current.setColormap(vol.volume.id, cm);
    nv3DRef.current.updateGLVolume();
    nv2DRef.current.updateGLVolume();
  };

  const handleMeshColorMapChange = (mesh: NVMesh, cm: string) => {
    const idx = nv3DRef.current.getMeshIndexByID(mesh.id);
    if (idx < 0) {
      toast.error(`change mesh color map failed: cannot find mesh: ${mesh.id}`);
      return;
    }

    nv3DRef.current.meshes[idx].setLayerProperty(0, 'colormap', cm, nv3DRef.current.gl);
    nv2DRef.current.meshes[idx].setLayerProperty(0, 'colormap', cm, nv3DRef.current.gl);
  };

  const handleGammaChange = (gamma: number) => {
    nv3DRef.current.setGamma(gamma);
    nv2DRef.current.setGamma(gamma);
  };

  const [helpOpened, { open: helpOpen, close: helpClose }] = useDisclosure(false);

  return (
    <>
      <Stack gap={0}>
        <Flex align="center" gap={2} content="center" justify="space-between">
          <div></div>
          <Center>
            <h3>Atlas Web Viewer</h3>
          </Center>

          <Group gap={0}>
            <ActionIcon
              mr="md"
              variant="transparent"
              radius="xl"
              aria-label="help"
              onClick={helpOpen}
            >
              <IconHelp />
            </ActionIcon>
            <ActionIcon
              mr="md"
              variant="transparent"
              radius="xl"
              aria-label="change color"
              onClick={() => {
                colorScheme === 'dark' ? setColorScheme('light') : setColorScheme('dark');
              }}
            >
              {colorScheme === 'dark' ? <IconSunOff /> : <IconSun />}
            </ActionIcon>
          </Group>
        </Flex>

        <Modal opened={helpOpened} onClose={helpClose} title="HELP">
          <TypographyStylesProvider>
            <Text>Welcome to the Interactive Web Viewer for White Matter Atlases.</Text>
            <Text>
              This tool allows you to explore and analyze white matter MRI data with ease. Follow
              these simple steps to get started.
            </Text>
            <Title order={3}>Accessing the Viewer</Title>
            <Text>
              <Text span fw={700}>
                Navigate to the Web Viewer:
              </Text>
              Upon accessing the viewer, you can view all the panels of this tool. Here, you can
              find Control Panel and Label Panel on the left side, and 3D & 2D view panels on the
              right side. Error messages, if generated, would pop up in the top right corner.
            </Text>
            <Text fs="italic">
              All the data uploaded will be cleared upon closing or refreshing the page
            </Text>
            <Title order={3}>Atlas Selection</Title>
            <Text>
              In the volumes and meshes panels, you can upload your data model, then click the +
              button to load the model. volumes supports the .nii format model, and you should
              upload your volume description as a .csv file. meshes supports .vtk format model.
            </Text>
            <Text fs="italic">
              Find more detailed data format descriptions at{' '}
              <Text component="a" href="https://github.com/MASILab/Pandora-WhiteMatterAtlas">
                Pandora-WhiteMatterAtlas
              </Text>
            </Text>
            <Title order={3}>Track Selection</Title>
            <Text>
              After loading the model, click on the “…” button right to the model name to open a
              panel for track selection. Each track represents a particular brain area in your
              model, as described in the volume description .csv you uploaded. You can also change
              rendering method and gamma factor by calling out a panel by clicking the
              “3-blue-circle” button right to the model name, if existed such a button.
            </Text>
            <Title order={3}>Exploring the Atlas</Title>
            <Text>
              The main viewing area allows you to interact with the atlas. The upper and lower
              panels are for different usage, depending on which kind of atlas your .nii model is.
            </Text>
            <Text>
              Generally, you can rotate in the 3D view by left-clicking, holding and dragging the
              mouse. Adjust the direction of the clip plane by right-clicking, holding and dragging
              the mouse. Rolling your mouse wheel will smoothly change the clip plane’s position up
              and down the current direction.
            </Text>
            <Title order={3}>Marking and Annotation</Title>
            <Text>
              In the Label Panel, you will find the coordinates of the current focus point on the
              model, selected by dragging the red axis&apos;s intersection or a double left click on
              your mouse.
            </Text>
            <Text>
              - You can add one and only one label at the selected point.
              <Text>
                - You can set different colors and font sizes for the label, and add text notes to
                the label
                <Text>- Click the + button to confirm the label.</Text>
              </Text>
            </Text>
          </TypographyStylesProvider>
        </Modal>

        <Flex justify="flex-start" align="flex-start" direction="row" wrap="wrap">
          <Stack w={{ base: '100%', md: '30%' }}>
            <ScrollArea h={{ base: '100%', md: '90vh' }}>
              <Center>
                <Text size="xl">Control Panel</Text>
              </Center>
              <ControlPanel
                volumes={volumes}
                onVolumeAdd={handleVolumeAdd}
                onVolumeChange4D={handleVolumeChange4D}
                onVolumeDelete={handleVolumeDelete}
                meshes={meshes}
                onMeshAdd={handleMeshAdd}
                onMeshDelete={handleMeshDelete}
                scale={scale}
                onScaleChange={setScale}
                clipPlane={clipPlane}
                onClipPlaneChange={handleClipPlaneChange}
                colorMaps={nv3DRef.current.colormaps()}
                onVolumeColorMapChange={handleVolumeColorMapChange}
                onMeshColorMapChange={handleMeshColorMapChange}
                onGammaChange={handleGammaChange}
              />

              <Center>
                <Text size="xl">Label Panel</Text>
              </Center>
              <LabelPanel
                position={position}
                labels={labels}
                onLabelDelete={handleLabelRemove}
                onLabelAdd={handleLabelAdd}
                onLabelHide={handleLabelHide}
              />
            </ScrollArea>
          </Stack>

          <Stack w={{ base: '100%', md: '70%' }} gap={2}>
            <Box style={{ height: '48vh' }}>
              <NiivueCanvas
                nv={nv3DRef}
                scale={scale}
                clipPlane={clipPlane}
                onClipPlaneChange={setClipPlane}
                onPositionChange={setPosition}
              />
            </Box>
            <Box style={{ height: '46vh' }}>
              <NiivueCanvas nv={nv2DRef} />
            </Box>
          </Stack>
        </Flex>
      </Stack>
    </>
  );
}
