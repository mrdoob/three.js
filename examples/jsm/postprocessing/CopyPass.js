import { ShaderPass } from './ShaderPass.js';
import { CopyShader } from '../shaders/CopyShader.js';

class CopyPass extends ShaderPass {

	constructor() {

		super( CopyShader );

		this.material.premultipliedAlpha = true;

	}

}

export { CopyPass };
