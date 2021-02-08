import { UIBreak, UIButton, UIInteger, UIPanel, UIProgress, UIRow, UIText } from './libs/ui.js';

import { APP } from './libs/app.js';

import { simd } from "https://unpkg.com/wasm-feature-detect?module";
import loadEncoder from "https://unpkg.com/mp4-h264";

let lazyEncoderPromise;

function lazyLoadEncoder () {
	if (lazyEncoderPromise != null) return lazyEncoderPromise;
	lazyEncoderPromise = simd().then(isSIMD => {
		console.log("SIMD Video Encoder Supported?", isSIMD);
		return loadEncoder({ simd: isSIMD });
	});
	return lazyEncoderPromise;
}

function SidebarProjectVideo( editor ) {

	var container = new UIPanel();
	container.setId( 'render' );

	// Video

	container.add( new UIText( 'Video' ).setTextTransform( 'uppercase' ) );
	container.add( new UIBreak(), new UIBreak() );

	// Resolution

	var resolutionRow = new UIRow();
	container.add( resolutionRow );

	resolutionRow.add( new UIText( 'Resolution' ).setWidth( '90px' ) );

	var videoWidth = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' );
	resolutionRow.add( videoWidth );

	resolutionRow.add( new UIText( '×' ).setTextAlign( 'center' ).setFontSize( '12px' ).setWidth( '12px' ) );

	var videoHeight = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' );
	resolutionRow.add( videoHeight );

	var videoFPS = new UIInteger( 30 ).setTextAlign( 'center' ).setWidth( '20px' );
	resolutionRow.add( videoFPS );

	resolutionRow.add( new UIText( 'fps' ).setFontSize( '12px' ) );

	// Duration

	var videoDurationRow = new UIRow();
	videoDurationRow.add( new UIText( 'Duration' ).setWidth( '90px' ) );

	var videoDuration = new UIInteger( 10 );
	videoDurationRow.add( videoDuration );

	container.add( videoDurationRow );

	// Render

	container.add( new UIText( '' ).setWidth( '90px' ) );

	const progress = new UIProgress( 0 );
	progress.setDisplay( 'none' );
	progress.setWidth( '170px' );
	container.add( progress );

	const renderButton = new UIButton( 'RENDER' );
	renderButton.setWidth( '170px' );
	renderButton.onClick( async () => {
		console.time('Video encoding mp4-h264');

		renderButton.setDisplay( 'none' );
		progress.setDisplay( '' );
		progress.setValue( 0 );

		const player = new APP.Player();
		player.load( editor.toJSON() );
		player.setPixelRatio( 1 );
		player.setSize( videoWidth.getValue(), videoHeight.getValue() );

		const canvas = player.dom.firstElementChild;

		const fps = videoFPS.getValue();
		const duration = videoDuration.getValue();
		const frames = Math.floor(duration * fps);

		const Encoder = await lazyLoadEncoder();

		// Ideally the user could choose this sort of thing
		const preset = "medium";
		const presetOpts = {
			medium: {
				kbps: 1200,
				speed: 5,
				qpMax: 20,
				temporalDenoise: true,
			},
			low: {
				speed: 0,
				kbps: 1200 / 2,
				qpMax: 40,
				temporalDenoise: true,
			},
			high: {
				speed: 5,
			},
		}[preset];
		console.log("Encoding with Compression Preset", preset);

		// Create a new encoder interface
		const encoder = Encoder.create({
			...presetOpts,
			width: canvas.width,
			height: canvas.height,
			fps: fps,
		});

		let currentTime = 0;
		const canvasCopy = document.createElement('canvas');
		canvasCopy.width = canvas.width;
		canvasCopy.height = canvas.height;
		const contextCopy = canvasCopy.getContext('2d');
		const frameArray = new Array(frames).fill(0).map((_, i) => i);
		for (let i of frameArray) {

			player.render( currentTime );
			contextCopy.drawImage(canvas, 0, 0);
			const rgba = contextCopy.getImageData(0, 0, canvas.width, canvas.height).data;
			encoder.encodeRGB(rgba);

			currentTime += 1 / fps;

			progress.setValue( i / frames );
			await new Promise((resolve) => setTimeout(resolve, 0));

		}

		const mp4 = encoder.end();

		save( new Blob([mp4], { type: "video/mp4" }), 'out.mp4' );

		player.dispose();

		renderButton.setDisplay( '' );
		progress.setDisplay( 'none' );

		console.timeEnd('Video encoding mp4-h264');
	} );
	container.add( renderButton );

	// SAVE

	const link = document.createElement( 'a' );

	function save( blob, filename ) {

		link.href = URL.createObjectURL( blob );
		link.download = filename;
		link.dispatchEvent( new MouseEvent( 'click' ) );

		URL.revokeObjectURL( link.href );

	}

	//

	return container;

}

export { SidebarProjectVideo };
