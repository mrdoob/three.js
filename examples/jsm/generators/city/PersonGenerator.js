import {
	BoxGeometry,
	Color,
	CylinderGeometry,
	InstancedMesh,
	SphereGeometry
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { color } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';

/**
 * A low-poly pedestrian: a sphere head over a tapered coat, with boxy legs and arms
 * down the sides. Built once and instanced across a list of placements so a whole
 * crowd shares one geometry and one material. Clothing variety comes from a
 * per-instance coat colour picked from a muted palette, which the engine multiplies
 * into the white base, so no per-vertex zones are needed.
 *
 * The canonical figure stands on `y = 0`, centred in X / Z and ~1.75 m tall, facing
 * `+Z` so a placement turns it to face the road.
 *
 * ```js
 * const people = new PersonGenerator();
 * scene.add( people.build( placements ) ); // placements: Matrix4[]
 * ```
 */
class PersonGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, PersonGenerator.defaults, parameters );

		this.material = null;
		this.geometry = null;
		this.mesh = null;

	}

	build( placements ) {

		this.dispose();

		if ( this.material === null ) this.material = createPersonMaterial();
		if ( this.geometry === null ) this.geometry = buildPersonGeometry( this.parameters );

		const mesh = new InstancedMesh( this.geometry, this.material, placements.length );

		const c = new Color();
		for ( let i = 0; i < placements.length; i ++ ) {

			mesh.setMatrixAt( i, placements[ i ] );

			// deterministic coat colour from a tiny hash of the instance index
			const swatch = COATS[ ( ( i * 2654435761 ) >>> 0 ) % COATS.length ];
			mesh.setColorAt( i, c.setHex( swatch ) );

		}

		if ( mesh.instanceColor ) mesh.instanceColor.needsUpdate = true;

		mesh.castShadow = true;
		mesh.name = 'People';

		this.mesh = mesh;

		return mesh;

	}

	dispose() {

		if ( this.geometry ) this.geometry.dispose();
		this.geometry = null;
		this.mesh = null;

	}

}

PersonGenerator.defaults = {
	height: 1.75 // overall standing height
};

// muted coat colours, picked per instance for crowd variety
const COATS = [ 0x2b3a52, 0x33332f, 0x8a6a44, 0x5a2f2f, 0x4f5238, 0x6a6a66, 0x222024 ];

function buildPersonGeometry( p ) {

	// rounded head and a short neck rising from the collar
	const head = new SphereGeometry( 0.105, 10, 8 ).translate( 0, 1.62, 0 );
	const neck = new CylinderGeometry( 0.05, 0.05, 0.08, 6 ).translate( 0, 1.52, 0 );

	// coat: broad at the shoulders, drawn in at the waist, with a slight skirt flare
	const torso = new CylinderGeometry( 0.2, 0.155, 0.5, 8 ).translate( 0, 1.24, 0 );
	const skirt = new CylinderGeometry( 0.17, 0.19, 0.22, 8 ).translate( 0, 0.95, 0 );

	// tapered arms hanging just outside the shoulders, splayed out a touch
	const armL = new CylinderGeometry( 0.055, 0.042, 0.62, 6 ).rotateZ( - 0.08 ).translate( - 0.21, 1.18, 0 );
	const armR = new CylinderGeometry( 0.055, 0.042, 0.62, 6 ).rotateZ( 0.08 ).translate( 0.21, 1.18, 0 );

	// rounded hands capping the arms
	const handL = new SphereGeometry( 0.045, 6, 3 ).translate( - 0.235, 0.87, 0 );
	const handR = new SphereGeometry( 0.045, 6, 3 ).translate( 0.235, 0.87, 0 );

	// legs standing close, tapering from thigh to ankle
	const legL = new CylinderGeometry( 0.085, 0.062, 0.9, 6 ).translate( - 0.1, 0.45, 0 );
	const legR = new CylinderGeometry( 0.085, 0.062, 0.9, 6 ).translate( 0.1, 0.45, 0 );

	// flattened feet nudged forward so the toes lead
	const footL = new BoxGeometry( 0.1, 0.05, 0.22 ).translate( - 0.1, 0.025, 0.04 );
	const footR = new BoxGeometry( 0.1, 0.05, 0.22 ).translate( 0.1, 0.025, 0.04 );

	const geometry = mergeGeometries( [ head, neck, torso, skirt, armL, armR, handL, handR, legL, legR, footL, footR ] );

	// scale the canonical 1.75 m figure to the requested height, feet stay on y = 0
	const s = p.height / 1.75;
	if ( s !== 1 ) geometry.scale( s, s, s );

	return geometry;

}

function createPersonMaterial() {

	const material = new MeshStandardNodeMaterial();
	material.colorNode = color( 0xffffff ); // white base, the per-instance coat colour multiplies in
	material.roughness = 0.85; // matte cloth
	material.metalness = 0;

	return material;

}

export { PersonGenerator };
