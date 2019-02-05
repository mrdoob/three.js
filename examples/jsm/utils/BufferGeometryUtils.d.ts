import { BufferGeometry, BufferAttribute, InterleavedBufferAttribute } from '../../../src/Three';

export class BufferGeometryUtils {
  computeTangents(geometry: BufferGeometry): void;
  mergeBufferGeometries(geometries: BufferGeometry[], useGroups: boolean): BufferGeometry;
  mergeBufferAttributes(attributes: BufferAttribute[]): BufferAttribute;
  interleaveAttributes(attributes: BufferAttribute[]): InterleavedBufferAttribute[];
  estimateBytesUsed(geometry: BufferGeometry): number;
  mergeVertices(geometry: BufferGeometry, tolerance = 1e-4): BufferGeometry;
}
