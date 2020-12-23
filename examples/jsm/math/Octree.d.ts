import {
	Triangle,
	Box3,
	Ray,
	Sphere,
	Object3D
} from '../../../src/Three';

import { Capsule } from './Capsule';

export class Octree {

	constructor( box?: Box3 );
	triangles: Triangle[];
	box: Box3;
	subTrees: Octree[];

	addTriangle( triangle: Triangle ): this;
	calcBox(): this;
	split( level: number ): this;
	build(): this;
	getRayTriangles( ray: Ray, triangles: Triangle[] ): Triangle[];
	triangleCapsuleIntersect( capsule: Capsule, triangle: Triangle ): any;
	triangleSphereIntersect( sphere: Sphere, triangle: Triangle ): any;
	getSphereTriangles( sphere: Sphere, triangles: Triangle[] ): Triangle[];
	getCapsuleTriangles( capsule: Capsule, triangles: Triangle[] ): Triangle[];
	sphereIntersect( sphere: Sphere ): any;
	capsuleIntersect( capsule: Capsule ): any;
	rayIntersect( ray: Ray ): any;
	fromGraphNode( group: Object3D ): this;

}
