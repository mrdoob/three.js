import { LineSegments } from "../objects/LineSegments.js";
import { EdgesGeometry } from "../geometries/EdgesGeometry.js";
import { LineBasicMaterial } from "../materials/LineBasicMaterial.js";

export function EdgesHelper( object, hex ) {

	console.warn( 'THREE.EdgesHelper has been removed. Use THREE.EdgesGeometry instead.' );
	return new LineSegments( new EdgesGeometry( object.geometry ), new LineBasicMaterial( { color: hex !== undefined ? hex : 0xffffff } ) );

}
