import { error } from '../../utils.js';
import { StackTrace } from '../../nodes/Nodes.js';

// bounds the failure cache so procedural key generators cannot grow it without bound

const FAILED_KEYS_LIMIT = 256;

/**
 * Captures every structural material value that is read after render-list
 * construction or during backend encoding into a plain frozen snapshot.
 * The snapshot mirrors the material property names so it can be passed in
 * place of the material to state-derivation helpers.
 *
 * It is captured at request time — during traversal — when pass-dependent
 * state like `material.side` has already been resolved by the renderer
 * (back-side pass, shadow override), so background compilations never read
 * these values live. The property set must stay in sync with
 * `WebGPUBackend._syncStructuralState()` and `getRenderCacheKey()`.
 *
 * @private
 * @param {Material} material - The material to capture.
 * @return {Object} The frozen draw state snapshot.
 */
export function captureDrawState( material ) {

	return Object.freeze( {

		isMaterial: true,
		isDrawState: true,

		// label data

		id: material.id,
		name: material.name,
		type: material.type,

		// render list / blending

		transparent: material.transparent,
		blending: material.blending,
		premultipliedAlpha: material.premultipliedAlpha,
		blendSrc: material.blendSrc,
		blendDst: material.blendDst,
		blendEquation: material.blendEquation,
		blendSrcAlpha: material.blendSrcAlpha,
		blendDstAlpha: material.blendDstAlpha,
		blendEquationAlpha: material.blendEquationAlpha,
		blendColor: material.blendColor,
		blendAlpha: material.blendAlpha,

		// output

		colorWrite: material.colorWrite,

		// depth

		depthWrite: material.depthWrite,
		depthTest: material.depthTest,
		depthFunc: material.depthFunc,

		// stencil

		stencilWrite: material.stencilWrite,
		stencilFunc: material.stencilFunc,
		stencilRef: material.stencilRef,
		stencilFail: material.stencilFail,
		stencilZFail: material.stencilZFail,
		stencilZPass: material.stencilZPass,
		stencilFuncMask: material.stencilFuncMask,
		stencilWriteMask: material.stencilWriteMask,

		// rasterization

		side: material.side,
		wireframe: material.wireframe === true,
		alphaToCoverage: material.alphaToCoverage,
		forceSinglePass: material.forceSinglePass,
		polygonOffset: material.polygonOffset,
		polygonOffsetFactor: material.polygonOffsetFactor,
		polygonOffsetUnits: material.polygonOffsetUnits

	} );

}

/**
 * Returns `true` if the two draw snapshots describe the same structural
 * state. Used to deduplicate compilation requests when several change paths
 * fire in the same frame.
 *
 * @private
 * @param {Object} a - The first draw snapshot.
 * @param {Object} b - The second draw snapshot.
 * @return {boolean} Whether the snapshots are structurally equal or not.
 */
export function drawStateEquals( a, b ) {

	for ( const key in a ) {

		if ( a[ key ] !== b[ key ] ) return false;

	}

	return true;

}

/**
 * One unit of background compilation work: a render object whose node
 * build, bindings and pipeline are prepared off the render path.
 *
 * @private
 */
class CompilationEntry {

	/**
	 * Constructs a new compilation entry.
	 *
	 * @param {RenderObject} target - The render object to compile (a new object or a pending replacement).
	 * @param {?RenderObject} owner - The render object being replaced, or `null` for new objects.
	 * @param {string|undefined} passId - The pass ID the target was created for.
	 * @param {number} priority - The queue priority, lower runs first.
	 */
	constructor( target, owner, passId, priority ) {

		/**
		 * The render object to compile.
		 *
		 * @type {RenderObject}
		 */
		this.target = target;

		/**
		 * The render object being replaced. Its `pending` reference is the
		 * staleness check: when it no longer points at the target, this
		 * entry has been superseded.
		 *
		 * @type {?RenderObject}
		 */
		this.owner = owner;

		/**
		 * The pass ID the target was created for, addressing the chain map
		 * the promotion swaps.
		 *
		 * @type {string|undefined}
		 */
		this.passId = passId;

		/**
		 * The queue priority, lower runs first.
		 *
		 * @type {number}
		 */
		this.priority = priority;

		/**
		 * The lights node the request-time lights were captured from.
		 *
		 * @type {?LightsNode}
		 */
		this.lightsNode = null;

		/**
		 * The lights of the build, captured at request time. The renderer
		 * restores the scene's lights node to its pre-render state after
		 * every render call, so build slices must re-apply the lights that
		 * were current when the compilation was requested.
		 *
		 * @type {?Array<Light>}
		 */
		this.lights = null;

		/**
		 * The in-flight cooperative node builder.
		 *
		 * @type {?NodeBuilder}
		 */
		this.builder = null;

		/**
		 * The requested render pipeline.
		 *
		 * @type {?RenderObjectPipeline}
		 */
		this.pipeline = null;

		/**
		 * Whether an awaited `compileAsync()` call waits on this entry.
		 *
		 * @type {boolean}
		 */
		this.prewarm = false;

		/**
		 * The settlement status: `null` while pending, then `'ready'`,
		 * `'failed'`, `'stale'`, `'cancelled'` or `'disposed'`.
		 *
		 * @type {?string}
		 */
		this.status = null;

		/**
		 * Settlement listeners, see `onSettled()`.
		 *
		 * @private
		 * @type {?Array<Function>}
		 */
		this._settledCallbacks = null;

	}

	/**
	 * Registers a callback which is invoked exactly once when the entry
	 * settles. If the entry is already settled, the callback is invoked
	 * immediately.
	 *
	 * @param {Function} callback - The callback. Receives the entry.
	 */
	onSettled( callback ) {

		if ( this.status !== null ) {

			callback( this );
			return;

		}

		if ( this._settledCallbacks === null ) this._settledCallbacks = [];

		this._settledCallbacks.push( callback );

	}

}

/**
 * Drives the background compilation of render objects so the render path
 * never builds TSL/WGSL or creates GPU pipelines synchronously:
 *
 * ```text
 * request → node build (sliced over idle time) → bindings → async pipeline → promotion
 * ```
 *
 * The driver processes one node build at a time — the node system has
 * shared caches and mutable builder state — slicing it with
 * `NodeBuilder.buildStep()` under a small main-thread budget. Pipeline
 * creation is fire-and-collect: `createRenderPipelineAsync` promises
 * resolve independently on browser-internal threads and queue the
 * promotion, which the renderer applies at the next top-level safe point.
 *
 * The driver exists in both renderer modes: `compileAsync()` uses it for
 * prewarming, async compilation mode additionally routes all render-path
 * compilation through it.
 *
 * @private
 */
class AsyncCompilation {

	/**
	 * Constructs a new async compilation driver.
	 *
	 * @param {?Renderer} [renderer=null] - The renderer this driver belongs to.
	 */
	constructor( renderer = null ) {

		/**
		 * The renderer this driver belongs to.
		 *
		 * @type {?Renderer}
		 */
		this.renderer = renderer;

		/**
		 * The main-thread time budget per service slice in milliseconds.
		 *
		 * @type {number}
		 */
		this.timeBudget = 2;

		/**
		 * Driver statistics, see `Info#asyncCompilation` which this property
		 * references when a renderer is set.
		 *
		 * @type {Object}
		 */
		this.stats = renderer !== null ? renderer.info.asyncCompilation : {
			queued: 0,
			pipelines: 0,
			promotions: 0,
			failed: 0,
			mainThreadTime: 0
		};

		/**
		 * The pending entries by build target, used for request deduplication.
		 *
		 * @private
		 * @type {Map<RenderObject,CompilationEntry>}
		 */
		this._entries = new Map();

		/**
		 * The entries awaiting their build, sorted by priority.
		 *
		 * @private
		 * @type {Array<CompilationEntry>}
		 */
		this._queue = [];

		/**
		 * The entry whose node build is in progress. Builds run one at a
		 * time; sequencing is the builder mutual exclusion.
		 *
		 * @private
		 * @type {?CompilationEntry}
		 */
		this._current = null;

		/**
		 * Ready replacements awaiting the renderer's top-level safe point.
		 *
		 * @private
		 * @type {Array<CompilationEntry>}
		 */
		this._promotions = [];

		/**
		 * Failed structural cache keys (bounded). A request whose key is
		 * remembered as failed is dropped, so a broken shader is not
		 * recompiled every frame; the render object keeps drawing its last
		 * compiled state until the key changes.
		 *
		 * @private
		 * @type {Map<number,boolean>}
		 */
		this._failures = new Map();

		/**
		 * The number of asynchronous GPU pipelines awaiting completion.
		 *
		 * @private
		 * @type {number}
		 */
		this._pipelinesInFlight = 0;

		/**
		 * The number of unsettled entries an awaited `compileAsync()` call
		 * is waiting on. While positive, service callbacks are scheduled at
		 * full speed instead of idle pace — the caller is blocked on the
		 * result, exactly like the sequential prewarm this driver replaces.
		 *
		 * @private
		 * @type {number}
		 */
		this._prewarms = 0;

		/**
		 * Whether the current slice completed an actual node build. Only
		 * real builds end a slice; entries that resolve from the shared
		 * caches flow through in bulk.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._didBuild = false;

		/**
		 * Whether a slice is currently running. Node builds can trigger
		 * nested renderer work — e.g. a material's environment map runs
		 * PMREM generation, which calls `renderer.render()` from inside the
		 * build — and the renderer services the driver at the end of every
		 * top-level render call. Advancing the in-flight build from inside
		 * itself would corrupt its state machine, so re-entered slices
		 * return immediately.
		 *
		 * The flag also routes that nested renderer work through the classic
		 * synchronous compilation path: utility renders like PMREM generation
		 * sample their output immediately and cache it, so skipping their
		 * not-yet-compiled drawables would bake black results. The slice
		 * already runs in background time, so compiling there is free.
		 *
		 * @type {boolean}
		 * @readonly
		 */
		this._updating = false;

		/**
		 * Whether a service callback has been scheduled.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._updateScheduled = false;

		/**
		 * Whether `onBackgroundWorkReady` should be invoked from the next
		 * service callback.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._notifyRequested = false;

		/**
		 * Handles of the scheduled service callbacks, if any.
		 *
		 * @private
		 * @type {?number}
		 */
		this._idleHandle = null;
		this._timeoutHandle = null;

		/**
		 * Bound service callback.
		 *
		 * @private
		 * @type {Function}
		 */
		this._onServiceCallback = this._service.bind( this );

	}

	/**
	 * Requests the background compilation of the given render object's
	 * current structural state: its pending replacement when one exists,
	 * otherwise the render object itself. Requests covered by an existing
	 * entry join it.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @param {string} [passId] - An optional ID for identifying the pass.
	 * @return {?CompilationEntry} The entry, or `null` when there is nothing to compile.
	 */
	request( renderObject, passId ) {

		const target = renderObject.pending !== null ? renderObject.pending : renderObject;

		const existing = this._entries.get( target );

		if ( existing !== undefined ) return existing;

		// already compiled (or known broken — keep drawing the last state)

		if ( this.renderer._pipelines.get( target ).pipeline !== undefined ) return null;
		if ( this.isFailed( target.initialCacheKey ) === true ) return null;

		// the application hint compiles ahead of all automatic work
		// (positive) or after it (negative); otherwise new objects compile
		// before replacements, with `compileAsync()` prewarms joining the
		// replacement tier

		const object = target.object;
		const material = target.material;

		const hint = object.compilePriority !== undefined ? object.compilePriority :
			( material.compilePriority !== undefined ? material.compilePriority : 0 );

		const owner = target !== renderObject ? renderObject : null;

		let priority;

		if ( hint > 0 ) priority = 0;
		else if ( hint < 0 ) priority = 3;
		else priority = ( owner === null && this.renderer._compilationPromises === null ) ? 1 : 2;

		const entry = new CompilationEntry( target, owner, passId, priority );

		if ( this.renderer._compilationPromises !== null ) {

			entry.prewarm = true;

			this._prewarms ++;

		}

		// capture the request-time lights — requests are made during
		// traversal, when the render list has set the lights

		const lightsNode = target.lightsNode;

		if ( lightsNode !== null && lightsNode !== undefined ) {

			entry.lightsNode = lightsNode;
			entry.lights = lightsNode.getLights().slice();

		}

		this._entries.set( target, entry );
		this._insert( entry );

		this.requestUpdate();
		this._syncInfo();

		return entry;

	}

	/**
	 * Runs one budgeted main-thread slice. Called by the renderer once per
	 * top-level render call and from the driver's own service callbacks.
	 */
	update() {

		if ( this._updating === true ) return; // re-entered from a nested render inside a build

		if ( this._queue.length === 0 && this._current === null ) return;

		this._updating = true;

		const start = performance.now();
		const deadline = start + this.timeBudget;

		try {

			do {

				let entry = this._current;

				if ( entry === null ) {

					entry = this._queue.shift();

					if ( entry === undefined ) break;

					if ( entry.status !== null ) continue;

					if ( this._isStale( entry ) === true ) {

						this._settle( entry, 'stale' );
						continue;

					}

					this._current = entry;

				}

				let done;

				try {

					done = this._advance( entry, deadline );

				} catch ( e ) {

					this._fail( entry, e );

					done = true;

				}

				if ( done === true ) {

					this._current = null;

					// at most one actual build completes per slice — pipeline
					// creation of completed builds overlaps on browser-internal
					// threads. entries resolved from the shared caches flow
					// through in bulk.

					if ( this._didBuild === true ) {

						this._didBuild = false;

						break;

					}

				}

			} while ( performance.now() < deadline );

		} finally {

			this._updating = false;

		}

		this.stats.mainThreadTime += performance.now() - start;

		if ( this._queue.length > 0 || this._current !== null ) this.requestUpdate();

		this._syncInfo();

	}

	/**
	 * Applies queued promotions. Called only from the renderer at the
	 * top-level safe point, while no pass or encoder is active.
	 */
	applyPromotions() {

		const promotions = this._promotions;

		if ( promotions.length === 0 ) return;

		const objects = this.renderer._objects;

		for ( let i = 0; i < promotions.length; i ++ ) {

			const entry = promotions[ i ];

			try {

				if ( objects.promote( entry.owner, entry.target, entry.passId ) === true ) this.stats.promotions ++;

			} catch ( e ) {

				error( 'AsyncCompilation: Promotion failed.', e );

			}

		}

		promotions.length = 0;

	}

	/**
	 * Remembers the given key as failed in a bounded cache so a broken
	 * shader is not recompiled every frame.
	 *
	 * @param {number} key - The structural cache key.
	 */
	rememberFailure( key ) {

		const failures = this._failures;

		if ( failures.has( key ) === true ) failures.delete( key );

		failures.set( key, true );

		while ( failures.size > FAILED_KEYS_LIMIT ) {

			failures.delete( failures.keys().next().value );

		}

	}

	/**
	 * Returns `true` if the given key is remembered as failed.
	 *
	 * @param {number} key - The structural cache key.
	 * @return {boolean} Whether the key is remembered as failed or not.
	 */
	isFailed( key ) {

		return this._failures.has( key );

	}

	/**
	 * Schedules a coalesced service callback. Uses `requestIdleCallback`
	 * (with a timeout backstop) when the document is visible and falls back
	 * to `setTimeout` otherwise, so background compilation continues in
	 * hidden tabs.
	 */
	requestUpdate() {

		if ( this._updateScheduled === true ) return;

		this._updateScheduled = true;

		if ( this._prewarms > 0 ) {

			// an awaited compileAsync() is blocked on this work — service at
			// full speed. `scheduler.yield()` still interleaves rendering and
			// input and, unlike timers and idle callbacks, is not throttled
			// in hidden pages.

			if ( typeof self !== 'undefined' && self.scheduler !== undefined && self.scheduler.yield !== undefined ) {

				self.scheduler.yield().then( this._onServiceCallback );

			} else {

				this._timeoutHandle = setTimeout( this._onServiceCallback, 0 );

			}

			return;

		}

		const hidden = ( typeof document !== 'undefined' ) && document.visibilityState === 'hidden';

		if ( hidden === false && typeof requestIdleCallback !== 'undefined' ) {

			this._idleHandle = requestIdleCallback( this._onServiceCallback, { timeout: 100 } );

			// backstop for agendas where idle callbacks stall (e.g. the tab
			// becomes hidden after scheduling)

			this._timeoutHandle = setTimeout( this._onServiceCallback, 150 );

		} else {

			this._timeoutHandle = setTimeout( this._onServiceCallback, 0 );

		}

	}

	/**
	 * Settles all entries, clears the queue and queued promotions. Used on
	 * device loss and disposal; `compileAsync()` waiters resolve.
	 *
	 * @param {string} [status='cancelled'] - The terminal status to settle entries with.
	 */
	clear( status = 'cancelled' ) {

		this._queue.length = 0;
		this._current = null;
		this._promotions.length = 0;

		for ( const entry of Array.from( this._entries.values() ) ) {

			this._settle( entry, status );

		}

		this._entries.clear();

		this._notifyRequested = false;
		this._didBuild = false;

		this._cancelServiceCallback();
		this._syncInfo();

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this.clear( 'disposed' );

		this._failures.clear();

	}

	/**
	 * Advances the given entry: cooperative node build (one at a time,
	 * sliced against the deadline), then bindings, then the asynchronous
	 * pipeline request.
	 *
	 * @private
	 * @param {CompilationEntry} entry - The entry to advance.
	 * @param {number} deadline - Absolute `performance.now()` deadline.
	 * @return {boolean} Whether the entry left the build stage or not.
	 */
	_advance( entry, deadline ) {

		const renderer = this.renderer;
		const target = entry.target;

		if ( this._isStale( entry ) === true ) {

			this._settle( entry, 'stale' );

			return true;

		}

		const nodes = renderer._nodes;

		if ( nodes.get( target ).nodeBuilderState === undefined ) {

			const cacheKey = nodes.getForRenderCacheKey( target );

			if ( nodes.nodeBuilderCache.get( cacheKey ) === undefined ) {

				// build slices run outside the render call, after the
				// renderer has restored the scene's lights node — apply the
				// request-time lights for the duration of the slice

				const lightsNode = entry.lightsNode;
				const previousLights = lightsNode !== null ? lightsNode.getLights() : null;

				if ( lightsNode !== null ) lightsNode.setLights( entry.lights );

				let complete = false;

				try {

					if ( entry.builder === null ) entry.builder = nodes._createNodeBuilder( target, target.material );

					complete = entry.builder.buildStep( deadline );

				} finally {

					if ( lightsNode !== null ) lightsNode.setLights( previousLights );

				}

				if ( complete === false ) return false;

				nodes.adoptNodeBuilder( cacheKey, entry.builder );

				entry.builder = null;

				this._didBuild = true;

			}

			nodes.getForRender( target ); // guaranteed cache hit — takes the reference units

		}

		// bindings — classic creation and residency

		renderer._bindings.getForRender( target );

		// pipeline — fire-and-collect; the promotion is queued from the completion

		const { pipeline, promise } = renderer._pipelines.getForRenderAsync( target );

		entry.pipeline = pipeline;

		if ( promise !== null ) {

			this._pipelinesInFlight ++;

			const settle = () => {

				this._pipelinesInFlight --;

				this._settlePipeline( entry );

			};

			promise.then( settle, settle );

		} else {

			this._settlePipeline( entry );

		}

		return true;

	}

	/**
	 * Completes an entry once its pipeline has settled: validates it,
	 * primes the structural change detector and queues the promotion for
	 * replacements.
	 *
	 * @private
	 * @param {CompilationEntry} entry - The entry.
	 */
	_settlePipeline( entry ) {

		if ( entry.status !== null ) return; // settled while the pipeline compiled

		const renderer = this.renderer;
		const target = entry.target;

		if ( this._isStale( entry ) === true ) {

			this._settle( entry, 'stale' );

		} else if ( renderer._pipelines.isPipelineFailed( entry.pipeline ) === true ) {

			this._fail( entry, new Error( 'Async render pipeline creation failed.' ) );

		} else {

			// prime the structural change detector from the compiled
			// snapshot so live mutations made during the build are still
			// detected on the next frame

			renderer.backend.syncRenderUpdateState( target, target.drawState !== null ? target.drawState : target.material );

			if ( entry.owner !== null ) {

				this._promotions.push( entry );

			} else {

				// new objects need no swap — they become drawable as soon as
				// their pipeline settles, which counts as their promotion

				this.stats.promotions ++;

			}

			this._settle( entry, 'ready' );

			this._requestNotify();

		}

		this._syncInfo();

	}

	/**
	 * Fails an entry: logs once with diagnostics, remembers the key in the
	 * bounded failure cache and releases a pending replacement. The owning
	 * render object keeps drawing its compiled state.
	 *
	 * @private
	 * @param {CompilationEntry} entry - The entry.
	 * @param {Error} e - The error.
	 */
	_fail( entry, e ) {

		let stackTrace = e.stackTrace;

		if ( ! stackTrace && e.stack ) {

			stackTrace = new StackTrace( e.stack );

		}

		error( 'TSL: ' + e, stackTrace );

		entry.builder = null;

		this.rememberFailure( entry.target.initialCacheKey );

		this.stats.failed ++;

		const owner = entry.owner;

		this._settle( entry, 'failed' );

		if ( owner !== null && owner.pending === entry.target ) {

			owner.pending = null;

			entry.target.dispose();

		}

	}

	/**
	 * Settles an entry into a terminal status. Exactly-once: subsequent
	 * calls are ignored.
	 *
	 * @private
	 * @param {CompilationEntry} entry - The entry.
	 * @param {string} status - The terminal status.
	 */
	_settle( entry, status ) {

		if ( entry.status !== null ) return;

		entry.status = status;

		if ( entry.prewarm === true ) {

			entry.prewarm = false;

			this._prewarms --;

		}

		this._entries.delete( entry.target );

		if ( this._current === entry ) this._current = null;

		const callbacks = entry._settledCallbacks;

		if ( callbacks !== null ) {

			entry._settledCallbacks = null;

			for ( let i = 0; i < callbacks.length; i ++ ) {

				callbacks[ i ]( entry );

			}

		}

	}

	/**
	 * Returns `true` if the entry has been superseded or its render objects
	 * disposed.
	 *
	 * @private
	 * @param {CompilationEntry} entry - The entry.
	 * @return {boolean} Whether the entry is stale or not.
	 */
	_isStale( entry ) {

		const { target, owner } = entry;

		if ( target.disposed === true ) return true;

		if ( owner !== null && ( owner.disposed === true || owner.pending !== target ) ) return true;

		return false;

	}

	/**
	 * Inserts the entry into the queue, after all entries of the same or
	 * higher priority (FIFO within a priority).
	 *
	 * @private
	 * @param {CompilationEntry} entry - The entry to insert.
	 */
	_insert( entry ) {

		const queue = this._queue;

		let index = queue.length;

		while ( index > 0 && queue[ index - 1 ].priority > entry.priority ) index --;

		queue.splice( index, 0, entry );

	}

	/**
	 * The service callback body: runs one budgeted slice and fires the
	 * deferred `onBackgroundWorkReady` notification.
	 *
	 * @private
	 */
	_service() {

		if ( this._updateScheduled === false ) return; // already serviced by the other callback

		this._updateScheduled = false;
		this._cancelServiceCallback();

		this.update();

		if ( this._notifyRequested === true ) {

			this._notifyRequested = false;

			const renderer = this.renderer;

			if ( renderer !== null && typeof renderer.onBackgroundWorkReady === 'function' ) {

				renderer.onBackgroundWorkReady();

			}

		}

	}

	/**
	 * Cancels any scheduled service callbacks.
	 *
	 * @private
	 */
	_cancelServiceCallback() {

		if ( this._idleHandle !== null ) {

			if ( typeof cancelIdleCallback !== 'undefined' ) cancelIdleCallback( this._idleHandle );

			this._idleHandle = null;

		}

		if ( this._timeoutHandle !== null ) {

			clearTimeout( this._timeoutHandle );

			this._timeoutHandle = null;

		}

		this._updateScheduled = false;

	}

	/**
	 * Requests the deferred `onBackgroundWorkReady` notification. The
	 * notification fires from the driver's own service callback — never
	 * synchronously from a promise resolution.
	 *
	 * @private
	 */
	_requestNotify() {

		this._notifyRequested = true;

		this.requestUpdate();

	}

	/**
	 * Updates the statistics gauges.
	 *
	 * @private
	 */
	_syncInfo() {

		const stats = this.stats;

		stats.queued = this._queue.length + ( this._current !== null ? 1 : 0 );
		stats.pipelines = this._pipelinesInFlight;

	}

}

export default AsyncCompilation;
