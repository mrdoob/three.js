import {
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	ExtrudeGeometry,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	LatheGeometry,
	Matrix3,
	Matrix4,
	Mesh,
	MeshStandardMaterial,
	Path,
	PlaneGeometry,
	ShapeGeometry,
	Shape,
	Sphere,
	Vector2,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, cameraPosition, color, cross, dot, float, floor, Fn, fract, fwidth, hash as ihash, mix, mod, modelWorldMatrixInverse, mx_fractal_noise_float, normalLocal, normalView, normalWorldGeometry, positionLocal, positionView, positionWorld, select, smoothstep, step, uint, uv, varying, vec2, vec3, vec4 } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';

const _scale = /*@__PURE__*/ new Vector3();
const _point = /*@__PURE__*/ new Vector3();
const _normalMatrix = /*@__PURE__*/ new Matrix3();
const _identity = /*@__PURE__*/ new Matrix4();

// material-zone codes baked per vertex into the merged geometry, so one material can
// branch on partId and shade every zone
const PartId = { WALL: 0, PIER: 1, FRAME: 2, ORNAMENT: 3, GLASS: 4, AC: 5 };
const { WALL, PIER, FRAME, ORNAMENT, GLASS, AC } = PartId;

// fraction of a floor's height taken by the glazed opening; the remainder is
// the spandrel band. shared by the window module and the spandrels so they tile.
const WINDOW_HEIGHT_RATIO = 0.62;

// width of the flat window-frame band around the glazing; shared by the frame module
// and the glass pane so the pane always tucks inside the frame
const WINDOW_BORDER = 0.1;

// the masonry course module ( brick height × length ). the generator snaps floor and
// bay dimensions to it, and the material's coursing reads the same values, so the
// procedural brickwork lines up with the geometry
const BRICK = { height: 0.3, length: 0.6 };

// merging requires all-indexed or all-non-indexed inputs; extrusions are
// non-indexed while boxes/planes are indexed, so normalize before merging

function merge( geometries ) {

	return mergeGeometries( geometries.map( ( g ) => g.index ? g.toNonIndexed() : g ) );

}

function nonIndexed( geometry ) {

	return geometry.index ? geometry.toNonIndexed() : geometry;

}

// the unit box is identical for every building's shell boxes — build it once
const _unitBox = /*@__PURE__*/ nonIndexed( new BoxGeometry( 1, 1, 1 ) );

/**
 * Bakes a list of instance groups into one non-indexed BufferGeometry. Each group is a
 * base geometry ( position + normal + uv ), an array of Matrix4 placements and a `partId`
 * written to a per-vertex attribute. Transforming straight into preallocated typed arrays
 * avoids mergeGeometries' per-instance allocations; the result is one geometry, ready for
 * a single draw call and the compute rasterizer.
 */
function bakeGroups( groups ) {

	let total = 0;
	for ( const group of groups ) total += group.geometry.attributes.position.count * group.matrices.length;

	const position = new Float32Array( total * 3 );
	const normal = new Float32Array( total * 3 );
	const uv = new Float32Array( total * 2 );
	const partId = new Float32Array( total );
	// per-window interior-mapping room ( centre + size ) the glass pane looks into; only
	// the glass group writes it, every other vertex stays zero. baked per vertex so the
	// material reads each building's own room sizes without a global uniform.
	const roomCenter = new Float32Array( total * 3 );
	const roomSize = new Float32Array( total * 2 );

	let w = 0;

	// the bounding sphere falls out of the AABB gathered while transforming, sparing a
	// second full pass over the positions ( computeBoundingSphere )
	let minX = Infinity, minY = Infinity, minZ = Infinity;
	let maxX = - Infinity, maxY = - Infinity, maxZ = - Infinity;

	for ( const group of groups ) {

		const geometry = group.geometry;
		const P = geometry.attributes.position.array;
		const N = geometry.attributes.normal.array;
		const U = geometry.attributes.uv.array;
		const count = geometry.attributes.position.count;
		const id = group.partId;
		const rooms = group.rooms; // per-instance { center, size }, glass only
		const rigid = group.rigid === true; // pure rotation ( + translation ): the normal matrix is the rotation itself

		for ( let i = 0; i < group.matrices.length; i ++ ) {

			const room = rooms ? rooms[ i ] : null;

			const matrix = group.matrices[ i ];
			const e = matrix.elements;
			const e0 = e[ 0 ], e1 = e[ 1 ], e2 = e[ 2 ], e4 = e[ 4 ], e5 = e[ 5 ], e6 = e[ 6 ], e8 = e[ 8 ], e9 = e[ 9 ], e10 = e[ 10 ], e12 = e[ 12 ], e13 = e[ 13 ], e14 = e[ 14 ];

			// for a rigid frame the inverse-transpose equals the rotation, so its columns
			// are read straight from the matrix and the per-instance 3×3 inverse is skipped
			let n0, n1, n2, n3, n4, n5, n6, n7, n8;

			if ( rigid ) {

				n0 = e0; n1 = e1; n2 = e2; n3 = e4; n4 = e5; n5 = e6; n6 = e8; n7 = e9; n8 = e10;

			} else {

				const ne = _normalMatrix.getNormalMatrix( matrix ).elements;
				n0 = ne[ 0 ]; n1 = ne[ 1 ]; n2 = ne[ 2 ]; n3 = ne[ 3 ]; n4 = ne[ 4 ]; n5 = ne[ 5 ]; n6 = ne[ 6 ]; n7 = ne[ 7 ]; n8 = ne[ 8 ];

			}

			for ( let v = 0; v < count; v ++ ) {

				const v3 = v * 3, w3 = w * 3;
				const x = P[ v3 ], y = P[ v3 + 1 ], z = P[ v3 + 2 ];
				const wx = e0 * x + e4 * y + e8 * z + e12;
				const wy = e1 * x + e5 * y + e9 * z + e13;
				const wz = e2 * x + e6 * y + e10 * z + e14;
				position[ w3 ] = wx; position[ w3 + 1 ] = wy; position[ w3 + 2 ] = wz;
				if ( wx < minX ) minX = wx; if ( wx > maxX ) maxX = wx;
				if ( wy < minY ) minY = wy; if ( wy > maxY ) maxY = wy;
				if ( wz < minZ ) minZ = wz; if ( wz > maxZ ) maxZ = wz;

				const nx = N[ v3 ], ny = N[ v3 + 1 ], nz = N[ v3 + 2 ];
				const tx = n0 * nx + n3 * ny + n6 * nz, ty = n1 * nx + n4 * ny + n7 * nz, tz = n2 * nx + n5 * ny + n8 * nz;
				const inv = 1 / ( Math.sqrt( tx * tx + ty * ty + tz * tz ) || 1 );
				normal[ w3 ] = tx * inv; normal[ w3 + 1 ] = ty * inv; normal[ w3 + 2 ] = tz * inv;

				uv[ w * 2 ] = U[ v * 2 ]; uv[ w * 2 + 1 ] = U[ v * 2 + 1 ];
				partId[ w ] = id;

				if ( room !== null ) {

					roomCenter[ w3 ] = room.center.x; roomCenter[ w3 + 1 ] = room.center.y; roomCenter[ w3 + 2 ] = room.center.z;
					roomSize[ w * 2 ] = room.size.x; roomSize[ w * 2 + 1 ] = room.size.y;

				}

				w ++;

			}

		}

	}

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new BufferAttribute( position, 3 ) );
	geometry.setAttribute( 'normal', new BufferAttribute( normal, 3 ) );
	geometry.setAttribute( 'uv', new BufferAttribute( uv, 2 ) );
	geometry.setAttribute( 'partId', new BufferAttribute( partId, 1 ) );
	geometry.setAttribute( 'roomCenter', new BufferAttribute( roomCenter, 3 ) );
	geometry.setAttribute( 'roomSize', new BufferAttribute( roomSize, 2 ) );

	geometry.boundingSphere = new Sphere(
		new Vector3( ( minX + maxX ) / 2, ( minY + maxY ) / 2, ( minZ + maxZ ) / 2 ),
		Math.hypot( maxX - minX, maxY - minY, maxZ - minZ ) / 2
	);

	return geometry;

}

// deterministic PRNG (mulberry32) so a given seed always yields the same tower

function createRandom( seed ) {

	let s = ( seed >>> 0 ) || 1;

	return function () {

		s = ( s + 0x6D2B79F5 ) | 0;
		let t = Math.imul( s ^ ( s >>> 15 ), 1 | s );
		t = ( t + Math.imul( t ^ ( t >>> 7 ), 61 | t ) ) ^ t;
		return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;

	};

}

// a stable per-floor hash ( from the floor index and the face origin ) used to pick the
// interior-mapping room module per floor without allocating a closure each floor
function floorHash( f, frame, k ) {

	const s = Math.sin( f * 12.9898 + frame.origin.x * 0.07 + frame.origin.z * 0.131 + k ) * 43758.5453;
	return s - Math.floor( s );

}

// the seed-driven "style" of a tower: footprint proportions, tier split and the
// shaping of piers and base arches. these sit between the fixed defaults and the
// caller's parameters, so any parameter passed in still overrides its seeded value.

function randomStyle( random ) {

	const base = 0.10 + random() * 0.07;
	const crown = 0.08 + random() * 0.08;

	return {
		footprint: { width: 26 + random() * 18, depth: 20 + random() * 14 },
		tierFractions: { base, crown },
		pierWidth: 0.4 + random() * 0.4,
		pierDepth: 0.3 + random() * 0.3,
		windowReveal: 0.12 + random() * 0.1,
		stringCourseHeight: 0.5 + random() * 0.5,
		archBayWidthRatio: Math.round( 1.5 + random() * 1.5 ),
		archRise: 0.4 + random() * 0.5
	};

}

/**
 * Generates intricate, tripartite "Beaux-Arts / Neo-Gothic" terracotta
 * skyscrapers from a small set of parameters.
 *
 * The mass is read as a footprint polygon (a rectangle with one chamfered
 * corner) split into vertical faces, each split into three tiers — a tall
 * arcaded base, a repeating shaft and an ornate crown — then into floors and
 * bays. A handful of authored pieces (a pier, a window, a cornice profile, a
 * gothic arch) are instanced across the whole tower, then baked — together with
 * the bespoke base arcade — into a single non-indexed BufferGeometry tagged with
 * a per-vertex `partId` ({@link PartId}) so one material can shade every zone.
 *
 * The generator is material agnostic — it only produces geometry. Pass a single
 * material (e.g. a TSL node material that branches on `partId`) to dress it.
 *
 * ```js
 * const generator = new SkyscraperGenerator( { seed: 35, totalHeight: 140 }, material );
 * scene.add( generator.build() ); // a single Mesh
 * ```
 */
class SkyscraperGenerator {

	constructor( parameters = {}, material = null ) {

		this.parameters = parameters; // caller overrides; defaults + seed fill the rest at build time
		this.material = material; // a single material; the look is driven by the baked `partId` attribute

		this.mesh = null;

	}

	setParameters( parameters ) {

		Object.assign( this.parameters, parameters );

		return this;

	}

	build() {

		const random = createRandom( this.parameters.seed ?? SkyscraperGenerator.defaults.seed );

		// precedence: fixed defaults < seed-driven style < caller parameters

		const p = Object.assign( {}, SkyscraperGenerator.defaults, randomStyle( random ), this.parameters );

		// snap the masonry-driving dimensions to the brick module so the procedural
		// brickwork ( courses up local Y, columns along each face ) lines up with the
		// geometry: a whole number of courses per floor and bricks per bay
		const vModule = BRICK.height * 2; // a course pair, so floor / window halves still land on a joint
		p.floorHeight = Math.max( vModule * 3, Math.round( p.floorHeight / vModule ) * vModule );
		p.windowHeight = Math.round( p.floorHeight * WINDOW_HEIGHT_RATIO / vModule ) * vModule;
		p.bayWidth = Math.max( BRICK.length * 3, Math.round( p.bayWidth / BRICK.length ) * BRICK.length );
		p.pierWidth = Math.max( BRICK.length, Math.round( p.pierWidth / BRICK.length ) * BRICK.length );

		// vertical layout: base / shaft / crown as whole floor counts, so every floor
		// line sits on a course ( the requested total height is rounded to suit )
		const floors = Math.max( 3, Math.round( p.totalHeight / p.floorHeight ) );
		const baseFloors = Math.max( 1, Math.round( floors * p.tierFractions.base ) );
		const crownFloors = Math.max( 1, Math.round( floors * p.tierFractions.crown ) );
		const shaftFloors = Math.max( 1, floors - baseFloors - crownFloors );

		const baseHeight = baseFloors * p.floorHeight;
		const crownHeight = crownFloors * p.floorHeight;
		const shaftHeight = shaftFloors * p.floorHeight;
		p.totalHeight = baseHeight + shaftHeight + crownHeight;

		const baseTop = baseHeight;
		const shaftTop = baseHeight + shaftHeight;

		// one accumulator per kind of part, mostly instance matrices. kept separate so the
		// bake below can order them by draw order ( which controls overdraw ), not build order.

		const windows = [];
		const glass = [];
		const glassRooms = []; // per-glass interior-mapping room ( centre + size ), aligned with `glass`
		const backWalls = []; // the thin wall closing the volume behind the glass
		const bands = []; // spandrel bands, one at each floor line
		const piers = new Map(); // pier height -> matrices, so each tier's continuous piers share one geometry
		const trim = []; // cornices and parapets ( axis-aligned unit boxes )
		const acUnits = []; // window air-conditioner boxes on a random subset of shaft windows
		const finials = []; // pinnacles along the crown
		const extras = []; // bespoke geometry: the base arcade and the setback / roof slabs

		const addPier = ( frame, u, vBottom, height ) => {

			const key = Math.round( height * 1000 ); // bucket equal pier heights ( a number key, no string )
			if ( piers.has( key ) === false ) piers.set( key, [] );
			piers.get( key ).push( frame.matrix( u, vBottom, 0 ) );

		};

		// footprints: full mass, and the inset crown after the setback

		const footprint = buildFootprint( p.footprint.width, p.footprint.depth, p.chamferWidth, p.chamferCornerX, p.chamferCornerZ );
		const faces = buildFaces( footprint );

		const inset = p.setbackDepth * p.bayWidth;
		const crownFootprint = buildFootprint(
			Math.max( p.bayWidth * 2, p.footprint.width - inset * 2 ),
			Math.max( p.bayWidth * 2, p.footprint.depth - inset * 2 ),
			Math.max( 0, p.chamferWidth - inset ),
			p.chamferCornerX,
			p.chamferCornerZ
		);
		const crownFaces = buildFaces( crownFootprint );

		// --- generate the parts -----------------------------------------------

		const crownCornice = p.stringCourseHeight * 1.6; // the crown's heavy cap; its piers stop below it

		// shaft and crown are the same facade over different faces, spans and pier heights
		const tiers = [
			{ faces, bottom: baseTop, height: shaftHeight, pierHeight: shaftHeight, ac: acUnits },
			{ faces: crownFaces, bottom: shaftTop, height: crownHeight, pierHeight: crownHeight - crownCornice, ac: null }
		];

		for ( const t of tiers ) {

			for ( const frame of t.faces ) {

				addWindows( frame, windows, glass, glassRooms, t.ac, t.bottom, t.height, p );
				addWall( backWalls, frame, t.bottom, t.bottom + t.height, 0.8, - 0.6 );
				addSpandrelBands( bands, frame, t.bottom, t.height, p );
				addPiers( frame, t.bottom, t.pierHeight, p, addPier );

			}

		}

		// the base: a gothic arcade, capped by a string course
		for ( const frame of faces ) {

			addArcade( extras, frame, baseHeight, p );
			addCornice( trim, frame, baseTop - p.stringCourseHeight, p.stringCourseHeight, 0.5 );

		}

		// periodic string courses banding the shaft
		if ( p.stringCourseEvery > 0 ) {

			for ( let f = p.stringCourseEvery; f < shaftFloors; f += p.stringCourseEvery ) {

				for ( const frame of faces ) addCornice( trim, frame, baseTop + f * p.floorHeight - p.stringCourseHeight * 0.5, p.stringCourseHeight, 0.3 );

			}

		}

		// the crown's heavy cornice, its parapet and the finials along the top
		for ( const frame of crownFaces ) {

			addCornice( trim, frame, p.totalHeight - crownCornice, crownCornice, 0.9 );
			addParapet( trim, frame, p.totalHeight, p );
			addFinials( frame, finials, shaftTop, crownHeight, p );

		}

		// thin slabs capping the setback ledge and the roof
		extras.push( slab( footprint, shaftTop, 0.6 ) );
		extras.push( slab( crownFootprint, p.totalHeight, 0.6 ) );

		// --- bake every part into one geometry ---------------------------------

		// one mesh = one draw the renderer can't sort, so bake order is draw order: the
		// facade front-to-back, the backing wall last so its hidden fragments never shade.

		const groups = [
			{ geometry: buildWindowGeometry( p ), matrices: windows, partId: FRAME, rigid: true },
			{ geometry: nonIndexed( buildGlassGeometry( p ) ), matrices: glass, partId: GLASS, rooms: glassRooms, rigid: true },
			{ geometry: _unitBox, matrices: bands, partId: WALL }
		];

		for ( const [ key, matrices ] of piers ) groups.push( { geometry: buildPierGeometry( p, key / 1000 ), matrices, partId: PIER, rigid: true } );

		groups.push( { geometry: _unitBox, matrices: trim, partId: WALL } ); // cornices, parapets
		groups.push( { geometry: _unitBox, matrices: acUnits, partId: AC } );
		groups.push( { geometry: nonIndexed( buildFinialGeometry( p ) ), matrices: finials, partId: ORNAMENT, rigid: true } );

		for ( const geometry of extras ) groups.push( { geometry: nonIndexed( geometry ), matrices: [ _identity ], partId: WALL, rigid: true } ); // base arcade + slabs, in building-local space

		groups.push( { geometry: _unitBox, matrices: backWalls, partId: WALL } ); // last — hidden behind the facade

		const geometry = bakeGroups( groups );

		const mesh = new Mesh( geometry, this.material || new MeshStandardMaterial( { color: 0xddccaa, roughness: 0.9 } ) );
		mesh.name = 'Skyscraper';

		this.dispose();
		this.mesh = mesh;

		return mesh;

	}

	rebuild() {

		return this.build();

	}

	dispose() {

		if ( this.mesh === null ) return;

		this.mesh.geometry.dispose();
		this.mesh = null;

	}

}

// fixed baseline. the remaining parameters (footprint, tierFractions, pierWidth,
// pierDepth, windowReveal, stringCourseHeight, archBayWidthRatio, archRise) are
// derived from the seed by randomStyle() unless the caller provides them.
SkyscraperGenerator.defaults = {
	seed: 35,
	totalHeight: 140,
	floorHeight: 4,
	bayWidth: 2.6,
	stringCourseEvery: 6,
	chamferWidth: 4,
	chamferCornerX: 1,
	chamferCornerZ: 1,
	setbackDepth: 1.5,
	acChance: 0.12
};

// --- footprint & faces ---------------------------------------------------

/**
 * A rectangle (centred at the origin in the XZ plane) with one corner cut at
 * 45 degrees, returned as an ordered list of `Vector2( x, z )`. `cornerX` /
 * `cornerZ` ( each ±1 ) pick which corner is cut, so the chamfer can be aimed
 * outward to a block corner.
 */
function buildFootprint( width, depth, chamfer, cornerX = 1, cornerZ = 1 ) {

	const hw = width / 2;
	const hd = depth / 2;
	const c = Math.min( chamfer, hw, hd );

	// the four corners, counter-clockwise
	const corners = [
		new Vector2( hw, hd ),
		new Vector2( - hw, hd ),
		new Vector2( - hw, - hd ),
		new Vector2( hw, - hd )
	];

	const points = [];

	for ( let i = 0; i < corners.length; i ++ ) {

		const corner = corners[ i ];

		// cut the requested corner: replace it with two points pulled back along
		// each adjacent edge, leaving a 45° face that points out to that corner
		if ( c > 0 && Math.sign( corner.x ) === cornerX && Math.sign( corner.y ) === cornerZ ) {

			const prev = corners[ ( i + 3 ) % 4 ];
			const next = corners[ ( i + 1 ) % 4 ];
			points.push( corner.clone().lerp( prev, c / corner.distanceTo( prev ) ) );
			points.push( corner.clone().lerp( next, c / corner.distanceTo( next ) ) );

		} else {

			points.push( corner.clone() );

		}

	}

	return points;

}

/**
 * Builds a face frame per footprint edge. Each frame is an orthonormal basis
 * ( u along the edge, v up, n outward ) plus an origin and length, so all
 * facade layout can happen in flat ( u, v ) space and bake to world with one
 * matrix — the same authored piece then instances onto every face, including
 * the diagonal chamfer.
 */
function buildFaces( points ) {

	const faces = [];
	const up = new Vector3( 0, 1, 0 );

	for ( let i = 0; i < points.length; i ++ ) {

		const a = points[ i ];
		const b = points[ ( i + 1 ) % points.length ];

		// outward normal: perpendicular to the edge, pointing away from the
		// origin (the footprint is centred there)

		const n = new Vector3( b.y - a.y, 0, - ( b.x - a.x ) ).normalize();
		const mid = new Vector3( ( a.x + b.x ) / 2, 0, ( a.y + b.y ) / 2 );
		if ( n.dot( mid ) < 0 ) n.negate();

		// right-handed basis: u = v × n, so makeBasis( u, v, n ) is a pure rotation

		const u = new Vector3().crossVectors( up, n ).normalize();

		const pa = new Vector3( a.x, 0, a.y );
		const pb = new Vector3( b.x, 0, b.y );
		const length = pa.distanceTo( pb );

		// the edge end that u points away from becomes the origin

		const origin = pb.clone().sub( pa ).dot( u ) > 0 ? pa : pb;

		faces.push( new FaceFrame( origin, u, up.clone(), n, length ) );

	}

	return faces;

}

/** A face's local ( u along edge, v up, n outward ) frame in world space. */
class FaceFrame {

	constructor( origin, u, v, n, length ) {

		this.origin = origin;
		this.u = u;
		this.v = v;
		this.n = n;
		this.length = length;

	}

	point( u, v, w, target = new Vector3() ) {

		return target
			.copy( this.origin )
			.addScaledVector( this.u, u )
			.addScaledVector( this.v, v )
			.addScaledVector( this.n, w );

	}

	/** Places a piece authored in the canonical local frame ( x across, y up, z outward ). */
	matrix( u, v, w ) {

		return new Matrix4()
			.makeBasis( this.u, this.v, this.n )
			.setPosition( this.point( u, v, w, _point ) );

	}

	/** How many bays of `bayWidth` fit, with the remainder split into end margins. */
	bays( bayWidth ) {

		const count = Math.max( 1, Math.floor( this.length / bayWidth ) );
		const margin = ( this.length - count * bayWidth ) / 2;

		return { count, margin, width: bayWidth };

	}

}

// --- shell pieces --------------------------------------------------------

// a Matrix4 mapping the shared unit box ( 1×1×1, centred ) onto a face-aligned
// box of the given size, centred at the given face-local point. these matrices
// are what the shell InstancedMesh is built from.
function boxMatrix( frame, u, v, w, sizeU, sizeV, sizeN ) {

	return new Matrix4()
		.makeBasis( frame.u, frame.v, frame.n )
		.scale( _scale.set( sizeU, sizeV, sizeN ) )
		.setPosition( frame.point( u, v, w, _point ) );

}

function addWall( target, frame, vBottom, vTop, thickness = 0.8, front = 0 ) {

	const h = vTop - vBottom;
	target.push( boxMatrix( frame, frame.length / 2, vBottom + h / 2, front - thickness / 2, frame.length + thickness * 2, h, thickness ) );

}

/**
 * Horizontal terracotta bands at every floor line. Together with the projecting
 * piers they form the facade grid; the gaps between them are the window
 * openings, with glass set behind.
 */
function addSpandrelBands( target, frame, vBottom, height, p ) {

	const floors = Math.max( 1, Math.round( height / p.floorHeight ) );
	const fh = height / floors;
	const bandHeight = p.floorHeight - p.windowHeight; // whole courses: floor minus the glazed opening

	// pull the ends in by the band depth so a band doesn't poke its end-cap
	// into the plane of the perpendicular face at the corners ( overdraw )
	const bandLength = Math.max( 0.2, frame.length - 0.6 );

	for ( let f = 0; f <= floors; f ++ ) {

		// front flush at w = 0, meeting the backing wall behind
		target.push( boxMatrix( frame, frame.length / 2, vBottom + f * fh, - 0.3, bandLength, bandHeight, 0.6 ) );

	}

}

/**
 * A thin horizontal cap over a footprint's bounding box at height `y`. Its
 * sides are pulled in behind the facade plane ( into the backing-wall shell )
 * so they never sit coplanar with the walls, spandrels or piers and z-fight.
 */
function slab( footprint, y, thickness ) {

	// a thin cap following the footprint OUTLINE ( so the chamfered corner is cut, not
	// left overhanging as a rectangular box ), inset a little so its edge tucks just
	// behind the facade and the wall top reads as a lip around it

	const inset = 0.8;
	let cx = 0, cz = 0;
	for ( const p of footprint ) {

		cx += p.x; cz += p.y;

	}

	cx /= footprint.length; cz /= footprint.length;

	// consistent ( CCW ) winding so the extrude caps face up / down correctly
	let area = 0;
	for ( let i = 0; i < footprint.length; i ++ ) {

		const a = footprint[ i ], b = footprint[ ( i + 1 ) % footprint.length ];
		area += a.x * b.y - b.x * a.y;

	}

	const pts = area < 0 ? footprint.slice().reverse() : footprint;

	const shape = new Shape();
	pts.forEach( ( p, i ) => {

		const dx = cx - p.x, dz = cz - p.y;
		const d = Math.hypot( dx, dz ) || 1;
		const x = p.x + dx / d * inset;
		const z = p.y + dz / d * inset;
		if ( i === 0 ) shape.moveTo( x, z ); else shape.lineTo( x, z );

	} );

	// extrude the XZ outline downward by the thickness, the top dropped just below height y:
	// the inset cap would otherwise sit coplanar with the surrounding wall top faces and
	// z-fight, and the parapet / spandrel bands around the edge hide the shallow recess
	const drop = 0.2;
	const geometry = new ExtrudeGeometry( shape, { depth: thickness, bevelEnabled: false } );
	geometry.rotateX( Math.PI / 2 );
	geometry.translate( 0, y - drop, 0 );
	return geometry;

}

/** A two-step projecting cornice / string-course band wrapping a face. */
function addCornice( target, frame, vBottom, height, depth ) {

	target.push( boxMatrix( frame, frame.length / 2, vBottom + height * 0.275, depth / 2, frame.length, height * 0.55, depth ) );
	target.push( boxMatrix( frame, frame.length / 2, vBottom + height * 0.775, depth * 0.85, frame.length, height * 0.45, depth * 1.7 ) );

}

/** A low parapet wall capping the crown. */
function addParapet( target, frame, vTop, p ) {

	const height = 1.4;
	target.push( boxMatrix( frame, frame.length / 2, vTop + height / 2, p.pierDepth * 0.4, frame.length, height, p.pierDepth * 0.8 ) );

}

/**
 * The base storey: a wall pierced by tall pointed-arch openings, extruded with
 * thickness so the openings read as deep recesses.
 */
function addArcade( target, frame, height, p ) {

	const archWidth = p.bayWidth * p.archBayWidthRatio;
	const { count, margin } = frame.bays( archWidth );

	const sill = height * 0.04;
	const spring = height * 0.55;
	const apex = Math.min( height * 0.96, spring + ( archWidth / 2 ) * ( 0.8 + p.archRise ) );

	const shape = new Shape();
	shape.moveTo( 0, 0 );
	shape.lineTo( frame.length, 0 );
	shape.lineTo( frame.length, height );
	shape.lineTo( 0, height );
	shape.lineTo( 0, 0 );

	for ( let i = 0; i < count; i ++ ) {

		const cx = margin + ( i + 0.5 ) * archWidth;
		const hw = archWidth * 0.34;

		const hole = new Path();
		hole.moveTo( cx - hw, sill );
		hole.lineTo( cx - hw, spring );
		hole.quadraticCurveTo( cx - hw, apex, cx, apex );
		hole.quadraticCurveTo( cx + hw, apex, cx + hw, spring );
		hole.lineTo( cx + hw, sill );
		hole.lineTo( cx - hw, sill );
		shape.holes.push( hole );

	}

	const thickness = 1.1;
	const geometry = new ExtrudeGeometry( shape, { depth: thickness, bevelEnabled: false, curveSegments: 8 } );
	geometry.translate( 0, 0, - thickness );
	geometry.applyMatrix4( frame.matrix( 0, 0, 0 ) );

	target.push( geometry );

	// a dark plane set behind the openings so the recesses read

	const back = new PlaneGeometry( frame.length, height );
	back.applyMatrix4( frame.matrix( frame.length / 2, height / 2, - thickness - 0.4 ) );
	target.push( back );

}

// --- repeating field -----------------------------------------------------

function addPiers( frame, vBottom, height, p, addPier ) {

	const { count, margin, width } = frame.bays( p.bayWidth );

	// a pier on every bay edge except the far end: that corner is shared with
	// the next face, which places its own pier there, so emitting both would
	// stack two piers at each corner

	for ( let i = 0; i < count; i ++ ) {

		addPier( frame, margin + i * width, vBottom, height );

	}

}

function addWindows( frame, windows, glass, glassRooms, acUnits, vBottom, height, p ) {

	const { count, margin, width } = frame.bays( p.bayWidth );
	const floors = Math.max( 1, Math.round( height / p.floorHeight ) );
	const fh = height / floors;

	// a window AC unit sitting on the sill, protruding from the facade. about half the window
	// width, capped at a real unit's size ( ~0.66 m ) and kept wider than tall, sticking out
	// about half its width
	const acW = Math.min( ( p.bayWidth - p.pierWidth ) * 0.55, 0.66 );
	const acH = acW * 0.6;
	const acD = acW * 0.5;
	const acV = - p.windowHeight / 2 + acH / 2 + WINDOW_BORDER; // bottom rests on the sill ( the top of the window's bottom frame rail )

	// a real ~0.66 m unit looks lost in a wide opening, so only fit ACs where it still spans a
	// fair share of the window — in practice, the narrower ( older-style ) windows
	const acFits = acW >= ( width - p.pierWidth ) * 0.34;

	for ( let f = 0; f < floors; f ++ ) {

		const cy = vBottom + ( f + 0.5 ) * fh;

		// the interior-mapping room module: one floor tall, a run of two or three bays
		// wide, chosen per floor so neighbouring windows share an interior. the choice
		// is deterministic ( seeded by the floor and the face ) so it is stable, and the
		// run is recorded per window so the material can ray-march the right box.
		const roomBays = floorHash( f, frame, 0 ) > 0.5 ? 3 : 2;
		const roomPhase = Math.floor( floorHash( f, frame, 1 ) * roomBays );

		for ( let b = 0; b < count; b ++ ) {

			const cx = margin + ( b + 0.5 ) * width;

			windows.push( frame.matrix( cx, cy, 0 ) );
			glass.push( frame.matrix( cx, cy, - p.windowReveal ) );

			// the run of bays this window's room spans, clamped at the face ends, recorded
			// as the room's centre on the facade and its width × height in metres
			const room = Math.floor( ( b + roomPhase ) / roomBays );
			const bStart = Math.max( 0, room * roomBays - roomPhase );
			const bEnd = Math.min( count, ( room + 1 ) * roomBays - roomPhase );
			const span = bEnd - bStart;
			glassRooms.push( { center: frame.point( margin + ( bStart + span / 2 ) * width, cy, - p.windowReveal ), size: new Vector2( span * width, fh - 1 ) } ); // centred on the glass plane, so the interior is anchored to the pane it is drawn on

			if ( acUnits && acFits ) {

				// deterministic per-window hash ( varies per face via the frame origin )
				const r = Math.sin( f * 41.3 + b * 12.7 + frame.origin.x * 0.13 + frame.origin.z * 0.31 ) * 43758.5453;
				// the back tucks into the window reveal ( just in front of the glass ) so the unit sits
				// in the opening instead of floating on the facade
				const acW0 = acD / 2 - p.windowReveal + 0.04;
				if ( r - Math.floor( r ) < p.acChance ) acUnits.push( boxMatrix( frame, cx, cy + acV, acW0, acW, acH, acD ) );

			}

		}

	}

}

function addFinials( frame, finials, vBottom, height, p ) {

	const { count, margin, width } = frame.bays( p.bayWidth );
	const top = vBottom + height;

	// skip the far-end bay edge: it is the shared corner the next face also
	// caps, so emitting both would stack two finials at each corner

	for ( let i = 0; i < count; i ++ ) {

		finials.push( new Matrix4().setPosition( frame.point( margin + i * width, top, p.pierDepth * 0.5, _point ) ) );

	}

}

// --- authored modules ----------------------------------------------------

function buildPierGeometry( p, height ) {

	// a wide pier with a slimmer pilaster raised on its face, giving the
	// continuous vertical rib a stepped, terracotta profile

	const back = new BoxGeometry( p.pierWidth, height, p.pierDepth * 0.6 );
	back.translate( 0, height / 2, p.pierDepth * 0.3 );

	// the pilaster stops just short of the pier top so that where a pier is left
	// exposed ( at a setback ) the cap reads as one clean block rather than the
	// back box and the pilaster stacked into a T
	const pilasterHeight = Math.max( 1, height - 0.6 );
	const front = new BoxGeometry( p.pierWidth * 0.55, pilasterHeight, p.pierDepth * 0.45 );
	front.translate( 0, pilasterHeight / 2, p.pierDepth * 0.6 + p.pierDepth * 0.225 );

	return merge( [ back, front ] );

}

function buildWindowGeometry( p ) {

	// the flat frame face ( a rectangle with the glazing hole ), the four reveal walls
	// of the opening and the glazing bars, merged into one instanced module. a full
	// extrusion would also emit a hidden back cap and outer side walls; windows are by
	// far the heaviest part of a building, so those are skipped.

	const w = p.bayWidth - p.pierWidth;
	const h = p.windowHeight;
	const border = WINDOW_BORDER;
	const depth = p.windowReveal; // reveal walls run all the way back to the glass ( placed at -windowReveal ), so no gap opens between them and the pane
	const iw = w / 2 - border;
	const ih = h / 2 - border;

	const shape = new Shape();
	shape.moveTo( - w / 2, - h / 2 );
	shape.lineTo( w / 2, - h / 2 );
	shape.lineTo( w / 2, h / 2 );
	shape.lineTo( - w / 2, h / 2 );
	shape.lineTo( - w / 2, - h / 2 );

	const hole = new Path();
	hole.moveTo( - iw, - ih );
	hole.lineTo( - iw, ih );
	hole.lineTo( iw, ih );
	hole.lineTo( iw, - ih );
	hole.lineTo( - iw, - ih );
	shape.holes.push( hole );

	const front = new ShapeGeometry( shape ); // visible frame face, flush with the facade

	// the four reveal walls of the opening, set back to the glazing
	const wall = ( x, y, rx, ry, sw, sh ) => {

		const pl = new PlaneGeometry( sw, sh );
		pl.rotateX( rx );
		pl.rotateY( ry );
		pl.translate( x, y, - depth / 2 );
		return pl;

	};

	const left = wall( - iw, 0, 0, Math.PI / 2, depth, ih * 2 );
	const right = wall( iw, 0, 0, - Math.PI / 2, depth, ih * 2 );
	const sill = wall( 0, - ih, - Math.PI / 2, 0, iw * 2, depth );
	const head = wall( 0, ih, Math.PI / 2, 0, iw * 2, depth );

	// a single horizontal glazing bar ( transom ), flat, just in front of the glass —
	// a thin box would triple the window's triangle count for sub-pixel thickness
	const transom = new PlaneGeometry( iw * 2, 0.05 );
	transom.translate( 0, h * 0.04, - depth + 0.02 ); // meeting rail, just above centre

	return merge( [ front, left, right, sill, head, transom ] );

}

function buildGlassGeometry( p ) {

	const w = p.bayWidth - p.pierWidth - WINDOW_BORDER * 2;
	const h = p.windowHeight - WINDOW_BORDER * 2;

	return new PlaneGeometry( w, h );

}

function buildFinialGeometry( p ) {

	// a tapering pinnacle revolved around its axis

	const s = p.pierWidth;
	const profile = [
		new Vector2( 0.0, 0 ),
		new Vector2( s * 0.9, 0 ),
		new Vector2( s * 0.9, s * 0.4 ),
		new Vector2( s * 0.55, s * 1.0 ),
		new Vector2( 0.0, s * 3.2 )
	];

	return new LatheGeometry( profile, 8 ); // round enough to read as a smooth pinnacle, still light

}

// --- material ------------------------------------------------------------

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

// interior mapping: fakes a furnished room behind each glass pane in the fragment
// shader — no geometry, no texture. every pane carries the room it looks into ( centre +
// size, baked per window by addWindows ), so neighbouring panes share one interior. the
// view ray is cast into that box and the walls, floor, ceiling and a few furniture pieces
// it meets are shaded procedurally, keyed off a per-room hash. returns vec4( colour, lit ).
const interior = /*@__PURE__*/ Fn( () => {

	// flat so floor() below can't split one pane across two cell ids ( centre is per-room )
	const roomCenter = varying( attribute( 'roomCenter', 'vec3' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const roomSize = attribute( 'roomSize', 'vec2' );

	// a per-face frame from the geometry normal ( holds on every facade, including the
	// 45° chamfer ): u runs across the face, v is up, n points outward
	const n = normalLocal;
	const up = vec3( 0, 1, 0 );
	const uAxis = cross( up, n ).normalize();

	// this pixel and the view ray, in the room's ( across, up, depth ) frame; depth
	// runs into the wall, so the ray's depth component is positive
	const d = positionLocal.sub( roomCenter );
	const camLocal = modelWorldMatrixInverse.mul( vec4( cameraPosition, 1 ) ).xyz;
	const rayLocal = positionLocal.sub( camLocal ).normalize();
	const origin = vec3( dot( d, uAxis ), d.y, 0 );
	const dir = vec3( dot( rayLocal, uAxis ), rayLocal.y, dot( rayLocal, n ).negate() );

	// the room box: the pane-wide × ceiling-height front rectangle ( centred on the pane ),
	// set back behind the glass and run a little deeper than it is tall. shade the far
	// side the ray exits ( slab method: nearest of the three far-plane crossings;
	// dividing by a near-zero direction gives ±inf, which min() harmlessly drops ).
	const setback = float( 0.1 ); // the room starts just behind the glass, so it sits flush in the frame opening
	const boxMax = vec3( roomSize.x.mul( 0.5 ), roomSize.y.mul( 0.5 ), setback.add( roomSize.y.mul( 1.55 ) ) );
	const boxMin = vec3( boxMax.x.negate(), boxMax.y.negate(), setback );
	const tFar = boxMin.sub( origin ).div( dir ).max( boxMax.sub( origin ).div( dir ) );
	const t = tFar.x.min( tFar.y ).min( tFar.z );
	const hit = origin.add( dir.mul( t ) );
	const q = hit.sub( boxMin ).div( boxMax.sub( boxMin ) ); // 0..1 inside the room

	const onBack = q.z.greaterThan( 0.998 );
	const onCeil = q.y.greaterThan( 0.998 );
	const onFloor = q.y.lessThan( 0.002 );

	// per-room key for a portable integer hash — fract( sin() ) isn't bit-exact across drivers
	const cell = floor( roomCenter.mul( 2.0 ) ); // + offset before the u32 cast keeps it non-negative
	const ckey = uint( cell.x.add( 1 << 21 ) ).mul( uint( 73856093 ) )
		.bitXor( uint( cell.y.add( 1 << 21 ) ).mul( uint( 19349663 ) ) )
		.bitXor( uint( cell.z.add( 1 << 21 ) ).mul( uint( 83492791 ) ) ).toVar();
	const hash = ( kx, ky, kz ) => ihash( ckey.add( uint( Math.round( ( kx + ky * 7 + kz * 13 ) * 100 ) ) ) );
	const seed = hash( 12.9898, 78.233, 37.719 );
	const seed2 = hash( 39.346, 11.135, 83.155 );
	const lit = step( 0.8, hash( 63.21, 9.17, 51.43 ) ); // ~20% of rooms have the lights on; the rest sit dark

	// each room's bulb colour. most run warm, drifting from a dim amber ( ~2400K ) up to a
	// warm white ( ~3200K ); a minority run cool, from a fluorescent / LED daylight to a TV's
	// bluer glow — so a lit facade reads as a spread of bulb temperatures, not one flat tint
	const warmLight = mix( color( 0xffb845 ), color( 0xffe49c ), hash( 27.1, 4.9, 61.7 ) );
	const coolLight = mix( color( 0xdfe8ff ), color( 0x9fb6ff ), hash( 8.3, 51.2, 17.6 ) );
	const lightCol = select( hash( 44.7, 19.3, 6.1 ).greaterThan( 0.88 ), coolLight, warmLight ); // ~12% of lit rooms run cool

	// depth falloff ( darker toward the back ), and a panel mask on a face given its
	// two 0..1 coordinates — used for the flat fittings below
	const depth = roomSize.y.mul( 1.55 );
	const falloffAt = ( z ) => mix( float( 1.0 ), float( 0.42 ), z.sub( setback ).div( depth ).clamp( 0, 1 ) );
	const rect = ( ax, ay, cx, cy, hw, hh ) => smoothstep( hw + 0.006, hw - 0.006, ax.sub( cx ).abs() ).mul( smoothstep( hh + 0.006, hh - 0.006, ay.sub( cy ).abs() ) );

	// --- the room shell: walls, floor, ceiling, back wall, with flat fittings ----

	// muted plaster, picked per room, with a darker skirting board along the wall foot
	let wall = mix( color( 0x9a8b73 ), color( 0x6f7a82 ), seed );
	wall = mix( wall, color( 0xb9ad97 ), seed2.mul( 0.6 ) );
	const wallCol = mix( wall, wall.mul( 0.5 ), smoothstep( 0.05, 0.04, q.y ) );

	// floorboards with a thin seam every few, and a centred rug
	const seam = step( 0.94, fract( q.x.mul( 6 ) ) );
	const boards = mix( color( 0x4a3320 ), color( 0x6a4c30 ), seed ).mul( seam.mul( 0.3 ).oneMinus() );
	const rug = mix( color( 0x7a3b32 ), color( 0x3a5760 ), seed2 );
	const floorCol = mix( boards, rug, rect( q.x, q.z, 0.5, 0.62, 0.3, 0.26 ).mul( 0.9 ) );

	// ceiling, lighter than the walls, with a round overhead light in the middle; in a
	// lit room the fixture reads bright and glows ( the material's emissive = colour × lit )
	const lamp = smoothstep( 0.16, 0.13, vec2( q.x.sub( 0.5 ), q.z.sub( 0.5 ) ).length() );
	const ceilCol = mix( mix( wall, color( 0xffffff ), 0.5 ), lightCol.mul( mix( float( 1.0 ), float( 4.5 ), lit ) ), lamp );

	// back wall: a panelled door to one side, and a framed picture kept on the
	// opposite half of the wall so it never lands on the door
	const doorX = mix( float( 0.22 ), float( 0.78 ), seed );
	const door = mix( color( 0x5a4631 ), color( 0x39383c ), step( 0.5, seed2 ) );
	const picX = select( doorX.lessThan( 0.5 ), mix( float( 0.68 ), float( 0.82 ), seed2 ), mix( float( 0.18 ), float( 0.32 ), seed2 ) );
	const picCol = mix( color( 0x2c3a4a ), color( 0x7a5a3a ), hash( 5.1, 9.2, 3.3 ) );
	let backCol = mix( wallCol, door, rect( q.x, q.y, doorX, 0.33, 0.085, 0.35 ) );
	backCol = mix( backCol, color( 0x141210 ), rect( q.x, q.y, picX, 0.56, 0.075, 0.085 ) ); // dark frame
	backCol = mix( backCol, picCol, rect( q.x, q.y, picX, 0.56, 0.055, 0.065 ) ); // the picture

	const shellCol = select( onBack, backCol, select( onCeil, ceilCol, select( onFloor, floorCol, wallCol ) ) );

	// fake ambient occlusion: darken the hit toward the room's edges ( where two surfaces
	// meet ), so the box reads with soft corner shading instead of flat-lit walls. the two
	// in-plane axes depend on which face the ray exits through ( q is 0..1 inside the room ).
	const aoBand = 0.15;
	const aoEdge = ( a ) => smoothstep( 0, aoBand, a ).mul( smoothstep( 0, aoBand, a.oneMinus() ) );
	const edgeAO = select( onBack, aoEdge( q.x ).mul( aoEdge( q.y ) ), select( onFloor.or( onCeil ), aoEdge( q.x ).mul( aoEdge( q.z ) ), aoEdge( q.y ).mul( aoEdge( q.z ) ) ) );
	const shellAO = mix( float( 0.72 ), float( 1.0 ), edgeAO );

	// --- nearest surface: the shell, then any furniture block that lies closer ----
	// each block is a solid axis-aligned box in room space; boxHit returns its near
	// face. consider() keeps whichever surface the ray meets first.
	let bestT = t;
	let bestCol = shellCol.mul( shellAO ).mul( falloffAt( hit.z ) );
	let bestEmit = float( 1 ); // per-hit emissive weight: shell and fittings emit fully, curtains far less

	const boxHit = ( bMin, bMax ) => {

		const ta = bMin.sub( origin ).div( dir );
		const tb = bMax.sub( origin ).div( dir );
		const lo = ta.min( tb ), hi = ta.max( tb );
		const tN = lo.x.max( lo.y ).max( lo.z );
		const p = origin.add( dir.mul( tN ) );
		return { tN, p, hit: hi.x.min( hi.y ).min( hi.z ).greaterThan( tN ).and( tN.greaterThan( 0 ) ), qb: p.sub( bMin ).div( bMax.sub( bMin ) ) };

	};

	const consider = ( h, tN, c, emit = 1 ) => {

		const near = h.and( tN.lessThan( bestT ) ); bestCol = select( near, c, bestCol ); bestEmit = select( near, float( emit ), bestEmit ); bestT = select( near, tN, bestT );

	};

	const halfU = boxMax.x, floorY = boxMin.y, ceilY = boxMax.y, backZ = boxMax.z;
	const midZ = setback.add( depth.mul( 0.5 ) ); // room centre, in depth

	// a low table near the middle of the room ( its top catches the light )
	const tCx = mix( float( - 0.6 ), float( 0.6 ), seed );
	const tCz = midZ.add( mix( float( - 0.4 ), float( 0.5 ), seed2 ) );
	const tbl = boxHit( vec3( tCx.sub( 0.6 ), floorY, tCz.sub( 0.35 ) ), vec3( tCx.add( 0.6 ), floorY.add( 0.42 ), tCz.add( 0.35 ) ) );
	const tblCol = mix( color( 0x4a3526 ), color( 0x6b4a30 ), seed2 ).mul( select( tbl.qb.y.greaterThan( 0.94 ), float( 1.25 ), float( 0.8 ) ) );
	consider( tbl.hit, tbl.tN, tblCol.mul( falloffAt( tbl.p.z ) ) );

	// a wide low sofa against the back wall, facing the window
	const sofaCx = mix( halfU.mul( - 0.3 ), halfU.mul( 0.3 ), seed2 );
	const sofa = boxHit( vec3( sofaCx.sub( 1.1 ), floorY, backZ.sub( 0.95 ) ), vec3( sofaCx.add( 1.1 ), floorY.add( mix( float( 0.8 ), float( 0.9 ), seed ) ), backZ.sub( 0.1 ) ) );
	const sofaCol = mix( color( 0x5a4a3a ), color( 0x42566a ), seed ).mul( select( sofa.qb.y.greaterThan( 0.9 ), float( 1.12 ), float( 0.85 ) ) );
	consider( sofa.hit, sofa.tN, sofaCol.mul( falloffAt( sofa.p.z ) ) );

	// tall wardrobes in the back corners — each side stands in some rooms
	const wardrobe = ( cx, gate, h ) => {

		const w = boxHit( vec3( cx.sub( 0.5 ), floorY, backZ.sub( 0.7 ) ), vec3( cx.add( 0.5 ), floorY.add( h ), backZ.sub( 0.1 ) ) );
		const c = mix( color( 0x3a2c22 ), color( 0x55473a ), seed ).mul( select( w.qb.y.greaterThan( 0.94 ), float( 1.2 ), float( 0.82 ) ) );
		consider( w.hit.and( gate ), w.tN, c.mul( falloffAt( w.p.z ) ) );

	};

	wardrobe( halfU.mul( - 0.82 ), hash( 7.3, 2.1, 9.9 ).greaterThan( 0.4 ), mix( float( 1.7 ), float( 2.3 ), seed ) );
	wardrobe( halfU.mul( 0.82 ), hash( 3.7, 8.4, 1.5 ).greaterThan( 0.4 ), mix( float( 1.7 ), float( 2.3 ), seed2 ) );

	// curtains hung just inside the glass: drapes drawn part-way in from each side,
	// so some windows read open and others half-covered

	// curtain fabric colour, picked per room from a muted domestic palette — creams and
	// taupes through warm grey, dusty blue, sage and faded terracotta — with a small
	// in-family drift so drawn drapes vary window to window instead of all reading beige
	const swatch = ( a, b ) => mix( color( a ), color( b ), seed2 );
	const pick = hash( 22.4, 6.7, 91.2 ).mul( 6 ); // 0..6, one bucket per family
	let fabric = swatch( 0xcabfa6, 0xd8cdb8 ); // cream
	fabric = select( pick.greaterThan( 1 ), swatch( 0x8a7a64, 0x9b8c72 ), fabric ); // beige / taupe
	fabric = select( pick.greaterThan( 2 ), swatch( 0x706a64, 0x837d76 ), fabric ); // warm grey
	fabric = select( pick.greaterThan( 3 ), swatch( 0x5f7079, 0x6f818b ), fabric ); // dusty blue
	fabric = select( pick.greaterThan( 4 ), swatch( 0x6c7558, 0x79835f ), fabric ); // sage green
	fabric = select( pick.greaterThan( 5 ), swatch( 0x8c5a44, 0x9a6a52 ), fabric ); // faded terracotta
	const drape = ( bMin, bMax, gate ) => {

		const h = boxHit( bMin, bMax );
		const pleat = fabric.mul( mix( float( 0.78 ), float( 1.12 ), fract( h.p.x.mul( 2.5 ) ) ) ); // soft vertical pleats
		consider( h.hit.and( gate ), h.tN, pleat.mul( falloffAt( h.p.z ) ), 0.2 ); // a drape only transmits a little of the room's glow, never out-glowing the interior

	};

	const cz0 = setback, cz1 = setback.add( 0.12 );
	// drape widths, biased narrow ( squared ) and each capped at half the room width, so
	// the two sides only meet — fully curtaining the window — in the rare room where both
	// are nearly closed; most rooms read partly open
	const sL = smoothstep( 0.3, 1.0, seed ), sR = smoothstep( 0.3, 1.0, seed2 );
	const lw = halfU.mul( sL.mul( sL ) ); // left drape width ( 0 below seed 0.3 )
	const rw = halfU.mul( sR.mul( sR ) ); // right drape width
	drape( vec3( halfU.negate(), floorY, cz0 ), vec3( halfU.negate().add( lw ), ceilY, cz1 ), lw.greaterThan( 0.05 ) );
	drape( vec3( halfU.sub( rw ), floorY, cz0 ), vec3( halfU, ceilY, cz1 ), rw.greaterThan( 0.05 ) );

	// lit rooms read brighter and take on their bulb's colour ( the lights are on )
	const warmth = mix( vec3( 1.0, 1.0, 1.0 ), lightCol, lit.mul( 0.85 ) );
	return vec4( bestCol.mul( warmth ).mul( mix( float( 1.0 ), float( 1.3 ), lit ) ), lit.mul( bestEmit ) );

} );

/**
 * The NYC masonry palette every tower is dressed from ( hex colours ): limestone-dominant
 * with terracotta accents. Shared by the single-tower example and {@link CityGenerator}'s
 * building material so both stay in sync.
 */
const buildingPalette = [
	0xa8553c, 0x9c4a34, // terracotta & red brick ( occasional accent )
	0x8a6a52, 0x7d6450, // warm brick / brownstone ( muted )
	0xc4a370, 0xb89a6f, 0xc2b183, // buff / tan
	0xc6c0b2, 0xc6c0b2, 0xbdb7a8, 0xd1ccbe, 0xb4afa1, // limestone / pale dressed stone — the common default
	0x9a988f, 0x8b8983, 0xa5a39a, // grey granite / concrete
	0xdbd6cb, // pale glazed ( accent )
	0x7c868d // steel / glass ( cool accent )
];

/** Picks one {@link buildingPalette} colour ( a hex number ) for a tower from its seed. */
function pickBuildingColor( seed ) {

	const h = Math.abs( Math.sin( seed * 12.9898 ) * 43758.5453 );
	return buildingPalette[ Math.floor( ( h - Math.floor( h ) ) * buildingPalette.length ) ];

}

// cheap value noise ( ~[ -1, 1 ] ), a lighter stand-in for gradient mx_noise on the
// weathering terms; integer-hashed ( not fract(sin) ) to stay stable across drivers
const valueNoise = /*@__PURE__*/ Fn( ( [ p ] ) => {

	const i = floor( p );
	const f = fract( p );
	const u = f.mul( f ).mul( f.mul( - 2 ).add( 3 ) ); // 3f2 - 2f3 smooth interpolation
	const corner = ( ox, oy, oz ) => {

		const c = i.add( vec3( ox, oy, oz ) );
		return ihash( uint( c.x.add( 1 << 20 ) ).mul( uint( 73856093 ) ).bitXor( uint( c.y.add( 1 << 20 ) ).mul( uint( 19349663 ) ) ).bitXor( uint( c.z.add( 1 << 20 ) ).mul( uint( 83492791 ) ) ) );

	};

	const x00 = mix( corner( 0, 0, 0 ), corner( 1, 0, 0 ), u.x );
	const x10 = mix( corner( 0, 1, 0 ), corner( 1, 1, 0 ), u.x );
	const x01 = mix( corner( 0, 0, 1 ), corner( 1, 0, 1 ), u.x );
	const x11 = mix( corner( 0, 1, 1 ), corner( 1, 1, 1 ), u.x );
	return mix( mix( x00, x10, u.y ), mix( x01, x11, u.y ), u.z ).mul( 2 ).sub( 1 );

} ).setLayout( { name: 'valueNoise', type: 'float', inputs: [ { name: 'p', type: 'vec3' } ] } );

// fractal ( fBm ) of valueNoise, octaves summed like mx_fractal_noise_float
// ( amplitude halving, frequency doubling ); unrolled for a compile-time count
const valueFractal = ( p, octaves ) => {

	let sum = valueNoise( p );
	let amp = 0.5, freq = 2;
	for ( let o = 1; o < octaves; o ++ ) {

		sum = sum.add( valueNoise( p.mul( freq ) ).mul( amp ) );
		amp *= 0.5;
		freq *= 2;

	}

	return sum;

};

/**
 * The facade material: a single MeshStandardNodeMaterial that reads the baked
 * per-vertex `partId` and reproduces every zone — procedural terracotta brickwork
 * on the walls and piers, smooth dressed stone on the window frames and ornament,
 * dark glazing, and grey AC units — all dressed with world-space
 * weathering. One material covers the whole building ( and a whole city ), which is
 * what makes it compute-rasterizer friendly. `buildingBase` is the tower's flat
 * masonry colour as a TSL node: pass a `uniform( Color )` for a single tower, or a
 * per-fragment palette pick for a city, so the same material dresses both.
 */
function createSkyscraperMaterial( buildingBase = color( 0xc6c0b2 ) ) {

	const soot = color( 0x4a4236 );

	// broad weathering, all driven from world position so it reads consistently
	// across instanced and merged meshes: a slow tonal drift, a fine clay mottle,
	// and sooty vertical streaks that pool low down

	const tone = varying( mx_fractal_noise_float( positionWorld.mul( 0.03 ), 2 ) ).mul( 0.18 ); // very low frequency: evaluate per-vertex and interpolate over the facade's fine tessellation
	const mottle = valueNoise( positionWorld.mul( 0.7 ) ).mul( 0.06 );
	const streak = mx_fractal_noise_float( vec3( positionWorld.x.mul( 1.5 ), positionWorld.y.mul( 0.04 ), positionWorld.z.mul( 1.5 ) ), 2 );
	const dirt = smoothstep( - 0.1, 0.45, streak ).mul( smoothstep( 210, 0, positionWorld.y ) ).mul( 0.6 );

	// procedural terracotta brickwork in running bond, keyed off the BUILDING-LOCAL position
	// so the coursing anchors to each tower ( courses from its base, columns at its faces )
	// and lines up with the brick-snapped floor / bay dimensions. courses run up local Y;
	// the across-face axis is world XZ projected onto the face tangent, so brick width stays
	// constant on every face including the 45° chamfer. the geometry ( pre-bump ) normal is
	// used for the bond axis — otherwise colorNode pulls normal computation into its partId
	// branch and glass loses its env reflection.

	const brickH = BRICK.height;
	const brickL = BRICK.length;
	const mortar = 0.025; // joint width, in metres

	const nrm = normalWorldGeometry.abs();
	const across = positionLocal.x.mul( normalWorldGeometry.z ).sub( positionLocal.z.mul( normalWorldGeometry.x ) );
	const rowCoord = positionLocal.y.div( brickH );
	const courseRow = floor( rowCoord );
	const colCoord = across.div( brickL ).add( mod( courseRow, 2 ).mul( 0.5 ) ); // half-brick stagger per row

	// anti-aliased mortar ( the "pristine grid" trick ): the drawn joint never falls below
	// the pixel footprint and its opacity fades to keep energy constant, so lines stay crisp
	// up close and dissolve far away instead of shimmering. the horizontal derivative comes
	// from continuous world X / Z ( weighted by the normal ), not fwidth( across ) which
	// would spike where the normal flips at pier edges.
	const mU = mortar / ( 2 * brickL );
	const mV = mortar / ( 2 * brickH );
	const ddU = nrm.z.mul( fwidth( positionWorld.x ) ).add( nrm.x.mul( fwidth( positionWorld.z ) ) ).div( brickL ).clamp( 1e-6, 0.5 );
	const ddV = fwidth( rowCoord ).clamp( 1e-6, 0.5 );
	const distU = float( 0.5 ).sub( fract( colCoord ).sub( 0.5 ).abs() );
	const distV = float( 0.5 ).sub( fract( rowCoord ).sub( 0.5 ).abs() );
	const drawU = ddU.max( mU );
	const drawV = ddV.max( mV );
	const lineU = smoothstep( drawU.add( ddU ), drawU.sub( ddU ), distU ).mul( float( mU ).div( drawU ).min( 1 ) );
	const lineV = smoothstep( drawV.add( ddV ), drawV.sub( ddV ), distV ).mul( float( mV ).div( drawV ).min( 1 ) );
	const wallFacing = smoothstep( 0.7, 0.45, nrm.y ); // brick only on vertical walls — not roofs, ledges, cornice tops
	const joint = lineU.max( lineV ).mul( wallFacing );

	const brickKey = uint( courseRow.add( 1 << 16 ) ).mul( uint( 73856093 ) ).bitXor( uint( floor( colCoord ).add( 1 << 16 ) ).mul( uint( 19349663 ) ) ).toVar();
	const brickRnd = ihash( brickKey );
	const brickRnd2 = ihash( brickKey.add( uint( 1 ) ) ); // independent per-brick hash for hue

	// soft brick relief for the bump: each brick is a gently domed mound falling to the
	// recessed mortar over a bevel ( distU / distV are the distance to the nearest column /
	// course line, 0 at the joint, 0.5 at the centre ), so bricks read rounded rather than
	// scratched. the bevel is widened to at least a screen pixel ( from the world-position
	// derivative, our stand-in for a mip LOD ) so the edge never goes sub-pixel and shimmers.
	const bevel = 0.02;
	const texel = fwidth( positionWorld ).length(); // on-screen size of a surface pixel — our hand-rolled LOD
	const lodBevel = texel.mul( 1.5 ).max( bevel );
	const brickFace = smoothstep( 0, lodBevel, distU.mul( brickL ) ).mul( smoothstep( 0, lodBevel, distV.mul( brickH ) ) ).mul( wallFacing );
	const reliefHeight = brickFace.mul( 0.008 );
	const rough = valueNoise( positionWorld.mul( 0.5 ) ).mul( 0.08 ).add( 0.82 ).add( joint.mul( 0.12 ) );

	// the merged geometry carries a per-vertex partId; this material reads it and
	// branches to reproduce each zone — no per-part materials, compute-raster friendly

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER ); // flat: a per-face id must not interpolate, or equal() below misses on the rounding
	const isGlass = partId.equal( GLASS );
	const isFrame = partId.equal( FRAME );
	const isOrnament = partId.equal( ORNAMENT );
	const isAC = partId.equal( AC );

	// stone zones: brick + weathering on the building's colour, lightened for
	// piers / ornament and darkened for window frames
	const lighten = select( partId.equal( PIER ), float( 0.12 ), select( isOrnament, float( 0.2 ), float( 0 ) ) );
	const perBrick = float( 1 ).add( tone ).add( mottle ).add( brickRnd.sub( 0.5 ).mul( 0.14 ) );
	// per-brick warm/cool shift ( red up / blue down, or vice-versa ) so individual
	// bricks read as slightly different fired tones, relative to the building's colour
	const warmCool = brickRnd2.sub( 0.5 ).mul( 0.14 );
	const brickShift = vec3( float( 1 ).add( warmCool ), float( 1 ), float( 1 ).sub( warmCool ) );
	const tint = mix( buildingBase, color( 0xffffff ), lighten ).mul( perBrick ).mul( brickShift );
	const masonry = mix( tint, tint.mul( 0.6 ), joint ); // recessed joints read darker
	// roofs / ledges show every blotch ( flat & light ), so horizontal surfaces get a gentler,
	// larger-scale grime instead of the wall's streaky soot — confined to those surfaces by a
	// branch ( roofMask > 0 ), so the fractal never runs on the vertical facade
	const roofMask = wallFacing.oneMinus();
	const roofGrime = select( roofMask.greaterThan( 0 ), smoothstep( 0.0, 0.55, valueFractal( positionWorld.mul( 0.025 ), 3 ) ).mul( 0.22 ), float( 0 ) );
	const stoneColor = mix( masonry, soot, mix( dirt, roofGrime, roofMask ) );

	// glass: the interior-mapped room is the base colour; the smooth, low-roughness
	// surface still lets a faint sky reflection ride over it, and lit rooms glow ( emissive ).
	// toVar so the raymarch runs once, shared by the colour and emissive outputs
	const room = interior().toVar();

	// grimy glazing: the room shows through, but muted by a dusty film and dirt pooled
	// along the bottom of each pane, plus a baseline haze, so the panes read as old
	// glass rather than open holes. the streaks run down the facade ( world Y barely
	// scaled ); the pooled dirt uses the pane's own UV ( y = 0 at the sill ).
	const filmNoise = mx_fractal_noise_float( vec3( positionWorld.x.mul( 1.3 ), positionWorld.y.mul( 0.06 ), positionWorld.z.mul( 1.3 ) ), 2 );
	const dustStreak = smoothstep( - 0.15, 0.5, filmNoise ).mul( 0.45 );
	const pooled = smoothstep( 0.32, 0.0, uv().y ).mul( 0.4 );
	const grime = float( 0.64 ).add( dustStreak ).add( pooled ).clamp( 0, 0.95 ); // baseline haze so the panes read as dirty glass, not open holes
	const dirtyGlass = mix( color( 0x13161a ), color( 0x232b31 ), valueFractal( positionWorld.mul( 0.3 ), 2 ).mul( 0.5 ).add( 0.5 ) );
	const glassColor = mix( room.xyz.mul( color( 0xb6c6bf ) ), dirtyGlass, grime ); // faint green-grey ( soda-lime ) room tint, dirtied toward grimy glass

	// window frames are smooth dressed stone, not brick
	const frameColor = buildingBase.mul( 0.55 );

	// finials / ornament: smooth dressed stone ( lightened ), not brick
	const ornamentColor = mix( buildingBase, color( 0xffffff ), 0.22 ).mul( float( 1 ).add( tone ) );
	// window AC units: a louvered white-plastic box, grimier toward the base where it drips.
	// keyed off the box's own UVs ( acUv.y runs 0 → 1 up each vented side )
	const acUv = uv();
	const acVent = smoothstep( 0.65, 0.4, normalWorldGeometry.y.abs() ); // 1 on the vertical vented sides, 0 on the flat top
	const acDetail = smoothstep( 0.08, 0.015, texel ); // louvers fade out before a slat nears a pixel
	const acLouver = acVent.mul( acDetail );

	// plastic shell: off-white, some units dingier / yellowed than others
	const acDinge = valueNoise( positionWorld.mul( 0.4 ) ).mul( 0.5 ).add( 0.5 ); // ~per-unit
	const acPaint = mix( color( 0xf2f1ec ), color( 0xcfccc2 ), acDinge ) // bright white → light dingy grey, both lighter than the wall
		.add( valueNoise( positionWorld.mul( 5 ) ).mul( 0.04 ) );

	// a darker recessed grille panel inset into the lighter cabinet, with horizontal louvers
	// inside it ( the front vents ) — the white plastic reads as a thin border frame
	const acGrille = smoothstep( 0.06, 0.14, acUv.x ).mul( smoothstep( 0.94, 0.86, acUv.x ) )
		.mul( smoothstep( 0.12, 0.2, acUv.y ) ).mul( smoothstep( 0.96, 0.88, acUv.y ) ).mul( acLouver );
	const acSlats = fract( acUv.y.mul( 6 ) ); // bold louvers — reads at the unit's small on-screen size
	const acFin = mix( float( 0.82 ), float( 1.04 ), acSlats );
	const acBody = acPaint.mul( mix( float( 1 ), acFin.mul( 0.42 ), acGrille ) ); // cabinet stays light; recessed grille goes dark grey

	// grey-brown condensate grime streaking the lower edge ( plastic doesn't rust ); dirtier units streak more
	const acStreak = valueFractal( vec3( positionWorld.x.mul( 6 ), positionWorld.y.mul( 0.5 ), positionWorld.z.mul( 6 ) ), 3 ).mul( 0.5 ).add( 0.5 );
	const acGrime = smoothstep( 0.4, 0.0, acUv.y ).mul( acStreak ).mul( acDinge.add( 0.3 ) );
	const acColor = mix( acBody, color( 0x6f685a ), acGrime.mul( 0.5 ) );

	// recessed grille ( louver fins ) relief and a slightly rougher base
	const acRelief = acGrille.mul( acSlats.mul( 0.012 ).sub( 0.01 ) );
	const acRough = float( 0.52 ).add( acGrille.mul( 0.08 ) );

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( isGlass, glassColor, select( isFrame, frameColor, select( isOrnament, ornamentColor, select( isAC, acColor, stoneColor ) ) ) );
	material.roughnessNode = select( isGlass, float( 0.18 ), select( isOrnament, float( 0.8 ), select( isAC, acRough, rough ) ) ); // glass kept smooth for a sky reflection, but soft enough not to alias over the interior
	material.metalnessNode = float( 0 ); // all dielectric — stone, glass and the plastic AC shells
	material.emissiveNode = select( isGlass, room.xyz.mul( room.w ).mul( 4 ).mul( grime.mul( 0.6 ).oneMinus() ), color( 0x000000 ) ); // room.w = emissive weight ( 0 unlit, < 1 behind curtains ), muted further by grime
	material.normalNode = bumpNormal( select( isGlass.or( isFrame ).or( isOrnament ), float( 0 ), select( isAC, acRelief, reliefHeight ) ) ); // glass / frames / ornament stay flat; AC has its own louvers

	return material;

}

export { SkyscraperGenerator, createSkyscraperMaterial, buildingPalette, pickBuildingColor };
