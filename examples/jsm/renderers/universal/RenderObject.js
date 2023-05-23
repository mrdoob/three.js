let id = 0;

export default class RenderObject {

	constructor( nodes, geometries, renderer, object, material, scene, camera, lightsNode ) {

		this._nodes = nodes;
		this._geometries = geometries;

		this.id = id ++;

		this.renderer = renderer;
		this.object = object;
		this.material = material;
		this.scene = scene;
		this.camera = camera;
		this.lightsNode = lightsNode;

		this.geometry = object.geometry;

		this.attributes = null;
		this.context = null;
		this.pipeline = null;

		this._materialVersion = - 1;
		this._materialCacheKey = '';

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

		return [ this.object, this.material, this.scene, this.camera, this.lightsNode ];

	}

	getAttributes() {

		if ( this.attributes !== null ) return this.attributes;

		const nodeAttributes = this.getNodeBuilder().getAttributesArray();
		const geometry = this.geometry;

		const attributes = [];

		for ( const nodeAttribute of nodeAttributes ) {

			attributes.push( nodeAttribute.node && nodeAttribute.node.attribute ? nodeAttribute.node.attribute : geometry.getAttribute( nodeAttribute.name ) );

		}

		this.attributes = attributes;

		return attributes;

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

}
