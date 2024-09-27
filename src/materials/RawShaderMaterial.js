import { ShaderMaterial } from './ShaderMaterial.js';

class RawShaderMaterial extends ShaderMaterial {

	static get type() {

		return 'RawShaderMaterial';

	}

	constructor( parameters ) {

		super( parameters );

		this.isRawShaderMaterial = true;

	}

}

export { RawShaderMaterial };
