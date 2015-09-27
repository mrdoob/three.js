/*
 * @author tamarintech / https://tamarintech.com
 *
 * Description: Early release of an AMF Loader following the pattern of the
 * example loaders in the three.js project.
 *
 * More information about the AMF format: http://amf.wikispaces.com
 *
 * Usage:
 *	var loader = new AMFLoader();
 *	loader.load('/path/to/project.amf', function(objecttree) {
 *		scene.add(objecttree);
 *	});
 *
 * Materials now supported, material colors supported
 * Zip support, requires jszip
 * TextDecoder polyfill required by some browsers (particularly IE, Edge)
 * No constellation support (yet)!
 *
 */

THREE.AMFLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.AMFLoader.prototype = {

	constructor: THREE.AMFLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setResponseType( 'arraybuffer' );

		loader.load( url, function( text ) {

			var amfObject = scope.parse( text );
			onLoad( amfObject );

		}, onProgress, onError );

	},

	parse: function ( data ) {

		function loadDocument( data ) {

			var view = new DataView( data );
			var magic = String.fromCharCode( view.getUint8( 0 ), view.getUint8( 1 ) );

			if ( magic === "PK" ) {

				var zip = null;
				var file = null;

				console.log( "Loading Zip" );

				try {

					zip = new JSZip( data );

				} catch ( e ) {

					if ( e instanceof ReferenceError ) {

						console.log( "	jszip missing and file is compressed." );
						return null;

					}

				}

				for ( file in zip.files ) {

					if ( file.toLowerCase().endsWith( ".amf" ) ) {

						break;

					}

				}

				console.log( "	Trying to load file asset: " + file );
				view = new DataView( zip.file( file ).asArrayBuffer() );

			}

			if ( TextDecoder === undefined ) {

				console.log( "	TextDecoder not present.	Please use TextDecoder polyfill." );
				return null;

			}

			var fileText = new TextDecoder( 'utf-8' ).decode( view );
			var xmlData = new DOMParser().parseFromString( fileText, 'application/xml' );

			if ( xmlData.documentElement.nodeName.toLowerCase() !== "amf" ) {

				console.log( "	Error loading AMF - no AMF document found." );
				return null;

			}

			return xmlData;

		}

		function loadDocumentScale( node ) {

			var scale = 1.0;
			var unit = 'millimeter';

			if ( node.documentElement.attributes[ 'unit' ] !== undefined ) {

				unit = node.documentElement.attributes[ 'unit' ].value.toLowerCase();

			}

			var scaleUnits = {
				'millimeter': 1.0,
				'inch': 25.4,
				'feet': 304.8,
				'meter': 1000.0,
				'micron': 0.001
			};

			if ( scaleUnits[ unit ] !== undefined ) {

				scale = scaleUnits[ unit ];

			}

			console.log( "	Unit scale: " + scale );
			return scale;

		}

		function loadMaterials( node ) {

			var matName = "AMF Material";
			var matId = node.attributes[ 'id' ].textContent;
			var color;

			var loadedMaterial = null;

			for ( var i = 0; i < node.children.length; i ++ ) {

				var matChildEl = node.children[ i ];

				if ( matChildEl.nodeName === "metadata" && matChildEl.attributes[ 'type' ] !== undefined ) {

					if ( matChildEl.attributes[ 'type' ].value === 'name' ) {

						matname = matChildEl.textContent;

					}

				} else if ( matChildEl.nodeName === 'color' ) {

					color = loadColor( matChildEl );

				}

			}

			loadedMaterial = new THREE.MeshPhongMaterial( {
				shading: THREE.FlatShading,
				color: new THREE.Color( color.r, color.g, color.b ),
				name: matName
			} );

			if ( color.opacity !== 1.0 ) {

				loadedMaterial.transparent = true;
				loadedMaterial.opacity = color.opacity;

			}

			return { 'id': matId, 'material': loadedMaterial };

		}

		function loadColor( node ) {

			var color = { 'r': 1.0, 'g': 1.0, 'b': 1.0, 'a': 1.0, opacity: 1.0 };

			for ( var i = 0; i < node.children.length; i ++ ) {

				var matColor = node.children[ i ];

				if ( matColor.nodeName === 'r' ) {

					color.r = matColor.textContent;

				} else if ( matColor.nodeName === 'g' ) {

					color.g = matColor.textContent;

				} else if ( matColor.nodeName === 'b' ) {

					color.b = matColor.textContent;

				} else if ( matColor.nodeName === 'a' ) {

					color.opacity = matColor.textContent;

				}

			}

			return color;

		}

		function loadMeshVolume( node ) {

			var volume = { "name": "", "triangles": [], "materialid": null };

			var currVolumeNode = node.firstElementChild;

			if ( node.attributes[ 'materialid' ] !== undefined ) {

				volume.materialId = node.attributes[ 'materialid' ].nodeValue;

			}

			while ( currVolumeNode ) {

				if ( currVolumeNode.nodeName === "metadata" ) {

					if ( currVolumeNode.attributes[ 'type' ] !== undefined ) {

						if ( currVolumeNode.attributes[ 'type' ].value === 'name' ) {

							volume.name = currVolumeNode.textContent;

						}

					}

				} else if ( currVolumeNode.nodeName === "triangle" ) {

					var triangleNode = currVolumeNode.firstElementChild;

					while ( triangleNode ) {

						if ( triangleNode.nodeName === "v1" ||
								triangleNode.nodeName === "v2" ||
								triangleNode.nodeName === "v3" ) {

							volume.triangles.push( triangleNode.textContent );

						}

						triangleNode = triangleNode.nextElementSibling;

					}

				}

				currVolumeNode = currVolumeNode.nextElementSibling;

			}

			return volume;

		}

		function loadMeshVertices( node ) {

			var vertArray = [];
			var currVerticesNode = node.firstElementChild;

			while ( currVerticesNode ) {

				if ( currVerticesNode.nodeName === "vertex" ) {

					var vNode = currVerticesNode.firstElementChild;

					while ( vNode ) {

						if ( vNode.nodeName === "coordinates" ) {

							var coordNode = vNode.firstElementChild;

							while ( coordNode ) {

								if ( coordNode.nodeName === "x" ||
										 coordNode.nodeName === "y" ||
										 coordNode.nodeName === "z" ) {

									vertArray.push( coordNode.textContent );

								}

								coordNode = coordNode.nextElementSibling;

							}

						}
						vNode = vNode.nextElementSibling;

					}

				}
				currVerticesNode = currVerticesNode.nextElementSibling;

			}

			return vertArray;

		}

		function loadObject( node ) {

			var objId = node.attributes[ 'id' ].textContent;
			var loadedObject = { "name": "amfobject", "meshes": [] };
			var currColor = null;
			var currObjNode = node.firstElementChild;

			while ( currObjNode ) {

				if ( currObjNode.nodeName === "metadata" ) {

					if ( currObjNode.attributes[ 'type' ] !== undefined ) {

						if ( currObjNode.attributes[ 'type' ].value === 'name' ) {

							loadedObject.name = currObjNode.textContent;

						}

					}

				} else if ( currObjNode.nodeName === "color" ) {

					currColor = loadColor( currObjNode );

				} else if ( currObjNode.nodeName === "mesh" ) {

					var currMeshNode = currObjNode.firstElementChild;
					var mesh = { "vertices": [], "volumes": [], "color": currColor };

					while ( currMeshNode ) {

						if ( currMeshNode.nodeName === "vertices" ) {

							mesh.vertices = mesh.vertices.concat( loadMeshVertices( currMeshNode ) );

						} else if ( currMeshNode.nodeName === "volume" ) {

							mesh.volumes.push( loadMeshVolume( currMeshNode ) );

						}

						currMeshNode = currMeshNode.nextElementSibling;

					}

					loadedObject.meshes.push( mesh );

				}

				currObjNode = currObjNode.nextElementSibling;

			}

			return { 'id': objId, 'obj': loadedObject };

		}

		var xmlData = loadDocument( data );
		var amfName = "";
		var amfAuthor = "";
		var amfScale = loadDocumentScale( xmlData );
		var amfMaterials = {};
		var amfObjects = {};
		var children = xmlData.documentElement.children;

		for ( var i = 0; i < children.length; i ++ ) {

			var child = children[ i ];

			if ( child.nodeName === 'metadata' ) {

				if ( child.attributes[ 'type' ] !== undefined ) {

					if ( child.attributes[ 'type' ].value === 'name' ) {

						amfName = child.textContent;

					} else if ( child.attributes[ 'type' ].value === 'author' ) {

						amfAuthor = child.textContent;

					}

				}

			} else if ( child.nodeName === 'material' ) {

				var loadedMaterial = loadMaterials( child );

				amfMaterials[ loadedMaterial.id ] = loadedMaterial.material;

			} else if ( child.nodeName === 'object' ) {

				var loadedObject = loadObject( child );

				amfObjects[ loadedObject.id ] = loadedObject.obj;

			}

		}

		var sceneObject = new THREE.Group();
		var defaultMaterial = new THREE.MeshPhongMaterial( { color: 0xaaaaff, shading: THREE.FlatShading } );

		sceneObject.name = amfName;
		sceneObject.userData.author = amfAuthor;
		sceneObject.userData.loader = "AMF";

		for ( var id in amfObjects ) {

			var meshes = amfObjects[ id ].meshes;
			var newObject = new THREE.Group();

			for ( var i = 0; i < meshes.length; i ++ ) {

				var mesh = meshes[ i ];
				var meshVertices = Float32Array.from( mesh.vertices );
				var vertices = new THREE.BufferAttribute( Float32Array.from( meshVertices ), 3 );
				var objDefaultMaterial = defaultMaterial;

				if ( mesh.color ) {

					var color = mesh.color;

					objDefaultMaterial = defaultMaterial.clone();
					objDefaultMaterial.color = new THREE.Color( color.r, color.g, color.b );

					if ( color.a !== 1.0 ) {

						objDefaultMaterial.transparent = true;
						objDefaultMaterial.opacity = color.a;

					}

				}

				var volumes = mesh.volumes;

				for ( var j = 0; j < volumes.length; j ++ ) {

					var volume = volumes[ j ];
					var newGeometry = new THREE.BufferGeometry();
					var indexes = Uint32Array.from( volume.triangles );
					var normals = new Uint32Array( vertices.array.length );
					var material = objDefaultMaterial;

					newGeometry.setIndex( new THREE.BufferAttribute( indexes, 1 ) );
					newGeometry.addAttribute( 'position', vertices.clone() );

					if ( amfMaterials[ volume.materialid ] !== undefined ) {

						material = amfMaterials[ volume.materialid ];

					}

					newGeometry.scale( amfScale, amfScale, amfScale );
					newObject.add( new THREE.Mesh( newGeometry, material.clone() ) );

				}

			}

			sceneObject.add( newObject );

		}

		return sceneObject;

	}

};
