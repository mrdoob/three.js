import NodeUniform from './NodeUniform.js';
import NodeAttribute from './NodeAttribute.js';
import NodeVary from './NodeVary.js';
import NodeVar from './NodeVar.js';
import NodeCode from './NodeCode.js';
import NodeKeywords from './NodeKeywords.js';
import { NodeUpdateType } from './constants.js';

import { LinearEncoding } from 'three';

class NodeBuilder {

	constructor( material, renderer ) {

		this.material = material;
		this.renderer = renderer;

		this.nodes = [];
		this.updateNodes = [];

		this.vertexShader = null;
		this.fragmentShader = null;

		this.slots = { vertex: [], fragment: [] };
		this.defines = { vertex: {}, fragment: {} };
		this.uniforms = { vertex: [], fragment: [], index: 0 };
		this.codes = { vertex: [], fragment: [] };
		this.attributes = [];
		this.varys = [];
		this.vars = { vertex: [], fragment: [] };
		this.flow = { code: '' };

		this.context = {
			keywords: new NodeKeywords(),
			material: material
		};

		this.nodesData = new WeakMap();

		this.shaderStage = null;
		this.slot = null;

	}

	addNode( node ) {

		if ( this.nodes.indexOf( node ) === - 1 ) {

			const updateType = node.getUpdateType( this );

			if ( updateType !== NodeUpdateType.None ) {

				this.updateNodes.push( node );

			}

			this.nodes.push( node );

		}

	}

	addSlot( shaderStage, slot ) {

		this.slots[ shaderStage ].push( slot );

	}

	define( shaderStage, name, value = '' ) {

		this.defines[ shaderStage ][ name ] = value;

	}

	setContext( context ) {

		this.context = context;

	}

	getContext() {

		return this.context;

	}

	getContextValue( name ) {

		return this.context[ name ];

	}

	getTexture( /* textureProperty, uvSnippet, biasSnippet = null */ ) {

		console.warn( 'Abstract function.' );

	}

	getCubeTexture( /* textureProperty, uvSnippet, biasSnippet = null */ ) {

		console.warn( 'Abstract function.' );

	}

	getConst( type, value ) {

		if ( type === 'float' ) return value + ( value % 1 ? '' : '.0' );
		if ( type === 'vec2' ) return `vec2( ${value.x}, ${value.y} )`;
		if ( type === 'vec3' ) return `vec3( ${value.x}, ${value.y}, ${value.z} )`;
		if ( type === 'vec4' ) return `vec4( ${value.x}, ${value.y}, ${value.z}, ${value.w} )`;
		if ( type === 'color' ) return `vec3( ${value.r}, ${value.g}, ${value.b} )`;

		throw new Error( `NodeBuilder: Type '${type}' not found in generate constant attempt.` );

	}

	getAttribute( name, type ) {

		const attributes = this.attributes;

		// find attribute

		for ( const attribute of attributes ) {

			if ( attribute.name === name ) {

				return attribute;

			}

		}

		// create a new if no exist

		const attribute = new NodeAttribute( name, type );

		attributes.push( attribute );

		return attribute;

	}

	getPropertyName( node ) {

		return node.name;

	}

	isVector( type ) {

		return /vec\d/.test( type );

	}

	isMatrix( type ) {

		return /mat\d/.test( type );

	}

	isShaderStage( shaderStage ) {

		return this.shaderStage === shaderStage;

	}

	getTextureEncodingFromMap( map ) {

		let encoding;

		if ( map && map.isTexture ) {

			encoding = map.encoding;

		} else if ( map && map.isWebGLRenderTarget ) {

			encoding = map.texture.encoding;

		} else {

			encoding = LinearEncoding;

		}

		return encoding;

	}

	getVectorType( type ) {

		if ( type === 'color' ) return 'vec3';
		if ( type === 'texture' ) return 'vec4';

		return type;

	}

	getTypeFromLength( type ) {

		if ( type === 1 ) return 'float';
		if ( type === 2 ) return 'vec2';
		if ( type === 3 ) return 'vec3';
		if ( type === 4 ) return 'vec4';

		return 0;

	}

	getTypeLength( type ) {

		const vecType = this.getVectorType( type );

		if ( vecType === 'float' ) return 1;
		if ( vecType === 'vec2' ) return 2;
		if ( vecType === 'vec3' ) return 3;
		if ( vecType === 'vec4' ) return 4;

		return 0;

	}

	getVectorFromMatrix( type ) {

		return 'vec' + type.substr( 3 );

	}

	getDataFromNode( node, shaderStage = this.shaderStage ) {

		let nodeData = this.nodesData.get( node );

		if ( nodeData === undefined ) {

			nodeData = { vertex: {}, fragment: {} };

			this.nodesData.set( node, nodeData );

		}

		return shaderStage !== null ? nodeData[ shaderStage ] : nodeData;

	}

	getUniformFromNode( node, shaderStage, type ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		let nodeUniform = nodeData.uniform;

		if ( nodeUniform === undefined ) {

			const index = this.uniforms.index ++;

			nodeUniform = new NodeUniform( 'nodeUniform' + index, type, node );

			this.uniforms[ shaderStage ].push( nodeUniform );

			nodeData.uniform = nodeUniform;

		}

		return nodeUniform;

	}

	getVarFromNode( node, type, shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		let nodeVar = nodeData.variable;

		if ( nodeVar === undefined ) {

			const vars = this.vars[ shaderStage ];
			const index = vars.length;

			nodeVar = new NodeVar( 'nodeVar' + index, type );

			vars.push( nodeVar );

			nodeData.variable = nodeVar;

		}

		return nodeVar;

	}

	getVaryFromNode( node, type ) {

		const nodeData = this.getDataFromNode( node, null );

		let nodeVary = nodeData.vary;

		if ( nodeVary === undefined ) {

			const varys = this.varys;
			const index = varys.length;

			nodeVary = new NodeVary( 'nodeVary' + index, type );

			varys.push( nodeVary );

			nodeData.vary = nodeVary;

		}

		return nodeVary;

	}

	getCodeFromNode( node, type, shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( node );

		let nodeCode = nodeData.code;

		if ( nodeCode === undefined ) {

			const codes = this.codes[ shaderStage ];
			const index = codes.length;

			nodeCode = new NodeCode( 'nodeCode' + index, type );

			codes.push( nodeCode );

			nodeData.code = nodeCode;

		}

		return nodeCode;

	}

	addFlowCode( code ) {

		if ( ! /;\s*$/.test( code ) ) {

			code += ';';

		}

		this.flow.code += code + ' ';

	}

	flowSlot( slot, shaderStage = this.shaderStage ) {

		this.slot = slot;

		const flowData = this.flowNode( slot.node, slot.output );

		this.define( shaderStage, `NODE_CODE_${slot.name}`, flowData.code );
		this.define( shaderStage, `NODE_${slot.name}`, flowData.result );

		this.slot = null;

	}

	flowNode( node, output = null ) {

		const previousFlow = this.flow;

		const flow = {
			code: '',
		};

		this.flow = flow;

		flow.result = node.build( this, output );

		this.flow = previousFlow;

		return flow;

	}

	flowNodeFromShaderStage( shaderStage, node, output = null, propertyName = null ) {

		const previousShaderStage = this.shaderStage;

		this.setShaderStage( shaderStage );

		const flowData = this.flowNode( node, output );

		if ( propertyName !== null ) {

			flowData.code += `${propertyName} = ${flowData.result}; `;

		}

		const shaderStageCode = this.defines[ shaderStage ][ 'NODE_CODE' ] + flowData.code;

		this.define( shaderStage, 'NODE_CODE', shaderStageCode );

		this.setShaderStage( previousShaderStage );

		return flowData;

	}

	getDefines( shaderStage ) {

		const defines = this.defines[ shaderStage ];

		let code = '';

		for ( const name in defines ) {

			code += `#define ${name} ${defines[ name ]}\n`;

		}

		return code;

	}

	getAttributes( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			const attributes = this.attributes;

			for ( let index = 0; index < attributes.length; index ++ ) {

				const attribute = attributes[ index ];

				snippet += `layout(location = ${index}) in ${attribute.type} ${attribute.name}; `;

			}

		}

		return snippet;

	}

	getVarys( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVars( shaderStage ) {

		let snippet = '';

		const vars = this.vars[ shaderStage ];

		for ( let index = 0; index < vars.length; index ++ ) {

			const variable = vars[ index ];

			snippet += `${variable.type} ${variable.name}; `;

		}

		return snippet;

	}

	getUniforms( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getCodes( shaderStage ) {

		const codes = this.codes[ shaderStage ];

		let code = '';

		for ( const nodeCode of codes ) {

			code += nodeCode.code + '\n';

		}

		return code;

	}

	getHash() {

		return this.vertexShader + this.fragmentShader;

	}

	getShaderStage() {

		return this.shaderStage;

	}

	setShaderStage( shaderStage ) {

		this.shaderStage = shaderStage;

	}

	build() {

		const shaderStages = [ 'vertex', 'fragment' ];
		const shaderData = {};

		for ( const shaderStage of shaderStages ) {

			this.setShaderStage( shaderStage );

			this.define( shaderStage, 'NODE_CODE', '' );

			const slots = this.slots[ shaderStage ];

			for ( const slot of slots ) {

				this.flowSlot( slot, shaderStage );

			}

		}

		this.setShaderStage( null );

		for ( const shaderStage of shaderStages ) {

			const defines = this.getDefines( shaderStage );
			const uniforms = this.getUniforms( shaderStage );
			const attributes = this.getAttributes( shaderStage );
			const varys = this.getVarys( shaderStage );
			const vars = this.getVars( shaderStage );
			const codes = this.getCodes( shaderStage );

			shaderData[ shaderStage ] = `
				// <node_builder>

				#define NODE_MATERIAL

				// defines
				${defines}

				// uniforms
				${uniforms}

				// attributes
				${attributes}

				// varys
				${varys}

				// vars
				${vars}

				// codes
				${codes}

				// </node_builder>
				`;

		}

		this.vertexShader = shaderData.vertex;
		this.fragmentShader = shaderData.fragment;

		return this;

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
			case 'vec2 to vec3'  : return `vec3( ${snippet}, 0.0 )`;
			case 'vec2 to vec4'  : return `vec4( ${snippet}.xy, 0.0, 1.0 )`;

			case 'vec3 to float' : return `${snippet}.x`;
			case 'vec3 to vec2'  : return `${snippet}.xy`;
			case 'vec3 to vec4'  : return `vec4( ${snippet}, 1.0 )`;

			case 'vec4 to float' : return `${snippet}.x`;
			case 'vec4 to vec2'  : return `${snippet}.xy`;
			case 'vec4 to vec3'  : return `${snippet}.xyz`;

			case 'mat3 to float' : return `( ${snippet} * vec3( 1.0 ) ).x`;
			case 'mat3 to vec2'  : return `( ${snippet} * vec3( 1.0 ) ).xy`;
			case 'mat3 to vec3'  : return `( ${snippet} * vec3( 1.0 ) ).xyz`;
			case 'mat3 to vec4'  : return `vec4( ${snippet} * vec3( 1.0 ), 1.0 )`;

			case 'mat4 to float' : return `( ${snippet} * vec4( 1.0 ) ).x`;
			case 'mat4 to vec2'  : return `( ${snippet} * vec4( 1.0 ) ).xy`;
			case 'mat4 to vec3'  : return `( ${snippet} * vec4( 1.0 ) ).xyz`;
			case 'mat4 to vec4'  : return `( ${snippet} * vec4( 1.0 ) )`;

		}

		return snippet;

	}


}

export default NodeBuilder;
