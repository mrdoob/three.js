/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CanvasTexture = function ( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	THREE.Texture.call( this, canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.needsUpdate = true;

};

THREE.CanvasTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.CanvasTexture.prototype.constructor = THREE.CanvasTexture;
