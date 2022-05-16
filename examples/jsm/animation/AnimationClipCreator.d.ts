import { AnimationClip, Vector3 } from '../../../src/Three';

export interface AnimationClipCreator {
    CreateRotationAnimation(period: number, axis: string): AnimationClip;
    CreateScaleAxisAnimation(period: number, axis: string): AnimationClip;
    CreateShakeAnimation(duration: number, shakeScale: Vector3): AnimationClip;
    CreatePulsationAnimation(duration: number, pulseScale: number): AnimationClip;
    CreateVisibilityAnimation(duration: number): AnimationClip;
    CreateMaterialColorAnimation(duration: number, colors: number[]): AnimationClip;
}

export const AnimationClipCreator: AnimationClipCreator;
