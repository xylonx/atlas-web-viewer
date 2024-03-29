import { Accordion, ActionIcon, Center, FileInput, Group } from '@mantine/core';
import { NVMesh } from '@niivue/niivue';
import { IconDotsVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import { decompress } from 'fflate';
import { useState } from 'react';
import { toast } from 'react-toastify';

const MeshItem: React.FC<{
  mesh: NVMesh;
  onMeshDelete: (mesh: NVMesh) => void;
}> = ({ mesh, onMeshDelete }) => (
  <Accordion.Item value={mesh.name}>
    <Center>
      <Accordion.Control>{mesh.name}</Accordion.Control>
      <ActionIcon size="lg" variant="subtle" color="red" onClick={() => onMeshDelete(mesh)}>
        <IconTrash />
      </ActionIcon>
      <ActionIcon size="lg" variant="subtle" color="grey">
        <IconDotsVertical />
      </ActionIcon>
    </Center>
  </Accordion.Item>
);

export const MeshController: React.FC<{
  meshes: NVMesh[];
  onMeshAdd: (meshBuilder: (gl: WebGL2RenderingContext) => Promise<NVMesh>) => void;
  onMeshDelete: (volume: NVMesh) => void;
}> = ({ meshes, onMeshAdd, onMeshDelete }) => {
  const [meshFile, setMeshFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const decompressAsync = (buffer: ArrayBuffer) =>
    new Promise<Uint8Array>((resolve, reject) => {
      decompress(new Uint8Array(buffer), {}, (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });

  const handleMeshAdd = async () => {
    if (!meshFile) {
      toast.error('Add mesh failed: please choose mesh first');
      return;
    }

    setLoading(true);
    try {
      // TODO(xylonx): alt to more elegant way to detect gzip
      // if mesh is gzip compressed, uncompress it first manually.
      if (meshFile.name.toUpperCase().endsWith('.GZ')) {
        const compressedBuffer = await meshFile.arrayBuffer();
        const decompressedBuffer = await decompressAsync(compressedBuffer);

        const filename = meshFile.name.slice(0, -3);
        onMeshAdd(async (gl) =>
          NVMesh.readMesh(decompressedBuffer.buffer, filename, gl, 1, [255, 255, 255, 255], true)
        );
      } else {
        onMeshAdd(async (gl) =>
          NVMesh.loadFromFile({
            file: meshFile,
            gl,
            name: meshFile.name,
            opacity: 1,
            visible: true,
          })
        );
      }
    } finally {
      setLoading(false);
      setMeshFile(null);
    }
  };

  return (
    <Accordion chevron={false} maw={400} mx="auto" multiple>
      <Group>
        <FileInput
          size="xs"
          radius="md"
          placeholder="Mesh File"
          value={meshFile}
          onChange={setMeshFile}
        />

        <ActionIcon
          size="input-xs"
          loading={loading}
          loaderProps={{ type: 'dots' }}
          variant="filled"
          radius="md"
          onClick={handleMeshAdd}
        >
          <IconPlus />
        </ActionIcon>
      </Group>

      {meshes.map((mesh) => (
        <MeshItem key={mesh.id} mesh={mesh} onMeshDelete={onMeshDelete} />
      ))}
    </Accordion>
  );
};
