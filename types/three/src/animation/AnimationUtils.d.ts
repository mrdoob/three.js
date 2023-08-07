import { AnimationClip } from './AnimationClip';

export namespace AnimationUtils {
    function arraySlice(array: any, from: number, to: number): any;
    function convertArray(array: any, type: any, forceClone: boolean): any;
    function isTypedArray(object: any): boolean;
    function getKeyFrameOrder(times: number[]): number[];
    function sortedArray(values: any[], stride: number, order: number[]): any[];
    function flattenJSON(jsonKeys: string[], times: any[], values: any[], valuePropertyName: string): void;

    /**
     * @param sourceClip
     * @param name
     * @param startFrame
     * @param endFrame
     * @param [fps=30]
     */
    function subclip(
        sourceClip: AnimationClip,
        name: string,
        startFrame: number,
        endFrame: number,
        fps?: number,
    ): AnimationClip;

    /**
     * @param targetClip
     * @param [referenceFrame=0]
     * @param [referenceClip=targetClip]
     * @param [fps=30]
     */
    function makeClipAdditive(
        targetClip: AnimationClip,
        referenceFrame?: number,
        referenceClip?: AnimationClip,
        fps?: number,
    ): AnimationClip;
}
