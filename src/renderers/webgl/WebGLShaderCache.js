let _id = 0;

class WebGLShaderCache {

	constructor( properties ) {

		this.shaderCache = new Map();
		this.properties = properties;

	}

	update( material ) {

		this._updateVertexShaderStage( material );
		this._updateFragmentShaderStage( material );
		return this;

	}

	remove( material ) {

		const materialProperties = this.properties.get( material );
		this.remove( materialProperties.vertexShaderStage );
		this.remove( materialProperties.fragmentShaderStage );

		return this;

	}
	remove( shaderStage ) {

		shaderStage.usedTimes --;

		if ( shaderStage.usedTimes === 0 ) this.shaderCache.delete( shaderStage.code );

		return this;

	}

	getVertexShaderID( material ) {

		return this.properties.get( material ).vertexShaderStage.id;

	}

	getFragmentShaderID( material ) {

		return this.properties.get( material ).fragmentShaderStage.id;

	}

	dispose() {

		this.shaderCache.clear();

	}

	_updateVertexShaderStage( material ) {

		const materialProperties = this.properties.get( material );
		if ( materialProperties.vertexShaderChanged === undefined ) {

			material.addEventListener( 'VertexShaderChanged', onVertexShaderChanged.bind( materialProperties ) );
			materialProperties.vertexShaderChanged = true;

		}

		if ( materialProperties.vertexShaderChanged ) {

			const newVertexShaderStage = this._getShaderStage( material.vertexShader );
			newVertexShaderStage.usedTimes ++;
			this._checkShaderStageRemoval( materialProperties.vertexShaderStage );
			materialProperties.vertexShaderStage = newVertexShaderStage;
			materialProperties.vertexShaderChanged = false;

		}

	}
	_updateFragmentShaderStage( material ) {

		const materialProperties = this.properties.get( material );

		if ( materialProperties.fragmentShaderChanged === undefined ) {

			material.addEventListener( 'FragmentShaderChanged', onFragmentShaderChanged.bind( materialProperties ) );
			materialProperties.fragmentShaderChanged = true;

		}

		if ( materialProperties.fragmentShaderChanged ) {

			const newfragmentShaderStage = this._getShaderStage( material.fragmentShader );
			newfragmentShaderStage.usedTimes ++;
			this._checkShaderStageRemoval( materialProperties.fragmentShaderStage );
			materialProperties.fragmentShaderStage = newfragmentShaderStage;
			materialProperties.fragmentShaderChanged = false;

		}


	}

	_checkShaderStageRemoval( shaderstage ) {

		if ( shaderstage !== undefined ) {

			if ( shaderstage.usedTimes === 1 ) {

				this.remove( shaderstage );

			} else {

				shaderstage.usedTimes --;

			}

		}

	}

	_getShaderStage( code ) {

		const cache = this.shaderCache;
		let stage = cache.get( code );

		if ( stage === undefined ) {

			stage = new WebGLShaderStage( code );
			cache.set( code, stage );

		}

		return stage;

	}

}

class WebGLShaderStage {

	constructor( code ) {

		this.id = _id ++;

		this.code = code;
		this.usedTimes = 0;

	}

}

function onVertexShaderChanged( material ) {

	this.vertexShaderChanged = true;

}

function onFragmentShaderChanged( material ) {

	this.fragmentShaderChanged = true;

}

export { WebGLShaderCache };
