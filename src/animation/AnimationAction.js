import { WrapAroundEnding, ZeroCurvatureEnding, ZeroSlopeEnding, LoopPingPong, LoopOnce, LoopRepeat, NormalAnimationBlendMode, AdditiveAnimationBlendMode } from '../constants.js';

/**
 * An instance of `AnimationAction` schedules the playback of an animation which is
 * stored in {@link AnimationClip}.
 */
class AnimationAction {

	/**
	 * Constructs a new animation action.
	 *
	 * @param {AnimationMixer} mixer - The mixer that is controlled by this action.
	 * @param {AnimationClip} clip - The animation clip that holds the actual keyframes.
	 * @param {?Object3D} [localRoot=null] - The root object on which this action is performed.
	 * @param {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)} [blendMode] - The blend mode.
	 */
	constructor( mixer, clip, localRoot = null, blendMode = clip.blendMode ) {

		this._mixer = mixer;
		this._clip = clip;
		this._localRoot = localRoot;

		/**
		 * Defines how the animation is blended/combined when two or more animations
		 * are simultaneously played.
		 *
		 * @type {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)}
		 */
		this.blendMode = blendMode;

		const tracks = clip.tracks,
			nTracks = tracks.length,
			interpolants = new Array( nTracks );

		const interpolantSettings = {
			endingStart: ZeroCurvatureEnding,
			endingEnd: ZeroCurvatureEnding
		};

		for ( let i = 0; i !== nTracks; ++ i ) {

			const interpolant = tracks[ i ].createInterpolant( null );
			interpolants[ i ] = interpolant;
			interpolant.settings = interpolantSettings;

		}

		this._interpolantSettings = interpolantSettings;

		this._interpolants = interpolants; // bound by the mixer

		// inside: PropertyMixer (managed by the mixer)
		this._propertyBindings = new Array( nTracks );

		this._cacheIndex = null; // for the memory manager
		this._byClipCacheIndex = null; // for the memory manager

		this._timeScaleInterpolant = null;
		this._weightInterpolant = null;

		/**
		 * The loop mode, set via {@link AnimationAction#setLoop}.
		 *
		 * @type {(LoopRepeat|LoopOnce|LoopPingPong)}
		 * @default LoopRepeat
		 */
		this.loop = LoopRepeat;
		this._loopCount = - 1;

		// global mixer time when the action is to be started
		// it's set back to 'null' upon start of the action
		this._startTime = null;

		/**
		 * The local time of this action (in seconds, starting with `0`).
		 *
		 * The value gets clamped or wrapped to `[0,clip.duration]` (according to the
		 * loop state).
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.time = 0;

		/**
		 * Scaling factor for the {@link AnimationAction#time}. A value of `0` causes the
		 * animation to pause. Negative values cause the animation to play backwards.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.timeScale = 1;
		this._effectiveTimeScale = 1;

		/**
		 * The degree of influence of this action (in the interval `[0, 1]`). Values
		 * between `0` (no impact) and `1` (full impact) can be used to blend between
		 * several actions.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.weight = 1;
		this._effectiveWeight = 1;

		/**
		 * The number of repetitions of the performed clip over the course of this action.
		 * Can be set via {@link AnimationAction#setLoop}.
		 *
		 * Setting this number has no effect if {@link AnimationAction#loop} is set to
		 * `THREE:LoopOnce`.
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.repetitions = Infinity;

		/**
		 * If set to `true`, the playback of the action is paused.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.paused = false;

		/**
		 * If set to `false`, the action is disabled so it has no impact.
		 *
		 * When the action is re-enabled, the animation continues from its current
		 * time (setting `enabled` to `false` doesn't reset the action).
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enabled = true;

		/**
		 * If set to true the animation will automatically be paused on its last frame.
		 *
		 * If set to false, {@link AnimationAction#enabled} will automatically be switched
		 * to `false` when the last loop of the action has finished, so that this action has
		 * no further impact.
		 *
		 * Note: This member has no impact if the action is interrupted (it
		 * has only an effect if its last loop has really finished).
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.clampWhenFinished = false;

		/**
		 * Enables smooth interpolation without separate clips for start, loop and end.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.zeroSlopeAtStart = true;

		/**
		 * Enables smooth interpolation without separate clips for start, loop and end.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.zeroSlopeAtEnd = true;

	}

	/**
	 * Starts the playback of the animation.
	 *
	 * @return {AnimationAction} A reference to this animation action.
	 */
	play() {

		this._mixer._activateAction( this );

		return this;

	}

	/**
	 * Stops the playback of the animation.
	 *
	 * @return {AnimationAction} A reference to this animation action.
	 */
	stop() {

		this._mixer._deactivateAction( this );

		return this.reset();

	}

	/**
	 * Resets the playback of the animation.
	 *
	 * @return {AnimationAction} A reference to this animation action.
	 */
	reset() {

		this.paused = false;
		this.enabled = true;

		this.time = 0; // restart clip
		this._loopCount = - 1;// forget previous loops
		this._startTime = null;// forget scheduling

		return this.stopFading().stopWarping();

	}

	/**
	 * Returns `true` if the animation is running.
	 *
	 * @return {boolean} Whether the animation is running or not.
	 */
	isRunning() {

		return this.enabled && ! this.paused && this.timeScale !== 0 &&
			this._startTime === null && this._mixer._isActiveAction( this );

	}

	/**
	 * Returns `true` when {@link AnimationAction#play} has been called.
	 *
	 * @return {boolean} Whether the animation is scheduled or not.
	 */
	isScheduled() {

		return this._mixer._isActiveAction( this );

	}

	/**
	 * Defines the time when the animation should start.
	 *
	 * @param {number} time - The start time in seconds.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	startAt( time ) {

		this._startTime = time;

		return this;

	}

	/**
	 * Configures the loop settings for this action.
	 *
	 * @param {(LoopRepeat|LoopOnce|LoopPingPong)} mode - The loop mode.
	 * @param {number} repetitions - The number of repetitions.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	setLoop( mode, repetitions ) {

		this.loop = mode;
		this.repetitions = repetitions;

		return this;

	}

	/**
	 * Sets the effective weight of this action.
	 *
	 * An action has no effect and thus an effective weight of zero when the
	 * action is disabled.
	 *
	 * @param {number} weight - The weight to set.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	setEffectiveWeight( weight ) {

		this.weight = weight;

		// note: same logic as when updated at runtime
		this._effectiveWeight = this.enabled ? weight : 0;

		return this.stopFading();

	}

	/**
	 * Returns the effective weight of this action.
	 *
	 * @return {number} The effective weight.
	 */
	getEffectiveWeight() {

		return this._effectiveWeight;

	}

	/**
	 * Fades the animation in by increasing its weight gradually from `0` to `1`,
	 * within the passed time interval.
	 *
	 * @param {number} duration - The duration of the fade.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	fadeIn( duration ) {

		return this._scheduleFading( duration, 0, 1 );

	}

	/**
	 * Fades the animation out by decreasing its weight gradually from `1` to `0`,
	 * within the passed time interval.
	 *
	 * @param {number} duration - The duration of the fade.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	fadeOut( duration ) {

		return this._scheduleFading( duration, 1, 0 );

	}

	/**
	 * Causes this action to fade in and the given action to fade out,
	 * within the passed time interval.
	 *
	 * @param {AnimationAction} fadeOutAction - The animation action to fade out.
	 * @param {number} duration - The duration of the fade.
	 * @param {boolean} [warp=false] - Whether warping should be used or not.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	crossFadeFrom( fadeOutAction, duration, warp = false ) {

		fadeOutAction.fadeOut( duration );
		this.fadeIn( duration );

		if ( warp === true ) {

			const fadeInDuration = this._clip.duration,
				fadeOutDuration = fadeOutAction._clip.duration,

				startEndRatio = fadeOutDuration / fadeInDuration,
				endStartRatio = fadeInDuration / fadeOutDuration;

			fadeOutAction.warp( 1.0, startEndRatio, duration );
			this.warp( endStartRatio, 1.0, duration );

		}

		return this;

	}

	/**
	 * Causes this action to fade out and the given action to fade in,
	 * within the passed time interval.
	 *
	 * @param {AnimationAction} fadeInAction - The animation action to fade in.
	 * @param {number} duration - The duration of the fade.
	 * @param {boolean} [warp=false] - Whether warping should be used or not.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	crossFadeTo( fadeInAction, duration, warp = false ) {

		return fadeInAction.crossFadeFrom( this, duration, warp );

	}

	/**
	 * Stops any fading which is applied to this action.
	 *
	 * @return {AnimationAction} A reference to this animation action.
	 */
	stopFading() {

		const weightInterpolant = this._weightInterpolant;

		if ( weightInterpolant !== null ) {

			this._weightInterpolant = null;
			this._mixer._takeBackControlInterpolant( weightInterpolant );

		}

		return this;

	}

	/**
	 * Sets the effective time scale of this action.
	 *
	 * An action has no effect and thus an effective time scale of zero when the
	 * action is paused.
	 *
	 * @param {number} timeScale - The time scale to set.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	setEffectiveTimeScale( timeScale ) {

		this.timeScale = timeScale;
		this._effectiveTimeScale = this.paused ? 0 : timeScale;

		return this.stopWarping();

	}

	/**
	 * Returns the effective time scale of this action.
	 *
	 * @return {number} The effective time scale.
	 */
	getEffectiveTimeScale() {

		return this._effectiveTimeScale;

	}

	/**
	 * Sets the duration for a single loop of this action.
	 *
	 * @param {number} duration - The duration to set.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	setDuration( duration ) {

		this.timeScale = this._clip.duration / duration;

		return this.stopWarping();

	}

	/**
	 * Synchronizes this action with the passed other action.
	 *
	 * @param {AnimationAction} action - The action to sync with.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	syncWith( action ) {

		this.time = action.time;
		this.timeScale = action.timeScale;

		return this.stopWarping();

	}

	/**
	 * Decelerates this animation's speed to `0` within the passed time interval.
	 *
	 * @param {number} duration - The duration.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	halt( duration ) {

		return this.warp( this._effectiveTimeScale, 0, duration );

	}

	/**
	 * Changes the playback speed, within the passed time interval, by modifying
	 * {@link AnimationAction#timeScale} gradually from `startTimeScale` to
	 * `endTimeScale`.
	 *
	 * @param {number} startTimeScale - The start time scale.
	 * @param {number} endTimeScale - The end time scale.
	 * @param {number} duration - The duration.
	 * @return {AnimationAction} A reference to this animation action.
	 */
	warp( startTimeScale, endTimeScale, duration ) {

		const mixer = this._mixer,
			now = mixer.time,
			timeScale = this.timeScale;

		let interpolant = this._timeScaleInterpolant;

		if ( interpolant === null ) {

			interpolant = mixer._lendControlInterpolant();
			this._timeScaleInterpolant = interpolant;

		}

		const times = interpolant.parameterPositions,
			values = interpolant.sampleValues;

		times[ 0 ] = now;
		times[ 1 ] = now + duration;

		values[ 0 ] = startTimeScale / timeScale;
		values[ 1 ] = endTimeScale / timeScale;

		return this;

	}

	/**
	 * Stops any scheduled warping which is applied to this action.
	 *
	 * @return {AnimationAction} A reference to this animation action.
	 */
	stopWarping() {

		const timeScaleInterpolant = this._timeScaleInterpolant;

		if ( timeScaleInterpolant !== null ) {

			this._timeScaleInterpolant = null;
			this._mixer._takeBackControlInterpolant( timeScaleInterpolant );

		}

		return this;

	}

	/**
	 * Returns the animation mixer of this animation action.
	 *
	 * @return {AnimationMixer} The animation mixer.
	 */
	getMixer() {

		return this._mixer;

	}

	/**
	 * Returns the animation clip of this animation action.
	 *
	 * @return {AnimationClip} The animation clip.
	 */
	getClip() {

		return this._clip;

	}

	/**
	 * Returns the root object of this animation action.
	 *
	 * @return {Object3D} The root object.
	 */
	getRoot() {

		return this._localRoot || this._mixer._root;

	}

	// Internal

	_update( time, deltaTime, timeDirection, accuIndex ) {

		// called by the mixer

		if ( ! this.enabled ) {

			// call ._updateWeight() to update ._effectiveWeight

			this._updateWeight( time );
			return;

		}

		const startTime = this._startTime;

		if ( startTime !== null ) {

			// check for scheduled start of action

			const timeRunning = ( time - startTime ) * timeDirection;
			if ( timeRunning < 0 || timeDirection === 0 ) {

				deltaTime = 0;

			} else {


				this._startTime = null; // unschedule
				deltaTime = timeDirection * timeRunning;

			}

		}

		// apply time scale and advance time

		deltaTime *= this._updateTimeScale( time );
		const clipTime = this._updateTime( deltaTime );

		// note: _updateTime may disable the action resulting in
		// an effective weight of 0

		const weight = this._updateWeight( time );

		if ( weight > 0 ) {

			const interpolants = this._interpolants;
			const propertyMixers = this._propertyBindings;

			switch ( this.blendMode ) {

				case AdditiveAnimationBlendMode:

					for ( let j = 0, m = interpolants.length; j !== m; ++ j ) {

						interpolants[ j ].evaluate( clipTime );
						propertyMixers[ j ].accumulateAdditive( weight );

					}

					break;

				case NormalAnimationBlendMode:
				default:

					for ( let j = 0, m = interpolants.length; j !== m; ++ j ) {

						interpolants[ j ].evaluate( clipTime );
						propertyMixers[ j ].accumulate( accuIndex, weight );

					}

			}

		}

	}

	_updateWeight( time ) {

		let weight = 0;

		if ( this.enabled ) {

			weight = this.weight;
			const interpolant = this._weightInterpolant;

			if ( interpolant !== null ) {

				const interpolantValue = interpolant.evaluate( time )[ 0 ];

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

	}

	_updateTimeScale( time ) {

		let timeScale = 0;

		if ( ! this.paused ) {

			timeScale = this.timeScale;

			const interpolant = this._timeScaleInterpolant;

			if ( interpolant !== null ) {

				const interpolantValue = interpolant.evaluate( time )[ 0 ];

				timeScale *= interpolantValue;

				if ( time > interpolant.parameterPositions[ 1 ] ) {

					this.stopWarping();

					if ( timeScale === 0 ) {

						// motion has halted, pause
						this.paused = true;

					} else {

						// warp done - apply final time scale
						this.timeScale = timeScale;

					}

				}

			}

		}

		this._effectiveTimeScale = timeScale;
		return timeScale;

	}

	_updateTime( deltaTime ) {

		const duration = this._clip.duration;
		const loop = this.loop;

		let time = this.time + deltaTime;
		let loopCount = this._loopCount;

		const pingPong = ( loop === LoopPingPong );

		if ( deltaTime === 0 ) {

			if ( loopCount === - 1 ) return time;

			return ( pingPong && ( loopCount & 1 ) === 1 ) ? duration - time : time;

		}

		if ( loop === LoopOnce ) {

			if ( loopCount === - 1 ) {

				// just started

				this._loopCount = 0;
				this._setEndings( true, true, false );

			}

			handle_stop: {

				if ( time >= duration ) {

					time = duration;

				} else if ( time < 0 ) {

					time = 0;

				} else {

					this.time = time;

					break handle_stop;

				}

				if ( this.clampWhenFinished ) this.paused = true;
				else this.enabled = false;

				this.time = time;

				this._mixer.dispatchEvent( {
					type: 'finished', action: this,
					direction: deltaTime < 0 ? - 1 : 1
				} );

			}

		} else { // repetitive Repeat or PingPong

			if ( loopCount === - 1 ) {

				// just started

				if ( deltaTime >= 0 ) {

					loopCount = 0;

					this._setEndings( true, this.repetitions === 0, pingPong );

				} else {

					// when looping in reverse direction, the initial
					// transition through zero counts as a repetition,
					// so leave loopCount at -1

					this._setEndings( this.repetitions === 0, true, pingPong );

				}

			}

			if ( time >= duration || time < 0 ) {

				// wrap around

				const loopDelta = Math.floor( time / duration ); // signed
				time -= duration * loopDelta;

				loopCount += Math.abs( loopDelta );

				const pending = this.repetitions - loopCount;

				if ( pending <= 0 ) {

					// have to stop (switch state, clamp time, fire event)

					if ( this.clampWhenFinished ) this.paused = true;
					else this.enabled = false;

					time = deltaTime > 0 ? duration : 0;

					this.time = time;

					this._mixer.dispatchEvent( {
						type: 'finished', action: this,
						direction: deltaTime > 0 ? 1 : - 1
					} );

				} else {

					// keep running

					if ( pending === 1 ) {

						// entering the last round

						const atStart = deltaTime < 0;
						this._setEndings( atStart, ! atStart, pingPong );

					} else {

						this._setEndings( false, false, pingPong );

					}

					this._loopCount = loopCount;

					this.time = time;

					this._mixer.dispatchEvent( {
						type: 'loop', action: this, loopDelta: loopDelta
					} );

				}

			} else {

				this.time = time;

			}

			if ( pingPong && ( loopCount & 1 ) === 1 ) {

				// invert time for the "pong round"

				return duration - time;

			}

		}

		return time;

	}

	_setEndings( atStart, atEnd, pingPong ) {

		const settings = this._interpolantSettings;

		if ( pingPong ) {

			settings.endingStart = ZeroSlopeEnding;
			settings.endingEnd = ZeroSlopeEnding;

		} else {

			// assuming for LoopOnce atStart == atEnd == true

			if ( atStart ) {

				settings.endingStart = this.zeroSlopeAtStart ? ZeroSlopeEnding : ZeroCurvatureEnding;

			} else {

				settings.endingStart = WrapAroundEnding;

			}

			if ( atEnd ) {

				settings.endingEnd = this.zeroSlopeAtEnd ? ZeroSlopeEnding : ZeroCurvatureEnding;

			} else {

				settings.endingEnd 	 = WrapAroundEnding;

			}

		}

	}

	_scheduleFading( duration, weightNow, weightThen ) {

		const mixer = this._mixer, now = mixer.time;
		let interpolant = this._weightInterpolant;

		if ( interpolant === null ) {

			interpolant = mixer._lendControlInterpolant();
			this._weightInterpolant = interpolant;

		}

		const times = interpolant.parameterPositions,
			values = interpolant.sampleValues;

		times[ 0 ] = now;
		values[ 0 ] = weightNow;
		times[ 1 ] = now + duration;
		values[ 1 ] = weightThen;

		return this;

	}

}


export { AnimationAction };
