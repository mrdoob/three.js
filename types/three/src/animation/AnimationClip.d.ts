import { KeyframeTrack } from './KeyframeTrack';
import { Vector3 } from './../math/Vector3';
import { Bone } from './../objects/Bone';
import { AnimationBlendMode } from '../constants';

export interface MorphTarget {
    name: string;
    vertices: Vector3[];
}

export class AnimationClip {
    constructor(name?: string, duration?: number, tracks?: KeyframeTrack[], blendMode?: AnimationBlendMode);

    name: string;
    tracks: KeyframeTrack[];

    /**
     * @default THREE.NormalAnimationBlendMode
     */
    blendMode: AnimationBlendMode;

    /**
     * @default -1
     */
    duration: number;
    uuid: string;
    results: any[];

    resetDuration(): AnimationClip;
    trim(): AnimationClip;
    validate(): boolean;
    optimize(): AnimationClip;
    clone(): this;
    toJSON(clip: AnimationClip): any;

    static CreateFromMorphTargetSequence(
        name: string,
        morphTargetSequence: MorphTarget[],
        fps: number,
        noLoop: boolean,
    ): AnimationClip;
    static findByName(clipArray: AnimationClip[], name: string): AnimationClip;
    static CreateClipsFromMorphTargetSequences(
        morphTargets: MorphTarget[],
        fps: number,
        noLoop: boolean,
    ): AnimationClip[];
    static parse(json: any): AnimationClip;
    static parseAnimation(animation: any, bones: Bone[]): AnimationClip;
    static toJSON(clip: AnimationClip): any;
}
