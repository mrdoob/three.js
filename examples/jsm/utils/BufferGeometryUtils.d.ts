import { BufferAttribute, BufferGeometry } from '../../../src/Three';

export namespace BufferGeometryUtils {
	export function mergeBufferGeometries(geometries: BufferGeometry[]): BufferGeometry;
	export function computeTangents(geometry: BufferGeometry): null;
	export function mergeBufferAttributes(attributes: BufferAttribute[]): BufferAttribute;
}
