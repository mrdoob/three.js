import {
	Group,
	Matrix4
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { cameraPosition, color, float, floor, Fn, fract, fwidth, hash, If, mix, mod, mx_fractal_noise_float, mx_noise_float, normalView, positionView, positionWorld, smoothstep, step, uint, varying, vec4 } from 'three/tsl';

import { SkyscraperGenerator, createSkyscraperMaterial, buildingPalette } from './city/SkyscraperGenerator.js';
import { SidewalkGenerator } from './city/SidewalkGenerator.js';

/**
 * Lays out a grid of city blocks and fills each lot with a {@link SkyscraperGenerator}
 * tower of its own seed, height and footprint, optionally on raised sidewalk
 * slabs (curbs). Returns a `THREE.Group` ready to add to a scene.
 *
 * Pass a building material to dress the towers; the sidewalks dress themselves
 * via {@link SidewalkGenerator}. The layout is exposed as
 * {@link CityGenerator#layout} so the surrounding scene (road markings, etc.)
 * can align to the same grid.
 *
 * ```js
 * const city = new CityGenerator( { seed: 1 } );
 * scene.add( city.build( materials ) );
 * ```
 */
class CityGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, CityGenerator.defaults, parameters );
		this.layout = cityLayout( this.parameters );

		this.generators = [];
		this.sidewalk = new SidewalkGenerator( {
			width: this.layout.blockW,
			depth: this.layout.blockD,
			height: this.parameters.curbHeight,
			radius: this.parameters.curbRadius
		} );
		this.group = null;

	}

	build( materials = {} ) {

		this.dispose();

		const group = new Group();
		group.name = 'City';

		const L = this.layout;
		const random = createRandom( this.parameters.seed );

		// raise the lots onto rounded sidewalk slabs ( curbs ) when curbHeight > 0

		const curb = this.parameters.curbHeight;
		const slabs = [];

		for ( let bx = 0; bx < L.blocksX; bx ++ ) {

			for ( let bz = 0; bz < L.blocksZ; bz ++ ) {

				const blockX = - L.cityW / 2 + bx * ( L.blockW + L.street );
				const blockZ = - L.cityD / 2 + bz * ( L.blockD + L.street );

				if ( curb > 0 ) {

					slabs.push( new Matrix4().makeTranslation( blockX + L.blockW / 2, 0, blockZ + L.blockD / 2 ) );

				}

				for ( let lx = 0; lx < L.lotsX; lx ++ ) {

					for ( let lz = 0; lz < L.lotsZ; lz ++ ) {

						// a chamfered corner only reads as architecture when it faces the
						// block's corner ( the street intersection ), so only the four corner
						// lots are cut, each toward its own outward corner; the rest stay square
						const cornerX = lx === 0 ? - 1 : ( lx === L.lotsX - 1 ? 1 : 0 );
						const cornerZ = lz === 0 ? - 1 : ( lz === L.lotsZ - 1 ? 1 : 0 );
						const onCorner = cornerX !== 0 && cornerZ !== 0;

						const tall = random();

						const generator = new SkyscraperGenerator( {
							seed: Math.floor( random() * 100000 ),
							totalHeight: 38 + tall * tall * 114, // a few tall towers, mostly mid-rise
							footprint: { width: L.lot - 1 - random() * 4, depth: L.lot - 1 - random() * 4 }, // nearly fill the lot so neighbours sit close; width and depth vary independently
							floorHeight: 3.4 + random() * 1.8,
							bayWidth: 1.9 + random() * 2.1,
							pierWidth: 0.4 + random() * 0.5,
							pierDepth: 0.3 + random() * 0.4,
							chamferWidth: onCorner ? 3 + random() * 4 : 0,
							chamferCornerX: cornerX,
							chamferCornerZ: cornerZ,
							setbackDepth: random() < 0.4 ? 0.8 + random() * 2 : 0, // only some towers step back at the crown; the rest rise flat
							stringCourseEvery: random() < 0.85 ? 3 + Math.floor( random() * 6 ) : 0
						}, materials.building );

						const building = generator.build();
						building.position.set( blockX + ( lx + 0.5 ) * L.lot, curb, blockZ + ( lz + 0.5 ) * L.lot );
						building.castShadow = building.receiveShadow = true;

						group.add( building );
						this.generators.push( generator );

					}

				}

			}

		}

		if ( slabs.length > 0 ) group.add( this.sidewalk.build( slabs ) );

		this.group = group;

		return group;

	}

	dispose() {

		for ( const generator of this.generators ) generator.dispose();
		this.generators.length = 0;

		this.sidewalk.dispose();

		this.group = null;

	}

}

CityGenerator.defaults = {
	seed: 1,
	street: 22,
	lot: 30,
	lotsX: 3,
	lotsZ: 2,
	blocksX: 2,
	blocksZ: 2,
	curbHeight: 0.15, // ~6 in standard curb reveal / sidewalk height above the road
	curbRadius: 5
};

// derives the block / street dimensions from the parameters
function cityLayout( parameters ) {

	const { street, lot, lotsX, lotsZ, blocksX, blocksZ } = parameters;

	const blockW = lotsX * lot;
	const blockD = lotsZ * lot;

	return {
		street, lot, lotsX, lotsZ, blocksX, blocksZ, blockW, blockD,
		cityW: blocksX * blockW + ( blocksX - 1 ) * street,
		cityD: blocksZ * blockD + ( blocksZ - 1 ) * street
	};

}

// deterministic PRNG (mulberry32) so a seed always lays out the same city
function createRandom( seed ) {

	let s = ( seed >>> 0 ) || 1;

	return function () {

		s = ( s + 0x6D2B79F5 ) | 0;
		let t = Math.imul( s ^ ( s >>> 15 ), 1 | s );
		t = ( t + Math.imul( t ^ ( t >>> 7 ), 61 | t ) ) ^ t;
		return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;

	};

}

// --- road material -------------------------------------------------------

// derivative-based bump for a procedural, world-space height field. the built-in bumpMap
// offsets the UV to read its height, so it returns a zero gradient for a height keyed off
// world position; this feeds the hardware screen-space derivatives of the height into
// Mikkelsen's surface-gradient method so the relief actually perturbs the normal.
function bumpNormal( height ) {

	const dpdx = positionView.dFdx();
	const dpdy = positionView.dFdy();
	const r1 = dpdy.cross( normalView );
	const r2 = normalView.cross( dpdx );
	const det = dpdx.dot( r1 );
	const grad = det.sign().mul( height.dFdx().mul( r1 ).add( height.dFdy().mul( r2 ) ) );

	return det.abs().mul( normalView ).sub( grad ).normalize();

}

// antialiased filled band: 1 where |coord| < halfWidth, edge sized to the
// pixel footprint ( fwidth ) so thin road paint stays crisp and doesn't shimmer
function lineAA( coord, halfWidth ) {

	const aa = fwidth( coord ).max( 0.0001 );
	return smoothstep( float( halfWidth ).add( aa ), float( halfWidth ).sub( aa ), coord.abs() );

}

// the same, repeated at every multiple of `period` ( stripes, joints )
function gridLine( coord, period, halfWidth ) {

	const g = coord.div( period );
	const d = float( 0.5 ).sub( fract( g ).sub( 0.5 ).abs() ); // distance to nearest line, in periods
	const aa = fwidth( g ).max( 0.0001 );
	const hw = halfWidth / period;
	return smoothstep( float( hw ).add( aa ), float( hw ).sub( aa ), d );

}

/**
 * The shared material every tower in a {@link CityGenerator} is dressed with: one flat
 * masonry colour per lot, picked from a palette by hashing the lot's grid cell.
 */
function createBuildingMaterial( layout, seed = 0 ) {

	// every tower takes one flat colour, picked by hashing its lot — one shared material
	// dresses the whole skyline; common tones repeat so the equal-probability pick feels real
	const palette = buildingPalette.map( hex => color( hex ) );

	const periodX = layout.blockW + layout.street;
	const periodZ = layout.blockD + layout.street;
	const gx = positionWorld.x.add( layout.cityW / 2 );
	const gz = positionWorld.z.add( layout.cityD / 2 );
	const blockIX = floor( gx.div( periodX ) );
	const blockIZ = floor( gz.div( periodZ ) );
	const cellX = blockIX.mul( layout.lotsX ).add( floor( gx.sub( blockIX.mul( periodX ) ).div( layout.lot ) ) );
	const cellZ = blockIZ.mul( layout.lotsZ ).add( floor( gz.sub( blockIZ.mul( periodZ ) ).div( layout.lot ) ) );
	const cellKey = uint( cellX.add( 4096 ) ).mul( uint( 73856093 ) ).bitXor( uint( cellZ.add( 4096 ) ).mul( uint( 19349663 ) ) ).bitXor( uint( ( seed * 2654435761 ) >>> 0 ) ).toVar();
	const cellHash = ( a, b ) => hash( cellKey.add( uint( Math.round( ( a + b * 7 ) * 100 ) ) ) );

	const pick = cellHash( 127.1, 311.7 );
	let buildingBase = palette[ 0 ];
	for ( let i = 1; i < palette.length; i ++ ) buildingBase = mix( buildingBase, palette[ i ], step( i / palette.length, pick ) );
	buildingBase = buildingBase.mul( cellHash( 269.5, 183.3 ).mul( 0.12 ).add( 0.94 ) ); // subtle per-building brightness

	// the pick is constant across a tower, so resolve it once per vertex ( varying )
	return createSkyscraperMaterial( varying( buildingBase ) );

}

/**
 * The road surface: wet asphalt with lane lines and crosswalks aligned to a
 * {@link CityGenerator} layout. Apply it to a ground plane sized to the city.
 */
function createRoadMaterial( layout ) {

	// wet asphalt: a warm-grey base in patchwork pours, two-scale aggregate
	// grit, oily wear stains, hairline cracks and low-frequency wet patches
	// that turn glossy and mirror the sky. detail fades in as the camera nears.

	const p = positionWorld;
	const detail = smoothstep( 240, 25, p.distance( cameraPosition ) );

	const blotch = mx_fractal_noise_float( p.mul( 0.2 ), 3 ).mul( 0.5 ).add( 0.5 );

	// close-range detail — aggregate grit, oily wear pools, hairline cracks and worn
	// paint — only resolves near the camera, so its noise is sampled ( inside the branch )
	// only where detail is non-zero and skipped across the far majority of the road
	const near = Fn( () => {

		const grit = float( 0 ).toVar(); // two scales of aggregate, -1..1
		const stain = float( 0 ).toVar(); // oily wear pools
		const crack = float( 0 ).toVar();
		const worn = float( 1 ).toVar(); // paint rubbed thin and patchy, more so where tyres cross it

		If( detail.greaterThan( 0 ), () => {

			grit.assign( mx_noise_float( p.mul( 7 ) ).add( mx_noise_float( p.mul( 23 ) ) ).mul( 0.5 ) );
			stain.assign( smoothstep( 0.5, 0.85, mx_fractal_noise_float( p.mul( 0.45 ), 3 ).mul( 0.5 ).add( 0.5 ) ) );
			crack.assign( smoothstep( 0.88, 1, mx_fractal_noise_float( p.mul( 1.1 ), 4 ).abs().oneMinus() ).mul( detail ) );
			worn.assign( smoothstep( 0.25, 0.7, mx_fractal_noise_float( p.mul( 0.7 ), 3 ).mul( 0.5 ).add( 0.5 ) ).mul( 0.55 ).add( 0.35 ) );

		} );

		return vec4( grit, stain, crack, worn );

	} )();

	const grit = near.x;
	const stain = near.y;
	const crack = near.z;
	const worn = near.w;

	const base = mix( color( 0x24262b ), color( 0x3b3f46 ), blotch );
	const gritty = base.mul( grit.mul( 0.22 ).mul( detail ).add( 1 ) );
	const asphalt = mix( gritty, gritty.mul( 0.5 ), stain.mul( 0.5 ).mul( detail ) );

	const wet = smoothstep( 0.6, 0.85, mx_fractal_noise_float( p.mul( 0.14 ), 2 ).mul( 0.5 ).add( 0.5 ) );

	// markings, aligned to the block / street grid. fx, fz are the position
	// within one block+street period; the street is the [ blockW, period ) part.

	const periodX = layout.blockW + layout.street;
	const periodZ = layout.blockD + layout.street;
	const fx = mod( p.x.add( layout.cityW / 2 ), periodX );
	const fz = mod( p.z.add( layout.cityD / 2 ), periodZ );
	const inStreetX = step( layout.blockW, fx ); // in a vertical street ( gap in X )
	const inStreetZ = step( layout.blockD, fz ); // in a horizontal street ( gap in Z )
	const su = fx.sub( layout.blockW ); // across the vertical street
	const sv = fz.sub( layout.blockD ); // across the horizontal street

	// lane markings down each street ( not through intersections ): a solid
	// centre line splitting the two directions, with a dashed divider in each
	// half, so every street carries four lanes
	const dashV = step( fract( p.z.div( 7 ) ), 0.5 );
	const dashH = step( fract( p.x.div( 7 ) ), 0.5 );

	const centreV = lineAA( su.sub( layout.street / 2 ), 0.12 );
	const dividerV = lineAA( su.sub( layout.street / 4 ), 0.1 ).max( lineAA( su.sub( layout.street * 3 / 4 ), 0.1 ) ).mul( dashV );
	const laneV = centreV.max( dividerV ).mul( inStreetX ).mul( inStreetZ.oneMinus() );

	const centreH = lineAA( sv.sub( layout.street / 2 ), 0.12 );
	const dividerH = lineAA( sv.sub( layout.street / 4 ), 0.1 ).max( lineAA( sv.sub( layout.street * 3 / 4 ), 0.1 ) ).mul( dashH );
	const laneH = centreH.max( dividerH ).mul( inStreetZ ).mul( inStreetX.oneMinus() );

	// continental crosswalk bars ( long in the travel direction ) in each
	// street arm, near the block edges it meets
	const cw = 5;
	const nearZ = step( fz, cw ).max( step( layout.blockD - cw, fz ) );
	const nearX = step( fx, cw ).max( step( layout.blockW - cw, fx ) );
	const crossV = gridLine( su, 1.2, 0.38 ).mul( inStreetX ).mul( inStreetZ.oneMinus() ).mul( nearZ );
	const crossH = gridLine( sv, 1.2, 0.38 ).mul( inStreetZ ).mul( inStreetX.oneMinus() ).mul( nearX );

	const paint = laneV.max( laneH ).max( crossV ).max( crossH ).mul( detail ).mul( worn );

	const material = new MeshStandardNodeMaterial();
	const surface = mix( asphalt, asphalt.mul( 0.6 ), wet ).mul( crack.mul( 0.5 ).oneMinus() );
	material.colorNode = mix( surface, color( 0xd0ccc0 ), paint ); // worn white paint
	material.roughnessNode = mix( float( 0.95 ).sub( paint.mul( 0.2 ) ), float( 0.32 ), wet );
	material.normalNode = bumpNormal( grit.mul( 0.003 ).sub( crack.mul( 0.01 ) ).mul( detail ) ); // world units: ~3 mm aggregate, ~10 mm cracks

	return material;

}

export { CityGenerator, createBuildingMaterial, createRoadMaterial };
