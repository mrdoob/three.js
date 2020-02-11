import { Mesh } from '../../../src/Three';

export namespace GeometryCompressionUtils {

	export function compressNormals( mesh: Mesh, encodeMethod: String );
	export function compressPositions( mesh: Mesh );
	export function compressUvs( mesh: Mesh );

}
