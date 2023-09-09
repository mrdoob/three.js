let id = 0;

export default class RenderObject {

	constructor( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext ) {

		this._nodes = nodes;
		this._geometries = geometries;

		this.id = id ++;

		this.renderer = renderer;
		this.object = object;
		this.material = material;
		this.scene = scene;
		this.camera = camera;
		this.lightsNode = lightsNode;
		this.context = renderContext;

		this.geometry = object.geometry;
		this.version = material.version;

		this.attributes = null;
		this.pipeline = null;
		this.vertexBuffers = null;

		this.initialCacheKey = this.getCacheKey();

		this._nodeBuilder = null;
		this._bindings = null;

		this.onDispose = null;

		this.isRenderObject = true;

		this.onMaterialDispose = () => {

			this.dispose();

		};

		this.material.addEventListener( 'dispose', this.onMaterialDispose );

	}

	getNodeBuilder() {

		return this._nodeBuilder || ( this._nodeBuilder = this._nodes.getForRender( this ) );

	}

	getBindings() {

		return this._bindings || ( this._bindings = this.getNodeBuilder().createBindings() );

	}

	getIndex() {

		return this._geometries.getIndex( this );

	}

	getChainArray() {

		return [ this.object, this.material, this.context, this.lightsNode ];

	}

	getAttributes() {

		if ( this.attributes !== null ) return this.attributes;

		const nodeAttributes = this.getNodeBuilder().getAttributesArray();
		const geometry = this.geometry;

		const attributes = [];
		const vertexBuffers = new Set();

		for ( const nodeAttribute of nodeAttributes ) {

			const attribute = nodeAttribute.node && nodeAttribute.node.attribute ? nodeAttribute.node.attribute : geometry.getAttribute( nodeAttribute.name );

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

	getMaterialCacheKey() {

		const material = this.material;

		let cacheKey = material.customProgramCacheKey();

		for ( const property in material ) {

			if ( /^(_|is[A-Z])|^(visible|version|uuid|name|userData)$/.test( property ) ) continue;

			cacheKey += /*property + ':' +*/ String( material[ property ] ) + ',';

		}

		return cacheKey;

	}

	getNodesCacheKey() {

		// Environment Nodes Cache Key

		return this._nodes.getCacheKey( this.scene, this.lightsNode );

	}

	getCacheKey() {

		return `{material:${ this.getMaterialCacheKey() },nodes:${ this.getNodesCacheKey()}`;

	}

	dispose() {

		this.material.removeEventListener( 'dispose', this.onMaterialDispose );

		this.onDispose();

	}

}
