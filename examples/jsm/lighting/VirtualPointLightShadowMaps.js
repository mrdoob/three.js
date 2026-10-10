import { Color, DoubleSide, HalfFloatType, MeshBasicNodeMaterial, NearestFilter, NoBlending, PerspectiveCamera, RedFormat, RenderTarget, Vector3 } from 'three/webgpu';
import { Fn, If, dot, float, int, ivec2, max, normalWorld, positionWorld, texture, textureLoad, uniform, vec2, vec3, vec4 } from 'three/tsl';

/**
 * Cached radial-distance cube faces for each VPL, packed into one atlas.
 * Static geometry only: call `update()` after regenerating VPLs or changing the visibility bias.
 *
 * @three_import import { VirtualPointLightShadowMaps } from 'three/addons/lighting/VirtualPointLightShadowMaps.js';
 */
class VirtualPointLightShadowMaps {

	/**
	 * Constructs new VPL shadow maps.
	 *
	 * @param {number} capacity - Maximum number of VPLs.
	 * @param {number} [resolution=32] - Pixels per cube face.
	 * @param {number} [far=40] - Maximum shadow distance in world units.
	 */
	constructor( capacity, resolution = 32, far = 40 ) {

		this.resolution = uniform( resolution, 'int' );
		this.capacity = capacity;
		this.columns = Math.ceil( Math.sqrt( capacity * 6 ) );
		this.rows = 1;
		this.far = far;
		// the atlas is sized on the first update()
		this.target = new RenderTarget( 1, 1, {
			format: RedFormat, type: HalfFloatType, minFilter: NearestFilter, magFilter: NearestFilter, generateMipmaps: false
		} );
		this.origin = uniform( new Vector3() );
		this.material = new MeshBasicNodeMaterial();
		this.material.side = DoubleSide;
		this.material.blending = NoBlending;
		this.material.toneMapped = false;
		this.material.fragmentNode = vec4( positionWorld.sub( this.origin ).length().div( far ), 0, 0, 1 );
		this.cutoutMaterials = new Map();
		this.camera = new PerspectiveCamera( 90, 1, 0.001, far );
		this.directions = [ new Vector3( 1, 0, 0 ), new Vector3( - 1, 0, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, - 1, 0 ), new Vector3( 0, 0, 1 ), new Vector3( 0, 0, - 1 ) ];
		this.up = [ new Vector3( 0, 1, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ), new Vector3( 0, 0, - 1 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 1, 0 ) ];

	}

	/**
	 * Returns a node that evaluates to `true` if the segment between `start` and `end` is unoccluded.
	 *
	 * @param {Node<vec3>} start - The receiver position.
	 * @param {Node<vec3>} end - The VPL position.
	 * @param {Node<int>} index - The VPL index.
	 * @param {Node<vec3>} [receiverNormal=normalWorld] - The receiver normal.
	 * @return {Node<bool>} The visibility node.
	 */
	visibility( start, end, index, receiverNormal = normalWorld ) {

		return Fn( () => {

			const d = start.sub( end );
			const a = d.abs();
			const face = int( 0 ).toVar();
			const uv = vec2( 0 ).toVar();
			If( a.x.greaterThanEqual( max( a.y, a.z ) ), () => {

				If( d.x.greaterThan( 0 ), () => {

					uv.assign( vec2( d.z, d.y.negate() ).div( a.x ) );

				} ).Else( () => {

					face.assign( 1 );
					uv.assign( vec2( d.z.negate(), d.y.negate() ).div( a.x ) );

				} );

			} ).ElseIf( a.y.greaterThanEqual( a.z ), () => {

				If( d.y.greaterThan( 0 ), () => {

					face.assign( 2 );
					uv.assign( vec2( d.x, d.z.negate() ).div( a.y ) );

				} ).Else( () => {

					face.assign( 3 );
					uv.assign( vec2( d.x, d.z ).div( a.y ) );

				} );

			} ).Else( () => {

				If( d.z.greaterThan( 0 ), () => {

					face.assign( 4 );
					uv.assign( vec2( d.x.negate(), d.y.negate() ).div( a.z ) );

				} ).Else( () => {

					face.assign( 5 );
					uv.assign( vec2( d.x, d.y.negate() ).div( a.z ) );

				} );

			} );
			const tile = index.mul( 6 ).add( face );
			const pixel = ivec2( uv.mul( 0.5 ).add( 0.5 ).mul( this.resolution ) ).clamp( 0, this.resolution.sub( 1 ) );
			const offset = ivec2( tile.mod( this.columns ), tile.div( this.columns ) ).mul( this.resolution );
			const depth = textureLoad( this.target.texture, offset.add( pixel ) ).r.mul( this.far );
			// compare at the sampled texel's ray to avoid self-shadowing on sloped receivers
			const center = vec2( pixel ).add( 0.5 ).div( this.resolution ).mul( 2 ).sub( 1 );
			const ray = vec3( 0 ).toVar();
			If( face.equal( 0 ), () => {

				ray.assign( vec3( 1, center.y.negate(), center.x ) );

			} ).ElseIf( face.equal( 1 ), () => {

				ray.assign( vec3( - 1, center.y.negate(), center.x.negate() ) );

			} ).ElseIf( face.equal( 2 ), () => {

				ray.assign( vec3( center.x, 1, center.y.negate() ) );

			} ).ElseIf( face.equal( 3 ), () => {

				ray.assign( vec3( center.x, - 1, center.y ) );

			} ).ElseIf( face.equal( 4 ), () => {

				ray.assign( vec3( center.x.negate(), center.y.negate(), 1 ) );

			} ).Else( () => {

				ray.assign( vec3( center.x, center.y.negate(), - 1 ) );

			} );
			const denominator = dot( receiverNormal, ray.normalize() );
			const numerator = dot( receiverNormal, d );
			const receiverDepth = d.length().toVar();
			If( denominator.abs().greaterThan( 1e-4 ).and( numerator.mul( denominator ).greaterThan( 0 ) ), () => {

				receiverDepth.assign( numerator.div( denominator ) );

			} );
			return receiverDepth.sub( 0.02 ).lessThanEqual( depth );

		} )();

	}

	/**
	 * Returns the capture material for the given material, honoring alpha cutouts.
	 *
	 * @private
	 * @param {Material} source - The original material.
	 * @return {NodeMaterial} The capture material.
	 */
	getCaptureMaterial( source ) {

		if ( ! source.alphaTest ) return this.material;
		const key = [ source.map, source.alphaMap, source.alphaTest, source.opacity ];
		const cached = this.cutoutMaterials.get( source );
		if ( cached && key.every( ( value, i ) => value === cached.key[ i ] ) ) return cached.material;
		if ( cached ) cached.material.dispose();
		const material = this.material.clone();
		material.fragmentNode = Fn( () => {

			let alpha = float( source.opacity );
			if ( source.map ) alpha = alpha.mul( texture( source.map ).a );
			if ( source.alphaMap ) alpha = alpha.mul( texture( source.alphaMap ).g );
			alpha.lessThanEqual( source.alphaTest ).discard();
			return this.material.fragmentNode;

		} )();
		this.cutoutMaterials.set( source, { key, material } );
		return material;

	}

	/**
	 * Renders six cube faces per VPL into the atlas. `generator.count` must not exceed `capacity`.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The static scene.
	 * @param {VirtualPointLightGenerator} generator - The VPL samples.
	 * @param {number} bias - Offset of each capture origin along the VPL normal.
	 * @param {number} [resolution] - Pixels per cube face.
	 */
	update( renderer, scene, generator, bias, resolution = this.resolution.value ) {

		const tiles = Math.max( 1, generator.count * 6 );
		// fixed width keeps the tile division in the shader constant
		const columns = this.columns;
		this.rows = Math.ceil( tiles / columns );
		this.resolution.value = resolution;
		this.target.setSize( columns * resolution, this.rows * resolution );
		this.target.viewport.set( 0, 0, this.target.width, this.target.height );
		const saved = {
			target: renderer.getRenderTarget(), output: renderer.getOutputRenderTarget(),
			clearColor: renderer.getClearColor( new Color() ), clearAlpha: renderer.getClearAlpha(),
			autoClear: renderer.autoClear, shadows: renderer.shadowMap.enabled,
			override: scene.overrideMaterial, background: scene.background
		};
		const lookAt = new Vector3();
		const surfaces = [];
		scene.traverseVisible( object => {

			if ( object.isMesh ) surfaces.push( { object, material: object.material } );

		} );

		try {

			renderer.setOutputRenderTarget( null );
			renderer.setRenderTarget( this.target );
			renderer.setClearColor( 0xffffff, 1 );
			renderer.shadowMap.enabled = false;
			renderer.autoClear = false;
			scene.background = null;
			scene.overrideMaterial = null;
			for ( const { object, material } of surfaces ) {

				object.material = Array.isArray( material ) ? material.map( source => this.getCaptureMaterial( source ) ) : this.getCaptureMaterial( material );

			}

			this.target.scissorTest = false;
			renderer.clear();
			this.target.scissorTest = true;

			for ( let i = 0; i < generator.count; i ++ ) {

				this.origin.value.copy( generator.positions[ i ] ).addScaledVector( generator.normals[ i ], bias );
				this.camera.position.copy( this.origin.value );
				for ( let face = 0; face < 6; face ++ ) {

					const tile = i * 6 + face;
					this.target.viewport.set( tile % columns * resolution, Math.floor( tile / columns ) * resolution, resolution, resolution );
					this.target.scissor.copy( this.target.viewport );
					this.camera.up.copy( this.up[ face ] );
					this.camera.lookAt( lookAt.copy( this.camera.position ).add( this.directions[ face ] ) );
					renderer.render( scene, this.camera );

				}

			}

		} finally {

			for ( const { object, material } of surfaces ) object.material = material;
			scene.overrideMaterial = saved.override;
			scene.background = saved.background;
			renderer.autoClear = saved.autoClear;
			renderer.shadowMap.enabled = saved.shadows;
			renderer.setClearColor( saved.clearColor, saved.clearAlpha );
			renderer.setRenderTarget( saved.target );
			renderer.setOutputRenderTarget( saved.output );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance.
	 */
	dispose() {

		this.target.dispose();
		this.material.dispose();
		for ( const { material } of this.cutoutMaterials.values() ) material.dispose();
		this.cutoutMaterials.clear();

	}

}

export { VirtualPointLightShadowMaps };
