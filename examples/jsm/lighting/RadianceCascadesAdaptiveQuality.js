// the refresh rates that the adaptive quality targets: the common ones of displays, and 30 Hz of browsers that throttle
// the animation loop. Rarer ones are left out, as the jitter of the frames at one rate can match another, e.g. 72 Hz at 60

const REFRESH_RATES = [ 30, 60, 120, 144, 240 ];

/**
 * Adapts the `quality` and `halfResolution` of {@link RealtimeRadianceCascades} to the frame time, see
 * `targetFrameTime`. It measures the frames of the cascades over a quarter of a second, by the timestamps of the
 * animation frames and by when the GPU finishes them, see `finishedFrame` of the cascades, since a browser may run
 * the animation loop faster than the GPU, showing only some of its frames. The quality starts at 0 at
 * `halfResolution` and rises while the frames keep up with the target, in steps that double, but only slowly back
 * to the quality at which they last took longer, and falls while they take longer, by more the longer they take. If
 * lowering it by 0.4 did not shorten them, it compares them back at the quality above: if they are not longer
 * there, something else limits them, e.g. the display or the CPU, and it stays there for a while. It also falls a
 * little for every dropped frame, one that comes more than half a frame time late, unless the frames still drop
 * after it fell by 0.3 for them. Single frames of more than 2.5 times the target, e.g. a garbage collection, do not
 * count. At quality 1, it tries the full resolution, and goes back to half if the frames do not keep up, for 10
 * seconds, twice as long each time; at the full resolution, half is the first step down.
 *
 * It waits for a second after the cascades built their passes, see `version` of the cascades, while they compile.
 *
 * ```js
 * const adaptiveQuality = new RadianceCascadesAdaptiveQuality();
 *
 * function animate() {
 *
 * 	adaptiveQuality.update( cascades );
 * 	renderPipeline.render();
 *
 * }
 * ```
 *
 * @three_import import { RadianceCascadesAdaptiveQuality } from 'three/addons/lighting/RadianceCascadesAdaptiveQuality.js';
 */
class RadianceCascadesAdaptiveQuality {

	/**
	 * Constructs the adaptive quality.
	 *
	 * @param {Object} [options] - The options.
	 * @param {number} [options.targetFrameTime=0] - The frame time in milliseconds that the quality adapts to, or 0 for the display's.
	 */
	constructor( { targetFrameTime = 0 } = {} ) {

		/**
		 * Whether the quality adapts. It starts over from quality 0 when enabled again.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enabled = true;

		/**
		 * The frame time in milliseconds that `quality` adapts to, e.g. `1000 / 60`, or 0 for the display's: taken as
		 * 60 Hz at first, and as 120, 144 or 240 Hz if half of the frames come at that rate, in two measurements in a
		 * row. While even quality 0 takes longer, the target is a multiple of it, up to the time of 30 Hz, and the
		 * faster frame rate is tried again from quality 0 after 10 seconds, twice as long each time it fails. While the
		 * frames take longer however low the quality, at a steady 30, 60, 120 or 144 Hz, e.g. because the browser runs
		 * the animation loop at 30 Hz in a low power mode, the target is their time, for a while. See
		 * `activeTargetFrameTime`.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.targetFrameTime = targetFrameTime;

		/**
		 * The frame time in milliseconds that `quality` adapts to at the moment, see `targetFrameTime`.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.activeTargetFrameTime = targetFrameTime > 0 ? targetFrameTime : 1000 / 60;

		// the state, see update()

		this._lastUpdate = null;
		this._frameTimes = [];
		this._qualityLimit = 1;
		this._lateQuality = 1;
		this._descent = null;
		this._probe = null;
		this._holdUntil = 0;
		this._holdTime = 0;
		this._adaptAfter = 0;
		this._skipFrames = 5;
		this._lastStamp = null;
		this._stampedAt = - Infinity;
		this._stampPending = false;
		this._fences = [];
		this._gpuFrameTime = 0;
		this._started = false;
		this._fullTrial = false;
		this._fullHoldUntil = 0;
		this._fullHoldTime = 0;
		this._fullSince = 0;
		this._rise = 0.02;
		this._floorOvers = 0;
		this._fasterDisplay = null;
		this._displayTime = 1000 / 60;
		this._divisor = 1;
		this._capTime = 0;
		this._capUntil = 0;
		this._drops = [];
		this._edgeTime = 0;
		this._edgeUntil = 0;
		this._rateTrial = null;
		this._rateHoldTime = 0;
		this._rateHoldUntil = 0;
		this._rateRaisedAt = - Infinity;
		this._edge = null;
		this._dropHoldTime = 0;
		this._dropHoldUntil = 0;
		this._finishedFrame = 0;
		this._version = 0;

	}

	/**
	 * Adapts the `quality` and `halfResolution` of the cascades to the target frame time by the mean time between
	 * the last calls. Call it before every frame, before the `update()` of the cascades.
	 *
	 * @param {RealtimeRadianceCascades} cascades - The cascades.
	 */
	update( cascades ) {

		const now = performance.now();
		const frame = cascades.frame;

		// new passes of the cascades: a second for them to compile and for the probes to fill

		if ( cascades.version !== this._version ) {

			this._version = cascades.version;
			this.pause( 1000 );

		}

		// the GPU finished a frame, see below

		if ( cascades.finishedFrame !== this._finishedFrame ) {

			this._finishedFrame = cascades.finishedFrame;

			if ( this.enabled === true && this._fences.length < 1000 ) this._fences.push( [ cascades.finishedFrame, cascades.finishedTime ] );

		}

		if ( this.enabled !== true ) {

			this._lastUpdate = this._lastStamp = null;
			this._started = false;
			return;

		}

		// from quality 0 up, so that slow devices do not start with slow frames

		if ( this._started === false ) {

			this._started = true;
			cascades.quality = 0;
			cascades.halfResolution = true;
			this._qualityLimit = 1;
			this._lateQuality = 1;
			this._rise = 0.02;
			this._drops.length = 0;
			this._edgeTime = 0;
			this._edgeUntil = 0;
			this._rateTrial = null;
			this._edge = null;
			this._dropHoldTime = 0;
			this._dropHoldUntil = 0;

		}

		// the frame times from the timestamps of the animation frames, which step by whole frame times of the display,
		// from a callback every frame while update() is called. Without them, e.g. in XR, from the time between the
		// calls of update()

		if ( typeof requestAnimationFrame === 'function' && this._stampPending === false ) {

			this._stampPending = true;

			const onFrame = ( stamp ) => {

				if ( this._lastStamp !== null ) this._addFrameTime( stamp - this._lastStamp );

				this._lastStamp = stamp;
				this._stampedAt = performance.now();

				if ( this.enabled === true && this._stampedAt - this._lastUpdate < 250 ) {

					requestAnimationFrame( onFrame );

				} else {

					this._stampPending = false;
					this._lastStamp = null;

				}

			};

			requestAnimationFrame( onFrame );

		}

		if ( now - this._stampedAt > 250 && this._lastUpdate !== null ) this._addFrameTime( now - this._lastUpdate );

		this._lastUpdate = now;

		if ( now < this._adaptAfter ) {

			this._frameTimes.length = 0;
			return;

		}

		// the frames of a quarter of a second, half a second for a window back up or of a faster frame rate on trial, at
		// least 8, without the first ones after a change: 5 after a step down, which are still in flight, and 12 after a
		// step up, whose new finer probes cost more at first. A faster frame rate on trial ends early if 4 frames in a
		// row miss it by half

		const times = this._frameTimes.slice( this._skipFrames );
		const span = times.reduce( ( sum, t ) => sum + t, 0 );
		const missed = this._rateTrial !== null && times.length >= 4 && times.every( ( time ) => time > this._displayTime * this._divisor * 1.5 );

		if ( missed === false && ( times.length < 8 || span < ( this._probe !== null || this._rateTrial !== null ? 500 : 250 ) ) ) return;

		const fences = this._fences.filter( ( [ finished ] ) => finished >= frame - times.length );
		const fenceFrames = fences.length > 1 ? fences[ fences.length - 1 ][ 0 ] - fences[ 0 ][ 0 ] : 0;
		const fenceTime = fences.length > 1 ? fences[ fences.length - 1 ][ 1 ] - fences[ 0 ][ 1 ] : 0;

		this._gpuFrameTime = fenceFrames > 0 ? fenceTime / fenceFrames : 0;
		this._fences = this._fences.slice( - 1 );

		const quality = cascades.quality;
		const auto = ! ( this.targetFrameTime > 0 );

		this._frameTimes.length = 0;

		// the frame time of the display, the base of the dropped frames: most frames come at a faster common refresh rate,
		// in two windows in a row, as the timestamps are coarse and jitter in some browsers

		if ( auto ) {

			const median = times.slice().sort( ( a, b ) => a - b )[ times.length >> 1 ];
			const display = refreshTime( median );

			if ( display !== median && display < this._displayTime * 0.95 ) {

				if ( this._fasterDisplay === display ) {

					this._displayTime = display;
					this._divisor = 1;
					this._rateTrial = null;

				}

				this._fasterDisplay = display;

			} else {

				this._fasterDisplay = null;

			}

		}

		const target = auto ? Math.max( this._displayTime * this._divisor, now < this._capUntil ? this._capTime : 0 ) : this.targetFrameTime;

		// a faster frame rate on trial is not the target yet

		if ( this._rateTrial === null ) this.activeTargetFrameTime = target;

		// single frames that take more than 2.5 times the target are hitches, e.g. a garbage collection or a shader
		// that compiles, which no quality avoids: they count neither for the frame time nor as dropped frames

		const hitches = times.filter( ( time ) => time > target * 2.5 );
		const steady = hitches.length > 0 && hitches.length <= Math.max( 1, times.length * 0.15 ) ? times.filter( ( time ) => time <= target * 2.5 ) : times;
		const steadyTime = steady.reduce( ( sum, t ) => sum + t, 0 ) / steady.length;
		const hitchTime = steady === times ? 0 : span - steadyTime * times.length;

		// the mean, since without vsync the frames can alternate between fast ones and ones that wait for the GPU, or
		// the GPU's frame time if longer: the time between the reads that wait for it, over the frames between them

		const frameTime = Math.max( steadyTime, fenceFrames > 0 ? ( fenceTime - hitchTime ) / fenceFrames : 0 );

		// the dropped frames, which came more than half a frame time after the target, and those of the last second

		const drops = steady.filter( ( time ) => time > target * 1.5 ).length;

		this._drops = this._drops.filter( ( [ time ] ) => now - time < 1000 );

		if ( drops > 0 ) this._drops.push( [ now, drops ] );

		const recentDrops = this._drops.reduce( ( sum, [ , count ] ) => sum + count, 0 );

		// a window back up after steps down lowered the quality by 0.4 but did not shorten the frames by 15%: unless
		// they take 15% longer there, the quality does not limit them, something else does, e.g. the display or the
		// CPU. It stays up for 10 seconds, twice as long each time, and the display's target is their time meanwhile

		if ( this._probe !== null ) {

			const probe = this._probe;

			this._probe = null;
			this._rise = 0.02;

			if ( frameTime < probe.time * 1.15 ) {

				this._descent = null;
				this._qualityLimit = quality;
				this._holdTime = Math.min( this._holdTime * 2 || 10000, 160000 );
				this._holdUntil = now + this._holdTime;

				// a cap below the display's frame rate, e.g. a low power mode, if the timestamps step by it frame after frame

				const cap = steadyFrameTime( times );

				if ( cap !== null && cap > this._displayTime * 1.05 ) {

					this._capTime = cap;
					this._capUntil = this._holdUntil;

				}

			} else {

				this._descent = probe;
				cascades.quality = probe.quality;
				this._skipFrames = 5;

			}

			return;

		}

		// a window of the faster frame rate on trial, see below: it stays if the frames keep up at quality 0. Else back
		// to the slower one, at the quality it had

		if ( this._rateTrial !== null ) {

			const trial = this._rateTrial;

			this._rateTrial = null;

			if ( frameTime > target * 1.1 || drops > 1 ) {

				this._halveFrameRate( now, true );

				cascades.quality = trial.quality;
				cascades.halfResolution = trial.halfResolution;
				this._qualityLimit = trial.limit;
				this._lateQuality = trial.lateQuality;
				this._skipFrames = 12;

			} else {

				this.activeTargetFrameTime = target;
				this._rateRaisedAt = now;
				this._qualityLimit = 1;
				this._lateQuality = 1;
				this._rise = 0.02;
				this._floorOvers = 0;

			}

			return;

		}

		if ( frameTime > target * 1.1 ) {

			// at the full resolution, half is the first step down, and the next try of the full resolution waits for 10
			// seconds, twice as long each time

			if ( cascades.halfResolution === false && ( this._fullTrial || now >= this._holdUntil ) ) {

				this._halveResolution( cascades, now );
				return;

			}

			if ( now < this._holdUntil ) return;

			// the steps so far paid off, the next ones are compared with here

			if ( this._descent !== null && frameTime <= this._descent.time * 0.85 ) this._descent = { quality, time: frameTime };

			if ( this._descent !== null && this._descent.quality - quality >= 0.4 && frameTime > this._descent.time * 0.85 ) {

				this._probe = { quality, time: frameTime };
				cascades.quality = this._descent.quality;
				this._skipFrames = 12;

				return;

			}

			// even quality 0 is too slow for the display's frame time, twice: half the frame rate, down to 30 Hz

			if ( quality === 0 ) {

				if ( ++ this._floorOvers >= 2 && auto && this._displayTime * this._divisor * 2 <= 1000 / 30 * 1.01 ) this._halveFrameRate( now );

				return;

			}

			// down by the octaves that the frames take longer than the target, about 1.5 per quality between 1 and 0,
			// at most by half

			const step = Math.min( Math.max( Math.log2( frameTime / target ) / 1.5, 0.03 ), 0.5 );

			this._rise = 0.02;
			this._descent ??= { quality, time: frameTime };
			this._qualityLimit = Math.min( this._qualityLimit, quality - 0.02 );
			this._lateQuality = quality;
			this._edge = null;
			cascades.quality = Math.max( quality - step, 0 );
			this._skipFrames = 5;

		} else if ( drops > 0 ) {

			// dropped frames, although the frames keep up on average: the quality is at the edge of what the GPU can do,
			// e.g. as it heats up. Down a little, more for more dropped frames in the last second, and while it waits,
			// for 4 seconds and twice as long each time up to 16, it rises only to below where they dropped

			// while they do not count, see below, only two of them within a second halve the resolution

			const ignored = now < this._dropHoldUntil;

			if ( cascades.halfResolution === false && ( this._fullTrial || now >= this._holdUntil ) && ( ignored === false || recentDrops > 1 ) ) {

				this._halveResolution( cascades, now );
				return;

			}

			if ( now < this._holdUntil || ignored ) return;

			// at quality 0, more than one in a second count as frames that take longer, see above

			if ( quality === 0 ) {

				if ( recentDrops > 1 && ++ this._floorOvers >= 2 && auto && this._displayTime * this._divisor * 2 <= 1000 / 30 * 1.01 ) this._halveFrameRate( now );

				return;

			}

			// the frames still drop although the quality fell by 0.3 for them, without a wait in between that ran
			// out: the drops are not the quality's, e.g. another application or a timer of the page. The quality goes
			// back to where it was, and such drops do not count for 10 seconds, twice as long each time

			this._edge ??= { quality, limit: this._qualityLimit, lateQuality: this._lateQuality };

			if ( this._edge.quality - quality >= 0.3 ) {

				this._dropHoldTime = Math.min( this._dropHoldTime * 2 || 10000, 160000 );
				this._dropHoldUntil = now + this._dropHoldTime;
				cascades.quality = this._edge.quality;
				this._qualityLimit = this._edge.limit;
				this._lateQuality = this._edge.lateQuality;
				this._edge = null;
				this._edgeTime = 0;
				this._edgeUntil = 0;
				this._skipFrames = 12;

				return;

			}

			this._rise = 0.02;
			this._qualityLimit = Math.min( this._qualityLimit, quality - 0.02 );
			this._lateQuality = quality;
			cascades.quality = Math.max( quality - 0.03 * Math.min( recentDrops, 5 ), 0 );
			this._edgeTime = Math.min( this._edgeTime * 2 || 4000, 16000 );
			this._edgeUntil = now + this._edgeTime;
			this._skipFrames = 5;

		} else if ( frameTime <= target * 1.05 ) {

			// at full quality with half the frame time, the display's full frame rate again

			if ( this._divisor > 1 && quality === 1 && frameTime <= target * 0.55 ) this._divisor /= 2;

			// up while the frames are fast enough, within the jitter of the display, in steps that double, and only
			// slowly back to where they last were not: the limit rises by 0.002. Once the frames keep up well above
			// the quality at which they last did not, by 0.04, what made them late is over, e.g. a view or another
			// application, and the limit rises twice as fast for every 0.01 further

			const step = Math.min( Math.max( Math.log2( target / frameTime ) / 3, this._rise ), 0.25 );

			this._rise = Math.min( this._rise * 2, 0.25 );
			this._floorOvers = 0;
			this._descent = null;
			this._holdTime = 0;
			if ( now >= this._edgeUntil ) this._edge = null;
			if ( this._dropHoldTime > 0 && now - this._dropHoldUntil > 60000 ) this._dropHoldTime = 0;
			if ( now >= this._edgeUntil ) this._qualityLimit = Math.min( this._qualityLimit + Math.min( 0.002 * 2 ** Math.max( ( quality - this._lateQuality - 0.04 ) / 0.01, 0 ), 0.05 ), 1 );
			cascades.quality = Math.min( quality + step, Math.max( this._qualityLimit, quality ) );
			this._skipFrames = cascades.quality > quality ? 12 : 5;

			// a try of the full resolution held, the wait for the next one is short again after 30 seconds of it, and at
			// quality 1 the full resolution is the last step up

			if ( this._fullTrial ) this._fullSince = now;
			if ( cascades.halfResolution === false && now - this._fullSince > 30000 ) this._fullHoldTime = 0;

			this._fullTrial = false;

			if ( quality === 1 && cascades.halfResolution && now >= this._fullHoldUntil ) {

				cascades.halfResolution = false;
				this._fullTrial = true;
				this._skipFrames = 12;

			}

			// at half the frame rate, the faster one again on trial, from quality 0 at half the resolution: what made it
			// too slow, e.g. another application or a view, may be over

			if ( this._divisor > 1 && this._fullTrial === false && now >= this._rateHoldUntil && now >= this._capUntil ) {

				this._rateTrial = { quality: cascades.quality, halfResolution: cascades.halfResolution, limit: this._qualityLimit, lateQuality: this._lateQuality };
				this._divisor /= 2;
				cascades.quality = 0;
				cascades.halfResolution = true;
				this._skipFrames = 5;

			}

		}

	}

	/**
	 * Halves the frame rate that the adaptive quality aims for, as quality 0 was too slow for it. The next try of the
	 * faster one waits for 10 seconds, twice as long each time, unless the faster one held for a minute. The quality
	 * starts over, as where it was too slow for the faster frame rate says nothing about the slower one.
	 *
	 * @private
	 * @param {number} now - The time in milliseconds.
	 * @param {boolean} [failed=false] - Whether a try of the faster frame rate failed.
	 */
	_halveFrameRate( now, failed = false ) {

		if ( failed === false && now - this._rateRaisedAt > 60000 ) this._rateHoldTime = 0;

		this._divisor *= 2;
		this._floorOvers = 0;
		this._rateHoldTime = Math.min( this._rateHoldTime * 2 || 10000, 160000 );
		this._rateHoldUntil = now + this._rateHoldTime;
		this._qualityLimit = 1;
		this._lateQuality = 1;
		this._rise = 0.02;

	}

	/**
	 * Goes back to half the resolution, the first step down of the adaptive quality from the full resolution. The next
	 * try of the full resolution waits for 10 seconds, twice as long each time.
	 *
	 * @private
	 * @param {RealtimeRadianceCascades} cascades - The cascades.
	 * @param {number} now - The time in milliseconds.
	 */
	_halveResolution( cascades, now ) {

		this._fullTrial = false;
		cascades.halfResolution = true;
		this._fullHoldTime = Math.min( this._fullHoldTime * 2 || 10000, 160000 );
		this._fullHoldUntil = now + this._fullHoldTime;
		this._rise = 0.02;
		this._skipFrames = 5;

	}

	/**
	 * Adds the time of a frame to the measurement of the adaptive quality, or starts it again after a pause, e.g. a
	 * hidden page or a new scene.
	 *
	 * @private
	 * @param {number} time - The frame time in milliseconds.
	 */
	_addFrameTime( time ) {

		if ( time > 250 ) this._frameTimes.length = 0;
		else if ( time > 0 ) this._frameTimes.push( time );

	}

	/**
	 * Starts the measurement of the frames over after a time, e.g. while a scene loads, so that its slow frames do
	 * not lower the quality.
	 *
	 * @param {number} time - The time in milliseconds.
	 */
	pause( time ) {

		this._frameTimes.length = 0;
		this._adaptAfter = performance.now() + time;

	}

}

/**
 * Returns the frame time of a common refresh rate that 85% of some frame times equal, give or take a millisecond or
 * 5%, or null.
 *
 * @private
 * @param {Array<number>} times - The frame times in milliseconds.
 * @return {?number} The frame time.
 */
function steadyFrameTime( times ) {

	for ( const rate of REFRESH_RATES ) {

		const period = 1000 / rate;
		const tolerance = Math.max( 1, period * 0.05 );

		if ( times.filter( ( time ) => Math.abs( time - period ) < tolerance ).length >= times.length * 0.85 ) return period;

	}

	return null;

}

/**
 * Returns the frame time of the common refresh rate within 8% of a frame time, or the frame time.
 *
 * @private
 * @param {number} time - The frame time in milliseconds.
 * @return {number} The frame time.
 */
function refreshTime( time ) {

	for ( const rate of REFRESH_RATES ) if ( Math.abs( 1000 / rate - time ) < time * 0.08 ) return 1000 / rate;

	return time;

}

export { RadianceCascadesAdaptiveQuality };
