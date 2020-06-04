import {
	BufferGeometry,
	Geometry,
	Vector3
} from '../../../src/Three';

export class ConvexGeometry extends Geometry {

	constructor( points: Vector3[] );

}

export class ConvexBufferGeometry extends BufferGeometry {

	constructor( points: Vector3[] );

}
