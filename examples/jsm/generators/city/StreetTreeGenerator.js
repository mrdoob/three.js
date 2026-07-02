import {
	BufferAttribute,
	CylinderGeometry,
	IcosahedronGeometry,
	InstancedMesh,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	RingGeometry,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, color, float, fract, mix, mx_fractal_noise_float, normalWorldGeometry, positionGeometry, positionWorld, select, sin, smoothstep, varying, vec3 } from 'three/tsl';

import { mergeGeometries, mergeVertices } from '../../utils/BufferGeometryUtils.js';

/**
 * A young street tree set in a curbside pit: a flared bark trunk rising through a
 * cast-iron pit grate, branching into a canopy of vertex-jittered leaf clumps. The
 * clump normals are blended toward a shared crown sphere so the clumps shade as one
 * irregular crown rather than separate balls, and the material adds interior
 * self-shadowing and patchy colour so the foliage reads as leaf mass. Built once
 * and instanced across a list of placements, dressed with one cheap material that
 * branches on a baked `partId`.
 *
 * The canopy is near rotationally symmetric, so the canonical model stands on
 * `y = 0`, centred in X / Z, with its slight lean toward `+Z` matching the other
 * pieces of street furniture.
 *
 * ```js
 * const trees = new StreetTreeGenerator();
 * scene.add( trees.build( placements ) ); // placements: Matrix4[]
 * ```
 */
class StreetTreeGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, StreetTreeGenerator.defaults, parameters );

		this.material = null;
		this.geometry = null;
		this.mesh = null;

	}

	build( placements ) {

		this.dispose();

		if ( this.material === null ) this.material = createStreetTreeMaterial();
		if ( this.geometry === null ) this.geometry = buildStreetTreeGeometry( this.parameters );

		const mesh = new InstancedMesh( this.geometry, this.material, placements.length );
		for ( let i = 0; i < placements.length; i ++ ) mesh.setMatrixAt( i, placements[ i ] );
		mesh.castShadow = mesh.receiveShadow = true;
		mesh.name = 'StreetTrees';

		this.mesh = mesh;

		return mesh;

	}

	dispose() {

		if ( this.geometry ) this.geometry.dispose();
		this.geometry = null;
		this.mesh = null;

	}

}

StreetTreeGenerator.defaults = {
	trunkHeight: 2.6, // clear trunk below the canopy
	trunkRadius: 0.18 // bark radius at the base
};

const TRUNK = 0, LEAF = 1, GRATE = 2;

// the crown sphere the clump normals blend toward; the material reuses it for
// the interior-shadow falloff
const CROWN_CENTER = new Vector3( 0, 3.9, 0.1 );
const CROWN_RADIUS = 3.1;

function part( geometry, id ) {

	const g = geometry.index ? geometry.toNonIndexed() : geometry;
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

// deterministic position hash for the clump jitter
function hash( x, y, z ) {

	const s = Math.sin( x * 127.1 + y * 311.7 + z * 74.7 ) * 43758.5453;
	return s - Math.floor( s );

}

// a leaf clump: an icosahedron with its vertices pushed in and out radially so the
// silhouette breaks into lobes, its normals pulled toward the shared crown sphere
function leafClump( radius, x, y, z ) {

	// polyhedron geometries come non-indexed; weld them so the jittered surface
	// gets smooth vertex normals instead of hard facets
	const g = mergeVertices( new IcosahedronGeometry( radius, 1 ).scale( 1, 0.82, 1 ) );

	const position = g.attributes.position;
	const v = new Vector3();

	for ( let i = 0; i < position.count; i ++ ) {

		v.fromBufferAttribute( position, i );
		const n = hash( v.x, v.y, v.z );
		v.multiplyScalar( 0.86 + n * 0.3 );
		position.setXYZ( i, v.x, v.y, v.z );

	}

	g.translate( x, y, z );
	g.computeVertexNormals();

	// blend the faceted normals toward the crown sphere so all the clumps light
	// as one continuous canopy instead of a cluster of separate balls
	const normal = g.attributes.normal;

	for ( let i = 0; i < normal.count; i ++ ) {

		v.fromBufferAttribute( position, i ).sub( CROWN_CENTER ).normalize();
		normal.setXYZ(
			i,
			normal.getX( i ) * 0.45 + v.x * 0.55,
			normal.getY( i ) * 0.45 + v.y * 0.55,
			normal.getZ( i ) * 0.45 + v.z * 0.55
		);

	}

	g.normalizeNormals();

	return g;

}

function buildStreetTreeGeometry( p ) {

	const r = p.trunkRadius, h = p.trunkHeight;

	// tree pit: dark soil sunk inside a cast-iron grate ring flush with the pavement
	const soil = new CylinderGeometry( 0.24, 0.3, 0.05, 10 ).translate( 0, 0.025, 0 );
	const grate = new RingGeometry( 0.24, 0.62, 16, 4 ).rotateX( - Math.PI / 2 ).translate( 0, 0.045, 0 );

	// the trunk flares at the root collar and tapers toward the crown
	const rootFlare = new CylinderGeometry( r * 1.15, r * 1.6, 0.22, 8 ).translate( 0, 0.11, 0 );
	const trunk = new CylinderGeometry( r * 0.55, r * 1.1, h, 8 ).translate( 0, h / 2, 0 );

	// a few bare limbs fan from the trunk top into the clumps, so the canopy
	// visibly grows out of the tree instead of hovering over it
	const limbs = [];
	for ( const [ rx, rz, len ] of [ [ 0.5, 0.2, 1.5 ], [ - 0.45, - 0.3, 1.4 ], [ 0.1, - 0.55, 1.2 ], [ - 0.15, 0.5, 1.3 ] ] ) {

		limbs.push(
			new CylinderGeometry( 0.03, 0.07, len, 5 )
				.translate( 0, len / 2, 0 )
				.rotateX( rx ).rotateZ( rz )
				.translate( 0, h - 0.15, 0 )
		);

	}

	// overlapping jittered clumps, one dominant mass with satellites tucked
	// around it so the crown reads irregular rather than as a single ball
	const clumps = [
		leafClump( 2.15, 0, 3.9, 0.1 ),
		leafClump( 1.5, 1.15, 4.35, 0.5 ),
		leafClump( 1.45, - 1.05, 3.55, - 0.5 ),
		leafClump( 1.3, 0.35, 4.75, - 0.65 ),
		leafClump( 1.25, - 0.35, 4.5, 0.9 ),
		leafClump( 1.1, 0.9, 3.3, - 0.85 )
	];

	return mergeGeometries( [
		part( soil, TRUNK ),
		part( grate, GRATE ),
		part( mergeGeometries( [ rootFlare, trunk, ...limbs ] ), TRUNK ),
		...clumps.map( c => part( c, LEAF ) )
	] );

}

function createStreetTreeMaterial() {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isLeaf = partId.equal( LEAF );
	const isGrate = partId.equal( GRATE );

	const p = positionGeometry;

	// smooth world-space noise: large patches shift the green so no two trees
	// ( or two sides of one crown ) read as the same flat colour
	const patch = mx_fractal_noise_float( positionWorld.mul( 0.55 ), 2 ).mul( 0.5 ).add( 0.5 );

	// interior shadow: leaves darken toward the crown core, where a real canopy
	// swallows the light, and brighten toward the sun-fed rim
	const crownDist = p.sub( vec3( CROWN_CENTER.x, CROWN_CENTER.y, CROWN_CENTER.z ) ).length().div( CROWN_RADIUS );
	const interiorAO = smoothstep( 0.1, 1.05, crownDist ).mul( 0.5 ).add( 0.5 );

	// sky-facing lift plus patchy hue drift between deep and warm greens
	const skyLift = normalWorldGeometry.y.mul( 0.5 ).add( 0.5 );
	const leafBase = mix( color( 0x33511f ), color( 0x5d7c33 ), skyLift );
	const leafVaried = mix( leafBase, color( 0x77822f ), patch.mul( 0.55 ) );
	const leaf = leafVaried.mul( interiorAO );

	// bark: vertical streaks of lighter dead bark over the brown
	const barkStreak = fract( sin( p.x.mul( 37.7 ).add( p.z.mul( 51.3 ) ) ).mul( 289.31 ).add( p.y.mul( 0.7 ) ) );
	const bark = mix( color( 0x4a3a2a ), color( 0x6a5a44 ), smoothstep( 0.55, 0.95, barkStreak ).mul( 0.6 ) );

	// cast-iron pit grate: concentric slots cut by a radial stripe pattern
	const gr = p.xz.length();
	const slots = smoothstep( 0.35, 0.5, fract( gr.mul( 11.0 ) ) );
	const grate = mix( color( 0x121110 ), color( 0x3a3835 ), slots );

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( isLeaf, leaf, select( isGrate, grate, bark ) );
	material.roughnessNode = select( isGrate, float( 0.7 ), float( 0.9 ) );
	material.metalnessNode = select( isGrate, float( 0.4 ), float( 0 ) );

	return material;

}

export { StreetTreeGenerator };
