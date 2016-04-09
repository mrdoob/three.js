/**
 * @author Marius Kintel / https://github.com/kintel
 */

THREE.DepthTexture = function ( width, height, hasStencil ) {

	var format = hasStencil ? THREE.DepthStencilFormat : THREE.DepthFormat;
	var type = hasStencil ? THREE.UnsignedInt24_8Type : THREE.UnsignedIntType;

	THREE.Texture.call( this, null, THREE.Texture.DEFAULT_MAPPING, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter, format, type );

	this.width = width;
	this.height = height;
	this.hasStencil = hasStencil;

};

THREE.DepthTexture.prototype = Object.create( THREE.Texture.prototype );

THREE.DepthTexture.prototype.clone = function () {

	var texture = new THREE.DepthTexture();

	THREE.Texture.prototype.clone.call( this, texture );

	texture.width = this.width;	
	texture.height = this.height;

	return texture;

};
