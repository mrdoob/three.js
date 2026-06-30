import {
	BufferAttribute,
	CylinderGeometry,
	InstancedMesh,
	InterpolationSamplingMode,
	InterpolationSamplingType
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, color, float, Fn, fract, mix, select, step, uv, varying } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';

/**
 * The NYC green wire-mesh litter basket: a slightly tapered drum with a heavy top
 * rim, a foot ring and a dark bag of trash inside. Built once and instanced across
 * a list of placements; one cheap material branches on a baked `partId`, drawing
 * the mesh weave procedurally from the drum's own UVs so no alpha or extra geometry
 * is needed. Canonical model stands on `y = 0`, centred in X / Z.
 *
 * ```js
 * const cans = new TrashcanGenerator();
 * scene.add( cans.build( placements ) ); // placements: Matrix4[]
 * ```
 */
class TrashcanGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, TrashcanGenerator.defaults, parameters );

		this.material = null;
		this.geometry = null;
		this.mesh = null;

	}

	build( placements ) {

		this.dispose();

		if ( this.material === null ) this.material = createTrashcanMaterial();
		if ( this.geometry === null ) this.geometry = buildTrashcanGeometry( this.parameters );

		const mesh = new InstancedMesh( this.geometry, this.material, placements.length );
		for ( let i = 0; i < placements.length; i ++ ) mesh.setMatrixAt( i, placements[ i ] );
		mesh.castShadow = mesh.receiveShadow = true;
		mesh.name = 'Trashcans';

		this.mesh = mesh;

		return mesh;

	}

	dispose() {

		if ( this.geometry ) this.geometry.dispose();
		this.geometry = null;
		this.mesh = null;

	}

}

TrashcanGenerator.defaults = {
	radius: 0.28, // ~0.55 m diameter basket
	height: 0.8
};

const MESH = 0, RIM = 1, TRASH = 2;

function part( geometry, id ) {

	const g = geometry.index ? geometry.toNonIndexed() : geometry;
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

function buildTrashcanGeometry( p ) {

	const r = p.radius, h = p.height;

	const drum = new CylinderGeometry( r, r * 0.92, h, 16, 1, true ).translate( 0, h / 2, 0 ); // open-ended weave drum
	const rim = new CylinderGeometry( r + 0.03, r + 0.03, 0.07, 16 ).translate( 0, h, 0 );
	const foot = new CylinderGeometry( r * 0.92, r * 0.86, 0.06, 16 ).translate( 0, 0.03, 0 );
	const bag = new CylinderGeometry( r * 0.86, r * 0.7, h * 0.9, 12 ).translate( 0, h * 0.5, 0 ); // dark refuse, just inside

	return mergeGeometries( [ part( drum, MESH ), part( rim, RIM ), part( foot, RIM ), part( bag, TRASH ) ] );

}

function createTrashcanMaterial() {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isRim = partId.equal( RIM );
	const isTrash = partId.equal( TRASH );

	// procedural diamond weave on the drum, drawn from its UV so the mesh reads as
	// open without alpha: dark gaps between bright-green wire, faded out by row
	const weave = Fn( () => {

		const u = uv().x.mul( 26 );
		const v = uv().y.mul( 14 );
		const a = step( 0.5, fract( u.add( v ) ) );
		const b = step( 0.5, fract( u.sub( v ) ) );
		return a.add( b ).mul( 0.5 ); // 0 in the holes, 1 on the crossing wires

	} )();

	const green = color( 0x2f4a32 );
	const drumColor = mix( green.mul( 0.25 ), green, weave ); // holes go near-black

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( isTrash, color( 0x1b1b18 ), select( isRim, green.mul( 1.1 ), drumColor ) );
	material.roughnessNode = select( isTrash, float( 0.9 ), float( 0.55 ) );
	material.metalnessNode = select( isTrash, float( 0 ), float( 0.5 ) );

	return material;

}

export { TrashcanGenerator };
