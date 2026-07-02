import {
	BufferAttribute,
	CylinderGeometry,
	InstancedMesh,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	SphereGeometry
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, color, float, mix, mx_fractal_noise_float, positionGeometry, select, smoothstep, varying } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';

/**
 * A classic cast-iron fire hydrant: a stout barrel on a flared footing, capped by a
 * domed bonnet and a hex operating nut, with two side outlet nozzles and a larger
 * front pumper nozzle. Built once and instanced across a list of placements, dressed
 * with one cheap material that branches on a baked `partId` ( weathered red iron,
 * bare metal caps ).
 *
 * The canonical model stands on `y = 0`, centred in X / Z, with the pumper nozzle
 * facing `+Z`, so a placement whose local `+Z` faces the road presents it to traffic.
 *
 * ```js
 * const hydrants = new HydrantGenerator();
 * scene.add( hydrants.build( placements ) ); // placements: Matrix4[]
 * ```
 */
class HydrantGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, HydrantGenerator.defaults, parameters );

		this.material = null;
		this.geometry = null;
		this.mesh = null;

	}

	build( placements ) {

		this.dispose();

		if ( this.material === null ) this.material = createHydrantMaterial();
		if ( this.geometry === null ) this.geometry = buildHydrantGeometry( this.parameters );

		const mesh = new InstancedMesh( this.geometry, this.material, placements.length );
		for ( let i = 0; i < placements.length; i ++ ) mesh.setMatrixAt( i, placements[ i ] );
		mesh.castShadow = mesh.receiveShadow = true;
		mesh.name = 'Hydrants';

		this.mesh = mesh;

		return mesh;

	}

	dispose() {

		if ( this.geometry ) this.geometry.dispose();
		this.geometry = null;
		this.mesh = null;

	}

}

HydrantGenerator.defaults = {
	radius: 0.13, // barrel radius
	height: 0.55 // barrel height ( footing, bonnet and nut bring the total to ~0.9 m )
};

// material-zone codes baked per vertex
const BODY = 0, CAP = 1;

// tag a geometry with a flat partId and normalize to non-indexed for merging
function part( geometry, id ) {

	const g = geometry.index ? geometry.toNonIndexed() : geometry;
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

function buildHydrantGeometry( p ) {

	const r = p.radius, h = p.height;

	const footing = new CylinderGeometry( r * 1.5, r * 1.7, 0.08, 12 ).translate( 0, 0.04, 0 );
	const barrel = new CylinderGeometry( r, r * 1.1, h, 12 ).translate( 0, 0.08 + h / 2, 0 );
	const shoulder = new CylinderGeometry( r * 0.65, r, 0.12, 12 ).translate( 0, 0.69, 0 ); // taper up to the bonnet
	const dome = new SphereGeometry( r * 0.65, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2 ).translate( 0, 0.75, 0 );
	const nut = new CylinderGeometry( 0.05, 0.05, 0.07, 6 ).translate( 0, 0.87, 0 ); // hex operating nut on top

	// bolted flange rings where the castings meet: at the bonnet and above the footing
	const bonnetFlange = new CylinderGeometry( r * 1.18, r * 1.18, 0.035, 12 ).translate( 0, 0.645, 0 );
	const baseFlange = new CylinderGeometry( r * 1.28, r * 1.28, 0.04, 12 ).translate( 0, 0.11, 0 );

	// left and right outlet nozzles, stubs finished with a bare cap, set just below mid-barrel
	const nozzleL = new CylinderGeometry( 0.06, 0.06, 0.12, 8 ).rotateZ( Math.PI / 2 ).translate( - ( r + 0.03 ), 0.45, 0 );
	const capL = new CylinderGeometry( 0.07, 0.07, 0.025, 8 ).rotateZ( Math.PI / 2 ).translate( - ( r + 0.102 ), 0.45, 0 );
	const nozzleR = new CylinderGeometry( 0.06, 0.06, 0.12, 8 ).rotateZ( Math.PI / 2 ).translate( r + 0.03, 0.45, 0 );
	const capR = new CylinderGeometry( 0.07, 0.07, 0.025, 8 ).rotateZ( Math.PI / 2 ).translate( r + 0.102, 0.45, 0 );

	// larger front pumper nozzle, faces +Z toward the road
	const pumper = new CylinderGeometry( 0.075, 0.075, 0.12, 8 ).rotateX( Math.PI / 2 ).translate( 0, 0.4, r + 0.03 );
	const pumperCap = new CylinderGeometry( 0.085, 0.085, 0.025, 8 ).rotateX( Math.PI / 2 ).translate( 0, 0.4, r + 0.102 );

	return mergeGeometries( [
		part( footing, BODY ), part( barrel, BODY ), part( shoulder, BODY ), part( dome, BODY ),
		part( bonnetFlange, BODY ), part( baseFlange, BODY ),
		part( nozzleL, BODY ), part( nozzleR, BODY ), part( pumper, BODY ),
		part( capL, CAP ), part( capR, CAP ), part( pumperCap, CAP ), part( nut, CAP )
	] );

}

function createHydrantMaterial() {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isCap = partId.equal( CAP );

	const p = positionGeometry;

	// decades of repaints: the red fades patchily, and rust blooms up from the
	// footing and wherever the paint has flaked through
	const wear = mx_fractal_noise_float( p.mul( 9 ), 3 ).mul( 0.5 ).add( 0.5 );
	const faded = mix( color( 0x8f2f1e ), color( 0xb85a38 ), wear.mul( 0.6 ) );

	const rustMask = smoothstep( 0.28, 0.02, p.y ).max( smoothstep( 0.55, 0.85, wear ).mul( 0.5 ) );
	const body = mix( faded, color( 0x4a2c1a ), rustMask.mul( 0.8 ) );

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( isCap, color( 0x8a8a80 ), body ); // bare metal caps over the weathered red
	material.roughnessNode = select( isCap, float( 0.45 ), wear.mul( 0.3 ).add( rustMask.mul( 0.25 ) ).add( 0.5 ) );
	material.metalnessNode = select( isCap, float( 0.8 ), float( 0.15 ) );

	return material;

}

export { HydrantGenerator };
