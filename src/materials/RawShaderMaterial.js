import { ShaderMaterial } from './ShaderMaterial.js';

class RawShaderMaterial extends ShaderMaterial {

	constructor( parameters ) {

		super( parameters );

		this.type = 'RawShaderMaterial';

	}

}

RawShaderMaterial.prototype.isRawShaderMaterial = true;

export { RawShaderMaterial };
