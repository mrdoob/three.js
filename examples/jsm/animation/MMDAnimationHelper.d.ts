import {
	AnimationClip,
	Audio,
	Camera,
	Mesh,
	Object3D,
	SkinnedMesh
} from '../../../src/Three';

export interface MMDAnimationHelperParameter {
	sync?: boolean;
	afterglow?: number;
	resetPhysicsOnLoop?: boolean;
}

export interface MMDAnimationHelperAddParameter {
	animation?: AnimationClip | AnimationClip[];
	physics?: boolean;
	warmup?: number;
	unitStep?: number;
	maxStepNum?: number;
	gravity?: number;
	delayTime?: number;
}

export interface MMDAnimationHelperPoseParameter {
	resetPose?: boolean;
	ik?: boolean;
	grant?: boolean;
}

export class MMDAnimationHelper {

	constructor( params?: MMDAnimationHelperParameter );
	meshes: Mesh[];
	camera: Camera | null;
	cameraTarget: Object3D;
	audio: Audio;
	audioManager: AudioManager;
	configuration: {
		sync: boolean;
		afterglow: number;
		resetPhysicsOnLoop: boolean;
	};
	enabled: {
		animation: boolean;
		ik: boolean;
		grant: boolean;
		physics: boolean;
		cameraAnimation: boolean;
	};
	onBeforePhysics: ( mesh: SkinnedMesh ) => void;
	sharedPhysics: boolean;
	masterPhysics: null;

	add( object: SkinnedMesh | Camera | Audio, params?: MMDAnimationHelperAddParameter ): this;
	remove( object: SkinnedMesh | Camera | Audio ): this;
	update( delta: number ): this;
	pose( mesh: SkinnedMesh, vpd: object, params?: MMDAnimationHelperPoseParameter ): this;
	enable( key: string, enabled: boolean ): this;
	createGrantSolver( mesh: SkinnedMesh ): GrantSolver;

}

export interface AudioManagerParameter {
	delayTime?: number;
}

export class AudioManager {

	constructor( audio: Audio, params?: AudioManagerParameter );
	audio: Audio;
	elapsedTime: number;
	currentTime: number;
	delayTime: number;
	audioDuration: number;
	duration: number;

	control( delta: number ): this;

}

export class GrantSolver {

	constructor( mesh: SkinnedMesh, grants: object[] );
	mesh: SkinnedMesh;
	grants: object[];

	update(): this;

}
