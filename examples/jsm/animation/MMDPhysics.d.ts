import {
	Bone,
	Euler,
	Matrix4,
	Object3D,
	Quaternion,
	SkinnedMesh,
	Vector3
} from '../../../src/Three';

export interface MMDPhysicsParameter {
	unitStep?: number;
	maxStepNum?: number;
	gravity?: Vector3;
}

export class MMDPhysics {

	constructor( mesh: SkinnedMesh, rigidBodyParams: object[], constraintParams?: object[], params?: MMDPhysicsParameter );
	manager: ResourceManager;
	mesh: SkinnedMesh;
	unitStep: number;
	maxStepNum: number;
	gravity: Vector3;
	world: null;
	bodies: RigidBody[];
	constraints: Constraint[];

	update( delta: number ): this;
	reset(): this;
	warmup( cycles: number ): this;
	setGravity( gravity: Vector3 ): this;
	createHelper(): MMDPhysicsHelper;

}

export class ResourceManager {

	constructor();
	threeVector3s: Vector3[];
	threeMatrix4s: Matrix4[];
	threeQuaternions: Quaternion[];
	threeEulers: Euler[];
	transforms: object[];
	quaternions: object[];
	vector3s: object[];

	allocThreeVector3(): void;
	freeThreeVector3( v: Vector3 ): void;
	allocThreeMatrix4(): void;
	freeThreeMatrix4( m: Matrix4 ): void;
	allocThreeQuaternion(): void;
	freeThreeQuaternion( q: Quaternion ): void;
	allocThreeEuler(): void;
	freeThreeEuler( e: Euler ): void;
	allocTransform(): void;
	freeTransform( t: object ): void;
	allocQuaternion(): void;
	freeQuaternion( q: object ): void;
	allocVector3(): void;
	freeVector3( v: object ): void;
	setIdentity(): void;
	getBasis( t: object ): object;
	getBasisAsMatrix3( t: object ): object;
	getOrigin( t: object ): object;
	setOrigin( t: object, v: object ): void;
	copyOrigin( t1: object, t2: object ): void;
	setBasis( t: object, q: object ): void;
	setBasisFromMatrix3( t: object, m: object ): void;
	setOriginFromArray3( t: object, a: number[] ): void;
	setOriginFromThreeVector3( t: object, v: Vector3 ): void;
	setBasisFromArray3( t: object, a: number[] ): void;
	setBasisFromThreeQuaternion( t: object, a: Quaternion ): void;
	multiplyTransforms( t1: object, t2: object ): object;
	inverseTransform( t: object ): object;
	multiplyMatrices3( m1: object, m2: object ): object;
	addVector3( v1: object, v2: object ): object;
	dotVectors3( v1: object, v2: object ): number;
	rowOfMatrix3( m: object, i: number ): object;
	columnOfMatrix3( m: object, i: number ): object;
	negativeVector3( v: object ): object;
	multiplyMatrix3ByVector3( m: object, v: object ): object;
	transposeMatrix3( m: object ): object;
	quaternionToMatrix3( q: object ): object;
	matrix3ToQuaternion( m: object ): object;

}

export class RigidBody {

	constructor( mesh: SkinnedMesh, world: object, params: object, manager: ResourceManager );
	mesh: SkinnedMesh;
	world: object;
	params: object;
	manager: ResourceManager;

	body: object;
	bone: Bone;
	boneOffsetForm: object;
	boneOffsetFormInverse: object;

	reset(): this;
	updateFromBone(): this;
	updateBone(): this;

}

export class Constraint {

	constructor( mesh: SkinnedMesh, world: object, bodyA: RigidBody, bodyB: RigidBody, params: object, manager: ResourceManager );

}

export class MMDPhysicsHelper extends Object3D {

	constructor();

}
