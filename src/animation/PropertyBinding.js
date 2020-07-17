/**
 *
 * A reference to a real property in the scene graph.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

// Characters [].:/ are reserved for track binding syntax.
const _RESERVED_CHARS_RE = '\\[\\]\\.:\\/';
const _reservedRe = new RegExp( '[' + _RESERVED_CHARS_RE + ']', 'g' );

// Attempts to allow node names from any language. ES5's `\w` regexp matches
// only latin characters, and the unicode \p{L} is not yet supported. So
// instead, we exclude reserved characters and match everything else.
const _wordChar = '[^' + _RESERVED_CHARS_RE + ']';
const _wordCharOrDot = '[^' + _RESERVED_CHARS_RE.replace( '\\.', '' ) + ']';

// Parent directories, delimited by '/' or ':'. Currently unused, but must
// be matched to parse the rest of the track name.
const _directoryRe = /((?:WC+[\/:])*)/.source.replace( 'WC', _wordChar );

// Target node. May contain word characters (a-zA-Z0-9_) and '.' or '-'.
const _nodeRe = /(WCOD+)?/.source.replace( 'WCOD', _wordCharOrDot );

// Object on target node, and accessor. May not contain reserved
// characters. Accessor may contain any character except closing bracket.
const _objectRe = /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace( 'WC', _wordChar );

// Property and accessor. May not contain reserved characters. Accessor may
// contain any non-bracket characters.
const _propertyRe = /\.(WC+)(?:\[(.+)\])?/.source.replace( 'WC', _wordChar );

const _trackRe = new RegExp( ''
	+ '^'
	+ _directoryRe
	+ _nodeRe
	+ _objectRe
	+ _propertyRe
	+ '$'
);

const _supportedObjectNames = [ 'material', 'materials', 'bones' ];

function Composite( targetGroup, path, optionalParsedPath ) {

	const parsedPath = optionalParsedPath || PropertyBinding.parseTrackName( path );

	this._targetGroup = targetGroup;
	this._bindings = targetGroup.subscribe_( path, parsedPath );

}

Object.assign( Composite.prototype, {

	getValue: function ( array, offset ) {

		this.bind(); // bind all binding

		const firstValidIndex = this._targetGroup.nCachedObjects_,
			binding = this._bindings[ firstValidIndex ];

		// and only call .getValue on the first
		if ( binding !== undefined ) binding.getValue( array, offset );

	},

	setValue: function ( array, offset ) {

		const bindings = this._bindings;

		for ( let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].setValue( array, offset );

		}

	},

	bind: function () {

		const bindings = this._bindings;

		for ( let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].bind();

		}

	},

	unbind: function () {

		const bindings = this._bindings;

		for ( let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].unbind();

		}

	}

} );


function PropertyBinding( rootNode, path, parsedPath ) {

	this.path = path;
	this.parsedPath = parsedPath || PropertyBinding.parseTrackName( path );

	this.node = PropertyBinding.findNode( rootNode, this.parsedPath.nodeName ) || rootNode;

	this.rootNode = rootNode;

}

Object.assign( PropertyBinding, {

	Composite: Composite,

	create: function ( root, path, parsedPath ) {

		if ( ! ( root && root.isAnimationObjectGroup ) ) {

			return new PropertyBinding( root, path, parsedPath );

		} else {

			return new PropertyBinding.Composite( root, path, parsedPath );

		}

	},

	/**
	 * Replaces spaces with underscores and removes unsupported characters from
	 * node names, to ensure compatibility with parseTrackName().
	 *
	 * @param {string} name Node name to be sanitized.
	 * @return {string}
	 */
	sanitizeNodeName: function ( name ) {

		return name.replace( /\s/g, '_' ).replace( _reservedRe, '' );

	},

	parseTrackName: function ( trackName ) {

		const matches = _trackRe.exec( trackName );

		if ( ! matches ) {

			throw new Error( 'PropertyBinding: Cannot parse trackName: ' + trackName );

		}

		const results = {
			// directoryName: matches[ 1 ], // (tschw) currently unused
			nodeName: matches[ 2 ],
			objectName: matches[ 3 ],
			objectIndex: matches[ 4 ],
			propertyName: matches[ 5 ], // required
			propertyIndex: matches[ 6 ]
		};

		const lastDot = results.nodeName && results.nodeName.lastIndexOf( '.' );

		if ( lastDot !== undefined && lastDot !== - 1 ) {

			const objectName = results.nodeName.substring( lastDot + 1 );

			// Object names must be checked against an allowlist. Otherwise, there
			// is no way to parse 'foo.bar.baz': 'baz' must be a property, but
			// 'bar' could be the objectName, or part of a nodeName (which can
			// include '.' characters).
			if ( _supportedObjectNames.indexOf( objectName ) !== - 1 ) {

				results.nodeName = results.nodeName.substring( 0, lastDot );
				results.objectName = objectName;

			}

		}

		if ( results.propertyName === null || results.propertyName.length === 0 ) {

			throw new Error( 'PropertyBinding: can not parse propertyName from trackName: ' + trackName );

		}

		return results;

	},

	findNode: function ( root, nodeName ) {

		if ( ! nodeName || nodeName === "" || nodeName === "." || nodeName === - 1 || nodeName === root.name || nodeName === root.uuid ) {

			return root;

		}

		// search into skeleton bones.
		if ( root.skeleton ) {

			const bone = root.skeleton.getBoneByName( nodeName );

			if ( bone !== undefined ) {

				return bone;

			}

		}

		// search into node subtree.
		if ( root.children ) {

			const searchNodeSubtree = function ( children ) {

				for ( let i = 0; i < children.length; i ++ ) {

					const childNode = children[ i ];

					if ( childNode.name === nodeName || childNode.uuid === nodeName ) {

						return childNode;

					}

					const result = searchNodeSubtree( childNode.children );

					if ( result ) return result;

				}

				return null;

			};

			const subTreeNode = searchNodeSubtree( root.children );

			if ( subTreeNode ) {

				return subTreeNode;

			}

		}

		return null;

	}

} );

Object.assign( PropertyBinding.prototype, { // prototype, continued

	// these are used to "bind" a nonexistent property
	_getValue_unavailable: function () {},
	_setValue_unavailable: function () {},

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

			const source = this.resolvedProperty;

			for ( let i = 0, n = source.length; i !== n; ++ i ) {

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

				this.targetObject[ this.propertyName ] = buffer[ offset ];

			},

			function setValue_direct_setNeedsUpdate( buffer, offset ) {

				this.targetObject[ this.propertyName ] = buffer[ offset ];
				this.targetObject.needsUpdate = true;

			},

			function setValue_direct_setMatrixWorldNeedsUpdate( buffer, offset ) {

				this.targetObject[ this.propertyName ] = buffer[ offset ];
				this.targetObject.matrixWorldNeedsUpdate = true;

			}

		], [

			// EntireArray

			function setValue_array( buffer, offset ) {

				const dest = this.resolvedProperty;

				for ( let i = 0, n = dest.length; i !== n; ++ i ) {

					dest[ i ] = buffer[ offset ++ ];

				}

			},

			function setValue_array_setNeedsUpdate( buffer, offset ) {

				const dest = this.resolvedProperty;

				for ( let i = 0, n = dest.length; i !== n; ++ i ) {

					dest[ i ] = buffer[ offset ++ ];

				}

				this.targetObject.needsUpdate = true;

			},

			function setValue_array_setMatrixWorldNeedsUpdate( buffer, offset ) {

				const dest = this.resolvedProperty;

				for ( let i = 0, n = dest.length; i !== n; ++ i ) {

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

	],

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
	bind: function () {

		let targetObject = this.node,
			parsedPath = this.parsedPath,

			objectName = parsedPath.objectName,
			propertyName = parsedPath.propertyName,
			propertyIndex = parsedPath.propertyIndex;

		if ( ! targetObject ) {

			targetObject = PropertyBinding.findNode( this.rootNode, parsedPath.nodeName ) || this.rootNode;

			this.node = targetObject;

		}

		// set fail state so we can just 'return' on error
		this.getValue = this._getValue_unavailable;
		this.setValue = this._setValue_unavailable;

		// ensure there is a value node
		if ( ! targetObject ) {

			console.error( 'THREE.PropertyBinding: Trying to update node for track: ' + this.path + ' but it wasn\'t found.' );
			return;

		}

		if ( objectName ) {

			let objectIndex = parsedPath.objectIndex;

			// special cases were we need to reach deeper into the hierarchy to get the face materials....
			switch ( objectName ) {

				case 'materials':

					if ( ! targetObject.material ) {

						console.error( 'THREE.PropertyBinding: Can not bind to material as node does not have a material.', this );
						return;

					}

					if ( ! targetObject.material.materials ) {

						console.error( 'THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.', this );
						return;

					}

					targetObject = targetObject.material.materials;

					break;

				case 'bones':

					if ( ! targetObject.skeleton ) {

						console.error( 'THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.', this );
						return;

					}

					// potential future optimization: skip this if propertyIndex is already an integer
					// and convert the integer string to a true integer.

					targetObject = targetObject.skeleton.bones;

					// support resolving morphTarget names into indices.
					for ( let i = 0; i < targetObject.length; i ++ ) {

						if ( targetObject[ i ].name === objectIndex ) {

							objectIndex = i;
							break;

						}

					}

					break;

				default:

					if ( targetObject[ objectName ] === undefined ) {

						console.error( 'THREE.PropertyBinding: Can not bind to objectName of node undefined.', this );
						return;

					}

					targetObject = targetObject[ objectName ];

			}


			if ( objectIndex !== undefined ) {

				if ( targetObject[ objectIndex ] === undefined ) {

					console.error( 'THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.', this, targetObject );
					return;

				}

				targetObject = targetObject[ objectIndex ];

			}

		}

		// resolve property
		const nodeProperty = targetObject[ propertyName ];

		if ( nodeProperty === undefined ) {

			const nodeName = parsedPath.nodeName;

			console.error( 'THREE.PropertyBinding: Trying to update property for track: ' + nodeName +
				'.' + propertyName + ' but it wasn\'t found.', targetObject );
			return;

		}

		// determine versioning scheme
		let versioning = this.Versioning.None;

		this.targetObject = targetObject;

		if ( targetObject.needsUpdate !== undefined ) { // material

			versioning = this.Versioning.NeedsUpdate;

		} else if ( targetObject.matrixWorldNeedsUpdate !== undefined ) { // node transform

			versioning = this.Versioning.MatrixWorldNeedsUpdate;

		}

		// determine how the property gets bound
		let bindingType = this.BindingType.Direct;

		if ( propertyIndex !== undefined ) {

			// access a sub element of the property array (only primitives are supported right now)

			if ( propertyName === "morphTargetInfluences" ) {

				// potential optimization, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

				// support resolving morphTarget names into indices.
				if ( ! targetObject.geometry ) {

					console.error( 'THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.', this );
					return;

				}

				if ( targetObject.geometry.isBufferGeometry ) {

					if ( ! targetObject.geometry.morphAttributes ) {

						console.error( 'THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.', this );
						return;

					}

					if ( targetObject.morphTargetDictionary[ propertyIndex ] !== undefined ) {

						propertyIndex = targetObject.morphTargetDictionary[ propertyIndex ];

					}


				} else {

					console.error( 'THREE.PropertyBinding: Can not bind to morphTargetInfluences on THREE.Geometry. Use THREE.BufferGeometry instead.', this );
					return;

				}

			}

			bindingType = this.BindingType.ArrayElement;

			this.resolvedProperty = nodeProperty;
			this.propertyIndex = propertyIndex;

		} else if ( nodeProperty.fromArray !== undefined && nodeProperty.toArray !== undefined ) {

			// must use copy for Object3D.Euler/Quaternion

			bindingType = this.BindingType.HasFromToArray;

			this.resolvedProperty = nodeProperty;

		} else if ( Array.isArray( nodeProperty ) ) {

			bindingType = this.BindingType.EntireArray;

			this.resolvedProperty = nodeProperty;

		} else {

			this.propertyName = propertyName;

		}

		// select getter / setter
		this.getValue = this.GetterByBindingType[ bindingType ];
		this.setValue = this.SetterByBindingTypeAndVersioning[ bindingType ][ versioning ];

	},

	unbind: function () {

		this.node = null;

		// back to the prototype version of getValue / setValue
		// note: avoiding to mutate the shape of 'this' via 'delete'
		this.getValue = this._getValue_unbound;
		this.setValue = this._setValue_unbound;

	}

} );

// DECLARE ALIAS AFTER assign prototype
Object.assign( PropertyBinding.prototype, {

	// initial state of these methods that calls 'bind'
	_getValue_unbound: PropertyBinding.prototype.getValue,
	_setValue_unbound: PropertyBinding.prototype.setValue,

} );

export { PropertyBinding };
