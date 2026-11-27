import {
	AdditiveBlending,
	Box2,
	BufferGeometry,
	Color,
	FramebufferTexture,
	InterleavedBuffer,
	InterleavedBufferAttribute,
	Mesh,
	MeshBasicNodeMaterial,
	NodeMaterial,
	UnsignedByteType,
	Vector2,
	Vector3,
	Vector4,
	Node
} from 'three/webgpu';

import { texture, textureLoad, uv, ivec2, vec2, vec4, positionGeometry, reference, varyingProperty, materialReference, Fn } from 'three/tsl';

const _positionView = /*@__PURE__*/ new Vector3();
const _screenPositionPixels = /*@__PURE__*/ new Vector4( 0, 0, 16, 16 );
const _validArea = /*@__PURE__*/ new Box2();
const _viewport = /*@__PURE__*/ new Vector4();

/**
 * Creates a simulated lens flare that tracks a light.
 *
 * Note that this class can only be used with {@link WebGPURenderer}.
 * When using {@link WebGLRenderer}, use {@link Lensflare}.
 *
 * ```js
 * const light = new THREE.PointLight( 0xffffff, 1.5, 2000 );
 *
 * const lensflare = new LensflareMesh();
 * lensflare.addElement( new LensflareElement( textureFlare0, 512, 0 ) );
 * lensflare.addElement( new LensflareElement( textureFlare1, 512, 0 ) );
 * lensflare.addElement( new LensflareElement( textureFlare2, 60, 0.6 ) );
 *
 * light.add( lensflare );
 * ```
 *
 * @augments Mesh
 * @three_import import { LensflareMesh } from 'three/addons/objects/LensflareMesh.js';
 */
class LensflareMesh extends Mesh {

	/**
	 * Constructs a new lensflare mesh.
	 */
	constructor() {

		super( LensflareMesh.Geometry, new MeshBasicNodeMaterial( { opacity: 0, transparent: true } ) );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLensflareMesh = true;

		this.type = 'LensflareMesh';

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

		// textures

		const tempMap = new FramebufferTexture( 16, 16 );
		const occlusionMap = new FramebufferTexture( 16, 16 );

		const geometry = LensflareMesh.Geometry;

		// values for shared material uniforms

		const sharedValues = {
			scale: new Vector2(),
			positionScreen: new Vector3()
		};

		// materials

		const scale = reference( 'scale', 'vec2', sharedValues );
		const screenPosition = reference( 'positionScreen', 'vec3', sharedValues );

		const vertexNode = vec4( positionGeometry.xy.mul( scale ).add( screenPosition.xy ), screenPosition.z, 1.0 );

		const material1a = new NodeMaterial();

		material1a.depthTest = true;
		material1a.depthWrite = false;
		material1a.transparent = false;
		material1a.fog = false;
		material1a.type = 'Lensflare-1a';

		material1a.vertexNode = vertexNode;
		material1a.colorNode = vec4( 1.0, 0.0, 1.0, 1.0 );

		const material1b = new NodeMaterial();

		material1b.depthTest = false;
		material1b.depthWrite = false;
		material1b.transparent = false;
		material1b.fog = false;
		material1b.type = 'Lensflare-1b';

		material1b.vertexNode = vertexNode;
		material1b.colorNode = texture( tempMap, vec2( uv().flipY() ) );

		const material2 = new NodeMaterial();

		material2.transparent = true;
		material2.blending = AdditiveBlending;
		material2.depthWrite = false;
		material2.depthTest = false;
		material2.fog = false;
		material2.type = 'Lensflare-2';

		material2.screenPosition = new Vector3();
		material2.scale = new Vector2();
		material2.occlusionMap = occlusionMap;

		material2.vertexNode = Fn( ( { material } ) => {

			const scale = materialReference( 'scale', 'vec2' );
			const screenPosition = materialReference( 'screenPosition', 'vec3' );

			const occlusionMap = material.occlusionMap;

			const pos = positionGeometry.xy.toVar();

			const visibility = textureLoad( occlusionMap, ivec2( 2, 2 ) ).toVar();
			visibility.addAssign( textureLoad( occlusionMap, ivec2( 8, 2 ) ) );
			visibility.addAssign( textureLoad( occlusionMap, ivec2( 14, 2 ) ) );
			visibility.addAssign( textureLoad( occlusionMap, ivec2( 14, 8 ) ) );
			visibility.addAssign( textureLoad( occlusionMap, ivec2( 14, 14 ) ) );
			visibility.addAssign( textureLoad( occlusionMap, ivec2( 8, 14 ) ) );
			visibility.addAssign( textureLoad( occlusionMap, ivec2( 2, 14 ) ) );
			visibility.addAssign( textureLoad( occlusionMap, ivec2( 2, 8 ) ) );
			visibility.addAssign( textureLoad( occlusionMap, ivec2( 8, 8 ) ) );

			const vVisibility = varyingProperty( 'float', 'vVisibility' );

			vVisibility.assign( visibility.r.div( 9.0 ) );
			vVisibility.mulAssign( visibility.g.div( 9.0 ).oneMinus() );
			vVisibility.mulAssign( visibility.b.div( 9.0 ) );

			return vec4( ( pos.mul( scale ).add( screenPosition.xy ).xy ), screenPosition.z, 1.0 );

		} )();

		material2.colorNode = Fn( () => {

			const color = reference( 'color', 'color' );
			const map = reference( 'map', 'texture' );

			const vVisibility = varyingProperty( 'float', 'vVisibility' );

			const output = map.toVar();

			output.a.mulAssign( vVisibility );
			output.rgb.mulAssign( color );

			return output;

		} )();

		this._tempMap = tempMap;
		this._occlusionMap = occlusionMap;
		this._currentType = UnsignedByteType;
		this._sharedValues = sharedValues;
		this._material1a = material1a;
		this._material1b = material1b;
		this._material2 = material2;
		this._mesh1 = new Mesh( geometry, material1a ); // used for occlusionMap generation
		this._elements = [];
		this._elementMeshes = [];
		this._lightsNode = new Node(); // dummy node for renderer.renderObject()

	}

	/**
	 * Adds the given lensflare element to this instance.
	 *
	 * @param {LensflareElement} element - The element to add.
	 */
	addElement( element ) {

		this._elements.push( element );

	}

	onBeforeRender( renderer, scene, camera ) {

		const tempMap = this._tempMap;
		const occlusionMap = this._occlusionMap;
		const material1a = this._material1a;
		const material1b = this._material1b;
		const material2 = this._material2;
		const mesh1 = this._mesh1;
		const elements = this._elements;
		const elementMeshes = this._elementMeshes;
		const lightsNode = this._lightsNode;
		const geometry = LensflareMesh.Geometry;
		const positionScreen = this._sharedValues.positionScreen;

		renderer.getViewport( _viewport );

		_viewport.multiplyScalar( renderer.getPixelRatio() ).floor();

		const renderTarget = renderer.getRenderTarget();
		const type = ( renderTarget !== null ) ? renderTarget.texture.type : UnsignedByteType;

		if ( this._currentType !== type ) {

			tempMap.dispose();
			occlusionMap.dispose();

			tempMap.type = occlusionMap.type = type;

			this._currentType = type;

		}

		const invAspect = _viewport.w / _viewport.z;
		const halfViewportWidth = _viewport.z / 2.0;
		const halfViewportHeight = _viewport.w / 2.0;

		const size = 16 / _viewport.w;

		this._sharedValues.scale.set( size * invAspect, size );

		_validArea.min.set( _viewport.x, _viewport.y );
		_validArea.max.set( _viewport.x + ( _viewport.z - 16 ), _viewport.y + ( _viewport.w - 16 ) );

		// calculate position in screen space

		_positionView.setFromMatrixPosition( this.matrixWorld );
		_positionView.applyMatrix4( camera.matrixWorldInverse );

		if ( _positionView.z > 0 ) return; // lensflare is behind the camera

		positionScreen.copy( _positionView ).applyMatrix4( camera.projectionMatrix );

		// horizontal and vertical coordinate of the lower left corner of the pixels to copy

		_screenPositionPixels.x = _viewport.x + ( positionScreen.x * halfViewportWidth ) + halfViewportWidth - 8;
		_screenPositionPixels.y = _viewport.y - ( positionScreen.y * halfViewportHeight ) + halfViewportHeight - 8;

		// screen cull

		if ( _validArea.containsPoint( _screenPositionPixels ) ) {

			// save current RGB to temp texture

			renderer.copyFramebufferToTexture( tempMap, _screenPositionPixels );

			// render pink quad

			renderer.renderObject( mesh1, scene, camera, geometry, material1a, null, lightsNode );

			// copy result to occlusionMap

			renderer.copyFramebufferToTexture( occlusionMap, _screenPositionPixels );

			// restore graphics

			renderer.renderObject( mesh1, scene, camera, geometry, material1b, null, lightsNode );

			// render elements

			const vecX = - positionScreen.x * 2;
			const vecY = - positionScreen.y * 2;

			for ( let i = 0, l = elements.length; i < l; i ++ ) {

				const element = elements[ i ];

				let mesh2 = elementMeshes[ i ];

				if ( mesh2 === undefined ) {

					mesh2 = elementMeshes[ i ] = new Mesh( geometry, material2 );

					mesh2.color = element.color.convertSRGBToLinear();
					mesh2.map = element.texture;

				}

				material2.screenPosition.x = positionScreen.x + vecX * element.distance;
				material2.screenPosition.y = positionScreen.y - vecY * element.distance;
				material2.screenPosition.z = positionScreen.z;

				const size = element.size / _viewport.w;

				material2.scale.set( size * invAspect, size );

				renderer.renderObject( mesh2, scene, camera, geometry, material2, null, lightsNode );

			}

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		super.dispose();

		this._material1a.dispose();
		this._material1b.dispose();
		this._material2.dispose();

		this._tempMap.dispose();
		this._occlusionMap.dispose();

		for ( let i = 0, l = this._elements.length; i < l; i ++ ) {

			this._elements[ i ].texture.dispose();

		}

	}

}

//

class LensflareElement {

	constructor( texture, size = 1, distance = 0, color = new Color( 0xffffff ) ) {

		this.texture = texture;
		this.size = size;
		this.distance = distance;
		this.color = color;

	}

}

LensflareMesh.Geometry = ( function () {

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

export { LensflareMesh, LensflareElement };
