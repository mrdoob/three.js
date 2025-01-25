import NodeUniform from './NodeUniform.js';
import NodeAttribute from './NodeAttribute.js';
import NodeVarying from './NodeVarying.js';
import NodeVar from './NodeVar.js';
import NodeCode from './NodeCode.js';
import NodeCache from './NodeCache.js';
import ParameterNode from './ParameterNode.js';
import StructType from './StructType.js';
import FunctionNode from '../code/FunctionNode.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { getTypeFromLength } from './NodeUtils.js';
import { NodeUpdateType, defaultBuildStages, shaderStages } from './constants.js';

import {
	NumberNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform,
	ColorNodeUniform, Matrix2NodeUniform, Matrix3NodeUniform, Matrix4NodeUniform
} from '../../renderers/common/nodes/NodeUniform.js';

import { stack } from './StackNode.js';
import { getCurrentStack, setCurrentStack } from '../tsl/TSLBase.js';

import CubeRenderTarget from '../../renderers/common/CubeRenderTarget.js';
import ChainMap from '../../renderers/common/ChainMap.js';

import PMREMGenerator from '../../renderers/common/extras/PMREMGenerator.js';

import BindGroup from '../../renderers/common/BindGroup.js';

import { REVISION, IntType, UnsignedIntType, LinearFilter, LinearMipmapNearestFilter, NearestMipmapLinearFilter, LinearMipmapLinearFilter } from '../../constants.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { Color } from '../../math/Color.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';
import { Vector4 } from '../../math/Vector4.js';
import { Float16BufferAttribute } from '../../core/BufferAttribute.js';

const rendererCache = new WeakMap();

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

/**
 * Base class for builders which generate a shader program based
 * on a 3D object and its node material definition.
 */
class NodeBuilder {

	/**
	 * Constructs a new node builder.
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {Renderer} renderer - The current renderer.
	 * @param {NodeParser} parser - A reference to a node parser.
	 */
	constructor( object, renderer, parser ) {

		/**
		 * The 3D object.
		 *
		 * @type {Object3D}
		 */
		this.object = object;

		/**
		 * The material of the 3D object.
		 *
		 * @type {Material?}
		 */
		this.material = ( object && object.material ) || null;

		/**
		 * The geometry of the 3D object.
		 *
		 * @type {BufferGeometry?}
		 */
		this.geometry = ( object && object.geometry ) || null;

		/**
		 * The current renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * A reference to a node parser.
		 *
		 * @type {NodeParser}
		 */
		this.parser = parser;

		/**
		 * The scene the 3D object belongs to.
		 *
		 * @type {Scene?}
		 * @default null
		 */
		this.scene = null;

		/**
		 * The camera the 3D object is rendered with.
		 *
		 * @type {Camera?}
		 * @default null
		 */
		this.camera = null;

		/**
		 * A list of all nodes the builder is processing
		 * for this 3D object.
		 *
		 * @type {Array<Node>}
		 */
		this.nodes = [];

		/**
		 * A list of all sequential nodes.
		 *
		 * @type {Array<Node>}
		 */
		this.sequentialNodes = [];

		/**
		 * A list of all nodes which {@link Node#update} method should be executed.
		 *
		 * @type {Array<Node>}
		 */
		this.updateNodes = [];

		/**
		 * A list of all nodes which {@link Node#updateBefore} method should be executed.
		 *
		 * @type {Array<Node>}
		 */
		this.updateBeforeNodes = [];

		/**
		 * A list of all nodes which {@link Node#updateAfter} method should be executed.
		 *
		 * @type {Array<Node>}
		 */
		this.updateAfterNodes = [];

		/**
		 * A dictionary that assigns each node to a unique hash.
		 *
		 * @type {Object<Number,Node>}
		 */
		this.hashNodes = {};

		/**
		 * A reference to a node material observer.
		 *
		 * @type {NodeMaterialObserver?}
		 * @default null
		 */
		this.observer = null;

		/**
		 * A reference to the current lights node.
		 *
		 * @type {LightsNode?}
		 * @default null
		 */
		this.lightsNode = null;

		/**
		 * A reference to the current environment node.
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.environmentNode = null;

		/**
		 * A reference to the current fog node.
		 *
		 * @type {FogNode?}
		 * @default null
		 */
		this.fogNode = null;

		/**
		 * The current clipping context.
		 *
		 * @type {ClippingContext?}
		 */
		this.clippingContext = null;

		/**
		 * The generated vertex shader.
		 *
		 * @type {String?}
		 */
		this.vertexShader = null;

		/**
		 * The generated fragment shader.
		 *
		 * @type {String?}
		 */
		this.fragmentShader = null;

		/**
		 * The generated compute shader.
		 *
		 * @type {String?}
		 */
		this.computeShader = null;

		/**
		 * Nodes used in the primary flow of code generation.
		 *
		 * @type {Object<String,Array<Node>>}
		 */
		this.flowNodes = { vertex: [], fragment: [], compute: [] };

		/**
		 * Nodes code from `.flowNodes`.
		 *
		 * @type {Object<String,String>}
		 */
		this.flowCode = { vertex: '', fragment: '', compute: '' };

		/**
		 * This dictionary holds the node uniforms of the builder.
		 * The uniforms are maintained in an array for each shader stage.
		 *
		 * @type {Object}
		 */
		this.uniforms = { vertex: [], fragment: [], compute: [], index: 0 };

		/**
		 * This dictionary holds the output structs of the builder.
		 * The structs are maintained in an array for each shader stage.
		 *
		 * @type {Object}
		 */
		this.structs = { vertex: [], fragment: [], compute: [], index: 0 };

		/**
		 * This dictionary holds the bindings for each shader stage.
		 *
		 * @type {Object}
		 */
		this.bindings = { vertex: {}, fragment: {}, compute: {} };

		/**
		 * This dictionary maintains the binding indices per bind group.
		 *
		 * @type {Object}
		 */
		this.bindingsIndexes = {};

		/**
		 * Reference to the array of bind groups.
		 *
		 * @type {Array<BindGroup>?}
		 */
		this.bindGroups = null;

		/**
		 * This array holds the node attributes of this builder
		 * created via {@link AttributeNode}.
		 *
		 * @type {Array<NodeAttribute>}
		 */
		this.attributes = [];

		/**
		 * This array holds the node attributes of this builder
		 * created via {@link BufferAttributeNode}.
		 *
		 * @type {Array<NodeAttribute>}
		 */
		this.bufferAttributes = [];

		/**
		 * This array holds the node varyings of this builder.
		 *
		 * @type {Array<NodeVarying>}
		 */
		this.varyings = [];

		/**
		 * This dictionary holds the (native) node codes of this builder.
		 * The codes are maintained in an array for each shader stage.
		 *
		 * @type {Object<String,Array<NodeCode>>}
		 */
		this.codes = {};

		/**
		 * This dictionary holds the node variables of this builder.
		 * The variables are maintained in an array for each shader stage.
		 *
		 * @type {Object<String,Array<NodeVar>>}
		 */
		this.vars = {};

		/**
		 * Current code flow.
		 * All code generated in this stack will be stored in `.flow`.
		 *
		 * @type {{code: String}}
		 */
		this.flow = { code: '' };

		/**
		 * A chain of nodes.
		 * Used to check recursive calls in node-graph.
		 *
		 * @type {Array<Node>}
		 */
		this.chaining = [];

		/**
		 * The current stack.
		 * This reflects the current process in the code block hierarchy,
		 * it is useful to know if the current process is inside a conditional for example.
		 *
		 * @type {StackNode}
		 */
		this.stack = stack();

		/**
		 * List of stack nodes.
		 * The current stack hierarchy is stored in an array.
		 *
		 * @type {Array<StackNode>}
		 */
		this.stacks = [];

		/**
		 * A tab value. Used for shader string generation.
		 *
		 * @type {String}
		 * @default '\t'
		 */
		this.tab = '\t';

		/**
		 * Reference to the current function node.
		 *
		 * @type {FunctionNode?}
		 * @default null
		 */
		this.currentFunctionNode = null;

		/**
		 * The builder's context.
		 *
		 * @type {Object}
		 */
		this.context = {
			material: this.material
		};

		/**
		 * The builder's cache.
		 *
		 * @type {NodeCache}
		 */
		this.cache = new NodeCache();

		/**
		 * Since the {@link NodeBuilder#cache} might be temporarily
		 * overwritten by other caches, this member retains the reference
		 * to the builder's own cache.
		 *
		 * @type {NodeCache}
		 * @default this.cache
		 */
		this.globalCache = this.cache;

		this.flowsData = new WeakMap();

		/**
		 * The current shader stage.
		 *
		 * @type {('vertex'|'fragment'|'compute'|'any')?}
		 */
		this.shaderStage = null;

		/**
		 * The current build stage.
		 *
		 * @type {('setup'|'analyze'|'generate')?}
		 */
		this.buildStage = null;

		/**
		 * Whether comparison in shader code are generated with methods or not.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.useComparisonMethod = false;

	}

	/**
	 * Returns the bind groups of the current renderer.
	 *
	 * @return {ChainMap} The cache.
	 */
	getBindGroupsCache() {

		let bindGroupsCache = rendererCache.get( this.renderer );

		if ( bindGroupsCache === undefined ) {

			bindGroupsCache = new ChainMap();

			rendererCache.set( this.renderer, bindGroupsCache );

		}

		return bindGroupsCache;

	}

	/**
	 * Factory method for creating an instance of {@link RenderTarget} with the given
	 * dimensions and options.
	 *
	 * @param {Number} width - The width of the render target.
	 * @param {Number} height - The height of the render target.
	 * @param {Object} options - The options of the render target.
	 * @return {RenderTarget} The render target.
	 */
	createRenderTarget( width, height, options ) {

		return new RenderTarget( width, height, options );

	}

	/**
	 * Factory method for creating an instance of {@link CubeRenderTarget} with the given
	 * dimensions and options.
	 *
	 * @param {Number} size - The size of the cube render target.
	 * @param {Object} options - The options of the cube render target.
	 * @return {CubeRenderTarget} The cube render target.
	 */
	createCubeRenderTarget( size, options ) {

		return new CubeRenderTarget( size, options );

	}

	/**
	 * Factory method for creating an instance of {@link PMREMGenerator}.
	 *
	 * @return {PMREMGenerator} The PMREM generator.
	 */
	createPMREMGenerator() {

		// TODO: Move Materials.js to outside of the Nodes.js in order to remove this function and improve tree-shaking support

		return new PMREMGenerator( this.renderer );

	}

	/**
	 * Whether the given node is included in the internal array of nodes or not.
	 *
	 * @param {Node} node - The node to test.
	 * @return {Boolean} Whether the given node is included in the internal array of nodes or not.
	 */
	includes( node ) {

		return this.nodes.includes( node );

	}

	/**
	 * Returns the output struct name which is required by
	 * {@link module:OutputStructNode}.
	 *
	 * @abstract
	 * @return {String} The name of the output struct.
	 */
	getOutputStructName() {}

	/**
	 * Returns a bind group for the given group name and binding.
	 *
	 * @private
	 * @param {String} groupName - The group name.
	 * @param {Array<NodeUniformsGroup>} bindings - List of bindings.
	 * @return {BindGroup} The bind group
	 */
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

	/**
	 * Returns an array of node uniform groups for the given group name and shader stage.
	 *
	 * @param {String} groupName - The group name.
	 * @param {('vertex'|'fragment'|'compute'|'any')} shaderStage - The shader stage.
	 * @return {Array<NodeUniformsGroup>} The array of node uniform groups.
	 */
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

	/**
	 * Returns a list bindings of all shader stages separated by groups.
	 *
	 * @return {Array<BindGroup>} The list of bindings.
	 */
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

	/**
	 * Sorts the bind groups and updates {@link NodeBuilder#bindingsIndexes}.
	 */
	sortBindingGroups() {

		const bindingsGroups = this.getBindings();

		bindingsGroups.sort( ( a, b ) => ( a.bindings[ 0 ].groupNode.order - b.bindings[ 0 ].groupNode.order ) );

		for ( let i = 0; i < bindingsGroups.length; i ++ ) {

			const bindingGroup = bindingsGroups[ i ];
			this.bindingsIndexes[ bindingGroup.name ].group = i;

			bindingGroup.index = i;

		}

	}

	/**
	 * The builder maintains each node in a hash-based dictionary.
	 * This method sets the given node (value) with the given hash (key) into this dictionary.
	 *
	 * @param {Node} node - The node to add.
	 * @param {Number} hash - The hash of the node.
	 */
	setHashNode( node, hash ) {

		this.hashNodes[ hash ] = node;

	}

	/**
	 * Adds a node to this builder.
	 *
	 * @param {Node} node - The node to add.
	 */
	addNode( node ) {

		if ( this.nodes.includes( node ) === false ) {

			this.nodes.push( node );

			this.setHashNode( node, node.getHash( this ) );

		}

	}

	/**
	 * It is used to add Nodes that will be used as FRAME and RENDER events,
	 * and need to follow a certain sequence in the calls to work correctly.
	 * This function should be called after 'setup()' in the 'build()' process to ensure that the child nodes are processed first.
	 *
	 * @param {Node} node - The node to add.
	 */
	addSequentialNode( node ) {

		if ( this.sequentialNodes.includes( node ) === false ) {

			this.sequentialNodes.push( node );

		}

	}

	/**
	 * Checks the update types of nodes
	 */
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

	/**
	 * A reference the current node which is the
	 * last node in the chain of nodes.
	 *
	 * @type {Node}
	 */
	get currentNode() {

		return this.chaining[ this.chaining.length - 1 ];

	}

	/**
	 * Whether the given texture is filtered or not.
	 *
	 * @param {Texture} texture - The texture to check.
	 * @return {Boolean} Whether the given texture is filtered or not.
	 */
	isFilteredTexture( texture ) {

		return ( texture.magFilter === LinearFilter || texture.magFilter === LinearMipmapNearestFilter || texture.magFilter === NearestMipmapLinearFilter || texture.magFilter === LinearMipmapLinearFilter ||
			texture.minFilter === LinearFilter || texture.minFilter === LinearMipmapNearestFilter || texture.minFilter === NearestMipmapLinearFilter || texture.minFilter === LinearMipmapLinearFilter );

	}

	/**
	 * Adds the given node to the internal node chain.
	 * This is used to check recursive calls in node-graph.
	 *
	 * @param {Node} node - The node to add.
	 */
	addChain( node ) {

		/*
		if ( this.chaining.indexOf( node ) !== - 1 ) {

			console.warn( 'Recursive node: ', node );

		}
		*/

		this.chaining.push( node );

	}

	/**
	 * Removes the given node from the internal node chain.
	 *
	 * @param {Node} node - The node to remove.
	 */
	removeChain( node ) {

		const lastChain = this.chaining.pop();

		if ( lastChain !== node ) {

			throw new Error( 'NodeBuilder: Invalid node chaining!' );

		}

	}

	/**
	 * Returns the native shader method name for a given generic name. E.g.
	 * the method name `textureDimensions` matches the WGSL name but must be
	 * resolved to `textureSize` in GLSL.
	 *
	 * @abstract
	 * @param {String} method - The method name to resolve.
	 * @return {String} The resolved method name.
	 */
	getMethod( method ) {

		return method;

	}

	/**
	 * Returns a node for the given hash, see {@link NodeBuilder#setHashNode}.
	 *
	 * @param {Number} hash - The hash of the node.
	 * @return {Node} The found node.
	 */
	getNodeFromHash( hash ) {

		return this.hashNodes[ hash ];

	}

	/**
	 * Adds the Node to a target flow so that it can generate code in the 'generate' process.
	 *
	 * @param {('vertex'|'fragment'|'compute')} shaderStage - The shader stage.
	 * @param {Node} node - The node to add.
	 * @return {Node} The node.
	 */
	addFlow( shaderStage, node ) {

		this.flowNodes[ shaderStage ].push( node );

		return node;

	}

	/**
	 * Sets builder's context.
	 *
	 * @param {Object} context - The context to set.
	 */
	setContext( context ) {

		this.context = context;

	}

	/**
	 * Returns the builder's current context.
	 *
	 * @return {Object} The builder's current context.
	 */
	getContext() {

		return this.context;

	}

	/**
	 * Gets a context used in shader construction that can be shared across different materials.
	 * This is necessary since the renderer cache can reuse shaders generated in one material and use them in another.
	 *
	 * @return {Object} The builder's current context without material.
	 */
	getSharedContext() {

		const context = { ...this.context };

		delete context.material;

		return this.context;

	}

	/**
	 * Sets builder's cache.
	 *
	 * @param {NodeCache} cache - The cache to set.
	 */
	setCache( cache ) {

		this.cache = cache;

	}

	/**
	 * Returns the builder's current cache.
	 *
	 * @return {NodeCache} The builder's current cache.
	 */
	getCache() {

		return this.cache;

	}

	/**
	 * Returns a cache for the given node.
	 *
	 * @param {Node} node - The node.
	 * @param {Boolean} [parent=true] - Whether this node refers to a shared parent cache or not.
	 * @return {NodeCache} The cache.
	 */
	getCacheFromNode( node, parent = true ) {

		const data = this.getDataFromNode( node );
		if ( data.cache === undefined ) data.cache = new NodeCache( parent ? this.getCache() : null );

		return data.cache;

	}

	/**
	 * Whether the requested feature is available or not.
	 *
	 * @abstract
	 * @param {String} name - The requested feature.
	 * @return {Boolean} Whether the requested feature is supported or not.
	 */
	isAvailable( /*name*/ ) {

		return false;

	}

	/**
	 * Returns the vertexIndex input variable as a native shader string.
	 *
	 * @abstract
	 * @return {String} The instanceIndex shader string.
	 */
	getVertexIndex() {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Returns the instanceIndex input variable as a native shader string.
	 *
	 * @abstract
	 * @return {String} The instanceIndex shader string.
	 */
	getInstanceIndex() {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Returns the drawIndex input variable as a native shader string.
	 * Only relevant for WebGL and its `WEBGL_multi_draw` extension.
	 *
	 * @abstract
	 * @return {String} The drawIndex shader string.
	 */
	getDrawIndex() {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Returns the frontFacing input variable as a native shader string.
	 *
	 * @abstract
	 * @return {String} The frontFacing shader string.
	 */
	getFrontFacing() {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Returns the fragCoord input variable as a native shader string.
	 *
	 * @abstract
	 * @return {String} The fragCoord shader string.
	 */
	getFragCoord() {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Whether to flip texture data along its vertical axis or not. WebGL needs
	 * this method evaluate to `true`, WebGPU to `false`.
	 *
	 * @abstract
	 * @return {Boolean} Whether to flip texture data along its vertical axis or not.
	 */
	isFlipY() {

		return false;

	}

	/**
	 * Calling this method increases the usage count for the given node by one.
	 *
	 * @param {Node} node - The node to increase the usage count for.
	 * @return {Number} The updated usage count.
	 */
	increaseUsage( node ) {

		const nodeData = this.getDataFromNode( node );
		nodeData.usageCount = nodeData.usageCount === undefined ? 1 : nodeData.usageCount + 1;

		return nodeData.usageCount;

	}

	/**
	 * Generates a texture sample shader string for the given texture data.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture.
	 * @param {String} textureProperty - The texture property name.
	 * @param {String} uvSnippet - Snippet defining the texture coordinates.
	 * @return {String} The generated shader string.
	 */
	generateTexture( /* texture, textureProperty, uvSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Generates a texture LOD shader string for the given texture data.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture.
	 * @param {String} textureProperty - The texture property name.
	 * @param {String} uvSnippet - Snippet defining the texture coordinates.
	 * @param {String?} depthSnippet - Snippet defining the 0-based texture array index to sample.
	 * @param {String} levelSnippet - Snippet defining the mip level.
	 * @return {String} The generated shader string.
	 */
	generateTextureLod( /* texture, textureProperty, uvSnippet, depthSnippet, levelSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Generates the array declaration string.
	 *
	 * @param {String} type - The type.
	 * @param {Number?} [count] - The count.
	 * @return {String} The generated value as a shader string.
	 */
	generateArrayDeclaration( type, count ) {

		return this.getType( type ) + '[ ' + count + ' ]';

	}

	/**
	 * Generates the array shader string for the given type and value.
	 *
	 * @param {String} type - The type.
	 * @param {Number?} [count] - The count.
	 * @param {Array<Node>?} [values=null] - The default values.
	 * @return {String} The generated value as a shader string.
	 */
	generateArray( type, count, values = null ) {

		let snippet = this.generateArrayDeclaration( type, count ) + '( ';

		for ( let i = 0; i < count; i ++ ) {

			const value = values ? values[ i ] : null;

			if ( value !== null ) {

				snippet += value.build( this, type );

			} else {

				snippet += this.generateConst( type );

			}

			if ( i < count - 1 ) snippet += ', ';

		}

		snippet += ' )';

		return snippet;

	}

	/**
	 * Generates the struct shader string.
	 *
	 * @param {String} type - The type.
	 * @param {Array<Object>} [membersLayout] - The count.
	 * @param {Array<Node>?} [values=null] - The default values.
	 * @return {String} The generated value as a shader string.
	 */
	generateStruct( type, membersLayout, values = null ) {

		const snippets = [];

		for ( const member of membersLayout ) {

			const { name, type } = member;

			if ( values && values[ name ] && values[ name ].isNode ) {

				snippets.push( values[ name ].build( this, type ) );

			} else {

				snippets.push( this.generateConst( type ) );

			}

		}

		return type + '( ' + snippets.join( ', ' ) + ' )';

	}


	/**
	 * Generates the shader string for the given type and value.
	 *
	 * @param {String} type - The type.
	 * @param {Any?} [value=null] - The value.
	 * @return {String} The generated value as a shader string.
	 */
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

	/**
	 * It might be necessary to convert certain data types to different ones
	 * so this method can be used to hide the conversion.
	 *
	 * @param {String} type - The type.
	 * @return {String} The updated type.
	 */
	getType( type ) {

		if ( type === 'color' ) return 'vec3';

		return type;

	}

	/**
	 * Whether the given attribute name is defined in the geometry or not.
	 *
	 * @param {String} name - The attribute name.
	 * @return {Boolean} Whether the given attribute name is defined in the geometry.
	 */
	hasGeometryAttribute( name ) {

		return this.geometry && this.geometry.getAttribute( name ) !== undefined;

	}

	/**
	 * Returns a node attribute for the given name and type.
	 *
	 * @param {String} name - The attribute's name.
	 * @param {String} type - The attribute's type.
	 * @return {NodeAttribute} The node attribute.
	 */
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

	/**
	 * Returns for the given node and shader stage the property name for the shader.
	 *
	 * @param {Node} node - The node.
	 * @param {('vertex'|'fragment'|'compute'|'any')} shaderStage - The shader stage.
	 * @return {String} The property name.
	 */
	getPropertyName( node/*, shaderStage*/ ) {

		return node.name;

	}

	/**
	 * Whether the given type is a vector type or not.
	 *
	 * @param {String} type - The type to check.
	 * @return {Boolean} Whether the given type is a vector type or not.
	 */
	isVector( type ) {

		return /vec\d/.test( type );

	}

	/**
	 * Whether the given type is a matrix type or not.
	 *
	 * @param {String} type - The type to check.
	 * @return {Boolean} Whether the given type is a matrix type or not.
	 */
	isMatrix( type ) {

		return /mat\d/.test( type );

	}

	/**
	 * Whether the given type is a reference type or not.
	 *
	 * @param {String} type - The type to check.
	 * @return {Boolean} Whether the given type is a reference type or not.
	 */
	isReference( type ) {

		return type === 'void' || type === 'property' || type === 'sampler' || type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'depthTexture' || type === 'texture3D';

	}

	/**
	 * Checks if the given texture requires a manual conversion to the working color space.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture to check.
	 * @return {Boolean} Whether the given texture requires a conversion to working color space or not.
	 */
	needsToWorkingColorSpace( /*texture*/ ) {

		return false;

	}

	/**
	 * Returns the component type of a given texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @return {String} The component type.
	 */
	getComponentTypeFromTexture( texture ) {

		const type = texture.type;

		if ( texture.isDataTexture ) {

			if ( type === IntType ) return 'int';
			if ( type === UnsignedIntType ) return 'uint';

		}

		return 'float';

	}

	/**
	 * Returns the element type for a given type.
	 *
	 * @param {String} type - The type.
	 * @return {String} The element type.
	 */
	getElementType( type ) {

		if ( type === 'mat2' ) return 'vec2';
		if ( type === 'mat3' ) return 'vec3';
		if ( type === 'mat4' ) return 'vec4';

		return this.getComponentType( type );

	}

	/**
	 * Returns the component type for a given type.
	 *
	 * @param {String} type - The type.
	 * @return {String} The component type.
	 */
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

	/**
	 * Returns the vector type for a given type.
	 *
	 * @param {String} type - The type.
	 * @return {String} The vector type.
	 */
	getVectorType( type ) {

		if ( type === 'color' ) return 'vec3';
		if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'texture3D' ) return 'vec4';

		return type;

	}

	/**
	 * Returns the data type for the given the length and component type.
	 *
	 * @param {Number} length - The length.
	 * @param {String} [componentType='float'] - The component type.
	 * @return {String} The type.
	 */
	getTypeFromLength( length, componentType = 'float' ) {

		if ( length === 1 ) return componentType;

		let baseType = getTypeFromLength( length );
		const prefix = componentType === 'float' ? '' : componentType[ 0 ];

		// fix edge case for mat2x2 being same size as vec4
		if ( /mat2/.test( componentType ) === true ) {

			baseType = baseType.replace( 'vec', 'mat' );

		}

		return prefix + baseType;

	}

	/**
	 * Returns the type for a given typed array.
	 *
	 * @param {TypedArray} array - The typed array.
	 * @return {String} The type.
	 */
	getTypeFromArray( array ) {

		return typeFromArray.get( array.constructor );

	}

	/**
	 * Returns the type for a given buffer attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 * @return {String} The type.
	 */
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

	/**
	 * Returns the length for the given data type.
	 *
	 * @param {String} type - The data type.
	 * @return {Number} The length.
	 */
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

	/**
	 * Returns the vector type for a given matrix type.
	 *
	 * @param {String} type - The matrix type.
	 * @return {String} The vector type.
	 */
	getVectorFromMatrix( type ) {

		return type.replace( 'mat', 'vec' );

	}

	/**
	 * For a given type this method changes the component type to the
	 * given value. E.g. `vec4` should be changed to the new component type
	 * `uint` which results in `uvec4`.
	 *
	 * @param {String} type - The type.
	 * @param {String} newComponentType - The new component type.
	 * @return {String} The new type.
	 */
	changeComponentType( type, newComponentType ) {

		return this.getTypeFromLength( this.getTypeLength( type ), newComponentType );

	}

	/**
	 * Returns the integer type pendant for the given type.
	 *
	 * @param {String} type - The type.
	 * @return {String} The integer type.
	 */
	getIntegerType( type ) {

		const componentType = this.getComponentType( type );

		if ( componentType === 'int' || componentType === 'uint' ) return type;

		return this.changeComponentType( type, 'int' );

	}

	/**
	 * Adds a stack node to the internal stack.
	 *
	 * @return {StackNode} The added stack node.
	 */
	addStack() {

		this.stack = stack( this.stack );

		this.stacks.push( getCurrentStack() || this.stack );
		setCurrentStack( this.stack );

		return this.stack;

	}

	/**
	 * Removes the last stack node from the internal stack.
	 *
	 * @return {StackNode} The removed stack node.
	 */
	removeStack() {

		const lastStack = this.stack;
		this.stack = lastStack.parent;

		setCurrentStack( this.stacks.pop() );

		return lastStack;

	}

	/**
	 * The builder maintains (cached) data for each node during the building process. This method
	 * can be used to get these data for a specific shader stage and cache.
	 *
	 * @param {Node} node - The node to get the data for.
	 * @param {('vertex'|'fragment'|'compute'|'any')} [shaderStage=this.shaderStage] - The shader stage.
	 * @param {NodeCache?} cache - An optional cache.
	 * @return {Object} The node data.
	 */
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

	/**
	 * Returns the properties for the given node and shader stage.
	 *
	 * @param {Node} node - The node to get the properties for.
	 * @param {('vertex'|'fragment'|'compute'|'any')} [shaderStage='any'] - The shader stage.
	 * @return {Object} The node properties.
	 */
	getNodeProperties( node, shaderStage = 'any' ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		return nodeData.properties || ( nodeData.properties = { outputNode: null } );

	}

	/**
	 * Returns an instance of {@link NodeAttribute} for the given buffer attribute node.
	 *
	 * @param {BufferAttributeNode} node - The buffer attribute node.
	 * @param {String} type - The node type.
	 * @return {NodeAttribute} The node attribute.
	 */
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

	/**
	 * Returns an instance of {@link StructType} for the given output struct node.
	 *
	 * @param {OutputStructNode} node - The output struct node.
	 * @param {Array<Object>} membersLayout - The output struct types.
	 * @param {String?} [name=null] - The name of the struct.
	 * @param {('vertex'|'fragment'|'compute'|'any')} [shaderStage=this.shaderStage] - The shader stage.
	 * @return {StructType} The struct type attribute.
	 */
	getStructTypeFromNode( node, membersLayout, name = null, shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		let structType = nodeData.structType;

		if ( structType === undefined ) {

			const index = this.structs.index ++;

			if ( name === null ) name = 'StructType' + index;

			structType = new StructType( name, membersLayout );

			this.structs[ shaderStage ].push( structType );

			nodeData.structType = structType;

		}

		return structType;

	}

	/**
	 * Returns an instance of {@link StructType} for the given output struct node.
	 *
	 * @param {OutputStructNode} node - The output struct node.
	 * @param {Array<Object>} membersLayout - The output struct types.
	 * @return {StructType} The struct type attribute.
	 */
	getOutputStructTypeFromNode( node, membersLayout ) {

		const structType = this.getStructTypeFromNode( node, membersLayout, 'OutputType', 'fragment' );
		structType.output = true;

		return structType;

	}

	/**
	 * Returns an instance of {@link NodeUniform} for the given uniform node.
	 *
	 * @param {UniformNode} node - The uniform node.
	 * @param {String} type - The uniform type.
	 * @param {('vertex'|'fragment'|'compute'|'any')} [shaderStage=this.shaderStage] - The shader stage.
	 * @param {String?} name - The name of the uniform.
	 * @return {NodeUniform} The node uniform.
	 */
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

	/**
	 * Returns the array length.
	 *
	 * @param {Node} node - The node.
	 * @return {Number?} The array length.
	 */
	getArrayCount( node ) {

		let count = null;

		if ( node.isArrayNode ) count = node.count;
		else if ( node.isVarNode && node.node.isArrayNode ) count = node.node.count;

		return count;

	}

	/**
	 * Returns an instance of {@link NodeVar} for the given variable node.
	 *
	 * @param {VarNode} node - The variable node.
	 * @param {String?} name - The variable's name.
	 * @param {String} [type=node.getNodeType( this )] - The variable's type.
	 * @param {('vertex'|'fragment'|'compute'|'any')} [shaderStage=this.shaderStage] - The shader stage.
	 * @param {Boolean} [readOnly=false] - Whether the variable is read-only or not.
	 *
	 * @return {NodeVar} The node variable.
	 */
	getVarFromNode( node, name = null, type = node.getNodeType( this ), shaderStage = this.shaderStage, readOnly = false ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		let nodeVar = nodeData.variable;

		if ( nodeVar === undefined ) {

			const idNS = readOnly ? '_const' : '_var';

			const vars = this.vars[ shaderStage ] || ( this.vars[ shaderStage ] = [] );
			const id = this.vars[ idNS ] || ( this.vars[ idNS ] = 0 );

			if ( name === null ) {

				name = ( readOnly ? 'nodeConst' : 'nodeVar' ) + id;

				this.vars[ idNS ] ++;

			}

			//

			const count = this.getArrayCount( node );

			nodeVar = new NodeVar( name, type, readOnly, count );

			if ( ! readOnly ) {

				vars.push( nodeVar );

			}

			nodeData.variable = nodeVar;

		}

		return nodeVar;

	}

	/**
	 * Returns whether a Node or its flow is deterministic, useful for use in `const`.
	 *
	 * @param {Node} node - The varying node.
	 * @return {Boolean} Returns true if deterministic.
	 */
	isDeterministic( node ) {

		if ( node.isMathNode ) {

			return this.isDeterministic( node.aNode ) &&
				( node.bNode ? this.isDeterministic( node.bNode ) : true ) &&
				( node.cNode ? this.isDeterministic( node.cNode ) : true );

		} else if ( node.isOperatorNode ) {

			return this.isDeterministic( node.aNode ) &&
				( node.bNode ? this.isDeterministic( node.bNode ) : true );

		} else if ( node.isArrayNode ) {

			if ( node.values !== null ) {

				for ( const n of node.values ) {

					if ( ! this.isDeterministic( n ) ) {

						return false;

					}

				}

			}

			return true;

		} else if ( node.isConstNode ) {

			return true;

		}

		return false;

	}

	/**
	 * Returns an instance of {@link NodeVarying} for the given varying node.
	 *
	 * @param {(VaryingNode|PropertyNode)} node - The varying node.
	 * @param {String?} name - The varying's name.
	 * @param {String} [type=node.getNodeType( this )] - The varying's type.
	 * @return {NodeVar} The node varying.
	 */
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

	/**
	 * Returns an instance of {@link NodeCode} for the given code node.
	 *
	 * @param {CodeNode} node - The code node.
	 * @param {String} type - The node type.
	 * @param {('vertex'|'fragment'|'compute'|'any')} [shaderStage=this.shaderStage] - The shader stage.
	 * @return {NodeCode} The node code.
	 */
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

	/**
	 * Adds a code flow based on the code-block hierarchy.

	 * This is used so that code-blocks like If,Else create their variables locally if the Node
	 * is only used inside one of these conditionals in the current shader stage.
	 *
	 * @param {Node} node - The node to add.
	 * @param {Node} nodeBlock - Node-based code-block. Usually 'ConditionalNode'.
	 */
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

	/**
	 * Add a inline-code to the current flow code-block.
	 *
	 * @param {Node} node - The node to add.
	 * @param {String} code - The code to add.
	 * @param {Node} nodeBlock - Current ConditionalNode
	 */
	addLineFlowCodeBlock( node, code, nodeBlock ) {

		const nodeData = this.getDataFromNode( node );
		const flowCodes = nodeData.flowCodes || ( nodeData.flowCodes = [] );
		const codeBlock = nodeData.flowCodeBlock || ( nodeData.flowCodeBlock = new WeakMap() );

		flowCodes.push( code );
		codeBlock.set( nodeBlock, true );

	}

	/**
	 * Add a inline-code to the current flow.
	 *
	 * @param {String} code - The code to add.
	 * @param {Node?} [node= null] - Optional Node, can help the system understand if the Node is part of a code-block.
	 * @return {NodeBuilder} A reference to this node builder.
	 */
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

	/**
	 * Adds a code to the current code flow.
	 *
	 * @param {String} code - Shader code.
	 * @return {NodeBuilder} A reference to this node builder.
	 */
	addFlowCode( code ) {

		this.flow.code += code;

		return this;

	}

	/**
	 * Add tab in the code that will be generated so that other snippets respect the current tabulation.
	 * Typically used in codes with If,Else.
	 *
	 * @return {NodeBuilder} A reference to this node builder.
	 */
	addFlowTab() {

		this.tab += '\t';

		return this;

	}

	/**
	 * Removes a tab.
	 *
	 * @return {NodeBuilder} A reference to this node builder.
	 */
	removeFlowTab() {

		this.tab = this.tab.slice( 0, - 1 );

		return this;

	}

	/**
	 * Gets the current flow data based on a Node.
	 *
	 * @param {Node} node - Node that the flow was started.
	 * @param {('vertex'|'fragment'|'compute'|'any')} shaderStage - The shader stage.
	 * @return {Object} The flow data.
	 */
	getFlowData( node/*, shaderStage*/ ) {

		return this.flowsData.get( node );

	}

	/**
	 * Executes the node flow based on a root node to generate the final shader code.
	 *
	 * @param {Node} node - The node to execute.
	 * @return {Object} The code flow.
	 */
	flowNode( node ) {

		const output = node.getNodeType( this );

		const flowData = this.flowChildNode( node, output );

		this.flowsData.set( node, flowData );

		return flowData;

	}

	/**
	 * Returns the native shader operator name for a given generic name.
	 * It is a similar type of method like {@link NodeBuilder#getMethod}.
	 *
	 * @param {ShaderNodeInternal} shaderNode - The shader node to build the function node with.
	 * @return {FunctionNode} The build function node.
	 */
	buildFunctionNode( shaderNode ) {

		const fn = new FunctionNode();

		const previous = this.currentFunctionNode;

		this.currentFunctionNode = fn;

		fn.code = this.buildFunctionCode( shaderNode );

		this.currentFunctionNode = previous;

		return fn;

	}

	/**
	 * Generates a code flow based on a TSL function: Fn().
	 *
	 * @param {ShaderNodeInternal} shaderNode - A function code will be generated based on the input.
	 * @return {Object}
	 */
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

	/**
	 * Runs the node flow through all the steps of creation, 'setup', 'analyze', 'generate'.
	 *
	 * @param {Node} node - The node to execute.
	 * @param {String?} output - Expected output type. For example 'vec3'.
	 * @return {Object}
	 */
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

	/**
	 * Returns the native shader operator name for a given generic name.
	 * It is a similar type of method like {@link NodeBuilder#getMethod}.
	 *
	 * @abstract
	 * @param {String} op - The operator name to resolve.
	 * @return {String} The resolved operator name.
	 */
	getFunctionOperator( /* op */ ) {

		return null;

	}

	/**
	 * Generates a code flow based on a child Node.
	 *
	 * @param {Node} node - The node to execute.
	 * @param {String?} output - Expected output type. For example 'vec3'.
	 * @return {Object} The code flow.
	 */
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

	/**
	 * Executes a flow of code in a different stage.
	 *
	 * Some nodes like `varying()` have the ability to compute code in vertex-stage and
	 * return the value in fragment-stage even if it is being executed in an input fragment.
	 *
	 * @param {('vertex'|'fragment'|'compute'|'any')} shaderStage - The shader stage.
	 * @param {Node} node - The node to execute.
	 * @param {String?} output - Expected output type. For example 'vec3'.
	 * @param {String?} propertyName - The property name to assign the result.
	 * @return {Object}
	 */
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

	/**
	 * Returns an array holding all node attributes of this node builder.
	 *
	 * @return {Array<NodeAttribute>} The node attributes of this builder.
	 */
	getAttributesArray() {

		return this.attributes.concat( this.bufferAttributes );

	}

	/**
	 * Returns the attribute definitions as a shader string for the given shader stage.
	 *
	 * @abstract
	 * @param {('vertex'|'fragment'|'compute'|'any')} shaderStage - The shader stage.
	 * @return {String} The attribute code section.
	 */
	getAttributes( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Returns the varying definitions as a shader string for the given shader stage.
	 *
	 * @abstract
	 * @param {('vertex'|'fragment'|'compute'|'any')} shaderStage - The shader stage.
	 * @return {String} The varying code section.
	 */
	getVaryings( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Returns a single variable definition as a shader string for the given variable type and name.
	 *
	 * @param {String} type - The variable's type.
	 * @param {String} name - The variable's name.
	 * @param {Number?} [count=null] - The array length.
	 * @return {String} The shader string.
	 */
	getVar( type, name, count = null ) {

		return `${ count !== null ? this.generateArrayDeclaration( type, count ) : this.getType( type ) } ${ name }`;

	}

	/**
	 * Returns the variable definitions as a shader string for the given shader stage.
	 *
	 * @param {('vertex'|'fragment'|'compute'|'any')} shaderStage - The shader stage.
	 * @return {String} The variable code section.
	 */
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

	/**
	 * Returns the uniform definitions as a shader string for the given shader stage.
	 *
	 * @abstract
	 * @param {('vertex'|'fragment'|'compute'|'any')} shaderStage - The shader stage.
	 * @return {String} The uniform code section.
	 */
	getUniforms( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Returns the native code definitions as a shader string for the given shader stage.
	 *
	 * @param {('vertex'|'fragment'|'compute'|'any')} shaderStage - The shader stage.
	 * @return {String} The native code section.
	 */
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

	/**
	 * Returns the hash of this node builder.
	 *
	 * @return {String} The hash.
	 */
	getHash() {

		return this.vertexShader + this.fragmentShader + this.computeShader;

	}

	/**
	 * Sets the current shader stage.
	 *
	 * @param {('vertex'|'fragment'|'compute'|'any')?} shaderStage - The shader stage to set.
	 */
	setShaderStage( shaderStage ) {

		this.shaderStage = shaderStage;

	}

	/**
	 * Returns the current shader stage.
	 *
	 * @return {('vertex'|'fragment'|'compute'|'any')?} The current shader stage.
	 */
	getShaderStage() {

		return this.shaderStage;

	}

	/**
	 * Sets the current build stage.
	 *
	 * @param {('setup'|'analyze'|'generate')?} buildStage - The build stage to set.
	 */
	setBuildStage( buildStage ) {

		this.buildStage = buildStage;

	}

	/**
	 * Returns the current build stage.
	 *
	 * @return {('setup'|'analyze'|'generate')?} The current build stage.
	 */
	getBuildStage() {

		return this.buildStage;

	}

	/**
	 * Controls the code build of the shader stages.
	 *
	 * @abstract
	 */
	buildCode() {

		console.warn( 'Abstract function.' );

	}

	/**
	 * Central build method which controls the build for the given object.
	 *
	 * @return {NodeBuilder} A reference to this node builder.
	 */
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

	/**
	 * Returns a uniform representation which is later used for UBO generation and rendering.
	 *
	 * @param {NodeUniform} uniformNode - The uniform node.
	 * @param {String} type - The requested type.
	 * @return {Uniform} The uniform.
	 */
	getNodeUniform( uniformNode, type ) {

		if ( type === 'float' || type === 'int' || type === 'uint' ) return new NumberNodeUniform( uniformNode );
		if ( type === 'vec2' || type === 'ivec2' || type === 'uvec2' ) return new Vector2NodeUniform( uniformNode );
		if ( type === 'vec3' || type === 'ivec3' || type === 'uvec3' ) return new Vector3NodeUniform( uniformNode );
		if ( type === 'vec4' || type === 'ivec4' || type === 'uvec4' ) return new Vector4NodeUniform( uniformNode );
		if ( type === 'color' ) return new ColorNodeUniform( uniformNode );
		if ( type === 'mat2' ) return new Matrix2NodeUniform( uniformNode );
		if ( type === 'mat3' ) return new Matrix3NodeUniform( uniformNode );
		if ( type === 'mat4' ) return new Matrix4NodeUniform( uniformNode );

		throw new Error( `Uniform "${type}" not declared.` );

	}

	/**
	 * Formats the given shader snippet from a given type into another one. E.g.
	 * this method might be used to convert a simple float string `"1.0"` into a
	 * `vec3` representation: `"vec3<f32>( 1.0 )"`.
	 *
	 * @param {String} snippet - The shader snippet.
	 * @param {String} fromType - The source type.
	 * @param {String} toType - The target type.
	 * @return {String} The updated shader string.
	 */
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

	/**
	 * Returns a signature with the engine's current revision.
	 *
	 * @return {String} The signature.
	 */
	getSignature() {

		return `// Three.js r${ REVISION } - Node System\n`;

	}

	// Deprecated

	/**
	 * @function
	 * @deprecated since r168. Use `new NodeMaterial()` instead, with targeted node material name.
	 *
	 * @param {String} [type='NodeMaterial'] - The node material type.
	 * @throws {Error}
	 */
	createNodeMaterial( type = 'NodeMaterial' ) { // @deprecated, r168

		throw new Error( `THREE.NodeBuilder: createNodeMaterial() was deprecated. Use new ${ type }() instead.` );

	}

}

export default NodeBuilder;
