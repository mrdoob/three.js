/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * }
 */

THREE.TextureCube = function ( image, mapping ) {

	this.image = image;
	this.mapping = mapping ? mapping : THREE.ReflectionMap;

	this.toString = function () {

		return 'THREE.TextureCube (<br/>' +
			'image: ' + this.image + '<br/>' +
			'mapping: ' + this.mapping + '<br/>' +
			')';

	};

};

THREE.loadImageArray = function ( urls ) {

	var i, images = [];

	images.loadCount = 0;

	for ( i = 0; i < urls.length; ++i ) {

		images[i] = new Image();
		images[i].loaded = 0;
		images[i].onload = function() { images.loadCount += 1; this.loaded = 1; }
		images[i].src = urls[i];

	}

	return images;

};

