import * as THREE from "../../../build/three.module.js";

export namespace GeometryCompressionUtils {

	export function compressNormals( mesh: THREE.Mesh, encodeMethod: String );
	export function compressPositions( mesh: THREE.Mesh );
	export function compressUvs( mesh: THREE.Mesh );

}