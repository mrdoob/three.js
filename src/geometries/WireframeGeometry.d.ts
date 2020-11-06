import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class WireframeGeometry extends BufferGeometry {

	constructor( geometry: Geometry | BufferGeometry );

	/**
	 * @default 'WireframeGeometry'
	 */
	type: string;

}
