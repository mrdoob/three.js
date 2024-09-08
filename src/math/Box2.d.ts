/**
 * Represents an axis-aligned bounding box (AABB) in 2D space.
 */
export class Box2 {
    /**
     * Creates a Box2 bounded by min and max.
     * @param {Vector2} min (optional) {@link Vector2} representing the lower (x, y) boundary of the box. Default is ( + Infinity, + Infinity ).
     * @param {Vector2} max (optional) {@link Vector2} representing the upper (x, y) boundary of the box. Default is ( - Infinity, - Infinity ).
     */
    constructor(min?: Vector2, max?: Vector2);
    isBox2: boolean;
    /**
     * {@link Vector2} representing the lower (x, y) boundary of the box.
     * Default is ( + Infinity, + Infinity ).
     * @type {Vector2}
     */
    min: Vector2;
    /**
     * {@link Vector2} representing the lower upper (x, y) boundary of the box.
     * Default is ( - Infinity, - Infinity ).
     * @type {Vector2}
     */
    max: Vector2;
    /**
     * Sets the lower and upper (x, y) boundaries of this box.
     * Please note that this method only copies the values from the given objects.
     * @param {Vector2} min {@link Vector2} representing the lower (x, y) boundary of the box.
     * @param {Vector2} max {@link Vector2} representing the upper (x, y) boundary of the box.
     * @returns {this}
     */
    set(min: Vector2, max: Vector2): this;
    /**
     * Sets the upper and lower bounds of this box to include all of the points in points.
     * @param {Vector2[]} points Array of {@link Vector2}s that the resulting box will contain.
     * @returns {this}
     */
    setFromPoints(points: Vector2[]): this;
    /**
     * Centers this box on [center]{@link Vector2} and sets this box's width and height to the values specified in [size]{@link Vector2}.
     * @param {Vector2} center Desired center position of the box ({@link Vector2}).
     * @param {Vector2} size Desired x and y dimensions of the box ({@link Vector2}).
     * @returns {this}
     */
    setFromCenterAndSize(center: Vector2, size: Vector2): this;
    /**
     * Returns a new {@link Box2} with the same min and max as this one.
     * @returns {Box2}
     */
    clone(): Box2;
    /**
     * Copies the {@link .min} and {@link .max} from box to this [box]{@link Box2}.
     * @param {Box2} box
     * @returns {this}
     */
    copy(box: Box2): this;
    /**
     * Makes this box empty.
     * @returns {this}
     */
    makeEmpty(): this;
    /**
     * Returns true if this box includes zero points within its bounds.
     * Note that a box with equal lower and upper bounds still includes one point, the one both bounds share.
     * @returns {boolean}
     */
    isEmpty(): boolean;
    /**
     * Returns the center point of the box as a {@link Vector2}.
     * @param {Vector2} target the result will be copied into this Vector2.
     * @returns {Vector2}
     */
    getCenter(target: Vector2): Vector2;
    /**
     * Returns the width and height of this box.
     * @param {Vector2} target the result will be copied into this Vector2.
     * @returns {Vector2}
     */
    getSize(target: Vector2): Vector2;
    /**
     * Expands the boundaries of this box to include [point]{@link Vector2}.
     * @param {Vector2} point {@link Vector2} that should be included in the box.
     * @returns {this}
     */
    expandByPoint(point: Vector2): this;
    /**
     * Expands this box equilaterally by [vector]{@link Vector2}. The width of this box will be expanded by the x component of [vector]{@link Vector2} in both directions. The height of this box will be expanded by the y component of [vector]{@link Vector2} in both directions.
     * @param {Vector2} vector {@link Vector2} to expand the box by.
     * @returns {this}
     */
    expandByVector(vector: Vector2): this;
    /**
     * Expands each dimension of the box by scalar. If negative, the dimensions of the box will be contracted.
     * @param {number} scalar
     * @returns {Box2}
     */
    expandByScalar(scalar: number): Box2;
    /**
     * Returns true if the specified [point]{@link Vector2} lies within or on the boundaries of this box.
     * @param {Vector2} point {@link Vector2} to check for inclusion.
     * @returns {boolean}
     */
    containsPoint(point: Vector2): boolean;
    /**
     * Returns true if the specified point lies within or on the boundaries of this [box]{@link Box2}. If this and [box]{@link Box2} are identical, this function also returns true.
     * @param {Box2} box {@link Box2} to test for inclusion.
     * @returns {boolean}
     */
    containsBox(box: Box2): boolean;
    /**
     * Returns a point as a proportion of this box's width and height.
     * @param {Vector2} point {@link Vector2}.
     * @param {Vector2} target the result will be copied into this Vector2.
     * @returns {Vector2}
     */
    getParameter(point: Vector2, target: Vector2): Vector2;
    /**
     * Determines whether or not this box intersects [box]{@link Box2}.
     * @param box Box to check for intersection against.
     * @returns {boolean}
     */
    intersectsBox(box: any): boolean;
    /**
     * [Clamps]{@link https://en.wikipedia.org/wiki/Clamping_(graphics)} the [point]{@link Vector2} within the bounds of this box.
     * @param {Vector2} point {@link Vector2} to clamp.
     * @param {Vector2} target the result will be copied into this Vector2.
     * @returns {Vector2}
     */
    clampPoint(point: Vector2, target: Vector2): Vector2;
    /**
     * Returns the distance from any edge of this box to the specified point. If the [point]{@link Vector2} lies inside of this box, the distance will be `0`.
     * @param {Vector2} point {@link Vector2} to measure distance to.
     * @returns {number}
     */
    distanceToPoint(point: Vector2): number;
    /**
     * Returns the intersection of this and [box]{@link Box2}, setting the upper bound of this box to the lesser of the two boxes' upper bounds and the lower bound of this box to the greater of the two boxes' lower bounds.
     * @param {Box2} box Box to intersect with.
     * @returns {this}
     */
    intersect(box: Box2): this;
    /**
     * Unions this box with [box]{@link Box2}, setting the upper bound of this box to the greater of the two boxes' upper bounds and the lower bound of this box to the lesser of the two boxes' lower bounds.
     * @param {Box2} box Box that will be unioned with this box.
     * @returns {this}
     */
    union(box: Box2): this;
    /**
     * Adds [offset]{@link Vector2} to both the upper and lower bounds of this box, effectively moving this box [offset]{@link Vector2} units in 2D space.
     * @param {Vector2} offset Direction and distance of offset.
     * @returns {this}
     */
    translate(offset: Vector2): this;
    /**
     * Returns true if this box and [box]{@link Box2} share the same lower and upper bounds.
     * @param {Box2} box Box to compare with this one.
     * @returns {boolean}
     */
    equals(box: Box2): boolean;
}
import { Vector2 } from './Vector2.js';
