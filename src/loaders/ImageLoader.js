/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ImageLoader = function () {};

THREE.ImageLoader.prototype = new THREE.Loader();
THREE.ImageLoader.prototype.constructor = THREE.ImageLoader;

THREE.ImageLoader.prototype.load = function ( url, callback ) {

	var that = this;
	var image = new Image();

	image.onload = function () {

		callback( image );

		that.onLoadComplete();

	};

	image.crossOrigin = this.crossOrigin;
	image.src = path;

	that.onLoadStart();

};
