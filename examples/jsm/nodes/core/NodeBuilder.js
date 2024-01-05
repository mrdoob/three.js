import NodeUniform from './NodeUniform.js';
import NodeAttribute from './NodeAttribute.js';
import NodeVarying from './NodeVarying.js';
import NodeVar from './NodeVar.js';
import NodeCode from './NodeCode.js';
import NodeKeywords from './NodeKeywords.js';
import NodeCache from './NodeCache.js';
import PropertyNode from './PropertyNode.js';
import { NodeUpdateType, defaultBuildStages, defaultShaderStages, shaderStages } from './constants.js';

import { stack } from './StackNode.js';
import { setCurrentBuilder } from '../shadernode/ShaderNode.js';

import { nativeFn } from '../code/FunctionNode.js';

import NodeMaterial from '../materials/NodeMaterial.js';

import {
	FloatNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform,
	ColorNodeUniform, Matrix3NodeUniform, Matrix4NodeUniform
} from '../../renderers/common/nodes/NodeUniform.js';

import CubeRenderTarget from '../../renderers/common/CubeRenderTarget.js';

import { REVISION, NoColorSpace, LinearEncoding, sRGBEncoding, SRGBColorSpace, Color, Vector2, Vector3, Vector4, Float16BufferAttribute } from 'three';

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

const isNonPaddingElementArray = new Set( [ Int32Array, Uint32Array, Float32Array ] );

const toFloat = ( value ) => {

	value = Number( value );

	const negative = value < 0;

	return ( negative ? '- ' : '' ) + Math.abs( value ) + ( value % 1 ? '' : '.0' );

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

		this.lightsNode = null;
		this.environmentNode = null;
		this.fogNode = null;
		this.toneMappingNode = null;

		this.vertexShader = null;
		this.fragmentShader = null;
		this.computeShader = null;

		this.uniforms = { vertex: [], fragment: [], compute: [], index: 0 };
		this.structs = { vertex: [], fragment: [], compute: [], index: 0 };
		this.bindings = { vertex: [], fragment: [], compute: [] };
		this.bindingsOffset = { vertex: 0, fragment: 0, compute: 0 };
		this.bindingsArray = null;
		this.attributes = [];
		this.bufferAttributes = [];
		this.varyings = [];
		this.codes = {};
		this.vars = { vertex: [], fragment: [], compute: [] };

		this.flowNodes = { vertex: [], fragment: [], compute: [] };
		this.shaderFlows = {
			vertex: this.createFlow(),
			fragment: this.createFlow(),
			compute: this.createFlow()
		};
		this.flow = this.createFlow();

		this.context = {
			keywords: new NodeKeywords(),
			material: this.material,
			getMipLevelAlgorithmNode: ( textureNode, levelNode ) => levelNode.mul( textureNode.maxMipLevel() )
		};

		this.cache = new NodeCache( this );
		this.globalCache = this.cache;

		this.shaderStage = null;
		this.buildStage = null;

		this.addStack();
		setCurrentBuilder( this );

	}

	get tab() { // @TODO: fix usages of this (in CondNode and LoopNode) so that they wouldn't use this property directly

		return '\t'.repeat( this.flow.tab );

	}

	getCubeRenderTarget( size, options ) { // @TODO: fix the circular dependency in some more elegant way

		return new CubeRenderTarget( size, options );

	}

	getBindings() {

		let bindingsArray = this.bindingsArray;

		if ( bindingsArray === null ) {

			const bindings = this.bindings;

			this.bindingsArray = bindingsArray = ( this.material !== null ) ? [ ...bindings.vertex, ...bindings.fragment ] : bindings.compute;

		}

		return bindingsArray;

	}

	addNode( node ) {

		if ( this.nodes.includes( node ) === false ) {

			this.nodes.push( node );

			node.getShared( this );

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

	getMethod( method ) {

		return method;

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

	getTexture( /* texture, textureProperty, uvSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	getTextureLevel( /* texture, textureProperty, uvSnippet, levelSnippet */ ) {

		console.warn( 'Abstract function.' );

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

	needsColorSpaceToLinear( /*texture*/ ) {

		return false;

	}

	/** @deprecated, r152 */
	getTextureEncodingFromMap( map ) {

		console.warn( 'THREE.NodeBuilder: Method .getTextureEncodingFromMap replaced by .getTextureColorSpaceFromMap in r152+.' );
		return this.getTextureColorSpaceFromMap( map ) === SRGBColorSpace ? sRGBEncoding : LinearEncoding;

	}

	getTextureColorSpaceFromMap( map ) {

		let colorSpace;

		if ( map && map.isTexture ) {

			colorSpace = map.colorSpace;

		} else if ( map && map.isWebGLRenderTarget ) {

			colorSpace = map.texture.colorSpace;

		} else {

			colorSpace = NoColorSpace;

		}

		return colorSpace;

	}

	getPropertyName( node/*, shaderStage*/ ) {

		return node.name;

	}

	isReference( type ) {

		return type === 'void' || type === 'property' || type === 'sampler' || type === 'texture' || type === 'cubeTexture';

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

		} else if ( typeLength > 4 && value && ( value.isMatrix3 || value.isMatrix4 ) ) {

			return `${ this.getType( type ) }( ${ value.elements.map( getConst ).join( ', ' ) } )`;

		} else if ( typeLength > 4 ) {

			return `${ this.getType( type ) }()`;

		}

		throw new Error( `NodeBuilder: Type '${type}' not found in generate constant attempt.` );

	}

	isVector( type ) {

		return /vec\d/.test( type );

	}

	isMatrix( type ) {

		return /mat\d/.test( type );

	}

	getType( type ) {

		if ( type === 'color' ) return 'vec3';

		return type;

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

	getTypeFromArray( array ) {

		return typeFromArray.get( array.constructor );

	}

	getTypeFromAttribute( attribute ) {

		let dataAttribute = attribute;

		if ( attribute.isInterleavedBufferAttribute ) dataAttribute = attribute.data;

		const array = dataAttribute.array;
		const itemSize = isNonPaddingElementArray.has( array.constructor ) ? attribute.itemSize : dataAttribute.stride || attribute.itemSize;
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

	buildFunctionNode( shaderNode ) {

		const layout = shaderNode.layout;
		const flowData = this.flowShaderNode( shaderNode );

		const inputs = layout.inputs.map( input => ( { name: input.name, type: this.getType( input.type ) } ) );
		const type = this.getType( layout.type );

		const code = this.formatFunction( layout.name, inputs, type, `\t${ flowData.vars }\n\n${ flowData.code }\n\treturn ${ flowData.result };` );

		const { functionNode } = nativeFn( code );

		functionNode._shaderNode = shaderNode;

		return functionNode;

	}

	addStack() {

		this.stack = stack( this.stack );
		return this.stack;

	}

	removeStack() {

		const lastStack = this.stack;
		this.stack = lastStack.parent;
		return lastStack;

	}

	getNodeData( node, shaderStage = this.shaderStage ) {

		const cache = node.isGlobal( this ) ? this.globalCache : this.cache;

		const nodeData = cache.getNodeData( node );

		if ( nodeData[ shaderStage ] === undefined ) nodeData[ shaderStage ] = {};

		return nodeData[ shaderStage ];

	}

	getNodeProperties( node, shaderStage = 'any' ) {

		const nodeData = this.getNodeData( node, shaderStage );

		return nodeData.properties || ( nodeData.properties = { outputNode: null, cacheKey: null } );

	}

	getBufferAttributeFromNode( node, type = node.getNodeType( this ) ) {

		const nodeData = this.getNodeData( node );

		let bufferAttribute = nodeData.bufferAttribute;

		if ( bufferAttribute === undefined ) {

			const index = this.uniforms.index ++;

			bufferAttribute = new NodeAttribute( 'nodeAttribute' + index, type, node );

			this.bufferAttributes.push( bufferAttribute );

			nodeData.bufferAttribute = bufferAttribute;

		}

		return bufferAttribute;

	}

	getStructTypeFromNode( node, name = null, shaderStage = this.shaderStage ) {

		const nodeData = this.getNodeData( node, shaderStage );

		let nodeStruct = nodeData.structType;

		if ( nodeStruct === undefined ) {

			const index = this.structs.index ++;

			node.name = `StructType${index}`;
			this.structs[ shaderStage ].push( node );

			nodeData.structType = node;

		}

		return node;

	}

	getUniformFromNode( node, name = null, type = node.getNodeType( this ), shaderStage = this.shaderStage ) {

		const nodeData = this.getNodeData( node, shaderStage );

		let nodeUniform = nodeData.uniform;

		if ( nodeUniform === undefined ) {

			if ( name === null ) name = 'nodeUniform' + this.uniforms.index;

			this.uniforms.index ++;

			nodeUniform = new NodeUniform( name, type, node );

			this.uniforms[ shaderStage ].push( nodeUniform );

			nodeData.uniform = nodeUniform;

		}

		return nodeUniform;

	}

	getVarFromNode( node, name = null, type = node.getNodeType( this ), shaderStage = this.shaderStage ) {

		const nodeData = this.getNodeData( node, shaderStage );

		let nodeVar = nodeData.variable;

		if ( nodeVar === undefined ) {

			const vars = this.vars[ shaderStage ];

			if ( name === null ) name = 'nodeVar' + vars.length;

			nodeVar = new NodeVar( name, type );

			vars.push( nodeVar );

			nodeData.variable = nodeVar;

		}

		return nodeVar;

	}

	getVaryingFromNode( node, name = null, needsInterpolation = false, type = node.getNodeType( this ) ) {

		const nodeData = this.getNodeData( node, 'any' );

		let nodeVarying = nodeData.varying;

		if ( nodeVarying === undefined ) {

			const varyings = this.varyings;

			if ( name === null ) name = 'nodeVarying' + varyings.length;

			nodeVarying = new NodeVarying( name, type );
			nodeVarying.needsInterpolation = needsInterpolation;

			varyings.push( nodeVarying );

			nodeData.varying = nodeVarying;

		}

		return nodeVarying;

	}

	getCodeFromNode( node, type = node.getNodeType( this ), shaderStage = this.shaderStage ) {

		const nodeData = this.getNodeData( node );

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

	createFlow() {

		return { code: '', tab: 1, vars: null, result: null };

	}

	addFlow( flow ) {

		this.flow.code += flow.code;
		this.flow.vars = this.flow.vars || flow.vars;
		this.flow.result = this.flow.result || flow.result;

		return this;

	}

	addFlowNode( shaderStage, node ) {

		this.flowNodes[ shaderStage ].push( node );

		return node;

	}

	addLineFlowCode( code ) {

		if ( code === '' ) return this;

		code = '\t'.repeat( this.flow.tab ) + code;

		if ( ! /;\s*$/.test( code ) ) {

			code = code + ';\n';

		}

		this.addFlowCode( code );

		return this;

	}

	addFlowCode( code ) {

		this.flow.code += code;

		return this;

	}

	addFlowTab() {

		this.flow.tab ++;

		return this;

	}

	removeFlowTab() {

		this.flow.tab --;

		return this;

	}

	flowShaderNode( shaderNode ) {

		const layout = shaderNode.layout;
		const inputs = {};

		for ( const input of layout.inputs ) {

			inputs[ input.name ] = new PropertyNode( input.type, input.name, false );

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

		const flow = this.createFlow();

		this.flow = flow;
		this.vars = { vertex: [], fragment: [], compute: [] };

		for ( const buildStage of defaultBuildStages ) {

			this.setBuildStage( buildStage );

			flow.result = node.build( this, output );

		}

		flow.vars = this.getVars();

		this.flow = previousFlow;
		this.vars = previousVars;
		this.setBuildStage( previousBuildStage );

		return flow;

	}

	flowChildNode( node, output = null ) {

		const previousFlow = this.flow;

		const flow = this.createFlow();

		this.flow = flow;

		flow.result = node.build( this, output );

		this.flow = previousFlow;

		return flow;

	}

	// rearrange varying snippets
	// @TODO: this is a hack to solve the problem of node varyings appearing in the start of the flow instead of the proper place (because of `addLineFlowCode`), a proper solution must be found
	// this hack is not a panacea, for example it breaks in some examples if making PositionNode derive from TempNode instead of just Node
	_sortVaryingSnippets( code, varyings = this.varyings ) { 

		const lines = code.split( '\n' );
		const varyingSnippets = [];

		for ( const varying of varyings ) {

			const name = this.getPropertyName( varying );
			const index = lines.findIndex( line => line.startsWith( `\t${ name } = ` ) );
			if ( index === - 1 ) continue;
			varyingSnippets.push( { line: lines[ index ], name } );
			lines.splice( index, 1 );

		}

		varyingSnippets.sort( ( a, b ) => a.name < b.name );

		let lastLineIndex = lines.includes( '\t// result' ) ? lines.indexOf( '\t// result' ) - 1 : lines.length;

		for ( const { line, name } of varyingSnippets ) {

			let index = lines.findIndex( line => line.includes( name ) );
			if ( index === - 1 ) index = lastLineIndex;

			lines.splice( index, 0, line );
			lastLineIndex ++;

		}

		return lines.join( '\n' );

	}

	prepareShaderFlow( vertexSnippet, fragmentSnippet, shaderStage = this.shaderStage ) {

		const shaderFlow = this.shaderFlows[ shaderStage ];

		let flow = '// code\n\n';
		flow += shaderFlow.code;

		if ( shaderFlow.result !== '' ) {

			flow += '\n\t// result\n\t';

			if ( shaderStage === 'vertex' ) {

				flow += vertexSnippet;

			} else if ( shaderStage === 'fragment' ) {

				flow += fragmentSnippet;

			}

			flow += `${ shaderFlow.result };`;

		}

		if ( shaderStage === 'vertex' ) {

			flow = this._sortVaryingSnippets( flow );

		}

		return flow;

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

	getVars( shaderStage = this.shaderStage ) {

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

	getCodes( shaderStage = this.shaderStage ) {

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

		if ( this.shaderStage !== null ) this.shaderFlows[ this.shaderStage ] = this.flow;

		this.shaderStage = shaderStage;

		if ( shaderStage !== null ) this.flow = this.shaderFlows[ shaderStage ];

	}

	getShaderStage() {

		return this.shaderStage;

	}

	getShaderStages() {

		return this.material !== null ? defaultShaderStages : [ 'compute' ];

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

		if ( this.material !== null ) {

			NodeMaterial.fromMaterial( this.material ).build( this );

		} else {

			this.addFlowNode( 'compute', this.object );

		}

		// setup() -> stage 1: create possible new nodes and returns an output reference node
		// analyze()   -> stage 2: analyze nodes to possible optimization and validation
		// generate()  -> stage 3: generate shader

		for ( const buildStage of defaultBuildStages ) {

			this.setBuildStage( buildStage );

			for ( const shaderStage of shaderStages ) {

				this.setShaderStage( shaderStage );

				const flowNodes = this.flowNodes[ shaderStage ];

				for ( const node of flowNodes ) {

					if ( buildStage === 'generate' ) {

						this.addFlow( this.flowChildNode( node ) );

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

	getUniformGPU( nodeUniform, type = nodeUniform.type ) {

		if ( type === 'float' ) return new FloatNodeUniform( nodeUniform );
		if ( type === 'vec2' ) return new Vector2NodeUniform( nodeUniform );
		if ( type === 'vec3' ) return new Vector3NodeUniform( nodeUniform );
		if ( type === 'vec4' ) return new Vector4NodeUniform( nodeUniform );
		if ( type === 'color' ) return new ColorNodeUniform( nodeUniform );
		if ( type === 'mat3' ) return new Matrix3NodeUniform( nodeUniform );
		if ( type === 'mat4' ) return new Matrix4NodeUniform( nodeUniform );

		throw new Error( `Uniform "${type}" not declared.` );

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

		if ( toTypeLength === 4 ) { // toType is vec4-like

			return this.formatOperation( '()', this.getType( toType ), [ this.format( snippet, fromType, 'vec3' ), '1.0' ] );

		}

		if ( fromTypeLength === 2 ) { // fromType is vec2-like and toType is vec3-like

			return this.formatOperation( '()', this.getType( toType ), [ this.format( snippet, fromType, 'vec2' ), '0.0' ] );

		}

		return this.formatOperation( '()', this.getType( toType ), snippet ); // fromType is float-like

	}

	_parseTopLevel( str ) {

		const operators = [ '.', '~', '!', '++', '--', '+', '-', '*', '/', '%', '<<', '>>', '<', '>', '<=', '>=', '==', '!=', '&', '^', '|', '&&', '^^', '||' ];

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

		if ( languageOperators.replace[ op ] !== undefined ) { // change operator to another if needed

			if ( languageOperators.replace[ op ].endsWith( '()' ) && output !== null && this.getTypeLength( output ) > 1 ) {

				return `${ languageOperators.replace[ op ].slice( 0, - 2 ) }( ${ arg1 }, ${ arg2 } )`;

			}

			if ( ! languageOperators.replace[ op ].endsWith( '()' ) ) {

				op = languageOperators.replace[ op ];

			}

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

		if ( ! operators.includes( op ) ) {

			console.warn( `${ this.constructor.name }: Operator ${ op } is not supported.` );

		}

		if ( Array.isArray( arg2 ) ) arg2 = arg2.join( ', ' );

		if ( op === '()' || op === '[]' ) {

			return `${ arg1 }${ op[ 0 ] } ${ arg2 } ${ op[ 1 ] }`;

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

				if ( arg2.startsWith( '(' ) && arg2.endsWith( ')' ) ) {

					const slice = arg2.slice( 1, - 1 ).trim();
					if ( slice.indexOf( ')' ) >= slice.indexOf( '(' ) ) arg2 = slice; // RHS' second argument was wrapped in brackets, remove them

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

		return `// Three.js r${ REVISION } - NodeMaterial System`;

	}

}

export default NodeBuilder;
