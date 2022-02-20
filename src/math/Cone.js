import { Vector3 } from "./Vector3";

/**
 *  @param {Vector3} v The cone origin
 *  @param {Vector3} axis The axis, normalized.
 *  @param {number} theta The cone angle
 *  @param {number} sup The maximum distance from v in the axis direction (truncated cone). If null or undefined, will be +infinity
 *  @param {number} inf The minimum distance from v in the axis direction (truncated cone). if null or undefined, will be 0
 */
export function Cone( v, axis, theta, inf, sup ) {

    this.v = v || new Vector3();
    this.axis = axis || new Vector3( 1, 0, 0 );
    this.theta = theta || 0;
    this.inf = inf || 0;
    this.sup = sup || + Infinity;

    this.cosTheta = Math.cos( theta );

}

Object.assign( Cone.prototype, {

    set: function ( v, axis, theta, inf, sup ) {

        this.v.copy( v );
        this.axis.copy( axis );
        this.theta = theta;
        this.inf = inf || 0;
        this.sup = sup || + Infinity;

        this.cosTheta = Math.cos( theta );

        return this;

    },

    clone: function () {

        return new this.constructor().copy( this );

    },

    copy: function ( cone ) {

        this.v.copy( cone.v );
        this.axis.copy( cone.axis );
        this.theta = cone.theta;
        this.inf = cone.inf;
        this.sup = cone.sup;

        this.cosTheta = Math.cos( this.theta );

        return this;

    },

    empty: function () {

        return ( this.theta <= 0 || this.inf >= this.sup );

    },

    containsPoint: function () {
        let tmp = new Vector3();
        return function (point) {
            tmp.subVectors(point, this.v);
            let t = tmp.dot(this.axis);
            if (t < this.inf || t > this.sup || Math.abs(t) < Number.MIN_VALUE) {
                return false;
            } else {
                // radius at t
                let r = Math.abs(t) * Math.tan(this.theta);
                tmp.copy(this.axis).multiplyScalar(t).add(this.v);
                tmp.sub(point);
                return tmp.lengthSq() <= r * r;
            }
        };
    }(),

    getBoundingBox: function ( target ) {

        throw "not implemented yet, todo";

        return target;

    },

    equals: function ( cone ) {

        return cone.v.equals( this.v ) && cone.axis.equals( this.axis ) && cone.theta === this.theta && cone.inf === this.inf && cone.sup === this.sup;

    }

} );
