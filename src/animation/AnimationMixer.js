/**
 *
 * Sequencer that performs AnimationActions, mixes their results and updates
 * the scene graph.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

THREE.AnimationMixer = function( root ) {

	this.root = root;
	this.uuid = THREE.Math.generateUUID();

	this.time = 0;
	this.timeScale = 1.0;

	this._actions = [];

	this._bindingsMaps = {}; // contains a path -> prop_mixer map per root.uuid

	this._bindings = []; // array of all bindings with refCnt != 0
	this._bindingsDirty = false; // whether we need to rebuild the array

	this._accuIndex = 0;

};

THREE.AnimationMixer.prototype = {

	constructor: THREE.AnimationMixer,

	addAction: function( action ) {

		if ( this._actions.indexOf( action ) !== -1 ) {

			return; // action is already added - do nothing

		}

		var root = action.localRoot || this.root,
			rootUuid = root.uuid,

			bindingsMap = this._bindingsMaps[ rootUuid ];

		if ( bindingsMap === undefined ) {

			bindingsMap = {};
			this._bindingsMaps[ rootUuid ] = bindingsMap;

		}

		var interpolants = action._interpolants,
			actionBindings = action._propertyBindings,

			tracks = action.clip.tracks,
			bindingsChanged = false,

			myUuid = this.uuid,
			prevRootUuid = action._prevRootUuid,

			rootSwitchValid =
				prevRootUuid !== rootUuid &&
				action._prevMixerUuid === myUuid,

			prevRootBindingsMap;

		if ( rootSwitchValid ) {

			// in this case we try to transfer currently unused
			// context infrastructure from the previous root

			prevRootBindingsMap = this._bindingsMaps[ prevRootUuid ];

		}

		for ( var i = 0, n = tracks.length; i !== n; ++ i ) {

			var track = tracks[ i ];

			var trackName = track.name;
			var propertyMixer = bindingsMap[ trackName ];

			if ( rootSwitchValid && propertyMixer === undefined ) {

				var candidate = prevRootBindingsMap[ trackName ];

				if ( candidate !== undefined &&
						candidate.referenceCount === 0 ) {

					propertyMixer = candidate;

					// no longer use with the old root!
					delete prevRootBindingsMap[ trackName ];

					propertyMixer.binding.setRootNode( root );

					bindingsMap[ trackName ] = propertyMixer;

				}

			}

			if ( propertyMixer === undefined ) {

				propertyMixer = new THREE.PropertyMixer(
						root, trackName,
						track.ValueTypeName, track.getValueSize() );

				bindingsMap[ trackName ] = propertyMixer;

			}

			if ( propertyMixer.referenceCount === 0 ) {

				propertyMixer.saveOriginalState();
				bindingsChanged = true;

			}

			++ propertyMixer.referenceCount;

			interpolants[ i ].result = propertyMixer.buffer;
			actionBindings[ i ] = propertyMixer;

		}

		if ( bindingsChanged ) {

			this._bindingsDirty = true; // invalidates this._bindings

		}

		action.mixer = this;
		action._prevRootUuid = rootUuid;
		action._prevMixerUuid = myUuid;

		// TODO: check for duplicate action names?
		// Or provide each action with a UUID?
		this._actions.push( action );

		action.init( this.time );

		return this;

	},

	removeAction: function( action ) {

		var actions = this._actions,
			index = actions.indexOf( action );

		if ( index === - 1 ) {

			return this; // we don't know this action - do nothing

		}

		// unreference all property mixers
		var interpolants = action._interpolants,
			actionBindings = action._propertyBindings,
			rootUuid = ( action.localRoot || this.root ).uuid,
			bindings = this._bindingsMaps[ rootUuid ],

			bindingsChanged = false;

		for( var i = 0, n = actionBindings.length; i !== n; ++ i ) {

			var propertyMixer = actionBindings[ i ];
			actionBindings[ i ] = null;

			interpolants[ i ].result = null;

			// eventually remove the binding from the array
			if( -- propertyMixer.referenceCount === 0 ) {

				propertyMixer.restoreOriginalState();
				bindingsChanged = true;

			}

		}

		if ( bindingsChanged ) {

			this._bindingsDirty = true; // invalidates this._bindings

		}

		// remove from array-based unordered set
		actions[ index ] = actions[ actions.length - 1 ];
		actions.pop();

		action.mixer = null;

		return this;

	},

	removeAllActions: function() {

		if ( this._bindingsDirty ) {

			this._updateBindings();

		}

		var bindings = this._bindings; // all bindings currently in use

		for ( var i = 0, n = bindings.length; i !== n; ++ i ) {

			var binding = bindings[ i ];
			binding.referenceCount = 0;
			binding.restoreOriginalState();

		}

		bindings.length = 0;

		this._bindingsDirty = false;

		var actions = this._actions;

		for ( var i = 0, n = actions.length; i !== n; ++ i ) {

			actions[ i ].mixer = null;

		}

		actions.length = 0;

		return this;

	},


	// can be optimized if needed
	findActionByName: function( name ) {

		var actions = this._actions;

		for ( var i = 0, n = actions.length; i !== n; ++ i ) {

			var action = actions[ i ];
			var actionName = action.getName();

			if( name === actionName ) return action;

		}

		return null;

	},

	play: function( action, optionalFadeInDuration ) {

		action.startTime = this.time;
		this.addAction( action );

		return this;

	},

	fadeOut: function( action, duration ) {

		var time = this.time,
			times = Float64Array.of( time, time + duration );

		action.weight = new THREE.LinearInterpolant(
				times, this._FadeOutValues, 1, this._tmp );

		return this;

	},

	fadeIn: function( action, duration ) {

		var time = this.time,
			times = Float64Array.of( time, time + duration );

		action.weight = new THREE.LinearInterpolant(
				times, this._FadeInValues, 1, this._tmp );

		return this;

	},

	warp: function( action, startTimeScale, endTimeScale, duration ) {

		var time = this.time,
			times = Float64Array.of( time, time + duration ),
			values = Float64Array.of( startTimeScale, endTimeScale );

		action.timeScale = new THREE.LinearInterpolant( times, values, 1, this._tmp );

		return this;

	},

	crossFade: function( fadeOutAction, fadeInAction, duration, warp ) {

		this.fadeOut( fadeOutAction, duration );
		this.fadeIn( fadeInAction, duration );

		if( warp ) {

			var startEndRatio = fadeOutAction.clip.duration / fadeInAction.clip.duration;
			var endStartRatio = 1.0 / startEndRatio;

			this.warp( fadeOutAction, 1.0, startEndRatio, duration );
			this.warp( fadeInAction, endStartRatio, 1.0, duration );

		}

		return this;

	},

	update: function( deltaTime ) {

		var actions = this._actions,
			mixerDeltaTime = deltaTime * this.timeScale;

		var time = this.time += mixerDeltaTime;
		var accuIndex = this.accuIndex ^= 1;

		// perform all actions

		for ( var i = 0, n = actions.length; i !== n; ++ i ) {

			var action = actions[ i ];
			if ( ! action.enabled ) continue;

			var weight = action.getWeightAt( time );
			if ( weight <= 0 ) continue;

			var actionTimeScale = action.getTimeScaleAt( time );
			var actionTime = action.updateTime( mixerDeltaTime * actionTimeScale );

			var interpolants = action._interpolants;
			var propertyMixers = action._propertyBindings;

			for ( var j = 0, m = interpolants.length; j !== m; ++ j ) {

				interpolants[ j ].getAt( actionTime );
				propertyMixers[ j ].accumulate( accuIndex, weight );

			}

		}

		if ( this._bindingsDirty ) {

			this._updateBindings();
			this._bindingsDirty = false;

		}

		var bindings = this._bindings;
		for ( var i = 0, n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].apply( accuIndex );

		}

		return this;

	},

	// releases cached references to scene graph nodes
	// pass 'true' for 'unbindOnly' to allow a quick rebind at
	// the expense of higher cost add / removeAction operations
	releaseCachedBindings: function( unbindOnly ) {

		var bindingsMaps = this._bindingsMaps;

		for ( var rootUuid in bindingsMaps ) {

			var bindingsMap = bindingsMaps[ rootUuid ];

			var mapChanged = false;

			for ( var trackName in bindingsMap ) {

				var propertyMixer = bindingsMap[ trackName ];

				if ( propertyMixer.referenceCount === 0 ) {

					if ( unbindOnly ) {

						propertyMixer.binding.unbind();

					} else {

						delete bindingsMap[ trackName ];
						mapChanged = true;

					}

				}

			}

			if ( mapChanged ) {

				// when bindingsMap became empty, remove it from bindingsMaps

				remove_empty_map: {

					for ( var k in bindingsMap ) break remove_empty_map;

					delete bindingsMaps[ rootUuid ];

				}

			}

		}

	},

	_updateBindings: function() {

		var bindingsMaps = this._bindingsMaps,
			bindings = this._bindings,
			writeIndex = 0;

		for ( var rootUuid in bindingsMaps ) {

			var bindingsMap = bindingsMaps[ rootUuid ];

			for ( var trackName in bindingsMap ) {

				var propertyMixer = bindingsMap[ trackName ];

				if ( propertyMixer.referenceCount !== 0 ) {

					bindings[ writeIndex ++ ] = propertyMixer;

				}

			}

		}

		bindings.length = writeIndex;

	},

	_FadeInValues: Float64Array.of( 0, 1 ),
	_FadeOutValues: Float64Array.of( 1, 0 ),

	_tmp: new Float64Array( 1 )

};

THREE.EventDispatcher.prototype.apply( THREE.AnimationMixer.prototype );
