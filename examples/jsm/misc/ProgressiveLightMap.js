import { DoubleSide, FloatType, HalfFloatType, Mesh, MeshBasicMaterial, MeshPhongMaterial, PlaneGeometry, Scene, WebGLRenderTarget } from 'three';
import { potpack } from '../libs/potpack.module.js';

/**
 * Progressive Light Map Accumulator, by [zalo](https://github.com/zalo/)
 *
 * To use, simply construct a `ProgressiveLightMap` object,
 * `plmap.addObjectsToLightMap(object)` an array of semi-static
 * objects and lights to the class once, and then call
 * `plmap.update(camera)` every frame to begin accumulating
 * lighting samples.
 *
 * This should begin accumulating lightmaps which apply to
 * your objects, so you can start jittering lighting to achieve
 * the texture-space effect you're looking for.
 *
 * @param {WebGLRenderer} renderer An instance of WebGLRenderer.
 * @param {number} res The side-long dimension of you total lightmap.
 */
class ProgressiveLightMap {

	constructor( renderer, res = 1024 ) {

		this.renderer = renderer;
		this.res = res;
		this.lightMapContainers = [];
		this.scene = new Scene();
		this.buffer1Active = false;
		this.firstUpdate = true;
		this.labelMesh = null;
		this.blurringPlane = null;

		// Create the Progressive LightMap Texture
		const format = /(Android|iPad|iPhone|iPod)/g.test( navigator.userAgent ) ? HalfFloatType : FloatType;
		this.progressiveLightMap1 = new WebGLRenderTarget( this.res, this.res, { type: format } );
		this.progressiveLightMap2 = new WebGLRenderTarget( this.res, this.res, { type: format } );
		this.progressiveLightMap2.texture.channel = 1;

		// Inject some spicy new logic into a standard phong material
		this.uvMat = new MeshPhongMaterial();
		this.uvMat.uniforms = {};
		this.uvMat.onBeforeCompile = ( shader ) => {

			// Vertex Shader: Set Vertex Positions to the Unwrapped UV Positions
			shader.vertexShader =
				'attribute vec2 uv1;\n' +
				'#define USE_LIGHTMAP\n' +
				'#define LIGHTMAP_UV uv1\n' +
				shader.vertexShader.slice( 0, - 1 ) +
				'	gl_Position = vec4((LIGHTMAP_UV - 0.5) * 2.0, 1.0, 1.0); }';

			// Fragment Shader: Set Pixels to average in the Previous frame's Shadows
			const bodyStart = shader.fragmentShader.indexOf( 'void main() {' );
			shader.fragmentShader =
				'#define USE_LIGHTMAP\n' +
				shader.fragmentShader.slice( 0, bodyStart ) +
				'	uniform sampler2D previousShadowMap;\n	uniform float averagingWindow;\n' +
				shader.fragmentShader.slice( bodyStart - 1, - 1 ) +
				`\nvec3 texelOld = texture2D(previousShadowMap, vLightMapUv).rgb;
				gl_FragColor.rgb = mix(texelOld, gl_FragColor.rgb, 1.0/averagingWindow);
			}`;

			// Set the Previous Frame's Texture Buffer and Averaging Window
			shader.uniforms.previousShadowMap = { value: this.progressiveLightMap1.texture };
			shader.uniforms.averagingWindow = { value: 100 };

			this.uvMat.uniforms = shader.uniforms;

			// Set the new Shader to this
			this.uvMat.userData.shader = shader;

		};

	}

	/**
	 * Sets these objects' materials' lightmaps and modifies their uv1's.
	 * @param {Object3D} objects An array of objects and lights to set up your lightmap.
	 */
	addObjectsToLightMap( objects ) {

		// Prepare list of UV bounding boxes for packing later...
		this.uv_boxes = []; const padding = 3 / this.res;

		for ( let ob = 0; ob < objects.length; ob ++ ) {

			const object = objects[ ob ];

			// If this object is a light, simply add it to the internal scene
			if ( object.isLight ) {

				this.scene.attach( object ); continue;

			}

			if ( object.geometry.hasAttribute( 'uv' ) === false ) {

				console.warn( 'THREE.ProgressiveLightMap: All lightmap objects need uvs.' ); continue;

			}

			if ( this.blurringPlane === null ) {

				this._initializeBlurPlane( this.res, this.progressiveLightMap1 );

			}

			// Apply the lightmap to the object
			object.material.lightMap = this.progressiveLightMap2.texture;
			object.material.dithering = true;
			object.castShadow = true;
			object.receiveShadow = true;
			object.renderOrder = 1000 + ob;

			// Prepare UV boxes for potpack
			// TODO: Size these by object surface area
			this.uv_boxes.push( { w: 1 + ( padding * 2 ),
								  h: 1 + ( padding * 2 ), index: ob } );

			this.lightMapContainers.push( { basicMat: object.material, object: object } );

		}

		// Pack the objects' lightmap UVs into the same global space
		const dimensions = potpack( this.uv_boxes );
		this.uv_boxes.forEach( ( box ) => {

			const uv1 = objects[ box.index ].geometry.getAttribute( 'uv' ).clone();
			for ( let i = 0; i < uv1.array.length; i += uv1.itemSize ) {

				uv1.array[ i ] = ( uv1.array[ i ] + box.x + padding ) / dimensions.w;
				uv1.array[ i + 1 ] = ( uv1.array[ i + 1 ] + box.y + padding ) / dimensions.h;

			}

			objects[ box.index ].geometry.setAttribute( 'uv1', uv1 );
			objects[ box.index ].geometry.getAttribute( 'uv1' ).needsUpdate = true;

		} );

	}

	/**
	 * This function renders each mesh one at a time into their respective surface maps
	 * @param {Camera} camera Standard Rendering Camera
	 * @param {number} blendWindow When >1, samples will accumulate over time.
	 * @param {boolean} blurEdges  Whether to fix UV Edges via blurring
	 */
	update( camera, blendWindow = 100, blurEdges = true ) {

		if ( this.blurringPlane === null ) {

			return;

		}

		// Store the original Render Target
		const oldTarget = this.renderer.getRenderTarget();

		// The blurring plane applies blur to the seams of the lightmap
		this.blurringPlane.visible = blurEdges;

		// Steal the Object3D from the real world to our special dimension
		for ( let l = 0; l < this.lightMapContainers.length; l ++ ) {

			this.lightMapContainers[ l ].object.oldScene =
				this.lightMapContainers[ l ].object.parent;
			this.scene.attach( this.lightMapContainers[ l ].object );

		}

		// Initialize everything
		if ( this.firstUpdate === true ) {

			this.renderer.compile( this.scene, camera );
			this.firstUpdate = false;

		}

		// Set each object's material to the UV Unwrapped Surface Mapping Version
		for ( let l = 0; l < this.lightMapContainers.length; l ++ ) {

			this.uvMat.uniforms.averagingWindow = { value: blendWindow };
			this.lightMapContainers[ l ].object.material = this.uvMat;
			this.lightMapContainers[ l ].object.oldFrustumCulled =
				this.lightMapContainers[ l ].object.frustumCulled;
			this.lightMapContainers[ l ].object.frustumCulled = false;

		}

		// Ping-pong two surface buffers for reading/writing
		const activeMap = this.buffer1Active ? this.progressiveLightMap1 : this.progressiveLightMap2;
		const inactiveMap = this.buffer1Active ? this.progressiveLightMap2 : this.progressiveLightMap1;

		// Render the object's surface maps
		this.renderer.setRenderTarget( activeMap );
		this.uvMat.uniforms.previousShadowMap = { value: inactiveMap.texture };
		this.blurringPlane.material.uniforms.previousShadowMap = { value: inactiveMap.texture };
		this.buffer1Active = ! this.buffer1Active;
		this.renderer.render( this.scene, camera );

		// Restore the object's Real-time Material and add it back to the original world
		for ( let l = 0; l < this.lightMapContainers.length; l ++ ) {

			this.lightMapContainers[ l ].object.frustumCulled =
				this.lightMapContainers[ l ].object.oldFrustumCulled;
			this.lightMapContainers[ l ].object.material = this.lightMapContainers[ l ].basicMat;
			this.lightMapContainers[ l ].object.oldScene.attach( this.lightMapContainers[ l ].object );

		}

		// Restore the original Render Target
		this.renderer.setRenderTarget( oldTarget );

	}

	/** DEBUG
	 * Draw the lightmap in the main scene.  Call this after adding the objects to it.
	 * @param {boolean} visible Whether the debug plane should be visible
	 * @param {Vector3} position Where the debug plane should be drawn
	*/
	showDebugLightmap( visible, position = undefined ) {

		if ( this.lightMapContainers.length === 0 ) {

			console.warn( 'THREE.ProgressiveLightMap: Call .showDebugLightmap() after adding the objects.' );

			return;

		}

		if ( this.labelMesh === null ) {

			const labelMaterial = new MeshBasicMaterial( { map: this.progressiveLightMap1.texture, side: DoubleSide } );
			const labelGeometry = new PlaneGeometry( 100, 100 );
			this.labelMesh = new Mesh( labelGeometry, labelMaterial );
			this.labelMesh.position.y = 250;
			this.lightMapContainers[ 0 ].object.parent.add( this.labelMesh );

		}

		if ( position !== undefined ) {

			this.labelMesh.position.copy( position );

		}

		this.labelMesh.visible = visible;

	}

	/**
	 * INTERNAL Creates the Blurring Plane
	 * @param {number} res The square resolution of this object's lightMap.
	 * @param {WebGLRenderTexture} lightMap The lightmap to initialize the plane with.
	 */
	_initializeBlurPlane( res, lightMap = null ) {

		const blurMaterial = new MeshBasicMaterial();
		blurMaterial.uniforms = { previousShadowMap: { value: null },
								  pixelOffset: { value: 1.0 / res },
								  polygonOffset: true, polygonOffsetFactor: - 1, polygonOffsetUnits: 3.0 };
		blurMaterial.onBeforeCompile = ( shader ) => {

			// Vertex Shader: Set Vertex Positions to the Unwrapped UV Positions
			shader.vertexShader =
				'#define USE_UV\n' +
				shader.vertexShader.slice( 0, - 1 ) +
				'	gl_Position = vec4((uv - 0.5) * 2.0, 1.0, 1.0); }';

			// Fragment Shader: Set Pixels to 9-tap box blur the current frame's Shadows
			const bodyStart	= shader.fragmentShader.indexOf( 'void main() {' );
			shader.fragmentShader =
				'#define USE_UV\n' +
				shader.fragmentShader.slice( 0, bodyStart ) +
				'	uniform sampler2D previousShadowMap;\n	uniform float pixelOffset;\n' +
				shader.fragmentShader.slice( bodyStart - 1, - 1 ) +
					`	gl_FragColor.rgb = (
									texture2D(previousShadowMap, vUv + vec2( pixelOffset,  0.0        )).rgb +
									texture2D(previousShadowMap, vUv + vec2( 0.0        ,  pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2( 0.0        , -pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2(-pixelOffset,  0.0        )).rgb +
									texture2D(previousShadowMap, vUv + vec2( pixelOffset,  pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2(-pixelOffset,  pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2( pixelOffset, -pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2(-pixelOffset, -pixelOffset)).rgb)/8.0;
				}`;

			// Set the LightMap Accumulation Buffer
			shader.uniforms.previousShadowMap = { value: lightMap.texture };
			shader.uniforms.pixelOffset = { value: 0.5 / res };
			blurMaterial.uniforms = shader.uniforms;

			// Set the new Shader to this
			blurMaterial.userData.shader = shader;

		};

		this.blurringPlane = new Mesh( new PlaneGeometry( 1, 1 ), blurMaterial );
		this.blurringPlane.name = 'Blurring Plane';
		this.blurringPlane.frustumCulled = false;
		this.blurringPlane.renderOrder = 0;
		this.blurringPlane.material.depthWrite = false;
		this.scene.add( this.blurringPlane );

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this.progressiveLightMap1.dispose();
		this.progressiveLightMap2.dispose();

		this.uvMat.dispose();

		if ( this.blurringPlane !== null ) {

			this.blurringPlane.geometry.dispose();
			this.blurringPlane.material.dispose();

		}

		if ( this.labelMesh !== null ) {

			this.labelMesh.geometry.dispose();
			this.labelMesh.material.dispose();

		}

	}

}

export { ProgressiveLightMap };
