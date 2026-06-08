import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';
import { mrt } from '../../nodes/core/MRTNode.js';
import { uniform, vec4 } from '../../nodes/tsl/TSLBase.js';
import { diffuseColor } from '../../nodes/core/PropertyNode.js';
import { Color } from '../../math/Color.js';

/**
 * A standard node material that opts into screen-space subsurface scattering
 * when used with {@link SSSSNode}.
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
		 * Subsurface scattering strength. 0 = none, 1 = full. Expected range is [0, 1].
		 *
		 * @type {UniformNode<float>}
		 */
		this.strengthNode = uniform( 1.0 );

		/**
		 * Albedo-SSS interaction mode. Values match SSSSNode.TEXTURING_MODE:
		 *
		 * - `NONE` (0): `blur(color)` — blurs the lit color directly. Use for surfaces without
		 *   a meaningful albedo texture (constant-color materials, metallic surfaces, debug
		 *   scenarios).
		 * - `PRE_AND_POST_SCATTER` (1): `sqrt(albedo) * blur(color / sqrt(albedo))` — albedo
		 *   partially bleeds into the blur, tinting the scattered light with the surface color.
		 *   Use when strong pigmentation (birthmarks, bruises, tattoos) should influence the
		 *   subsurface color, or for stylised/painterly skin where a softer texture boundary
		 *   is desirable.
		 * - `POST_SCATTER` (2): `albedo * blur(color / albedo)` — preserves high-frequency
		 *   albedo detail; recommended for scanned skin textures.
		 *
		 * @type {UniformNode<float>}
		 * @default 2 (POST_SCATTER)
		 */
		this.texturingModeNode = uniform( 2 );

		/**
		 * Slot index in the shared SSS parameter buffer, written into `albedo.a`
		 * during the geometry pass. Assigned automatically by {@link SSSSNode};
		 * do not set manually.
		 *
		 * @type {UniformNode<float>}
		 */
		this.subsurfaceSlotNode = uniform( 0 );

	}

	setup( builder ) {

		this.mrtNode = mrt( {
			albedo: vec4( diffuseColor.rgb, this.subsurfaceSlotNode ),
		} );

		super.setup( builder );

	}

	copy( source ) {

		this.scatteringDistanceNode = source.scatteringDistanceNode;
		this.scatteringColorNode = source.scatteringColorNode;
		this.strengthNode = source.strengthNode;
		this.texturingModeNode = source.texturingModeNode;
		// subsurfaceSlotNode is NOT copied — each instance owns its own slot

		return super.copy( source );

	}

}

export default MeshSubsurfaceNodeMaterial;
