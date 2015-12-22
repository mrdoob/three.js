/**
* @author Mark Kellogg - http://www.github.com/mkkellogg
*/

var ParticleSystemUtil = {

	loadingManager: undefined,
	objLoader: undefined,
	imageLoader: undefined,

	initializeLoadingManager: function() {

		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onProgress = function( item, loaded, total ) {

			console.log( "Loaded " + loaded + " items out of " + total + ": " + item);

		};

	},


	loadObj: function( objFile, textureFile, material, onMesh, onLoadComplete ) {

		var onProgress = function( xhr ) {

			if ( xhr.lengthComputable ) {

				var percentComplete = xhr.loaded / xhr.total * 100;
				//console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

			}

		};

		var onError = function( xhr ) {

			console.log( "ERROR: loadObj() - " + xhr );

		};

		if ( ! this.objLoader ) {

			this.objLoader = new THREE.OBJLoader( loadingManager );

		}
		if ( ! this.imageLoader ) {

			this.imageLoader = new THREE.ImageLoader( this.loadingManager );


		}

		var texture = new THREE.Texture();
		var _this = this;
		this.imageLoader.load( textureFile, function( image ) {

			texture.image = image;
			texture.needsUpdate = true;
			
			_this.objLoader.load( objFile, function( object ) {

				object.traverse( function( child ) {

					if ( child instanceof THREE.Mesh ) {

						child.material = material;
						child.material.map = texture;

						if ( onMesh ) {

							onMesh ( child );

						}

					}

				} );


				console.log( "Finished loading model: " + objFile );
				if ( onLoadComplete ) {

					onLoadComplete( object );

				}

			}, onProgress, onError );

		} );

	}

}
