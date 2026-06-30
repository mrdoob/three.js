import {
	BoxGeometry,
	BufferAttribute,
	InstancedMesh,
	InterpolationSamplingMode,
	InterpolationSamplingType
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, color, float, select, varying } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';

/**
 * A public street bench: timber slats carried on two cast-iron end frames that
 * curl into armrests, with a reclined slatted backrest. Built once and instanced
 * across a list of placements, dressed with one cheap material that branches on a
 * baked `partId` ( warm stained wood, dark iron ).
 *
 * The canonical model stands on `y = 0`, centred in X / Z, runs along X and seats
 * toward `+Z`, so a placement whose local `+Z` faces the road sits a passer-by
 * looking out over it.
 *
 * ```js
 * const benches = new BenchGenerator();
 * scene.add( benches.build( placements ) ); // placements: Matrix4[]
 * ```
 */
class BenchGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, BenchGenerator.defaults, parameters );

		this.material = null;
		this.geometry = null;
		this.mesh = null;

	}

	build( placements ) {

		this.dispose();

		if ( this.material === null ) this.material = createBenchMaterial();
		if ( this.geometry === null ) this.geometry = buildBenchGeometry( this.parameters );

		const mesh = new InstancedMesh( this.geometry, this.material, placements.length );
		for ( let i = 0; i < placements.length; i ++ ) mesh.setMatrixAt( i, placements[ i ] );
		mesh.castShadow = mesh.receiveShadow = true;
		mesh.name = 'Benches';

		this.mesh = mesh;

		return mesh;

	}

	dispose() {

		if ( this.geometry ) this.geometry.dispose();
		this.geometry = null;
		this.mesh = null;

	}

}

BenchGenerator.defaults = {
	length: 1.8, // spans X
	depth: 0.55, // front-to-back
	seatHeight: 0.45,
	backHeight: 0.85
};

// material-zone codes baked per vertex
const WOOD = 0, IRON = 1;

// tag a geometry with a flat partId and normalize to non-indexed for merging
function part( geometry, id ) {

	const g = geometry.index ? geometry.toNonIndexed() : geometry;
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

function buildBenchGeometry( p ) {

	const halfLength = p.length / 2;
	const halfDepth = p.depth / 2;
	const seatY = p.seatHeight;
	const backY = p.backHeight;

	const frontZ = halfDepth - 0.075; // legs set just inside the depth
	const backZ = - frontZ;

	const parts = [];

	// two cast-iron end frames brace the slats and curl into armrests
	for ( const side of [ - 1, 1 ] ) {

		const x = side * ( halfLength - 0.07 );

		const frontLeg = new BoxGeometry( 0.05, seatY, 0.06 ).translate( x, seatY / 2, frontZ );
		const backLeg = new BoxGeometry( 0.05, backY, 0.06 ).translate( x, backY / 2, backZ ); // doubles as the backrest post
		const seatRail = new BoxGeometry( 0.06, 0.05, frontZ - backZ + 0.1 ).translate( x, seatY - 0.04, 0 );
		const armPost = new BoxGeometry( 0.05, 0.22, 0.05 ).translate( x, seatY + 0.11, frontZ );
		const armRest = new BoxGeometry( 0.05, 0.05, frontZ - backZ + 0.06 ).translate( x, seatY + 0.22, 0 );
		const armCurl = new BoxGeometry( 0.05, 0.16, 0.05 ).rotateX( - 0.6 ).translate( x, seatY + 0.18, frontZ + 0.07 ); // front scroll of the armrest

		parts.push( part( frontLeg, IRON ), part( backLeg, IRON ), part( seatRail, IRON ), part( armPost, IRON ), part( armRest, IRON ), part( armCurl, IRON ) );

	}

	// timber seat slats spaced front-to-back
	const slatLength = p.length - 0.1;
	const z0 = backZ + 0.02, z1 = frontZ - 0.02;
	for ( let i = 0; i < 5; i ++ ) {

		const z = z0 + ( z1 - z0 ) * ( i / 4 );
		parts.push( part( new BoxGeometry( slatLength, 0.03, 0.07 ).translate( 0, seatY, z ), WOOD ) );

	}

	// backrest slats climb the rear posts, reclined a touch
	for ( let i = 0; i < 3; i ++ ) {

		const t = i / 2;
		const y = seatY + 0.13 + t * 0.27;
		const z = backZ + 0.01 - t * 0.06;
		parts.push( part( new BoxGeometry( slatLength, 0.09, 0.025 ).rotateX( 0.18 ).translate( 0, y, z ), WOOD ) );

	}

	return mergeGeometries( parts );

}

function createBenchMaterial() {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isWood = partId.equal( WOOD );

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( isWood, color( 0x6b4a2e ), color( 0x2a2a28 ) ); // warm stained timber, dark cast iron
	material.roughnessNode = select( isWood, float( 0.75 ), float( 0.45 ) );
	material.metalnessNode = select( isWood, float( 0 ), float( 0.6 ) );

	return material;

}

export { BenchGenerator };
