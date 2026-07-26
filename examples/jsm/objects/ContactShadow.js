import {
	Box3,
	Color,
	DoubleSide,
	Group,
	Mesh,
	MeshBasicMaterial,
	NearestFilter,
	OrthographicCamera,
	PlaneGeometry,
	ShaderMaterial,
	Vector3,
	WebGLRenderTarget
} from 'three';

const _casterBox = /*@__PURE__*/ new Box3();
const _receiverBox = /*@__PURE__*/ new Box3();
const _size = /*@__PURE__*/ new Vector3();
const _center = /*@__PURE__*/ new Vector3();

const _blurVertexShader = /* glsl */`
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

// Separable nine-tap Gaussian, run once per axis. Written out rather than looped over an
// array so the shader stays valid GLSL ES 1.00.
function blurFragmentShader( horizontal ) {

	const weights = [ 0.051, 0.0918, 0.12245, 0.1531, 0.1633, 0.1531, 0.12245, 0.0918, 0.051 ];
	let taps = '';

	for ( let i = 0; i < 9; i ++ ) {

		const step = i - 4;
		const offset = horizontal ? `vec2( ${step.toFixed( 1 )} * blurAmount, 0.0 )` : `vec2( 0.0, ${step.toFixed( 1 )} * blurAmount )`;
		taps += `\n\t\t\tsum += texture2D( tDiffuse, vUv + ${offset} ) * ${weights[ i ]};`;

	}

	return /* glsl */`
		uniform sampler2D tDiffuse;
		uniform float blurAmount;
		varying vec2 vUv;
		void main() {
			vec4 sum = vec4( 0.0 );${taps}
			gl_FragColor = sum;
		}`;

}

// Writes the receiver's world height, normalised into 0..1, so a downward render gives a
// height field. The depth test keeps the highest surface, which is exactly what is wanted.
const _heightFragmentShader = /* glsl */`
	uniform float minHeight;
	uniform float maxHeight;
	varying float vHeight;
	void main() {
		float h = clamp( ( vHeight - minHeight ) / max( maxHeight - minHeight, 1e-6 ), 0.0, 1.0 );
		gl_FragColor = vec4( h, h, h, 1.0 );
	}`;

// Multiplies the baked shadow by the receiver's own silhouette, and fades it where the
// surface is too steep to read as contact. The gradient uses only neighbours that are ON the
// surface — an off-surface neighbour reads as a cliff and would wrongly darken the rim of a
// perfectly flat top. A flat surface has gradient zero everywhere, so its fade is exactly 1.
const _maskFragmentShader = /* glsl */`
	uniform sampler2D tShadow;
	uniform sampler2D tMask;
	uniform sampler2D tHeight;
	uniform float heightSpan;
	uniform float cellSize;
	uniform float texelSize;
	uniform float slopeKeep;
	uniform float slopeCut;
	varying vec2 vUv;

	float onSurface( vec4 texel ) {
		return step( 0.9, texel.a );
	}

	void main() {
		vec4 shadow = texture2D( tShadow, vUv );

		// The silhouette and the height field are both captured by the downward camera, so
		// their V axis is flipped relative to the shadow bands.
		vec2 hUv = vec2( vUv.x, 1.0 - vUv.y );
		float mask = texture2D( tMask, hUv ).a;
		vec4 here = texture2D( tHeight, hUv );

		float fade = 1.0;

		if ( onSurface( here ) > 0.5 ) {

			vec4 xp = texture2D( tHeight, hUv + vec2( texelSize, 0.0 ) );
			vec4 xm = texture2D( tHeight, hUv - vec2( texelSize, 0.0 ) );
			vec4 zp = texture2D( tHeight, hUv + vec2( 0.0, texelSize ) );
			vec4 zm = texture2D( tHeight, hUv - vec2( 0.0, texelSize ) );

			float dx = 0.0;
			if ( onSurface( xp ) > 0.5 && onSurface( xm ) > 0.5 ) dx = ( xp.r - xm.r ) * heightSpan / ( 2.0 * cellSize );
			else if ( onSurface( xp ) > 0.5 ) dx = ( xp.r - here.r ) * heightSpan / cellSize;
			else if ( onSurface( xm ) > 0.5 ) dx = ( here.r - xm.r ) * heightSpan / cellSize;

			float dz = 0.0;
			if ( onSurface( zp ) > 0.5 && onSurface( zm ) > 0.5 ) dz = ( zp.r - zm.r ) * heightSpan / ( 2.0 * cellSize );
			else if ( onSurface( zp ) > 0.5 ) dz = ( zp.r - here.r ) * heightSpan / cellSize;
			else if ( onSurface( zm ) > 0.5 ) dz = ( here.r - zm.r ) * heightSpan / cellSize;

			float slope = sqrt( dx * dx + dz * dz );
			fade = clamp( 1.0 - ( slope - slopeKeep ) / max( slopeCut - slopeKeep, 1e-6 ), 0.0, 1.0 );

		}

		gl_FragColor = vec4( shadow.rgb, shadow.a * mask * fade );
	}`;

/**
 * A soft contact shadow built from stacked height bands.
 *
 * Unlike a shadow map, nothing is lit: the caster's silhouette is captured from below in
 * two or three horizontal slices, each blurred and faded by its own amount, and the slices
 * are stacked on the receiving surface. The lowest slice stays tight and dark right at the
 * contact point while the higher ones spread into a wide, faint halo — the ambient darkening
 * an object picks up where it meets a surface, which a single blurred plane cannot express.
 *
 * The shadow is baked, not drawn per frame, so it costs nothing while the scene runs. Call
 * {@link ContactShadow#update} again whenever the caster moves or changes shape.
 *
 * It composes with the rest of the lighting: it darkens by alpha only, so shadow maps and
 * ambient occlusion continue to work normally underneath it.
 *
 * By default the shadow lands on a flat plane at the base of the caster. Pass a `receiver`
 * and it instead lands on that object's upper surface — clipped to the surface's real
 * silhouette (a disc for a round table, not a square), draped over curves, slopes and steps
 * via a height field, and faded out where the surface turns too steep to read as contact.
 *
 * ```js
 * const shadow = new ContactShadow( product );
 * scene.add( shadow );
 * shadow.update( renderer, scene );
 *
 * // …or land it on a table instead of the floor:
 * const onTable = new ContactShadow( product, { receiver: table } );
 * scene.add( onTable );
 * onTable.update( renderer, scene );
 * ```
 *
 * @augments Group
 * @three_import import { ContactShadow } from 'three/addons/objects/ContactShadow.js';
 */
class ContactShadow extends Group {

	/**
	 * Constructs a new contact shadow.
	 *
	 * @param {Object3D} caster - The object that casts the shadow.
	 * @param {ContactShadow~Options} [options] - The configuration.
	 */
	constructor( caster, options = {} ) {

		super();

		if ( caster === undefined ) throw new Error( 'THREE.ContactShadow: a caster is required.' );

		/**
		 * The object that casts the shadow.
		 *
		 * @type {Object3D}
		 */
		this.caster = caster;

		/**
		 * The object whose upper surface receives the shadow. When `null` the shadow lands on
		 * a flat plane at the base of the caster.
		 *
		 * @type {?Object3D}
		 * @default null
		 */
		this.receiver = options.receiver || null;

		/**
		 * How many bands are stacked. `1` is a single soft blob, `3` gives the full
		 * tight-to-diffuse falloff.
		 *
		 * @type {number}
		 * @default 3
		 */
		this.levels = Math.min( 3, Math.max( 1, options.levels !== undefined ? options.levels : 3 ) );

		/**
		 * The heights, in world units above the receiving surface, where the first and second
		 * bands end. The last band always runs to the top of the caster.
		 *
		 * @type {Array<number>}
		 * @default [0.03,0.1]
		 */
		this.bands = options.bands ? options.bands.slice() : [ 0.03, 0.1 ];

		/**
		 * The opacity of each band, lowest first.
		 *
		 * @type {Array<number>}
		 * @default [0.45,0.28,0.14]
		 */
		this.opacity = options.opacity ? options.opacity.slice() : [ 0.45, 0.28, 0.14 ];

		/**
		 * The blur radius of each band, lowest first.
		 *
		 * @type {Array<number>}
		 * @default [1,2.8,5.5]
		 */
		this.blur = options.blur ? options.blur.slice() : [ 1, 2.8, 5.5 ];

		/**
		 * How far each band may grow past the caster's footprint, as a fraction. Ignored when a
		 * receiver is set, where the shadow is pinned to the surface instead.
		 *
		 * @type {Array<number>}
		 * @default [0,0.07,0.1]
		 */
		this.expand = options.expand ? options.expand.slice() : [ 0, 0.07, 0.1 ];

		/**
		 * Footprint margin. `1` hugs the caster's bounds, larger values leave room for the
		 * blur to fall off inside the plane.
		 *
		 * @type {number}
		 * @default 1.4
		 */
		this.spread = options.spread !== undefined ? options.spread : 1.4;

		/**
		 * The shadow colour.
		 *
		 * @type {Color}
		 * @default 0x000000
		 */
		this.color = new Color( options.color !== undefined ? options.color : 0x000000 );

		/**
		 * Where the drape stops reading as contact, in world units of rise per unit of run.
		 * The shadow is untouched below the first value and gone above the second, so a flat
		 * surface is never affected.
		 *
		 * @type {Array<number>}
		 * @default [0.9,2.2]
		 */
		this.slopeFade = options.slopeFade ? options.slopeFade.slice() : [ 0.9, 2.2 ];

		const resolution = options.resolution !== undefined ? options.resolution : 512;
		const heightResolution = options.heightResolution !== undefined ? options.heightResolution : 128;
		const drapeSegments = options.drapeSegments !== undefined ? options.drapeSegments : 64;

		this._resolution = resolution;
		this._heightResolution = heightResolution;
		this._drapeSegments = drapeSegments;
		this._width = 0;
		this._depth = 0;

		this._renderTargets = [];
		this._planes = [];

		for ( let i = 0; i < 3; i ++ ) {

			const renderTarget = new WebGLRenderTarget( resolution, resolution );
			renderTarget.texture.generateMipmaps = false;
			this._renderTargets.push( renderTarget );

			const geometry = this.receiver
				? new PlaneGeometry( 1, 1, drapeSegments, drapeSegments ).rotateX( Math.PI / 2 )
				: new PlaneGeometry( 1, 1 ).rotateX( Math.PI / 2 );

			const plane = new Mesh( geometry, new MeshBasicMaterial( {
				map: renderTarget.texture,
				color: this.color,
				opacity: this.opacity[ i ],
				transparent: true,
				depthWrite: false
			} ) );

			plane.renderOrder = 3 - i;		// the sharpest band is drawn last, so it sits on top
			plane.position.y = i * 0.0003;	// stagger to keep the bands out of each other's z
			plane.scale.set( 1, - 1, 1 );	// negative Y flips the captured texture upright

			this._planes.push( plane );
			this.add( plane );

		}

		this._scratch = new WebGLRenderTarget( resolution, resolution );
		this._scratch.texture.generateMipmaps = false;

		this._camera = new OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, 0, 1 );
		this._camera.rotation.x = Math.PI / 2;	// look straight up, through the caster
		this.add( this._camera );

		// Full-screen quad for the blur and mask passes. It is deliberately NOT part of the
		// scene graph and has its own camera: driving it from the footprint camera would scale
		// the image by the footprint on every pass.
		this._quad = new Mesh( new PlaneGeometry( 2, 2 ) );
		this._quadCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

		// DoubleSide matters: a band that cuts through the middle of a closed mesh only ever
		// sees its inner walls, which are back faces. Without this the middle bands come out
		// empty on anything hollow, and open meshes drop out entirely.
		this._silhouetteMaterial = new MeshBasicMaterial( { color: 0x000000, side: DoubleSide } );

		this._horizontalBlur = new ShaderMaterial( {
			depthTest: false,
			uniforms: { tDiffuse: { value: null }, blurAmount: { value: 0 } },
			vertexShader: _blurVertexShader,
			fragmentShader: blurFragmentShader( true )
		} );

		this._verticalBlur = new ShaderMaterial( {
			depthTest: false,
			uniforms: { tDiffuse: { value: null }, blurAmount: { value: 0 } },
			vertexShader: _blurVertexShader,
			fragmentShader: blurFragmentShader( false )
		} );

		// Receiver-only resources are created on demand, so a ground shadow allocates nothing extra.
		this._heightCamera = null;
		this._heightTarget = null;
		this._maskTarget = null;
		this._heightMaterial = null;
		this._maskMaterial = null;

	}

	/**
	 * Bakes the shadow. Call this once after construction, and again whenever the caster
	 * moves, is scaled, or changes shape.
	 *
	 * Only the caster is captured — everything else in the scene, including the surface the
	 * shadow lands on, is hidden for the duration of the bake and restored afterwards.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene the caster belongs to.
	 * @return {boolean} Whether anything was baked. `false` means there was nothing above the
	 * receiving surface, and the shadow hid itself.
	 */
	update( renderer, scene ) {

		this.caster.updateWorldMatrix( true, true );
		_casterBox.makeEmpty().expandByObject( this.caster );
		if ( _casterBox.isEmpty() ) return this._hide();

		let planeY, width, depth, centerX, centerZ;

		if ( this.receiver !== null ) {

			this.receiver.updateWorldMatrix( true, true );
			_receiverBox.makeEmpty().expandByObject( this.receiver );
			if ( _receiverBox.isEmpty() ) return this._hide();

			planeY = _receiverBox.max.y;

			// Nothing is standing on the surface, or it is standing beside it.
			if ( _casterBox.max.y <= planeY + 1e-4 ) return this._hide();
			if ( _casterBox.min.x > _receiverBox.max.x || _casterBox.max.x < _receiverBox.min.x ) return this._hide();
			if ( _casterBox.min.z > _receiverBox.max.z || _casterBox.max.z < _receiverBox.min.z ) return this._hide();

			// The shadow always spans the receiver's own top face, never the caster's footprint,
			// so it is physically unable to slide off the surface it belongs to.
			_receiverBox.getSize( _size );
			_receiverBox.getCenter( _center );
			width = Math.max( _size.x, 0.001 );
			depth = Math.max( _size.z, 0.001 );
			centerX = _center.x;
			centerZ = _center.z;

		} else {

			planeY = _casterBox.min.y;
			_casterBox.getSize( _size );
			_casterBox.getCenter( _center );
			width = Math.max( _size.x * this.spread, 0.001 );
			depth = Math.max( _size.z * this.spread, 0.001 );
			centerX = _center.x;
			centerZ = _center.z;

		}

		const height = Math.max( _casterBox.max.y - planeY, 0.001 );

		this._resize( width, depth );
		this.position.set( centerX, planeY + 0.0015, centerZ );
		this.updateMatrixWorld( true );

		this._camera.left = - width / 2;
		this._camera.right = width / 2;
		this._camera.top = depth / 2;
		this._camera.bottom = - depth / 2;

		const count = this.levels;
		const tops = [ Math.min( this.bands[ 0 ], height ), Math.min( Math.max( this.bands[ 1 ], this.bands[ 0 ] ), height ), height ];
		tops[ count - 1 ] = height;

		// Save every piece of renderer and scene state this touches.
		const previousTarget = renderer.getRenderTarget();
		const previousOverride = scene.overrideMaterial;
		const previousBackground = scene.background;
		const previousAlpha = renderer.getClearAlpha();
		const previousAutoClear = renderer.autoClear;
		const selfVisible = this.visible;

		this.visible = false;
		scene.background = null;
		renderer.setClearAlpha( 0 );
		renderer.autoClear = true;

		if ( this.receiver !== null ) this._bakeReceiver( renderer, scene, width, depth, planeY );

		// Only the caster casts. Anything else in the slice — most obviously the floor the
		// shadow lands on, which sits exactly at the plane — would otherwise bake straight
		// into the silhouette and fill the whole plane with a solid dark rectangle.
		const hidden = this._isolate( scene, this.caster );

		scene.overrideMaterial = this._silhouetteMaterial;

		for ( let i = 0; i < count; i ++ ) {

			const plane = this._planes[ i ];
			plane.material.opacity = Math.min( 1, this.opacity[ i ] );
			plane.material.color.copy( this.color );

			const grow = this.receiver !== null ? 1 : 1 + ( this.expand[ i ] || 0 );
			plane.scale.set( grow, - 1, grow );

			// The near plane starts just below the surface, so the face actually resting on it is
			// inside the slab. At exactly zero it sits on the plane and is clipped away, and a
			// flat-bottomed object casts nothing at all.
			this._camera.near = - 0.004;
			this._camera.far = Math.max( tops[ i ], 1e-3 );
			this._camera.updateProjectionMatrix();

			renderer.setRenderTarget( this._renderTargets[ i ] );
			renderer.clear();
			renderer.render( scene, this._camera );

			this._blur( renderer, this._renderTargets[ i ], this.blur[ i ] );
			this._blur( renderer, this._renderTargets[ i ], this.blur[ i ] * 0.4 );

			if ( this.receiver !== null ) this._applyMask( renderer, this._renderTargets[ i ], width );

		}

		scene.overrideMaterial = previousOverride;
		scene.background = previousBackground;
		this._restore( hidden );
		renderer.setRenderTarget( previousTarget );
		renderer.setClearAlpha( previousAlpha );
		renderer.autoClear = previousAutoClear;

		for ( let i = 0; i < 3; i ++ ) this._planes[ i ].visible = i < count;
		this.visible = selfVisible;

		return true;

	}

	/**
	 * Frees the GPU resources allocated by this object.
	 */
	dispose() {

		for ( const renderTarget of this._renderTargets ) renderTarget.dispose();
		this._scratch.dispose();

		for ( const plane of this._planes ) {

			plane.geometry.dispose();
			plane.material.dispose();

		}

		this._quad.geometry.dispose();
		this._silhouetteMaterial.dispose();
		this._horizontalBlur.dispose();
		this._verticalBlur.dispose();

		if ( this._heightTarget !== null ) this._heightTarget.dispose();
		if ( this._maskTarget !== null ) this._maskTarget.dispose();
		if ( this._heightMaterial !== null ) this._heightMaterial.dispose();
		if ( this._maskMaterial !== null ) this._maskMaterial.dispose();

	}

	// ---------------------------------------------------------------- internals

	_hide() {

		this.visible = false;
		return false;

	}

	_resize( width, depth ) {

		if ( Math.abs( width - this._width ) < 1e-4 && Math.abs( depth - this._depth ) < 1e-4 ) return;

		const segments = this.receiver !== null ? this._drapeSegments : 1;

		for ( const plane of this._planes ) {

			plane.geometry.dispose();
			plane.geometry = new PlaneGeometry( width, depth, segments, segments ).rotateX( Math.PI / 2 );

		}

		this._width = width;
		this._depth = depth;

	}

	_blur( renderer, renderTarget, amount ) {

		this._quad.material = this._horizontalBlur;
		this._horizontalBlur.uniforms.tDiffuse.value = renderTarget.texture;
		this._horizontalBlur.uniforms.blurAmount.value = amount / 256;
		renderer.setRenderTarget( this._scratch );
		renderer.render( this._quad, this._quadCamera );

		this._quad.material = this._verticalBlur;
		this._verticalBlur.uniforms.tDiffuse.value = this._scratch.texture;
		this._verticalBlur.uniforms.blurAmount.value = amount / 256;
		renderer.setRenderTarget( renderTarget );
		renderer.render( this._quad, this._quadCamera );

	}

	// The receiver's own silhouette and height field. Both are captured from the receiver
	// alone, so nothing standing on it can contaminate the surface it is standing on.
	_bakeReceiver( renderer, scene, width, depth, planeY ) {

		const resolution = this._heightResolution;

		if ( this._heightTarget === null ) {

			this._heightTarget = new WebGLRenderTarget( resolution, resolution, { minFilter: NearestFilter, magFilter: NearestFilter } );
			this._heightTarget.texture.generateMipmaps = false;
			this._maskTarget = new WebGLRenderTarget( this._resolution, this._resolution );
			this._maskTarget.texture.generateMipmaps = false;

			this._heightCamera = new OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, 0, 1 );
			this._heightCamera.rotation.x = - Math.PI / 2;	// look straight down, onto the surface
			this.add( this._heightCamera );

			this._heightMaterial = new ShaderMaterial( {
				uniforms: { minHeight: { value: 0 }, maxHeight: { value: 1 } },
				vertexShader: /* glsl */`
					varying float vHeight;
					void main() {
						vHeight = ( modelMatrix * vec4( position, 1.0 ) ).y;
						gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
					}`,
				fragmentShader: _heightFragmentShader
			} );

			this._maskMaterial = new ShaderMaterial( {
				depthTest: false,
				uniforms: {
					tShadow: { value: null }, tMask: { value: null }, tHeight: { value: null },
					heightSpan: { value: 1 }, cellSize: { value: 1 }, texelSize: { value: 1 / resolution },
					slopeKeep: { value: this.slopeFade[ 0 ] }, slopeCut: { value: this.slopeFade[ 1 ] }
				},
				vertexShader: _blurVertexShader,
				fragmentShader: _maskFragmentShader
			} );

		}

		const hidden = this._isolate( scene, this.receiver );

		// Both passes look straight DOWN over the receiver, so the silhouette and the height
		// field are captured in the same frame of reference and line up texel for texel.
		this._heightCamera.left = - width / 2;
		this._heightCamera.right = width / 2;
		this._heightCamera.top = depth / 2;
		this._heightCamera.bottom = - depth / 2;
		this._heightCamera.near = - 0.004;
		this._heightCamera.far = ( planeY - _receiverBox.min.y ) + 0.004;
		this._heightCamera.updateProjectionMatrix();

		const previousOverride = scene.overrideMaterial;

		// Silhouette: the surface's true footprint — a disc for a round table, not a square.
		scene.overrideMaterial = this._silhouetteMaterial;
		renderer.setRenderTarget( this._maskTarget );
		renderer.clear();
		renderer.render( scene, this._heightCamera );
		this._blur( renderer, this._maskTarget, 0.6 );	// soften a touch so the cut is not jagged

		// Height field. The depth test keeps the highest surface, which is what the shadow drapes onto.
		this._heightMaterial.uniforms.minHeight.value = _receiverBox.min.y;
		this._heightMaterial.uniforms.maxHeight.value = _receiverBox.max.y;
		scene.overrideMaterial = this._heightMaterial;

		renderer.setRenderTarget( this._heightTarget );
		renderer.clear();
		renderer.render( scene, this._heightCamera );
		scene.overrideMaterial = previousOverride;

		// Push every vertex of the shadow planes onto the real surface. Done once per bake on
		// the CPU, so nothing is paid per frame.
		const buffer = new Uint8Array( resolution * resolution * 4 );
		renderer.readRenderTargetPixels( this._heightTarget, 0, 0, resolution, resolution, buffer );
		for ( const plane of this._planes ) this._drape( plane, buffer, _receiverBox.min.y, _receiverBox.max.y, width, depth, planeY );

		this._heightSpan = _receiverBox.max.y - _receiverBox.min.y;

		this._restore( hidden );

	}

	// Hide every renderable in the scene except `keep` and its descendants, remembering what
	// was hidden so it can be put back exactly as it was.
	_isolate( scene, keep ) {

		const hidden = [];

		scene.traverse( ( object ) => {

			if ( object.visible === false ) return;
			if ( object.isMesh !== true && object.isPoints !== true && object.isLine !== true ) return;
			if ( keep !== null && ( object === keep || this._isDescendantOf( object, keep ) ) ) return;
			object.visible = false;
			hidden.push( object );

		} );

		return hidden;

	}

	_restore( hidden ) {

		for ( const object of hidden ) object.visible = true;

	}

	_isDescendantOf( object, ancestor ) {

		let node = object.parent;
		while ( node !== null ) {

			if ( node === ancestor ) return true;
			node = node.parent;

		}

		return false;

	}

	// The height map is rendered by a downward camera whose image runs +X right and -Z up,
	// while the plane's V runs +Z — hence the flipped V when sampling.
	_drape( plane, buffer, minY, maxY, width, depth, planeY ) {

		const position = plane.geometry.getAttribute( 'position' );
		if ( position === undefined ) return;

		const resolution = this._heightResolution;
		const span = maxY - minY;

		for ( let i = 0; i < position.count; i ++ ) {

			const u = position.getX( i ) / width + 0.5;
			const v = position.getZ( i ) / depth + 0.5;

			let px = Math.round( u * ( resolution - 1 ) );
			let py = Math.round( ( 1 - v ) * ( resolution - 1 ) );
			px = px < 0 ? 0 : ( px > resolution - 1 ? resolution - 1 : px );
			py = py < 0 ? 0 : ( py > resolution - 1 ? resolution - 1 : py );

			const offset = ( py * resolution + px ) * 4;

			// Off the surface: leave the vertex on the nominal plane. The mask makes it
			// transparent there anyway.
			const y = buffer[ offset + 3 ] > 229 ? minY + ( buffer[ offset ] / 255 ) * span : planeY;
			position.setY( i, y - planeY );

		}

		position.needsUpdate = true;
		plane.geometry.computeBoundingSphere();

	}

	_applyMask( renderer, renderTarget, width ) {

		const material = this._maskMaterial;
		material.uniforms.tShadow.value = renderTarget.texture;
		material.uniforms.tMask.value = this._maskTarget.texture;
		material.uniforms.tHeight.value = this._heightTarget.texture;
		material.uniforms.heightSpan.value = this._heightSpan || 0;
		material.uniforms.cellSize.value = Math.max( width, 1e-6 ) / Math.max( this._heightResolution - 1, 1 );
		material.uniforms.slopeKeep.value = this.slopeFade[ 0 ];
		material.uniforms.slopeCut.value = this.slopeFade[ 1 ];

		this._quad.material = material;
		renderer.setRenderTarget( this._scratch );
		renderer.render( this._quad, this._quadCamera );

		// Copy back with a zero-radius blur, which is just a full-screen blit.
		this._quad.material = this._horizontalBlur;
		this._horizontalBlur.uniforms.tDiffuse.value = this._scratch.texture;
		this._horizontalBlur.uniforms.blurAmount.value = 0;
		renderer.setRenderTarget( renderTarget );
		renderer.render( this._quad, this._quadCamera );

	}

}

/**
 * Configuration of `ContactShadow`.
 *
 * @typedef {Object} ContactShadow~Options
 * @property {Object3D} [receiver=null] - Land the shadow on this object's upper surface instead of a flat plane.
 * @property {number} [levels=3] - How many bands are stacked, 1 to 3.
 * @property {Array<number>} [bands=[0.03,0.1]] - Where the first and second bands end, in world units above the surface.
 * @property {Array<number>} [opacity=[0.45,0.28,0.14]] - The opacity of each band, lowest first.
 * @property {Array<number>} [blur=[1,2.8,5.5]] - The blur radius of each band, lowest first.
 * @property {Array<number>} [expand=[0,0.07,0.1]] - How far each band may grow past the footprint. Ignored with a receiver.
 * @property {number} [spread=1.4] - Footprint margin around the caster's bounds.
 * @property {number|Color} [color=0x000000] - The shadow colour.
 * @property {number} [resolution=512] - The resolution of each band's render target.
 * @property {number} [heightResolution=128] - The resolution of the receiver's height field.
 * @property {number} [drapeSegments=64] - The grid resolution of the draped shadow mesh.
 * @property {Array<number>} [slopeFade=[0.9,2.2]] - Where the drape starts and stops reading as contact.
 */

export { ContactShadow };
