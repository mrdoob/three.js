import NodeUniform from './NodeUniform.js';
import NodeAttribute from './NodeAttribute.js';
import NodeVarying from './NodeVarying.js';
import NodeVar from './NodeVar.js';
import NodeCode from './NodeCode.js';
import NodeKeywords from './NodeKeywords.js';
import { NodeUpdateType } from './constants.js';

import { REVISION, LinearEncoding, Color, Vector2, Vector3, Vector4 } from 'three';

export const defaultShaderStages = [ 'fragment', 'vertex' ];
export const shaderStages = [ ...defaultShaderStages, 'compute' ];
export const vector = [ 'x', 'y', 'z', 'w' ];

const typeFromLength = new Map();
typeFromLength.set( 2, 'vec2' );
typeFromLength.set( 3, 'vec3' );
typeFromLength.set( 4, 'vec4' );
typeFromLength.set( 9, 'mat3' );
typeFromLength.set( 16, 'mat4' );

const toFloat = ( value ) => {

	value = Number( value );

	return value + ( value % 1 ? '' : '.0' );

};

class NodeBuilder {

	constructor( object, renderer, parser ) {

		this.object = object;
		this.material = object.material || null;
		this.geometry = object.geometry || null;
		this.renderer = renderer;
		this.parser = parser;

		this.nodes = [];
		this.updateNodes = [];
		this.hashNodes = {};

		this.scene = null;
		this.lightsNode = null;
		this.fogNode = null;

		this.vertexShader = null;
		this.fragmentShader = null;
		this.computeShader = null;

		this.flowNodes = { vertex: [], fragment: [], compute: [] };
		this.flowCode = { vertex: '', fragment: '', compute: [] };
		this.uniforms = { vertex: [], fragment: [], compute: [], index: 0 };
		this.codes = { vertex: [], fragment: [], compute: [] };
		this.attributes = [];
		this.varyings = [];
		this.vars = { vertex: [], fragment: [], compute: [] };
		this.flow = { code: '' };
		this.stack = [];

		this.context = {
			keywords: new NodeKeywords(),
			material: object.material
		};

		this.nodesData = new WeakMap();
		this.flowsData = new WeakMap();

		this.shaderStage = null;
		this.buildStage = null;

	}

	get node() {

		return this.stack[ this.stack.length - 1 ];

	}

	addStack( node ) {

		/*
		if ( this.stack.indexOf( node ) !== - 1 ) {

			console.warn( 'Recursive node: ', node );

		}
		*/

		this.stack.push( node );

	}

	removeStack( node ) {

		const lastStack = this.stack.pop();

		if ( lastStack !== node ) {

			throw new Error( 'NodeBuilder: Invalid node stack!' );

		}

	}

	setHashNode( node, hash ) {

		this.hashNodes[ hash ] = node;

	}

	addNode( node ) {

		if ( this.nodes.indexOf( node ) === - 1 ) {

			const updateType = node.getUpdateType( this );

			if ( updateType !== NodeUpdateType.NONE ) {

				this.updateNodes.push( node );

			}

			this.nodes.push( node );

			this.setHashNode( node, node.getHash( this ) );

		}

	}

	getMethod( method ) {

		return method;

	}

	getNodeFromHash( hash ) {

		return this.hashNodes[ hash ];

	}

	addFlow( shaderStage, node ) {

		this.flowNodes[ shaderStage ].push( node );

		return node;

	}

	setContext( context ) {

		this.context = context;

	}

	getContext() {

		return this.context;

	}

	isAvailable( /*name*/ ) {

		return false;

	}

	getInstanceIndex() {

		console.warn( 'Abstract function.' );

	}

	getFrontFacing() {

		console.warn( 'Abstract function.' );

	}

	getFragCoord() {

		console.warn( 'Abstract function.' );

	}

	isFlipY() {

		return false;

	}

	getTexture( /* textureProperty, uvSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	getTextureLevel( /* textureProperty, uvSnippet, levelSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	getCubeTexture( /* textureProperty, uvSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	getCubeTextureLevel( /* textureProperty, uvSnippet, levelSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	// @TODO: rename to .generateConst()
	getConst( type, value = null ) {

		if ( value === null ) {

			if ( type === 'float' || type === 'int' || type === 'uint' ) value = 0;
			else if ( type === 'bool' ) value = false;
			else if ( type === 'color' ) value = new Color();
			else if ( type === 'vec2' ) value = new Vector2();
			else if ( type === 'vec3' ) value = new Vector3();
			else if ( type === 'vec4' ) value = new Vector4();

		}

		if ( type === 'float' ) return toFloat( value );
		if ( type === 'int' ) return `${ Math.round( value ) }`;
		if ( type === 'uint' ) return value >= 0 ? `${ Math.round( value ) }u` : '0u';
		if ( type === 'bool' ) return value ? 'true' : 'false';
		if ( type === 'color' ) return `${ this.getType( 'vec3' ) }( ${ toFloat( value.r ) }, ${ toFloat( value.g ) }, ${ toFloat( value.b ) } )`;

		const typeLength = this.getTypeLength( type );

		const componentType = this.getComponentType( type );

		const getConst = value => this.getConst( componentType, value );

		if ( typeLength === 2 ) {

			return `${ this.getType( type ) }( ${ getConst( value.x ) }, ${ getConst( value.y ) } )`;

		} else if ( typeLength === 3 ) {

			return `${ this.getType( type ) }( ${ getConst( value.x ) }, ${ getConst( value.y ) }, ${ getConst( value.z ) } )`;

		} else if ( typeLength === 4 ) {

			return `${ this.getType( type ) }( ${ getConst( value.x ) }, ${ getConst( value.y ) }, ${ getConst( value.z ) }, ${ getConst( value.w ) } )`;

		} else if ( typeLength > 4 ) {

			return `${ this.getType( type ) }()`;

		}

		throw new Error( `NodeBuilder: Type '${type}' not found in generate constant attempt.` );

	}

	getType( type ) {

		return type;

	}

	generateMethod( method ) {

		return method;

	}

	hasGeometryAttribute( name ) {

		return this.geometry?.getAttribute( name ) !== undefined;

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

	getPropertyName( node/*, shaderStage*/ ) {

		return node.name;

	}

	isVector( type ) {

		return /vec\d/.test( type );

	}

	isMatrix( type ) {

		return /mat\d/.test( type );

	}

	isReference( type ) {

		return type === 'void' || type === 'property' || type === 'sampler' || type === 'texture' || type === 'cubeTexture';

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

	getComponentType( type ) {

		type = this.getVectorType( type );

		if ( type === 'float' || type === 'bool' || type === 'int' || type === 'uint' ) return type;

		const componentType = /(b|i|u|)(vec|mat)([2-4])/.exec( type );

		if ( componentType === null ) return null;

		if ( componentType[ 1 ] === 'b' ) return 'bool';
		if ( componentType[ 1 ] === 'i' ) return 'int';
		if ( componentType[ 1 ] === 'u' ) return 'uint';

		return 'float';

	}

	getVectorType( type ) {

		if ( type === 'color' ) return 'vec3';
		if ( type === 'texture' ) return 'vec4';

		return type;

	}

	getTypeFromLength( length, componentType = 'float' ) {

		if ( length === 1 ) return componentType;
		const baseType = typeFromLength.get( length );
		const prefix = componentType === 'float' ? '' : componentType[ 0 ];
		return prefix + baseType;

	}

	getTypeLength( type ) {

		const vecType = this.getVectorType( type );
		const vecNum = /vec([2-4])/.exec( vecType );

		if ( vecNum !== null ) return Number( vecNum[ 1 ] );
		if ( vecType === 'float' || vecType === 'bool' || vecType === 'int' || vecType === 'uint' ) return 1;
		if ( /mat3/.test( type ) === true ) return 9;
		if ( /mat4/.test( type ) === true ) return 16;

		return 0;

	}

	getVectorFromMatrix( type ) {

		return type.replace( 'mat', 'vec' );

	}

	changeComponentType( type, newComponentType ) {

		return this.getTypeFromLength( this.getTypeLength( type ), newComponentType );

	}

	getIntegerType( type ) {

		const componentType = this.getComponentType( type );

		if ( componentType === 'int' || componentType === 'uint' ) return type;

		return this.changeComponentType( type, 'int' );

	}

	getDataFromNode( node, shaderStage = this.shaderStage ) {

		let nodeData = this.nodesData.get( node );

		if ( nodeData === undefined ) {

			nodeData = { vertex: {}, fragment: {}, compute: {} };

			this.nodesData.set( node, nodeData );

		}

		return shaderStage !== null ? nodeData[ shaderStage ] : nodeData;

	}

	getNodeProperties( node, shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( this, shaderStage );
		const constructHash = node.getConstructHash( this );

		nodeData.properties = nodeData.properties || {};
		nodeData.properties[ constructHash ] = nodeData.properties[ constructHash ] || { outputNode: null };

		return nodeData.properties[ constructHash ];

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

	getVaryingFromNode( node, type ) {

		const nodeData = this.getDataFromNode( node, null );

		let nodeVarying = nodeData.varying;

		if ( nodeVarying === undefined ) {

			const varyings = this.varyings;
			const index = varyings.length;

			nodeVarying = new NodeVarying( 'nodeVarying' + index, type );

			varyings.push( nodeVarying );

			nodeData.varying = nodeVarying;

		}

		return nodeVarying;

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

		this.flow.code += code;

	}

	getFlowData( node/*, shaderStage*/ ) {

		return this.flowsData.get( node );

	}

	flowNode( node ) {

		const output = node.getNodeType( this );

		const flowData = this.flowChildNode( node, output );

		this.flowsData.set( node, flowData );

		return flowData;

	}

	flowChildNode( node, output = null ) {

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

		const flowData = this.flowChildNode( node, output );

		if ( propertyName !== null ) {

			flowData.code += `${propertyName} = ${flowData.result};\n\t`;

		}

		this.flowCode[ shaderStage ] = this.flowCode[ shaderStage ] + flowData.code;

		this.setShaderStage( previousShaderStage );

		return flowData;

	}

	getAttributes( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVaryings( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVars( shaderStage ) {

		let snippet = '';

		const vars = this.vars[ shaderStage ];

		for ( const variable of vars ) {

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

		return this.vertexShader + this.fragmentShader + this.computeShader;

	}

	setShaderStage( shaderStage ) {

		this.shaderStage = shaderStage;

	}

	getShaderStage() {

		return this.shaderStage;

	}

	setBuildStage( buildStage ) {

		this.buildStage = buildStage;

	}

	getBuildStage() {

		return this.buildStage;

	}

	buildCode() {

		console.warn( 'Abstract function.' );

	}

	build() {

		// stage 1: generate shader node

		this.setBuildStage( 'construct' );

		for ( const shaderStage of shaderStages ) {

			this.setShaderStage( shaderStage );

			const flowNodes = this.flowNodes[ shaderStage ];

			for ( const node of flowNodes ) {

				node.build( this );

			}

		}

		// stage 2: analyze nodes to possible optimization and validation

		this.setBuildStage( 'analyze' );

		for ( const shaderStage of shaderStages ) {

			this.setShaderStage( shaderStage );

			const flowNodes = this.flowNodes[ shaderStage ];

			for ( const node of flowNodes ) {

				node.build( this );

			}

		}

		// stage 3: pre-build vertex code used in fragment shader

		this.setBuildStage( 'generate' );

		if ( this.context.vertex && this.context.vertex.isNode ) {

			this.flowNodeFromShaderStage( 'vertex', this.context.vertex );

		}

		// stage 4: generate shader

		this.setBuildStage( 'generate' );

		for ( const shaderStage of shaderStages ) {

			this.setShaderStage( shaderStage );

			const flowNodes = this.flowNodes[ shaderStage ];

			for ( const node of flowNodes ) {

				this.flowNode( node );

			}

		}

		this.setBuildStage( null );
		this.setShaderStage( null );

		// stage 5: build code for a specific output

		this.buildCode();

		return this;

	}

	format( snippet, fromType, toType ) {

		fromType = this.getVectorType( fromType );
		toType = this.getVectorType( toType );

		if ( fromType === toType || toType === null || this.isReference( toType ) ) {

			return snippet;

		}

		const fromTypeLength = this.getTypeLength( fromType );
		const toTypeLength = this.getTypeLength( toType );

		if ( fromTypeLength > 4 ) { // fromType is matrix-like

			// @TODO: ignore for now

			return snippet;

		}

		if ( toTypeLength > 4 || toTypeLength === 0 ) { // toType is matrix-like or unknown

			// @TODO: ignore for now

			return snippet;

		}

		if ( fromTypeLength === toTypeLength ) {

			return `${ this.getType( toType ) }( ${ snippet } )`;

		}

		if ( fromTypeLength > toTypeLength ) {

			return this.format( `${ snippet }.${ 'xyz'.slice( 0, toTypeLength ) }`, this.getTypeFromLength( toTypeLength ), toType );

		}

		if ( toTypeLength === 4 ) { // toType is vec4-like

			return `${ this.getType( toType ) }( ${ this.format( snippet, fromType, 'vec3' ) }, 1.0 )`;

		}

		if ( fromTypeLength === 2 ) { // fromType is vec2-like and toType is vec3-like

			return `${ this.getType( toType ) }( ${ this.format( snippet, fromType, 'vec2' ) }, 0.0 )`;

		}

		return `${ this.getType( toType ) }( ${ snippet } )`; // fromType is float-like

	}

	getSignature() {

		return `// Three.js r${ REVISION } - NodeMaterial System\n`;

	}

}

export default NodeBuilder;
