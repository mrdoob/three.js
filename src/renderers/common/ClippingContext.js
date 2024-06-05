import { Matrix3 } from '../../math/Matrix3.js';
import { Plane } from '../../math/Plane.js';
import { Vector4 } from '../../math/Vector4.js';

const _plane = /*@__PURE__*/ new Plane();

class ClippingContext {

	constructor( parentContext = null ) {

		this.version = 0;

		this.clipIntersection = null;
		this.cacheKey = '';


		if ( parentContext === null ) {

			this.intersectionPlanes = [];
			this.unionPlanes = [];

			this.viewNormalMatrix = new Matrix3();
			this.clippingGroupContexts = new WeakMap();

			this.shadowPass = false;

		} else {

			this.viewNormalMatrix = parentContext.viewNormalMatrix;
			this.clippingGroupContexts = parentContext.clippingGroupContexts;

			this.shadowPass = parentContext.shadowPass;

			this.viewMatrix = parentContext.viewMatrix;

		}

		this.parentVersion = null;

	}

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

	updateGlobal( scene, camera ) {

		this.shadowPass = ( scene.overrideMaterial !== null && scene.overrideMaterial.isShadowNodeMaterial );
		this.viewMatrix = camera.matrixWorldInverse;

		this.viewNormalMatrix.getNormalMatrix( this.viewMatrix );

	}

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

	get unionClippingCount() {

		return this.unionPlanes.length;

	}

}

export default ClippingContext;
