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
		 * Main artistic SSS control. Each channel is an independent blur radius in world units,
		 * so it drives both the *size* and *color* of the scatter simultaneously: a larger value
		 * on a channel makes that wavelength bleed further under the surface, and the ratio
		 * between channels sets the apparent scatter color.
		 *
		 * The default `(0.5, 0.08, 0.03)` is human skin: red blurs ~6× wider than green, which
		 * is what makes a backlit ear glow red. Equal values (e.g. `(0.3, 0.3, 0.3)`) produce
		 * a neutral grey glow with no chromatic character.
		 *
		 * Tune by looking at thin backlit areas (ear tips, fingers): scale all channels up/down
		 * to control radius, adjust the ratio between channels to shift the scatter color.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.scatteringDistanceNode = uniform( new Color( 0.5, 0.08, 0.03 ) );

		/**
		 * Secondary color correction, applied as a multiply on the already-blurred result.
		 * Does not affect blur radius or profile shape — use it only to nudge the scatter hue
		 * after dialing in `scatteringDistanceNode`. Defaults to `(1, 1, 1)` (no effect).
		 *
		 * Useful when the per-channel blur widths give the right translucency feel but the
		 * resulting color needs a slight warm or cool shift without widening any channel.
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
