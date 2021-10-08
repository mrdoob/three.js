import {
	Object3D
} from '../../../build/three.module.js';

const XRLAYER_MODE = 0;
const MESH_MODE = 1;

class XRLayerHelper extends Object3D {

	constructor( renderer ) {

		super();

		this.isXRLayerHelper = true
		this.renderer = renderer;

		this.init();

	}

	init() {

		this.renderer.xr.addEventListener( 'sessionstart', () => {

			this.session = this.renderer.xr.getSession();
			this.glBinding = this.renderer.xr.getBinding();

		} );

		this.renderer.xr.addEventListener( 'sessionend', () => {

			this.session = null;
			this.glBinding = null;

		} );

	}

	updateMode() {

		if (
			this.session &&
			this.session.renderState.layers !== undefined
		) {

			this.mode = XRLAYER_MODE;

		} else {

			this.mode = MESH_MODE;

		};

		//

		if ( this.mode === MESH_MODE ) {

			this.XRLayer = null;

			// apply the texture on the mesh, to emulate the behavior
			// of an XRLayer ( with lower resolution and performance )

			// this.mesh.material = this.material;

		} else {

			if ( !this.XRLayer ) {

				// if the current mode is XRLAYER_MODE and this.XRLayer
				// is falsy, it means we need to create an XRLayer and
				// reference it in this.XRLayer.

				// this.makeXRLayer();

			}

		}

		console.log( this.mode )

	}

	update( frame ) {

		this.updateMode();

	}

}

export { XRLayerHelper };
