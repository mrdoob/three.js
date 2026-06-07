import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';
import { mrt } from '../../nodes/core/MRTNode.js';
import { uniform, vec4 } from '../../nodes/tsl/TSLBase.js';
import { diffuseColor } from '../../nodes/core/PropertyNode.js';
import { Color } from '../../math/Color.js';

/**
 * A standard node material that opts into screen-space subsurface scattering
 * when used with {@link SSSSNode}. Writes per-object SSS parameters into
 * dedicated MRT slots (`sssParams0`, `sssParams1`) so the SSSS blur pass can
 * apply a distinct scattering profile per material.
 *
 * MRT layout written by this material:
 * - `albedo`:    rgb = base color, a = texturingMode (SSSSNode.TEXTURING_MODE; 0 = no SSS)
 * - `sssParams0`: rgb = scatteringDistance (world units per channel), a = worldScale
 * - `sssParams1`: rgb = scatteringColor (artistic tint), a = strength (blend factor)
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
		 * World-space multiplier applied to `scatteringDistance`.
		 *
		 * @type {UniformNode<float>}
		 */
		this.worldScaleNode = uniform( 1.0 );

		/**
		 * Albedo-SSS interaction mode, stored directly in albedo.a.
		 * Values match SSSSNode.TEXTURING_MODE: 1 = POST_SCATTER,
		 * 2 = PRE_AND_POST_SCATTER, 3 = NONE. 0 is reserved for non-SSS pixels.
		 *
		 * @type {UniformNode<float>}
		 * @default 2 (PRE_AND_POST_SCATTER)
		 */
		this.texturingModeNode = uniform( 2 );

	}

	setup( builder ) {

		this.mrtNode = mrt( {
			albedo: vec4( diffuseColor.rgb, this.texturingModeNode ),
			sssParams0: vec4( this.scatteringDistanceNode, this.worldScaleNode ),
			sssParams1: vec4( this.scatteringColorNode, this.strengthNode ),
		} );

		super.setup( builder );

	}

	copy( source ) {

		this.scatteringDistanceNode = source.scatteringDistanceNode;
		this.scatteringColorNode = source.scatteringColorNode;
		this.strengthNode = source.strengthNode;
		this.worldScaleNode = source.worldScaleNode;
		this.texturingModeNode = source.texturingModeNode;

		return super.copy( source );

	}

}

export default MeshSubsurfaceNodeMaterial;
