import NodeUniform from './NodeUniform.js';
import NodeAttribute from './NodeAttribute.js';
import NodeVarying from './NodeVarying.js';
import NodeVar from './NodeVar.js';
import NodeCode from './NodeCode.js';
import NodeKeywords from './NodeKeywords.js';
import NodeCache from './NodeCache.js';
import ParameterNode from './ParameterNode.js';
import FunctionNode from '../code/FunctionNode.js';
import CodeNode from '../code/CodeNode.js';
import { createNodeMaterialFromType, default as NodeMaterial } from '../materials/NodeMaterial.js';
import { NodeUpdateType, defaultBuildStages, shaderStages } from './constants.js';

import {
	FloatNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform,
	ColorNodeUniform, Matrix3NodeUniform, Matrix4NodeUniform
} from '../../renderers/common/nodes/NodeUniform.js';

import { REVISION, RenderTarget, Color, Vector2, Vector3, Vector4, IntType, UnsignedIntType, Float16BufferAttribute } from 'three';

import { stack } from './StackNode.js';
import { getCurrentStack, setCurrentStack } from '../shadernode/ShaderNode.js';

import CubeRenderTarget from '../../renderers/common/CubeRenderTarget.js';
import ChainMap from '../../renderers/common/ChainMap.js';

import PMREMGenerator from '../../renderers/common/extras/PMREMGenerator.js';

const uniformsGroupCache = new ChainMap();

const typeFromLength = new Map( [
	[ 2, 'vec2' ],
	[ 3, 'vec3' ],
	[ 4, 'vec4' ],
	[ 9, 'mat3' ],
	[ 16, 'mat4' ]
] );

const typeFromArray = new Map( [
	[ Int8Array, 'int' ],
	[ Int16Array, 'int' ],
	[ Int32Array, 'int' ],
	[ Uint8Array, 'uint' ],
	[ Uint16Array, 'uint' ],
	[ Uint32Array, 'uint' ],
	[ Float32Array, 'float' ]
] );

const toFloat = ( value ) => {

	value = Number( value );

	return value + ( value % 1 ? '' : '.0' );

};

class NodeBuilder {

	constructor( object, renderer, parser, scene = null, material = null ) {

		this.object = object;
		this.material = material || ( object && object.material ) || null;
		this.geometry = ( object && object.geometry ) || null;
		this.renderer = renderer;
		this.parser = parser;
		this.scene = scene;

		this.nodes = [];
		this.updateNodes = [];
		this.updateBeforeNodes = [];
		this.hashNodes = {};

		this.lightsNode = null;
		this.environmentNode = null;
		this.fogNode = null;
		this.toneMappingNode = null;

		this.clippingContext = null;

		this.vertexShader = null;
		this.fragmentShader = null;
		this.computeShader = null;

		this.flowNodes = { vertex: [], fragment: [], compute: [] };
		this.flowCode = { vertex: '', fragment: '', compute: [] };
		this.uniforms = { vertex: [], fragment: [], compute: [], index: 0 };
		this.structs = { vertex: [], fragment: [], compute: [], index: 0 };
		this.bindings = { vertex: [], fragment: [], compute: [] };
		this.bindingsOffset = { vertex: 0, fragment: 0, compute: 0 };
		this.bindingsArray = null;
		this.attributes = [];
		this.bufferAttributes = [];
		this.varyings = [];
		this.codes = {};
		this.vars = {};
		this.flow = { code: '' };
		this.chaining = [];
		this.stack = stack();
		this.stacks = [];
		this.tab = '\t';

		this.currentFunctionNode = null;

		this.context = {
			keywords: new NodeKeywords(),
			material: this.material
		};

		this.cache = new NodeCache();
		this.globalCache = this.cache;

		this.flowsData = new WeakMap();

		this.shaderStage = null;
		this.buildStage = null;

	}

	createRenderTarget( width, height, options ) {

		return new RenderTarget( width, height, options );

	}

	createCubeRenderTarget( size, options ) {

		return new CubeRenderTarget( size, options );

	}

	createPMREMGenerator() {

		// TODO: Move Materials.js to outside of the Nodes.js in order to remove this function and improve tree-shaking support

		return new PMREMGenerator( this.renderer );

	}

	includes( node ) {

		return this.nodes.includes( node );

	}

	_getSharedBindings( bindings ) {

		const shared = [];

		for ( const binding of bindings ) {

			if ( binding.shared === true ) {

				// nodes is the chainmap key
				const nodes = binding.getNodes();

				let sharedBinding = uniformsGroupCache.get( nodes );

				if ( sharedBinding === undefined ) {

					uniformsGroupCache.set( nodes, binding );

					sharedBinding = binding;

				}

				shared.push( sharedBinding );

			} else {

				shared.push( binding );

			}

		}

		return shared;

	}

	getBindings() {

		let bindingsArray = this.bindingsArray;

		if ( bindingsArray === null ) {

			const bindings = this.bindings;

			this.bindingsArray = bindingsArray = this._getSharedBindings( ( this.material !== null ) ? [ ...bindings.vertex, ...bindings.fragment ] : bindings.compute );

		}

		return bindingsArray;

	}

	setHashNode( node, hash ) {

		this.hashNodes[ hash ] = node;

	}

	addNode( node ) {

		if ( this.nodes.includes( node ) === false ) {

			this.nodes.push( node );

			this.setHashNode( node, node.getHash( this ) );

		}

	}

	buildUpdateNodes() {

		for ( const node of this.nodes ) {

			const updateType = node.getUpdateType();
			const updateBeforeType = node.getUpdateBeforeType();

			if ( updateType !== NodeUpdateType.NONE ) {

				this.updateNodes.push( node.getSelf() );

			}

			if ( updateBeforeType !== NodeUpdateType.NONE ) {

				this.updateBeforeNodes.push( node );

			}

		}

	}

	get currentNode() {

		return this.chaining[ this.chaining.length - 1 ];

	}

	addChain( node ) {

		/*
		if ( this.chaining.indexOf( node ) !== - 1 ) {

			console.warn( 'Recursive node: ', node );

		}
		*/

		this.chaining.push( node );

	}

	removeChain( node ) {

		const lastChain = this.chaining.pop();

		if ( lastChain !== node ) {

			throw new Error( 'NodeBuilder: Invalid node chaining!' );

		}

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

	setCache( cache ) {

		this.cache = cache;

	}

	getCache() {

		return this.cache;

	}

	isAvailable( /*name*/ ) {

		return false;

	}

	getVertexIndex() {

		console.warn( 'Abstract function.' );

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

	generateTexture( /* texture, textureProperty, uvSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	generateTextureLod( /* texture, textureProperty, uvSnippet, levelSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	generateConst( type, value = null ) {

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

		const typeLength = this.getTypeLength( type );

		const componentType = this.getComponentType( type );

		const generateConst = value => this.generateConst( componentType, value );

		if ( typeLength >= 2 && typeLength <= 4 ) {

			return this.formatOperation( '()', this.getType( type ), [ ...value ].map( generateConst ) );

		} else if ( typeLength > 4 && value && ( value.isMatrix3 || value.isMatrix4 ) ) {

			return this.formatOperation( '()', this.getType( type ), value.elements.map( generateConst ) );

		} else if ( typeLength > 4 ) {

			return this.formatOperation( '()', this.getType( type ) );

		}

		throw new Error( `NodeBuilder: Type '${type}' not found in generate constant attempt.` );

	}

	getType( type ) {

		if ( type === 'color' ) return 'vec3';

		return type;

	}

	generateMethod( method ) {

		return method;

	}

	hasGeometryAttribute( name ) {

		return this.geometry && this.geometry.getAttribute( name ) !== undefined;

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

		return type === 'void' || type === 'property' || type === 'sampler' || type === 'texture' || type === 'cubeTexture' || type === 'storageTexture';

	}

	needsColorSpaceToLinear( /*texture*/ ) {

		return false;

	}

	getComponentTypeFromTexture( texture ) {

		const type = texture.type;

		if ( texture.isDataTexture ) {

			if ( type === IntType ) return 'int';
			if ( type === UnsignedIntType ) return 'uint';

		}

		return 'float';

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
		if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' ) return 'vec4';

		return type;

	}

	getTypeFromLength( length, componentType = 'float' ) {

		if ( length === 1 ) return componentType;

		const baseType = typeFromLength.get( length );
		const prefix = componentType === 'float' ? '' : componentType[ 0 ];

		return prefix + baseType;

	}

	getTypeFromArray( array ) {

		return typeFromArray.get( array.constructor );

	}

	getTypeFromAttribute( attribute ) {

		let dataAttribute = attribute;

		if ( attribute.isInterleavedBufferAttribute ) dataAttribute = attribute.data;

		const array = dataAttribute.array;
		const itemSize = attribute.itemSize;
		const normalized = attribute.normalized;

		let arrayType;

		if ( ! ( attribute instanceof Float16BufferAttribute ) && normalized !== true ) {

			arrayType = this.getTypeFromArray( array );

		}

		return this.getTypeFromLength( itemSize, arrayType );

	}

	getTypeLength( type ) {

		const vecType = this.getVectorType( type );
		const vecNum = /vec([2-4])/.exec( vecType );

		if ( vecNum !== null ) return Number( vecNum[ 1 ] );
		if ( vecType === 'float' || vecType === 'bool' || vecType === 'int' || vecType === 'uint' ) return 1;
		if ( /mat2/.test( type ) === true ) return 4;
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

	_getPolyfills() {

		return {};

	}

	_resolvePolyfill( name, type = null ) {

		return this._getPolyfills()[ name + '_' + type ] ? `threejs_${ name }_${ type }` : `threejs_${ name }`;

	}

	_include( name, type = null ) {

		const polyfills = this._getPolyfills();

		if ( typeof polyfills[ name ] === 'function' && type !== null && ! polyfills[ name + '_' + type ] ) { // auto-generate polyfill for the required type

			polyfills[ name + '_' + type ] = new CodeNode( polyfills[ name ]( `threejs_${ name }_${ type }`, this.getType( type ) ) );

		}

		const codeNode = polyfills[ name + '_' + type ] || polyfills[ name ];

		codeNode.build( this );

		if ( this.currentFunctionNode !== null ) {

			this.currentFunctionNode.includes.push( codeNode );

		}

		return codeNode;

	}

	addStack() {

		this.stack = stack( this.stack );

		this.stacks.push( getCurrentStack() || this.stack );
		setCurrentStack( this.stack );

		return this.stack;

	}

	removeStack() {

		const lastStack = this.stack;
		this.stack = lastStack.parent;

		setCurrentStack( this.stacks.pop() );

		return lastStack;

	}

	getDataFromNode( node, shaderStage = this.shaderStage, cache = null ) {

		cache = cache === null ? ( node.isGlobal( this ) ? this.globalCache : this.cache ) : cache;

		let nodeData = cache.getNodeData( node );

		if ( nodeData === undefined ) {

			nodeData = {};

			cache.setNodeData( node, nodeData );

		}

		if ( nodeData[ shaderStage ] === undefined ) nodeData[ shaderStage ] = {};

		return nodeData[ shaderStage ];

	}

	getNodeProperties( node, shaderStage = 'any' ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		return nodeData.properties || ( nodeData.properties = { outputNode: null } );

	}

	getBufferAttributeFromNode( node, type ) {

		const nodeData = this.getDataFromNode( node );

		let bufferAttribute = nodeData.bufferAttribute;

		if ( bufferAttribute === undefined ) {

			const index = this.uniforms.index ++;

			bufferAttribute = new NodeAttribute( 'nodeAttribute' + index, type, node );

			this.bufferAttributes.push( bufferAttribute );

			nodeData.bufferAttribute = bufferAttribute;

		}

		return bufferAttribute;

	}

	getStructTypeFromNode( node, shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		if ( nodeData.structType === undefined ) {

			const index = this.structs.index ++;

			node.name = `StructType${ index }`;
			this.structs[ shaderStage ].push( node );

			nodeData.structType = node;

		}

		return node;

	}

	getUniformFromNode( node, type, shaderStage = this.shaderStage, name = null ) {

		const nodeData = this.getDataFromNode( node, shaderStage, this.globalCache );

		let nodeUniform = nodeData.uniform;

		if ( nodeUniform === undefined ) {

			const index = this.uniforms.index ++;

			nodeUniform = new NodeUniform( name || ( 'nodeUniform' + index ), type, node );

			this.uniforms[ shaderStage ].push( nodeUniform );

			nodeData.uniform = nodeUniform;

		}

		return nodeUniform;

	}

	getVarFromNode( node, name = null, type = node.getNodeType( this ), shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		let nodeVar = nodeData.variable;

		if ( nodeVar === undefined ) {

			const vars = this.vars[ shaderStage ] || ( this.vars[ shaderStage ] = [] );

			if ( name === null ) name = 'nodeVar' + vars.length;

			nodeVar = new NodeVar( name, type );

			vars.push( nodeVar );

			nodeData.variable = nodeVar;

		}

		return nodeVar;

	}

	getVaryingFromNode( node, name = null, type = node.getNodeType( this ) ) {

		const nodeData = this.getDataFromNode( node, 'any' );

		let nodeVarying = nodeData.varying;

		if ( nodeVarying === undefined ) {

			const varyings = this.varyings;
			const index = varyings.length;

			if ( name === null ) name = 'nodeVarying' + index;

			nodeVarying = new NodeVarying( name, type );

			varyings.push( nodeVarying );

			nodeData.varying = nodeVarying;

		}

		return nodeVarying;

	}

	getCodeFromNode( node, type, shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( node );

		let nodeCode = nodeData.code;

		if ( nodeCode === undefined ) {

			const codes = this.codes[ shaderStage ] || ( this.codes[ shaderStage ] = [] );
			const index = codes.length;

			nodeCode = new NodeCode( 'nodeCode' + index, type );

			codes.push( nodeCode );

			nodeData.code = nodeCode;

		}

		return nodeCode;

	}

	addLineFlowCode( code ) {

		if ( code === '' ) return this;

		code = this.tab + code;

		if ( ! /;\s*$/.test( code ) ) {

			code = code + ';\n';

		}

		this.flow.code += code;

		return this;

	}

	addFlowCode( code ) {

		this.flow.code += code;

		return this;

	}

	addFlowTab() {

		this.tab += '\t';

		return this;

	}

	removeFlowTab() {

		this.tab = this.tab.slice( 0, - 1 );

		return this;

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

	buildFunctionNode( shaderNode ) {

		const fn = new FunctionNode();

		const previous = this.currentFunctionNode;

		this.currentFunctionNode = fn;

		fn.code = this.buildFunctionCode( shaderNode );

		this.currentFunctionNode = previous;

		return fn;

	}

	flowShaderNode( shaderNode ) {

		const layout = shaderNode.layout;

		let inputs;

		if ( shaderNode.isArrayInput ) {

			inputs = [];

			for ( const input of layout.inputs ) {

				inputs.push( new ParameterNode( input.type, input.name ) );

			}

		} else {

			inputs = {};

			for ( const input of layout.inputs ) {

				inputs[ input.name ] = new ParameterNode( input.type, input.name );

			}

		}

		//

		shaderNode.layout = null;

		const callNode = shaderNode.call( inputs );
		const flowData = this.flowStagesNode( callNode, layout.type );

		shaderNode.layout = layout;

		return flowData;

	}

	flowStagesNode( node, output = null ) {

		const previousFlow = this.flow;
		const previousVars = this.vars;
		const previousBuildStage = this.buildStage;

		const flow = {
			code: ''
		};

		this.flow = flow;
		this.vars = {};

		for ( const buildStage of defaultBuildStages ) {

			this.setBuildStage( buildStage );

			flow.result = node.build( this, output );

		}

		flow.vars = this.getVars( this.shaderStage );

		this.flow = previousFlow;
		this.vars = previousVars;
		this.setBuildStage( previousBuildStage );

		return flow;

	}

	getFunctionOperator() {

		return null;

	}

	flowChildNode( node, output = null ) {

		const previousFlow = this.flow;

		const flow = {
			code: ''
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

			flowData.code += `${ this.tab + propertyName } = ${ flowData.result };\n`;

		}

		this.flowCode[ shaderStage ] = this.flowCode[ shaderStage ] + flowData.code;

		this.setShaderStage( previousShaderStage );

		return flowData;

	}

	getAttributesArray() {

		return this.attributes.concat( this.bufferAttributes );

	}

	getAttributes( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVaryings( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVar( type, name ) {

		return `${ this.getType( type ) } ${ name }`;

	}

	getVars( shaderStage ) {

		let snippet = '';

		const vars = this.vars[ shaderStage ];

		if ( vars !== undefined ) {

			for ( const variable of vars ) {

				snippet += `${ this.getVar( variable.type, variable.name ) }; `;

			}

		}

		return snippet;

	}

	getUniforms( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getCodes( shaderStage ) {

		const codes = this.codes[ shaderStage ];

		let code = '';

		if ( codes !== undefined ) {

			for ( const nodeCode of codes ) {

				code += nodeCode.code + '\n';

			}

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

	build( convertMaterial = true ) {

		const { object, material } = this;

		if ( convertMaterial ) {

			if ( material !== null ) {

				NodeMaterial.fromMaterial( material ).build( this );

			} else {

				this.addFlow( 'compute', object );

			}

		}

		// setup() -> stage 1: create possible new nodes and returns an output reference node
		// analyze()   -> stage 2: analyze nodes to possible optimization and validation
		// generate()  -> stage 3: generate shader

		for ( const buildStage of defaultBuildStages ) {

			this.setBuildStage( buildStage );

			if ( this.context.vertex && this.context.vertex.isNode ) {

				this.flowNodeFromShaderStage( 'vertex', this.context.vertex );

			}

			for ( const shaderStage of shaderStages ) {

				this.setShaderStage( shaderStage );

				const flowNodes = this.flowNodes[ shaderStage ];

				for ( const node of flowNodes ) {

					if ( buildStage === 'generate' ) {

						this.flowNode( node );

					} else {

						node.build( this );

					}

				}

			}

		}

		this.setBuildStage( null );
		this.setShaderStage( null );

		// stage 4: build code for a specific output

		this.buildCode();
		this.buildUpdateNodes();

		return this;

	}

	getNodeUniform( uniformNode, type ) {

		if ( type === 'float' ) return new FloatNodeUniform( uniformNode );
		if ( type === 'vec2' ) return new Vector2NodeUniform( uniformNode );
		if ( type === 'vec3' ) return new Vector3NodeUniform( uniformNode );
		if ( type === 'vec4' ) return new Vector4NodeUniform( uniformNode );
		if ( type === 'color' ) return new ColorNodeUniform( uniformNode );
		if ( type === 'mat3' ) return new Matrix3NodeUniform( uniformNode );
		if ( type === 'mat4' ) return new Matrix4NodeUniform( uniformNode );

		throw new Error( `Uniform "${type}" not declared.` );

	}

	createNodeMaterial( type = 'NodeMaterial' ) {

		// TODO: Move Materials.js to outside of the Nodes.js in order to remove this function and improve tree-shaking support

		return createNodeMaterialFromType( type );

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

			return this.formatOperation( '()', this.getType( toType ), snippet );

		}

		if ( fromTypeLength > toTypeLength ) {

			return this.format( this.formatOperation( '.', snippet, 'xyz'.slice( 0, toTypeLength ) ), this.getTypeFromLength( toTypeLength, this.getComponentType( fromType ) ), toType );

		}

		if ( toTypeLength === 4 && fromTypeLength > 1 ) { // toType is vec4-like

			return this.formatOperation( '()', this.getType( toType ), [ this.format( snippet, fromType, 'vec3' ), '1.0' ] );

		}

		if ( fromTypeLength === 2 ) { // fromType is vec2-like and toType is vec3-like

			return this.formatOperation( '()', this.getType( toType ), [ this.format( snippet, fromType, 'vec2' ), '0.0' ] );

		}

		if ( fromTypeLength === 1 && toTypeLength > 1 && fromType[ 0 ] !== toType[ 0 ] ) { // fromType is float-like

			// convert a number value to vector type, e.g:
			// vec3( 1u ) -> vec3( float( 1u ) )

			snippet = this.formatOperation( '()', this.getType( this.getComponentType( toType ) ), snippet );

		}

		return this.formatOperation( '()', this.getType( toType ), snippet ); // fromType is float-like

	}

	_parseTopLevel( str ) {

		const operators = [ ',', '.', '~', '!', '++', '--', '+', '-', '*', '/', '%', '<<', '>>', '<', '>', '<=', '>=', '==', '!=', '&', '^', '|', '&&', '^^', '||' ];

		const list = [];
		let level = 0;

		for ( let i = 0; i < str.length; i ++ ) {

			let opData = null;

			if ( str[ i ] === '(' || str[ i ] === '[' ) {

				level ++;

			} else if ( str[ i ] === ')' || str[ i ] === ']' ) {

				level --;

			} else if ( level === 0 && operators.includes( str[ i ] + str[ i + 1 ] ) ) {

				opData = { start: i, end: i + 2, op: str[ i ] + str[ i + 1 ] };
				i ++;

			} else if ( level === 0 && operators.includes( str[ i ] ) ) {

				opData = { start: i, end: i + 1, op: str[ i ] };

			}

			if ( opData === null ) continue;

			// not an operator, a part of type
			// @TODO: move this to WGSLNodeBuilder?
			if ( opData.op === '<' && [ 'f32', 'i32', 'u32', 'bool' ].includes( str.slice( opData.start + 1, str.indexOf( '>', opData.start ) ) ) ) continue;
			if ( opData.op === '>' && [ 'f32', 'i32', 'u32', 'bool' ].includes( str.slice( str.lastIndexOf( '<', opData.start ) + 1, opData.start ) ) ) continue;

			const lastEnd = list.length > 0 ? list[ list.length - 1 ].end : 0;
			const arg = str.slice( lastEnd, opData.start );
			const argNonEmpty = [ ...arg ].some( x => x !== ' ' );

			if ( argNonEmpty === true ) {

				list.push( { start: lastEnd, end: opData.start, arg } );

			} else {

				// if we have two operators in row (or one directly in the start) and the previous one is not unary, mark this one as unary
				if ( list.length === 0 || ! list[ list.length - 1 ].unary ) opData.unary = true;

			}

			if ( opData.op === '++' || opData.op === '--' ) {

				opData.unary = true;

				if ( argNonEmpty ) opData.postfix = true;
				else opData.prefix = true;

			}

			list.push( opData );

		}

		const lastEnd = list.length > 0 ? list[ list.length - 1 ].end : 0;
		const arg = str.slice( lastEnd );
		if ( [ ...arg ].some( x => x !== ' ' ) ) list.push( { start: lastEnd, end: str.length, arg } );

		return list;

	}

	_getOperators() {

		console.warn( 'Abstract function.' );

	}

	formatOperation( op, arg1, arg2, output = null ) {

		const languageOperators = this._getOperators(); // @TODO: make this just a static property

		if ( op === '()' && languageOperators.replace[ arg1 + '()' ] !== undefined ) { // change function

			if ( ! languageOperators.replace[ arg1 + '()' ].endsWith( '()' ) ) { // function -> op

				op = languageOperators.replace[ arg1 + '()' ];
				arg1 = arg2;

				const argParsed = this._parseTopLevel( arg1 );
				const comma = argParsed.find( arg => arg.op === ',' );

				if ( comma !== undefined ) {

					arg2 = arg1.slice( comma.end ).trimLeft();
					arg1 = arg1.slice( 0, comma.start ).trimRight();

				}

			} else { // function -> function

				arg1 = languageOperators.replace[ arg1 + '()' ].slice( 0, - 2 );

			}

		}

		if ( languageOperators.replace[ op ] !== undefined ) { // change operator

			if ( languageOperators.replace[ op ].endsWith( '()' ) ) { // op -> function

				if ( output !== null && this.getTypeLength( output ) > 1 ) {

					arg2 = [ arg1, arg2 ];
					arg1 = languageOperators.replace[ op ].slice( 0, - 2 );
					op = '()';

				}

			} else { // op -> op

				op = languageOperators.replace[ op ];

			}

		}

		if ( op === '()' && arg1.startsWith( 'threejs_' ) ) { // include function polyfill

			this._include( arg1.slice( 'threejs_'.length ), output );
			arg1 = this._resolvePolyfill( arg1.slice( 'threejs_'.length ), output );

		}

		if ( arg2 === undefined && ! op.startsWith( 'pre' ) && ! op.startsWith( 'post' ) ) op = 'un' + op;

		const inversePrecedence = languageOperators.ops;

		const precedence = {};
		for ( let i = 0; i < inversePrecedence.length; i ++ ) {

			for ( const op of inversePrecedence[ i ].ops ) {

				precedence[ op ] = { prec: i, maxAllowed: inversePrecedence[ i ].maxPrec, allowEqual: inversePrecedence[ i ].allowSelf };

			}

		}

		const operators = inversePrecedence.map( x => x.ops ).flat();

		if ( ! operators.includes( op ) || op === ',' ) {

			console.warn( `${ this.constructor.name }: Operator ${ op } is not supported.` );

		}

		if ( Array.isArray( arg2 ) ) arg2 = arg2.join( ', ' );

		if ( op === '()' || op === '[]' ) {

			if ( arg2 === undefined ) arg2 = '';
			if ( arg2 !== '' ) arg2 = ` ${ arg2 } `;
			return `${ arg1 }${ op[ 0 ] }${ arg2 }${ op[ 1 ] }`;

		}

		const arg1Parsed = this._parseTopLevel( arg1 );
		const arg2Parsed = arg2 !== undefined ? this._parseTopLevel( arg2 ) : [];

		if ( op === '=' && arg2.startsWith( arg1 ) ) {

			const rhsOp = arg2Parsed.find( arg => !! arg.op && arg.start >= arg1.length );

			if ( rhsOp === undefined ) { // dummy assignment

				return '';

			}

			if ( rhsOp.op !== '<' && rhsOp.op !== '>' && operators.includes( rhsOp.op + '=' ) ) { // use assignment statement

				op = rhsOp.op + '=';
				arg2 = arg2.slice( rhsOp.end ).trimLeft();

				if ( arg2.startsWith( '(' ) && arg2.endsWith( ')' ) ) { // RHS' second argument could be wrapped in brackets

					let i, diff = 0;

					for ( i = 0; i < arg2.length; i ++ ) {

						if ( arg2[ i ] === '(' ) diff ++;
						if ( arg2[ i ] === ')' ) diff --;

						if ( diff === 0 ) break;

					}

					if ( i === arg2.length - 1 ) arg2 = arg2.slice( 1, - 1 ).trim(); // the brackets are indeed outmost, remove them

				}

			}

		}

		const cannotAssociate = left => data => {

			if ( ! data.op ) return false;

			return precedence[ data.op ].prec > precedence[ op ].prec ||
			       ( precedence[ data.op ].prec > precedence[ op ].maxAllowed && precedence[ data.op ].prec !== precedence[ op ].prec ) ||
				   ( precedence[ data.op ].prec === precedence[ op ].prec && precedence[ op ].allowEqual === false ) ||
				   ( precedence[ data.op ].prec === precedence[ op ].prec && left === false && // assuming left-to-right associativity for all binary operators
				       ! ( ( ( data.op === op ) && [ '&&', '||', '^^', '&', '|', '^' ].includes( op ) ) || [ '+', '[]', '()' ].includes( op ) ) // operators that do allow RTL associativity with same-precedence operators
										// TODO: if we could somehow determine whether * is used in context of mat * mat/vec or component-wise multiplication, we could use it in the second list (only in the second context)
				   );

		};

		if ( arg1Parsed.some( cannotAssociate( true ) ) ) arg1 = `( ${ arg1 } )`;
		if ( arg2Parsed.some( cannotAssociate( false ) ) ) arg2 = `( ${ arg2 } )`;

		if ( op === '.' ) {

			return `${ arg1 }.${ arg2 }`;

		} else if ( op.startsWith( 'un' ) ) {

			return `${ op.slice( 2 ) } ${ arg1 }`;

		} else if ( op.startsWith( 'pre' ) ) {

			return `${ op.slice( 3 ) } ${ arg1 }`;

		} else if ( op.startsWith( 'post' ) ) {

			return `${ arg1 } ${ op.slice( 4 ) }`;

		} else {

			return `${ arg1 } ${ op } ${ arg2 }`;

		}

	}

	getSignature() {

		return `// Three.js r${ REVISION } - NodeMaterial System\n`;

	}

}

export default NodeBuilder;
