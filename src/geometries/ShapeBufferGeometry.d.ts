import { Shape } from './../extras/core/Shape';
import { BufferGeometry } from './../core/BufferGeometry';

export class ShapeBufferGeometry extends BufferGeometry {

	/**
	 * @default 'ShapeBufferGeometry'
	 */
	type: string;

	constructor( shapes: Shape | Shape[], curveSegments?: number );

}
