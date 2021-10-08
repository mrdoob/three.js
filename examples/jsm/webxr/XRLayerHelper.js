import {
	Mesh,
	PlaneGeometry,
	MeshBasicMaterial,
	// testing
	BoxGeometry,
	MeshNormalMaterial
} from '../../../build/three.module.js';

const XRLAYER_MODE = 0;
const MESH_MODE = 1;

class XRLayerHelper extends Mesh {

	constructor( renderer, texture, width, height ) {

		super();

		this.isXRLayerHelper = true
		this.renderer = renderer;
		this.texture = texture;
		this.width = width;
		this.height = height;

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

		this.updateMesh();

	}

	updateMesh() {

		this.geometry = new PlaneGeometry( this.width, this.height );

		this.material = new MeshBasicMaterial( { map: this.texture } );

		/*

		snellenTexture = new THREE.TextureLoader().load( "textures/snellen.png" );
		snellenTexture.repeat.x = snellenConfig.cropX;
		snellenTexture.repeat.y = snellenConfig.cropY;

		const snellenMeshMipMap = new THREE.Mesh(
			new THREE.PlaneGeometry( snellenConfig.widthMeters, snellenConfig.heightMeters ),
			new THREE.MeshBasicMaterial( { map: snellenTexture } )
		);

		snellenMeshMipMap.position.x = snellenConfig.x + snellenConfig.widthMeters;
		snellenMeshMipMap.position.y = snellenConfig.y - snellenConfig.heightMeters;

		eyeCharts.add( snellenMeshMipMap );

		*/

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

	}

	update( frame ) {

		this.updateMode();

	}

}

export { XRLayerHelper };
