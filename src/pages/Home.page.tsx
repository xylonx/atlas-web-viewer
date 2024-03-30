import { Avatar, Box, Center, Flex, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { DRAG_MODE, NVImage, NVLabel3D, NVMesh, Niivue, SLICE_TYPE } from '@niivue/niivue';
import { IconStar } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { ControlPanel } from '@/components/ControlPanel/ControlPanel';
import { NVVolume, VolumeDescription } from '@/components/ControlPanel/VolumeController';
import { LabelPanel } from '@/components/LabelPanel/LabelPanel';
import { NiivueCanvas } from '@/components/NiivueCanvas/NiivueCanvas';

export function HomePage() {
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

    nv3DRef.current.meshes[idx].setLayerProperty(1, 'colormap', cm, nv3DRef.current.gl);
    nv2DRef.current.meshes[idx].setLayerProperty(1, 'colormap', cm, nv3DRef.current.gl);

    nv3DRef.current.updateGLVolume();
    nv2DRef.current.updateGLVolume();
  };

  const handleGammaChange = (gamma: number) => {
    nv3DRef.current.setGamma(gamma);
    nv2DRef.current.setGamma(gamma);

    nv3DRef.current.updateGLVolume();
    nv2DRef.current.updateGLVolume();
  };

  return (
    <>
      <Stack>
        <Group h="100%" px="md">
          <Avatar color="blue" radius="sm">
            <IconStar size="1.5rem" />
          </Avatar>
          <Center>Atlas Web Viewer</Center>
        </Group>

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

          <Stack w={{ base: '100%', md: '70%' }}>
            <Box style={{ height: '40vh' }}>
              <NiivueCanvas
                nv={nv3DRef}
                scale={scale}
                clipPlane={clipPlane}
                onClipPlaneChange={setClipPlane}
                onPositionChange={setPosition}
              />
            </Box>
            <Box style={{ height: '48vh' }}>
              <NiivueCanvas nv={nv2DRef} />
            </Box>
          </Stack>
        </Flex>
      </Stack>
    </>
  );
}
