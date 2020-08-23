import { Shape } from './../extras/core/Shape';
import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class ShapeBufferGeometry extends BufferGeometry {

	/**
	 * @default 'ShapeBufferGeometry'
	 */
	type: string;

	constructor( shapes: Shape | Shape[], curveSegments?: number );

}

export class ShapeGeometry extends Geometry {

	/**
	 * @param shapes
	 * @param [curveSegments=12]
	 */
	constructor( shapes: Shape | Shape[], curveSegments?: number );

	/**
	 * @default 'ShapeGeometry'
	 */
	type: string;

	addShapeList( shapes: Shape[], options: any ): ShapeGeometry;
	addShape( shape: Shape, options?: any ): void;

}
