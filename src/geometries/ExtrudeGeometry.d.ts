import { Curve } from './../extras/core/Curve';
import { Vector2 } from './../math/Vector2';
import { Vector3 } from './../math/Vector3';
import { Shape } from './../extras/core/Shape';
import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export interface ExtrudeGeometryOptions {
	/**
	 * @default 12
	 */
	curveSegments?: number;
	/**
	 * @default 1
	 */
	steps?: number;
	/**
	 * @default 100
	 */
	depth?: number;
	/**
	 * @default true
	 */
	bevelEnabled?: boolean;
	/**
	 * @default 6
	 */
	bevelThickness?: number;
	bevelSize?: number;
	/**
	 * @default 0
	 */
	bevelOffset?: number;
	/**
	 * @default 3
	 */
	bevelSegments?: number;
	extrudePath?: Curve<Vector3>;
	UVGenerator?: UVGenerator;
}

export interface UVGenerator {
	generateTopUV(
		geometry: ExtrudeBufferGeometry,
		vertices: number[],
		indexA: number,
		indexB: number,
		indexC: number
	): Vector2[];
	generateSideWallUV(
		geometry: ExtrudeBufferGeometry,
		vertices: number[],
		indexA: number,
		indexB: number,
		indexC: number,
		indexD: number
	): Vector2[];
}

export class ExtrudeBufferGeometry extends BufferGeometry {

	constructor( shapes: Shape | Shape[], options?: ExtrudeGeometryOptions );

	static WorldUVGenerator: UVGenerator;

	/**
	 * @default 'ExtrudeBufferGeometry'
	 */
	type: string;

	addShapeList( shapes: Shape[], options?: any ): void;
	addShape( shape: Shape, options?: any ): void;

}

export class ExtrudeGeometry extends Geometry {

	constructor( shapes: Shape | Shape[], options?: ExtrudeGeometryOptions );

	static WorldUVGenerator: UVGenerator;

	/**
	 * @default 'ExtrudeGeometry'
	 */
	type: string;

	addShapeList( shapes: Shape[], options?: any ): void;
	addShape( shape: Shape, options?: any ): void;

}
