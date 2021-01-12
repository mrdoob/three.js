import { BufferGeometry } from './../core/BufferGeometry';

export class WireframeGeometry extends BufferGeometry {

	constructor( geometry: BufferGeometry );

	/**
	 * @default 'WireframeGeometry'
	 */
	type: string;

}
