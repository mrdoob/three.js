import {
	BoxGeometry,
	BufferAttribute,
	CylinderGeometry,
	InstancedMesh,
	InterpolationSamplingMode,
	InterpolationSamplingType
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, color, float, select, varying } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';

/**
 * A NYC traffic signal: a round pole at the curb with a horizontal mast arm
 * reaching out over the roadway to a vertical three-section signal head, plus a
 * pedestrian-signal box on the pole. Built once and instanced across a list of
 * placements, dressed with one cheap material that branches on a baked `partId`
 * ( dark metal, three coloured lenses ).
 *
 * The canonical model stands on `y = 0`, centred in X / Z, with the arm reaching
 * toward `+Z`, so a placement whose local `+Z` faces the road throws the head
 * over it with its lenses aimed back at oncoming traffic.
 *
 * ```js
 * const lights = new TrafficlightGenerator();
 * scene.add( lights.build( placements ) ); // placements: Matrix4[]
 * ```
 */
class TrafficlightGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, TrafficlightGenerator.defaults, parameters );

		this.material = null;
		this.geometry = null;
		this.mesh = null;

	}

	build( placements ) {

		this.dispose();

		if ( this.material === null ) this.material = createTrafficlightMaterial();
		if ( this.geometry === null ) this.geometry = buildTrafficlightGeometry( this.parameters );

		const mesh = new InstancedMesh( this.geometry, this.material, placements.length );
		for ( let i = 0; i < placements.length; i ++ ) mesh.setMatrixAt( i, placements[ i ] );
		mesh.castShadow = mesh.receiveShadow = true;
		mesh.name = 'Trafficlights';

		this.mesh = mesh;

		return mesh;

	}

	dispose() {

		if ( this.geometry ) this.geometry.dispose();
		this.geometry = null;
		this.mesh = null;

	}

}

TrafficlightGenerator.defaults = {
	height: 6.5, // pole height at the curb, so the mast arm clears traffic
	reach: 5.5, // how far the mast arm reaches out over the road
	radius: 0.14 // pole radius
};

// material-zone codes baked per vertex
const METAL = 0, RED = 1, AMBER = 2, GREEN = 3;

// a short lens disc on the front of the signal head, facing back down the arm
function lensDisc( y, z, id ) {

	return part( new CylinderGeometry( 0.13, 0.13, 0.08, 12 ).rotateX( Math.PI / 2 ).translate( 0, y, z ), id );

}

// tag a geometry with a flat partId and normalize to non-indexed for merging
function part( geometry, id ) {

	const g = geometry.index ? geometry.toNonIndexed() : geometry;
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

function buildTrafficlightGeometry( p ) {

	const h = p.height, reach = p.reach;
	const armY = h - 0.3; // the arm rides just below the pole top

	const base = new CylinderGeometry( 0.2, 0.26, 0.5, 8 ).translate( 0, 0.25, 0 );
	const pole = new CylinderGeometry( p.radius, p.radius * 1.2, h, 8 ).translate( 0, h / 2, 0 );

	// horizontal, slightly tapered mast arm out over the roadway toward +Z
	const arm = new CylinderGeometry( 0.07, 0.1, reach, 8 ).rotateX( Math.PI / 2 ).translate( 0, armY, reach / 2 );

	// pedestrian-signal box clamped to the pole at eye level, facing the crossing
	const pedBox = new BoxGeometry( 0.4, 0.42, 0.2 ).translate( 0, 2.6, p.radius + 0.1 );

	// the three-section head hangs from the arm's far end, its bottom ~4.7 m over
	// the road for truck clearance, lenses aimed back at oncoming traffic
	const headZ = reach - 0.6, headY = armY - 1.05;
	const housing = new BoxGeometry( 0.36, 0.95, 0.32 ).translate( 0, headY, headZ );
	const dropLen = armY - ( headY + 0.475 );
	const drop = new CylinderGeometry( 0.05, 0.05, dropLen, 6 ).translate( 0, headY + 0.475 + dropLen / 2, headZ ); // bracket hanging the head off the arm
	const lensZ = headZ - 0.19; // discs stand proud of the housing's -Z face

	return mergeGeometries( [
		part( base, METAL ), part( pole, METAL ), part( arm, METAL ), part( drop, METAL ),
		part( pedBox, METAL ), part( housing, METAL ),
		lensDisc( headY + 0.28, lensZ, RED ),
		lensDisc( headY, lensZ, AMBER ),
		lensDisc( headY - 0.28, lensZ, GREEN )
	] );

}

function createTrafficlightMaterial() {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isGreen = partId.equal( GREEN );
	const isLens = partId.greaterThan( 0.5 ); // any coloured lens, never the metal

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( partId.equal( RED ), color( 0x3a0a06 ), select( partId.equal( AMBER ), color( 0x402608 ), select( isGreen, color( 0x2bd24b ), color( 0x233029 ) ) ) ); // dark glass, lit green, dark olive metal
	material.roughnessNode = select( isLens, float( 0.3 ), float( 0.5 ) );
	material.metalnessNode = select( isLens, float( 0 ), float( 0.7 ) );
	material.emissiveNode = select( isGreen, color( 0x2bd24b ).mul( 18 ), color( 0x000000 ) ); // only the go signal glows, at LED-aspect radiance that still reads in full sun

	return material;

}

export { TrafficlightGenerator };
