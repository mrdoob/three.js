import LightingModel from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { MultiplyOperation, MixOperation, AddOperation } from '../../constants.js';
import { materialSpecularStrength, materialReflectivity } from '../accessors/MaterialNode.js';
import { mix } from '../math/MathNode.js';
import { vec4 } from '../tsl/TSLBase.js';
import { warn } from '../../utils.js';

/**
 * Represents the lighting model for unlit materials. The only light contribution
 * is baked indirect lighting modulated with ambient occlusion and the material's
 * diffuse color. Environment mapping is supported. Used in {@link MeshBasicNodeMaterial}.
 *
 * @augments LightingModel
 */
class BasicLightingModel extends LightingModel {

	/**
	 * Constructs a new basic lighting model.
	 */
	constructor() {

		super();

	}

	/**
	 * Implements the baked indirect lighting with its modulation.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	indirect( { context } ) {

		const ambientOcclusion = context.ambientOcclusion;
		const reflectedLight = context.reflectedLight;
		const irradianceLightMap = context.irradianceLightMap;

		reflectedLight.indirectDiffuse.assign( vec4( 0.0 ) );

		// accumulation (baked indirect lighting only)

		if ( irradianceLightMap ) {

			reflectedLight.indirectDiffuse.addAssign( irradianceLightMap );

		} else {

			reflectedLight.indirectDiffuse.addAssign( vec4( 1.0, 1.0, 1.0, 0.0 ) );

		}

		// modulation

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

		reflectedLight.indirectDiffuse.mulAssign( diffuseColor.rgb );

	}

	/**
	 * Implements the environment mapping.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	finish( builder ) {

		const { material, context } = builder;

		const outgoingLight = context.outgoingLight;
		const envNode = builder.context.environment;

		if ( envNode ) {

			switch ( material.combine ) {

				case MultiplyOperation:
					outgoingLight.rgb.assign( mix( outgoingLight.rgb, outgoingLight.rgb.mul( envNode.rgb ), materialSpecularStrength.mul( materialReflectivity ) ) );
					break;

				case MixOperation:
					outgoingLight.rgb.assign( mix( outgoingLight.rgb, envNode.rgb, materialSpecularStrength.mul( materialReflectivity ) ) );
					break;

				case AddOperation:
					outgoingLight.rgb.addAssign( envNode.rgb.mul( materialSpecularStrength.mul( materialReflectivity ) ) );
					break;

				default:
					warn( 'BasicLightingModel: Unsupported .combine value:', material.combine );
					break;

			}

		}

	}

}

export default BasicLightingModel;
