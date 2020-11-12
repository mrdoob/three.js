import { AnimationMixer } from './AnimationMixer';
import { AnimationClip } from './AnimationClip';
import { AnimationActionLoopStyles, AnimationBlendMode } from '../constants';
import { Object3D } from '../core/Object3D';
// Animation ////////////////////////////////////////////////////////////////////////////////////////

export class AnimationAction {

	constructor( mixer: AnimationMixer, clip: AnimationClip, localRoot?: Object3D, blendMode?: AnimationBlendMode );

	blendMode: AnimationBlendMode;

	/**
	 * @default THREE.LoopRepeat
	 */
	loop: AnimationActionLoopStyles;

	/**
	 * @default 0
	 */
	time: number;

	/**
	 * @default 1
	 */
	timeScale: number;

	/**
	 * @default 1
	 */
	weight: number;

	/**
	 * @default Infinity
	 */
	repetitions: number;

	/**
	 * @default false
	 */
	paused: boolean;

	/**
	 * @default true
	 */
	enabled: boolean;

	/**
	 * @default false
	 */
	clampWhenFinished: boolean;

	/**
	 * @default true
	 */
	zeroSlopeAtStart: boolean;

	/**
	 * @default true
	 */
	zeroSlopeAtEnd: boolean;

	play(): AnimationAction;
	stop(): AnimationAction;
	reset(): AnimationAction;
	isRunning(): boolean;
	isScheduled(): boolean;
	startAt( time: number ): AnimationAction;
	setLoop(
		mode: AnimationActionLoopStyles,
		repetitions: number
	): AnimationAction;
	setEffectiveWeight( weight: number ): AnimationAction;
	getEffectiveWeight(): number;
	fadeIn( duration: number ): AnimationAction;
	fadeOut( duration: number ): AnimationAction;
	crossFadeFrom(
		fadeOutAction: AnimationAction,
		duration: number,
		warp: boolean
	): AnimationAction;
	crossFadeTo(
		fadeInAction: AnimationAction,
		duration: number,
		warp: boolean
	): AnimationAction;
	stopFading(): AnimationAction;
	setEffectiveTimeScale( timeScale: number ): AnimationAction;
	getEffectiveTimeScale(): number;
	setDuration( duration: number ): AnimationAction;
	syncWith( action: AnimationAction ): AnimationAction;
	halt( duration: number ): AnimationAction;
	warp(
		statTimeScale: number,
		endTimeScale: number,
		duration: number
	): AnimationAction;
	stopWarping(): AnimationAction;
	getMixer(): AnimationMixer;
	getClip(): AnimationClip;
	getRoot(): Object3D;

}
