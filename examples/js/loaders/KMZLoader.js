/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.KMZLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.KMZLoader.prototype = {

	constructor: THREE.KMZLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( data ) {

		var zip = new JSZip( data );

		// console.log( zip );

		for ( var name in zip.files ) {

			if ( name.toLowerCase().substr( - 4 ) === '.dae' ) {

				return new THREE.ColladaLoader().parse( zip.file( name ).asText() );

			}

		}

		console.error( 'KZMLoader: Couldn\'t find .dae file.' );

		return {
			scene: new THREE.Group()
		}

	}

};
