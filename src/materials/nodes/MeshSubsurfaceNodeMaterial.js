import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';
import { mrt } from '../../nodes/core/MRTNode.js';
import { uniform, vec4 } from '../../nodes/tsl/TSLBase.js';
import { diffuseColor } from '../../nodes/core/PropertyNode.js';
import { Color } from '../../math/Color.js';

/**
 * A standard node material that opts into screen-space subsurface scattering
 * when used with {@link SSSSNode}. Pass the scene to `subsurfaceScattering()` and
 * SSSSNode will discover, register, and track this material automatically via
 * scene graph events — no manual registration needed.
 *
 * Call `dispose()` when the material is no longer needed.
 *
 * @augments MeshStandardNodeMaterial
 */
class MeshSubsurfaceNodeMaterial extends MeshStandardNodeMaterial {

	static get type() {

		return 'MeshSubsurfaceNodeMaterial';

	}

	/**
	 * Constructs a new mesh subsurface node material.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 */
	constructor( parameters ) {

		super( parameters );

		this.isMeshSubsurfaceNodeMaterial = true;

		/**
		 * Per-channel scattering radius in world units (r, g, b).
		 * Larger values produce more translucency on each channel.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.scatteringDistanceNode = uniform( new Color( 0.5, 0.08, 0.03 ) );

		/**
		 * Optional artistic tint multiplied onto the blurred result.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.scatteringColorNode = uniform( new Color( 1, 1, 1 ) );

		/**
		 * Blend factor between the original and blurred color.
		 *
		 * @type {UniformNode<float>}
		 */
		this.strengthNode = uniform( 1.0 );

		/**
		 * Albedo-SSS interaction mode. Values match SSSSNode.TEXTURING_MODE:
		 * 0 = POST_SCATTER, 1 = PRE_AND_POST_SCATTER, 2 = NONE.
		 *
		 * @type {UniformNode<float>}
		 * @default 1 (PRE_AND_POST_SCATTER)
		 */
		this.texturingModeNode = uniform( 1 );

		/**
		 * Slot index in the shared SSS parameter buffer, written into `albedo.a`
		 * during the geometry pass. Assigned automatically by {@link SSSSNode};
		 * do not set manually.
		 *
		 * @type {UniformNode<float>}
		 */
		this.sssSlotNode = uniform( 0 );

	}

	setup( builder ) {

		this.mrtNode = mrt( {
			albedo: vec4( diffuseColor.rgb, this.sssSlotNode ),
		} );

		super.setup( builder );

	}

	copy( source ) {

		this.scatteringDistanceNode = source.scatteringDistanceNode;
		this.scatteringColorNode = source.scatteringColorNode;
		this.strengthNode = source.strengthNode;
		this.texturingModeNode = source.texturingModeNode;
		// sssSlotNode is NOT copied — each instance owns its own slot

		return super.copy( source );

	}

}

export default MeshSubsurfaceNodeMaterial;
