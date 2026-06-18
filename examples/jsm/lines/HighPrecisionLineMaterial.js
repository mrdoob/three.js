import { Color, Matrix4, ShaderMaterial, Vector3 } from 'three';
import { splitVector3 } from './utils/splitVector3.js';

/**
 * Material for rendering lines using camera-relative
 * high precision coordinates.
 *
 * World positions are split into high and low precision
 * components and reconstructed relative to the camera
 * in the vertex shader to avoid floating-point precision
 * issues at large distances from the world origin.
 */
export class HighPrecisionLineMaterial extends ShaderMaterial {

	/**
	 * @param {Object} [parameters]
	 * @param {number|string|Color} [parameters.color=0xffffff]
	 * @param {number} [parameters.opacity=1]
	 * @param {boolean} [parameters.transparent=false]
	 */
	constructor( parameters = {} ) {

		super( {
			uniforms: {
				cameraHigh: { value: new Vector3() },
				cameraLow: { value: new Vector3() },
				rotation: { value: new Matrix4() },

				diffuse: {
					value: new Color( parameters.color ?? 0xffffff ),
				},

				opacity: {
					value: parameters.opacity ?? 1.0,
				},
			},

			vertexShader: `
				attribute vec3 positionHigh;
				attribute vec3 positionLow;

				uniform vec3 cameraHigh;
				uniform vec3 cameraLow;

				uniform mat4 rotation;

				void main() {

					vec3 relative =
						( positionHigh - cameraHigh ) +
						( positionLow - cameraLow );

					gl_Position =
						projectionMatrix *
						rotation *
						vec4( relative, 1.0 );

				}
			`,

			fragmentShader: `
				uniform vec3 diffuse;
				uniform float opacity;

				void main() {

					gl_FragColor = vec4( diffuse, opacity );

				}
			`,

			transparent: parameters.transparent ?? false,
		} );

		Object.defineProperties( this, {
			color: {
				get() {

					return this.uniforms.diffuse.value;

				},
			},

			opacity: {
				get() {

					return this.uniforms.opacity.value;

				},

				set( value ) {

					this.uniforms.opacity.value = value;

				},
			},
		} );

		this.isHighPrecisionLineMaterial = true;
		this.type = 'HighPrecisionLineMaterial';

	}

	/**
	 * Updates the camera-relative uniforms.
	 *
	 * Must be called whenever the camera position
	 * or orientation changes.
	 *
	 * @param {Camera} camera
	 */
	setCamera( camera ) {

		this.setCameraPosition( camera.position );
		this.setCameraRotation( camera.matrixWorldInverse );

	}

	/**
	 * Updates the camera position uniforms.
	 *
	 * @param {Vector3} position
	 */
	setCameraPosition( position ) {

		splitVector3(
			position,
			this.uniforms.cameraHigh.value,
			this.uniforms.cameraLow.value,
		);

	}

	/**
	 * Updates the camera rotation matrix.
	 *
	 * @param {Matrix4} matrix
	 */
	setCameraRotation( matrix ) {

		this.uniforms.rotation.value.extractRotation( matrix );

	}

}
