/**
 * @author sgrif / http://twitter.com/sgrif
 */
THREE.ImageRegistry = function () {

	this.defaultGetter = function ( sourceFile ) {

		var texturePath = ( this.texturePath !== undefined ) ? texturePath : '';

		return texturePath + sourceFile;

	};

	this._getters = {};

}

THREE.ImageRegistry.prototype.put = function ( sourceFile, getter ) {
	var getterFn;

	if ( typeof getter == 'string' ) {

		getterFn = function() {

			return this.defaultGetter( getter );

		};

	} else {

		getterFn = getter;

	}

	this._getters[ sourceFile ] = getterFn;

}

THREE.ImageRegistry.prototype.get = function ( sourceFile ) {

	if ( this._getters[ sourceFile ] !== undefined ) {

		return this._getters[ sourceFile ]();

	}

	return this.defaultGetter( sourceFile );

}

THREE.DefaultImageRegistry = new THREE.ImageRegistry();
