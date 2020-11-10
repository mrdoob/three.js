import { Shape } from './../extras/core/Shape';
import { Geometry } from './../core/Geometry';
import { ExtrudeGeometryOptions } from './ExtrudeBufferGeometry';

export class ExtrudeGeometry extends Geometry {

	constructor( shapes: Shape | Shape[], options?: ExtrudeGeometryOptions );

	/**
	 * @default 'ExtrudeGeometry'
	 */
	type: string;

	addShapeList( shapes: Shape[], options?: any ): void;
	addShape( shape: Shape, options?: any ): void;

}
