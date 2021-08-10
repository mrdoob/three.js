( function () {

	//
	// VRM is based on glTF 2.0 and VRM extension is defined
	// in top-level json.extensions.VRM

	class VRMLoader extends THREE.Loader {

		constructor( manager ) {

			if ( THREE.GLTFLoader === undefined ) {

				throw new Error( 'THREE.VRMLoader: Import THREE.GLTFLoader.' );

			}

			super( manager );
			this.gltfLoader = new THREE.GLTFLoader( manager );

		}

		load( url, onLoad, onProgress, onError ) {

			const scope = this;
			this.gltfLoader.load( url, function ( gltf ) {

				try {

					scope.parse( gltf, onLoad );

				} catch ( e ) {

					if ( onError ) {

						onError( e );

					} else {

						console.error( e );

					}

					scope.manager.itemError( url );

				}

			}, onProgress, onError );

		}

		setDRACOLoader( dracoLoader ) {

			this.gltfLoader.setDRACOLoader( dracoLoader );
			return this;

		}

		parse( gltf, onLoad ) {

			// const gltfParser = gltf.parser;
			// const gltfExtensions = gltf.userData.gltfExtensions || {};
			// const vrmExtension = gltfExtensions.VRM || {};
			// handle VRM Extension here
			onLoad( gltf );

		}

	}

	THREE.VRMLoader = VRMLoader;

} )();
