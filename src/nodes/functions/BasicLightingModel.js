import LightingModel from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { MultiplyOperation, MixOperation, AddOperation } from '../../constants.js';
import { materialSpecularStrength, materialReflectivity } from '../accessors/MaterialNode.js';
import { mix } from '../math/MathNode.js';

class BasicLightingModel extends LightingModel {

	constructor( envNode = null, combine = MultiplyOperation ) {

		super();

		this.envNode = envNode;
		this.combine = combine;

	}

	indirectDiffuse( { reflectedLight } ) {

		reflectedLight.indirectDiffuse.assign( diffuseColor.rgb );

	}

	finish( context ) {

		const outgoingLight = context.outgoingLight;
		const envNode = this.envNode;

		if ( envNode ) {

			switch ( this.combine ) {

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
					console.warn( 'THREE.BasicLightingModel: Unsupported .combine value:', this.combine );
					break;

			}

		}

	}

}

export default BasicLightingModel;
