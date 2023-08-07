/**
 *  @param {Vector3} v The cone origin
 *  @param {Vector3} axis The axis, normalized.
 *  @param {number} theta The cone angle
 *  @param {number} sup The maximum distance from v in the axis direction (truncated cone). If null or undefined, will be +infinity
 *  @param {number} inf The minimum distance from v in the axis direction (truncated cone). if null or undefined, will be 0
 */
export function Cone(v: Vector3, axis: Vector3, theta: number, inf: number, sup: number): void;
export class Cone {
    /**
     *  @param {Vector3} v The cone origin
     *  @param {Vector3} axis The axis, normalized.
     *  @param {number} theta The cone angle
     *  @param {number} sup The maximum distance from v in the axis direction (truncated cone). If null or undefined, will be +infinity
     *  @param {number} inf The minimum distance from v in the axis direction (truncated cone). if null or undefined, will be 0
     */
    constructor(v: Vector3, axis: Vector3, theta: number, inf: number, sup: number);
    /** @type {Vector3} */
    v: Vector3;
    /** @type {Vector3} */
    axis: Vector3;
    /** @type {number} */
    theta: number;
    /** @type {number} */
    inf: number;
    /** @type {number} */
    sup: number;
    cosTheta: number;
}
import { Vector3 } from "./Vector3";
