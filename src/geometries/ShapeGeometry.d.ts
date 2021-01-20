import { Shape } from './../extras/core/Shape';
import { BufferGeometry } from './../core/BufferGeometry';

export class ShapeGeometry extends BufferGeometry {

	/**
	 * @default 'ShapShapeGeometryeBufferGeometry'
	 */
	type: string;

	constructor( shapes: Shape | Shape[], curveSegments?: number );

}

export { ShapeGeometry as ShapeBufferGeometry };
