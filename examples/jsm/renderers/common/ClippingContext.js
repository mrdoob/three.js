import { Matrix3, Plane, Vector4 } from 'three';

const _plane = new Plane();
const _clippingGroupContexts = new WeakMap();

let _clippingContextVersion = 0;

class ClippingContext {

	constructor() {

		this.version = ++ _clippingContextVersion;

		this.globalClippingCount = 0;

		this._localClippingCount = 0;
		this.localClippingEnabled = false;
		this.localClipIntersection = false;

		this.offset = 0;

		this.planes = [];

		this.parentVersion = 0;
		this.viewNormalMatrix = new Matrix3();

	}

	projectPlanes( source, offset ) {

		const l = source.length;
		const planes = this.planes;

		for ( let i = 0; i < l; i ++ ) {

			_plane.copy( source[ i ] ).applyMatrix4( this.viewMatrix, this.viewNormalMatrix );

			const v = planes[ offset + i ];
			const normal = _plane.normal;

			v.x = - normal.x;
			v.y = - normal.y;
			v.z = - normal.z;
			v.w = _plane.constant;
		}

	}

	updateGlobal( renderer, camera ) {

		const rendererClippingPlanes = renderer.clippingPlanes;
		this.viewMatrix = camera.matrixWorldInverse;

		this.viewNormalMatrix.getNormalMatrix( this.viewMatrix );

		let update = false;

		if ( Array.isArray( rendererClippingPlanes ) && rendererClippingPlanes.length !== 0 ) {

			const l = rendererClippingPlanes.length;

			if ( l !== this.globalClippingCount ) {

				const planes = [];

				for ( let i = 0; i < l; i ++ ) {

					planes.push( new Vector4() );

				}

				this.globalClippingCount = l;
				this.planes = planes;

				update = true;

			}

			this.projectPlanes( rendererClippingPlanes, 0 );

		} else if ( this.globalClippingCount !== 0 ) {

			this.globalClippingCount = 0;
			this.planes = [];
			update = true;

		}

		if ( renderer.localClippingEnabled !== this.localClippingEnabled ) {

			this.localClippingEnabled = renderer.localClippingEnabled;
			update = true;

		}

		if ( update ) this.version = _clippingContextVersion ++;

	}

	update( parent, material ) {

		let update = false;

		if ( this !== parent && parent.version !== this.parentVersion ) {

			this.globalClippingCount = material.isShadowNodeMaterial ? 0 : parent.globalClippingCount;
			this.localClippingEnabled = parent.localClippingEnabled;
			this.planes = Array.from( parent.planes );
			this.parentVersion = parent.version;
			this.viewMatrix = parent.viewMatrix;
			this.viewNormalMatrix = parent.viewNormalMatrix;
			this.offset = parent._localClippingCount + parent.offset;
			this.isGroup = material.isClippingGroup;

			update = true;

		}

		if ( this.localClippingEnabled ) {

			const localClippingPlanes = material.clippingPlanes;

			if ( ( Array.isArray( localClippingPlanes ) && localClippingPlanes.length !== 0 ) ) {

				const l = localClippingPlanes.length;
				const planes = this.planes;
				const offset = this.globalClippingCount + this.offset;

				if ( update || l !== this._localClippingCount ) {

					planes.length = offset + l;

					for ( let i = 0; i < l; i ++ ) {

						planes[ offset + i ] = new Vector4();

					}

					this._localClippingCount = l;
					update = true;

				}

				this.projectPlanes( localClippingPlanes, offset );


			} else if ( this._localClippingCount !== 0 ) {

				this._localClippingCount = 0;
				update = true;

			}

			if ( this.localClipIntersection !== material.clipIntersection ) {

				this.localClipIntersection = material.clipIntersection;
				update = true;

			}

		}

		if ( update ) this.version = _clippingContextVersion ++;

	}

	get localClippingCount() {

		return this.localClippingEnabled ? this._localClippingCount + this.offset : 0;

	}

	static getGroupContext( clippingGroup, parentContext ) {

		let context = _clippingGroupContexts.get( clippingGroup );

		if ( context === undefined ) {

			context = new ClippingContext()
			_clippingGroupContexts.set( clippingGroup, context );

		}

		context.update( parentContext, clippingGroup );

		return context;

	}

}

export default ClippingContext;
