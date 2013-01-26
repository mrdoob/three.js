/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SceneExporter2 = function () {};

THREE.SceneExporter2.prototype = {

	constructor: THREE.SceneExporter2,

	parse: function ( scene ) {

		var output = {
			metadata: {
				formatVersion : 4.0,
				type : "scene",
				generatedBy : "SceneExporter2"
			}
		};

		console.log( scene );

		return JSON.stringify( output );

	}

}