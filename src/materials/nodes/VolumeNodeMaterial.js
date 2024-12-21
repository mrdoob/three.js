import NodeMaterial from './NodeMaterial.js';
import { property } from '../../nodes/core/PropertyNode.js';
import { materialReference } from '../../nodes/accessors/MaterialReferenceNode.js';
import { modelWorldMatrixInverse } from '../../nodes/accessors/ModelNode.js';
import { cameraPosition } from '../../nodes/accessors/Camera.js';
import { positionGeometry } from '../../nodes/accessors/Position.js';
import { Fn, varying, float, vec2, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';
import { min, max } from '../../nodes/math/MathNode.js';
import { Loop, Break } from '../../nodes/utils/LoopNode.js';
import { texture3D } from '../../nodes/accessors/Texture3DNode.js';
import { Color } from '../../math/Color.js';

/** @module VolumeNodeMaterial **/

/**
 * Node material intended for volume rendering. The volumetic data are
 * defined with an instance of {@link Data3DTexture}.
 *
 * @augments NodeMaterial
 */
class VolumeNodeMaterial extends NodeMaterial {

	static get type() {

		return 'VolumeNodeMaterial';

	}

	/**
	 * Constructs a new volume node material.
	 *
	 * @param {Object?} parameters - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isVolumeNodeMaterial = true;

		/**
		 * The base color of the volume.
		 *
		 * @type {Color}
		 * @default 100
		 */
		this.base = new Color( 0xffffff );

		/**
		 * A 3D data texture holding the volumetric data.
		 *
		 * @type {Data3DTexture?}
		 * @default null
		 */
		this.map = null;

		/**
		 * This number of samples for each ray that hits the mesh's surface
		 * and travels through the volume.
		 *
		 * @type {Number}
		 * @default 100
		 */
		this.steps = 100;

		/**
		 * Callback for {@link VolumeNodeMaterial#testNode}.
		 *
		 * @callback testNodeCallback
		 * @param {Data3DTexture<float>} map - The 3D texture.
		 * @param {Node<float>} mapValue - The sampled value inside the volume.
		 * @param {Node<vec3>} probe - The probe which is the entry point of the ray on the mesh's surface.
		 * @param {Node<vec4>} finalColor - The final color.
		 */

		/**
		 * The volume rendering of this material works by shooting rays
		 * from the camera position through each fragment of the mesh's
		 * surface and sample the inner volume in a raymarching fashion
		 * mutiple times.
		 *
		 * This node can be used to assign a callback function of type `Fn`
		 * that will be exexuted per sample. The callback receives the
		 * texture, the sampled texture value as well as position on the surface
		 * where the rays enters the volume. The last parameter is a color
		 * that allows the callback to determine the final color.
		 *
		 * @type {testNodeCallback?}
		 * @default null
		 */
		this.testNode = null;

		this.setValues( parameters );

	}

	/**
	 * Setups the vertex and fragment stage of this node material.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
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
			const bounds = vec2( hitBox( { orig: vOrigin, dir: rayDir } ) ).toVar();

			bounds.x.greaterThan( bounds.y ).discard();

			bounds.assign( vec2( max( bounds.x, 0.0 ), bounds.y ) );

			const p = vec3( vOrigin.add( bounds.x.mul( rayDir ) ) ).toVar();
			const inc = vec3( rayDir.abs().reciprocal() ).toVar();
			const delta = float( min( inc.x, min( inc.y, inc.z ) ) ).toVar( 'delta' ); // used 'delta' name in loop

			delta.divAssign( materialReference( 'steps', 'float' ) );

			const ac = vec4( materialReference( 'base', 'color' ), 0.0 ).toVar();

			Loop( { type: 'float', start: bounds.x, end: bounds.y, update: '+= delta' }, () => {

				const d = property( 'float', 'd' ).assign( map.sample( p.add( 0.5 ) ).r );

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
