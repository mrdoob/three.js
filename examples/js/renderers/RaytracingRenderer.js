/**
 * RaytracingRenderer renders by raytracing it's scene. However, it does not
 * compute the pixels itself but it hands off and coordinates the taks for workers.
 * The workers compute the pixel values and this renderer simply paints it to the Canvas.
 *
 * @author zz85 / http://github.com/zz85
 */

THREE.RaytracingRenderer = function ( parameters ) {

	console.log( 'THREE.RaytracingRenderer', THREE.REVISION );

	parameters = parameters || {};

	var scope = this;
	var pool = [];
	var renderering = false;

	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d', {
		alpha: parameters.alpha === true
	} );

	var maxRecursionDepth = 3;

	var canvasWidth, canvasHeight;
	var canvasWidthHalf, canvasHeightHalf;

	var clearColor = new THREE.Color( 0x000000 );

	this.domElement = canvas;

	this.autoClear = true;

	var workers = parameters.workers;
	var blockSize = parameters.blockSize || 64;
	this.randomize = parameters.randomize;

	var toRender = [], workerId = 0, sceneId = 0;

	console.log( '%cSpinning off ' + workers + ' Workers ', 'font-size: 20px; background: black; color: white; font-family: monospace;' );

	this.setWorkers = function( w ) {

		workers = w || navigator.hardwareConcurrency || 4;

		while ( pool.length < workers ) {
			var worker = new Worker( parameters.workerPath );
			worker.id = workerId++;

			worker.onmessage = function( e ) {

				var data = e.data;

				if ( ! data ) return;

				if ( data.blockSize && sceneId == data.sceneId ) { // we match sceneId here to be sure

					var imagedata = new ImageData( new Uint8ClampedArray( data.data ), data.blockSize, data.blockSize );
					context.putImageData( imagedata, data.blockX, data.blockY );

					// completed

					console.log( 'Worker ' + this.id, data.time / 1000, ( Date.now() - reallyThen ) / 1000 + ' s' );

					if ( pool.length > workers ) {

						pool.splice( pool.indexOf( this ), 1 );
						return this.terminate();

					}

					renderNext( this );

				}

			};

			worker.color = new THREE.Color().setHSL( Math.random() , 0.8, 0.8 ).getHexString();
			pool.push( worker );

			if ( renderering ) {

				updateSettings( worker );

				worker.postMessage( {
					scene: sceneJSON,
					camera: cameraJSON,
					annex: materials,
					sceneId: sceneId
				} );

				renderNext( worker );

			}

		}

		if ( ! renderering ) {

			while ( pool.length > workers ) {

				pool.pop().terminate();

			}

		}

	};

	this.setWorkers( workers );

	this.setClearColor = function ( color, alpha ) {

		clearColor.set( color );

	};

	this.setPixelRatio = function () {};

	this.setSize = function ( width, height ) {

		canvas.width = width;
		canvas.height = height;

		canvasWidth = canvas.width;
		canvasHeight = canvas.height;

		canvasWidthHalf = Math.floor( canvasWidth / 2 );
		canvasHeightHalf = Math.floor( canvasHeight / 2 );

		context.fillStyle = 'white';

		pool.forEach( updateSettings );

	};

	this.setSize( canvas.width, canvas.height );

	this.clear = function () {

	};

	//

	var totalBlocks, xblocks, yblocks;

	function updateSettings( worker ) {

		worker.postMessage( {

			init: [ canvasWidth, canvasHeight ],
			worker: worker.id,
			// workers: pool.length,
			blockSize: blockSize

		} );

	}

	function renderNext( worker ) {
		if ( ! toRender.length ) {

			renderering = false;
			return scope.dispatchEvent( { type: "complete" } );

		}

		var current = toRender.pop();

		var blockX = ( current % xblocks ) * blockSize;
		var blockY = ( current / xblocks | 0 ) * blockSize;

		worker.postMessage( {
			render: true,
			x: blockX,
			y: blockY,
			sceneId: sceneId
		} );

		context.fillStyle = '#' + worker.color;

		context.fillRect( blockX, blockY, blockSize, blockSize );

	}

	var materials = {};

	var sceneJSON, cameraJSON, reallyThen;

	// additional properties that were not serialize automatically

	var _annex = {

		mirror: 1,
		reflectivity: 1,
		refractionRatio: 1,
		glass: 1

	};

	function serializeObject( o ) {

		var mat = o.material;

		if ( ! mat || mat.uuid in materials ) return;

		var props = {};
		for ( var m in _annex ) {

			if ( mat[ m ] !== undefined ) {

				props[ m ] = mat[ m ];

			}

		}

		materials[ mat.uuid ] = props;
	}

	this.render = function ( scene, camera ) {

		renderering = true;

		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		// update camera matrices

		if ( camera.parent === null ) camera.updateMatrixWorld();


		sceneJSON = scene.toJSON();
		cameraJSON = camera.toJSON();
		++ sceneId;

		scene.traverse( serializeObject );

		pool.forEach( function( worker ) {

			worker.postMessage( {
				scene: sceneJSON,
				camera: cameraJSON,
				annex: materials,
				sceneId: sceneId
			} );
		} );

		context.clearRect( 0, 0, canvasWidth, canvasHeight );
		reallyThen = Date.now();

		xblocks = Math.ceil( canvasWidth / blockSize );
		yblocks = Math.ceil( canvasHeight / blockSize );
		totalBlocks = xblocks * yblocks;

		toRender = [];

		for ( var i = 0; i < totalBlocks; i ++ ) {

			toRender.push( i );

		}


		// Randomize painting :)

		if ( scope.randomize ) {

			for ( var i = 0; i < totalBlocks; i ++ ) {

				var swap = Math.random()  * totalBlocks | 0;
				var tmp = toRender[ swap ];
				toRender[ swap ] = toRender[ i ];
				toRender[ i ] = tmp;

			}

		}


		pool.forEach( renderNext );

	};

};

Object.assign( THREE.RaytracingRenderer.prototype, THREE.EventDispatcher.prototype );
