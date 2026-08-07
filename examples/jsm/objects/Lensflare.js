import {
	AdditiveBlending,
	BufferGeometry,
	FramebufferTexture,
	InterleavedBuffer,
	InterleavedBufferAttribute,
	Mesh,
	MeshBasicMaterial,
	RawShaderMaterial,
	UnsignedByteType,
	box2ContainsPoint,
	box2Create,
	colorCopy,
	colorSet,
	vec2Create,
	vec2Set,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3SetFromMatrixPosition,
	vec4Create
} from 'three';

/**
 * Creates a simulated lens flare that tracks a light.
 *
 * Note that this class can only be used with {@link WebGLRenderer}.
 * When using {@link WebGPURenderer}, use {@link LensflareMesh}.
 *
 * ```js
 * const light = new THREE.PointLight( 0xffffff, 1.5, 2000 );
 *
 * const lensflare = new Lensflare();
 * lensflare.addElement( new LensflareElement( textureFlare0, 512, 0 ) );
 * lensflare.addElement( new LensflareElement( textureFlare1, 512, 0 ) );
 * lensflare.addElement( new LensflareElement( textureFlare2, 60, 0.6 ) );
 *
 * light.add( lensflare );
 * ```
 *
 * @augments Mesh
 * @three_import import { Lensflare } from 'three/addons/objects/Lensflare.js';
 */
class Lensflare extends Mesh {

	/**
	 * Constructs a new lensflare.
	 */
	constructor() {

		super( Lensflare.Geometry, new MeshBasicMaterial( { opacity: 0, transparent: true } ) );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLensflare = true;

		this.type = 'Lensflare';

		/**
		 * Overwritten to disable view-frustum culling by default.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.frustumCulled = false;

		/**
		 * Overwritten to make sure lensflares a rendered last.
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.renderOrder = Infinity;

		//

		const positionScreen = vec3Create();
		const positionView = vec3Create();

		// textures

		const tempMap = new FramebufferTexture( 16, 16 );
		const occlusionMap = new FramebufferTexture( 16, 16 );

		let currentType = UnsignedByteType;

		// material

		const geometry = Lensflare.Geometry;

		const material1a = new RawShaderMaterial( {
			uniforms: {
				'scale': { value: null },
				'screenPosition': { value: null }
			},
			vertexShader: /* glsl */`

				precision highp float;

				uniform vec3 screenPosition;
				uniform vec2 scale;

				attribute vec3 position;

				void main() {

					gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );

				}`,

			fragmentShader: /* glsl */`

				precision highp float;

				void main() {

					gl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );

				}`,
			depthTest: true,
			depthWrite: false,
			transparent: false
		} );

		const material1b = new RawShaderMaterial( {
			uniforms: {
				'map': { value: tempMap },
				'scale': { value: null },
				'screenPosition': { value: null }
			},
			vertexShader: /* glsl */`

				precision highp float;

				uniform vec3 screenPosition;
				uniform vec2 scale;

				attribute vec3 position;
				attribute vec2 uv;

				varying vec2 vUV;

				void main() {

					vUV = uv;

					gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );

				}`,

			fragmentShader: /* glsl */`

				precision highp float;

				uniform sampler2D map;

				varying vec2 vUV;

				void main() {

					gl_FragColor = texture2D( map, vUV );

				}`,
			depthTest: false,
			depthWrite: false,
			transparent: false
		} );

		// the following object is used for occlusionMap generation

		const mesh1 = new Mesh( geometry, material1a );

		//

		const elements = [];

		const shader = LensflareElement.Shader;

		const material2 = new RawShaderMaterial( {
			name: shader.name,
			uniforms: {
				'map': { value: null },
				'occlusionMap': { value: occlusionMap },
				'color': { value: colorSet( 0xffffff ) },
				'scale': { value: vec2Create() },
				'screenPosition': { value: vec3Create() }
			},
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			blending: AdditiveBlending,
			transparent: true,
			depthWrite: false
		} );

		const mesh2 = new Mesh( geometry, material2 );

		/**
		 * Adds the given lensflare element to this instance.
		 *
		 * @param {LensflareElement} element - The element to add.
		 */
		this.addElement = function ( element ) {

			elements.push( element );

		};

		//

		const scale = vec2Create();
		const screenPositionPixels = vec2Create();
		const validArea = box2Create();
		const viewport = vec4Create();

		this.onBeforeRender = function ( renderer, scene, camera ) {

			renderer.getCurrentViewport( viewport );

			const renderTarget = renderer.getRenderTarget();
			const type = ( renderTarget !== null ) ? renderTarget.texture.type : UnsignedByteType;

			if ( currentType !== type ) {

				tempMap.dispose();
				occlusionMap.dispose();

				tempMap.type = occlusionMap.type = type;

				currentType = type;

			}

			const invAspect = viewport.w / viewport.z;
			const halfViewportWidth = viewport.z / 2.0;
			const halfViewportHeight = viewport.w / 2.0;

			let size = 16 / viewport.w;
			vec2Set( size * invAspect, size, scale );

			vec2Set( viewport.x, viewport.y, validArea.min );
			vec2Set( viewport.x + ( viewport.z - 16 ), viewport.y + ( viewport.w - 16 ), validArea.max );

			// calculate position in screen space

			vec3SetFromMatrixPosition( this.matrixWorld, positionView );
			vec3ApplyMatrix4( positionView, camera.matrixWorldInverse, positionView );

			if ( positionView.z > 0 ) return; // lensflare is behind the camera

			vec3Copy( positionView, positionScreen );
			vec3ApplyMatrix4( positionScreen, camera.projectionMatrix, positionScreen );

			// horizontal and vertical coordinate of the lower left corner of the pixels to copy

			screenPositionPixels.x = viewport.x + ( positionScreen.x * halfViewportWidth ) + halfViewportWidth - 8;
			screenPositionPixels.y = viewport.y + ( positionScreen.y * halfViewportHeight ) + halfViewportHeight - 8;

			// screen cull

			if ( box2ContainsPoint( validArea, screenPositionPixels ) ) {

				// save current RGB to temp texture

				renderer.copyFramebufferToTexture( tempMap, screenPositionPixels );

				// render pink quad

				let uniforms = material1a.uniforms;
				uniforms[ 'scale' ].value = scale;
				uniforms[ 'screenPosition' ].value = positionScreen;

				renderer.renderBufferDirect( camera, null, geometry, material1a, mesh1, null );

				// copy result to occlusionMap

				renderer.copyFramebufferToTexture( occlusionMap, screenPositionPixels );

				// restore graphics

				uniforms = material1b.uniforms;
				uniforms[ 'scale' ].value = scale;
				uniforms[ 'screenPosition' ].value = positionScreen;

				renderer.renderBufferDirect( camera, null, geometry, material1b, mesh1, null );

				// render elements

				const vecX = - positionScreen.x * 2;
				const vecY = - positionScreen.y * 2;

				for ( let i = 0, l = elements.length; i < l; i ++ ) {

					const element = elements[ i ];

					const uniforms = material2.uniforms;

					colorCopy( element.color, uniforms[ 'color' ].value );
					uniforms[ 'map' ].value = element.texture;
					uniforms[ 'screenPosition' ].value.x = positionScreen.x + vecX * element.distance;
					uniforms[ 'screenPosition' ].value.y = positionScreen.y + vecY * element.distance;

					size = element.size / viewport.w;
					const invAspect = viewport.w / viewport.z;

					vec2Set( size * invAspect, size, uniforms[ 'scale' ].value );

					material2.uniformsNeedUpdate = true;

					renderer.renderBufferDirect( camera, null, geometry, material2, mesh2, null );

				}

			}

		};

		/**
		 * Frees the GPU-related resources allocated by this instance. Call this
		 * method whenever this instance is no longer used in your app.
		 */
		this.dispose = function () {

			material1a.dispose();
			material1b.dispose();
			material2.dispose();

			tempMap.dispose();
			occlusionMap.dispose();

			for ( let i = 0, l = elements.length; i < l; i ++ ) {

				elements[ i ].texture.dispose();

			}

		};

	}

}

/**
 * Represents a single flare that can be added to a {@link Lensflare} container.
 *
 * @three_import import { LensflareElement } from 'three/addons/objects/Lensflare.js';
 */
class LensflareElement {

	/**
	 * Constructs a new lensflare element.
	 *
	 * @param {Texture} texture - The flare's texture.
	 * @param {number} [size=1] - The size in pixels.
	 * @param {number} [distance=0] - The normalized distance (`[0,1]`) from the light source.
	 * A value of `0` means the flare is located at light source.
	 * @param {Color} [color] - The flare's color
	 */
	constructor( texture, size = 1, distance = 0, color = colorSet( 0xffffff ) ) {

		/**
		 * The flare's texture.
		 *
		 * @type {Texture}
		 */
		this.texture = texture;

		/**
		 * The size in pixels.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.size = size;

		/**
		 * The normalized distance (`[0,1]`) from the light source.
		 * A value of `0` means the flare is located at light source.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.distance = distance;

		/**
		 * The flare's color
		 *
		 * @type {Color}
		 * @default (1,1,1)
		 */
		this.color = color;

	}

}

LensflareElement.Shader = {

	name: 'LensflareElementShader',

	uniforms: {

		'map': { value: null },
		'occlusionMap': { value: null },
		'color': { value: null },
		'scale': { value: null },
		'screenPosition': { value: null }

	},

	vertexShader: /* glsl */`

		precision highp float;

		uniform vec3 screenPosition;
		uniform vec2 scale;

		uniform sampler2D occlusionMap;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUV;
		varying float vVisibility;

		void main() {

			vUV = uv;

			vec2 pos = position.xy;

			vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );
			visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );
			visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );
			visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );
			visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );
			visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );
			visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );
			visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );
			visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );

			vVisibility =        visibility.r / 9.0;
			vVisibility *= 1.0 - visibility.g / 9.0;
			vVisibility *=       visibility.b / 9.0;

			gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		precision highp float;

		uniform sampler2D map;
		uniform vec3 color;

		varying vec2 vUV;
		varying float vVisibility;

		void main() {

			vec4 texture = texture2D( map, vUV );
			texture.a *= vVisibility;
			gl_FragColor = texture;
			gl_FragColor.rgb *= color;

		}`

};

Lensflare.Geometry = ( function () {

	const geometry = new BufferGeometry();

	const float32Array = new Float32Array( [
		- 1, - 1, 0, 0, 0,
		1, - 1, 0, 1, 0,
		1, 1, 0, 1, 1,
		- 1, 1, 0, 0, 1
	] );

	const interleavedBuffer = new InterleavedBuffer( float32Array, 5 );

	geometry.setIndex( [ 0, 1, 2,	0, 2, 3 ] );
	geometry.setAttribute( 'position', new InterleavedBufferAttribute( interleavedBuffer, 3, 0, false ) );
	geometry.setAttribute( 'uv', new InterleavedBufferAttribute( interleavedBuffer, 2, 3, false ) );

	return geometry;

} )();

export { Lensflare, LensflareElement };
