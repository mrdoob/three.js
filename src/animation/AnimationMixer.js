/**
 *
 * Player for AnimationClips.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

THREE.AnimationMixer = function( root ) {

	this._root = root;
	this._initMemoryManager();
	this._accuIndex = 0;

	this.time = 0;

	this.timeScale = 1.0;

};

THREE.AnimationMixer.prototype = {

	constructor: THREE.AnimationMixer,

	// return an action for a clip optionally using a custom root target
	// object (this method allocates a lot of dynamic memory in case a
	// previously unknown clip/root combination is specified)
	clipAction: function( clip, optionalRoot ) {

		var root = optionalRoot || this._root,
			rootUuid = root.uuid,
			clipName = ( typeof clip === 'string' ) ? clip : clip.name,
			clipObject = ( clip !== clipName ) ? clip : null,

			actionsForClip = this._actionsByClip[ clipName ],
			prototypeAction;

		if ( actionsForClip !== undefined ) {

			var existingAction =
					actionsForClip.actionByRoot[ rootUuid ];

			if ( existingAction !== undefined ) {

				return existingAction;

			}

			// we know the clip, so we don't have to parse all
			// the bindings again but can just copy
			prototypeAction = actionsForClip.knownActions[ 0 ];

			// also, take the clip from the prototype action
			clipObject = prototypeAction._clip;

			if ( clip !== clipName && clip !== clipObject ) {

				throw new Error(
						"Different clips with the same name detected!" );

			}

		}

		// clip must be known when specified via string
		if ( clipObject === null ) return null;

		// allocate all resources required to run it
		var newAction = new THREE.
				AnimationMixer._Action( this, clipObject, optionalRoot );

		this._bindAction( newAction, prototypeAction );

		// and make the action known to the memory manager
		this._addInactiveAction( newAction, clipName, rootUuid );

		return newAction;

	},

	// get an existing action
	existingAction: function( clip, optionalRoot ) {

		var root = optionalRoot || this._root,
			rootUuid = root.uuid,
			clipName = ( typeof clip === 'string' ) ? clip : clip.name,
			actionsForClip = this._actionsByClip[ clipName ];

		if ( actionsForClip !== undefined ) {

			return actionsForClip.actionByRoot[ rootUuid ] || null;

		}

		return null;

	},

	// deactivates all previously scheduled actions
	stopAllAction: function() {

		var actions = this._actions,
			nActions = this._nActiveActions,
			bindings = this._bindings,
			nBindings = this._nActiveBindings;

		this._nActiveActions = 0;
		this._nActiveBindings = 0;

		for ( var i = 0; i !== nActions; ++ i ) {

			actions[ i ].reset();

		}

		for ( var i = 0; i !== nBindings; ++ i ) {

			bindings[ i ].useCount = 0;

		}

		return this;

	},

	// advance the time and update apply the animation
	update: function( deltaTime ) {

		deltaTime *= this.timeScale;

		var actions = this._actions,
			nActions = this._nActiveActions,

			time = this.time += deltaTime,
			timeDirection = Math.sign( deltaTime ),

			accuIndex = this._accuIndex ^= 1;

		// run active actions

		for ( var i = 0; i !== nActions; ++ i ) {

			var action = actions[ i ];

			if ( action.enabled ) {

				action._update( time, deltaTime, timeDirection, accuIndex );

			}

		}

		// update scene graph

		var bindings = this._bindings,
			nBindings = this._nActiveBindings;

		for ( var i = 0; i !== nBindings; ++ i ) {

			bindings[ i ].apply( accuIndex );

		}

		return this;

	},

	// return this mixer's root target object
	getRoot: function() {

		return this._root;

	},

	// free all resources specific to a particular clip
	uncacheClip: function( clip ) {

		var actions = this._actions,
			clipName = clip.name,
			actionsByClip = this._actionsByClip,
			actionsForClip = actionsByClip[ clipName ];

		if ( actionsForClip !== undefined ) {

			// note: just calling _removeInactiveAction would mess up the
			// iteration state and also require updating the state we can
			// just throw away

			var actionsToRemove = actionsForClip.knownActions;

			for ( var i = 0, n = actionsToRemove.length; i !== n; ++ i ) {

				var action = actionsToRemove[ i ];

				this._deactivateAction( action );

				var cacheIndex = action._cacheIndex,
					lastInactiveAction = actions[ actions.length - 1 ];

				action._cacheIndex = null;
				action._byClipCacheIndex = null;

				lastInactiveAction._cacheIndex = cacheIndex;
				actions[ cacheIndex ] = lastInactiveAction;
				actions.pop();

				this._removeInactiveBindingsForAction( action );

			}

			delete actionsByClip[ clipName ];

		}

	},

	// free all resources specific to a particular root target object
	uncacheRoot: function( root ) {

		var rootUuid = root.uuid,
			actionsByClip = this._actionsByClip;

		for ( var clipName in actionsByClip ) {

			var actionByRoot = actionsByClip[ clipName ].actionByRoot,
				action = actionByRoot[ rootUuid ];

			if ( action !== undefined ) {

				this._deactivateAction( action );
				this._removeInactiveAction( action );

			}

		}

		var bindingsByRoot = this._bindingsByRootAndName,
			bindingByName = bindingsByRoot[ rootUuid ];

		if ( bindingByName !== undefined ) {

			for ( var trackName in bindingByName ) {

				var binding = bindingByName[ trackName ];
				binding.restoreOriginalState();
				this._removeInactiveBinding( binding );

			}

		}

	},

	// remove a targeted clip from the cache
	uncacheAction: function( clip, optionalRoot ) {

		var action = this.existingAction( clip, optionalRoot );

		if ( action !== null ) {

			this._deactivateAction( action );
			this._removeInactiveAction( action );

		}

	}

};

THREE.EventDispatcher.prototype.apply( THREE.AnimationMixer.prototype );

THREE.AnimationMixer._Action =
		function( mixer, clip, localRoot ) {

	this._mixer = mixer;
	this._clip = clip;
	this._localRoot = localRoot || null;

	var tracks = clip.tracks,
		nTracks = tracks.length,
		interpolants = new Array( nTracks );

	var interpolantSettings = {
			endingStart: 	THREE.ZeroCurvatureEnding,
			endingEnd:		THREE.ZeroCurvatureEnding
	};

	for ( var i = 0; i !== nTracks; ++ i ) {

		var interpolant = tracks[ i ].createInterpolant( null );
		interpolants[ i ] = interpolant;
		interpolant.settings = interpolantSettings

	}

	this._interpolantSettings = interpolantSettings;

	this._interpolants = interpolants;	// bound by the mixer

	// inside: PropertyMixer (managed by the mixer)
	this._propertyBindings = new Array( nTracks );

	this._cacheIndex = null;			// for the memory manager
	this._byClipCacheIndex = null;		// for the memory manager

	this._timeScaleInterpolant = null;
	this._weightInterpolant = null;

	this.loop = THREE.LoopRepeat;
	this._loopCount = -1;

	// global mixer time when the action is to be started
	// it's set back to 'null' upon start of the action
	this._startTime = null;

	// scaled local time of the action
	// gets clamped or wrapped to 0..clip.duration according to loop
	this.time = 0;

	this.timeScale = 1;
	this._effectiveTimeScale = 1;

	this.weight = 1;
	this._effectiveWeight = 1;

	this.repetitions = Infinity; 		// no. of repetitions when looping

	this.paused = false;				// false -> zero effective time scale
	this.enabled = true;				// true -> zero effective weight

	this.clampWhenFinished 	= false;	// keep feeding the last frame?

	this.zeroSlopeAtStart 	= true;		// for smooth interpolation w/o separate
	this.zeroSlopeAtEnd		= true;		// clips for start, loop and end

};

THREE.AnimationMixer._Action.prototype = {

	constructor: THREE.AnimationMixer._Action,

	// State & Scheduling

	play: function() {

		this._mixer._activateAction( this );

		return this;

	},

	stop: function() {

		this._mixer._deactivateAction( this );

		return this.reset();

	},

	reset: function() {

		this.paused = false;
		this.enabled = true;

		this.time = 0;			// restart clip
		this._loopCount = -1;	// forget previous loops
		this._startTime = null;	// forget scheduling

		return this.stopFading().stopWarping();

	},

	isRunning: function() {

		var start = this._startTime;

		return this.enabled && ! this.paused && this.timeScale !== 0 &&
				this._startTime === null && this._mixer._isActiveAction( this )

	},

	// return true when play has been called
	isScheduled: function() {

		return this._mixer._isActiveAction( this );

	},

	startAt: function( time ) {

		this._startTime = time;

		return this;

	},

	setLoop: function( mode, repetitions ) {

		this.loop = mode;
		this.repetitions = repetitions;

		return this;

	},

	// Weight

	// set the weight stopping any scheduled fading
	// although .enabled = false yields an effective weight of zero, this
	// method does *not* change .enabled, because it would be confusing
	setEffectiveWeight: function( weight ) {

		this.weight = weight;

		// note: same logic as when updated at runtime
		this._effectiveWeight = this.enabled ? weight : 0;

		return this.stopFading();

	},

	// return the weight considering fading and .enabled
	getEffectiveWeight: function() {

		return this._effectiveWeight;

	},

	fadeIn: function( duration ) {

		return this._scheduleFading( duration, 0, 1 );

	},

	fadeOut: function( duration ) {

		return this._scheduleFading( duration, 1, 0 );

	},

	crossFadeFrom: function( fadeOutAction, duration, warp ) {

		var mixer = this._mixer;

		fadeOutAction.fadeOut( duration );
		this.fadeIn( duration );

		if( warp ) {

			var fadeInDuration = this._clip.duration,
				fadeOutDuration = fadeOutAction._clip.duration,

				startEndRatio = fadeOutDuration / fadeInDuration,
				endStartRatio = fadeInDuration / fadeOutDuration;

			fadeOutAction.warp( 1.0, startEndRatio, duration );
			this.warp( endStartRatio, 1.0, duration );

		}

		return this;

	},

	crossFadeTo: function( fadeInAction, duration, warp ) {

		return fadeInAction.crossFadeFrom( this, duration, warp );

	},

	stopFading: function() {

		var weightInterpolant = this._weightInterpolant;

		if ( weightInterpolant !== null ) {

			this._weightInterpolant = null;
			this._mixer._takeBackControlInterpolant( weightInterpolant );

		}

		return this;

	},

	// Time Scale Control

	// set the weight stopping any scheduled warping
	// although .paused = true yields an effective time scale of zero, this
	// method does *not* change .paused, because it would be confusing
	setEffectiveTimeScale: function( timeScale ) {

		this.timeScale = timeScale;
		this._effectiveTimeScale = this.paused ? 0 :timeScale;

		return this.stopWarping();

	},

	// return the time scale considering warping and .paused
	getEffectiveTimeScale: function() {

		return this._effectiveTimeScale;

	},

	setDuration: function( duration ) {

		this.timeScale = this._clip.duration / duration;

		return this.stopWarping();

	},

	syncWith: function( action ) {

		this.time = action.time;
		this.timeScale = action.timeScale;

		return this.stopWarping();

	},

	halt: function( duration ) {

		return this.warp( this._currentTimeScale, 0, duration );

	},

	warp: function( startTimeScale, endTimeScale, duration ) {

		var mixer = this._mixer, now = mixer.time,
			interpolant = this._timeScaleInterpolant,

			timeScale = this.timeScale;

		if ( interpolant === null ) {

			interpolant = mixer._lendControlInterpolant(),
			this._timeScaleInterpolant = interpolant;

		}

		var times = interpolant.parameterPositions,
			values = interpolant.sampleValues;

		times[ 0 ] = now;
		times[ 1 ] = now + duration;

		values[ 0 ] = startTimeScale / timeScale;
		values[ 1 ] = endTimeScale / timeScale;

		return this;

	},

	stopWarping: function() {

		var timeScaleInterpolant = this._timeScaleInterpolant;

		if ( timeScaleInterpolant !== null ) {

			this._timeScaleInterpolant = null;
			this._mixer._takeBackControlInterpolant( timeScaleInterpolant );

		}

		return this;

	},

	// Object Accessors

	getMixer: function() {

		return this._mixer;

	},

	getClip: function() {

		return this._clip;

	},

	getRoot: function() {

		return this._localRoot || this._mixer._root;

	},

	// Interna

	_update: function( time, deltaTime, timeDirection, accuIndex ) {
		// called by the mixer

		var startTime = this._startTime;

		if ( startTime !== null ) {

			// check for scheduled start of action

			var timeRunning = ( time - startTime ) * timeDirection;
			if ( timeRunning < 0 || timeDirection === 0 ) {

				return; // yet to come / don't decide when delta = 0

			}

			// start

			this._startTime = null; // unschedule
			deltaTime = timeDirection * timeRunning;

		}

		// apply time scale and advance time

		deltaTime *= this._updateTimeScale( time );
		var clipTime = this._updateTime( deltaTime );

		// note: _updateTime may disable the action resulting in
		// an effective weight of 0

		var weight = this._updateWeight( time );

		if ( weight > 0 ) {

			var interpolants = this._interpolants;
			var propertyMixers = this._propertyBindings;

			for ( var j = 0, m = interpolants.length; j !== m; ++ j ) {

				interpolants[ j ].evaluate( clipTime );
				propertyMixers[ j ].accumulate( accuIndex, weight );

			}

		}

	},

	_updateWeight: function( time ) {

		var weight = 0;

		if ( this.enabled ) {

			weight = this.weight;
			var interpolant = this._weightInterpolant;

			if ( interpolant !== null ) {

				var interpolantValue = interpolant.evaluate( time )[ 0 ];

				weight *= interpolantValue;

				if ( time > interpolant.parameterPositions[ 1 ] ) {

					this.stopFading();

					if ( interpolantValue === 0 ) {

						// faded out, disable
						this.enabled = false;

					}

				}

			}

		}

		this._effectiveWeight = weight;
		return weight;

	},

	_updateTimeScale: function( time ) {

		var timeScale = 0;

		if ( ! this.paused ) {

			timeScale = this.timeScale;

			var interpolant = this._timeScaleInterpolant;

			if ( interpolant !== null ) {

				var interpolantValue = interpolant.evaluate( time )[ 0 ];

				timeScale *= interpolantValue;

				if ( time > interpolant.parameterPositions[ 1 ] ) {

					this.stopWarping();

					if ( timeScale === 0 ) {

						// motion has halted, pause
						this.pause = true;

					} else {

						// warp done - apply final time scale
						this.timeScale = timeScale;

					}

				}

			}

		}

		this._effectiveTimeScale = timeScale;
		return timeScale;

	},

	_updateTime: function( deltaTime ) {

		var time = this.time + deltaTime;

		if ( deltaTime === 0 ) return time;

		var duration = this._clip.duration,

			loop = this.loop,
			loopCount = this._loopCount,

			pingPong = false;

		switch ( loop ) {

			case THREE.LoopOnce:

				if ( loopCount === -1 ) {

					// just started

					this.loopCount = 0;
					this._setEndings( true, true, false );

				}

				if ( time >= duration ) {

					time = duration;

				} else if ( time < 0 ) {

					time = 0;

				} else break;

				// reached the end

				if ( this.clampWhenFinished ) this.pause = true;
				else this.enabled = false;

				this._mixer.dispatchEvent( {
					type: 'finished', action: this,
					direction: deltaTime < 0 ? -1 : 1
				} );

				break;

			case THREE.LoopPingPong:

				pingPong = true;

			case THREE.LoopRepeat:

				if ( loopCount === -1 ) {

					// just started

					if ( deltaTime > 0 ) {

						loopCount = 0;

						this._setEndings(
								true, this.repetitions === 0, pingPong );

					} else {

						// when looping in reverse direction, the initial
						// transition through zero counts as a repetition,
						// so leave loopCount at -1

						this._setEndings(
								this.repetitions === 0, true, pingPong );

					}

				}

				if ( time >= duration || time < 0 ) {

					// wrap around

					var loopDelta = Math.floor( time / duration ); // signed
					time -= duration * loopDelta;

					loopCount += Math.abs( loopDelta );

					var pending = this.repetitions - loopCount;

					if ( pending < 0 ) {

						// stop (switch state, clamp time, fire event)

						if ( this.clampWhenFinished ) this.paused = true;
						else this.enabled = false;

						time = deltaTime > 0 ? duration : 0;

						this._mixer.dispatchEvent( {
							type: 'finished', action: this,
							direction: deltaTime > 0 ? 1 : -1
						} );

						break;

					} else if ( pending === 0 ) {

						// transition to last round

						var atStart = deltaTime < 0;
						this._setEndings( atStart, ! atStart, pingPong );

					} else {

						this._setEndings( false, false, pingPong );

					}

					this._loopCount = loopCount;

					this._mixer.dispatchEvent( {
						type: 'loop', action: this, loopDelta: loopDelta
					} );

				}

				if ( loop === THREE.LoopPingPong && ( loopCount & 1 ) === 1 ) {

					// invert time for the "pong round"

					this.time = time;

					return duration - time;

				}

				break;

		}

		this.time = time;

		return time;

	},

	_setEndings: function( atStart, atEnd, pingPong ) {

		var settings = this._interpolantSettings;

		if ( pingPong ) {

			settings.endingStart 	= THREE.ZeroSlopeEnding;
			settings.endingEnd		= THREE.ZeroSlopeEnding;

		} else {

			// assuming for LoopOnce atStart == atEnd == true

			if ( atStart ) {

				settings.endingStart = this.zeroSlopeAtStart ?
						THREE.ZeroSlopeEnding : THREE.ZeroCurvatureEnding;

			} else {

				settings.endingStart = THREE.WrapAroundEnding;

			}

			if ( atEnd ) {

				settings.endingEnd = this.zeroSlopeAtEnd ?
						THREE.ZeroSlopeEnding : THREE.ZeroCurvatureEnding;

			} else {

				settings.endingEnd 	 = THREE.WrapAroundEnding;

			}

		}

	},

	_scheduleFading: function( duration, weightNow, weightThen ) {

		var mixer = this._mixer, now = mixer.time,
			interpolant = this._weightInterpolant;

		if ( interpolant === null ) {

			interpolant = mixer._lendControlInterpolant(),
			this._weightInterpolant = interpolant;

		}

		var times = interpolant.parameterPositions,
			values = interpolant.sampleValues;

		times[ 0 ] = now; 				values[ 0 ] = weightNow;
		times[ 1 ] = now + duration;	values[ 1 ] = weightThen;

		return this;

	}

};

// Implementation details:

Object.assign( THREE.AnimationMixer.prototype, {

	_bindAction: function( action, prototypeAction ) {

		var root = action._localRoot || this._root,
			tracks = action._clip.tracks,
			nTracks = tracks.length,
			bindings = action._propertyBindings,
			interpolants = action._interpolants,
			rootUuid = root.uuid,
			bindingsByRoot = this._bindingsByRootAndName,
			bindingsByName = bindingsByRoot[ rootUuid ];

		if ( bindingsByName === undefined ) {

			bindingsByName = {};
			bindingsByRoot[ rootUuid ] = bindingsByName;

		}

		for ( var i = 0; i !== nTracks; ++ i ) {

			var track = tracks[ i ],
				trackName = track.name,
				binding = bindingsByName[ trackName ];

			if ( binding !== undefined ) {

				bindings[ i ] = binding;

			} else {

				binding = bindings[ i ];

				if ( binding !== undefined ) {

					// existing binding, make sure the cache knows

					if ( binding._cacheIndex === null ) {

						++ binding.referenceCount;
						this._addInactiveBinding( binding, rootUuid, trackName );

					}

					continue;

				}

				var path = prototypeAction && prototypeAction.
						_propertyBindings[ i ].binding.parsedPath;

				binding = new THREE.PropertyMixer(
						THREE.PropertyBinding.create( root, trackName, path ),
						track.ValueTypeName, track.getValueSize() );

				++ binding.referenceCount;
				this._addInactiveBinding( binding, rootUuid, trackName );

				bindings[ i ] = binding;

			}

			interpolants[ i ].resultBuffer = binding.buffer;

		}

	},

	_activateAction: function( action ) {

		if ( ! this._isActiveAction( action ) ) {

			if ( action._cacheIndex === null ) {

				// this action has been forgotten by the cache, but the user
				// appears to be still using it -> rebind

				var rootUuid = ( action._localRoot || this._root ).uuid,
					clipName = action._clip.name,
					actionsForClip = this._actionsByClip[ clipName ];

				this._bindAction( action,
						actionsForClip && actionsForClip.knownActions[ 0 ] );

				this._addInactiveAction( action, clipName, rootUuid );

			}

			var bindings = action._propertyBindings;

			// increment reference counts / sort out state
			for ( var i = 0, n = bindings.length; i !== n; ++ i ) {

				var binding = bindings[ i ];

				if ( binding.useCount ++ === 0 ) {

					this._lendBinding( binding );
					binding.saveOriginalState();

				}

			}

			this._lendAction( action );

		}

	},

	_deactivateAction: function( action ) {

		if ( this._isActiveAction( action ) ) {

			var bindings = action._propertyBindings;

			// decrement reference counts / sort out state
			for ( var i = 0, n = bindings.length; i !== n; ++ i ) {

				var binding = bindings[ i ];

				if ( -- binding.useCount === 0 ) {

					binding.restoreOriginalState();
					this._takeBackBinding( binding );

				}

			}

			this._takeBackAction( action );

		}

	},

	// Memory manager

	_initMemoryManager: function() {

		this._actions = []; // 'nActiveActions' followed by inactive ones
		this._nActiveActions = 0;

		this._actionsByClip = {};
		// inside:
		// {
		// 		knownActions: Array< _Action >	- used as prototypes
		// 		actionByRoot: _Action			- lookup
		// }


		this._bindings = []; // 'nActiveBindings' followed by inactive ones
		this._nActiveBindings = 0;

		this._bindingsByRootAndName = {}; // inside: Map< name, PropertyMixer >


		this._controlInterpolants = []; // same game as above
		this._nActiveControlInterpolants = 0;

		var scope = this;

		this.stats = {

			actions: {
				get total() { return scope._actions.length; },
				get inUse() { return scope._nActiveActions; }
			},
			bindings: {
				get total() { return scope._bindings.length; },
				get inUse() { return scope._nActiveBindings; }
			},
			controlInterpolants: {
				get total() { return scope._controlInterpolants.length; },
				get inUse() { return scope._nActiveControlInterpolants; }
			}

		};

	},

	// Memory management for _Action objects

	_isActiveAction: function( action ) {

		var index = action._cacheIndex;
		return index !== null && index < this._nActiveActions;

	},

	_addInactiveAction: function( action, clipName, rootUuid ) {

		var actions = this._actions,
			actionsByClip = this._actionsByClip,
			actionsForClip = actionsByClip[ clipName ];

		if ( actionsForClip === undefined ) {

			actionsForClip = {

				knownActions: [ action ],
				actionByRoot: {}

			};

			action._byClipCacheIndex = 0;

			actionsByClip[ clipName ] = actionsForClip;

		} else {

			var knownActions = actionsForClip.knownActions;

			action._byClipCacheIndex = knownActions.length;
			knownActions.push( action );

		}

		action._cacheIndex = actions.length;
		actions.push( action );

		actionsForClip.actionByRoot[ rootUuid ] = action;

	},

	_removeInactiveAction: function( action ) {

		var actions = this._actions,
			lastInactiveAction = actions[ actions.length - 1 ],
			cacheIndex = action._cacheIndex;

		lastInactiveAction._cacheIndex = cacheIndex;
		actions[ cacheIndex ] = lastInactiveAction;
		actions.pop();

		action._cacheIndex = null;


		var clipName = action._clip.name,
			actionsByClip = this._actionsByClip,
			actionsForClip = actionsByClip[ clipName ],
			knownActionsForClip = actionsForClip.knownActions,

			lastKnownAction =
				knownActionsForClip[ knownActionsForClip.length - 1 ],

			byClipCacheIndex = action._byClipCacheIndex;

		lastKnownAction._byClipCacheIndex = byClipCacheIndex;
		knownActionsForClip[ byClipCacheIndex ] = lastKnownAction;
		knownActionsForClip.pop();

		action._byClipCacheIndex = null;


		var actionByRoot = actionsForClip.actionByRoot,
			rootUuid = ( actions._localRoot || this._root ).uuid;

		delete actionByRoot[ rootUuid ];

		if ( knownActionsForClip.length === 0 ) {

			delete actionsByClip[ clipName ];

		}

		this._removeInactiveBindingsForAction( action );

	},

	_removeInactiveBindingsForAction: function( action ) {

		var bindings = action._propertyBindings;
		for ( var i = 0, n = bindings.length; i !== n; ++ i ) {

			var binding = bindings[ i ];

			if ( -- binding.referenceCount === 0 ) {

				this._removeInactiveBinding( binding );

			}

		}

	},

	_lendAction: function( action ) {

		// [ active actions |  inactive actions  ]
		// [  active actions >| inactive actions ]
		//                 s        a
		//                  <-swap->
		//                 a        s

		var actions = this._actions,
			prevIndex = action._cacheIndex,

			lastActiveIndex = this._nActiveActions ++,

			firstInactiveAction = actions[ lastActiveIndex ];

		action._cacheIndex = lastActiveIndex;
		actions[ lastActiveIndex ] = action;

		firstInactiveAction._cacheIndex = prevIndex;
		actions[ prevIndex ] = firstInactiveAction;

	},

	_takeBackAction: function( action ) {

		// [  active actions  | inactive actions ]
		// [ active actions |< inactive actions  ]
		//        a        s
		//         <-swap->
		//        s        a

		var actions = this._actions,
			prevIndex = action._cacheIndex,

			firstInactiveIndex = -- this._nActiveActions,

			lastActiveAction = actions[ firstInactiveIndex ];

		action._cacheIndex = firstInactiveIndex;
		actions[ firstInactiveIndex ] = action;

		lastActiveAction._cacheIndex = prevIndex;
		actions[ prevIndex ] = lastActiveAction;

	},

	// Memory management for PropertyMixer objects

	_addInactiveBinding: function( binding, rootUuid, trackName ) {

		var bindingsByRoot = this._bindingsByRootAndName,
			bindingByName = bindingsByRoot[ rootUuid ],

			bindings = this._bindings;

		if ( bindingByName === undefined ) {

			bindingByName = {};
			bindingsByRoot[ rootUuid ] = bindingByName;

		}

		bindingByName[ trackName ] = binding;

		binding._cacheIndex = bindings.length;
		bindings.push( binding );

	},

	_removeInactiveBinding: function( binding ) {

		var bindings = this._bindings,
			propBinding = binding.binding,
			rootUuid = propBinding.rootNode.uuid,
			trackName = propBinding.path,
			bindingsByRoot = this._bindingsByRootAndName,
			bindingByName = bindingsByRoot[ rootUuid ],

			lastInactiveBinding = bindings[ bindings.length - 1 ],
			cacheIndex = binding._cacheIndex;

		lastInactiveBinding._cacheIndex = cacheIndex;
		bindings[ cacheIndex ] = lastInactiveBinding;
		bindings.pop();

		delete bindingByName[ trackName ];

		remove_empty_map: {

			for ( var _ in bindingByName ) break remove_empty_map;

			delete bindingsByRoot[ rootUuid ];

		}

	},

	_lendBinding: function( binding ) {

		var bindings = this._bindings,
			prevIndex = binding._cacheIndex,

			lastActiveIndex = this._nActiveBindings ++,

			firstInactiveBinding = bindings[ lastActiveIndex ];

		binding._cacheIndex = lastActiveIndex;
		bindings[ lastActiveIndex ] = binding;

		firstInactiveBinding._cacheIndex = prevIndex;
		bindings[ prevIndex ] = firstInactiveBinding;

	},

	_takeBackBinding: function( binding ) {

		var bindings = this._bindings,
			prevIndex = binding._cacheIndex,

			firstInactiveIndex = -- this._nActiveBindings,

			lastActiveBinding = bindings[ firstInactiveIndex ];

		binding._cacheIndex = firstInactiveIndex;
		bindings[ firstInactiveIndex ] = binding;

		lastActiveBinding._cacheIndex = prevIndex;
		bindings[ prevIndex ] = lastActiveBinding;

	},


	// Memory management of Interpolants for weight and time scale

	_lendControlInterpolant: function() {

		var interpolants = this._controlInterpolants,
			lastActiveIndex = this._nActiveControlInterpolants ++,
			interpolant = interpolants[ lastActiveIndex ];

		if ( interpolant === undefined ) {

			interpolant = new THREE.LinearInterpolant(
					new Float32Array( 2 ), new Float32Array( 2 ),
						1, this._controlInterpolantsResultBuffer );

			interpolant.__cacheIndex = lastActiveIndex;
			interpolants[ lastActiveIndex ] = interpolant;

		}

		return interpolant;

	},

	_takeBackControlInterpolant: function( interpolant ) {

		var interpolants = this._controlInterpolants,
			prevIndex = interpolant.__cacheIndex,

			firstInactiveIndex = -- this._nActiveControlInterpolants,

			lastActiveInterpolant = interpolants[ firstInactiveIndex ];

		interpolant.__cacheIndex = firstInactiveIndex;
		interpolants[ firstInactiveIndex ] = interpolant;

		lastActiveInterpolant.__cacheIndex = prevIndex;
		interpolants[ prevIndex ] = lastActiveInterpolant;

	},

	_controlInterpolantsResultBuffer: new Float32Array( 1 )

} );

