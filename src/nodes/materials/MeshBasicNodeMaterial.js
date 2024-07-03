import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { materialSpecularStrength, materialReflectivity } from '../accessors/MaterialNode.js';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial.js';
import { MultiplyOperation, MixOperation, AddOperation } from '../../constants.js';
import { mix } from '../math/MathNode.js';

const defaultValues = new MeshBasicMaterial();

class MeshBasicNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshBasicNodeMaterial = true;

		this.lights = false;
		//this.normals = false; @TODO: normals usage by context

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupVariants( builder ) {

		const envNode = this.getEnvNode( builder );

		if ( envNode !== null ) {

			switch ( this.combine ) {

				case MultiplyOperation:
					diffuseColor.assign( mix( diffuseColor.rgb, diffuseColor.rgb.mul( envNode.rgb ), materialSpecularStrength.mul( materialReflectivity ) ) );
					break;

				case MixOperation:
					diffuseColor.assign( mix( diffuseColor.rgb, envNode.rgb, materialSpecularStrength.mul( materialReflectivity ) ) );
					break;

				case AddOperation:
					diffuseColor.addAssign( envNode.rgb.mul( materialSpecularStrength.mul( materialReflectivity ) ) );
					break;

				default:
					console.warn( 'THREE.MeshBasicNodeMaterial: Unsupported .combine value:', this.combine );
					break;

			}

		}


	}

}

export default MeshBasicNodeMaterial;

addNodeMaterial( 'MeshBasicNodeMaterial', MeshBasicNodeMaterial );
