import { hashString } from '../../nodes/core/NodeUtils.js';

let _id = 0;

function getKeys( obj ) {

	const keys = Object.keys( obj );

	let proto = Object.getPrototypeOf( obj );

	while ( proto ) {

		const descriptors = Object.getOwnPropertyDescriptors( proto );

		for ( const key in descriptors ) {

			if ( descriptors[ key ] !== undefined ) {

				const descriptor = descriptors[ key ];

				if ( descriptor && typeof descriptor.get === 'function' ) {

					keys.push( key );

				}

			}

		}

		proto = Object.getPrototypeOf( proto );

	}

	return keys;

}

/**
 * A render object is the renderer's representation of single entity that gets drawn
 * with a draw command. There is no unique mapping of render objects to 3D objects in the
 * scene since render objects also depend from the used material, the current render context
 * and the current scene's lighting.
 *
 * In general, the basic process of the renderer is:
 *
 * - Analyze the 3D objects in the scene and generate render lists containing render items.
 * - Process the render lists by calling one or more render commands for each render item.
 * - For each render command, request a render object and perform the draw.
 *
 * The module provides an interface to get data required for the draw command like the actual
 * draw parameters or vertex buffers. It also holds a series of caching related methods since
 * creating render objects should only be done when necessary.
 *
 * @private
 */
export default class RenderObject {

	/**
	 * Constructs a new render object.
	 *
	 * @param {Nodes} nodes - Renderer component for managing nodes related logic.
	 * @param {Geometries} geometries - Renderer component for managing geometries.
	 * @param {Renderer} renderer - The renderer.
	 * @param {Object3D} object - The 3D object.
	 * @param {Material} material - The 3D object's material.
	 * @param {Scene} scene - The scene the 3D object belongs to.
	 * @param {Camera} camera - The camera the object should be rendered with.
	 * @param {LightsNode} lightsNode - The lights node.
	 * @param {RenderContext} renderContext - The render context.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 */
	constructor( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext ) {

		this.id = _id ++;

		/**
		 * Renderer component for managing nodes related logic.
		 *
		 * @type {Nodes}
		 * @private
		 */
		this._nodes = nodes;

		/**
		 * Renderer component for managing geometries.
		 *
		 * @type {Geometries}
		 * @private
		 */
		this._geometries = geometries;

		/**
		 * The renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * The 3D object.
		 *
		 * @type {Object3D}
		 */
		this.object = object;

		/**
		 * The 3D object's material.
		 *
		 * @type {Material}
		 */
		this.material = material;

		/**
		 * The scene the 3D object belongs to.
		 *
		 * @type {Scene}
		 */
		this.scene = scene;

		/**
		 * The camera the 3D object should be rendered with.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * The lights node.
		 *
		 * @type {LightsNode}
		 */
		this.lightsNode = lightsNode;

		/**
		 * The render context.
		 *
		 * @type {RenderContext}
		 */
		this.context = renderContext;

		/**
		 * The 3D object's geometry.
		 *
		 * @type {BufferGeometry}
		 */
		this.geometry = object.geometry;

		/**
		 * The render object's version.
		 *
		 * @type {Number}
		 */
		this.version = material.version;

		/**
		 * The draw range of the geometry.
		 *
		 * @type {Object?}
		 * @default null
		 */
		this.drawRange = null;

		/**
		 * An array holding the buffer attributes
		 * of the render object. This entails attribute
		 * definitions on geometry and node level.
		 *
		 * @type {Array<BufferAttribute>?}
		 * @default null
		 */
		this.attributes = null;

		/**
		 * A reference to a render pipeline the render
		 * object is processed with.
		 *
		 * @type {RenderPipeline}
		 * @default null
		 */
		this.pipeline = null;

		/**
		 * An array holding the vertex buffers which can
		 * be buffer attributes but also interleaved buffers.
		 *
		 * @type {Array<BufferAttribute|InterleavedBuffer>?}
		 * @default null
		 */
		this.vertexBuffers = null;

		/**
		 * The parameters for the draw command.
		 *
		 * @type {Object?}
		 * @default null
		 */
		this.drawParams = null;

		/**
		 * If this render object is used inside a render bundle,
		 * this property points to the respective bundle group.
		 *
		 * @type {BundleGroup?}
		 * @default null
		 */
		this.bundle = null;

		/**
		 * The clipping context.
		 *
		 * @type {ClippingContext}
		 */
		this.clippingContext = clippingContext;

		/**
		 * The clipping context's cache key.
		 *
		 * @type {String}
		 */
		this.clippingContextCacheKey = clippingContext !== null ? clippingContext.cacheKey : '';

		/**
		 * The initial node cache key.
		 *
		 * @type {Number}
		 */
		this.initialNodesCacheKey = this.getDynamicCacheKey();

		/**
		 * The initial cache key.
		 *
		 * @type {Number}
		 */
		this.initialCacheKey = this.getCacheKey();

		/**
		 * The node builder state.
		 *
		 * @type {NodeBuilderState?}
		 * @private
		 * @default null
		 */
		this._nodeBuilderState = null;

		/**
		 * An array of bindings.
		 *
		 * @type {Array<BindGroup>?}
		 * @private
		 * @default null
		 */
		this._bindings = null;

		/**
		 * Reference to the node material observer.
		 *
		 * @type {NodeMaterialObserver?}
		 * @private
		 * @default null
		 */
		this._monitor = null;

		/**
		 * An event listener which is defined by `RenderObjects`. It performs
		 * clean up tasks when `dispose()` on this render object.
		 *
		 * @method
		 */
		this.onDispose = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isRenderObject = true;

		/**
		 * An event listener which is executed when `dispose()` is called on
		 * the render object's material.
		 *
		 * @method
		 */
		this.onMaterialDispose = () => {

			this.dispose();

		};

		this.material.addEventListener( 'dispose', this.onMaterialDispose );

	}

	/**
	 * Updates the clipping context.
	 *
	 * @param {ClippingContext} context - The clipping context to set.
	 */
	updateClipping( context ) {

		this.clippingContext = context;

	}

	/**
	 * Whether the clipping requires an update or not.
	 *
	 * @type {Boolean}
	 * @readonly
	 */
	get clippingNeedsUpdate() {

		if ( this.clippingContext === null || this.clippingContext.cacheKey === this.clippingContextCacheKey ) return false;

		this.clippingContextCacheKey = this.clippingContext.cacheKey;

		return true;

	}

	/**
	 * The number of clipping planes defined in context of hardware clipping.
	 *
	 * @type {Number}
	 * @readonly
	 */
	get hardwareClippingPlanes() {

		return this.material.hardwareClipping === true ? this.clippingContext.unionClippingCount : 0;

	}

	/**
	 * Returns the node builder state of this render object.
	 *
	 * @return {NodeBuilderState} The node buider state.
	 */
	getNodeBuilderState() {

		return this._nodeBuilderState || ( this._nodeBuilderState = this._nodes.getForRender( this ) );

	}

	/**
	 * Returns the node material observer of this render object.
	 *
	 * @return {NodeMaterialObserver} The node material observer.
	 */
	getMonitor() {

		return this._monitor || ( this._monitor = this.getNodeBuilderState().monitor );

	}

	/**
	 * Returns an array of bind groups of this render object.
	 *
	 * @return {Array<BindGroup>} The bindings.
	 */
	getBindings() {

		return this._bindings || ( this._bindings = this.getNodeBuilderState().createBindings() );

	}

	/**
	 * Returns the index of the render object's geometry.
	 *
	 * @return {BufferAttribute?} The index. Returns `null` for non-indexed geometries.
	 */
	getIndex() {

		return this._geometries.getIndex( this );

	}

	/**
	 * Returns the indirect buffer attribute.
	 *
	 * @return {BufferAttribute?} The indirect attribute. `null` if no indirect drawing is used.
	 */
	getIndirect() {

		return this._geometries.getIndirect( this );

	}

	/**
	 * Returns an array that acts as a key for identifying the render object in a chain map.
	 *
	 * @return {Array<Object>} An array with object references.
	 */
	getChainArray() {

		return [ this.object, this.material, this.context, this.lightsNode ];

	}

	/**
	 * This method is used when the geometry of a 3D object has been exchanged and the
	 * respective render object now requires an update.
	 *
	 * @param {BufferGeometry} geometry - The geometry to set.
	 */
	setGeometry( geometry ) {

		this.geometry = geometry;
		this.attributes = null;

	}

	/**
	 * Returns the buffer attributes of the render object. The returned array holds
	 * attribute definitions on geometry and node level.
	 *
	 * @return {Array<BufferAttribute>} An array with buffer attributes.
	 */
	getAttributes() {

		if ( this.attributes !== null ) return this.attributes;

		const nodeAttributes = this.getNodeBuilderState().nodeAttributes;
		const geometry = this.geometry;

		const attributes = [];
		const vertexBuffers = new Set();

		for ( const nodeAttribute of nodeAttributes ) {

			const attribute = nodeAttribute.node && nodeAttribute.node.attribute ? nodeAttribute.node.attribute : geometry.getAttribute( nodeAttribute.name );

			if ( attribute === undefined ) continue;

			attributes.push( attribute );

			const bufferAttribute = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
			vertexBuffers.add( bufferAttribute );

		}

		this.attributes = attributes;
		this.vertexBuffers = Array.from( vertexBuffers.values() );

		return attributes;

	}

	/**
	 * Returns the vertex buffers of the render object.
	 *
	 * @return {Array<BufferAttribute|InterleavedBuffer>} An array with buffer attribute or interleaved buffers.
	 */
	getVertexBuffers() {

		if ( this.vertexBuffers === null ) this.getAttributes();

		return this.vertexBuffers;

	}

	/**
	 * Returns the draw parameters for the render object.
	 *
	 * @return {{vertexCount: Number, firstVertex: Number, instanceCount: Number, firstInstance: Number}} The draw parameters.
	 */
	getDrawParameters() {

		const { object, material, geometry, group, drawRange } = this;

		const drawParams = this.drawParams || ( this.drawParams = {
			vertexCount: 0,
			firstVertex: 0,
			instanceCount: 0,
			firstInstance: 0
		} );

		const index = this.getIndex();
		const hasIndex = ( index !== null );
		const instanceCount = geometry.isInstancedBufferGeometry ? geometry.instanceCount : ( object.count > 1 ? object.count : 1 );

		if ( instanceCount === 0 ) return null;

		drawParams.instanceCount = instanceCount;

		if ( object.isBatchedMesh === true ) return drawParams;

		let rangeFactor = 1;

		if ( material.wireframe === true && ! object.isPoints && ! object.isLineSegments && ! object.isLine && ! object.isLineLoop ) {

			rangeFactor = 2;

		}

		let firstVertex = drawRange.start * rangeFactor;
		let lastVertex = ( drawRange.start + drawRange.count ) * rangeFactor;

		if ( group !== null ) {

			firstVertex = Math.max( firstVertex, group.start * rangeFactor );
			lastVertex = Math.min( lastVertex, ( group.start + group.count ) * rangeFactor );

		}

		const position = geometry.attributes.position;
		let itemCount = Infinity;

		if ( hasIndex ) {

			itemCount = index.count;

		} else if ( position !== undefined && position !== null ) {

			itemCount = position.count;

		}

		firstVertex = Math.max( firstVertex, 0 );
		lastVertex = Math.min( lastVertex, itemCount );

		const count = lastVertex - firstVertex;

		if ( count < 0 || count === Infinity ) return null;

		drawParams.vertexCount = count;
		drawParams.firstVertex = firstVertex;

		return drawParams;

	}

	/**
	 * Returns the render object's geometry cache key.
	 *
	 * The geometry cache key is part of the material cache key.
	 *
	 * @return {String} The geometry cache key.
	 */
	getGeometryCacheKey() {

		const { geometry } = this;

		let cacheKey = '';

		for ( const name of Object.keys( geometry.attributes ).sort() ) {

			const attribute = geometry.attributes[ name ];

			cacheKey += name + ',';

			if ( attribute.data ) cacheKey += attribute.data.stride + ',';
			if ( attribute.offset ) cacheKey += attribute.offset + ',';
			if ( attribute.itemSize ) cacheKey += attribute.itemSize + ',';
			if ( attribute.normalized ) cacheKey += 'n,';

		}

		if ( geometry.index ) {

			cacheKey += 'index,';

		}

		return cacheKey;

	}

	/**
	 * Returns the render object's material cache key.
	 *
	 * The material cache key is part of the render object cache key.
	 *
	 * @return {String} The material cache key.
	 */
	getMaterialCacheKey() {

		const { object, material } = this;

		let cacheKey = material.customProgramCacheKey();

		for ( const property of getKeys( material ) ) {

			if ( /^(is[A-Z]|_)|^(visible|version|uuid|name|opacity|userData)$/.test( property ) ) continue;

			const value = material[ property ];

			let valueKey;

			if ( value !== null ) {

				// some material values require a formatting

				const type = typeof value;

				if ( type === 'number' ) {

					valueKey = value !== 0 ? '1' : '0'; // Convert to on/off, important for clearcoat, transmission, etc

				} else if ( type === 'object' ) {

					valueKey = '{';

					if ( value.isTexture ) {

						valueKey += value.mapping;

					}

					valueKey += '}';

				} else {

					valueKey = String( value );

				}

			} else {

				valueKey = String( value );

			}

			cacheKey += /*property + ':' +*/ valueKey + ',';

		}

		cacheKey += this.clippingContextCacheKey + ',';

		if ( object.geometry ) {

			cacheKey += this.getGeometryCacheKey();

		}

		if ( object.skeleton ) {

			cacheKey += object.skeleton.bones.length + ',';

		}

		if ( object.morphTargetInfluences ) {

			cacheKey += object.morphTargetInfluences.length + ',';

		}

		if ( object.isBatchedMesh ) {

			cacheKey += object._matricesTexture.uuid + ',';

			if ( object._colorsTexture !== null ) {

				cacheKey += object._colorsTexture.uuid + ',';

			}

		}

		if ( object.count > 1 ) {

			// TODO: https://github.com/mrdoob/three.js/pull/29066#issuecomment-2269400850

			cacheKey += object.uuid + ',';

		}

		cacheKey += object.receiveShadow + ',';

		return hashString( cacheKey );

	}

	/**
	 * Whether the geometry requires an update or not.
	 *
	 * @type {Boolean}
	 * @readonly
	 */
	get needsGeometryUpdate() {

		return this.geometry.id !== this.object.geometry.id;

	}

	/**
	 * Whether the render object requires an update or not.
	 *
	 * Note: There are two distinct places where render objects are checked for an update.
	 *
	 * 1. In `RenderObjects.get()` which is executed when the render object is request. This
	 * method checks the `needsUpdate` flag and recreates the render object if necessary.
	 * 2. In `Renderer._renderObjectDirect()` right after getting the render object via
	 * `RenderObjects.get()`. The render object's NodeMaterialObserver is then used to detect
	 * a need for a refresh due to material, geometry or object related value changes.
	 *
	 * TODO: Investigate if it's possible to merge boths steps so there is only a single place
	 * that performs the 'needsUpdate' check.
	 *
	 * @type {Boolean}
	 * @readonly
	 */
	get needsUpdate() {

		return /*this.object.static !== true &&*/ ( this.initialNodesCacheKey !== this.getDynamicCacheKey() || this.clippingNeedsUpdate );

	}

	/**
	 * Returns the dynamic cache key which represents a key that is computed per draw command.
	 *
	 * @return {String} The cache key.
	 */
	getDynamicCacheKey() {

		// Environment Nodes Cache Key

		let cacheKey = this._nodes.getCacheKey( this.scene, this.lightsNode );

		if ( this.object.receiveShadow ) {

			cacheKey += 1;

		}

		return cacheKey;

	}

	/**
	 * Returns the render object's cache key.
	 *
	 * @return {String} The cache key.
	 */
	getCacheKey() {

		return this.getMaterialCacheKey() + this.getDynamicCacheKey();

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this.material.removeEventListener( 'dispose', this.onMaterialDispose );

		this.onDispose();

	}

}
