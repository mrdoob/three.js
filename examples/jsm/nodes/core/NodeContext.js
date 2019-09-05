/**
 * @author sunag / http://www.sunag.com.br/
 */

export class NodeContext {

	constructor( slot ) {

		this.slot = slot || '';
		this.cache = '';
		this.data = {};

	}

	setSlot ( slot ) {

		this.slot = slot;

		return this;

	}

	setCache ( cache ) {

		this.cache = cache;

		return this;

	}

	setProperty ( name, value ) {

		this.data[ name ] = value;

		return this;

	}

	setSampler ( uv ) {

		var cacheId = `sampler-uv-${uv.uuid}`;

		return this.setCache( cacheId ).setProperty( 'uv', uv );

	}

}
