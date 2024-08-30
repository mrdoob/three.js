import NodeMaterial, { registerNodeMaterial } from './NodeMaterial.js';
import { property } from '../../nodes/core/PropertyNode.js';
import { materialReference } from '../../nodes/accessors/MaterialReferenceNode.js';
import { modelWorldMatrixInverse } from '../../nodes/accessors/ModelNode.js';
import { cameraPosition } from '../../nodes/accessors/Camera.js';
import { positionGeometry } from '../../nodes/accessors/Position.js';
import { Fn, varying, vec2, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';
import { min, max } from '../../nodes/math/MathNode.js';
import { Loop, Break } from '../../nodes/utils/LoopNode.js';
import { texture3D } from '../../nodes/accessors/Texture3DNode.js';

class VolumeNodeMaterial extends NodeMaterial {

	constructor( params = {} ) {

		super();

		this.lights = false;
		this.isVolumeNodeMaterial = true;
		this.testNode = null;

		this.setValues( params );

	}

	setup( builder ) {

		const map = texture3D( this.map, null, 0 );

		const hitBox = Fn( ( { orig, dir } ) => {

			const box_min = vec3( - 0.5 );
			const box_max = vec3( 0.5 );

			const inv_dir = dir.reciprocal();

			const tmin_tmp = box_min.sub( orig ).mul( inv_dir );
			const tmax_tmp = box_max.sub( orig ).mul( inv_dir );

			const tmin = min( tmin_tmp, tmax_tmp );
			const tmax = max( tmin_tmp, tmax_tmp );

			const t0 = max( tmin.x, max( tmin.y, tmin.z ) );
			const t1 = min( tmax.x, min( tmax.y, tmax.z ) );

			return vec2( t0, t1 );

		} );

		this.fragmentNode = Fn( () => {

			const vOrigin = varying( vec3( modelWorldMatrixInverse.mul( vec4( cameraPosition, 1.0 ) ) ) );
			const vDirection = varying( positionGeometry.sub( vOrigin ) );

			const rayDir = vDirection.normalize();
			const bounds = property( 'vec2', 'bounds' ).assign( hitBox( { orig: vOrigin, dir: rayDir } ) );

			bounds.x.greaterThan( bounds.y ).discard();

			bounds.assign( vec2( max( bounds.x, 0.0 ), bounds.y ) );

			const p = property( 'vec3', 'p' ).assign( vOrigin.add( bounds.x.mul( rayDir ) ) );
			const inc = property( 'vec3', 'inc' ).assign( vec3( rayDir.abs().reciprocal() ) );
			const delta = property( 'float', 'delta' ).assign( min( inc.x, min( inc.y, inc.z ) ) );

			delta.divAssign( materialReference( 'steps', 'float' ) );

			const ac = property( 'vec4', 'ac' ).assign( vec4( materialReference( 'base', 'color' ), 0.0 ) );

			Loop( { type: 'float', start: bounds.x, end: bounds.y, update: '+= delta' }, () => {

				const d = property( 'float', 'd' ).assign( map.uv( p.add( 0.5 ) ).r );

				if ( this.testNode !== null ) {

					this.testNode( { map: map, mapValue: d, probe: p, finalColor: ac } ).append();

				} else {

					// default to show surface of mesh
					ac.a.assign( 1 );
					Break();

				}

				p.addAssign( rayDir.mul( delta ) );

			} );

			ac.a.equal( 0 ).discard();

			return vec4( ac );

		} )();

		super.setup( builder );

	}

}

export default VolumeNodeMaterial;

VolumeNodeMaterial.type = /*@__PURE__*/ registerNodeMaterial( 'Volume', VolumeNodeMaterial );
