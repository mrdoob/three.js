import LightingModel from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { MultiplyOperation, MixOperation, AddOperation } from '../../constants.js';
import { materialSpecularStrength, materialReflectivity } from '../accessors/MaterialNode.js';
import { mix } from '../math/MathNode.js';

class BasicLightingModel extends LightingModel {

	constructor() {

		super();

	}

	indirectDiffuse( { ambientOcclusion, reflectedLight } ) {

		reflectedLight.indirectDiffuse.addAssign( diffuseColor.rgb );

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

	}

	finish( context, stack, builder ) {

		const material = builder.material;
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
					console.warn( 'THREE.BasicLightingModel: Unsupported .combine value:', material.combine );
					break;

			}

		}

	}

}

export default BasicLightingModel;
