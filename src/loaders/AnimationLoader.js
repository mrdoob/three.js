/**
 * @author bhouston / http://clara.io/
 */

THREE.AnimationLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.AnimationLoader.prototype = {

	constructor: THREE.AnimationLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	parse: function ( json, onLoad ) {

		var animations = [];

		for ( var i = 0; i < json.length; i ++ ) {

			var clip = THREE.AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		onLoad( animations );

	}

};
