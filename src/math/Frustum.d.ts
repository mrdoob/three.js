import { Plane } from './Plane';
import { Matrix4 } from './Matrix4';
import { Object3D } from './../core/Object3D';
import { Sprite } from './../objects/Sprite';
import { Sphere } from './Sphere';
import { Box3 } from './Box3';
import { Vector3 } from './Vector3';

/**
 * Frustums are used to determine what is inside the camera's field of view. They help speed up the rendering process.
 */
export class Frustum {

	constructor(
		p0?: Plane,
		p1?: Plane,
		p2?: Plane,
		p3?: Plane,
		p4?: Plane,
		p5?: Plane
	);

	/**
   * Array of 6 vectors.
   */
	planes: Plane[];

	set(
		p0?: number,
		p1?: number,
		p2?: number,
		p3?: number,
		p4?: number,
		p5?: number
	): Frustum;
	clone(): this;
	copy( frustum: Frustum ): this;
	setFromMatrix( m: Matrix4 ): Frustum;
	intersectsObject( object: Object3D ): boolean;
	intersectsSprite( sprite: Sprite ): boolean;
	intersectsSphere( sphere: Sphere ): boolean;
	intersectsBox( box: Box3 ): boolean;
	containsPoint( point: Vector3 ): boolean;

}
