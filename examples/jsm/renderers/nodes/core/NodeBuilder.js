import NodeUniform from './NodeUniform.js';

const VERSION = '1';

class NodeBuilder {

	constructor( material, renderer ) {

		this.material = material;
		this.renderer = renderer;

		this.slots = { vertex: [], fragment: [] };
		this.defines = { vertex: {}, fragment: {} };
		this.uniforms = { vertex: [], fragment: [] };

		this.nodesData = new WeakMap();

		this.shaderStage = null;

	}

	addSlot( shader, slot ) {

		this.slots[ shader ].push( slot );

	}

	define( shader, name, value = '' ) {

		this.defines[ shader ][ name ] = value;

	}

	generateVec2( x, y ) {

		return `vec2( ${x}, ${y})`;

	}

	generateVec3( x, y, z ) {

		return `vec3( ${x}, ${y}, ${z} )`;

	}

	generateVec4( x, y, z, w ) {

		return `vec4( ${x}, ${y}, ${z}, ${w} )`;

	}

	generateFloat( value ) {

		return value + ( value % 1 ? '' : '.0' );

	}

	getUniformNSName( nodeUniform ) {

		return nodeUniform.name;

	}

	getTypeLength( type ) {

		if ( type === 'float' ) return 1;
		if ( type === 'vec2' ) return 2;
		if ( type === 'vec3' ) return 3;
		if ( type === 'vec4' ) return 4;

		return 0;

	}

	getDataFromNode( node, shaderStage = null ) {

		let nodeData = this.nodesData.get( node );

		if ( nodeData === undefined ) {

			nodeData = { vertex: {}, fragment: {} };

			this.nodesData.set( node, nodeData );

		}

		return shaderStage ? nodeData[ shaderStage ] : nodeData;

	}

	getUniformFromNode( node, shaderStage, type ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		let nodeUniform = nodeData.uniform;

		if ( nodeUniform === undefined ) {

			const uniforms = this.uniforms[ shaderStage ];
			const index = uniforms.length;

			nodeUniform = new NodeUniform( 'nodeU' + index, type, node );

			uniforms.push( nodeUniform );

			nodeData.uniform = nodeUniform;

		}

		return nodeUniform;

	}

	/*
	analyzeNode( node ) {


	}
	*/

	flowNode( node, output ) {

		let flowData = {};
		flowData.result = node.build( this, output );

		return flowData;

	}

	buildDefines( shader ) {

		const defines = this.defines[ shader ];

		let code = '';

		for ( let name in defines ) {

			code += `#define ${name} ${defines[ name ]}\n`;

		}

		return code;

	}

	build( shaderStage ) {

		this.shaderStage = shaderStage;

		const slots = this.slots[ shaderStage ];
		const uniforms = this.uniforms[ shaderStage ];

		if ( slots.length ) {

			this.define( shaderStage, 'NODE', VERSION );

			for ( let i = 0; i < slots.length; i ++ ) {

				let slot = slots[ i ];

				let flowData = this.flowNode( slot.node, slot.output );

				this.define( shaderStage, `NODE_${slot.name}`, flowData.result );

			}

			let uniformsCode = '';

			for ( let i = 0; i < uniforms.length; i ++ ) {

				let uniform = uniforms[ i ];

				uniformsCode += `${uniform.type} ${uniform.name}; `;

			}

			this.define( shaderStage, 'NODE_UNIFORMS', uniformsCode );

		}

		let defines = this.buildDefines( shaderStage );

		return {
			defines
		};

	}

	format( code, fromType, toType ) {

		const typeToType = `${fromType} -> ${toType}`;

		switch ( typeToType ) {

			case 'float -> vec3' : return `vec3( ${code} )`;

			case 'vec3 -> float' : return `${code}.x`;

		}

		return code;

	}

}

export default NodeBuilder;
