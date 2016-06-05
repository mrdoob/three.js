/**
 *
 * A reference to a real property in the scene graph.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

THREE.PropertyBinding = function ( rootNode, path, parsedPath ) {

	this.path = path;
	this.parsedPath = parsedPath ||
			THREE.PropertyBinding.parseTrackName( path );

	this.node = THREE.PropertyBinding.findNode(
			rootNode, this.parsedPath.nodeName ) || rootNode;

	this.rootNode = rootNode;

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

	// create getter / setter pair for a property in the scene graph
	bind: function() {

		var targetObject = this.node,
			parsedPath = this.parsedPath,

			objectName = parsedPath.objectName,
			propertyName = parsedPath.propertyName,
			propertyIndex = parsedPath.propertyIndex;

		if ( ! targetObject ) {

			targetObject = THREE.PropertyBinding.findNode(
					this.rootNode, parsedPath.nodeName ) || this.rootNode;

			this.node = targetObject;

		}

		// set fail state so we can just 'return' on error
		this.getValue = this._getValue_unavailable;
		this.setValue = this._setValue_unavailable;

 		// ensure there is a value node
		if ( ! targetObject ) {

			console.error( "  trying to update node for track: " + this.path + " but it wasn't found." );
			return;

		}

		if ( objectName ) {

			var objectIndex = parsedPath.objectIndex;

			// special cases were we need to reach deeper into the hierarchy to get the face materials....
			switch ( objectName ) {

				case 'materials':

					if ( ! targetObject.material ) {

						console.error( '  can not bind to material as node does not have a material', this );
						return;

					}

					if ( ! targetObject.material.materials ) {

						console.error( '  can not bind to material.materials as node.material does not have a materials array', this );
						return;

					}

					targetObject = targetObject.material.materials;

					break;

				case 'bones':

					if ( ! targetObject.skeleton ) {

						console.error( '  can not bind to bones as node does not have a skeleton', this );
						return;

					}

					// potential future optimization: skip this if propertyIndex is already an integer
					// and convert the integer string to a true integer.

					targetObject = targetObject.skeleton.bones;

					// support resolving morphTarget names into indices.
					for ( var i = 0; i < targetObject.length; i ++ ) {

						if ( targetObject[ i ].name === objectIndex ) {

							objectIndex = i;
							break;

						}

					}

					break;

				default:

					if ( targetObject[ objectName ] === undefined ) {

						console.error( '  can not bind to objectName of node, undefined', this );
						return;

					}

					targetObject = targetObject[ objectName ];

			}


			if ( objectIndex !== undefined ) {

				if ( targetObject[ objectIndex ] === undefined ) {

					console.error( "  trying to bind to objectIndex of objectName, but is undefined:", this, targetObject );
					return;

				}

				targetObject = targetObject[ objectIndex ];

			}

		}

		// resolve property
		var nodeProperty = targetObject[ propertyName ];

		if ( nodeProperty === undefined ) {

			var nodeName = parsedPath.nodeName;

			console.error( "  trying to update property for track: " + nodeName +
					'.' + propertyName + " but it wasn't found.", targetObject );
			return;

		}

		// determine versioning scheme
		var versioning = this.Versioning.None;

		if ( targetObject.needsUpdate !== undefined ) { // material

			versioning = this.Versioning.NeedsUpdate;
			this.targetObject = targetObject;

		} else if ( targetObject.matrixWorldNeedsUpdate !== undefined ) { // node transform

			versioning = this.Versioning.MatrixWorldNeedsUpdate;
			this.targetObject = targetObject;

		}

		// determine how the property gets bound
		var bindingType = this.BindingType.Direct;

		if ( propertyIndex !== undefined ) {
			// access a sub element of the property array (only primitives are supported right now)

			if ( propertyName === "morphTargetInfluences" ) {
				// potential optimization, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

				// support resolving morphTarget names into indices.
				if ( ! targetObject.geometry ) {

					console.error( '  can not bind to morphTargetInfluences becasuse node does not have a geometry', this );
					return;

				}

				if ( ! targetObject.geometry.morphTargets ) {

					console.error( '  can not bind to morphTargetInfluences becasuse node does not have a geometry.morphTargets', this );
					return;

				}

				for ( var i = 0; i < this.node.geometry.morphTargets.length; i ++ ) {

					if ( targetObject.geometry.morphTargets[ i ].name === propertyIndex ) {

						propertyIndex = i;
						break;

					}

				}

			}

			bindingType = this.BindingType.ArrayElement;

			this.resolvedProperty = nodeProperty;
			this.propertyIndex = propertyIndex;

		} else if ( nodeProperty.fromArray !== undefined && nodeProperty.toArray !== undefined ) {
			// must use copy for Object3D.Euler/Quaternion

			bindingType = this.BindingType.HasFromToArray;

			this.resolvedProperty = nodeProperty;

		} else if ( nodeProperty.length !== undefined ) {

			bindingType = this.BindingType.EntireArray;

			this.resolvedProperty = nodeProperty;

		} else {

			this.propertyName = propertyName;

		}

		// select getter / setter
		this.getValue = this.GetterByBindingType[ bindingType ];
		this.setValue = this.SetterByBindingTypeAndVersioning[ bindingType ][ versioning ];

	},

	unbind: function() {

		this.node = null;

		// back to the prototype version of getValue / setValue
		// note: avoiding to mutate the shape of 'this' via 'delete'
		this.getValue = this._getValue_unbound;
		this.setValue = this._setValue_unbound;

	}

};

Object.assign( THREE.PropertyBinding.prototype, { // prototype, continued

	// these are used to "bind" a nonexistent property
	_getValue_unavailable: function() {},
	_setValue_unavailable: function() {},

	// initial state of these methods that calls 'bind'
	_getValue_unbound: THREE.PropertyBinding.prototype.getValue,
	_setValue_unbound: THREE.PropertyBinding.prototype.setValue,

	BindingType: {
		Direct: 0,
		EntireArray: 1,
		ArrayElement: 2,
		HasFromToArray: 3
	},

	Versioning: {
		None: 0,
		NeedsUpdate: 1,
		MatrixWorldNeedsUpdate: 2
	},

	GetterByBindingType: [

		function getValue_direct( buffer, offset ) {

			buffer[ offset ] = this.node[ this.propertyName ];

		},

		function getValue_array( buffer, offset ) {

			var source = this.resolvedProperty;

			for ( var i = 0, n = source.length; i !== n; ++ i ) {

				buffer[ offset ++ ] = source[ i ];

			}

		},

		function getValue_arrayElement( buffer, offset ) {

			buffer[ offset ] = this.resolvedProperty[ this.propertyIndex ];

		},

		function getValue_toArray( buffer, offset ) {

			this.resolvedProperty.toArray( buffer, offset );

		}

	],

	SetterByBindingTypeAndVersioning: [

		[
			// Direct

			function setValue_direct( buffer, offset ) {

				this.node[ this.propertyName ] = buffer[ offset ];

			},

			function setValue_direct_setNeedsUpdate( buffer, offset ) {

				this.node[ this.propertyName ] = buffer[ offset ];
				this.targetObject.needsUpdate = true;

			},

			function setValue_direct_setMatrixWorldNeedsUpdate( buffer, offset ) {

				this.node[ this.propertyName ] = buffer[ offset ];
				this.targetObject.matrixWorldNeedsUpdate = true;

			}

		], [

			// EntireArray

			function setValue_array( buffer, offset ) {

				var dest = this.resolvedProperty;

				for ( var i = 0, n = dest.length; i !== n; ++ i ) {

					dest[ i ] = buffer[ offset ++ ];

				}

			},

			function setValue_array_setNeedsUpdate( buffer, offset ) {

				var dest = this.resolvedProperty;

				for ( var i = 0, n = dest.length; i !== n; ++ i ) {

					dest[ i ] = buffer[ offset ++ ];

				}

				this.targetObject.needsUpdate = true;

			},

			function setValue_array_setMatrixWorldNeedsUpdate( buffer, offset ) {

				var dest = this.resolvedProperty;

				for ( var i = 0, n = dest.length; i !== n; ++ i ) {

					dest[ i ] = buffer[ offset ++ ];

				}

				this.targetObject.matrixWorldNeedsUpdate = true;

			}

		], [

			// ArrayElement

			function setValue_arrayElement( buffer, offset ) {

				this.resolvedProperty[ this.propertyIndex ] = buffer[ offset ];

			},

			function setValue_arrayElement_setNeedsUpdate( buffer, offset ) {

				this.resolvedProperty[ this.propertyIndex ] = buffer[ offset ];
				this.targetObject.needsUpdate = true;

			},

			function setValue_arrayElement_setMatrixWorldNeedsUpdate( buffer, offset ) {

				this.resolvedProperty[ this.propertyIndex ] = buffer[ offset ];
				this.targetObject.matrixWorldNeedsUpdate = true;

			}

		], [

			// HasToFromArray

			function setValue_fromArray( buffer, offset ) {

				this.resolvedProperty.fromArray( buffer, offset );

			},

			function setValue_fromArray_setNeedsUpdate( buffer, offset ) {

				this.resolvedProperty.fromArray( buffer, offset );
				this.targetObject.needsUpdate = true;

			},

			function setValue_fromArray_setMatrixWorldNeedsUpdate( buffer, offset ) {

				this.resolvedProperty.fromArray( buffer, offset );
				this.targetObject.matrixWorldNeedsUpdate = true;

			}

		]

	]

} );

THREE.PropertyBinding.Composite =
		function( targetGroup, path, optionalParsedPath ) {

	var parsedPath = optionalParsedPath ||
			THREE.PropertyBinding.parseTrackName( path );

	this._targetGroup = targetGroup;
	this._bindings = targetGroup.subscribe_( path, parsedPath );

};

THREE.PropertyBinding.Composite.prototype = {

	constructor: THREE.PropertyBinding.Composite,

	getValue: function( array, offset ) {

		this.bind(); // bind all binding

		var firstValidIndex = this._targetGroup.nCachedObjects_,
			binding = this._bindings[ firstValidIndex ];

		// and only call .getValue on the first
		if ( binding !== undefined ) binding.getValue( array, offset );

	},

	setValue: function( array, offset ) {

		var bindings = this._bindings;

		for ( var i = this._targetGroup.nCachedObjects_,
				n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].setValue( array, offset );

		}

	},

	bind: function() {

		var bindings = this._bindings;

		for ( var i = this._targetGroup.nCachedObjects_,
				n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].bind();

		}

	},

	unbind: function() {

		var bindings = this._bindings;

		for ( var i = this._targetGroup.nCachedObjects_,
				n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].unbind();

		}

	}

};

THREE.PropertyBinding.create = function( root, path, parsedPath ) {

	if ( ! ( root instanceof THREE.AnimationObjectGroup ) ) {

		return new THREE.PropertyBinding( root, path, parsedPath );

	} else {

		return new THREE.PropertyBinding.Composite( root, path, parsedPath );

	}

};

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

	var re = /^(([\w]+\/)*)([\w-\d]+)?(\.([\w]+)(\[([\w\d\[\]\_.:\- ]+)\])?)?(\.([\w.]+)(\[([\w\d\[\]\_. ]+)\])?)$/;
	var matches = re.exec( trackName );

	if ( ! matches ) {

		throw new Error( "cannot parse trackName at all: " + trackName );

	}

	if ( matches.index === re.lastIndex ) {

		re.lastIndex++;

	}

	var results = {
		// directoryName: matches[ 1 ], // (tschw) currently unused
		nodeName: matches[ 3 ], 	// allowed to be null, specified root node.
		objectName: matches[ 5 ],
		objectIndex: matches[ 7 ],
		propertyName: matches[ 9 ],
		propertyIndex: matches[ 11 ]	// allowed to be null, specifies that the whole property is set.
	};

	if ( results.propertyName === null || results.propertyName.length === 0 ) {

		throw new Error( "can not parse propertyName from trackName: " + trackName );

	}

	return results;

};

THREE.PropertyBinding.findNode = function( root, nodeName ) {

	if ( ! nodeName || nodeName === "" || nodeName === "root" || nodeName === "." || nodeName === -1 || nodeName === root.name || nodeName === root.uuid ) {

		return root;

	}

	// search into skeleton bones.
	if ( root.skeleton ) {

		var searchSkeleton = function( skeleton ) {

			for( var i = 0; i < skeleton.bones.length; i ++ ) {

				var bone = skeleton.bones[ i ];

				if ( bone.name === nodeName ) {

					return bone;

				}
			}

			return null;

		};

		var bone = searchSkeleton( root.skeleton );

		if ( bone ) {

			return bone;

		}
	}

	// search into node subtree.
	if ( root.children ) {

		var searchNodeSubtree = function( children ) {

			for( var i = 0; i < children.length; i ++ ) {

				var childNode = children[ i ];

				if ( childNode.name === nodeName || childNode.uuid === nodeName ) {

					return childNode;

				}

				var result = searchNodeSubtree( childNode.children );

				if ( result ) return result;

			}

			return null;

		};

		var subTreeNode = searchNodeSubtree( root.children );

		if ( subTreeNode ) {

			return subTreeNode;

		}

	}

	return null;

};
