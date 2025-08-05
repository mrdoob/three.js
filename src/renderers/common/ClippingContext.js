import { Matrix3 } from '../../math/Matrix3.js';
import { Plane } from '../../math/Plane.js';
import { Vector4 } from '../../math/Vector4.js';

const _plane = /*@__PURE__*/ new Plane();

/**
 * Represents the state that is used to perform clipping via clipping planes.
 * There is a default clipping context for each render context. When the
 * scene holds instances of `ClippingGroup`, there will be a context for each
 * group.
 *
 * @private
 */
class ClippingContext {

	/**
	 * Constructs a new clipping context.
	 *
	 * @param {?ClippingContext} [parentContext=null] - A reference to the parent clipping context.
	 */
	constructor( parentContext = null ) {

		/**
		 * The clipping context's version.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.version = 0;

		/**
		 * Whether the intersection of the clipping planes is used to clip objects, rather than their union.
		 *
		 * @type {?boolean}
		 * @default null
		 */
		this.clipIntersection = null;

		/**
		 * The clipping context's cache key.
		 *
		 * @type {string}
		 */
		this.cacheKey = '';

		/**
		 * Whether the shadow pass is active or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.shadowPass = false;

		/**
		 * The view normal matrix.
		 *
		 * @type {Matrix3}
		 */
		this.viewNormalMatrix = new Matrix3();

		/**
		 * Internal cache for maintaining clipping contexts.
		 *
		 * @type {WeakMap<ClippingGroup,ClippingContext>}
		 */
		this.clippingGroupContexts = new WeakMap();

		/**
		 * The intersection planes.
		 *
		 * @type {Array<Vector4>}
		 */
		this.intersectionPlanes = [];

		/**
		 * The intersection planes.
		 *
		 * @type {Array<Vector4>}
		 */
		this.unionPlanes = [];

		/**
		 * The version of the clipping context's parent context.
		 *
		 * @type {?number}
		 * @readonly
		 */
		this.parentVersion = null;

		if ( parentContext !== null ) {

			this.viewNormalMatrix = parentContext.viewNormalMatrix;
			this.clippingGroupContexts = parentContext.clippingGroupContexts;

			this.shadowPass = parentContext.shadowPass;
			this.viewMatrix = parentContext.viewMatrix;

		}

	}

	/**
	 * Projects the given source clipping planes and writes the result into the
	 * destination array.
	 *
	 * @param {Array<Plane>} source - The source clipping planes.
	 * @param {Array<Vector4>} destination - The destination.
	 * @param {number} offset - The offset.
	 */
	projectPlanes( source, destination, offset ) {

		const l = source.length;

		for ( let i = 0; i < l; i ++ ) {

			_plane.copy( source[ i ] ).applyMatrix4( this.viewMatrix, this.viewNormalMatrix );

			const v = destination[ offset + i ];
			const normal = _plane.normal;

			v.x = - normal.x;
			v.y = - normal.y;
			v.z = - normal.z;
			v.w = _plane.constant;

		}

	}

	/**
	 * Updates the root clipping context of a scene.
	 *
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera that is used to render the scene.
	 */
	updateGlobal( scene, camera ) {

		this.shadowPass = ( scene.overrideMaterial !== null && scene.overrideMaterial.isShadowPassMaterial );
		this.viewMatrix = camera.matrixWorldInverse;

		this.viewNormalMatrix.getNormalMatrix( this.viewMatrix );

	}

	/**
	 * Updates the clipping context.
	 *
	 * @param {ClippingContext} parentContext - The parent context.
	 * @param {ClippingGroup} clippingGroup - The clipping group this context belongs to.
	 */
	update( parentContext, clippingGroup ) {

		let update = false;

		if ( parentContext.version !== this.parentVersion ) {

			this.intersectionPlanes = Array.from( parentContext.intersectionPlanes );
			this.unionPlanes = Array.from( parentContext.unionPlanes );
			this.parentVersion = parentContext.version;

		}

		if ( this.clipIntersection !== clippingGroup.clipIntersection ) {

			this.clipIntersection = clippingGroup.clipIntersection;

			if ( this.clipIntersection ) {

				this.unionPlanes.length = parentContext.unionPlanes.length;

			} else {

				this.intersectionPlanes.length = parentContext.intersectionPlanes.length;

			}

		}

		const srcClippingPlanes = clippingGroup.clippingPlanes;
		const l = srcClippingPlanes.length;

		let dstClippingPlanes;
		let offset;

		if ( this.clipIntersection ) {

			dstClippingPlanes = this.intersectionPlanes;
			offset = parentContext.intersectionPlanes.length;

		} else {

			dstClippingPlanes = this.unionPlanes;
			offset = parentContext.unionPlanes.length;

		}

		if ( dstClippingPlanes.length !== offset + l ) {

			dstClippingPlanes.length = offset + l;

			for ( let i = 0; i < l; i ++ ) {

				dstClippingPlanes[ offset + i ] = new Vector4();

			}

			update = true;

		}

		this.projectPlanes( srcClippingPlanes, dstClippingPlanes, offset );

		if ( update ) {

			this.version ++;
			this.cacheKey = `${ this.intersectionPlanes.length }:${ this.unionPlanes.length }`;

		}

	}

	/**
	 * Returns a clipping context for the given clipping group.
	 *
	 * @param {ClippingGroup} clippingGroup - The clipping group.
	 * @return {ClippingContext} The clipping context.
	 */
	getGroupContext( clippingGroup ) {

		if ( this.shadowPass && ! clippingGroup.clipShadows ) return this;

		let context = this.clippingGroupContexts.get( clippingGroup );

		if ( context === undefined ) {

			context = new ClippingContext( this );
			this.clippingGroupContexts.set( clippingGroup, context );

		}

		context.update( this, clippingGroup );

		return context;

	}

	/**
	 * The count of union clipping planes.
	 *
	 * @type {number}
	 * @readonly
	 */
	get unionClippingCount() {

		return this.unionPlanes.length;

	}

}

export default ClippingContext;
