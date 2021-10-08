import {
	Mesh,
	PlaneGeometry,
	MeshBasicMaterial,
	Matrix4,
	//

	Color
} from '../../../build/three.module.js';

const XRLAYER_MODE = 0;
const MESH_MODE = 1;

class XRLayerHelper extends Mesh {

	constructor( renderer, params ) {

		super();

		this.isXRLayerHelper = true
		this.renderer = renderer;
		this.params = params;
		// will be used to compare the last set XRLayer transforms with
		// the current mesh transforms.
		this.xrLayerMatrix = new Matrix4();

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

		//

		this.params.cropX = this.params.widthPx / this.params.textureSizePx;
		this.params.cropY = this.params.heightPx / this.params.textureSizePx;

		this.params.texture.repeat.x = this.params.cropX;
		this.params.texture.repeat.y = this.params.cropY;

		//

		this.updateMesh();

	}

	updateMesh() {

		// the mesh is used both as depth mask when the XRLayer is visible,
		// and as fallback when the XRLayer cannot be displayed.

		this.geometry = new PlaneGeometry(
			this.params.layerWidth,
			this.params.layerHeight
		);

		this.material = new MeshBasicMaterial( {
			map: this.params.texture,
			opacity: 0
		} );

	}

	makeXRLayer() {

		this.session.requestReferenceSpace( 'local-floor' ).then( ( refSpace ) => {

			const quadLayerConfig = {
				width: .5 * this.params.layerWidth / this.params.cropX,
				height: .5 * this.params.layerHeight / this.params.cropY,
				viewPixelWidth: this.params.textureSizePx,
				viewPixelHeight: this.params.textureSizePx,
				isStatic: true,
				space: refSpace,
				layout: this.params.layout
			};

			if ( this.params.mipLevels ) {

				quadLayerConfig.mipLevels = this.params.mipLevels;

			}

			this.XRLayer = this.glBinding.createQuadLayer( quadLayerConfig );

			this.session.updateRenderState( {
				layers: [
					this.XRLayer,
					// this is the projection layer, the one on which the scene is drawn.
					this.session.renderState.layers[ 0 ]
				]
			} );

		} );

	}

	updateTransform() {

		if ( this.XRLayer ) {

			// we compare the current transforms of the mesh with its transforms
			// the last time we updated the XRLayer transforms.

			this.updateMatrixWorld();

			if ( !this.xrLayerMatrix.equals( this.matrixWorld ) ) {

				this.XRLayer.transform = new XRRigidTransform(
					this.position,
					this.quaternion
				);

				this.xrLayerMatrix.copy( this.matrixWorld );

			}

		}

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

		} else {

			if ( !this.XRLayer ) {

				this.makeXRLayer();

			}

		}

	}

	update( frame ) {

		this.updateMode();

		this.updateTransform();

		//

		if (
			this.mode === XRLAYER_MODE &&
			this.XRLayer &&
			this.XRLayer.needsRedraw
		) {

			// Copy images to layers as required.
			// needsRedraw is set on creation or if the underlying
			// GL resources of a layer are lost.

			const gl = this.renderer.getContext();

			const glayer = this.glBinding.getSubImage( this.XRLayer, frame );

			this.renderer.state.bindTexture( gl.TEXTURE_2D, glayer.colorTexture );

			gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

			gl.texSubImage2D(
				gl.TEXTURE_2D,
				0,
				( this.params.textureSizePx - this.params.widthPx ) * 0.5,
				( this.params.textureSizePx - this.params.heightPx ) * 0.5,
				this.params.widthPx,
				this.params.heightPx,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				this.params.texture.image
			);

			if ( this.params.mipLevels ) {

				gl.generateMipmap( gl.TEXTURE_2D );

			}

		}

	}

}

export { XRLayerHelper };
