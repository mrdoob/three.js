import {
	AnimationClip,
	Vector3
} from '../../../src/Three';

export class AnimationClipCreator {

	constructor();

	static CreateRotationAnimation( period: number, axis: string ): AnimationClip;
	static CreateScaleAxisAnimation( period: number, axis: string ): AnimationClip;
	static CreateShakeAnimation( duration: number, shakeScale: Vector3 ): AnimationClip;
	static CreatePulsationAnimation( duration: number, pulseScale: number ): AnimationClip;
	static CreateVisibilityAnimation( duration: number ): AnimationClip;
	static CreateMaterialColorAnimation( duration: number, colors: number[] ): AnimationClip;

}
