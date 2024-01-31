let _clippingContextVersion = 0;

class ClippingContext {

	constructor() {

		this.version = ++ _clippingContextVersion;

		this.globalClippingPlanes = [];
		this.globalClippingCount = 0;

		this.localClippingEnabled = false;
		this.localClippingPlanes = [];
		this.localClippingCount = 0;

		this.localClipIntersection = false;

		this.parentVersion = 0;

	}

	inherit( parent ) {

		if ( this === parent || parent.version === this.parentVersion ) return;

		this.globalClippingPlanes = parent.globalClippingPlanes;
		this.globalClippingCount = parent.globalClippingCount;
		this.localClippingEnabled = parent.localClippingEnabled;
        this.parentVersion = parent.version;

		this.version = _clippingContextVersion ++;

	}

	updateGlobal( renderer ) {

		let update = false;

		if ( renderer.localClippingEnabled !== this.localClippingEnabled ) {

			this.localClippingEnabled = renderer.localClippingEnabled;
			update = true;

		}

		if ( renderer.clippingPlanes !== this.globalClippingPlanes && Array.isArray( renderer.clippingPlanes )) {

			this.globalClippingPlanes = renderer.clippingPlanes;
			this.globalClippingCount = this.globalClippingPlanes.length;
			update = true;

		} else if ( this.globalClippingPlanes.length !== this.globalClippingCount ) {

			this.globalClippingCount = this.globalClippingPlanes.length;
			update = true;

		}

		if ( update ) this.version = _clippingContextVersion ++;

	}

	updateMaterial( material ) {

		let update = false;

		if ( this.localClippingEnabled ) {

			if ( material.clippingPlanes != this.localClippingPlanes && Array.isArray( material.clippingPlanes ) ) {

				this.localClippingPlanes = material.clippingPlanes;
				this.localClippingCount = this.localClippingPlanes.length;
				update = true;

			} else if ( this.localClippingCount !== this.localClippingPlanes.length ) {

				this.localClippingCount = this.localClippingPlanes.length;
				update = true;

			}

			if ( this.localClipIntersection !== material.clipIntersection ) {

				this.localClipIntersection = material.clipIntersection;
				update = true;

			}

			if ( update ) this.version = _clippingContextVersion ++;

		}

	}

}

export default ClippingContext;
