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

		this.attributes = null;
		this.pipeline = null;
		this.vertexBuffers = null;

		this._materialVersion = - 1;
		this._materialCacheKey = '';

		this.onDispose = null;

		this.onMaterialDispose = () => {

			this.dispose();

		};

		this.material.addEventListener( 'dispose', this.onMaterialDispose );

	}

	getNodeBuilder() {

		return this._nodes.getForRender( this );

	}

	getBindings() {

		return this.getNodeBuilder().getBindings();

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

	getCacheKey() {

		const { material, scene, lightsNode } = this;

		if ( material.version !== this._materialVersion ) {

			this._materialVersion = material.version;
			this._materialCacheKey = material.customProgramCacheKey();

		}

		const cacheKey = [];

		cacheKey.push( 'material:' + this._materialCacheKey );
		cacheKey.push( 'nodes:' + this._nodes.getCacheKey( scene, lightsNode ) );

		return '{' + cacheKey.join( ',' ) + '}';

	}

	dispose() {

		this.material.removeEventListener( 'dispose', this.onMaterialDispose );

		this.onDispose();

	}

}
