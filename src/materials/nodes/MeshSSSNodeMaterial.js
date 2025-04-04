import MeshPhysicalNodeMaterial from './MeshPhysicalNodeMaterial.js';
import PhysicalLightingModel from '../../nodes/functions/PhysicalLightingModel.js';
import { transformedNormalView } from '../../nodes/accessors/Normal.js';
import { positionViewDirection } from '../../nodes/accessors/Position.js';
import { float, vec3 } from '../../nodes/tsl/TSLBase.js';

/**
 * Represents the lighting model for {@link MeshSSSNodeMaterial}.
 *
 * @augments PhysicalLightingModel
 */
class SSSLightingModel extends PhysicalLightingModel {

	/**
	 * Constructs a new physical lighting model.
	 *
	 * @param {boolean} [clearcoat=false] - Whether clearcoat is supported or not.
	 * @param {boolean} [sheen=false] - Whether sheen is supported or not.
	 * @param {boolean} [iridescence=false] - Whether iridescence is supported or not.
	 * @param {boolean} [anisotropy=false] - Whether anisotropy is supported or not.
	 * @param {boolean} [transmission=false] - Whether transmission is supported or not.
	 * @param {boolean} [dispersion=false] - Whether dispersion is supported or not.
	 * @param {boolean} [sss=false] - Whether SSS is supported or not.
	 */
	constructor( clearcoat = false, sheen = false, iridescence = false, anisotropy = false, transmission = false, dispersion = false, sss = false ) {

		super( clearcoat, sheen, iridescence, anisotropy, transmission, dispersion );

		/**
		 * Whether the lighting model should use SSS or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.useSSS = sss;

	}

	/**
	 * Extends the default implementation with a SSS term.
	 *
	 * Reference: [Approximating Translucency for a Fast, Cheap and Convincing Subsurface Scattering Look]{@link https://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/}
	 *
	 * @param {Object} input - The input data.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	direct( { lightDirection, lightColor, reflectedLight }, builder ) {

		if ( this.useSSS === true ) {

			const material = builder.material;

			const { thicknessColorNode, thicknessDistortionNode, thicknessAmbientNode, thicknessAttenuationNode, thicknessPowerNode, thicknessScaleNode } = material;

			const scatteringHalf = lightDirection.add( transformedNormalView.mul( thicknessDistortionNode ) ).normalize();
			const scatteringDot = float( positionViewDirection.dot( scatteringHalf.negate() ).saturate().pow( thicknessPowerNode ).mul( thicknessScaleNode ) );
			const scatteringIllu = vec3( scatteringDot.add( thicknessAmbientNode ).mul( thicknessColorNode ) );

			reflectedLight.directDiffuse.addAssign( scatteringIllu.mul( thicknessAttenuationNode.mul( lightColor ) ) );

		}

		super.direct( { lightDirection, lightColor, reflectedLight }, builder );

	}

}

/**
 * This node material is an experimental extension of {@link MeshPhysicalNodeMaterial}
 * that implements a Subsurface scattering (SSS) term.
 *
 * @augments MeshPhysicalNodeMaterial
 */
class MeshSSSNodeMaterial extends MeshPhysicalNodeMaterial {

	static get type() {

		return 'MeshSSSNodeMaterial';

	}

	/**
	 * Constructs a new mesh SSS node material.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 */
	constructor( parameters ) {

		super( parameters );

		/**
		 * Represents the thickness color.
		 *
		 * @type {?Node<vec3>}
		 * @default null
		 */
		this.thicknessColorNode = null;

		/**
		 * Represents the distortion factor.
		 *
		 * @type {?Node<float>}
		 */
		this.thicknessDistortionNode = float( 0.1 );

		/**
		 * Represents the thickness ambient factor.
		 *
		 * @type {?Node<float>}
		 */
		this.thicknessAmbientNode = float( 0.0 );

		/**
		 * Represents the thickness attenuation.
		 *
		 * @type {?Node<float>}
		 */
		this.thicknessAttenuationNode = float( .1 );

		/**
		 * Represents the thickness power.
		 *
		 * @type {?Node<float>}
		 */
		this.thicknessPowerNode = float( 2.0 );

		/**
		 * Represents the thickness scale.
		 *
		 * @type {?Node<float>}
		 */
		this.thicknessScaleNode = float( 10.0 );

	}

	/**
	 * Whether the lighting model should use SSS or not.
	 *
	 * @type {boolean}
	 * @default true
	 */
	get useSSS() {

		return this.thicknessColorNode !== null;

	}

	/**
	 * Setups the lighting model.
	 *
	 * @return {SSSLightingModel} The lighting model.
	 */
	setupLightingModel( /*builder*/ ) {

		return new SSSLightingModel( this.useClearcoat, this.useSheen, this.useIridescence, this.useAnisotropy, this.useTransmission, this.useDispersion, this.useSSS );

	}

	copy( source ) {

		this.thicknessColorNode = source.thicknessColorNode;
		this.thicknessDistortionNode = source.thicknessDistortionNode;
		this.thicknessAmbientNode = source.thicknessAmbientNode;
		this.thicknessAttenuationNode = source.thicknessAttenuationNode;
		this.thicknessPowerNode = source.thicknessPowerNode;
		this.thicknessScaleNode = source.thicknessScaleNode;

		return super.copy( source );

	}

}

export default MeshSSSNodeMaterial;
