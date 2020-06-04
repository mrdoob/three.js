import { Vector2 } from './../math/Vector2';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { Intersection } from '../core/Raycaster';
import { SpriteMaterial } from '../materials/Materials';
import { BufferGeometry } from '../core/BufferGeometry';

export class Sprite extends Object3D {

	constructor( material?: SpriteMaterial );

	type: 'Sprite';
	readonly isSprite: true;

	geometry: BufferGeometry;
	material: SpriteMaterial;
	center: Vector2;

	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;
	copy( source: this ): this;

}
