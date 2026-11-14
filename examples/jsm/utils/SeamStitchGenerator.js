import { Box3, BufferGeometry, Float32BufferAttribute, HalfFloatType, Matrix3, NodeMaterial, OrthographicCamera, Points, QuadMesh, RendererUtils, RenderTarget, Scene, StorageBufferAttribute, Vector2, Vector3 } from 'three/webgpu';
import { Fn, If, Loop, float, instanceIndex, ivec2, positionGeometry, screenCoordinate, storage, texture, varying, vec3, vec4, vertexIndex } from 'three/tsl';

// the minimum cosine between the world-space normals of both sides of a seam, sharper edges are not stitched.
// Smooth surfaces with welded normals have the same normal on both sides, but the normals of a curved surface
// made of flat faces, or computed after its vertices were split at the seam, differ by the angle between the
// faces, e.g. 22.5° on a cylinder of 16 segments. Hard edges are sharper, e.g. 45° on an octagon or 90° on a
// box. 0.9 is about 26°

const NORMAL_THRESHOLD = 0.9;

// the number of constraints per texel of seam length

const SAMPLES_PER_TEXEL = 2;

// how strongly the covered texels and the texels outside the charts keep their values, relative to the seams

const COVERED_WEIGHT = 0.02;
const PADDING_WEIGHT = 0.002;

// the step size of the Jacobi iterations

const DAMPING = 0.8;

const _a = /*@__PURE__*/ new Vector3();
const _b = /*@__PURE__*/ new Vector3();
const _normalMatrix = /*@__PURE__*/ new Matrix3();
const _box = /*@__PURE__*/ new Box3();

let _rendererState;

/**
 * Stitches the seams of a baked map, e.g. of a light map or an ambient occlusion map. Where a smooth surface is
 * cut into two charts of the UV atlas, bilinear filtering on both sides of the cut reads different texels, so the
 * map shows a discontinuity. This finds the mesh edges whose two triangles meet in 3D, with similar normals, but
 * lie at different places of the atlas, and solves a least-squares problem for the texels around them: the bilinear
 * samples along both sides of each seam should be equal, while the texels change as little as possible, the
 * texels outside the charts more freely than the covered ones. The solver runs damped Jacobi iterations on the GPU
 * and keeps each texel within the values that its seams sample on both sides.
 *
 * The coverage of the map is read from its alpha: texels with an alpha above zero are covered, e.g. in a light
 * map of {@link LightMapper}. The stitched map has the covered and the stitched texels in alpha, 1, and 0
 * elsewhere, so {@link GutterFillGenerator} can fill the gutters around them.
 *
 * Finding the seams runs on the CPU, so {@link SeamStitchGenerator#setGeometry} is called once per atlas,
 * then the generator can stitch many maps of it. Like {@link PMREMGenerator}, the caller owns the results.
 *
 * ```js
 * const seamStitch = new SeamStitchGenerator( renderer );
 * seamStitch.setGeometry( scene );
 *
 * const gutterFill = new GutterFillGenerator( renderer );
 *
 * const stitched = seamStitch.generate( lightMapper.texture );
 * const filled = gutterFill.generate( stitched.texture );
 *
 * material.lightMap = filled.texture;
 * ```
 *
 * Instanced and skinned meshes are not supported. This class can only be used with {@link WebGPURenderer} and a
 * WebGPU backend.
 *
 * @three_import import { SeamStitchGenerator } from 'three/addons/utils/SeamStitchGenerator.js';
 */
class SeamStitchGenerator {

	/**
	 * Constructs a new seam stitch generator.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		/**
		 * The renderer.
		 *
		 * @type {WebGPURenderer}
		 */
		this.renderer = renderer;

		/**
		 * The UV channel of the atlas, like {@link Texture#channel}: 1 for `uv1`. The seams are found again
		 * when it changes.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.channel = 1;

		/**
		 * The number of Jacobi iterations.
		 *
		 * @type {number}
		 * @default 64
		 */
		this.iterations = 64;

		// the seam edges in the atlas, and the solver of a map size with the texels around them

		this._root = null;
		this._seams = null;
		this._seamChannel = - 1;
		this._solver = null;

		this._source = texture();
		this._camera = new OrthographicCamera();

	}

	/**
	 * Finds the seams of the meshes that share the atlas. Call it again when the meshes or their UVs change.
	 *
	 * @param {Object3D|Array<Mesh>} scene - The meshes, or an object whose meshes share the atlas.
	 */
	setGeometry( scene ) {

		this._disposeSolver();

		this._root = scene;
		this._seams = findSeams( collectMeshes( scene, this.channel ), NORMAL_THRESHOLD, this.channel );
		this._seamChannel = this.channel;

	}

	/**
	 * Stitches the seams of a map of the atlas.
	 *
	 * @param {Texture} source - The map, with an alpha above zero at its covered texels, e.g. a light map of {@link LightMapper}.
	 * @param {?RenderTarget} [renderTarget=null] - The render target of the stitched map, resized to the map. The map
	 * must not be its texture. By default, a new half float render target.
	 * @return {RenderTarget} The render target of the stitched map, with the UV channel of the atlas.
	 */
	generate( source, renderTarget = null ) {

		if ( this._root === null ) throw new Error( 'THREE.SeamStitchGenerator: Call setGeometry() before generate().' );

		if ( this._seamChannel !== this.channel ) this.setGeometry( this._root );

		const renderer = this.renderer;
		const { width, height } = source.image;

		this._setSize( width, height );

		if ( renderTarget === null ) renderTarget = new RenderTarget( width, height, { type: HalfFloatType, depthBuffer: false } );
		else if ( renderTarget.width !== width || renderTarget.height !== height ) renderTarget.setSize( width, height );

		renderTarget.texture.channel = this.channel;

		this._source.value = source;

		const solver = this._solver;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		// the iterations run in one compute pass, whose dispatches see the writes of the previous ones

		if ( solver.compute !== null ) {

			const { initialize, limit, residual, solve } = solver.compute;

			const passes = [ initialize, limit ];
			for ( let i = 0; i < this.iterations; i ++ ) passes.push( residual, solve );

			renderer.compute( passes );

		}

		// the map with its coverage in alpha, then the stitched texels on top

		renderer.setRenderTarget( renderTarget );
		solver.copy.render( renderer );

		if ( solver.compute !== null ) {

			renderer.autoClear = false;
			renderer.render( solver.scene, this._camera );

		}

		RendererUtils.restoreRendererState( renderer, _rendererState );

		return renderTarget;

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._disposeSolver();

	}

	/**
	 * Sets up the solver of a map size: the texels around the seams, the constraints between them, and the passes
	 * that solve them and write the stitched map.
	 *
	 * @private
	 * @param {number} width - The width of the map.
	 * @param {number} height - The height of the map.
	 */
	_setSize( width, height ) {

		if ( this._solver !== null && this._solver.width === width && this._solver.height === height ) return;

		this._disposeSolver();

		const system = createSystem( this._seams, width, height, SAMPLES_PER_TEXEL );

		const solver = {
			width,
			height,
			copy: new QuadMesh( createCopyMaterial( this._source ) ),
			scene: new Scene(),
			compute: null,
			buffers: []
		};

		this._solver = solver;

		const sampleCount = system.weights.length;
		const unknownCount = system.unknowns;

		if ( sampleCount === 0 ) return;

		// the unknown texels, the constraints of the samples that involve them, and the four
		// texels of both sides of each sample

		// the buffers are freed with the solver, not only once they are garbage collected

		const buffers = solver.buffers;
		const buffer = ( array, itemSize ) => buffers[ buffers.push( new StorageBufferAttribute( array, itemSize ) ) - 1 ];

		const texels = storage( buffer( system.texels, 1 ), 'uint' ).toReadOnly();
		const ranges = storage( buffer( system.ranges, 2 ), 'uvec2' ).toReadOnly();
		const entries = storage( buffer( system.entries, 1 ), 'uint' ).toReadOnly();
		const corners = storage( buffer( system.corners, 4 ), 'ivec4' ).toReadOnly();
		const fractions = storage( buffer( system.fractions, 4 ), 'vec4' ).toReadOnly();
		const weights = storage( buffer( system.weights, 1 ), 'float' ).toReadOnly();

		const valueBuffer = buffer( new Float32Array( unknownCount * 4 ), 4 );
		const values = storage( valueBuffer, 'vec4' );
		const initial = storage( buffer( new Float32Array( unknownCount * 4 ), 4 ), 'vec4' );
		const residuals = storage( buffer( new Float32Array( sampleCount * 4 ), 4 ), 'vec4' );
		const bounds = storage( buffer( new Float32Array( unknownCount * 8 ), 4 ), 'vec4' );

		const source = this._source;

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

		// reads the texels of the map, covered texels keep their value more strongly

		const initialize = Fn( () => {

			const texel = texels.element( instanceIndex );
			const value = source.load( ivec2( texel.mod( width ), texel.div( width ) ) ).toVar();
			const weight = value.a.greaterThan( 0 ).select( float( COVERED_WEIGHT ), float( PADDING_WEIGHT ) );

			initial.element( instanceIndex ).assign( vec4( value.rgb, weight ) );
			values.element( instanceIndex ).assign( vec4( value.rgb, weight ) );

		} )().compute( unknownCount ).setName( 'SeamStitch.initialize' );

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

		} )().compute( unknownCount ).setName( 'SeamStitch.limit' );

		// the weighted difference of the bilinear samples on both sides, and the weight

		const residual = Fn( () => {

			const difference = bilinear( values, instanceIndex, 0 ).sub( bilinear( values, instanceIndex, 1 ) );
			const weight = weights.element( instanceIndex );

			residuals.element( instanceIndex ).assign( vec4( difference.mul( weight ), weight ) );

		} )().compute( sampleCount ).setName( 'SeamStitch.residual' );

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

			const result = value.rgb.sub( gradient.mul( DAMPING ).div( diagonal ) ).clamp( bounds.element( instanceIndex.mul( 2 ) ).rgb, bounds.element( instanceIndex.mul( 2 ).add( 1 ) ).rgb );

			values.element( instanceIndex ).assign( vec4( result, value.w ) );

		} )().compute( unknownCount ).setName( 'SeamStitch.solve' );

		solver.compute = { initialize, limit, residual, solve };

		// writes the stitched texels over the map, one point per texel, with an alpha of 1

		const positions = new Float32Array( unknownCount * 3 );

		for ( let i = 0; i < unknownCount; i ++ ) {

			const texel = system.texels[ i ];
			positions[ i * 3 ] = ( ( texel % width ) + 0.5 ) / width * 2 - 1;
			positions[ i * 3 + 1 ] = 1 - ( Math.floor( texel / width ) + 0.5 ) / height * 2;

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

		const material = new NodeMaterial();
		material.depthTest = false;
		material.depthWrite = false;
		material.vertexNode = vec4( positionGeometry.xy, 0, 1 );
		material.fragmentNode = vec4( varying( storage( valueBuffer, 'vec4' ).toReadOnly().element( vertexIndex ).rgb ), 1 );

		const points = new Points( geometry, material );
		points.frustumCulled = false;
		solver.scene.add( points );

	}

	/**
	 * Frees the solver.
	 *
	 * @private
	 */
	_disposeSolver() {

		const solver = this._solver;

		if ( solver === null ) return;

		solver.copy.material.dispose();

		for ( const object of solver.scene.children ) {

			object.geometry.dispose();
			object.material.dispose();

		}

		if ( solver.compute !== null ) {

			for ( const node of Object.values( solver.compute ) ) node.dispose();

		}

		for ( const buffer of solver.buffers ) buffer.dispose();

		this._solver = null;

	}

}

/**
 * Creates the material that copies the map with its coverage in alpha, 1 or 0.
 *
 * @private
 * @param {TextureNode} source - The map.
 * @return {NodeMaterial} The material.
 */
function createCopyMaterial( source ) {

	const copy = Fn( () => {

		const value = source.load( ivec2( screenCoordinate.xy ) ).toVar();

		return vec4( value.rgb, value.a.greaterThan( 0 ).select( float( 1 ), float( 0 ) ) );

	} );

	const material = new NodeMaterial();
	material.fragmentNode = copy();
	material.name = 'SeamStitch.copy';

	return material;

}

/**
 * Returns the name of the UV attribute of a channel.
 *
 * @private
 * @param {number} channel - The UV channel.
 * @return {string} The attribute name.
 */
function uvName( channel ) {

	return channel > 0 ? 'uv' + channel : 'uv';

}

/**
 * Returns the meshes of a root with the UVs of a channel, without instanced and skinned meshes.
 *
 * @private
 * @param {Object3D|Array<Mesh>} root - The meshes, or an object whose meshes are collected.
 * @param {number} channel - The UV channel.
 * @return {Array<Mesh>} The meshes.
 */
function collectMeshes( root, channel ) {

	const meshes = [];
	const add = ( object ) => {

		if ( object.isMesh === true && object.isInstancedMesh !== true && object.isSkinnedMesh !== true && object.geometry.getAttribute( uvName( channel ) ) !== undefined ) meshes.push( object );

	};

	if ( Array.isArray( root ) ) root.forEach( add );
	else root.traverse( add );

	return meshes;

}

/**
 * Finds the seam edges of meshes: edges that two triangles share in world space, with normals
 * within the threshold at both ends, whose ends lie at different UVs of the atlas on the two sides.
 *
 * @private
 * @param {Array<Mesh>} objects - The meshes.
 * @param {number} normalThreshold - The minimum cosine between the normals of the two sides.
 * @param {number} channel - The UV channel of the atlas.
 * @return {Float32Array} The UVs of both sides of each seam edge, `[ ax, ay, bx, by, cx, cy, dx, dy ]`
 * per edge, where `a, b` and `c, d` are the same two points of the mesh.
 */
function findSeams( objects, normalThreshold, channel ) {

	const parts = [];

	for ( const object of objects ) {

		object.updateWorldMatrix( true, false );
		parts.push( { geometry: object.geometry, matrix: object.matrixWorld, uv: object.geometry.getAttribute( uvName( channel ) ) } );

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

			// triangles without area in the atlas, e.g. the degenerate ones of unwrapUVs(), are left out

			uvA.fromBufferAttribute( uv, vertices[ 0 ] );
			uvB.fromBufferAttribute( uv, vertices[ 1 ] ).sub( uvA );
			uvC.fromBufferAttribute( uv, vertices[ 2 ] ).sub( uvA );

			if ( Math.abs( uvB.cross( uvC ) ) < 1e-12 ) continue;

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
 * Samples the seams and sets up the sparse least-squares system of the texels involved.
 *
 * @private
 * @param {Float32Array} seams - The seam edges.
 * @param {number} width - The width of the map in texels.
 * @param {number} height - The height of the map in texels.
 * @param {number} samplesPerTexel - The number of samples per texel of seam length.
 * @return {Object} The system.
 */
function createSystem( seams, width, height, samplesPerTexel ) {

	const samples = [];

	for ( let i = 0; i < seams.length; i += 8 ) {

		const [ ax, ay, bx, by, cx, cy, dx, dy ] = seams.subarray( i, i + 8 );
		const length = Math.max( Math.hypot( ( bx - ax ) * width, ( by - ay ) * height ), Math.hypot( ( dx - cx ) * width, ( dy - cy ) * height ) );
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

			const x = samples[ s * 5 + side * 2 ] * width - 0.5;
			const y = samples[ s * 5 + side * 2 + 1 ] * height - 0.5;
			const x0 = Math.floor( x ), y0 = Math.floor( y );

			fractions[ s * 4 + side * 2 ] = x - x0;
			fractions[ s * 4 + side * 2 + 1 ] = y - y0;

			for ( let k = 0; k < 4; k ++ ) {

				const tx = x0 + ( k & 1 ), ty = y0 + ( k >> 1 );
				let unknown = - 1;

				if ( tx >= 0 && ty >= 0 && tx < width && ty < height ) {

					const texel = ty * width + tx;
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

export { SeamStitchGenerator };
