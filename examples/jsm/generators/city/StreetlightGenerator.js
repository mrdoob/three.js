import {
	BoxGeometry,
	CylinderGeometry,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	Quaternion,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, color, float, select, varying } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';

import { InstancedMeshGenerator } from './InstancedMeshGenerator.js';
import { part } from './CityGeneratorUtils.js';

/**
 * A NYC cobra-head streetlight: a tall tapered mast standing at the curb with a
 * curved arm reaching out over the roadway to a drop luminaire. Built once and
 * instanced across a list of placements, dressed with one cheap material that
 * branches on a baked `partId` ( dark metal pole, pale lamp lens ).
 *
 * The canonical model stands on `y = 0`, centred in X / Z, with the arm reaching
 * toward `+Z`, so a placement whose local `+Z` faces the road throws the lamp
 * over it.
 *
 * ```js
 * const lights = new StreetlightGenerator();
 * scene.add( lights.build( placements ) ); // placements: Matrix4[]
 * ```
 */
class StreetlightGenerator extends InstancedMeshGenerator {

	constructor( parameters = {} ) {

		super( parameters, buildStreetlightGeometry, createStreetlightMaterial, 'Streetlights', false );

	}

}

StreetlightGenerator.defaults = {
	height: 9, // mast height ( NYC arterial standard ~9 m )
	reach: 2.4, // how far the arm reaches out over the road
	radius: 0.1 // mast radius at the top
};

// material-zone codes baked per vertex
const METAL = 0, LENS = 1;

// a capsule-less strut: a cylinder spanning two points, oriented from +Y
function strut( a, b, radius, segments = 6 ) {

	const dir = new Vector3().subVectors( b, a );
	const length = dir.length();
	const geometry = new CylinderGeometry( radius, radius, length, segments );
	geometry.applyQuaternion( new Quaternion().setFromUnitVectors( new Vector3( 0, 1, 0 ), dir.normalize() ) );
	geometry.translate( ( a.x + b.x ) / 2, ( a.y + b.y ) / 2, ( a.z + b.z ) / 2 );
	return geometry;

}

function buildStreetlightGeometry( p ) {

	const h = p.height;

	const base = new CylinderGeometry( 0.18, 0.22, 0.6, 8 ).translate( 0, 0.3, 0 );
	const pole = new CylinderGeometry( p.radius, p.radius * 1.7, h, 8 ).translate( 0, h / 2, 0 );

	// the arm rises off the mast then sweeps out over the road to the luminaire
	const armBase = new Vector3( 0, h - 0.4, 0 );
	const armKnee = new Vector3( 0, h + 0.5, p.reach * 0.35 );
	const armEnd = new Vector3( 0, h + 0.2, p.reach );
	const arm = mergeGeometries( [ strut( armBase, armKnee, 0.07 ), strut( armKnee, armEnd, 0.06 ) ] );

	// a tapering cobra-head luminaire at the arm end, with a pale lens underneath
	const head = new BoxGeometry( 0.26, 0.16, 0.7 ).translate( armEnd.x, armEnd.y - 0.05, armEnd.z + 0.2 );
	const lens = new BoxGeometry( 0.2, 0.05, 0.5 ).translate( armEnd.x, armEnd.y - 0.14, armEnd.z + 0.2 );

	return mergeGeometries( [ part( base, METAL ), part( pole, METAL ), part( arm, METAL ), part( head, METAL ), part( lens, LENS ) ] );

}

function createStreetlightMaterial() {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isLens = partId.equal( LENS );

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( isLens, color( 0xfff0cc ), color( 0x40433d ) ); // warm lit lens, dark olive-grey metal
	material.roughnessNode = select( isLens, float( 0.3 ), float( 0.5 ) );
	material.metalnessNode = select( isLens, float( 0 ), float( 0.7 ) );
	material.emissiveNode = select( isLens, color( 0xffe2a6 ).mul( 60 ), color( 0x000000 ) ); // luminaire lens at ~2x a sunlit white wall, as a real cobra head reads

	return material;

}

export { StreetlightGenerator };
