import { Box3, BufferGeometry, Float32BufferAttribute, HalfFloatType, Matrix3, Matrix4, NodeMaterial, OrthographicCamera, Points, QuadMesh, RendererUtils, RenderTarget, Scene, StorageBufferAttribute, Vector2, Vector3 } from 'three/webgpu';
import { Fn, If, Loop, float, instanceIndex, ivec2, positionGeometry, screenCoordinate, storage, texture, varying, vec3, vec4, vertexIndex } from 'three/tsl';

const _a = /*@__PURE__*/ new Vector3();
const _b = /*@__PURE__*/ new Vector3();
const _normalMatrix = /*@__PURE__*/ new Matrix3();
const _matrix = /*@__PURE__*/ new Matrix4();
const _box = /*@__PURE__*/ new Box3();

let _rendererState;

/**
 * Stitches the seams of a light map. Where a smooth surface is cut into two charts of the atlas,
 * bilinear filtering on both sides of the cut reads different texels, so the lighting shows a
 * discontinuity. This finds the mesh edges whose two triangles meet in 3D, with similar normals,
 * but lie at different places of the light map, and solves a least-squares problem for the texels
 * around them: the bilinear samples along both sides of each seam should be equal, while the texels
 * change as little as possible, the padding texels outside the charts more freely than the covered
 * texels. The solver runs damped Jacobi iterations on the GPU and keeps each texel within the values
 * that its seams sample on both sides. The padding of the charts is filled again afterwards, like
 * {@link LightMapper} does. Finding the seams takes a moment on the CPU, so reuse the stitcher, or its
 * seams, while the atlas stays the same.
 *
 * ```js
 * const seams = new LightMapSeams( renderer, lightMapper );
 *
 * seams.update( lightMapper.texture );
 * material.lightMap = seams.texture;
 * ```
 *
 * The light maps of multi-page atlases are stitched per page, with one stitcher per page. The instances
 * of instanced meshes are stitched in their atlas regions, see {@link lightMapUV}.
 *
 * This class can only be used with {@link WebGPURenderer}.
 *
 * @three_import import { LightMapSeams } from 'three/addons/lighting/LightMapSeams.js';
 */
class LightMapSeams {

	/**
	 * Constructs a new seam stitcher and finds the seams of the meshes of the light mapper.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {LightMapper} lightMapper - The light mapper whose atlas is stitched. Add its meshes first.
	 * @param {Object} [options] - The stitching options.
	 * @param {number} [options.iterations=64] - The number of Jacobi iterations.
	 * @param {number} [options.normalThreshold=0.9] - The minimum cosine between the normals of both sides of a seam, sharper edges are not stitched.
	 * @param {number} [options.samplesPerTexel=2] - The number of constraints per texel of seam length.
	 * @param {number} [options.coveredWeight=0.02] - How strongly the texels with samples keep their values, relative to the seam constraints.
	 * @param {number} [options.paddingWeight=0.002] - How strongly the padding texels keep their values.
	 * @param {number} [options.page=0] - The page of the light mapper to stitch, see {@link LightMapper#pages}.
	 * @param {?Object} [options.seams=null] - The {@link LightMapSeams#seams} of a stitcher of the same meshes, atlas page and
	 * options, e.g. of a bake with another irradiance source, otherwise the seams are found.
	 */
	constructor( renderer, lightMapper, { iterations = 64, normalThreshold = 0.9, samplesPerTexel = 2, coveredWeight = 0.02, paddingWeight = 0.002, page = 0, seams = null } = {} ) {

		/**
		 * The renderer.
		 *
		 * @type {WebGPURenderer}
		 */
		this.renderer = renderer;

		/**
		 * The light mapper whose atlas is stitched.
		 *
		 * @type {LightMapper}
		 */
		this.lightMapper = lightMapper;

		/**
		 * The page of the light mapper to stitch.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.page = page;

		/**
		 * The number of Jacobi iterations.
		 *
		 * @type {number}
		 * @default 64
		 */
		this.iterations = iterations;

		const size = lightMapper.size;

		/**
		 * The seams of the page and the texels around them, which another stitcher of the same atlas can reuse.
		 *
		 * @type {Object}
		 * @readonly
		 */
		this.seams = seams ?? createSystem( findSeams( lightMapper.pages[ page ].objects, size, normalThreshold ), size, samplesPerTexel );

		const system = this.seams;

		this._renderTarget = new RenderTarget( size, size, { type: HalfFloatType, depthBuffer: false } );
		this._renderTarget.texture.channel = 1;

		/**
		 * The stitched light map, with the conventions of {@link LightMapper#texture}.
		 *
		 * @type {Texture}
		 */
		this.texture = this._renderTarget.texture;

		// the stitched texels, alpha is 0 elsewhere

		this._stitched = new RenderTarget( size, size, { type: HalfFloatType, depthBuffer: false } );

		this._map = texture( lightMapper.pages[ page ].texture );

		const sampleCount = system.weights.length;
		const unknownCount = system.unknowns;

		this._resolveQuad = new QuadMesh( this._createResolveMaterial() );
		this._scene = new Scene();
		this._camera = new OrthographicCamera();
		this._compute = null;
		this._buffers = [];

		if ( sampleCount === 0 ) return;

		// the unknown texels, the constraints of the samples that involve them, and the four
		// texels of both sides of each sample

		// the buffers are freed with the stitcher, not only once they are garbage collected

		const buffers = this._buffers;
		const buffer = ( array, itemSize ) => buffers[ buffers.push( new StorageBufferAttribute( array, itemSize ) ) - 1 ];

		const texels = storage( buffer( system.texels, 1 ), 'uint', unknownCount ).toReadOnly();
		const ranges = storage( buffer( system.ranges, 2 ), 'uvec2', unknownCount ).toReadOnly();
		const entries = storage( buffer( system.entries, 1 ), 'uint', system.entries.length ).toReadOnly();
		const corners = storage( buffer( system.corners, 4 ), 'ivec4', sampleCount * 2 ).toReadOnly();
		const fractions = storage( buffer( system.fractions, 4 ), 'vec4', sampleCount ).toReadOnly();
		const weights = storage( buffer( system.weights, 1 ), 'float', sampleCount ).toReadOnly();

		const valueBuffer = buffer( new Float32Array( unknownCount * 4 ), 4 );
		const values = storage( valueBuffer, 'vec4', unknownCount );
		const initial = storage( buffer( new Float32Array( unknownCount * 4 ), 4 ), 'vec4', unknownCount );
		const residuals = storage( buffer( new Float32Array( sampleCount * 4 ), 4 ), 'vec4', sampleCount );
		const bounds = storage( buffer( new Float32Array( unknownCount * 8 ), 4 ), 'vec4', unknownCount * 2 );

		const map = this._map;
		const coverage = texture( lightMapper.pages[ page ].sampleTexture );
		const damping = 0.8;

		// the bilinear weight of corner k of a sample, negative for the second side

		const coefficient = ( sample, k ) => {

			const fraction = fractions.element( sample );
			const side = k.greaterThanEqual( 4 );
			const f = side.select( fraction.zw, fraction.xy );
			const x = k.bitAnd( 1 ).equal( 1 ).select( f.x, f.x.oneMinus() );
			const y = k.bitAnd( 2 ).equal( 2 ).select( f.y, f.y.oneMinus() );

			return side.select( x.mul( y ).negate(), x.mul( y ) );

		};

		// the bilinear sample of one side of a seam sample

		const bilinear = ( buffer, sample, side ) => {

			const fraction = fractions.element( sample );
			const indices = corners.element( sample.mul( 2 ).add( side ) );
			const f = side === 0 ? fraction.xy : fraction.zw;
			const sum = vec3( 0 ).toVar();

			for ( let k = 0; k < 4; k ++ ) {

				const index = indices[ 'xyzw'[ k ] ];
				const weight = ( k & 1 ? f.x : f.x.oneMinus() ).mul( k & 2 ? f.y : f.y.oneMinus() );

				If( index.greaterThanEqual( 0 ), () => {

					sum.addAssign( buffer.element( index ).rgb.mul( weight ) );

				} );

			}

			return sum;

		};

		// reads the texels of the light map, covered texels keep their value more strongly

		const initialize = Fn( () => {

			const texel = texels.element( instanceIndex );
			const coord = ivec2( texel.mod( size ), texel.div( size ) );
			const weight = coverage.load( coord ).a.greaterThan( 0 ).select( float( coveredWeight ), float( paddingWeight ) );
			const value = vec4( map.load( coord ).rgb, weight );

			initial.element( instanceIndex ).assign( value );
			values.element( instanceIndex ).assign( value );

		} )().compute( unknownCount );

		// each texel stays within the values that its seams sample on both sides, so that conflicting
		// seams, e.g. where several charts meet, do not push it to extremes

		const limit = Fn( () => {

			const range = ranges.element( instanceIndex );
			const low = vec3( 1e30 ).toVar();
			const high = vec3( 0 ).toVar();

			Loop( { start: range.x, end: range.x.add( range.y ), type: 'uint', condition: '<' }, ( { i } ) => {

				const sample = entries.element( i ).shiftRight( 3 );
				const a = bilinear( initial, sample, 0 );
				const b = bilinear( initial, sample, 1 );

				low.assign( low.min( a.min( b ) ) );
				high.assign( high.max( a.max( b ) ) );

			} );

			bounds.element( instanceIndex.mul( 2 ) ).assign( vec4( low, 0 ) );
			bounds.element( instanceIndex.mul( 2 ).add( 1 ) ).assign( vec4( high, 0 ) );

		} )().compute( unknownCount );

		// the weighted difference of the bilinear samples on both sides, and the weight

		const residual = Fn( () => {

			const difference = bilinear( values, instanceIndex, 0 ).sub( bilinear( values, instanceIndex, 1 ) );
			const weight = weights.element( instanceIndex );

			residuals.element( instanceIndex ).assign( vec4( difference.mul( weight ), weight ) );

		} )().compute( sampleCount );

		// a damped Jacobi step on the normal equations of the texel

		const solve = Fn( () => {

			const range = ranges.element( instanceIndex );
			const value = values.element( instanceIndex ).toVar();
			const start = initial.element( instanceIndex );
			const gradient = value.rgb.sub( start.rgb ).mul( start.w ).toVar();
			const diagonal = start.w.toVar();

			Loop( { start: range.x, end: range.x.add( range.y ), type: 'uint', condition: '<' }, ( { i } ) => {

				const entry = entries.element( i );
				const sample = entry.shiftRight( 3 );
				const c = coefficient( sample, entry.bitAnd( 7 ) );

				const residual = residuals.element( sample );

				gradient.addAssign( residual.rgb.mul( c ) );
				diagonal.addAssign( c.abs().mul( residual.w ).mul( 2 ) );

			} );

			const result = value.rgb.sub( gradient.mul( damping ).div( diagonal ) ).clamp( bounds.element( instanceIndex.mul( 2 ) ).rgb, bounds.element( instanceIndex.mul( 2 ).add( 1 ) ).rgb );

			values.element( instanceIndex ).assign( vec4( result, value.w ) );

		} )().compute( unknownCount );

		this._compute = { initialize, limit, residual, solve };

		// writes the solution into the stitched target, one point per texel

		const positions = new Float32Array( unknownCount * 3 );

		for ( let i = 0; i < unknownCount; i ++ ) {

			const texel = system.texels[ i ];
			positions[ i * 3 ] = ( ( texel % size ) + 0.5 ) / size * 2 - 1;
			positions[ i * 3 + 1 ] = 1 - ( Math.floor( texel / size ) + 0.5 ) / size * 2;

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

		const material = new NodeMaterial();
		material.depthTest = false;
		material.depthWrite = false;
		material.vertexNode = vec4( positionGeometry.xy, 0, 1 );
		material.fragmentNode = vec4( varying( storage( valueBuffer, 'vec4', unknownCount ).toReadOnly().element( vertexIndex ).rgb ), 1 );

		const points = new Points( geometry, material );
		points.frustumCulled = false;
		this._scene.add( points );

	}

	/**
	 * Stitches the seams of a light map of the light mapper's atlas into {@link LightMapSeams#texture}.
	 *
	 * @param {Texture} [map] - The light map to stitch, e.g. a denoised one, by default the one of the page.
	 */
	update( map = this.lightMapper.pages[ this.page ].texture ) {

		const renderer = this.renderer;

		this._map.value = map;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.setClearColor( 0x000000, 0 );
		renderer.setRenderTarget( this._stitched );

		if ( this._compute !== null ) {

			const { initialize, limit, residual, solve } = this._compute;

			// the iterations run in one compute pass, whose dispatches see the writes of the previous ones

			const passes = [ initialize, limit ];
			for ( let i = 0; i < this.iterations; i ++ ) passes.push( residual, solve );

			renderer.compute( passes );

			renderer.render( this._scene, this._camera );

		} else {

			renderer.clear();

		}

		renderer.setRenderTarget( this._renderTarget );
		this._resolveQuad.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._renderTarget.dispose();
		this._stitched.dispose();
		this._resolveQuad.material.dispose();

		for ( const object of this._scene.children ) {

			object.geometry.dispose();
			object.material.dispose();

		}

		if ( this._compute !== null ) {

			for ( const node of Object.values( this._compute ) ) node.dispose();

		}

		for ( const buffer of this._buffers ) buffer.dispose();

	}

	/**
	 * Creates the material that combines the stitched texels with the light map and fills the
	 * padding again from the texels with samples, like {@link LightMapper} does.
	 *
	 * @private
	 * @return {NodeMaterial} The material.
	 */
	_createResolveMaterial() {

		const size = this.lightMapper.size;
		const map = this._map;
		const stitched = texture( this._stitched.texture );
		const coverage = texture( this.lightMapper.pages[ this.page ].sampleTexture );
		const maxCoord = ivec2( size - 1 );

		const value = ( coord ) => {

			const texel = stitched.load( coord );
			return texel.a.greaterThan( 0 ).select( texel.rgb, map.load( coord ).rgb );

		};

		const resolve = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const result = vec4( value( coord ), 1 ).toVar();

			If( stitched.load( coord ).a.equal( 0 ).and( coverage.load( coord ).a.equal( 0 ) ), () => {

				const sum = vec4( 0 ).toVar();

				for ( let y = - 2; y <= 2; y ++ ) {

					for ( let x = - 2; x <= 2; x ++ ) {

						const q = coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), maxCoord );

						If( coverage.load( q ).a.greaterThan( 0 ), () => {

							sum.addAssign( vec4( value( q ), 1 ) );

						} );

					}

				}

				If( sum.a.greaterThan( 0 ), () => {

					result.assign( vec4( sum.rgb.div( sum.a ), 1 ) );

				} );

			} );

			return result;

		} );

		const material = new NodeMaterial();
		material.fragmentNode = resolve();

		return material;

	}

}

/**
 * Finds the seam edges of meshes: edges that two triangles share in world space, with normals
 * within the threshold at both ends, whose ends lie at different light map UVs on the two sides.
 *
 * @private
 * @param {Array<Mesh>} objects - The meshes, with `uv1`.
 * @param {number} size - The light map size in texels.
 * @param {number} normalThreshold - The minimum cosine between the normals of the two sides.
 * @return {Float32Array} The UVs of both sides of each seam edge, `[ ax, ay, bx, by, cx, cy, dx, dy ]`
 * per edge, where `a, b` and `c, d` are the same two points of the mesh.
 */
function findSeams( objects, size, normalThreshold ) {

	// the instances of instanced meshes are separate parts with their transforms and atlas regions

	const parts = [];

	for ( const object of objects ) {

		object.updateWorldMatrix( true, false );

		const geometry = object.geometry;
		const instances = object.isInstancedMesh === true ? object.count : 1;

		for ( let i = 0; i < instances; i ++ ) {

			const matrix = object.isInstancedMesh === true ? new Matrix4().multiplyMatrices( object.matrixWorld, object.getMatrixAt( i, _matrix ) ) : object.matrixWorld;

			parts.push( { geometry, matrix, uv: instanceUVs( geometry, object.isInstancedMesh === true ? i : - 1 ) } );

		}

	}

	// world positions are welded with a tolerance relative to the size of the scene

	const bounds = new Box3();

	for ( const { geometry, matrix } of parts ) {

		if ( geometry.boundingBox === null ) geometry.computeBoundingBox();
		bounds.union( _box.copy( geometry.boundingBox ).applyMatrix4( matrix ) );

	}

	const tolerance = Math.max( ...bounds.getSize( _a ).toArray(), 1e-6 ) * 1e-6;
	const welds = new Map();
	const meshes = [];

	for ( const { geometry, matrix, uv } of parts ) {

		const position = geometry.getAttribute( 'position' );
		const normal = geometry.getAttribute( 'normal' );
		const weld = new Int32Array( position.count );
		const normals = new Float32Array( position.count * 3 );

		_normalMatrix.getNormalMatrix( matrix );

		for ( let i = 0; i < position.count; i ++ ) {

			_a.fromBufferAttribute( position, i ).applyMatrix4( matrix );

			const key = `${ Math.round( _a.x / tolerance ) },${ Math.round( _a.y / tolerance ) },${ Math.round( _a.z / tolerance ) }`;
			let id = welds.get( key );

			if ( id === undefined ) welds.set( key, id = welds.size );
			weld[ i ] = id;

			if ( normal !== undefined ) _b.fromBufferAttribute( normal, i ).applyMatrix3( _normalMatrix ).normalize().toArray( normals, i * 3 );

		}

		meshes.push( { geometry, uv, weld, normals: normal !== undefined ? normals : null } );

	}

	// the half edges of each welded edge, as mesh, start and end vertex

	const weldCount = welds.size;
	const edges = new Map();
	const uvA = new Vector2(), uvB = new Vector2(), uvC = new Vector2();

	for ( let m = 0; m < meshes.length; m ++ ) {

		const { geometry, uv, weld } = meshes[ m ];
		const index = geometry.getIndex();
		const count = index !== null ? index.count : geometry.getAttribute( 'position' ).count;

		for ( let i = 0; i + 2 < count; i += 3 ) {

			const vertices = [ i, i + 1, i + 2 ].map( ( j ) => index !== null ? index.getX( j ) : j );

			// triangles without light map area, e.g. the degenerate ones of unwrapUVs(), are left out

			uvA.fromBufferAttribute( uv, vertices[ 0 ] );
			uvB.fromBufferAttribute( uv, vertices[ 1 ] ).sub( uvA );
			uvC.fromBufferAttribute( uv, vertices[ 2 ] ).sub( uvA );

			if ( Math.abs( uvB.cross( uvC ) ) * size * size < 1e-6 ) continue;

			for ( let j = 0; j < 3; j ++ ) {

				const a = vertices[ j ], b = vertices[ ( j + 1 ) % 3 ];
				const wa = weld[ a ], wb = weld[ b ];

				if ( wa === wb ) continue;

				const key = Math.min( wa, wb ) * weldCount + Math.max( wa, wb );
				const list = edges.get( key );

				if ( list === undefined ) edges.set( key, [ m, a, b ] );
				else list.push( m, a, b );

			}

		}

	}

	// manifold edges whose sides have different UVs and similar normals

	const seams = [];
	const normalA = new Vector3(), normalB = new Vector3();

	for ( const list of edges.values() ) {

		if ( list.length !== 6 ) continue;

		const [ m0, a0, b0, m1 ] = list;
		const mesh0 = meshes[ m0 ], mesh1 = meshes[ m1 ];
		const [ a1, b1 ] = mesh1.weld[ list[ 4 ] ] === mesh0.weld[ a0 ] ? [ list[ 4 ], list[ 5 ] ] : [ list[ 5 ], list[ 4 ] ];

		const uv0 = mesh0.uv, uv1 = mesh1.uv;

		if ( uv0.getX( a0 ) === uv1.getX( a1 ) && uv0.getY( a0 ) === uv1.getY( a1 ) && uv0.getX( b0 ) === uv1.getX( b1 ) && uv0.getY( b0 ) === uv1.getY( b1 ) ) continue;

		if ( mesh0.normals !== null && mesh1.normals !== null ) {

			if ( normalA.fromArray( mesh0.normals, a0 * 3 ).dot( normalB.fromArray( mesh1.normals, a1 * 3 ) ) < normalThreshold ) continue;
			if ( normalA.fromArray( mesh0.normals, b0 * 3 ).dot( normalB.fromArray( mesh1.normals, b1 * 3 ) ) < normalThreshold ) continue;

		}

		seams.push( uv0.getX( a0 ), uv0.getY( a0 ), uv0.getX( b0 ), uv0.getY( b0 ), uv1.getX( a1 ), uv1.getY( a1 ), uv1.getX( b1 ), uv1.getY( b1 ) );

	}

	return new Float32Array( seams );

}

/**
 * Returns the light map UVs of a geometry, mapped into the atlas region of an instance by its instanced
 * attributes, like {@link lightMapUV}.
 *
 * @private
 * @param {BufferGeometry} geometry - The geometry, with `uv1`.
 * @param {number} instance - The instance, or -1 for meshes that are not instanced.
 * @return {BufferAttribute} The light map UVs.
 */
function instanceUVs( geometry, instance ) {

	const uv = geometry.getAttribute( 'uv1' );
	const scale = geometry.getAttribute( 'instanceLightMapScale' );
	const offset = geometry.getAttribute( 'instanceLightMapOffset' );

	if ( instance < 0 || ( scale === undefined && offset === undefined ) ) return uv;

	const sx = scale !== undefined ? scale.getX( instance ) : 1, sy = scale !== undefined ? scale.getY( instance ) : 1;
	const ox = offset !== undefined ? offset.getX( instance ) : 0, oy = offset !== undefined ? offset.getY( instance ) : 0;
	const values = new Float32Array( uv.count * 2 );

	for ( let i = 0; i < uv.count; i ++ ) {

		values[ i * 2 ] = uv.getX( i ) * sx + ox;
		values[ i * 2 + 1 ] = uv.getY( i ) * sy + oy;

	}

	return new Float32BufferAttribute( values, 2 );

}

/**
 * Samples the seams and sets up the sparse least-squares system of the texels involved.
 *
 * @private
 * @param {Float32Array} seams - The seam edges.
 * @param {number} size - The light map size in texels.
 * @param {number} samplesPerTexel - The number of samples per texel of seam length.
 * @return {Object} The system.
 */
function createSystem( seams, size, samplesPerTexel ) {

	const samples = [];

	for ( let i = 0; i < seams.length; i += 8 ) {

		const [ ax, ay, bx, by, cx, cy, dx, dy ] = seams.subarray( i, i + 8 );
		const length = Math.max( Math.hypot( bx - ax, by - ay ), Math.hypot( dx - cx, dy - cy ) ) * size;
		const count = Math.max( 1, Math.ceil( length * samplesPerTexel ) );

		for ( let j = 0; j < count; j ++ ) {

			const t = ( j + 0.5 ) / count;
			samples.push( ax + ( bx - ax ) * t, ay + ( by - ay ) * t, cx + ( dx - cx ) * t, cy + ( dy - cy ) * t, length / count );

		}

	}

	const sampleCount = samples.length / 5;
	const unknownOf = new Map();
	const texels = [];
	const corners = new Int32Array( sampleCount * 8 );
	const fractions = new Float32Array( sampleCount * 4 );
	const weights = new Float32Array( sampleCount );

	for ( let s = 0; s < sampleCount; s ++ ) {

		weights[ s ] = samples[ s * 5 + 4 ];

		for ( let side = 0; side < 2; side ++ ) {

			const x = samples[ s * 5 + side * 2 ] * size - 0.5;
			const y = samples[ s * 5 + side * 2 + 1 ] * size - 0.5;
			const x0 = Math.floor( x ), y0 = Math.floor( y );

			fractions[ s * 4 + side * 2 ] = x - x0;
			fractions[ s * 4 + side * 2 + 1 ] = y - y0;

			for ( let k = 0; k < 4; k ++ ) {

				const tx = x0 + ( k & 1 ), ty = y0 + ( k >> 1 );
				let unknown = - 1;

				if ( tx >= 0 && ty >= 0 && tx < size && ty < size ) {

					const texel = ty * size + tx;
					unknown = unknownOf.get( texel );

					if ( unknown === undefined ) {

						unknownOf.set( texel, unknown = texels.length );
						texels.push( texel );

					}

				}

				corners[ s * 8 + side * 4 + k ] = unknown;

			}

		}

	}

	// the constraints of each unknown texel, as sample * 8 + corner

	const unknowns = texels.length;
	const ranges = new Uint32Array( unknowns * 2 );

	for ( const unknown of corners ) if ( unknown >= 0 ) ranges[ unknown * 2 + 1 ] ++;

	for ( let i = 1; i < unknowns; i ++ ) ranges[ i * 2 ] = ranges[ i * 2 - 2 ] + ranges[ i * 2 - 1 ];

	const entries = new Uint32Array( corners.length );
	const filled = new Uint32Array( unknowns );

	for ( let i = 0; i < corners.length; i ++ ) {

		const unknown = corners[ i ];
		if ( unknown < 0 ) continue;
		entries[ ranges[ unknown * 2 ] + filled[ unknown ] ++ ] = i;

	}

	return {
		unknowns,
		texels: new Uint32Array( texels ),
		ranges,
		entries: entries.subarray( 0, ranges[ unknowns * 2 - 2 ] + ranges[ unknowns * 2 - 1 ] ),
		corners,
		fractions,
		weights
	};

}

export { LightMapSeams };
