import NodeUniform from './NodeUniform.js';

const VERSION = '1';

class NodeBuilder {

	constructor( material, renderer ) {

		this.material = material;
		this.renderer = renderer;

		this.nodes = [];

		this.slots = { vertex: [], fragment: [] };
		this.defines = { vertex: {}, fragment: {} };
		this.uniforms = { vertex: [], fragment: [] };

		this.nodesData = new WeakMap();

		this.shaderStage = null;

	}

	addNode( node ) {
		
		if ( this.nodes.indexOf( node ) === -1 ) {
			
			this.nodes.push( node );
			
		}
		
	}

	addSlot( shaderStage, slot ) {

		this.slots[ shaderStage ].push( slot );

	}

	define( shaderStage, name, value = '' ) {

		this.defines[ shaderStage ][ name ] = value;

	}

	getTexture( textureSnippet, uvSnippet ) {
		
		
		
	}

	getConst( type, value ) {
		
		if ( type === 'float' ) return value + ( value % 1 ? '' : '.0' );
		if ( type === 'vec2' ) return `vec2( ${value.x}, ${value.y} )`;
		if ( type === 'vec3' ) return `vec3( ${value.x}, ${value.y}, ${value.z} )`;
		if ( type === 'vec4' ) return `vec4( ${value.x}, ${value.y}, ${value.z}, ${value.w} )`;
		
	}
	
	getUV( /*index*/ ) {
		
		// uv1 only for now
		return 'vUv';
		
	}

	getPropertyName( nodeUniform ) {

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

	_buildDefines( shader ) {

		const defines = this.defines[ shader ];

		let code = '';

		for ( let name in defines ) {

			code += `#define ${name} ${defines[ name ]}\n`;

		}

		return code;

	}

	getUniformsOutput( shaderStage ) {
		
		const uniforms = this.uniforms[ shaderStage ];
		
		let uniformsCode = '';

		for ( let i = 0; i < uniforms.length; i ++ ) {

			let uniform = uniforms[ i ];

			uniformsCode += `${uniform.type} ${uniform.name}; `;

		}
		
		return uniformsCode;
		
	}

	build( shaderStage ) {

		this.shaderStage = shaderStage;

		const slots = this.slots[ shaderStage ];
		
		if ( slots.length ) {

			this.define( shaderStage, 'NODE', VERSION );

			for ( let i = 0; i < slots.length; i ++ ) {

				let slot = slots[ i ];

				let flowData = this.flowNode( slot.node, slot.output );

				this.define( shaderStage, `NODE_${slot.name}`, flowData.result );

			}

			this.define( shaderStage, 'NODE_UNIFORMS', this.getUniformsOutput( shaderStage ) );

		}

		let defines = this._buildDefines( shaderStage );

		return {
			defines
		};

	}
	
	getVectorType( type ) {
		
		if ( type === 'texture' ) return 'vec4';
		
		return type;
		
	}
	
	format( snippet, fromType, toType ) {

		fromType = this.getVectorType( fromType );
		toType = this.getVectorType( toType );

		const typeToType = `${fromType} to ${toType}`;

		switch ( typeToType ) {

			case 'float to vec2' : return `vec2( ${snippet} )`;
			case 'float to vec3' : return `vec3( ${snippet} )`;
			case 'float to vec4' : return `vec4( vec3( ${snippet} ), 1.0 )`;

			case 'vec2 to float' : return `${snippet}.x`;
			case 'vec2 to vec3' : return `vec3( ${snippet}.x, ${snippet}.y, 0.0 )`;
			case 'vec2 to vec4' : return `vec4( ${snippet}.x, ${snippet}.y, 0.0, 1.0 )`;

			case 'vec3 to float' : return `${snippet}.x`;
			case 'vec3 to vec2' : return `${snippet}.xy`;
			case 'vec3 to vec4' : return `vec4( ${snippet}.x, ${snippet}.y, ${snippet}.z, 1.0 )`;
			
			case 'vec4 to float' : return `${snippet}.x`;
			case 'vec4 to vec2' : return `${snippet}.xy`;
			case 'vec4 to vec3' : return `${snippet}.xyz`;

		}

		return snippet;

	}

}

export default NodeBuilder;
