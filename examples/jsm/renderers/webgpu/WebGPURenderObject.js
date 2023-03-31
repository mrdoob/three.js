export default class WebGPURenderObject {

	constructor( renderer, properties, object, material, scene, camera, lightsNode ) {

		this.renderer = renderer;
		this.properties = properties;
		this.object = object;
		this.material = material;
		this.scene = scene;
		this.camera = camera;
		this.lightsNode = lightsNode;

		this.geometry = object.geometry;

		this._materialVersion = - 1;
		this._materialCacheKey = '';

	}

	getEnvironmentNode() {

		return this.scene.environmentNode || this.properties.get( this.scene ).environmentNode || null;

	}

	getFogNode() {

		return this.scene.fogNode || this.properties.get( this.scene ).fogNode || null;

	}

	getToneMappingNode() {

		return this.renderer.toneMappingNode || this.properties.get( this.renderer ).toneMappingNode || null;

	}

	getCacheKey() {

		const material = this.material;
		const lightsNode = this.lightsNode;
		const environmentNode = this.getEnvironmentNode();
		const fogNode = this.getFogNode();
		const toneMappingNode = this.getToneMappingNode();

		if ( material.version !== this._materialVersion ) {

			this._materialVersion = material.version;
			this._materialCacheKey = material.customProgramCacheKey();

		}

		let cacheKey = '{';

		cacheKey += 'version:' + material.version + ',';
		cacheKey += 'material:' + this._materialCacheKey + ',';

		if ( lightsNode ) cacheKey += 'lightsNode:' + lightsNode.getCacheKey() + ',';
		if ( environmentNode ) cacheKey += 'environmentNode:' + environmentNode.getCacheKey() + ',';
		if ( fogNode ) cacheKey += 'fogNode:' + fogNode.getCacheKey() + ',';
		if ( toneMappingNode ) cacheKey += 'toneMappingNode:' + toneMappingNode.getCacheKey() + ',';

		cacheKey += '}';

		return cacheKey;

	}

}
