import NodeUniform from './NodeUniform.js';
import NodeAttribute from './NodeAttribute.js';
import NodeVarying from './NodeVarying.js';
import NodeVar from './NodeVar.js';
import NodeCode from './NodeCode.js';
import NodeCache from './NodeCache.js';
import ParameterNode from './ParameterNode.js';
import FunctionNode from '../code/FunctionNode.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { NodeUpdateType, defaultBuildStages, shaderStages } from './constants.js';

import {
	NumberNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform,
	ColorNodeUniform, Matrix3NodeUniform, Matrix4NodeUniform
} from '../../renderers/common/nodes/NodeUniform.js';

import { stack } from './StackNode.js';
import { getCurrentStack, setCurrentStack } from '../tsl/TSLBase.js';

import CubeRenderTarget from '../../renderers/common/CubeRenderTarget.js';
import ChainMap from '../../renderers/common/ChainMap.js';

import PMREMGenerator from '../../renderers/common/extras/PMREMGenerator.js';

import BindGroup from '../../renderers/common/BindGroup.js';

import { REVISION } from '../../constants.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { Color } from '../../math/Color.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';
import { Vector4 } from '../../math/Vector4.js';
import { Float16BufferAttribute } from '../../core/BufferAttribute.js';
import { IntType, UnsignedIntType, LinearFilter, LinearMipmapNearestFilter, NearestMipmapLinearFilter, LinearMipmapLinearFilter } from '../../constants.js';

const rendererCache = new WeakMap();

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

	if ( /e/g.test( value ) ) {

		return String( value ).replace( /\+/g, '' );

	} else {

		value = Number( value );

		return value + ( value % 1 ? '' : '.0' );

	}

};

class NodeBuilder {

	constructor( object, renderer, parser ) {

		this.object = object;
		this.material = ( object && object.material ) || null;
		this.geometry = ( object && object.geometry ) || null;
		this.renderer = renderer;
		this.parser = parser;
		this.scene = null;
		this.camera = null;

		this.nodes = [];
		this.sequentialNodes = [];
		this.updateNodes = [];
		this.updateBeforeNodes = [];
		this.updateAfterNodes = [];
		this.hashNodes = {};

		this.monitor = null;

		this.lightsNode = null;
		this.environmentNode = null;
		this.fogNode = null;

		this.clippingContext = null;

		this.vertexShader = null;
		this.fragmentShader = null;
		this.computeShader = null;

		this.flowNodes = { vertex: [], fragment: [], compute: [] };
		this.flowCode = { vertex: '', fragment: '', compute: '' };
		this.uniforms = { vertex: [], fragment: [], compute: [], index: 0 };
		this.structs = { vertex: [], fragment: [], compute: [], index: 0 };
		this.bindings = { vertex: {}, fragment: {}, compute: {} };
		this.bindingsIndexes = {};
		this.bindGroups = null;
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
			material: this.material
		};

		this.cache = new NodeCache();
		this.globalCache = this.cache;

		this.flowsData = new WeakMap();

		this.shaderStage = null;
		this.buildStage = null;

		this.useComparisonMethod = false;

	}

	getBindGroupsCache() {

		let bindGroupsCache = rendererCache.get( this.renderer );

		if ( bindGroupsCache === undefined ) {

			bindGroupsCache = new ChainMap();

			rendererCache.set( this.renderer, bindGroupsCache );

		}

		return bindGroupsCache;

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

	_getBindGroup( groupName, bindings ) {

		const bindGroupsCache = this.getBindGroupsCache();

		//

		const bindingsArray = [];

		let sharedGroup = true;

		for ( const binding of bindings ) {

			bindingsArray.push( binding );

			sharedGroup = sharedGroup && binding.groupNode.shared !== true;

		}

		//

		let bindGroup;

		if ( sharedGroup ) {

			bindGroup = bindGroupsCache.get( bindingsArray );

			if ( bindGroup === undefined ) {

				bindGroup = new BindGroup( groupName, bindingsArray, this.bindingsIndexes[ groupName ].group, bindingsArray );

				bindGroupsCache.set( bindingsArray, bindGroup );

			}

		} else {

			bindGroup = new BindGroup( groupName, bindingsArray, this.bindingsIndexes[ groupName ].group, bindingsArray );

		}

		return bindGroup;

	}

	getBindGroupArray( groupName, shaderStage ) {

		const bindings = this.bindings[ shaderStage ];

		let bindGroup = bindings[ groupName ];

		if ( bindGroup === undefined ) {

			if ( this.bindingsIndexes[ groupName ] === undefined ) {

				this.bindingsIndexes[ groupName ] = { binding: 0, group: Object.keys( this.bindingsIndexes ).length };

			}

			bindings[ groupName ] = bindGroup = [];

		}

		return bindGroup;

	}

	getBindings() {

		let bindingsGroups = this.bindGroups;

		if ( bindingsGroups === null ) {

			const groups = {};
			const bindings = this.bindings;

			for ( const shaderStage of shaderStages ) {

				for ( const groupName in bindings[ shaderStage ] ) {

					const uniforms = bindings[ shaderStage ][ groupName ];

					const groupUniforms = groups[ groupName ] || ( groups[ groupName ] = [] );
					groupUniforms.push( ...uniforms );

				}

			}

			bindingsGroups = [];

			for ( const groupName in groups ) {

				const group = groups[ groupName ];

				const bindingsGroup = this._getBindGroup( groupName, group );

				bindingsGroups.push( bindingsGroup );

			}

			this.bindGroups = bindingsGroups;

		}

		return bindingsGroups;

	}

	sortBindingGroups() {

		const bindingsGroups = this.getBindings();

		bindingsGroups.sort( ( a, b ) => ( a.bindings[ 0 ].groupNode.order - b.bindings[ 0 ].groupNode.order ) );

		for ( let i = 0; i < bindingsGroups.length; i ++ ) {

			const bindingGroup = bindingsGroups[ i ];
			this.bindingsIndexes[ bindingGroup.name ].group = i;

			bindingGroup.index = i;

		}

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

	addSequentialNode( node ) {

		if ( this.sequentialNodes.includes( node ) === false ) {

			this.sequentialNodes.push( node );

		}

	}

	buildUpdateNodes() {

		for ( const node of this.nodes ) {

			const updateType = node.getUpdateType();

			if ( updateType !== NodeUpdateType.NONE ) {

				this.updateNodes.push( node.getSelf() );

			}

		}

		for ( const node of this.sequentialNodes ) {

			const updateBeforeType = node.getUpdateBeforeType();
			const updateAfterType = node.getUpdateAfterType();

			if ( updateBeforeType !== NodeUpdateType.NONE ) {

				this.updateBeforeNodes.push( node.getSelf() );

			}

			if ( updateAfterType !== NodeUpdateType.NONE ) {

				this.updateAfterNodes.push( node.getSelf() );

			}

		}

	}

	get currentNode() {

		return this.chaining[ this.chaining.length - 1 ];

	}

	isFilteredTexture( texture ) {

		return ( texture.magFilter === LinearFilter || texture.magFilter === LinearMipmapNearestFilter || texture.magFilter === NearestMipmapLinearFilter || texture.magFilter === LinearMipmapLinearFilter ||
			texture.minFilter === LinearFilter || texture.minFilter === LinearMipmapNearestFilter || texture.minFilter === NearestMipmapLinearFilter || texture.minFilter === LinearMipmapLinearFilter );

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

	getSharedContext() {

		const context = { ...this.context };

		delete context.material;

		return this.context;

	}

	setCache( cache ) {

		this.cache = cache;

	}

	getCache() {

		return this.cache;

	}

	getCacheFromNode( node, parent = true ) {

		const data = this.getDataFromNode( node );
		if ( data.cache === undefined ) data.cache = new NodeCache( parent ? this.getCache() : null );

		return data.cache;

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

	getDrawIndex() {

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

	increaseUsage( node ) {

		const nodeData = this.getDataFromNode( node );
		nodeData.usageCount = nodeData.usageCount === undefined ? 1 : nodeData.usageCount + 1;

		return nodeData.usageCount;

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
		if ( type === 'color' ) return `${ this.getType( 'vec3' ) }( ${ toFloat( value.r ) }, ${ toFloat( value.g ) }, ${ toFloat( value.b ) } )`;

		const typeLength = this.getTypeLength( type );

		const componentType = this.getComponentType( type );

		const generateConst = value => this.generateConst( componentType, value );

		if ( typeLength === 2 ) {

			return `${ this.getType( type ) }( ${ generateConst( value.x ) }, ${ generateConst( value.y ) } )`;

		} else if ( typeLength === 3 ) {

			return `${ this.getType( type ) }( ${ generateConst( value.x ) }, ${ generateConst( value.y ) }, ${ generateConst( value.z ) } )`;

		} else if ( typeLength === 4 ) {

			return `${ this.getType( type ) }( ${ generateConst( value.x ) }, ${ generateConst( value.y ) }, ${ generateConst( value.z ) }, ${ generateConst( value.w ) } )`;

		} else if ( typeLength > 4 && value && ( value.isMatrix3 || value.isMatrix4 ) ) {

			return `${ this.getType( type ) }( ${ value.elements.map( generateConst ).join( ', ' ) } )`;

		} else if ( typeLength > 4 ) {

			return `${ this.getType( type ) }()`;

		}

		throw new Error( `NodeBuilder: Type '${type}' not found in generate constant attempt.` );

	}

	getType( type ) {

		if ( type === 'color' ) return 'vec3';

		return type;

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

		return type === 'void' || type === 'property' || type === 'sampler' || type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'depthTexture' || type === 'texture3D';

	}

	needsToWorkingColorSpace( /*texture*/ ) {

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

	getElementType( type ) {

		if ( type === 'mat2' ) return 'vec2';
		if ( type === 'mat3' ) return 'vec3';
		if ( type === 'mat4' ) return 'vec4';

		return this.getComponentType( type );

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
		if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'texture3D' ) return 'vec4';

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

		let nodeData = cache.getData( node );

		if ( nodeData === undefined ) {

			nodeData = {};

			cache.setData( node, nodeData );

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

	addFlowCodeHierarchy( node, nodeBlock ) {

		const { flowCodes, flowCodeBlock } = this.getDataFromNode( node );

		let needsFlowCode = true;
		let nodeBlockHierarchy = nodeBlock;

		while ( nodeBlockHierarchy ) {

			if ( flowCodeBlock.get( nodeBlockHierarchy ) === true ) {

				needsFlowCode = false;
				break;

			}

			nodeBlockHierarchy = this.getDataFromNode( nodeBlockHierarchy ).parentNodeBlock;

		}

		if ( needsFlowCode ) {

			for ( const flowCode of flowCodes ) {

				this.addLineFlowCode( flowCode );

			}

		}

	}

	addLineFlowCodeBlock( node, code, nodeBlock ) {

		const nodeData = this.getDataFromNode( node );
		const flowCodes = nodeData.flowCodes || ( nodeData.flowCodes = [] );
		const codeBlock = nodeData.flowCodeBlock || ( nodeData.flowCodeBlock = new WeakMap() );

		flowCodes.push( code );
		codeBlock.set( nodeBlock, true );

	}

	addLineFlowCode( code, node = null ) {

		if ( code === '' ) return this;

		if ( node !== null && this.context.nodeBlock ) {

			this.addLineFlowCodeBlock( node, code, this.context.nodeBlock );

		}

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

		const inputs = {
			[ Symbol.iterator ]() {

				let index = 0;
				const values = Object.values( this );
				return {
					next: () => ( {
						value: values[ index ],
						done: index ++ >= values.length
					} )
				};

			}
		};

		for ( const input of layout.inputs ) {

			inputs[ input.name ] = new ParameterNode( input.type, input.name );

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
		const previousCache = this.cache;
		const previousBuildStage = this.buildStage;
		const previousStack = this.stack;

		const flow = {
			code: ''
		};

		this.flow = flow;
		this.vars = {};
		this.cache = new NodeCache();
		this.stack = stack();

		for ( const buildStage of defaultBuildStages ) {

			this.setBuildStage( buildStage );

			flow.result = node.build( this, output );

		}

		flow.vars = this.getVars( this.shaderStage );

		this.flow = previousFlow;
		this.vars = previousVars;
		this.cache = previousCache;
		this.stack = previousStack;

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

	build() {

		const { object, material, renderer } = this;

		if ( material !== null ) {

			let nodeMaterial = renderer.library.fromMaterial( material );

			if ( nodeMaterial === null ) {

				console.error( `NodeMaterial: Material "${ material.type }" is not compatible.` );

				nodeMaterial = new NodeMaterial();

			}

			nodeMaterial.build( this );

		} else {

			this.addFlow( 'compute', object );

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

		if ( type === 'float' || type === 'int' || type === 'uint' ) return new NumberNodeUniform( uniformNode );
		if ( type === 'vec2' || type === 'ivec2' || type === 'uvec2' ) return new Vector2NodeUniform( uniformNode );
		if ( type === 'vec3' || type === 'ivec3' || type === 'uvec3' ) return new Vector3NodeUniform( uniformNode );
		if ( type === 'vec4' || type === 'ivec4' || type === 'uvec4' ) return new Vector4NodeUniform( uniformNode );
		if ( type === 'color' ) return new ColorNodeUniform( uniformNode );
		if ( type === 'mat3' ) return new Matrix3NodeUniform( uniformNode );
		if ( type === 'mat4' ) return new Matrix4NodeUniform( uniformNode );

		throw new Error( `Uniform "${type}" not declared.` );

	}

	createNodeMaterial( type = 'NodeMaterial' ) { // @deprecated, r168

		throw new Error( `THREE.NodeBuilder: createNodeMaterial() was deprecated. Use new ${ type }() instead.` );

	}

	format( snippet, fromType, toType ) {

		fromType = this.getVectorType( fromType );
		toType = this.getVectorType( toType );

		if ( fromType === toType || toType === null || this.isReference( toType ) ) {

			return snippet;

		}

		const fromTypeLength = this.getTypeLength( fromType );
		const toTypeLength = this.getTypeLength( toType );

		if ( fromTypeLength === 16 && toTypeLength === 9 ) {

			return `${ this.getType( toType ) }(${ snippet }[0].xyz, ${ snippet }[1].xyz, ${ snippet }[2].xyz)`;

		}

		if ( fromTypeLength === 9 && toTypeLength === 4 ) {

			return `${ this.getType( toType ) }(${ snippet }[0].xy, ${ snippet }[1].xy)`;

		}


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

			return this.format( `${ snippet }.${ 'xyz'.slice( 0, toTypeLength ) }`, this.getTypeFromLength( toTypeLength, this.getComponentType( fromType ) ), toType );

		}

		if ( toTypeLength === 4 && fromTypeLength > 1 ) { // toType is vec4-like

			return `${ this.getType( toType ) }( ${ this.format( snippet, fromType, 'vec3' ) }, 1.0 )`;

		}

		if ( fromTypeLength === 2 ) { // fromType is vec2-like and toType is vec3-like

			return `${ this.getType( toType ) }( ${ this.format( snippet, fromType, 'vec2' ) }, 0.0 )`;

		}

		if ( fromTypeLength === 1 && toTypeLength > 1 && fromType !== this.getComponentType( toType ) ) { // fromType is float-like

			// convert a number value to vector type, e.g:
			// vec3( 1u ) -> vec3( float( 1u ) )

			snippet = `${ this.getType( this.getComponentType( toType ) ) }( ${ snippet } )`;

		}

		return `${ this.getType( toType ) }( ${ snippet } )`; // fromType is float-like

	}

	getSignature() {

		return `// Three.js r${ REVISION } - Node System\n`;

	}

}

export default NodeBuilder;
