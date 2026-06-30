import {
	BufferAttribute,
	CylinderGeometry,
	IcosahedronGeometry,
	InstancedMesh,
	InterpolationSamplingMode,
	InterpolationSamplingType
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, color, float, mix, normalWorldGeometry, select, varying } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';

/**
 * A young street tree set in a curbside pit: a tapered bark trunk rising from the
 * soil into a canopy of a few overlapping squashed leaf blobs, offset from each
 * other so the crown reads irregular rather than as a single ball. Built once and
 * instanced across a list of placements, dressed with one cheap material that
 * branches on a baked `partId` ( brown bark, green foliage ).
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

const TRUNK = 0, LEAF = 1;

function part( geometry, id ) {

	const g = geometry.index ? geometry.toNonIndexed() : geometry;
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

function buildStreetTreeGeometry( p ) {

	const r = p.trunkRadius, h = p.trunkHeight;

	const soil = new CylinderGeometry( 0.5, 0.55, 0.06, 12 ).translate( 0, 0.03, 0 ); // tree-pit soil, proud of the pavement
	const trunk = new CylinderGeometry( r * 0.55, r, h, 8 ).translate( 0, h / 2, 0 ); // tapering toward the crown

	// a few squashed blobs, offset in X / Z so the crown is lumpy rather than a single ball
	const blobs = [
		new IcosahedronGeometry( 2.4, 1 ).scale( 1, 0.8, 1 ).translate( 0, 3.8, 0 ),
		new IcosahedronGeometry( 2, 1 ).scale( 1, 0.8, 1 ).translate( 1, 4.3, 0.4 ),
		new IcosahedronGeometry( 1.9, 1 ).scale( 1, 0.8, 1 ).translate( - 0.9, 3.6, - 0.4 ),
		new IcosahedronGeometry( 1.8, 1 ).scale( 1, 0.8, 1 ).translate( 0.2, 4.5, 0.7 )
	];

	return mergeGeometries( [ part( soil, TRUNK ), part( trunk, TRUNK ), ...blobs.map( b => part( b, LEAF ) ) ] );

}

function createStreetTreeMaterial() {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isLeaf = partId.equal( LEAF );

	// lift the green toward the sky-facing side so the crown gets shape for free
	const leaf = mix( color( 0x3c5a2c ), color( 0x577a38 ), normalWorldGeometry.y.mul( 0.5 ).add( 0.5 ) );

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( isLeaf, leaf, color( 0x4a3a2a ) ); // foliage green over bark brown
	material.roughnessNode = float( 0.9 );
	material.metalnessNode = float( 0 );

	return material;

}

export { StreetTreeGenerator };
