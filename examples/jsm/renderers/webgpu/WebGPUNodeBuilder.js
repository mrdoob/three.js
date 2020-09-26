import { NodeBuilder } from '../../nodes/core/NodeBuilder.js';

class WebGPUNodeBuilder extends NodeBuilder {

	constructor() {

		super();

	}
	
	parseDefines( code, defines ) {
		
		// use regex maybe for security?
		let versionStrIndex = code.indexOf("\n");
		
		let shaderCode = code.substr( 0, versionStrIndex ) + "\n";
		const names = Object.keys( defines );
		
		if (names.length) {

			shaderCode += "\n#define NODE\n";

			for ( let i = 0; i < names.length; i ++ ) {

				let name = names[i];

				shaderCode += `#define NODE_${name} ${defines[name]}\n`;

			}

		}

		shaderCode += code.substr( versionStrIndex );

		return shaderCode;
		
	}
	
	parse( vertexShader, fragmentShader ) {
		
		const material = this.material;
		
		const nodesSlots = [];
		const defines = [];
		
		let i, slot;
		
		if ( material.isMeshBasicMaterial ) {
			
			if ( material.color.isNode ) {
				
				slot = { name: 'COLOR', node: material.color, output: 'v3' };
				
				nodesSlots.push( slot );
				
			}
			
		}
		
		for( i = 0; i < nodesSlots.length; i++) {
			
			nodesSlots[i].node.analyze( this );
			
		}
		
		for( i = 0; i < nodesSlots.length; i++) {
			
			slot = nodesSlots[i];
			
			let flowData = slot.node.flow( this, slot.output );
			
			defines[slot.name] = flowData.result;
			defines[slot.name + '_CODE'] = flowData.code || '';
			
		}
		
		vertexShader = this.parseDefines( vertexShader, defines );
		fragmentShader = this.parseDefines( fragmentShader, defines );

		return {
			vertexShader,
			fragmentShader
		};
		
	}

}

export default WebGPUNodeBuilder;
