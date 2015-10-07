/**
 *
 * A reference to a real property in the scene graph.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

THREE.PropertyBinding = function ( rootNode, path ) {

	this.rootNode = rootNode;
	this.path = path;

	var parseResults = THREE.PropertyBinding.parseTrackName( path );

	this.directoryName = parseResults.directoryName;
	this.nodeName = parseResults.nodeName;
	this.objectName = parseResults.objectName;
	this.objectIndex = parseResults.objectIndex;
	this.propertyName = parseResults.propertyName;
	this.propertyIndex = parseResults.propertyIndex;

	this.setRootNode( rootNode );

};

THREE.PropertyBinding.prototype = {

	constructor: THREE.PropertyBinding,

	getValue: function getValue_unbound( targetArray, offset ) {

		this.bind();
		this.getValue( targetArray, offset );

		// Note: This class uses a State pattern on a per-method basis:
		// 'bind' sets 'this.getValue' / 'setValue' and shadows the
		// prototype version of these methods with one that represents
		// the bound state. When the property is not found, the methods
		// become no-ops.

	},

	setValue: function getValue_unbound( sourceArray, offset ) {

		this.bind();
		this.setValue( sourceArray, offset );

	},

	// change the root used for binding
	setRootNode: function( rootNode ) {

		var oldNode = this.node,
			newNode = THREE.PropertyBinding.findNode( rootNode, this.nodeName ) || rootNode;

		if ( oldNode && oldNode !== newNode ) {

			this.unbind(); // for the change to take effect on the next call

		}

		this.rootNode = rootNode;
		this.node = newNode;

	},

	// create getter / setter pair for a property in the scene graph
	bind: function() {

		var targetObject = this.node;

		if ( ! targetObject ) {

			targetObject = THREE.PropertyBinding.findNode( this.rootNode, this.nodeName ) || this.rootNode;

			this.node = targetObject;

		}

		// set fail state so we can just 'return' on error
		this.getValue = this._getValue_unavailable;
		this.setValue = this._setValue_unavailable;

 		// ensure there is a value node
		if( ! targetObject ) {
			console.error( "  trying to update node for track: " + this.path + " but it wasn't found." );
			return;
		}

		if( this.objectName ) {
			// special case were we need to reach deeper into the hierarchy to get the face materials....
			if( this.objectName === "materials" ) {
				if( ! targetObject.material ) {
					console.error( '  can not bind to material as node does not have a material', this );
					return;
				}
				if( ! targetObject.material.materials ) {
					console.error( '  can not bind to material.materials as node.material does not have a materials array', this );
					return;
				}
				targetObject = targetObject.material.materials;
			}
			else if( this.objectName === "bones" ) {
				if( ! targetObject.skeleton ) {
					console.error( '  can not bind to bones as node does not have a skeleton', this );
					return;
				}
				// potential future optimization: skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

				targetObject = targetObject.skeleton.bones;

				// support resolving morphTarget names into indices.
				for( var i = 0; i < targetObject.length; i ++ ) {
					if( targetObject[i].name === this.objectIndex ) {
						this.objectIndex = i;
						break;
					}
				}
			}
			else {

				if( targetObject[ this.objectName ] === undefined ) {
					console.error( '  can not bind to objectName of node, undefined', this );
					return;
				}
				targetObject = targetObject[ this.objectName ];
			}

			if( this.objectIndex !== undefined ) {
				if( targetObject[ this.objectIndex ] === undefined ) {
					console.error( "  trying to bind to objectIndex of objectName, but is undefined:", this, targetObject );
					return;
				}

				targetObject = targetObject[ this.objectIndex ];
			}

		}

 		// special case mappings
 		var nodeProperty = targetObject[ this.propertyName ];
		if( ! nodeProperty ) {
			console.error( "  trying to update property for track: " + this.nodeName + '.' + this.propertyName + " but it wasn't found.", targetObject );
			return;
		}

		// determine versioning scheme
		var versioning = 0;
		var NeedsUpdate = 1;
		var MatrixWorldNeedsUpdate = 2;

		if( targetObject.needsUpdate !== undefined ) { // material

			versioning = NeedsUpdate;

		} else if( targetObject.matrixWorldNeedsUpdate !== undefined ) { // node transform

			versioning = MatrixWorldNeedsUpdate;

		}

		// access a sub element of the property array (only primitives are supported right now)
		if( this.propertyIndex !== undefined ) {

			if( this.propertyName === "morphTargetInfluences" ) {
				// potential optimization, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

				// support resolving morphTarget names into indices.
				if( ! targetObject.geometry ) {
					console.error( '  can not bind to morphTargetInfluences becasuse node does not have a geometry', this );
				}
				if( ! targetObject.geometry.morphTargets ) {
					console.error( '  can not bind to morphTargetInfluences becasuse node does not have a geometry.morphTargets', this );
				}

				for( var i = 0; i < this.node.geometry.morphTargets.length; i ++ ) {
					if( targetObject.geometry.morphTargets[i].name === this.propertyIndex ) {
						this.propertyIndex = i;
						break;
					}
				}
			}

			var propertyIndex = this.propertyIndex;

			this.getValue = function getValue_propertyIndexed( buffer, offset ) {

				buffer[ offset ] = nodeProperty[ this.propertyIndex ];

			};

			switch ( versioning ) {

				case NeedsUpdate:

					this.setValue = function setValue_propertyIndexed( buffer, offset ) {

						nodeProperty[ propertyIndex ] = buffer[ offset ];
						targetObject.needsUpdate = true;

					};

					break;

				case MatrixWorldNeedsUpdate:

					this.setValue = function setValue_propertyIndexed( buffer, offset ) {

						nodeProperty[ propertyIndex ] = buffer[ offset ];
						targetObject.matrixWorldNeedsUpdate = true;

					};

					break;

				default:

					this.setValue = function setValue_propertyIndexed( buffer, offset ) {

						nodeProperty[ propertyIndex ] = buffer[ offset ];

					};

			}

		}
		// must use copy for Object3D.Euler/Quaternion
		else if( nodeProperty.fromArray !== undefined && nodeProperty.toArray !== undefined ) {

			this.getValue = function getValue_propertyObject( buffer, offset ) {

				nodeProperty.toArray( buffer, offset );

			};


			switch ( versioning ) {

				case NeedsUpdate:

					this.setValue = function setValue_propertyObject( buffer, offset ) {

						nodeProperty.fromArray( buffer, offset );
						targetObject.needsUpdate = true;

					}

				case MatrixWorldNeedsUpdate:

					this.setValue = function setValue_propertyObject( buffer, offset ) {

						nodeProperty.fromArray( buffer, offset );
						targetObject.matrixWorldNeedsUpdate = true;

					}

				default:

					this.setValue = function setValue_propertyObject( buffer, offset ) {

						nodeProperty.fromArray( buffer, offset );

					}

			}

		}
		// otherwise just set the property directly on the node (do not use nodeProperty as it may not be a reference object)
		else {

			var propertyName = this.propertyName;

			this.getValue = function getValue_property( buffer, offset ) {

				buffer[ offset ] = nodeProperty[ propertyName ];

			};

			switch ( versioning ) {

				case NeedsUpdate:

					this.setValue = function setValue_property( buffer, offset ) {

						nodeProperty[ propertyName ] = buffer[ offset ];
						targetObject.needsUpdate = true;

					}

					break;

				case MatrixWorldNeedsUpdate:

					this.setValue = function setValue_property( buffer, offset ) {

						nodeProperty[ propertyName ] = buffer[ offset ];
						targetObject.matrixWorldNeedsUpdate = true;

					}

					break;

				default:

					this.setValue = function setValue_property( buffer, offset ) {

						nodeProperty[ propertyName ] = buffer[ offset ];

					}

			}

		}

	},

	unbind: function() {

		this.node = null;

		// back to the prototype version of getValue / setValue
		// note: avoiding to mutate the shape of 'this' via 'delete'
		this.getValue = this._getValue_unbound;
		this.setValue = this._setValue_unbound;

	}

};

Object.assign( THREE.PropertyBinding.prototype, {

	// these are used to "bind" a nonexistent property
	_getValue_unavailable: function() {},
	_setValue_unavailable: function() {},

	// initial state of these methods that calls 'bind'
	_getValue_unbound: THREE.PropertyBinding.prototype.getValue,
	_setValue_unbound: THREE.PropertyBinding.prototype.setValue

} );

THREE.PropertyBinding.parseTrackName = function( trackName ) {

	// matches strings in the form of:
	//    nodeName.property
	//    nodeName.property[accessor]
	//    nodeName.material.property[accessor]
	//    uuid.property[accessor]
	//    uuid.objectName[objectIndex].propertyName[propertyIndex]
	//    parentName/nodeName.property
	//    parentName/parentName/nodeName.property[index]
	//	  .bone[Armature.DEF_cog].position
	// created and tested via https://regex101.com/#javascript

	var re = /^(([\w]+\/)*)([\w-\d]+)?(\.([\w]+)(\[([\w\d\[\]\_. ]+)\])?)?(\.([\w.]+)(\[([\w\d\[\]\_. ]+)\])?)$/;
	var matches = re.exec(trackName);

	if( ! matches ) {
		throw new Error( "cannot parse trackName at all: " + trackName );
	}

    if (matches.index === re.lastIndex) {
        re.lastIndex++;
    }

	var results = {
		directoryName: matches[1],
		nodeName: matches[3], 	// allowed to be null, specified root node.
		objectName: matches[5],
		objectIndex: matches[7],
		propertyName: matches[9],
		propertyIndex: matches[11]	// allowed to be null, specifies that the whole property is set.
	};

	if( results.propertyName === null || results.propertyName.length === 0 ) {
		throw new Error( "can not parse propertyName from trackName: " + trackName );
	}

	return results;

};

THREE.PropertyBinding.findNode = function( root, nodeName ) {

	if( ! nodeName || nodeName === "" || nodeName === "root" || nodeName === "." || nodeName === -1 || nodeName === root.name || nodeName === root.uuid ) {

		return root;

	}

	// search into skeleton bones.
	if( root.skeleton ) {

		var searchSkeleton = function( skeleton ) {

			for( var i = 0; i < skeleton.bones.length; i ++ ) {

				var bone = skeleton.bones[i];

				if( bone.name === nodeName ) {

					return bone;

				}
			}

			return null;

		};

		var bone = searchSkeleton( root.skeleton );

		if( bone ) {

			return bone;

		}
	}

	// search into node subtree.
	if( root.children ) {

		var searchNodeSubtree = function( children ) {

			for( var i = 0; i < children.length; i ++ ) {

				var childNode = children[i];

				if( childNode.name === nodeName || childNode.uuid === nodeName ) {

					return childNode;

				}

				var result = searchNodeSubtree( childNode.children );

				if( result ) return result;

			}

			return null;

		};

		var subTreeNode = searchNodeSubtree( root.children );

		if( subTreeNode ) {

			return subTreeNode;

		}

	}

	return null;
}
