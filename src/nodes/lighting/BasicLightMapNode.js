import LightingNode from './LightingNode.js';
import { float } from '../tsl/TSLBase.js';

class BasicLightMapNode extends LightingNode {

	static get type() {

		return 'BasicLightMapNode';

	}

	constructor( lightMapNode = null ) {

		super();

		this.lightMapNode = lightMapNode;

	}

	setup( builder ) {

		// irradianceLightMap property is used in the indirectDiffuse() method of BasicLightingModel

		const RECIPROCAL_PI = float( 1 / Math.PI );

		builder.context.irradianceLightMap = this.lightMapNode.mul( RECIPROCAL_PI );

	}

}

export default BasicLightMapNode;
