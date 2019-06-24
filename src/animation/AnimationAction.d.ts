import { AnimationMixer } from './AnimationMixer';
import { AnimationClip } from './AnimationClip';
import { AnimationActionLoopStyles } from '../constants';
// Animation ////////////////////////////////////////////////////////////////////////////////////////

export class AnimationAction {

	loop: AnimationActionLoopStyles;
	time: number;
	timeScale: number;
	weight: number;
	repetitions: number;
	paused: boolean;
	enabled: boolean;
	clampWhenFinished: boolean;
	zeroSlopeAtStart: boolean;
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
	getRoot(): any;

}
