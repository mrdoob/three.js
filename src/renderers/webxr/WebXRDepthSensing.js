import { PlaneGeometry } from '../../geometries/PlaneGeometry.js';
import { ShaderMaterial } from '../../materials/ShaderMaterial.js';
import { Mesh } from '../../objects/Mesh.js';
import { Texture } from '../../textures/Texture.js';

const _occlusion_vertex = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`;

const _occlusion_fragment = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;

/**
 * A XR module that manages the access to the Depth Sensing API.
 */
class WebXRDepthSensing {

	/**
	 * Constructs a new depth sensing module.
	 */
	constructor() {

		/**
		 * A texture representing the depth of the user's environment.
		 *
		 * @type {?Texture}
		 */
		this.texture = null;

		/**
		 * A plane mesh for visualizing the depth texture.
		 *
		 * @type {?Mesh}
		 */
		this.mesh = null;

		/**
		 * The depth near value.
		 *
		 * @type {number}
		 */
		this.depthNear = 0;

		/**
		 * The depth near far.
		 *
		 * @type {number}
		 */
		this.depthFar = 0;

	}

	/**
	 * Inits the depth sensing module
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {XRWebGLDepthInformation} depthData - The XR depth data.
	 * @param {XRRenderState} renderState - The XR render state.
	 */
	init( renderer, depthData, renderState ) {

		if ( this.texture === null ) {

			const texture = new Texture();

			const texProps = renderer.properties.get( texture );
			texProps.__webglTexture = depthData.texture;

			if ( ( depthData.depthNear !== renderState.depthNear ) || ( depthData.depthFar !== renderState.depthFar ) ) {

				this.depthNear = depthData.depthNear;
				this.depthFar = depthData.depthFar;

			}

			this.texture = texture;

		}

	}

	/**
	 * Returns a plane mesh that visualizes the depth texture.
	 *
	 * @param {ArrayCamera} cameraXR - The XR camera.
	 * @return {?Mesh} The plane mesh.
	 */
	getMesh( cameraXR ) {

		if ( this.texture !== null ) {

			if ( this.mesh === null ) {

				const viewport = cameraXR.cameras[ 0 ].viewport;
				const material = new ShaderMaterial( {
					vertexShader: _occlusion_vertex,
					fragmentShader: _occlusion_fragment,
					uniforms: {
						depthColor: { value: this.texture },
						depthWidth: { value: viewport.z },
						depthHeight: { value: viewport.w }
					}
				} );

				this.mesh = new Mesh( new PlaneGeometry( 20, 20 ), material );

			}

		}

		return this.mesh;

	}

	/**
	 * Resets the module
	 */
	reset() {

		this.texture = null;
		this.mesh = null;

	}

	/**
	 * Returns a texture representing the depth of the user's environment.
	 *
	 * @return {?Texture} The depth texture.
	 */
	getDepthTexture() {

		return this.texture;

	}

}

export { WebXRDepthSensing };
