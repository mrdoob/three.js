/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DataTexture = function ( data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy ) {
	
	if ( magFilter === undefined ) {
		
		magFilter = THREE.NearestFilter;
		
	}
	
	if ( minFilter === undefined ) {
		
		minFilter = THREE.NearestFilter;
		
	}

	THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.image = { data: data, width: width, height: height };
	
	this.flipY = false;
	this.generateMipmaps  = false;

};

THREE.DataTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.DataTexture.prototype.constructor = THREE.DataTexture;