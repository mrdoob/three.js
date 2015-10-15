/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CanvasTexture = function ( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	THREE.Texture.call( this, canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.needsUpdate = true;

	this.canvasManager = {};


};

THREE.CanvasTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.CanvasTexture.prototype.constructor = THREE.CanvasTexture;

THREE.CanvasTexture.copy = function ( source ) {

	THREE.Texture.prototype.copy.call( this, source );

	if ( source.canvasManager.clone !== undefined ) {

		this.canvasManager = source.canvasManager.clone();

	} else if ( source.canvasManager.bindToTexture !== undefined ) {

		this.canvasManager = source.canvasManager;
		this.canvasManager.bindToTexture( this );

	} else {

		this.canvasManager = JSON.parse( JSON.stringify( source.canvasManager ) );

	}

	return this;

};

THREE.CanvasTexture.prototype.toJSON = ( function ( meta ) {

	var output = THREE.Texture.prototype.toJSON.call( this, meta );

	output.metadata.type = 'CanvasTexture';
	output.metadata.generator = 'CanvasTexture.toJSON';
	output.type = 'CanvasTexture';

	if ( this.canvasManager ) {

		if ( this.canvasManager.toObject !== undefined ) {

			output.canvasManager = this.canvasManager.toObject();

		} else if ( JSON.stringify( this.canvasManager ) !== '{}' ) {

			output.canvasManager = this.canvasManager;

		}

	}

	return output;

} );
