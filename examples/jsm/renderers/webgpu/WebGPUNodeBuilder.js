import NodeSlot from '../nodes/core/NodeSlot.js';
import NodeBuilder from '../nodes/core/NodeBuilder.js';

class WebGPUNodeBuilder extends NodeBuilder {

	constructor() {

		super();

	}
	
	buildShader( shader, code ) {
		
		// use regex maybe for security?
		const versionStrIndex = code.indexOf("\n");
		
		let shaderCode = code.substr( 0, versionStrIndex ) + "\n";

		let shaderData = this.build( shader );
		
		shaderCode += shaderData.defines;

		shaderCode += code.substr( versionStrIndex );

		console.log( shaderCode );

		return shaderCode;
		
	}
	
	parse( vertexShader, fragmentShader ) {
		
		const material = this.material;
		
		if ( material.isMeshBasicMaterial ) {
			
			if ( material.color.isNode ) {
				
				this.addSlot( 'fragment', new NodeSlot( material.color, 'COLOR', 'v3' ) );
				
			}
			
		}

		vertexShader = this.buildShader( 'vertex', vertexShader );
		fragmentShader = this.buildShader( 'fragment', fragmentShader );

		return {
			vertexShader,
			fragmentShader
		};
		
	}

}

export default WebGPUNodeBuilder;
