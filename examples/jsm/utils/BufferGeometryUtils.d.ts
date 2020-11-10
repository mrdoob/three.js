import { BufferAttribute, BufferGeometry, InterleavedBufferAttribute, TrianglesDrawModes } from '../../../src/Three';

export namespace BufferGeometryUtils {
	export function mergeBufferGeometries( geometries: BufferGeometry[], useGroups?: boolean ): BufferGeometry;
	export function computeTangents( geometry: BufferGeometry ): null;
	export function mergeBufferAttributes( attributes: BufferAttribute[] ): BufferAttribute;
	export function interleaveAttributes( attributes: BufferAttribute[] ): InterleavedBufferAttribute;
	export function estimateBytesUsed( geometry: BufferGeometry ): number;
	export function mergeVertices( geometry: BufferGeometry, tolerance?: number ): BufferGeometry;
	export function toTrianglesDrawMode( geometry: BufferGeometry, drawMode: TrianglesDrawModes ): BufferGeometry;
}
