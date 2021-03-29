import NodeUniform from './NodeUniform.js';
import NodeAttribute from './NodeAttribute.js';
import NodeVary from './NodeVary.js';
import NodeVar from './NodeVar.js';
import NodeCode from './NodeCode.js';
import NodeKeywords from './NodeKeywords.js';
import { NodeUpdateType } from './constants.js';

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
		this.uniforms = { vertex: [], fragment: [] };
		this.nodeCodes = { vertex: [], fragment: [] };
		this.vars = { vertex: [], fragment: [] };
		this.attributes = [];
		this.varys = [];
		this.flow = { code: '' };

		this.context = {
			keywords: new NodeKeywords(),
			material: material
		};

		this.nodesData = new WeakMap();

		this.shaderStage = null;

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

	getContextParameter( name ) {

		return this.context[ name ];

	}

	getTexture( /* textureProperty, uvSnippet */ ) {

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

		type = this.getVectorType( type );

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

			nodeUniform = new NodeUniform( 'nodeUniform' + index, type, node );

			uniforms.push( nodeUniform );

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

		const nodeData = this.getDataFromNode( node );

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

			const nodeCodes = this.nodeCodes[ shaderStage ];
			const index = nodeCodes.length;

			nodeCode = new NodeCode( 'nodeCode' + index, type );

			nodeCodes.push( nodeCode );

			nodeData.code = nodeCode;

		}

		return nodeCode;

	}

	/*
	analyzeNode( node ) {


	}
	*/

	addFlowCode( code ) {

		if ( ! /;\s*$/.test( code ) ) {

			code += '; ';

		}

		this.flow.code += code;

	}

	flowNode( node, output ) {

		const previousFlow = this.flow;

		const flow = {
			code: previousFlow.code,
		};

		this.flow = flow;

		flow.result = node.build( this, output );

		this.flow = previousFlow;

		return flow;

	}

	_buildDefines( shader ) {

		const defines = this.defines[ shader ];

		let code = '';

		for ( const name in defines ) {

			code += `#define ${name} ${defines[ name ]}\n`;

		}

		return code;

	}

	getAttributesBodySnippet( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getAttributesHeaderSnippet( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVarysHeaderSnippet( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVarysBodySnippet( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVarsHeaderSnippet( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVarsBodySnippet( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getUniformsHeaderSnippet( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getUniformsHeaderCodes( shaderStage ) {

		const nodeCodes = this.nodeCodes[ shaderStage ];

		let code = '';

		for ( const nodeCode of nodeCodes ) {

			code += nodeCode.code + '\n';

		}

		return code;

	}

	getHash() {

		return this.vertexShader + this.fragmentShader;

	}

	build() {

		const shaderStages = [ 'vertex', 'fragment' ];
		const shaderData = {};

		for ( const shaderStage of shaderStages ) {

			this.shaderStage = shaderStage;

			const slots = this.slots[ shaderStage ];

			for ( const slot of slots ) {

				const flowData = this.flowNode( slot.node, slot.output );

				this.define( shaderStage, `NODE_CODE_${slot.name}`, flowData.code );
				this.define( shaderStage, `NODE_${slot.name}`, flowData.result );

			}

		}

		this.shaderStage = null;

		for ( const shaderStage of shaderStages ) {

			this.define( shaderStage, 'NODE_HEADER_UNIFORMS', this.getUniformsHeaderSnippet( shaderStage ) );
			this.define( shaderStage, 'NODE_HEADER_ATTRIBUTES', this.getAttributesHeaderSnippet( shaderStage ) );
			this.define( shaderStage, 'NODE_HEADER_VARYS', this.getVarysHeaderSnippet( shaderStage ) );

			this.define( shaderStage, 'NODE_BODY_VARYS', this.getVarysBodySnippet( shaderStage ) );
			this.define( shaderStage, 'NODE_BODY_VARS', this.getVarsBodySnippet( shaderStage ) );

			let headerCode = '';

			headerCode += this.getVarsHeaderSnippet( shaderStage ) + '\n';
			headerCode += this.getUniformsHeaderCodes( shaderStage );

			shaderData[ shaderStage ] = this._buildDefines( shaderStage ) + '\n' + headerCode;

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
			case 'vec2 to vec3' : return `vec3( ${snippet}, 0.0 )`;
			case 'vec2 to vec4' : return `vec4( ${snippet}.xy, 0.0, 1.0 )`;

			case 'vec3 to float' : return `${snippet}.x`;
			case 'vec3 to vec2' : return `${snippet}.xy`;
			case 'vec3 to vec4' : return `vec4( ${snippet}, 1.0 )`;

			case 'vec4 to float' : return `${snippet}.x`;
			case 'vec4 to vec2' : return `${snippet}.xy`;
			case 'vec4 to vec3' : return `${snippet}.xyz`;

			case 'mat3 to float' : return `( ${snippet} * vec3( 1.0 ) ).x`;
			case 'mat3 to vec2' : return `( ${snippet} * vec3( 1.0 ) ).xy`;
			case 'mat3 to vec3' : return `( ${snippet} * vec3( 1.0 ) ).xyz`;
			case 'mat3 to vec4' : return `vec4( ${snippet} * vec3( 1.0 ), 1.0 )`;

			case 'mat4 to float' : return `( ${snippet} * vec4( 1.0 ) ).x`;
			case 'mat4 to vec2' : return `( ${snippet} * vec4( 1.0 ) ).xy`;
			case 'mat4 to vec3' : return `( ${snippet} * vec4( 1.0 ) ).xyz`;
			case 'mat4 to vec4' : return `( ${snippet} * vec4( 1.0 ) )`;

		}

		return snippet;

	}


}

export default NodeBuilder;
