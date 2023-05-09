export default class WebGPURenderObject {

	constructor( renderer, nodes, object, material, scene, camera, lightsNode ) {

		this.renderer = renderer;
		this.nodes = nodes;

		this.object = object;
		this.material = material;
		this.scene = scene;
		this.camera = camera;
		this.lightsNode = lightsNode;

		this.geometry = object.geometry;

		this.attributes = null;

		this._materialVersion = - 1;
		this._materialCacheKey = '';

	}

	getAttributes() {

		if ( this.attributes !== null ) return this.attributes;

		const nodeAttributes = this.nodes.get( this ).getAttributesArray();
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
		cacheKey.push( 'nodes:' + this.nodes.getCacheKey( scene, lightsNode ) );

		return '{' + cacheKey.join( ',' ) + '}';

	}

}
