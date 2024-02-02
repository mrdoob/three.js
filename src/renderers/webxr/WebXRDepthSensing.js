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

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;

class WebXRDepthSensing {

	constructor() {

		this.texture = null;
		this.mesh = null;

		this.depthNear = 0;
		this.depthFar = 0;

	}

	init( renderer, depthData, renderState ) {

		if ( this.texture === null ) {

			const texture = new Texture();

			const texProps = renderer.properties.get( texture );
			texProps.__webglTexture = depthData.texture;

			if ( ( depthData.depthNear != renderState.depthNear ) || ( depthData.depthFar != renderState.depthFar ) ) {

				this.depthNear = depthData.depthNear;
				this.depthFar = depthData.depthFar;

			}

			this.texture = texture;

		}

	}

	render( renderer, cameraXR ) {

		if ( this.texture !== null ) {

			if ( this.mesh === null ) {

				const viewport = cameraXR.cameras[ 0 ].viewport;
				const material = new ShaderMaterial( {
					extensions: { fragDepth: true },
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

			renderer.render( this.mesh, cameraXR );

		}

	}

	reset() {

		this.texture = null;
		this.mesh = null;

	}

}

export { WebXRDepthSensing };
