import {
	BufferGeometry,
	Float32BufferAttribute,
	Group,
	Mesh
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { cameraPosition, color, float, Fn, If, mix, mx_noise_float, normalView, normalWorld, positionView, positionWorld, saturation, smoothstep, uniform } from 'three/tsl';

import { ImprovedNoise } from '../math/ImprovedNoise.js';

/**
 * Bakes a procedural mountain range into a single {@link THREE.BufferGeometry} and
 * returns a `THREE.Group` ready to add to a scene.
 *
 * The heightfield is a derivative-damped fractal sum ( Quilez's fake erosion ): each
 * octave is suppressed where the running slope is already steep, concentrating detail
 * into weathered ridgelines, and a low-frequency domain warp makes those ridges
 * meander. A few passes of thermal ( talus ) erosion then relax any slope past the
 * angle of repose, settling the fractal's needle-spikes into real crests.
 *
 * The grid is triangulated with alternating quad diagonals ( a diamond pattern ), so a
 * coarse mesh holds its silhouette without a one-way grain. The surface shades itself
 * from altitude and slope in TSL — grass, forest, rock, scree and snow, with detail
 * normals and aerial perspective — so no material or textures are needed.
 *
 * The baked height grid is exposed through {@link TerrainGenerator#sampleHeight} so a
 * scattered forest ( or anything else ) can sit exactly on the surface.
 *
 * ```js
 * const terrain = new TerrainGenerator( { seed: 1 } );
 * scene.add( terrain.build() );
 * ```
 */
class TerrainGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, TerrainGenerator.defaults, parameters );

		// baked altitude range, fed to the shader so the colour bands track the real
		// valley floor and peaks
		this.minHeight = uniform( 0 );
		this.maxHeight = uniform( 1 );

		this.material = terrainMaterial( this.minHeight, this.maxHeight );
		this.geometry = null;
		this.group = null;

	}

	build() {

		this.dispose();

		const p = this.parameters;
		const N = p.segments + 1;
		const half = p.size / 2;

		// world coordinate of each grid line, shared by the bake and layout below
		const coord = new Array( N );
		for ( let i = 0; i < N; i ++ ) coord[ i ] = i / p.segments * p.size - half;

		// bake the height grid; kept around so the surface can be sampled ( bilinearly )
		// afterwards — e.g. to sit a scattered forest on it
		const height = heightField( p );
		const heights = new Float32Array( N * N );

		for ( let iz = 0; iz < N; iz ++ ) {

			for ( let ix = 0; ix < N; ix ++ ) {

				heights[ iz * N + ix ] = height( coord[ ix ], coord[ iz ] );

			}

		}

		// relax slopes past the angle of repose, shedding the fractal's needle-spikes
		if ( p.talusPasses > 0 ) thermalErode( heights, N, p.size / p.segments, p.talus, p.talusPasses );

		// lay the grid out flat in the XZ plane ( Y-up ) and find the height range
		const positions = new Float32Array( N * N * 3 );
		let min = Infinity, max = - Infinity;

		for ( let iz = 0; iz < N; iz ++ ) {

			for ( let ix = 0; ix < N; ix ++ ) {

				const o = iz * N + ix;
				const y = heights[ o ];

				positions[ o * 3 ] = coord[ ix ];
				positions[ o * 3 + 1 ] = y;
				positions[ o * 3 + 2 ] = coord[ iz ];

				if ( y < min ) min = y;
				if ( y > max ) max = y;

			}

		}

		// flip the quad diagonal on every other quad, so the mesh reads as diamonds
		// rather than a one-way grain
		const indices = [];

		for ( let iz = 0; iz < p.segments; iz ++ ) {

			for ( let ix = 0; ix < p.segments; ix ++ ) {

				const a = iz * N + ix, b = a + 1, c = a + N, d = c + 1;

				if ( ( ix + iz ) % 2 === 0 ) indices.push( a, c, b, b, c, d );
				else indices.push( a, c, d, a, d, b );

			}

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		geometry.setIndex( indices );
		geometry.computeVertexNormals();

		this.heights = heights;
		this.gridSize = N;
		this.minY = min;
		this.maxY = max;
		this.minHeight.value = min;
		this.maxHeight.value = max;

		const mesh = new Mesh( geometry, this.material );
		mesh.castShadow = mesh.receiveShadow = true;

		const group = new Group();
		group.name = 'Terrain';
		group.add( mesh );

		this.geometry = geometry;
		this.group = group;

		return group;

	}

	// world-space height at ( x, z ), bilinearly interpolated from the baked grid
	sampleHeight( x, z ) {

		const p = this.parameters;
		const N = this.gridSize;
		const half = p.size / 2;

		const fx = Math.max( 0, Math.min( p.segments, ( x + half ) / p.size * p.segments ) );
		const fz = Math.max( 0, Math.min( p.segments, ( z + half ) / p.size * p.segments ) );

		const ix = Math.min( N - 2, Math.floor( fx ) );
		const iz = Math.min( N - 2, Math.floor( fz ) );
		const tx = fx - ix;
		const tz = fz - iz;

		const h = this.heights;
		const h00 = h[ iz * N + ix ];
		const h10 = h[ iz * N + ix + 1 ];
		const h01 = h[ ( iz + 1 ) * N + ix ];
		const h11 = h[ ( iz + 1 ) * N + ix + 1 ];

		return ( h00 * ( 1 - tx ) + h10 * tx ) * ( 1 - tz ) + ( h01 * ( 1 - tx ) + h11 * tx ) * tz;

	}

	// surface flatness at ( x, z ): the normal's y component ( 1 on the flat, → 0 on a
	// cliff ). allocation-free, for cheaply testing many candidate forest positions.
	sampleSlope( x, z ) {

		const e = this.parameters.size / this.parameters.segments;
		const hx = this.sampleHeight( x + e, z ) - this.sampleHeight( x - e, z );
		const hz = this.sampleHeight( x, z + e ) - this.sampleHeight( x, z - e );

		return 2 * e / Math.sqrt( hx * hx + 4 * e * e + hz * hz );

	}

	dispose() {

		if ( this.geometry ) this.geometry.dispose();
		this.geometry = null;
		this.group = null;

	}

}

TerrainGenerator.defaults = {
	seed: 1,
	size: 200, // world units across the square patch
	segments: 192, // grid quads per side; vertices = ( segments + 1 )²
	heightScale: 65, // peak-to-valley exaggeration, in world units
	frequency: 0.01, // base noise frequency ( the footprint of a mountain )
	octaves: 5,
	lacunarity: 1.97, // per-octave frequency step; off 2 so octaves don't grid-lock
	gain: 0.5, // per-octave amplitude step ( persistence )
	erosion: 0.7, // derivative damping: higher flattens valleys and sharpens ridges
	warp: 0.35, // domain-warp strength ( noise units ): bends ridges and valleys
	valleyBias: 1.2, // power curve over the height, to flatten the mist floor
	seaLevel: 0.15, // 0..1, subtracted before scaling so the valley floor sinks below y = 0
	talus: 1, // thermal-erosion angle of repose ( rise / run ): lower settles flatter
	talusPasses: 12 // thermal-erosion iterations ( 0 = off )
};

// deterministic PRNG ( mulberry32 ), so a seed always bakes the same terrain
function createRandom( seed ) {

	let s = ( seed >>> 0 ) || 1;

	return function () {

		s = ( s + 0x6D2B79F5 ) | 0;
		let t = Math.imul( s ^ ( s >>> 15 ), 1 | s );
		t = ( t + Math.imul( t ^ ( t >>> 7 ), 61 | t ) ) ^ t;
		return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;

	};

}

// builds the height( worldX, worldZ ) function for one seed
function heightField( p ) {

	const perlin = new ImprovedNoise();
	const random = createRandom( p.seed );

	// ImprovedNoise's permutation is fixed, so a seed can only shift the sample window:
	// a translation and a per-octave z-slice, drawn from the PRNG to decorrelate seeds
	const offsetX = random() * 256;
	const offsetZ = random() * 256;
	const slice = random() * 256;

	const { frequency, octaves, lacunarity, gain, erosion, warp, valleyBias, seaLevel, heightScale } = p;

	// low-frequency fractal sum that warps the sample position
	function warpField( x, z, zr ) {

		let freq = 1, amp = 1, sum = 0, norm = 0;

		for ( let i = 0; i < 2; i ++ ) {

			sum += amp * perlin.noise( x * freq + offsetX, z * freq + offsetZ, zr + i * 1.7 );
			norm += amp; freq *= lacunarity; amp *= gain;

		}

		return sum / norm;

	}

	// derivative-damped fractal sum: each octave is divided down where the running
	// gradient is already steep, keeping ridges crisp and valleys smooth. the domain
	// rotates between octaves to break the noise's axis-aligned grid.
	function eroded( x, z ) {

		let sum = 0, amp = 1, dX = 0, dZ = 0, px = x, pz = z, freq = 1;
		const e = 0.004; // finite-difference step, in noise units

		for ( let i = 0; i < octaves; i ++ ) {

			const zr = slice + i * 1.7;
			const bx = px * freq + offsetX, bz = pz * freq + offsetZ;
			const n = perlin.noise( bx, bz, zr );
			const nx = perlin.noise( bx + e, bz, zr );
			const nz = perlin.noise( bx, bz + e, zr );

			// this octave's world-space gradient ( chain rule: × freq )
			dX += ( nx - n ) / e * freq;
			dZ += ( nz - n ) / e * freq;

			sum += amp * n / ( 1 + erosion * ( dX * dX + dZ * dZ ) );

			// rotate the domain ~37° ( the matrix [ 0.8 -0.6 ; 0.6 0.8 ] )
			const rx = 0.8 * px - 0.6 * pz;
			pz = 0.6 * px + 0.8 * pz;
			px = rx;

			freq *= lacunarity; amp *= gain;

		}

		return sum * 0.5 + 0.5;

	}

	return function ( worldX, worldZ ) {

		const x = worldX * frequency, z = worldZ * frequency;

		// warp the sample so ridges and valleys meander instead of running straight
		const wx = x + warp * warpField( x + 1.3, z + 7.2, slice + 40 );
		const wz = z + warp * warpField( x + 5.2, z + 1.3, slice + 70 );

		// power curve that settles the low ground into a flat mist bed
		const h = Math.pow( Math.min( eroded( wx, wz ) * 1.1, 1 ), valleyBias );

		return ( h - seaLevel ) * heightScale;

	};

}

// thermal ( talus ) erosion on the baked height grid: a cell overhanging a neighbour
// by more than the talus drop sheds the excess downhill, so over a few passes slopes
// relax to the angle of repose. spikes — steep on every side — bleed off fastest;
// broad one-sided faces keep their shape. material is conserved through a delta buffer,
// so the result is independent of cell order.
function thermalErode( h, N, cellSize, talus, passes ) {

	const drop = talus * cellSize; // max height step a slope can hold between two cells
	const carry = 0.5; // fraction of the steepest overhang moved per pass ( <= 0.5 = stable )
	const delta = new Float32Array( N * N );
	const ex = [ 0, 0, 0, 0 ];
	const off = [ - 1, 1, - N, N ];

	for ( let p = 0; p < passes; p ++ ) {

		delta.fill( 0 );

		for ( let z = 0; z < N; z ++ ) {

			for ( let x = 0; x < N; x ++ ) {

				const i = z * N + x;
				const hi = h[ i ];

				// overhang past the talus drop toward each of the 4 neighbours
				ex[ 0 ] = x > 0 ? hi - h[ i - 1 ] - drop : 0;
				ex[ 1 ] = x < N - 1 ? hi - h[ i + 1 ] - drop : 0;
				ex[ 2 ] = z > 0 ? hi - h[ i - N ] - drop : 0;
				ex[ 3 ] = z < N - 1 ? hi - h[ i + N ] - drop : 0;

				let sum = 0, peak = 0;

				for ( let k = 0; k < 4; k ++ ) {

					const d = ex[ k ];

					if ( d <= 0 ) {

						ex[ k ] = 0;
						continue;

					}

					sum += d;
					if ( d > peak ) peak = d;

				}

				if ( sum <= 0 ) continue;

				// move a slice of the steepest overhang, split across the downhill
				// neighbours in proportion to how far each sits below the talus line
				const move = carry * peak;
				delta[ i ] -= move;

				for ( let k = 0; k < 4; k ++ ) {

					if ( ex[ k ] > 0 ) delta[ i + off[ k ] ] += move * ex[ k ] / sum;

				}

			}

		}

		for ( let k = 0; k < N * N; k ++ ) h[ k ] += delta[ k ];

	}

}

// --- shading -------------------------------------------------------------

// perturbs the normal by a world-space height field using Mikkelsen's surface-gradient
// method. the built-in bumpMap reads height by offsetting the UV — a no-op for a
// world-keyed height — so the height's screen-space derivatives are fed in directly.
// returns a view-space normal.
function bumpNormal( height ) {

	const dpdx = positionView.dFdx();
	const dpdy = positionView.dFdy();
	const r1 = dpdy.cross( normalView );
	const r2 = normalView.cross( dpdx );
	const det = dpdx.dot( r1 );
	const grad = det.sign().mul( height.dFdx().mul( r1 ).add( height.dFdy().mul( r2 ) ) );

	return det.abs().mul( normalView ).sub( grad ).normalize();

}

// altitude- and slope-based shading, all in TSL ( no textures ). only the colour,
// roughness and detail normal are authored here; the lighting ( sun, sky fill, the
// snow's warm/cool cast ) comes from the scene's lights and environment.
function terrainMaterial( minHeight, maxHeight ) {

	const material = new MeshStandardNodeMaterial();
	material.metalness = 0;

	const distance = positionWorld.distance( cameraPosition );

	// the two drivers: normalised altitude ( valley 0 → peak 1 ) and surface flatness
	const altitude = positionWorld.y.sub( minHeight ).div( maxHeight.sub( minHeight ) ).clamp();
	const flatness = normalWorld.y.clamp(); // 1 on level ground, 0 on a vertical cliff
	const steep = flatness.oneMinus();

	// three reused noise scales: fine band-edge jitter, grain ( ~5u patches ) and macro
	const detail = mx_noise_float( positionWorld.xz.mul( 0.05 ) );
	const grain = mx_noise_float( positionWorld.xz.mul( 0.18 ) );
	const macro = mx_noise_float( positionWorld.xz.mul( 0.012 ) );

	const grass = color( 0x6e7253 ); // dry sage-olive meadow ( not video-game green )
	const dryGrass = color( 0x8a8550 );
	const forest = color( 0x39402f ); // dark forested mid-slope band, under the trees
	const rock = color( 0x736a5f ); // warm grey-brown rock
	const scree = color( 0x837a6f ); // brighter broken rock below the cliffs
	const lichen = color( 0x6c7355 ); // muted green-grey, patched onto lower rock
	const snow = color( 0xe9ecf0 ); // fresh snow; warm-sun / cool-sky cast is from the lighting
	const snowDeep = color( 0xccd6e2 ); // cooler wind-packed snow, drifted into patches

	// two band frequencies of lighter / darker stone, wobbled by noise, so cliff faces
	// read as layered bedding instead of flat grey
	const bandA = positionWorld.y.mul( 0.5 ).add( detail.mul( 3 ) ).add( macro.mul( 4 ) ).sin();
	const bandB = positionWorld.y.mul( 1.4 ).add( grain.mul( 2 ) ).sin();
	const strata = bandA.mul( 0.6 ).add( bandB.mul( 0.4 ) ).mul( 0.5 ).add( 0.5 );

	// lichen creeps onto the lower, gentler rock; cliffs and high ground stay bare grey
	const lichenMask = smoothstep( 0.45, 0.72, grain ).mul( smoothstep( 0.62, 0.32, steep ) ).mul( smoothstep( 0.66, 0.34, altitude ) );
	const rockShade = mix( rock, lichen, lichenMask.mul( 0.45 ) ).mul( strata.mul( 0.36 ).add( 0.8 ) );

	// meadow, drifting to dry grass in macro-noise patches over a mid band
	let surface = mix( grass, dryGrass, smoothstep( 0.15, 0.75, macro ).mul( smoothstep( 0.22, 0.5, altitude ) ) );

	// dark forested band on the gentle mid-slopes ( where the instanced trees live )
	surface = mix( surface, forest, smoothstep( 0.16, 0.34, altitude ).mul( smoothstep( 0.5, 0.72, flatness ) ).mul( 0.75 ) );

	// rock by altitude, and on every steep face regardless of height
	surface = mix( surface, rockShade, smoothstep( 0.46, 0.64, altitude.add( detail.mul( 0.06 ) ) ) );
	surface = mix( surface, rockShade, smoothstep( 0.34, 0.62, steep ) );

	// scree on the medium-steep ground below the cliffs, broken up by noise
	const screeMask = smoothstep( 0.42, 0.7, steep ).mul( smoothstep( 0.35, 0.7, flatness ) ).mul( detail.mul( 0.5 ).add( 0.5 ) );
	surface = mix( surface, scree, screeMask.mul( 0.5 ) );

	// snow on high, flat ground; the grain noise breaks the line so rock pokes through
	// near the snowline instead of stopping on a clean contour
	const snowMask = smoothstep( 0.56, 0.78, altitude.add( detail.mul( 0.08 ) ).add( grain.mul( 0.05 ) ) ).mul( smoothstep( 0.3, 0.6, flatness ) );
	const snowColor = mix( snow, snowDeep, smoothstep( 0.2, 0.7, grain ).mul( 0.6 ) ); // patchy, not a flat sheet
	surface = mix( surface, snowColor, snowMask );

	// dark, damp ground pooling in the low flat creases ( cheap moisture proxy )
	const cavity = smoothstep( 0.24, 0.06, altitude ).mul( flatness );
	surface = surface.mul( cavity.mul( 0.32 ).oneMinus() );

	// macro drift then a fine grain mottle, so no band is a flat colour
	surface = surface.mul( macro.mul( 0.5 ).add( 0.5 ).mul( 0.3 ).add( 0.84 ) );
	surface = surface.mul( grain.mul( 0.5 ).add( 0.5 ).mul( 0.12 ).add( 0.94 ) );

	// aerial perspective: desaturate and lift distant ground toward a cool haze, so
	// depth reads and the range recedes into the mist
	const aerial = smoothstep( 180, 820, distance );
	surface = saturation( surface, aerial.oneMinus().mul( 0.5 ).add( 0.5 ) );
	surface = mix( surface, color( 0xcfc8ba ), aerial.mul( 0.62 ) ); // far ridges dissolve into the sky

	material.colorNode = surface;
	material.roughnessNode = mix( float( 0.95 ), float( 0.72 ), snowMask );

	// detail normals: three octaves of world-space relief, faded out with distance so
	// they can't alias into fireflies in the haze. gating the noise behind the fade ( a
	// real branch ) lets the far majority of this fragment-bound terrain skip the taps.
	const detailFade = smoothstep( 420, 60, distance );
	const reliefStrength = mix( float( 0.25 ), float( 0.55 ), steep ); // more on rock, less on grass
	const relief = Fn( () => {

		const r = float( 0 ).toVar();

		If( detailFade.greaterThan( 0.01 ), () => {

			r.assign( mx_noise_float( positionWorld.xz.mul( 0.6 ) )
				.add( mx_noise_float( positionWorld.xz.mul( 1.7 ) ).mul( 0.5 ) )
				.add( mx_noise_float( positionWorld.xz.mul( 4.0 ) ).mul( 0.25 ) )
				.mul( reliefStrength ).mul( detailFade ).mul( 0.25 ) );

		} );

		return r;

	} )();

	material.normalNode = bumpNormal( relief );

	return material;

}

export { TerrainGenerator };
