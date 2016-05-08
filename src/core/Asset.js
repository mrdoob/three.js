THREE.Asset = ( function() {
	'use strict';

	// Constructor

	var Asset = function Asset() {

		// Create (runtime) .id:

		var ac = this.AssetCategory,
			id = idCounters[ ac ] ++;

		idDescriptor.id.value = id;
		Object.defineProperties( idDescriptor );

		// Create (persistent) .uuid:

		this.uuid = THREE.Math.generateUUID();

		// Assign the default state defined by the most derived class:

		Asset.prototype.copy.call( this, this.DefaultState );

	};


	// Static interface

	Object.assign( Asset, {

		// Built-in asset categories
		// (ordered to eliminiate fixup unless in .userData and the like)
		categories: [
			'images',
			'textures',
			'materials',
			'geometries',
			'objects'
		],

		// Map of all known assets by UUID
		byUUID: {},

		// Utility function to setup derived classes
		assignPrototype: function( ctor, baseCtor, prototype ) {

			var baseProto = baseCtor.prototype,
				defaultState = {};

			// REVIEW: allow properties to be assigned? or better Object.defineProperty?

			prototype = Object.assign( Object.create( baseProto ), prototype );

			Object.defineProperties( prototype, {

				constructor: {
					value: ctor,
					writable: true,
					enumerable: false,
					configurable: true
				},

				DefaultState: {
					value: defaultState,
					writable: true,
					enumerable: false,
					configurable: true
				}

			} );

			var category = prototype.AssetCategory;

			if ( ! ( category in idCounters ) ) {

				idCoutners[ category ] = 0;

				var cateogries = Asset.categories;
				
				if ( categories.indexOf( category ) !== -1 ) {

					categories.push( category );

				}

			}

			flattenDefaults( defaultState, prototype );
			prototype.PropertyKeys = Object.keys( prototype.DefaultState );

			ctor.prototype = prototype;

		},

		// Deserialization entry point with constructor invocation
		createFromData: function( data ) {

			if ( imported === null ) return deserializeRoot( data );

			var type = data.type,
				ctor = Asset.constructors[ type ],
				func = ctor.createFromData;

			return ( func === undefined ) ?
					new ctor().deserialize( data ) : func( data );

		}

	} );

	// Instance interface (prototype):

	Object.defineProperties( Object.assign( Asset.prototype, {

		// Automatable properties and their defaults.
		//
		// Entries from the base classes in the prototype chain are added to
		// this map automatically for maintainability.
		//
		// Properties that are transient (= runtime state, excluded from ser-
		// ialization) or have customized copy/serialization semantics must
		// *not* be added to the map - these have to be handled manually.
		//
		DefaultState: {
			name: ''
		},

		clone: function() {

			return new this.constructor().copy( this );

		},

		copy: function( that ) {

			if ( this.constructor !== that.constructor ) {

				console.warn( "THREE.Asset: Objects of different classes " +
						"cannot be copied safely!" );

			}

			var keys = this.PropertyKeys;

			for ( var i = 0, n = keys.length; i !== n; ++ i ) {

				assignProperty( this, that, keys[ i ], Copy );

			}

			return this;

		},

		serialize: function() {

			if ( exported === null ) return serializeRoot( this );

			var data = {

				metadata: {
					version: 4.4,
					type: this.type,
					category: this.AssetCategory,
					generator: 'Asset.toJSON'
				},

				uuid: this.uuid,
				type: this.type

			};

			var keys = this.PropertyKeys;

			for ( var i = 0, n = keys.length; i !== n; ++ i ) {

				assignProperty( data, this, keys[ i ], Serialize );

			}

			return data;

		},

		deserialize: function( data ) {

			if ( imported === null ) return deserializeRoot( data, this );

			var keys = this.PropertyKeys;

			for ( var i = 0, n = keys.length; i !== n; ++ i ) {

				assignProperty( this, data, keys[ i ], Deserialize );

			}

			return this;

		},

		dispose: function() {

			delete Asset.byUUID[ this.uuid ];
			this.dispatchEvent( { type: 'dispose' } );

		}

	}, THREE.EventDispatcher.prototype ), {

		uuid: {

			get: function() { return this._uuid; },

			set: function( value ) {

				var registry = Asset.byUUID,
					uuid = this._uuid;

				if ( value !== uuid ) {

					delete registry[ uuid ];
					registry[ value ] = this;

					this._uuid = value;

				}

			}

		}

	} );


	// Interna:

	var idCounters = {}, // [ asset category ] -> integer to generate asset.id
		// REVIEW: ID counters are currently public - intentionally?
		// REVIEW: Could be exposed

		idDescriptor = { id: { value: 0 } },

		flattenDefaults = function flattenMetaInfo( defaults, prototype ) {
			// used by Asset.assignPrototype to climb the prototype chain and
			// flatten the meta information

			// Recurse to base:
			var baseProto = Object.getPrototypeOf( prototype );
			if ( baseProto !== Object.prototype ) {

				flattenMetaInfo( defaults, baseProto );

			}

			// Assign properties ascending to the concrete class:
			Object.assign( defaults, prototype.DefaultState );

		},

		Copy = 0,
		Serialize = 1,
		Deserialize = 2,

		assignProperty: function assignProperty( dst, src, key, mode, defaults ) {

			var value = src[ key ];
			if ( value === undefined ) return;

			var type = typeof value;

			if ( value !== null && type !== 'boolean' ) {

				if ( type === 'number' ) {

					var dstVal = dst[ key ];

					if ( dstVal instanceof Color ) {

						dstVal.set( value );
						return;

					}

				} else if ( type === 'string' ) {

					if ( mode === Deserialize &&
							key !== 'uuid' && Math.UUIDFORMAT.test( value ) ) {
						// found a UUID not labeled as one - an obj. reference

						var obj = imported[ value ];

						if ( obj !== undefined ) value = obj; // deserialized
						else fixup.push( value, key ); // not yet deserialized

					}

				} else if ( value instanceof Asset ) {

					if ( mode === Serialize ) value = value.serialize().uuid;

				} else {

					// Invariants
					// - the source property is not 'null' or 'undefined'
					// - its type is 'object' (that includes arrays)
					// - it's owned by the source object

					var dstVal = dst[ key ],
						srcCtor === value.constructor;

					if ( srcCtor === Array ) {

						var nElems = value.length;

						if ( nElems === 0 && mode === Serialize ) return;

						if ( dstVal === undefined || dstVal === null ) {

							dstVal = new Array( nElems );

						} else if ( mode === Deserialize &&
									dstVal.constructor !== srcCtor ) {
							// destination exists but not an Array
							// => assume .fromArray when deserializing

							dstVal.fromArray( value );
							return;

						} else {

							dstVal.length = nElems;

						}

						for ( var i = 0; i !== nElems; ++ i ) {

							assignProperty( dstVal, value, i, mode );

						}

					} else if ( srcCtor === Object ) {

						dstVal = {}; // objects are awkward to clear, so re-create
						dst[ key ] = dstVal;

						var keys = Object.keys( value ),
							nKeys = keys.length;

						if ( nKeys === 0 && mode === Serialize ) return;

						for ( var i = 0; i !== nKeys; ++ i ) {

							var k = keys[ i ];
							assignProperty( dstVal, value, k, mode );

						}

					} else {

						// Invariant: Object is 'class'y but not a THREE.Asset.
						// Assumption: It implements .equals, .clone and .copy.

						if ( ! dstVal || srcCtor !== dstVal.constructor ) {
							// no target (of suitable type)?

							if ( mode === Serialize ) {

								if ( value.equals( defaults[ key ] ) ) return;

								value = value instanceof THREE.Color ?
										value.getHex() : value.toArray();

							} else {

								value = value.clone();

							}

						} else {

							dstVal.copy( value );
							return;

						}

					}

					value = dstVal;

				}

				if ( mode !== Serialize || value !== dst[ key ] ) {

					dst[ key ] = value;

				}

			}

		},

		exported = null, // in process: [ uuid ] -> serialized object

		serializeRoot = function serializeRoot( asset ) {
			// calls .serialize on the top-level object and adds asset arrays

			var result;

			exported = {};

			try {

				result = asset.toJSON();

				for ( var uuid in exported ) {

					var asset = exported[ uuid ],
						category = asset.AssetCategory,
						array = result[ category ];

					if ( array === undefined ) {

						array = [];
						result[ category ] = array;

					}

					delete asset.metadata;
					array.push( asset );

				}

			} catch ( e ) {

				console.error( e.stack || e.stacktrace || e );

			}

			exported = null;

			return result;

		},

		imported = null, // in process: [ uuid ] -> deserialized object
		fixupTargets = [], // [ obj      , obj        ... ]
		fixupStrings = [], // [ uuid, key, uuid, key, ... ]

		deserializeRoot = function deserializeRoot( data, optionalTarget ) {

			var result = optionalTarget;

			imported = {};

			try {

				var categories = Asset.categories;
				for ( var i = 0, n = categories.length; i !== n; ++ i ) {

					var category = categories[ i ],
						assets = data[ category ];

					if ( assets !== undefined ) {

						data[ category ] = assets.map( Asset.createFromData );

					}

				}

				if ( result !== undefined ) {

					result.deserialize( data );

				} else {

					result = Asset.createFromData( data );

				}

				var nUnresolved = 0;

				for ( var i = 0, n = fixupTargets.length; i !== n; ++ i ) {

					var uuid = fixupStrings[ 2 * i ],
						key = fixupStrings[ 2 * i + 1 ],
						trg = fixupTargets[ i ],
						obj = imported[ uuid ];

					if ( obj !== undefined ) {

						trg[ key ] = obj;

					} else {

						fixupStrings[ nUnresolved * 2 ] = uuid;
						fixupStrings[ nUnresolved * 2 + 1 ] = key;
						fixupTargets[ nUnresolved ++ ] = trg;

					}

				}

				if ( nUnresolved !== 0 ) {

					console.warn( "THREE.Asset: Deserializer could not " +
							"resolve the following references:" );

					for ( var i = 0; i !== nUnresolved; ++ i ) {

						var uuid = fixupStrings[ 2 * i ],
							key = fixupStrings[ 2 * i + 1 ],
							trg = fixupTargets[ i ];

						console.warn( trg, ".", key, "= <", uuid, ">" );

					}

				}


			} catch ( e ) {

				console.error( e.stack || e.stacktrace || e );

			}

			imported = null;
			fixup.length = 0;

			return result;

		};

} )();
