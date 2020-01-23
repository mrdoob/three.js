import { AnimationClip } from './AnimationClip';
import { AnimationAction } from './AnimationAction';
import { EventDispatcher } from './../core/EventDispatcher';
import { Object3D } from '../core/Object3D';

export class AnimationMixer extends EventDispatcher {

	constructor( root: Object3D );

	time: number;
	timeScale: number;

	clipAction( clip: AnimationClip, root?: Object3D ): AnimationAction;
	existingAction( clip: AnimationClip, root?: Object3D ): AnimationAction | null;
	stopAllAction(): AnimationMixer;
	update( deltaTime: number ): AnimationMixer;
	setTime( timeInSeconds: number ): AnimationMixer;
	getRoot(): Object3D;
	uncacheClip( clip: AnimationClip ): void;
	uncacheRoot( root: Object3D ): void;
	uncacheAction( clip: AnimationClip, root?: Object3D ): void;

}
