import {
	Object3D,
	Scene,
	Camera,
	Vector2,
	Vector3,
	Vector4,
	Color,
	Material
} from '../../../src/Three';

export class RenderableObject {

	id: number;
	object: Object3D;
	z: number;
	renderOrder: number;

}

export class RenderableFace {

	id: number;
	v1: RenderableVertex;
	v2: RenderableVertex;
	v3: RenderableVertex;
	normalModel: Vector3;
	vertexNormalsModel: Vector3[];
	vertexNormalsLength: number;
	color: Color;
	material: Material;
	uvs: Vector2[];
	z: number;
	renderOrder: number;

}

export class RenderableVertex {

	position: Vector3;
	positionWorld: Vector3;
	positionScreen: Vector4;
	visible: boolean;

	copy( vertex: RenderableVertex ): void;

}

export class RenderableLine {

	id: number;
	v1: RenderableVertex;
	v2: RenderableVertex;
	vertexColors: Color[];
	material: Material;
	z: number;
	renderOrder: number;

}

export class RenderableSprite {

	id: number;
	object: Object3D;
	x: number;
	y: number;
	z: number;
	rotation: number;
	scale: Vector2;
	material: Material;
	renderOrder: number;

}

export class Projector {

	constructor();

	projectScene( scene: Scene, camera: Camera, sortObjects: boolean, sortElements: boolean );

}
