import { BufferAttribute, BufferGeometry, DataUtils, HalfFloatType } from 'three/webgpu';
import { Fn, attribute, vec3 } from 'three/tsl';

// refine() does not split triangles with shorter edges in light map texels, the light map does not resolve finer detail

const MIN_SPLIT_TEXELS = 2;

// the share of the remaining error that each refinement round splits, and the default rounds per refine() call

const BULK = 0.5;
const MAX_ROUNDS = 16;

// welding grids, relative to the extent of a geometry for positions

const POSITION_PRECISION = 1e-6;
const NORMAL_PRECISION = 1e-4;

// conjugate gradients

const SOLVER_TOLERANCE = 1e-4;
const SOLVER_ITERATIONS = 1000;

// what the light map rasterization does with the texels of each triangle

const ACCUMULATE = 0;
const MEASURE = 1;
const ESTIMATE = 2;

let _halfFloats = null;

/**
 * Fits per-vertex irradiance to a baked light map, following [Least Squares Vertex Baking]{@link https://doi.org/10.1111/j.1467-8659.2011.01984.x}
 * (Kavan et al., 2011). Every light map texel whose center lies inside a triangle of the `uv1` atlas
 * adds a row with the barycentric weights of the three vertices to a least squares problem, weighted by
 * the world-space area of the texel. Thin triangles are also sampled along their longest edge, and
 * triangles smaller than a texel at their centroid. Texels without any irradiance are left out, they
 * are usually hidden under other meshes. A small Laplacian smoothness term regularizes vertices with few
 * or no texels. The normal equations are solved with conjugate gradients, for all color channels at once.
 *
 * Vertices with the same position and normal are welded into one unknown, so the irradiance is
 * continuous across the seams of the light map atlas and of other UVs. Vertex lighting has no seams and
 * needs no texture, but it needs dense meshes: `refine()` splits the triangles where a linear function
 * fits the light map worst by longest-edge bisection, crack-free, and interpolates all their attributes.
 * Seconds suffice for a scene with a few hundred thousand triangles and a 2048² light map, all on the
 * CPU and on the main thread.
 *
 * ```js
 * const baker = new VertexLightBaker( meshes );
 * await baker.readLightMap( renderer, lightMapper.texture );
 *
 * baker.fit();
 * while ( baker.refine( 500000, { noise: await lightMapper.estimateNoise() } ) > 0 ) baker.fit();
 *
 * meshes.forEach( ( mesh, i ) => mesh.geometry = baker.geometries[ i ] );
 *
 * // lit materials, in place of the light map
 * scenePass.contextNode = builtinGIContext( float( 1 ), vertexIrradiance() );
 * ```
 *
 * The irradiance is linear and in lux, like the light map, so it is not divided by pi. The meshes and
 * their world transforms must be the ones the light map was baked with, morph targets are not supported.
 *
 * @three_import import { VertexLightBaker, vertexIrradiance } from 'three/addons/lighting/VertexLightBaker.js';
 */
class VertexLightBaker {

	/**
	 * Constructs a new vertex light baker.
	 *
	 * @param {Array<Mesh>} meshes - The meshes, their geometries must provide `uv1`.
	 * @param {Object} [options] - The options.
	 * @param {string} [options.attribute='bakedIrradiance'] - The name of the irradiance attribute that `fit()` writes.
	 * @param {number} [options.smoothness=0.1] - The weight of the Laplacian smoothness term per mesh edge, relative to the weight of a texel.
	 * @param {boolean} [options.ignoreUnlit=true] - Whether to leave out texels without any irradiance.
	 */
	constructor( meshes, options = {} ) {

		/**
		 * The meshes.
		 *
		 * @type {Array<Mesh>}
		 * @readonly
		 */
		this.meshes = meshes;

		/**
		 * The geometries that receive the irradiance, one per mesh. They start as shallow copies of the
		 * mesh geometries that share their attributes, `refine()` replaces them.
		 *
		 * @type {Array<BufferGeometry>}
		 */
		this.geometries = meshes.map( ( mesh ) => copyGeometry( mesh.geometry ) );

		/**
		 * The name of the irradiance attribute that `fit()` writes.
		 *
		 * @type {string}
		 * @default 'bakedIrradiance'
		 */
		this.attribute = options.attribute ?? 'bakedIrradiance';

		/**
		 * The weight of the Laplacian smoothness term per mesh edge, relative to the weight of a texel.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.smoothness = options.smoothness ?? 0.1;

		/**
		 * Whether to leave out texels without any irradiance. They are usually hidden inside or under
		 * other meshes, e.g. where an object rests on the floor, and would darken the visible parts of
		 * the triangles around them. The smoothness term extends the irradiance of the lit texels
		 * to their vertices instead.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.ignoreUnlit = options.ignoreUnlit ?? true;

		/**
		 * The light map read back by `readLightMap()` or set by `setLightMap()`, linear RGB per texel, with
		 * its pages on top of each other.
		 *
		 * @type {?{data: Float32Array, width: number, height: number, pages: number}}
		 * @default null
		 */
		this.lightMap = null;

	}

	/**
	 * Reads a light map back from the GPU, e.g. `LightMapper.texture`, as float data. The pages of a
	 * multi-page light map, e.g. the textures of `LightMapper.pages`, are read on top of each other, each
	 * mesh samples the page of its `userData.lightMapPage`.
	 *
	 * @async
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Texture|Array<Texture>} texture - The light map, the texture of a render target, or its pages.
	 * @param {boolean} [accumulate=false] - Whether to add the light map to the current one, e.g. to add a bake of the direct light.
	 * @return {Promise} A promise that resolves when the light map has been read.
	 */
	async readLightMap( renderer, texture, accumulate = false ) {

		if ( Array.isArray( texture ) ) {

			const pages = await Promise.all( texture.map( ( page ) => renderer.readRenderTargetPixelsAsync( page.renderTarget, 0, 0, page.image.width, page.image.height ) ) );
			const data = new pages[ 0 ].constructor( pages[ 0 ].length * pages.length );

			pages.forEach( ( page, i ) => data.set( page, i * page.length ) );

			return this._setLightMapData( data, texture[ 0 ].type, texture[ 0 ].image.width, texture[ 0 ].image.height * pages.length, accumulate, pages.length );

		}

		const { width, height } = texture.image;
		const data = await renderer.readRenderTargetPixelsAsync( texture.renderTarget, 0, 0, width, height );

		this._setLightMapData( data, texture.type, width, height, accumulate, 1 );

	}

	/**
	 * Sets the light map from read back half float or float data.
	 *
	 * @private
	 * @param {Uint16Array|Float32Array} data - The RGBA samples.
	 * @param {number} type - The type of the samples.
	 * @param {number} width - The width of the light map in texels.
	 * @param {number} height - The height of the light map in texels, of all pages.
	 * @param {boolean} accumulate - Whether to add the data to the current light map.
	 * @param {number} pages - The number of pages on top of each other.
	 */
	_setLightMapData( data, type, width, height, accumulate, pages ) {

		if ( type === HalfFloatType ) {

			if ( _halfFloats === null ) {

				_halfFloats = new Float32Array( 65536 );
				for ( let i = 0; i < 65536; i ++ ) _halfFloats[ i ] = DataUtils.fromHalfFloat( i );

			}

			const floats = new Float32Array( data.length );
			for ( let i = 0; i < data.length; i ++ ) floats[ i ] = _halfFloats[ data[ i ] ];

			this.setLightMap( floats, width, height, accumulate, pages );

		} else {

			this.setLightMap( data, width, height, accumulate, pages );

		}

	}

	/**
	 * Sets the light map from CPU data. Row `0` holds the texels at `uv1.y = 0`, like the
	 * render targets of {@link LightMapper}.
	 *
	 * @param {Float32Array} data - Linear irradiance with three or four channels per texel.
	 * @param {number} width - The width of the light map in texels.
	 * @param {number} height - The height of the light map in texels, of all pages.
	 * @param {boolean} [accumulate=false] - Whether to add the data to the current light map.
	 * @param {number} [pages=1] - The number of pages on top of each other, the first page first.
	 */
	setLightMap( data, width, height, accumulate = false, pages = 1 ) {

		const count = width * height;
		const stride = data.length / count;

		if ( accumulate === false || this.lightMap === null ) {

			this.lightMap = { data: new Float32Array( count * 3 ), width, height, pages };

		} else if ( this.lightMap.width !== width || this.lightMap.height !== height ) {

			throw new Error( 'VertexLightBaker: The accumulated light maps must have the same size.' );

		}

		const rgb = this.lightMap.data;

		for ( let i = 0; i < count; i ++ ) {

			rgb[ i * 3 ] += data[ i * stride ];
			rgb[ i * 3 + 1 ] += data[ i * stride + 1 ];
			rgb[ i * 3 + 2 ] += data[ i * stride + 2 ];

		}

	}

	/**
	 * Fits the vertex irradiance to the light map and writes it into the irradiance attribute of
	 * the geometries, as Float32 RGB in lux, clamped to zero. An existing irradiance attribute, e.g.
	 * interpolated by `refine()`, is the initial guess of the solver.
	 *
	 * The error is the RMS of the difference to the light map relative to the RMS of the light map,
	 * over the texel centers inside the triangles and weighted by their area. The relative error
	 * measures each texel relative to its own luminance instead, or to a tenth of the RMS luminance
	 * for darker texels, so dark regions count as much as bright ones. Both include the noise of the
	 * light map.
	 *
	 * @return {{error: number, relativeError: number, vertices: number, unknowns: number, triangles: number, iterations: number, time: number}}
	 * The fit error, the number of vertices, welded vertices and triangles, the conjugate gradient iterations and the time in milliseconds.
	 */
	fit() {

		if ( this.lightMap === null ) throw new Error( 'VertexLightBaker: Read or set a light map first.' );

		const start = performance.now();
		const system = this._collect( true );
		const { unknowns } = system;

		// the sparse matrix of the normal equations has an entry per edge between welded vertices

		const edges = findEdges( system.ids, unknowns, true );
		const diagonal = new Float64Array( unknowns );
		const offDiagonal = new Float64Array( edges.count );
		const rhs = new Float64Array( unknowns * 3 );

		const { weight } = this._rasterize( system, ACCUMULATE, { triangleEdges: edges.triangleEdges, diagonal, offDiagonal, rhs } );

		// Laplacian smoothness, and a tiny ridge for vertices without any texel or neighbor

		const smoothness = this.smoothness;

		for ( let e = 0; e < edges.count; e ++ ) {

			diagonal[ edges.a[ e ] ] += smoothness;
			diagonal[ edges.b[ e ] ] += smoothness;
			offDiagonal[ e ] -= smoothness;

		}

		const ridge = 1e-6 * Math.max( weight / Math.max( unknowns, 1 ), 1e-12 );

		for ( let i = 0; i < unknowns; i ++ ) diagonal[ i ] += ridge;

		const values = new Float64Array( edges.cols.length );
		for ( let k = 0; k < values.length; k ++ ) values[ k ] = offDiagonal[ edges.slotEdges[ k ] ];

		// the initial guess is the current irradiance, averaged over welded vertices

		const x = new Float64Array( unknowns * 3 );
		const counts = new Float64Array( unknowns );

		for ( const part of system.parts ) {

			const irradiance = part.geometry.getAttribute( this.attribute );
			if ( irradiance === undefined ) continue;

			for ( let v = 0; v < part.count; v ++ ) {

				const id = part.unknownOffset + part.ids[ v ];
				x[ id * 3 ] += irradiance.getX( v );
				x[ id * 3 + 1 ] += irradiance.getY( v );
				x[ id * 3 + 2 ] += irradiance.getZ( v );
				counts[ id ] ++;

			}

		}

		for ( let i = 0; i < unknowns; i ++ ) {

			for ( let c = 0; c < 3; c ++ ) x[ i * 3 + c ] = counts[ i ] > 0 ? x[ i * 3 + c ] / counts[ i ] : rhs[ i * 3 + c ] / diagonal[ i ];

		}

		const iterations = solve( edges.rowPointers, edges.cols, values, diagonal, rhs, x, SOLVER_TOLERANCE, SOLVER_ITERATIONS );

		// negative irradiance from ringing at sharp transitions is clamped

		for ( let i = 0; i < x.length; i ++ ) x[ i ] = Math.max( x[ i ], 0 );

		let vertices = 0;

		for ( const part of system.parts ) {

			const array = new Float32Array( part.count * 3 );

			for ( let v = 0; v < part.count; v ++ ) {

				const id = part.unknownOffset + part.ids[ v ];
				array[ v * 3 ] = x[ id * 3 ];
				array[ v * 3 + 1 ] = x[ id * 3 + 1 ];
				array[ v * 3 + 2 ] = x[ id * 3 + 2 ];

			}

			part.geometry.setAttribute( this.attribute, new BufferAttribute( array, 3 ) );
			vertices += part.count;

		}

		const errors = this._rasterize( system, MEASURE, { x, floor: this._luminanceFloor() } );

		return {
			error: Math.sqrt( errors.difference / Math.max( errors.power, 1e-30 ) ),
			relativeError: Math.sqrt( errors.relative / Math.max( errors.weight, 1e-30 ) ),
			vertices, unknowns, triangles: system.triangles, iterations,
			time: performance.now() - start
		};

	}

	/**
	 * Subdivides the geometries where the vertices cannot fit the light map and replaces them, call
	 * `fit()` afterwards. The error of a triangle is estimated by fitting a linear function to its texels
	 * alone, relative to their luminance and less the expected noise of the light map. In rounds, the
	 * triangles with the largest errors that hold half of the error are split by longest-edge bisection:
	 * every split edge is split in all triangles that share its end positions, and a triangle with a
	 * split edge also splits its longest edge, so the meshes stay crack-free and the triangles keep
	 * their shape. All attributes are interpolated linearly, the normals and tangents are normalized,
	 * and the new triangles stay on the light map since `uv1` is interpolated too. Triangles with edges
	 * shorter than two light map texels are not split. Sharp shadows need many vertices, so set a budget.
	 *
	 * @param {number} maxVertices - The vertex budget of all geometries. At most the current vertex count is added per call.
	 * @param {Object} [options] - The options.
	 * @param {number} [options.tolerance=0.02] - The relative RMS error up to which a triangle is not split.
	 * @param {number} [options.noise=0] - The relative RMS noise of the light map, e.g. estimated by {@link LightMapper#estimateNoise}.
	 * @param {number} [options.rounds=16] - The maximum number of splitting rounds, e.g. `1` to fit after every round.
	 * @return {number} The number of added vertices, `0` when nothing was split.
	 */
	refine( maxVertices, options = {} ) {

		if ( this.lightMap === null ) throw new Error( 'VertexLightBaker: Read or set a light map first.' );

		const tolerance = options.tolerance ?? 0.02;
		const noise = options.noise ?? 0;
		const rounds = options.rounds ?? MAX_ROUNDS;
		const floor = this._luminanceFloor();

		const count = () => this.geometries.reduce( ( sum, geometry ) => sum + geometry.getAttribute( 'position' ).count, 0 );
		const start = count();
		const allowance = Math.min( maxVertices - start, start );

		let added = 0, previous = null;

		for ( let round = 0; round < rounds && added < allowance; round ++ ) {

			const system = this._collect( false );
			const { triangles, parts } = system;
			const edges = findEdges( system.ids, system.unknowns, false );
			const { triangleEdges } = edges;

			// the errors of the triangles that were not split in the previous round are kept

			const estimates = this._rasterize( system, ESTIMATE, { floor, noise, previous } );
			const { errors, weights } = estimates;

			// the triangles around each edge

			const edgeTriangles = new Int32Array( triangles * 3 );
			const edgePointers = new Int32Array( edges.count + 1 );

			for ( let k = 0; k < triangles * 3; k ++ ) if ( triangleEdges[ k ] >= 0 ) edgePointers[ triangleEdges[ k ] + 1 ] ++;
			for ( let e = 0; e < edges.count; e ++ ) edgePointers[ e + 1 ] += edgePointers[ e ];

			const fill = edgePointers.slice( 0, edges.count );
			for ( let k = 0; k < triangles * 3; k ++ ) if ( triangleEdges[ k ] >= 0 ) edgeTriangles[ fill[ triangleEdges[ k ] ] ++ ] = k / 3 | 0;

			// the longest edge of each triangle in world space, ties are broken by the edge index so that
			// all triangles agree

			const longest = new Int8Array( triangles ).fill( - 1 );
			const world = system.world;

			for ( let t = 0; t < triangles; t ++ ) {

				let best = - 1, bestLength = - 1;

				for ( let j = 0; j < 3; j ++ ) {

					const e = triangleEdges[ t * 3 + j ];
					if ( e < 0 ) continue;

					const a = t * 9 + j * 3, b = t * 9 + ( ( j + 1 ) % 3 ) * 3;
					const length = ( world[ a ] - world[ b ] ) ** 2 + ( world[ a + 1 ] - world[ b + 1 ] ) ** 2 + ( world[ a + 2 ] - world[ b + 2 ] ) ** 2;

					if ( length > bestLength || ( length === bestLength && e > triangleEdges[ t * 3 + best ] ) ) {

						best = j;
						bestLength = length;

					}

				}

				longest[ t ] = best;

			}

			// the candidates above the tolerance in the order of their errors

			const order = new Uint32Array( triangles );
			const limit = tolerance * tolerance;
			let candidates = 0, total = 0;

			for ( let t = 0; t < triangles; t ++ ) {

				if ( errors[ t ] > limit * weights[ t ] && system.lengths[ t ] >= MIN_SPLIT_TEXELS && longest[ t ] >= 0 ) {

					order[ candidates ++ ] = t;
					total += errors[ t ];

				}

			}

			if ( candidates === 0 ) break;

			const sorted = order.subarray( 0, candidates ).sort( ( a, b ) => errors[ b ] - errors[ a ] );

			// marks the longest edge of the worst triangles, and the longest edges of all triangles that
			// share a marked edge, until they hold the bulk of the error or the allowance is used up

			const marked = new Uint8Array( edges.count );
			const stack = [];
			let sum = 0, marks = 0;

			for ( let i = 0; i < candidates && sum < BULK * total && added + marks < allowance; i ++ ) {

				const t = sorted[ i ];
				const first = triangleEdges[ t * 3 + longest[ t ] ];

				sum += errors[ t ];

				if ( marked[ first ] === 1 ) continue;

				marked[ first ] = 1;
				marks ++;
				stack.push( first );

				while ( stack.length > 0 ) {

					const e = stack.pop();

					for ( let k = edgePointers[ e ]; k < edgePointers[ e + 1 ]; k ++ ) {

						const neighbor = edgeTriangles[ k ];
						const edge = triangleEdges[ neighbor * 3 + longest[ neighbor ] ];

						if ( marked[ edge ] === 0 ) {

							marked[ edge ] = 1;
							marks ++;
							stack.push( edge );

						}

					}

				}

			}

			// split, and remember which triangles were kept

			const sources = [];

			for ( let i = 0; i < parts.length; i ++ ) {

				const split = splitGeometry( parts[ i ], triangleEdges, longest, marked );

				this.geometries[ i ] = split.geometry;
				for ( const source of split.sources ) sources.push( source < 0 ? - 1 : parts[ i ].triangleOffset + source );

			}

			previous = { errors, weights, sources };
			added = count() - start;

		}

		return added;

	}

	/**
	 * Writes exposure-applied colors for unlit materials, `irradiance * exposure / PI`, into a vertex
	 * attribute, e.g. `color` for `COLOR_0` in glTF. A {@link MeshBasicMaterial} with `vertexColors`
	 * and the base color of the lit material then shows the diffuse lighting in any viewer. The colors
	 * are linear and not clamped, viewers may clamp values above one.
	 *
	 * @param {number} [exposure=1] - The exposure, e.g. `renderer.toneMappingExposure`.
	 * @param {string} [name='color'] - The name of the color attribute.
	 */
	computeColors( exposure = 1, name = 'color' ) {

		for ( const geometry of this.geometries ) {

			const irradiance = geometry.getAttribute( this.attribute );
			if ( irradiance === undefined ) continue;

			const array = new Float32Array( irradiance.count * 3 );
			for ( let i = 0; i < array.length; i ++ ) array[ i ] = irradiance.array[ i ] * exposure / Math.PI;

			geometry.setAttribute( name, new BufferAttribute( array, 3 ) );

		}

	}

	/**
	 * Returns the luminance below which errors are measured relative to the luminance floor instead,
	 * the square of a tenth of the RMS luminance of the covered light map texels.
	 *
	 * @private
	 * @return {number} The squared luminance floor.
	 */
	_luminanceFloor() {

		const data = this.lightMap.data;
		let power = 0, count = 0;

		for ( let i = 0; i < data.length; i += 3 ) {

			const luminance = 0.2126 * data[ i ] + 0.7152 * data[ i + 1 ] + 0.0722 * data[ i + 2 ];

			if ( luminance > 0 ) {

				power += luminance * luminance;
				count ++;

			}

		}

		return count > 0 ? 0.01 * power / count : 1;

	}

	/**
	 * Gathers the triangles of all geometries: their welded vertices, world-space corners, and their
	 * corners in light map texels with their world-space area.
	 *
	 * @private
	 * @param {boolean} weldNormals - Whether to weld vertices by position and normal for the fit, or only by position for the topology.
	 * @return {Object} The triangles.
	 */
	_collect( weldNormals ) {

		const parts = [];
		let triangles = 0, unknowns = 0;

		for ( let i = 0; i < this.geometries.length; i ++ ) {

			const geometry = this.geometries[ i ];
			const position = geometry.getAttribute( 'position' );
			const index = geometry.index !== null ? geometry.index.array : Uint32Array.from( { length: position.count }, ( v, j ) => j );
			const welds = weld( position, weldNormals ? geometry.getAttribute( 'normal' ) : undefined );

			parts.push( { geometry, mesh: this.meshes[ i ], count: position.count, index, ids: welds.ids, triangleOffset: triangles, unknownOffset: unknowns } );

			triangles += Math.floor( index.length / 3 );
			unknowns += welds.count;

		}

		const ids = new Int32Array( triangles * 3 );
		const world = new Float64Array( triangles * 9 );
		const corners = new Float64Array( triangles * 6 );
		const areas = new Float64Array( triangles );
		const texels = new Float32Array( triangles );
		const lengths = new Float32Array( triangles );
		const { width, height, pages = 1 } = this.lightMap;

		// the pages of a multi-page light map lie on top of each other

		const pageHeight = height / pages;

		for ( const part of parts ) {

			const { geometry, mesh, index, triangleOffset, unknownOffset } = part;
			const position = components( geometry.getAttribute( 'position' ), 3 );
			const uv1 = geometry.hasAttribute( 'uv1' ) ? components( geometry.getAttribute( 'uv1' ), 2 ) : undefined;
			const count = Math.floor( index.length / 3 );

			mesh.updateWorldMatrix( true, false );

			const m = mesh.matrixWorld.elements;
			const page = Math.min( Math.max( mesh.userData.lightMapPage ?? 0, 0 ), pages - 1 );

			if ( uv1 === undefined ) console.warn( 'VertexLightBaker: A geometry has no uv1, its irradiance is only smoothed.' );

			for ( let t = 0; t < count; t ++ ) {

				const g = triangleOffset + t;

				for ( let j = 0; j < 3; j ++ ) {

					const v = index[ t * 3 + j ];
					const x = position[ v * 3 ], y = position[ v * 3 + 1 ], z = position[ v * 3 + 2 ];
					const o = g * 9 + j * 3;

					world[ o ] = m[ 0 ] * x + m[ 4 ] * y + m[ 8 ] * z + m[ 12 ];
					world[ o + 1 ] = m[ 1 ] * x + m[ 5 ] * y + m[ 9 ] * z + m[ 13 ];
					world[ o + 2 ] = m[ 2 ] * x + m[ 6 ] * y + m[ 10 ] * z + m[ 14 ];

					ids[ g * 3 + j ] = unknownOffset + part.ids[ v ];

					if ( uv1 !== undefined ) {

						corners[ g * 6 + j * 2 ] = uv1[ v * 2 ] * width;
						corners[ g * 6 + j * 2 + 1 ] = ( uv1[ v * 2 + 1 ] + page ) * pageHeight;

					}

				}

				const o = g * 9;
				const ax = world[ o + 3 ] - world[ o ], ay = world[ o + 4 ] - world[ o + 1 ], az = world[ o + 5 ] - world[ o + 2 ];
				const bx = world[ o + 6 ] - world[ o ], by = world[ o + 7 ] - world[ o + 1 ], bz = world[ o + 8 ] - world[ o + 2 ];

				areas[ g ] = 0.5 * Math.hypot( ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx );

				const c = g * 6;
				texels[ g ] = 0.5 * Math.abs( ( corners[ c + 2 ] - corners[ c ] ) * ( corners[ c + 5 ] - corners[ c + 1 ] ) - ( corners[ c + 4 ] - corners[ c ] ) * ( corners[ c + 3 ] - corners[ c + 1 ] ) );
				lengths[ g ] = Math.sqrt( Math.max(
					( corners[ c + 2 ] - corners[ c ] ) ** 2 + ( corners[ c + 3 ] - corners[ c + 1 ] ) ** 2,
					( corners[ c + 4 ] - corners[ c + 2 ] ) ** 2 + ( corners[ c + 5 ] - corners[ c + 3 ] ) ** 2,
					( corners[ c ] - corners[ c + 4 ] ) ** 2 + ( corners[ c + 1 ] - corners[ c + 5 ] ) ** 2
				) );

			}

		}

		return { parts, triangles, unknowns, ids, world, corners, areas, texels, lengths };

	}

	/**
	 * Visits the light map texels whose centers lie inside each triangle, with a top-left fill rule, to
	 * accumulate the normal equations, to measure the residuals of a solution, or to estimate the
	 * error of a linear fit per triangle.
	 *
	 * @private
	 * @param {Object} system - The triangles.
	 * @param {number} mode - `ACCUMULATE`, `MEASURE` or `ESTIMATE`.
	 * @param {Object} target - The arrays to accumulate into, or the solution, luminance floor, noise and previous estimates.
	 * @return {Object} The weight and power of the covered texels, the residuals or the estimated errors.
	 */
	_rasterize( system, mode, target ) {

		const { data, width, height } = this.lightMap;
		const { triangles, ids, corners, areas, texels, lengths } = system;
		const { triangleEdges, diagonal, offDiagonal, rhs, x, floor = 0, noise = 0, previous = null } = target;
		const errors = mode === ESTIMATE ? new Float64Array( triangles ) : null;
		const weights = mode === ESTIMATE ? new Float64Array( triangles ) : null;
		const sample = new Float64Array( 3 );
		const ignoreUnlit = this.ignoreUnlit;

		// the sums of a triangle, see accumulate(), measure() and estimate(), and the sums over all
		// triangles: weight, power, difference and relative difference

		const local = new Float64Array( 20 );
		const totals = new Float64Array( 4 );

		// texels are weighted by their world-space area, normalized by the mean texel area

		let totalArea = 0, totalTexels = 0;

		for ( let t = 0; t < triangles; t ++ ) {

			if ( texels[ t ] > 1e-9 ) {

				totalArea += areas[ t ];
				totalTexels += texels[ t ];

			}

		}

		const texelArea = totalArea > 0 ? totalArea / totalTexels : 1;

		for ( let t = 0; t < triangles; t ++ ) {

			if ( texels[ t ] <= 1e-9 ) continue;

			if ( previous !== null && previous.sources[ t ] >= 0 ) {

				errors[ t ] = previous.errors[ previous.sources[ t ] ];
				weights[ t ] = previous.weights[ previous.sources[ t ] ];
				continue;

			}

			const i0 = ids[ t * 3 ], u0 = corners[ t * 6 ], v0 = corners[ t * 6 + 1 ];
			let i1 = ids[ t * 3 + 1 ], i2 = ids[ t * 3 + 2 ];
			let u1 = corners[ t * 6 + 2 ], v1 = corners[ t * 6 + 3 ];
			let u2 = corners[ t * 6 + 4 ], v2 = corners[ t * 6 + 5 ];
			let e01 = 0, e20 = 2;

			let area2 = ( u1 - u0 ) * ( v2 - v0 ) - ( u2 - u0 ) * ( v1 - v0 );

			if ( area2 < 0 ) {

				// mirrored charts, swap two corners to keep the edge functions positive inside

				[ i1, i2 ] = [ i2, i1 ];
				[ u1, u2 ] = [ u2, u1 ];
				[ v1, v2 ] = [ v2, v1 ];
				[ e01, e20 ] = [ e20, e01 ];
				area2 = - area2;

			}

			const texelWeight = areas[ t ] / ( 0.5 * area2 ) / texelArea;

			// a texel center exactly on an edge belongs to the triangle on its top or left side

			const top12 = v2 > v1 || ( v2 === v1 && u2 < u1 );
			const top20 = v0 > v2 || ( v0 === v2 && u0 < u2 );
			const top01 = v1 > v0 || ( v1 === v0 && u1 < u0 );

			const minX = Math.max( Math.ceil( Math.min( u0, u1, u2 ) - 0.5 ), 0 );
			const maxX = Math.min( Math.floor( Math.max( u0, u1, u2 ) - 0.5 ), width - 1 );
			const minY = Math.max( Math.ceil( Math.min( v0, v1, v2 ) - 0.5 ), 0 );
			const maxY = Math.min( Math.floor( Math.max( v0, v1, v2 ) - 0.5 ), height - 1 );

			local.fill( 0 );

			if ( mode === MEASURE ) {

				for ( let c = 0; c < 3; c ++ ) {

					local[ c ] = x[ i0 * 3 + c ];
					local[ 3 + c ] = x[ i1 * 3 + c ];
					local[ 6 + c ] = x[ i2 * 3 + c ];

				}

			}

			let count = 0;

			for ( let py = minY; py <= maxY; py ++ ) {

				const cy = py + 0.5;

				for ( let px = minX; px <= maxX; px ++ ) {

					const cx = px + 0.5;

					const w0 = ( u2 - u1 ) * ( cy - v1 ) - ( v2 - v1 ) * ( cx - u1 );
					if ( w0 < 0 || ( w0 === 0 && top12 === false ) ) continue;

					const w1 = ( u0 - u2 ) * ( cy - v2 ) - ( v0 - v2 ) * ( cx - u2 );
					if ( w1 < 0 || ( w1 === 0 && top20 === false ) ) continue;

					const w2 = ( u1 - u0 ) * ( cy - v0 ) - ( v1 - v0 ) * ( cx - u0 );
					if ( w2 < 0 || ( w2 === 0 && top01 === false ) ) continue;

					const k = ( py * width + px ) * 3;

					if ( ignoreUnlit && data[ k ] === 0 && data[ k + 1 ] === 0 && data[ k + 2 ] === 0 ) continue;

					visit( mode, local, totals, w0 / area2, w1 / area2, w2 / area2, data[ k ], data[ k + 1 ], data[ k + 2 ], texelWeight, floor );
					count ++;

				}

			}

			// the error is measured over the covered texels only

			if ( mode === MEASURE ) continue;

			if ( count < lengths[ t ] - 1 ) {

				// thin triangles cover fewer texel centers than they are long, interpolating far apart vertices.
				// They are sampled along their longest edge too, like a strip one texel wide

				const l01 = ( u1 - u0 ) ** 2 + ( v1 - v0 ) ** 2, l12 = ( u2 - u1 ) ** 2 + ( v2 - v1 ) ** 2, l20 = ( u0 - u2 ) ** 2 + ( v0 - v2 ) ** 2;
				const edge = l01 >= l12 && l01 >= l20 ? 0 : l12 >= l20 ? 1 : 2;
				const samples = Math.ceil( lengths[ t ] ) - count;

				for ( let i = 0; i < samples; i ++ ) {

					// two thirds along the edge, a third towards the opposite corner

					const along = ( i + 0.5 ) / samples;
					const a = 2 / 3 * ( 1 - along ), b = 2 / 3 * along, c = 1 / 3;
					const b0 = edge === 0 ? a : edge === 1 ? c : b;
					const b1 = edge === 0 ? b : edge === 1 ? a : c;
					const b2 = edge === 0 ? c : edge === 1 ? b : a;

					bilinear( data, width, height, b0 * u0 + b1 * u1 + b2 * u2, b0 * v0 + b1 * v1 + b2 * v2, sample );

					if ( ignoreUnlit === false || sample[ 0 ] + sample[ 1 ] + sample[ 2 ] > 0 ) visit( mode, local, totals, b0, b1, b2, sample[ 0 ], sample[ 1 ], sample[ 2 ], 1, floor );

				}

			} else if ( count === 0 ) {

				// triangles smaller than a texel sample the light map at their centroid, weighted by their area

				bilinear( data, width, height, ( u0 + u1 + u2 ) / 3, ( v0 + v1 + v2 ) / 3, sample );

				if ( ignoreUnlit === false || sample[ 0 ] + sample[ 1 ] + sample[ 2 ] > 0 ) visit( mode, local, totals, 1 / 3, 1 / 3, 1 / 3, sample[ 0 ], sample[ 1 ], sample[ 2 ], areas[ t ] / texelArea, floor );

			}

			if ( mode === ESTIMATE ) {

				// less the residual that noise leaves in a linear fit of n texels

				const n = local[ 19 ];

				errors[ t ] = Math.max( linearResidual( local ) - noise * noise * local[ 18 ] * Math.max( n - 3, 0 ) / n, 0 );
				weights[ t ] = local[ 18 ];

			} else if ( mode === ACCUMULATE ) {

				diagonal[ i0 ] += local[ 0 ];
				diagonal[ i1 ] += local[ 1 ];
				diagonal[ i2 ] += local[ 2 ];

				// welded corners of degenerate triangles have no edge, their products join the diagonal

				const edge01 = triangleEdges[ t * 3 + e01 ], edge12 = triangleEdges[ t * 3 + 1 ], edge20 = triangleEdges[ t * 3 + e20 ];

				if ( edge01 >= 0 ) offDiagonal[ edge01 ] += local[ 3 ]; else diagonal[ i0 ] += 2 * local[ 3 ];
				if ( edge12 >= 0 ) offDiagonal[ edge12 ] += local[ 4 ]; else diagonal[ i1 ] += 2 * local[ 4 ];
				if ( edge20 >= 0 ) offDiagonal[ edge20 ] += local[ 5 ]; else diagonal[ i2 ] += 2 * local[ 5 ];

				for ( let c = 0; c < 3; c ++ ) {

					rhs[ i0 * 3 + c ] += local[ 6 + c ];
					rhs[ i1 * 3 + c ] += local[ 9 + c ];
					rhs[ i2 * 3 + c ] += local[ 12 + c ];

				}

			}

		}

		const [ weight, power, difference, relative ] = totals;

		return { weight, power, difference, relative, errors, weights };

	}

}

/**
 * TSL function that returns the irradiance written by {@link VertexLightBaker}, interpolated
 * across the triangles, or zero for geometries without it. It is linear and in lux, use it like a
 * light map, e.g. for all lit materials of a pass:
 *
 * ```js
 * scenePass.contextNode = builtinGIContext( float( 1 ), vertexIrradiance() );
 * ```
 *
 * @tsl
 * @function
 * @param {string} [name='bakedIrradiance'] - The name of the irradiance attribute.
 * @return {Node<vec3>} The vertex irradiance.
 */
function vertexIrradiance( name = 'bakedIrradiance' ) {

	return Fn( ( builder ) => builder.geometry.hasAttribute( name ) ? attribute( name, 'vec3' ) : vec3( 0 ), 'vec3' )();

}

// adds a texel to the sums of a triangle

function visit( mode, local, totals, w0, w1, w2, red, green, blue, w, floor ) {

	if ( mode === ACCUMULATE ) accumulate( local, totals, w0, w1, w2, red, green, blue, w );
	else if ( mode === MEASURE ) measure( local, totals, w0, w1, w2, red, green, blue, w, floor );
	else estimate( local, w0, w1, w2, red, green, blue, w, floor );

}

// the normal equations of a triangle: the products of the barycentric weights in 0-5 (00, 11, 22, 01,
// 12, 20) and the weighted colors of the corners in 6-14, the totals sum the weight and luminance power

function accumulate( local, totals, w0, w1, w2, red, green, blue, w ) {

	local[ 0 ] += w * w0 * w0;
	local[ 1 ] += w * w1 * w1;
	local[ 2 ] += w * w2 * w2;
	local[ 3 ] += w * w0 * w1;
	local[ 4 ] += w * w1 * w2;
	local[ 5 ] += w * w2 * w0;
	local[ 6 ] += w * w0 * red;
	local[ 7 ] += w * w0 * green;
	local[ 8 ] += w * w0 * blue;
	local[ 9 ] += w * w1 * red;
	local[ 10 ] += w * w1 * green;
	local[ 11 ] += w * w1 * blue;
	local[ 12 ] += w * w2 * red;
	local[ 13 ] += w * w2 * green;
	local[ 14 ] += w * w2 * blue;

	const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

	totals[ 0 ] += w;
	totals[ 1 ] += w * luminance * luminance;

}

// the residual against the corner solutions of a triangle in 0-8, the totals sum the weight, the power,
// the squared difference and the squared difference relative to the luminance

function measure( local, totals, w0, w1, w2, red, green, blue, w, floor ) {

	const dr = w0 * local[ 0 ] + w1 * local[ 3 ] + w2 * local[ 6 ] - red;
	const dg = w0 * local[ 1 ] + w1 * local[ 4 ] + w2 * local[ 7 ] - green;
	const db = w0 * local[ 2 ] + w1 * local[ 5 ] + w2 * local[ 8 ] - blue;
	const squared = dr * dr + dg * dg + db * db;
	const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

	totals[ 0 ] += w;
	totals[ 1 ] += w * ( red * red + green * green + blue * blue );
	totals[ 2 ] += w * squared;
	totals[ 3 ] += w * squared / 3 / ( luminance * luminance + floor );

}

// the normal equations of a linear fit to the texels of a triangle relative to their luminance, like
// accumulate(), the squared colors in 15-17, the weight in 18 and the texel count in 19

function estimate( local, w0, w1, w2, red, green, blue, w, floor ) {

	const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
	const v = w / ( luminance * luminance + floor );

	local[ 0 ] += v * w0 * w0;
	local[ 1 ] += v * w1 * w1;
	local[ 2 ] += v * w2 * w2;
	local[ 3 ] += v * w0 * w1;
	local[ 4 ] += v * w1 * w2;
	local[ 5 ] += v * w2 * w0;
	local[ 6 ] += v * w0 * red;
	local[ 7 ] += v * w0 * green;
	local[ 8 ] += v * w0 * blue;
	local[ 9 ] += v * w1 * red;
	local[ 10 ] += v * w1 * green;
	local[ 11 ] += v * w1 * blue;
	local[ 12 ] += v * w2 * red;
	local[ 13 ] += v * w2 * green;
	local[ 14 ] += v * w2 * blue;
	local[ 15 ] += v * red * red;
	local[ 16 ] += v * green * green;
	local[ 17 ] += v * blue * blue;
	local[ 18 ] += w;
	local[ 19 ] ++;

}

// the weighted squared residual of the best linear fit, averaged over the channels, three or fewer
// texels are fitted exactly

function linearResidual( local ) {

	if ( local[ 19 ] <= 3 ) return 0;

	const ridge = 1e-9 * ( local[ 0 ] + local[ 1 ] + local[ 2 ] );
	const a = local[ 0 ] + ridge, b = local[ 1 ] + ridge, c = local[ 2 ] + ridge;
	const d = local[ 3 ], e = local[ 4 ], f = local[ 5 ];

	// the inverse of [ a d f, d b e, f e c ] from its cofactors

	const c00 = b * c - e * e, c01 = f * e - d * c, c02 = d * e - b * f;
	const c11 = a * c - f * f, c12 = d * f - a * e, c22 = a * b - d * d;
	const determinant = a * c00 + d * c01 + f * c02;

	if ( determinant <= 0 ) return 0;

	let residual = 0;

	for ( let k = 0; k < 3; k ++ ) {

		const r0 = local[ 6 + k ], r1 = local[ 9 + k ], r2 = local[ 12 + k ];
		const fitted = ( r0 * ( c00 * r0 + c01 * r1 + c02 * r2 ) + r1 * ( c01 * r0 + c11 * r1 + c12 * r2 ) + r2 * ( c02 * r0 + c12 * r1 + c22 * r2 ) ) / determinant;

		residual += Math.max( local[ 15 + k ] - fitted, 0 );

	}

	return residual / 3;

}

function copyGeometry( source ) {

	const geometry = new BufferGeometry();
	geometry.name = source.name;
	geometry.userData = source.userData;
	geometry.setIndex( source.index );

	for ( const name in source.attributes ) geometry.setAttribute( name, source.attributes[ name ] );
	for ( const group of source.groups ) geometry.addGroup( group.start, group.count, group.materialIndex );

	geometry.setDrawRange( source.drawRange.start, source.drawRange.count );

	return geometry;

}

// the components of an attribute as a tightly packed array

function components( attribute, itemSize ) {

	if ( attribute.isInterleavedBufferAttribute !== true && attribute.normalized !== true && attribute.itemSize === itemSize ) return attribute.array;

	const array = new Float32Array( attribute.count * itemSize );

	for ( let i = 0; i < attribute.count; i ++ ) {

		for ( let k = 0; k < itemSize; k ++ ) array[ i * itemSize + k ] = attribute.getComponent( i, k );

	}

	return array;

}

// welds the vertices with the same quantized position, and normal if given, with a hash table

function weld( position, normal ) {

	const count = position.count;
	const stride = normal !== undefined ? 6 : 3;
	const keys = new Int32Array( count * stride );
	const positions = components( position, 3 );
	const normals = normal !== undefined ? components( normal, 3 ) : null;

	let extent = 0;

	for ( let i = 0; i < count; i ++ ) {

		extent = Math.max( extent, Math.abs( positions[ i * 3 ] ), Math.abs( positions[ i * 3 + 1 ] ), Math.abs( positions[ i * 3 + 2 ] ) );

	}

	const scale = 1 / ( Math.max( extent, 1e-30 ) * POSITION_PRECISION );

	for ( let i = 0; i < count; i ++ ) {

		for ( let k = 0; k < 3; k ++ ) {

			keys[ i * stride + k ] = Math.round( positions[ i * 3 + k ] * scale );
			if ( stride === 6 ) keys[ i * stride + 3 + k ] = Math.round( normals[ i * 3 + k ] / NORMAL_PRECISION );

		}

	}

	let size = 2;
	while ( size < count * 2 ) size *= 2;

	const mask = size - 1;
	const table = new Int32Array( size ).fill( - 1 );
	const ids = new Int32Array( count );
	let unique = 0;

	for ( let i = 0; i < count; i ++ ) {

		const o = i * stride;
		let hash = 0x811c9dc5;

		for ( let k = 0; k < stride; k ++ ) hash = Math.imul( hash ^ keys[ o + k ], 0x01000193 );

		hash ^= hash >>> 16;
		hash = Math.imul( hash, 0x85ebca6b );
		hash ^= hash >>> 13;

		let slot = hash & mask;

		while ( true ) {

			const j = table[ slot ];

			if ( j === - 1 ) {

				table[ slot ] = i;
				ids[ i ] = unique ++;
				break;

			}

			let equal = true;

			for ( let k = 0; k < stride; k ++ ) {

				if ( keys[ j * stride + k ] !== keys[ o + k ] ) {

					equal = false;
					break;

				}

			}

			if ( equal ) {

				ids[ i ] = ids[ j ];
				break;

			}

			slot = ( slot + 1 ) & mask;

		}

	}

	return { ids, count: unique };

}

// the unique undirected edges between the vertices of the triangles with a hash table, the edge of each
// triangle side (-1 for welded corners) and, for the fit, the symmetric sparse pattern with the edge of each entry

function findEdges( ids, count, pattern ) {

	const corners = ids.length;

	let size = 2;
	while ( size < corners * 2 ) size *= 2;

	const mask = size - 1;
	const table = new Int32Array( size ).fill( - 1 );
	const a = new Int32Array( corners ), b = new Int32Array( corners );
	const triangleEdges = new Int32Array( corners );
	let unique = 0;

	for ( let k = 0; k < corners; k ++ ) {

		const p = ids[ k ], q = ids[ k - k % 3 + ( k + 1 ) % 3 ];

		if ( p === q ) {

			triangleEdges[ k ] = - 1;
			continue;

		}

		const low = Math.min( p, q ), high = Math.max( p, q );
		let hash = Math.imul( low, 0x9e3779b1 ) ^ Math.imul( high, 0x85ebca6b );
		hash ^= hash >>> 15;

		let slot = hash & mask;

		while ( true ) {

			const e = table[ slot ];

			if ( e === - 1 ) {

				table[ slot ] = unique;
				a[ unique ] = low;
				b[ unique ] = high;
				triangleEdges[ k ] = unique ++;
				break;

			}

			if ( a[ e ] === low && b[ e ] === high ) {

				triangleEdges[ k ] = e;
				break;

			}

			slot = ( slot + 1 ) & mask;

		}

	}

	const result = { count: unique, triangleEdges, a, b };

	if ( pattern ) {

		const rowPointers = new Int32Array( count + 1 );

		for ( let e = 0; e < unique; e ++ ) {

			rowPointers[ a[ e ] + 1 ] ++;
			rowPointers[ b[ e ] + 1 ] ++;

		}

		for ( let i = 0; i < count; i ++ ) rowPointers[ i + 1 ] += rowPointers[ i ];

		const cols = new Int32Array( unique * 2 ), slotEdges = new Int32Array( unique * 2 );
		const fill = rowPointers.slice( 0, count );

		for ( let e = 0; e < unique; e ++ ) {

			cols[ fill[ a[ e ] ] ] = b[ e ];
			slotEdges[ fill[ a[ e ] ] ++ ] = e;
			cols[ fill[ b[ e ] ] ] = a[ e ];
			slotEdges[ fill[ b[ e ] ] ++ ] = e;

		}

		Object.assign( result, { rowPointers, cols, slotEdges } );

	}

	return result;

}

// Jacobi preconditioned conjugate gradients for three right-hand sides of the same matrix,
// x holds the initial guess and receives the solution

function solve( rowPointers, cols, values, diagonal, rhs, x, tolerance, maxIterations ) {

	const n = diagonal.length;
	const r = new Float64Array( n * 3 ), z = new Float64Array( n * 3 ), p = new Float64Array( n * 3 ), q = new Float64Array( n * 3 );
	const rz = [ 0, 0, 0 ], pq = [ 0, 0, 0 ], rr = [ 0, 0, 0 ], bb = [ 0, 0, 0 ];

	multiply( rowPointers, cols, values, diagonal, x, q );

	for ( let i = 0; i < n * 3; i ++ ) {

		const c = i % 3;
		r[ i ] = rhs[ i ] - q[ i ];
		z[ i ] = r[ i ] / diagonal[ ( i - c ) / 3 ];
		p[ i ] = z[ i ];
		rz[ c ] += r[ i ] * z[ i ];
		bb[ c ] += rhs[ i ] * rhs[ i ];

	}

	const limits = bb.map( ( value ) => value * tolerance * tolerance );
	let iteration = 0;

	for ( ; iteration < maxIterations; iteration ++ ) {

		rr[ 0 ] = rr[ 1 ] = rr[ 2 ] = 0;
		for ( let i = 0; i < n * 3; i ++ ) rr[ i % 3 ] += r[ i ] * r[ i ];

		if ( rr[ 0 ] <= limits[ 0 ] && rr[ 1 ] <= limits[ 1 ] && rr[ 2 ] <= limits[ 2 ] ) break;

		multiply( rowPointers, cols, values, diagonal, p, q );

		pq[ 0 ] = pq[ 1 ] = pq[ 2 ] = 0;
		for ( let i = 0; i < n * 3; i ++ ) pq[ i % 3 ] += p[ i ] * q[ i ];

		const alpha = pq.map( ( value, c ) => value > 0 && rr[ c ] > limits[ c ] ? rz[ c ] / value : 0 );

		const rzNext = [ 0, 0, 0 ];

		for ( let i = 0, row = 0; row < n; row ++ ) {

			const inverse = 1 / diagonal[ row ];

			for ( let c = 0; c < 3; c ++, i ++ ) {

				x[ i ] += alpha[ c ] * p[ i ];
				r[ i ] -= alpha[ c ] * q[ i ];
				z[ i ] = r[ i ] * inverse;
				rzNext[ c ] += r[ i ] * z[ i ];

			}

		}

		const beta = rzNext.map( ( value, c ) => rz[ c ] > 0 ? value / rz[ c ] : 0 );

		for ( let i = 0; i < n * 3; i ++ ) p[ i ] = z[ i ] + beta[ i % 3 ] * p[ i ];

		rz[ 0 ] = rzNext[ 0 ];
		rz[ 1 ] = rzNext[ 1 ];
		rz[ 2 ] = rzNext[ 2 ];

	}

	return iteration;

}

function multiply( rowPointers, cols, values, diagonal, x, y ) {

	const n = diagonal.length;

	for ( let i = 0; i < n; i ++ ) {

		const d = diagonal[ i ];
		let y0 = d * x[ i * 3 ], y1 = d * x[ i * 3 + 1 ], y2 = d * x[ i * 3 + 2 ];

		for ( let k = rowPointers[ i ], end = rowPointers[ i + 1 ]; k < end; k ++ ) {

			const j = cols[ k ] * 3, a = values[ k ];

			y0 += a * x[ j ];
			y1 += a * x[ j + 1 ];
			y2 += a * x[ j + 2 ];

		}

		y[ i * 3 ] = y0;
		y[ i * 3 + 1 ] = y1;
		y[ i * 3 + 2 ] = y2;

	}

}

// bilinear light map lookup at a position in texels

function bilinear( data, width, height, u, v, target ) {

	const x = Math.min( Math.max( u - 0.5, 0 ), width - 1 ), y = Math.min( Math.max( v - 0.5, 0 ), height - 1 );
	const x0 = Math.floor( x ), y0 = Math.floor( y );
	const x1 = Math.min( x0 + 1, width - 1 ), y1 = Math.min( y0 + 1, height - 1 );
	const fx = x - x0, fy = y - y0;

	for ( let c = 0; c < 3; c ++ ) {

		const top = data[ ( y0 * width + x0 ) * 3 + c ] * ( 1 - fx ) + data[ ( y0 * width + x1 ) * 3 + c ] * fx;
		const bottom = data[ ( y1 * width + x0 ) * 3 + c ] * ( 1 - fx ) + data[ ( y1 * width + x1 ) * 3 + c ] * fx;
		target[ c ] = top * ( 1 - fy ) + bottom * fy;

	}

}

// splits the marked edges of a geometry, the triangles keep their order and groups, the sources are
// the indices of the kept triangles and -1 for new ones

function splitGeometry( part, triangleEdges, longest, marked ) {

	const { geometry, index, count, triangleOffset } = part;
	const triangles = Math.floor( index.length / 3 );

	const indices = new Uint32Array( triangles * 12 );
	const childOffsets = new Uint32Array( triangles + 1 );
	const sources = [];
	const midpoints = new Map();
	const pairs = [];
	let n = 0;

	const midpoint = ( a, b ) => {

		const key = a < b ? a * count + b : b * count + a;
		let vertex = midpoints.get( key );

		if ( vertex === undefined ) {

			vertex = count + pairs.length / 2;
			midpoints.set( key, vertex );
			pairs.push( a, b );

		}

		return vertex;

	};

	const emit = ( a, b, c ) => {

		indices[ n ++ ] = a;
		indices[ n ++ ] = b;
		indices[ n ++ ] = c;

	};

	for ( let t = 0; t < triangles; t ++ ) {

		const g = triangleOffset + t;
		const j = longest[ g ];

		childOffsets[ t ] = n / 3;

		if ( j < 0 || marked[ triangleEdges[ g * 3 + j ] ] === 0 ) {

			emit( index[ t * 3 ], index[ t * 3 + 1 ], index[ t * 3 + 2 ] );
			sources.push( t );
			continue;

		}

		// the longest edge is a-b, the triangle is bisected from its midpoint to c and the halves
		// are bisected again if their outer edges are marked too

		const a = index[ t * 3 + j ], b = index[ t * 3 + ( j + 1 ) % 3 ], c = index[ t * 3 + ( j + 2 ) % 3 ];
		const edgeBC = triangleEdges[ g * 3 + ( j + 1 ) % 3 ], edgeCA = triangleEdges[ g * 3 + ( j + 2 ) % 3 ];
		const m = midpoint( a, b );

		if ( edgeBC >= 0 && marked[ edgeBC ] === 1 ) {

			const p = midpoint( b, c );
			emit( m, b, p );
			emit( m, p, c );

		} else {

			emit( m, b, c );

		}

		if ( edgeCA >= 0 && marked[ edgeCA ] === 1 ) {

			const q = midpoint( c, a );
			emit( a, m, q );
			emit( q, m, c );

		} else {

			emit( a, m, c );

		}

		while ( sources.length < n / 3 ) sources.push( - 1 );

	}

	childOffsets[ triangles ] = n / 3;

	const vertices = count + pairs.length / 2;
	const result = new BufferGeometry();
	result.name = geometry.name;
	result.userData = geometry.userData;

	for ( const name in geometry.attributes ) {

		const source = geometry.attributes[ name ];
		const itemSize = source.itemSize;
		const array = new Float32Array( vertices * itemSize );

		if ( source.isInterleavedBufferAttribute !== true && source.normalized !== true && source.array instanceof Float32Array ) {

			array.set( source.array.subarray( 0, count * itemSize ) );

		} else {

			for ( let i = 0; i < count; i ++ ) {

				for ( let k = 0; k < itemSize; k ++ ) array[ i * itemSize + k ] = source.getComponent( i, k );

			}

		}

		for ( let i = count, p = 0; i < vertices; i ++, p += 2 ) {

			const a = pairs[ p ] * itemSize, b = pairs[ p + 1 ] * itemSize, o = i * itemSize;

			for ( let k = 0; k < itemSize; k ++ ) array[ o + k ] = 0.5 * ( array[ a + k ] + array[ b + k ] );

			if ( name === 'normal' || name === 'tangent' ) {

				const length = Math.hypot( array[ o ], array[ o + 1 ], array[ o + 2 ] ) || 1;

				for ( let k = 0; k < 3; k ++ ) array[ o + k ] /= length;

				if ( itemSize === 4 ) array[ o + 3 ] = array[ a + 3 ];

			}

		}

		result.setAttribute( name, new BufferAttribute( array, itemSize ) );

	}

	result.setIndex( new BufferAttribute( vertices > 65535 ? indices.slice( 0, n ) : Uint16Array.from( indices.subarray( 0, n ) ), 1 ) );

	// groups and the draw range are given in indices of the parent triangles

	const remap = ( start ) => childOffsets[ Math.min( Math.floor( start / 3 ), triangles ) ] * 3;

	for ( const group of geometry.groups ) {

		const start = remap( group.start );
		result.addGroup( start, remap( group.start + group.count ) - start, group.materialIndex );

	}

	const { start, count: drawCount } = geometry.drawRange;
	result.setDrawRange( remap( start ), drawCount === Infinity ? Infinity : remap( start + drawCount ) - remap( start ) );

	return { geometry: result, sources };

}

export { VertexLightBaker, vertexIrradiance };
