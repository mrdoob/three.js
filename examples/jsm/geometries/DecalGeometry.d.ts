import {
	BufferGeometry,
	Euler,
	Mesh,
	Vector3
} from '../../../src/Three';

export class DecalGeometry extends BufferGeometry {

	constructor( mesh: Mesh, position: Vector3, orientation: Euler, size: Vector3 );

}

export class DecalVertex {

	constructor( position: Vector3, normal: Vector3 );
	clone(): DecalVertex;

}
