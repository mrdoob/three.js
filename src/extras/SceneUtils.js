/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneUtils = {

	createMultiMaterialObject: function ( geometry, materials ) {

		var group = new THREE.Object3D();

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new THREE.Mesh( geometry, materials[ i ] ) );

		}

		return group;

	},

	detach : function ( child, parent, scene ) {

		child.applyMatrix( parent.matrixWorld );
		parent.remove( child );
		scene.add( child );

	},

	attach: function ( child, scene, parent ) {

		var matrixWorldInverse = new THREE.Matrix4();
		matrixWorldInverse.getInverse( parent.matrixWorld );
		child.applyMatrix( matrixWorldInverse );

		scene.remove( child );
		parent.add( child );

	},
	
	/** Combines node and all of its children in their world position into one uber-geometry that is destinationMesh. 
	 * deduplicateMaterials may be useful after running this where there is scope for material-sharing. */
	mergeMeshesRecursive: function ( destinationMesh, node ) {

		var geometry = destinationMesh.geometry,
			materials = destinationMesh.material.materials;

		function merge( node ) {

			if ( node instanceof THREE.Mesh ) {

				THREE.GeometryUtils.merge( geometry, node, materials.length, true );

				if ( node.material instanceof THREE.MeshFaceMaterial ) {

					materials.push.apply( materials, node.material.materials );

				}
				else {

					materials.push( node.material );

				}

			}

		}

		node.updateMatrixWorld();

		merge(node);

		var descendents = node.getDescendants();

		for ( var i = 0, l = descendents.length; i < l; i++ ) {

			merge( descendents[ i ] );

		}
	},

	/** Remove all duplicate materials from a mesh that is using a MeshFaceMaterial and modify the mesh's geometry's
	 * faces to share materials where possible. */
	deduplicateMaterials: function ( mesh ) {

		function makePropertyHash( material ) {

			//TODO: Can we just use Object.keys ? https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys
			//Sort properties for hash stability - ECMAScript doesn't actually guarantee property ordering at all
			var properties = [];

			for ( var propertyName in material ) {

				//Properties never worth comparing to check for duplicates
				if ( propertyName === 'id' ||
					propertyName === 'name' ||
					propertyName === 'mipmaps' ) continue;

				if ( material.hasOwnProperty( propertyName ) ) {

					properties.push( propertyName );

				}

			}

			properties.sort();

			var str = '';

			for ( var i = 0, l = properties.length ; i < l ; i++ ) {

				propertyName = properties[ i ];

				str += '|' + propertyName + '=';

				var propertyValue = material[ propertyName ];

				switch ( typeof propertyValue ) {

					case 'undefined':
					case 'string':
					case 'number':
					case 'boolean':
					case 'function':

						str += propertyValue;

						break;

					case 'object':

						if ( propertyValue === null ) {

							str += 'null';

						}
						else if ( propertyValue instanceof THREE.Color ) {

							str += propertyValue.getHex();

						}
						else if ( propertyValue instanceof Image ) {

							str += propertyValue.src;

						}
						else if ( propertyValue instanceof THREE.Texture ) {

							//Downloaded images are nicely predictable, but recurse to check other parameters are not unique
							if ( propertyValue && propertyValue.image && propertyValue.image.src ) {

								str += makePropertyHash( propertyValue );

							}
							else {

								str += propertyValue.id;

							}

						}
						else if ( propertyValue instanceof THREE.Vector3 ) {

							str += propertyValue.x + ',' + propertyValue.y + ',' + propertyValue.z;

						}
						else if ( propertyValue instanceof THREE.Vector2 ) {

							str += propertyValue.x + ',' + propertyValue.y;

						}
						//Why are these awkward quasi-classes and not just numerical enumerations?
						else if ( propertyValue instanceof THREE.UVMapping ) {

							str += 'UVMapping';

						}
						else if ( propertyValue instanceof THREE.CubeReflectionMapping ) {

							str += 'CubeReflectionMapping';

						}
						else if ( propertyValue instanceof THREE.CubeRefractionMapping ) {

							str += 'CubeRefractionMapping';

						}
						else if ( propertyValue instanceof THREE.SphericalReflectionMapping ) {

							str += 'SphericalReflectionMapping';

						}
						else if ( propertyValue instanceof THREE.SphericalRefractionMapping ) {

							str += 'SphericalRefractionMapping';

						}
						else {
							switch ( propertyName ) {

								case 'uniforms':
								case 'defines':
								case 'attributes':

									str += JSON.stringify( propertyValue );

									break;

								default:

									// Don't know how to handle this
									throw "deduplicateMaterials: Unhandled property " + propertyName + " : " + propertyValue;

							}

						}

						break;
				}

			}

			return str;

		}

		var materialsIn = mesh.material.materials,
			materialsIdMap = {},
			materialsIndexMap = [],
			materialsOut = [];

		for ( var i = 0, l = materialsIn.length; i < l; i++ ) {

			var material = materialsIn[ i ];

			var materialHash = makePropertyHash( material );

			if ( materialHash in materialsIdMap ) {

				materialsIndexMap[ i ] = materialsIdMap[ materialHash ];

			}
			else {

//				console.log("Material " + materialsOut.length + ": " + materialHash);
				materialsIndexMap[ i ] = materialsOut.length;
				materialsIdMap[ materialHash ] = materialsOut.length;
				materialsOut.push( material );

			}

		}

		var faces = mesh.geometry.faces, 
			face;

		for ( var i = 0, l = faces.length; i < l; i++ ) {

			face = faces[i];

			face.materialIndex = materialsIndexMap[ face.materialIndex ];

		}

//		console.log("deduplicateMaterials from " + materialsIn.length + " down to " + materialsOut.length);

		mesh.material.materials = materialsOut;

	}

};
