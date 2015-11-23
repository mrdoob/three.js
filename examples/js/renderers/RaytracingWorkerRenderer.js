/**
 * The way to use RaytracingWorkerRenderer is similar to RaytracingRenderer
 * except that it is simply a coordinator for workers. The workers compute
 * the pixel values and this renderer simply paints it to the Canvas. As such,
 * it is simply a renderer.
 *
 * TODO
 * - serialize scene and hand it to workers
 * - renderer thread to hand block jobs to workers
 * - pass worker path as option
 *
 * @author zz85 / http://github.com/zz85
 */

THREE.RaytracingWorkerRenderer = function ( parameters ) {

	console.log( 'THREE.RaytracingWorkerRenderer', THREE.REVISION );

	parameters = parameters || {};

	var scope = this;
	var pool = [];

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

	var workers = parameters.workers || navigator.hardwareConcurrency || 4;

	console.log('%cSpinning off ' + workers + ' Workers ', 'font-size: 20px; background: black; color: white; font-family: monospace;');

	for (var i = 0; i < workers; i++) {
		var worker = new Worker('js/renderers/RaytracingWorker.js');
		worker.onmessage = function(e) {
			var data = e.data;

			if (!data) return;

			if (data.blockSize) {
				var d = data.data;
				var imagedata = new ImageData(new Uint8ClampedArray(d), data.blockSize, data.blockSize);
				renderer.ctx.putImageData( imagedata, data.blockX, data.blockY );
			} else if (data.type == 'complete') {
				// TODO can terminate worker here or schedule more other jobs...
			}

		}
		pool.push(worker);
	}


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

		pool.forEach(function(p, i) {
			p.postMessage({
				init: [ width, height ],
				worker: i,
				workers: pool.length,
				blockSize: 64
			})
		})

	};

	this.setSize( canvas.width, canvas.height );

	this.clear = function () {

	};

	//

	this.render = function ( scene, camera ) {
		reallyThen = Date.now()

		pool.forEach(function(p) {
			p.postMessage({
				render: true
			})
		});

	};

	this.ctx = context;

};

THREE.EventDispatcher.prototype.apply( THREE.RaytracingWorkerRenderer.prototype );
