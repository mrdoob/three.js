import { AnimationClip } from './AnimationClip';

export namespace AnimationUtils {
	export function arraySlice( array: any, from: number, to: number ): any;
	export function convertArray( array: any, type: any, forceClone: boolean ): any;
	export function isTypedArray( object: any ): boolean;
	export function getKeyFrameOrder( times: number[] ): number[];
	export function sortedArray(
		values: any[],
		stride: number,
		order: number[]
	): any[];
	export function flattenJSON(
		jsonKeys: string[],
		times: any[],
		values: any[],
		valuePropertyName: string
	): void;

	/**
	 * @param sourceClip
	 * @param name
	 * @param startFrame
	 * @param endFrame
	 * @param [fps=30]
	 */
	export function subclip(
		sourceClip: AnimationClip,
		name: string,
		startFrame: number,
		endFrame: number,
		fps?: number
	): AnimationClip;

	/**
	 * @param targetClip
	 * @param [referenceFrame=0]
	 * @param [referenceClip=targetClip]
	 * @param [fps=30]
	 */
	export function makeClipAdditive(
		targetClip: AnimationClip,
		referenceFrame?: number,
		referenceClip?: AnimationClip,
		fps?: number
	): AnimationClip;
}
