import {
	shininess, specularColor,
	materialShininess, materialSpecular,
	float
} from '../../nodes/Nodes.js';

import PhongLightingModel from '../../nodes/functions/PhongLightingModel.js';

import MeshPhongMaterial from '../MeshPhongMaterial.js';

class MeshPhongNodeMaterial extends MeshPhongMaterial {

	constructor( parameters ) {

		super();

		this.isMeshPhongNodeMaterial = true;

		this.shininessNode = null;
		this.specularNode = null;

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new PhongLightingModel();

	}

	setupVariants() {

		// SHININESS

		const shininessNode = ( this.shininessNode ? float( this.shininessNode ) : materialShininess ).max( 1e-4 ); // to prevent pow( 0.0, 0.0 )

		shininess.assign( shininessNode );

		// SPECULAR COLOR

		const specularNode = this.specularNode || materialSpecular;

		specularColor.assign( specularNode );

	}

	copy( source ) {

		this.shininessNode = source.shininessNode;
		this.specularNode = source.specularNode;

		return super.copy( source );

	}

}

export default MeshPhongNodeMaterial;
