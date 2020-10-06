import { Curve } from './../extras/core/Curve';
import { Vector2 } from './../math/Vector2';
import { Vector3 } from './../math/Vector3';
import { Shape } from './../extras/core/Shape';
import { Geometry } from './../core/Geometry';
import { ExtrudeBufferGeometry, ExtrudeGeometryOptions, UVGenerator } from './ExtrudeBufferGeometry';

export class ExtrudeGeometry extends Geometry {

	constructor( shapes: Shape | Shape[], options?: ExtrudeGeometryOptions );

	/**
	 * @default 'ExtrudeGeometry'
	 */
	type: string;

	addShapeList( shapes: Shape[], options?: any ): void;
	addShape( shape: Shape, options?: any ): void;

}
