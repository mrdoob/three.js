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

export default class RenderObject {

	constructor( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext ) {

		this._nodes = nodes;
		this._geometries = geometries;

		this.id = _id ++;

		this.renderer = renderer;
		this.object = object;
		this.material = material;
		this.scene = scene;
		this.camera = camera;
		this.lightsNode = lightsNode;
		this.context = renderContext;

		this.geometry = object.geometry;
		this.version = material.version;

		this.drawRange = null;

		this.attributes = null;
		this.pipeline = null;
		this.vertexBuffers = null;
		this.drawParams = null;

		this.bundle = null;

		this.clippingContext = clippingContext;
		this.clippingContextCacheKey = clippingContext !== null ? clippingContext.cacheKey : '';

		this.initialNodesCacheKey = this.getDynamicCacheKey();
		this.initialCacheKey = this.getCacheKey();

		this._nodeBuilderState = null;
		this._bindings = null;
		this._monitor = null;

		this.onDispose = null;

		this.isRenderObject = true;

		this.onMaterialDispose = () => {

			this.dispose();

		};

		this.material.addEventListener( 'dispose', this.onMaterialDispose );

	}

	updateClipping( parent ) {

		this.clippingContext = parent;

	}

	get clippingNeedsUpdate() {

		if ( this.clippingContext === null || this.clippingContext.cacheKey === this.clippingContextCacheKey ) return false;

		this.clippingContextCacheKey = this.clippingContext.cacheKey;

		return true;

	}

	get hardwareClippingPlanes() {

		return this.material.hardwareClipping === true ? this.clippingContext.unionClippingCount : 0;

	}

	getNodeBuilderState() {

		return this._nodeBuilderState || ( this._nodeBuilderState = this._nodes.getForRender( this ) );

	}

	getMonitor() {

		return this._monitor || ( this._monitor = this.getNodeBuilderState().monitor );

	}

	getBindings() {

		return this._bindings || ( this._bindings = this.getNodeBuilderState().createBindings() );

	}

	getIndex() {

		return this._geometries.getIndex( this );

	}

	getIndirect() {

		return this._geometries.getIndirect( this );

	}

	getChainArray() {

		return [ this.object, this.material, this.context, this.lightsNode ];

	}

	setGeometry( geometry ) {

		this.geometry = geometry;
		this.attributes = null;

	}

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

	getVertexBuffers() {

		if ( this.vertexBuffers === null ) this.getAttributes();

		return this.vertexBuffers;

	}

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

	get needsGeometryUpdate() {

		return this.geometry.id !== this.object.geometry.id;

	}

	get needsUpdate() {

		return /*this.object.static !== true &&*/ ( this.initialNodesCacheKey !== this.getDynamicCacheKey() || this.clippingNeedsUpdate );

	}

	getDynamicCacheKey() {

		// Environment Nodes Cache Key

		let cacheKey = this._nodes.getCacheKey( this.scene, this.lightsNode );

		if ( this.object.receiveShadow ) {

			cacheKey += 1;

		}

		return cacheKey;

	}

	getCacheKey() {

		return this.getMaterialCacheKey() + this.getDynamicCacheKey();

	}

	dispose() {

		this.material.removeEventListener( 'dispose', this.onMaterialDispose );

		this.onDispose();

	}

}
