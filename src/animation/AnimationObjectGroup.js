/**
 *
 * A group of objects that receives a shared animation state.
 *
 * Usage:
 *
 * 	-	Add objects you would otherwise pass as 'root' to the
 * 		constructor or the .clipAction method of AnimationMixer.
 *
 * 	-	Instead pass this object as 'root'.
 *
 * 	-	You can also add and remove objects later when the mixer
 * 		is running.
 *
 * Note:
 *
 *  	Objects of this class appear as one object to the mixer,
 *  	so cache control of the individual objects must be done
 *  	on the group.
 *
 * Limitation:
 *
 * 	- 	The animated properties must be compatible among the
 * 		all objects in the group.
 *
 *  -	A single property can either be controlled through a
 *  	target group or directly, but not both.
 *
 * @author tschw
 */

THREE.AnimationObjectGroup = function( var_args ) {

	this.uuid = THREE.Math.generateUUID();

	// cached objects followed by the active ones
	this._objects = Array.prototype.slice.call( arguments );

	this.nCachedObjects_ = 0;			// threshold
	// note: read by PropertyBinding.Composite

	var indices = {};
	this._indicesByUUID = indices;		// for bookkeeping

	for ( var i = 0, n = arguments.length; i !== n; ++ i ) {

		indices[ arguments[ i ].uuid ] = i;

	}

	this._paths = [];					// inside: string
	this._parsedPaths = [];				// inside: { we don't care, here }
	this._bindings = []; 				// inside: Array< PropertyBinding >
	this._bindingsIndicesByPath = {}; 	// inside: indices in these arrays

	var scope = this;

	this.stats = {

		objects: {
			get total() { return scope._objects.length; },
			get inUse() { return this.total - scope.nCachedObjects_;  }
		},

		get bindingsPerObject() { return scope._bindings.length; }

	};

};

THREE.AnimationObjectGroup.prototype = {

	constructor: THREE.AnimationObjectGroup,

	add: function( var_args ) {

		var objects = this._objects,
			nObjects = objects.length,
			nCachedObjects = this.nCachedObjects_,
			indicesByUUID = this._indicesByUUID,
			paths = this._paths,
			parsedPaths = this._parsedPaths,
			bindings = this._bindings,
			nBindings = bindings.length;

		for ( var i = 0, n = arguments.length; i !== n; ++ i ) {

			var object = arguments[ i ],
				uuid = object.uuid,
				index = indicesByUUID[ uuid ];

			if ( index === undefined ) {

				// unknown object -> add it to the ACTIVE region

				index = nObjects ++;
				indicesByUUID[ uuid ] = index;
				objects.push( object );

				// accounting is done, now do the same for all bindings

				for ( var j = 0, m = nBindings; j !== m; ++ j ) {

					bindings[ j ].push(
							new THREE.PropertyBinding(
								object, paths[ j ], parsedPaths[ j ] ) );

				}

			} else if ( index < nCachedObjects ) {

				var knownObject = objects[ index ];

				// move existing object to the ACTIVE region

				var firstActiveIndex = -- nCachedObjects,
					lastCachedObject = objects[ firstActiveIndex ];

				indicesByUUID[ lastCachedObject.uuid ] = index;
				objects[ index ] = lastCachedObject;

				indicesByUUID[ uuid ] = firstActiveIndex;
				objects[ firstActiveIndex ] = object;

				// accounting is done, now do the same for all bindings

				for ( var j = 0, m = nBindings; j !== m; ++ j ) {

					var bindingsForPath = bindings[ j ],
						lastCached = bindingsForPath[ firstActiveIndex ],
						binding = bindingsForPath[ index ];

					bindingsForPath[ index ] = lastCached;

					if ( binding === undefined ) {

						// since we do not bother to create new bindings
						// for objects that are cached, the binding may
						// or may not exist

						binding = new THREE.PropertyBinding(
								object, paths[ j ], parsedPaths[ j ] );

					}

					bindingsForPath[ firstActiveIndex ] = binding;

				}

			} else if ( objects[ index ] !== knownObject) {

				console.error( "Different objects with the same UUID " +
						"detected. Clean the caches or recreate your " +
						"infrastructure when reloading scenes..." );

			} // else the object is already where we want it to be

		} // for arguments

		this.nCachedObjects_ = nCachedObjects;

	},

	remove: function( var_args ) {

		var objects = this._objects,
			nObjects = objects.length,
			nCachedObjects = this.nCachedObjects_,
			indicesByUUID = this._indicesByUUID,
			bindings = this._bindings,
			nBindings = bindings.length;

		for ( var i = 0, n = arguments.length; i !== n; ++ i ) {

			var object = arguments[ i ],
				uuid = object.uuid,
				index = indicesByUUID[ uuid ];

			if ( index !== undefined && index >= nCachedObjects ) {

				// move existing object into the CACHED region

				var lastCachedIndex = nCachedObjects ++,
					firstActiveObject = objects[ lastCachedIndex ];

				indicesByUUID[ firstActiveObject.uuid ] = index;
				objects[ index ] = firstActiveObject;

				indicesByUUID[ uuid ] = lastCachedIndex;
				objects[ lastCachedIndex ] = object;

				// accounting is done, now do the same for all bindings

				for ( var j = 0, m = nBindings; j !== m; ++ j ) {

					var bindingsForPath = bindings[ j ],
						firstActive = bindingsForPath[ lastCachedIndex ],
						binding = bindingsForPath[ index ];

					bindingsForPath[ index ] = firstActive;
					bindingsForPath[ lastCachedIndex ] = binding;

				}

			}

		} // for arguments

		this.nCachedObjects_ = nCachedObjects;

	},

	// remove & forget
	uncache: function( var_args ) {

		var objects = this._objects,
			nObjects = objects.length,
			nCachedObjects = this.nCachedObjects_,
			indicesByUUID = this._indicesByUUID,
			bindings = this._bindings,
			nBindings = bindings.length;

		for ( var i = 0, n = arguments.length; i !== n; ++ i ) {

			var object = arguments[ i ],
				uuid = object.uuid,
				index = indicesByUUID[ uuid ];

			if ( index !== undefined ) {

				delete indicesByUUID[ uuid ];

				if ( index < nCachedObjects ) {

					// object is cached, shrink the CACHED region

					var firstActiveIndex = -- nCachedObjects,
						lastCachedObject = objects[ firstActiveIndex ],
						lastIndex = -- nObjects,
						lastObject = objects[ lastIndex ];

					// last cached object takes this object's place
					indicesByUUID[ lastCachedObject.uuid ] = index;
					objects[ index ] = lastCachedObject;

					// last object goes to the activated slot and pop
					indicesByUUID[ lastObject.uuid ] = firstActiveIndex;
					objects[ firstActiveIndex ] = lastObject;
					objects.pop();

					// accounting is done, now do the same for all bindings

					for ( var j = 0, m = nBindings; j !== m; ++ j ) {

						var bindingsForPath = bindings[ j ],
							lastCached = bindingsForPath[ firstActiveIndex ],
							last = bindingsForPath[ lastIndex ];

						bindingsForPath[ index ] = lastCached;
						bindingsForPath[ firstActiveIndex ] = last;
						bindingsForPath.pop();

					}

				} else {

					// object is active, just swap with the last and pop

					var lastIndex = -- nObjects,
						lastObject = objects[ lastIndex ];

					indicesByUUID[ lastObject.uuid ] = index;
					objects[ index ] = lastObject;
					objects.pop();

					// accounting is done, now do the same for all bindings

					for ( var j = 0, m = nBindings; j !== m; ++ j ) {

						var bindingsForPath = bindings[ j ];

						bindingsForPath[ index ] = bindingsForPath[ lastIndex ];
						bindingsForPath.pop();

					}

				} // cached or active

			} // if object is known

		} // for arguments

		this.nCachedObjects_ = nCachedObjects;

	},

	// Internal interface used by befriended PropertyBinding.Composite:

	subscribe_: function( path, parsedPath ) {
		// returns an array of bindings for the given path that is changed
		// according to the contained objects in the group

		var indicesByPath = this._bindingsIndicesByPath,
			index = indicesByPath[ path ],
			bindings = this._bindings;

		if ( index !== undefined ) return bindings[ index ];

		var paths = this._paths,
			parsedPaths = this._parsedPaths,
			objects = this._objects,
			nObjects = objects.length,
			nCachedObjects = this.nCachedObjects_,
			bindingsForPath = new Array( nObjects );

		index = bindings.length;

		indicesByPath[ path ] = index;

		paths.push( path );
		parsedPaths.push( parsedPath );
		bindings.push( bindingsForPath );

		for ( var i = nCachedObjects,
				n = objects.length; i !== n; ++ i ) {

			var object = objects[ i ];

			bindingsForPath[ i ] =
					new THREE.PropertyBinding( object, path, parsedPath );

		}

		return bindingsForPath;

	},

	unsubscribe_: function( path ) {
		// tells the group to forget about a property path and no longer
		// update the array previously obtained with 'subscribe_'

		var indicesByPath = this._bindingsIndicesByPath,
			index = indicesByPath[ path ];

		if ( index !== undefined ) {

			var paths = this._paths,
				parsedPaths = this._parsedPaths,
				bindings = this._bindings,
				lastBindingsIndex = bindings.length - 1,
				lastBindings = bindings[ lastBindingsIndex ],
				lastBindingsPath = path[ lastBindingsIndex ];

			indicesByPath[ lastBindingsPath ] = index;

			bindings[ index ] = lastBindings;
			bindings.pop();

			parsedPaths[ index ] = parsedPaths[ lastBindingsIndex ];
			parsedPaths.pop();

			paths[ index ] = paths[ lastBindingsIndex ];
			paths.pop();

		}

	}

};

