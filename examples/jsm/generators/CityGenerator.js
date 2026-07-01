import {
	BoxGeometry,
	Group,
	InstancedMesh,
	Matrix4,
	Quaternion,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { cameraPosition, color, float, floor, Fn, fract, fwidth, hash, If, mix, mod, mx_fractal_noise_float, mx_noise_float, normalView, positionView, positionWorld, smoothstep, step, uint, varying, vec4 } from 'three/tsl';

import { SkyscraperGenerator, createSkyscraperMaterial, buildingPalette } from './city/SkyscraperGenerator.js';
import { SidewalkGenerator } from './city/SidewalkGenerator.js';
import { StreetlightGenerator } from './city/StreetlightGenerator.js';
import { TrafficlightGenerator } from './city/TrafficlightGenerator.js';
import { TrashcanGenerator } from './city/TrashcanGenerator.js';
import { BenchGenerator } from './city/BenchGenerator.js';
import { HydrantGenerator } from './city/HydrantGenerator.js';
import { StreetTreeGenerator } from './city/StreetTreeGenerator.js';
import { CarGenerator } from './city/CarGenerator.js';
import { PersonGenerator } from './city/PersonGenerator.js';

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

		// per-tower box specs recorded during build(), consumed by buildProxy()
		this.towers = [];

		this.sidewalk = new SidewalkGenerator( {
			width: this.layout.blockW,
			depth: this.layout.blockD,
			height: this.parameters.curbHeight,
			radius: this.parameters.curbRadius
		} );

		// the street-furniture generators, each instanced across placements the
		// layout hands them ( see buildFurniture )
		this.furniture = {
			streetlight: new StreetlightGenerator(),
			trafficlight: new TrafficlightGenerator(),
			trashcan: new TrashcanGenerator(),
			bench: new BenchGenerator(),
			hydrant: new HydrantGenerator(),
			tree: new StreetTreeGenerator(),
			car: new CarGenerator(),
			person: new PersonGenerator()
		};

		this.group = null;

	}

	build( materials = {} ) {

		this.dispose();

		const group = new Group();
		group.name = 'City';

		this.towers = [];

		const L = this.layout;
		const random = createRandom( this.parameters.seed );

		// raise the lots onto rounded sidewalk slabs ( curbs ) when curbHeight > 0

		const curb = this.parameters.curbHeight;
		const sw = this.parameters.sidewalkWidth;
		const slabs = [];

		for ( let bx = 0; bx < L.blocksX; bx ++ ) {

			for ( let bz = 0; bz < L.blocksZ; bz ++ ) {

				const blockX = - L.cityW / 2 + bx * ( L.blockW + L.street );
				const blockZ = - L.cityD / 2 + bz * ( L.blockD + L.street );

				if ( curb > 0 ) {

					slabs.push( new Matrix4().makeTranslation( blockX + L.blockW / 2, 0, blockZ + L.blockD / 2 ) );

				}

				// the lots sit in an inner zone set back from the block edge by the
				// sidewalk width, so a real walking strip is left between the street
				// wall and the curb. buildings front onto that building line.
				const zoneX = blockX + sw, zoneZ = blockZ + sw;

				for ( let lx = 0; lx < L.lotsX; lx ++ ) {

					for ( let lz = 0; lz < L.lotsZ; lz ++ ) {

						// a chamfered corner only reads as architecture when it faces the
						// block's corner ( the street intersection ), so only the four corner
						// lots are cut, each toward its own outward corner; the rest stay square
						const cornerX = lx === 0 ? - 1 : ( lx === L.lotsX - 1 ? 1 : 0 );
						const cornerZ = lz === 0 ? - 1 : ( lz === L.lotsZ - 1 ? 1 : 0 );
						const onCorner = cornerX !== 0 && cornerZ !== 0;

						const tall = random();

						// nearly fill the lot so neighbours abut into a continuous street
						// wall; the small slack goes to the interior side ( a light well )
						const fw = L.innerLotX - ( 0.4 + random() * 1 );
						const fd = L.innerLotZ - ( 0.4 + random() * 1 );

						const totalHeight = 38 + tall * tall * 114; // a few tall towers, mostly mid-rise

						const generator = new SkyscraperGenerator( {
							seed: Math.floor( random() * 100000 ),
							totalHeight,
							footprint: { width: fw, depth: fd },
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

						// place within the lot, fronted toward the streets it borders so its
						// outer faces land on the building line; interior columns stay centred
						const lotLeft = zoneX + lx * L.innerLotX, lotNear = zoneZ + lz * L.innerLotZ;
						const cx = cornerX === - 1 ? lotLeft + fw / 2 : ( cornerX === 1 ? lotLeft + L.innerLotX - fw / 2 : lotLeft + L.innerLotX / 2 );
						const cz = cornerZ === - 1 ? lotNear + fd / 2 : ( cornerZ === 1 ? lotNear + L.innerLotZ - fd / 2 : lotNear + L.innerLotZ / 2 );
						building.position.set( cx, curb, cz );
						building.castShadow = building.receiveShadow = true;

						group.add( building );
						this.generators.push( generator );

						// record a plain box matching this tower for the GI proxy
						this.towers.push( { x: cx, y: curb + totalHeight / 2, z: cz, w: fw, h: totalHeight, d: fd } );

					}

				}

			}

		}

		if ( slabs.length > 0 ) group.add( this.sidewalk.build( slabs ) );

		group.add( this.buildFurniture( random ) );

		this.group = group;

		return group;

	}

	/**
	 * Builds a lightweight stand-in for the city: one instanced box per tower,
	 * sized to match, in a single draw call. Intended for cheap global-illumination
	 * bakes, where the detailed facades and street furniture are unnecessary and the
	 * boxes still cast the same street shadows and bounce the same warm fill.
	 *
	 * Call after {@link CityGenerator#build}, which records the tower boxes.
	 *
	 * @return {InstancedMesh} The proxy mesh.
	 */
	buildProxy() {

		const towers = this.towers;

		// each box takes its tower's own masonry colour ( same node, keyed off world
		// position ), so the GI bleeds the real per-building tints. mid roughness / metalness
		// give the boxes a soft, part-glazed sky reflection.
		const material = new MeshStandardNodeMaterial( { roughness: 0.4, metalness: 0.4 } );
		material.colorNode = buildingColorNode( this.layout, this.parameters.seed );
		const mesh = new InstancedMesh( new BoxGeometry( 1, 1, 1 ), material, towers.length );
		mesh.name = 'CityProxy';

		const matrix = new Matrix4();

		for ( let i = 0; i < towers.length; i ++ ) {

			const t = towers[ i ];
			matrix.makeScale( t.w, t.h, t.d );
			matrix.setPosition( t.x, t.y, t.z );
			mesh.setMatrixAt( i, matrix );

		}

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		return mesh;

	}

	// dresses the sidewalks and roadway with instanced street furniture, walking the
	// curb edge of every block so poles, baskets, trees, pedestrians and parked cars
	// all align to the same grid the buildings and road markings use
	buildFurniture( random ) {

		const L = this.layout;
		const top = this.parameters.curbHeight; // sidewalk surface the furniture stands on
		const sw = this.parameters.sidewalkWidth;
		const group = new Group();
		group.name = 'StreetFurniture';

		const lights = [], signals = [], cans = [], benches = [], hydrants = [], trees = [], people = [], cars = [];

		// most cars are working vehicles; about a third are yellow cabs
		const carColor = () => {

			if ( random() < 0.34 ) return 0xf5c518;
			const palette = [ 0xe9e9e6, 0x17191d, 0x9aa0a4, 0x3a3f45, 0x6e7378, 0x7a2420, 0x1d2a46, 0x2f4632 ];
			return palette[ Math.floor( random() * palette.length ) ];

		};

		for ( let bx = 0; bx < L.blocksX; bx ++ ) {

			for ( let bz = 0; bz < L.blocksZ; bz ++ ) {

				const blockX = - L.cityW / 2 + bx * ( L.blockW + L.street );
				const blockZ = - L.cityD / 2 + bz * ( L.blockD + L.street );
				const edges = blockEdges( blockX, blockZ, L.blockW, L.blockD );

				for ( const e of edges ) {

					const len = e.length;

					// cars on opposite kerbs of a street face opposite ways ( with the
					// traffic on their side ), keyed off which way the kerb faces
					const fdir = Math.sign( e.nx + e.nz ) || 1;

					// a point on the sidewalk, `lateral` metres in from the curb
					const onWalk = ( t, lateral ) => place( e.x0 + e.dx * t - e.nx * lateral, top, e.z0 + e.dz * t - e.nz * lateral, e.nx, e.nz );

					// streetlights spaced along the curb, facing the road so the arm reaches over it
					const lc = Math.max( 1, Math.round( len / 30 ) );
					for ( let i = 0; i < lc; i ++ ) lights.push( onWalk( len * ( i + 0.5 ) / lc, 0.8 ) );

					// street trees in curbside pits, offset from the lights, clear of the corners
					const tc = Math.max( 1, Math.round( len / 16 ) );
					for ( let i = 0; i < tc; i ++ ) {

						const t = len * ( i + 0.5 ) / tc + 5;
						if ( t > 7 && t < len - 7 && random() < 0.85 ) {

							// random yaw and height so no two street trees read as copies
							trees.push( placeYawScale( e.x0 + e.dx * t - e.nx * 1.5, top, e.z0 + e.dz * t - e.nz * 1.5, random() * Math.PI * 2, 0.8 + random() * 0.5 ) );

						}

					}

					// a single hydrant on the kerb, its no-parking zone honoured below
					const hydT = len * ( 0.25 + random() * 0.5 );
					hydrants.push( onWalk( hydT, 0.7 ) );

					// a bench facing the street on some edges
					if ( random() < 0.4 ) benches.push( onWalk( len * ( 0.3 + random() * 0.4 ), 1.7 ) );

					// pedestrians scattered across the walking strip, facing any way
					const pc = Math.max( 2, Math.round( len / 9 ) );
					for ( let i = 0; i < pc; i ++ ) {

						if ( random() < 0.7 ) {

							const t = len * ( i + random() ) / pc;
							const lateral = 0.9 + random() * ( sw - 2 );
							people.push( placeYawScale( e.x0 + e.dx * t - e.nx * lateral, top, e.z0 + e.dz * t - e.nz * lateral, random() * Math.PI * 2, 0.92 + random() * 0.16 ) );

						}

					}

					// parked cars in the kerb lane, nose-to-tail with gaps, clear of the
					// corners ( daylighting ) and the hydrant
					for ( let t = 9; t < len - 9; t += 5.8 ) {

						if ( Math.abs( t - hydT ) > 3 && random() < 0.72 ) {

							cars.push( { matrix: place( e.x0 + e.dx * t + e.nx * 1.5, 0, e.z0 + e.dz * t + e.nz * 1.5, e.dx * fdir, e.dz * fdir ), color: carColor() } );

						}

					}

					// the occasional vehicle out in a travel lane
					for ( let t = 14; t < len - 14; t += 13 ) {

						if ( random() < 0.4 ) cars.push( { matrix: place( e.x0 + e.dx * t + e.nx * 5.5, 0, e.z0 + e.dz * t + e.nz * 5.5, e.dx * fdir, e.dz * fdir ), color: carColor() } );

					}

				}

				// at two opposite corners: a mast-arm signal reaching over the crossing,
				// and a litter basket on every corner just along the kerb
				const corners = [[ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ]];
				for ( const [ cx, cz ] of corners ) {

					const x = blockX + cx * L.blockW, z = blockZ + cz * L.blockD;
					const ix = cx ? - 1 : 1, iz = cz ? - 1 : 1; // inward, toward the block centre

					if ( cx === cz ) signals.push( place( x + ix * 1.4, top, z + iz * 1.4, - ix, - iz ) );
					cans.push( place( x + ix * 2.2, top, z + iz * 2.2, ix, iz ) );

				}

			}

		}

		group.add( this.furniture.streetlight.build( lights ) );
		group.add( this.furniture.trafficlight.build( signals ) );
		group.add( this.furniture.trashcan.build( cans ) );
		if ( benches.length ) group.add( this.furniture.bench.build( benches ) );
		if ( hydrants.length ) group.add( this.furniture.hydrant.build( hydrants ) );
		if ( trees.length ) group.add( this.furniture.tree.build( trees ) );
		if ( people.length ) group.add( this.furniture.person.build( people ) );
		if ( cars.length ) group.add( this.furniture.car.build( cars ) );

		// the instanced furniture spans the whole city, so give each a bounding sphere
		// over its instances ( instead of the canonical model at the origin ) to cull by
		group.traverse( ( o ) => o.isInstancedMesh && o.computeBoundingSphere() );

		return group;

	}

	dispose() {

		for ( const generator of this.generators ) generator.dispose();
		this.generators.length = 0;

		this.sidewalk.dispose();

		for ( const key in this.furniture ) this.furniture[ key ].dispose();

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
	curbRadius: 5,
	sidewalkWidth: 5 // walkable strip between the street wall and the curb ( NYC ~15 ft )
};

// derives the block / street dimensions from the parameters
function cityLayout( parameters ) {

	const { street, lot, lotsX, lotsZ, blocksX, blocksZ, sidewalkWidth } = parameters;

	const blockW = lotsX * lot;
	const blockD = lotsZ * lot;

	// the lots tile the inner zone left after the sidewalk strip is taken from
	// every edge; buildings front onto its perimeter ( the building line )
	const innerLotX = ( blockW - 2 * sidewalkWidth ) / lotsX;
	const innerLotZ = ( blockD - 2 * sidewalkWidth ) / lotsZ;

	return {
		street, lot, lotsX, lotsZ, blocksX, blocksZ, blockW, blockD, sidewalkWidth, innerLotX, innerLotZ,
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

// --- furniture placement -------------------------------------------------

// the four curb edges of a block: each carries a start corner, a unit direction
// along the edge, the outward normal ( toward the road ) and a length. furniture
// walks these, insetting against the normal to sit on the sidewalk.
function blockEdges( x, z, w, d ) {

	return [
		{ x0: x, z0: z, dx: 1, dz: 0, nx: 0, nz: - 1, length: w },
		{ x0: x, z0: z + d, dx: 1, dz: 0, nx: 0, nz: 1, length: w },
		{ x0: x, z0: z, dx: 0, dz: 1, nx: - 1, nz: 0, length: d },
		{ x0: x + w, z0: z, dx: 0, dz: 1, nx: 1, nz: 0, length: d }
	];

}

const _f = /*@__PURE__*/ new Vector3();
const _r = /*@__PURE__*/ new Vector3();
const _up = /*@__PURE__*/ new Vector3( 0, 1, 0 );

// a placement matrix at ( x, y, z ) whose local +Z faces ( faceX, faceZ ) in the
// XZ plane, so a canonical model authored facing +Z turns to face that way
function place( x, y, z, faceX, faceZ ) {

	_f.set( faceX, 0, faceZ ).normalize();
	_r.crossVectors( _up, _f ).normalize();
	return new Matrix4().makeBasis( _r, _up, _f ).setPosition( x, y, z );

}

const _q = /*@__PURE__*/ new Quaternion();
const _pos = /*@__PURE__*/ new Vector3();
const _sca = /*@__PURE__*/ new Vector3();

// a placement with a free yaw and a uniform scale, so repeated instances ( trees,
// pedestrians ) read as individuals rather than copies
function placeYawScale( x, y, z, yaw, scale ) {

	_q.setFromAxisAngle( _up, yaw );
	return new Matrix4().compose( _pos.set( x, y, z ), _q, _sca.set( scale, scale, scale ) );

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
 * The per-tower flat masonry colour: one palette entry per lot, picked by hashing the
 * lot's grid cell from world position. Keyed off `positionWorld`, so it colours anything
 * standing on the city grid identically, the towers and their {@link CityGenerator#buildProxy}
 * boxes alike.
 *
 * @param {Object} layout - The city layout.
 * @param {number} [seed] - The city seed.
 * @return {Node<vec3>} The tower colour.
 */
function buildingColorNode( layout, seed = 0 ) {

	// every tower takes one flat colour, picked by hashing its lot; common tones repeat
	// so the equal-probability pick feels real
	const palette = buildingPalette.map( hex => color( hex ) );

	const periodX = layout.blockW + layout.street;
	const periodZ = layout.blockD + layout.street;
	const gx = positionWorld.x.add( layout.cityW / 2 );
	const gz = positionWorld.z.add( layout.cityD / 2 );
	const blockIX = floor( gx.div( periodX ) );
	const blockIZ = floor( gz.div( periodZ ) );
	// cells align to the inner-lot grid each tower sits in, so an inset, fronted
	// tower maps wholly to its own cell and reads as one flat colour
	const lotIX = floor( gx.sub( blockIX.mul( periodX ) ).sub( layout.sidewalkWidth ).div( layout.innerLotX ) ).clamp( 0, layout.lotsX - 1 );
	const lotIZ = floor( gz.sub( blockIZ.mul( periodZ ) ).sub( layout.sidewalkWidth ).div( layout.innerLotZ ) ).clamp( 0, layout.lotsZ - 1 );
	const cellX = blockIX.mul( layout.lotsX ).add( lotIX );
	const cellZ = blockIZ.mul( layout.lotsZ ).add( lotIZ );
	const cellKey = uint( cellX.add( 4096 ) ).mul( uint( 73856093 ) ).bitXor( uint( cellZ.add( 4096 ) ).mul( uint( 19349663 ) ) ).bitXor( uint( ( seed * 2654435761 ) >>> 0 ) ).toVar();
	const cellHash = ( a, b ) => hash( cellKey.add( uint( Math.round( ( a + b * 7 ) * 100 ) ) ) );

	const pick = cellHash( 127.1, 311.7 );
	let buildingBase = palette[ 0 ];
	for ( let i = 1; i < palette.length; i ++ ) buildingBase = mix( buildingBase, palette[ i ], step( i / palette.length, pick ) );
	buildingBase = buildingBase.mul( cellHash( 269.5, 183.3 ).mul( 0.12 ).add( 0.94 ) ); // subtle per-building brightness

	return buildingBase;

}

/**
 * The shared material every tower in a {@link CityGenerator} is dressed with: the per-lot
 * {@link buildingColorNode} resolved once per vertex on a skyscraper material.
 */
function createBuildingMaterial( layout, seed = 0 ) {

	// the pick is constant across a tower, so resolve it once per vertex ( varying )
	return createSkyscraperMaterial( varying( buildingColorNode( layout, seed ) ) );

}

/**
 * The road surface: wet asphalt with lane lines and crosswalks aligned to a
 * {@link CityGenerator} layout. Apply it to a ground plane sized to the city.
 */
function createRoadMaterial( layout ) {

	// wet asphalt: a warm-grey base in patchwork pours, two-scale aggregate
	// grit, oily wear stains and low-frequency wet patches that turn glossy and
	// mirror the sky. detail fades in as the camera nears.

	const p = positionWorld;
	const dist = p.distance( cameraPosition );
	const detail = smoothstep( 240, 25, dist );
	const microFade = smoothstep( 22, 4, dist ); // the finest grit only resolves right under the camera, so fade it out fast to avoid shimmer

	const blotch = mx_fractal_noise_float( p.mul( 0.2 ), 3 ).mul( 0.5 ).add( 0.5 );

	// close-range detail — aggregate grit, oily wear pools and worn paint — only
	// resolves near the camera, so its noise is sampled ( inside the branch ) only
	// where detail is non-zero and skipped across the far majority of the road
	const near = Fn( () => {

		const grit = float( 0 ).toVar(); // two scales of aggregate, -1..1
		const stain = float( 0 ).toVar(); // oily wear pools
		const worn = float( 1 ).toVar(); // paint rubbed thin and patchy, more so where tyres cross it
		const micro = float( 0 ).toVar(); // fine, high-frequency grain for the close-up bump

		If( detail.greaterThan( 0 ), () => {

			grit.assign( mx_noise_float( p.mul( 7 ) ).add( mx_noise_float( p.mul( 23 ) ) ).mul( 0.5 ) );
			stain.assign( smoothstep( 0.5, 0.85, mx_fractal_noise_float( p.mul( 0.45 ), 3 ).mul( 0.5 ).add( 0.5 ) ) );
			worn.assign( smoothstep( 0.25, 0.7, mx_fractal_noise_float( p.mul( 0.7 ), 3 ).mul( 0.5 ).add( 0.5 ) ).mul( 0.55 ).add( 0.35 ) );

		} );

		If( microFade.greaterThan( 0 ), () => {

			micro.assign( mx_noise_float( p.mul( 45 ) ).mul( 0.6 ).add( mx_noise_float( p.mul( 80 ) ).mul( 0.4 ) ) );

		} );

		return vec4( grit, stain, worn, micro );

	} )();

	const grit = near.x;
	const stain = near.y;
	const worn = near.z;
	const micro = near.w;

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
	const surface = mix( asphalt, asphalt.mul( 0.6 ), wet );
	material.colorNode = mix( surface, color( 0xd0ccc0 ), paint ); // worn white paint
	material.roughnessNode = mix( float( 0.95 ).sub( paint.mul( 0.2 ) ), float( 0.32 ), wet );
	material.normalNode = bumpNormal( grit.mul( 0.003 ).mul( detail ).add( micro.mul( 0.0016 ).mul( microFade ) ) ); // world units: ~3 mm aggregate, ~1.6 mm fine grain up close

	return material;

}

export { CityGenerator, createBuildingMaterial, createRoadMaterial };
