import { UIBreak, UIButton, UIInteger, UIPanel, UIProgress, UIRow, UIText, UISelect } from './libs/ui.js';

import { APP } from './libs/app.js';

import { simd } from "https://unpkg.com/wasm-feature-detect?module";
import loadEncoder from "https://unpkg.com/mp4-h264";

const qualityPresets = {
	low: {
		groupOfPictures: 24,
		speed: 4,
		kbps: 600,
		qpMin: 24,
		qpMax: 36,
		temporalDenoise: true
	},
	medium: {
		groupOfPictures: 20,
		speed: 5,
		kbps: 1200,
		qpMin: 18,
		qpMax: 24,
		temporalDenoise: true
	},
	high: {
		groupOfPictures: 16,
		speed: 3,
		kbps: 1600,
		qpMin: 11,
		qpMax: 18,
		temporalDenoise: true
	},
	veryhigh: {
		groupOfPictures: 16,
		speed: 1
	},
};

let lazyEncoderPromise;

function lazyLoadEncoder() {
	if ( lazyEncoderPromise != null ) return lazyEncoderPromise;
	lazyEncoderPromise = simd().then(isSIMD => {
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

	// Quality

	var videoQualityRow = new UIRow();
	videoQualityRow.add( new UIText( 'Quality' ).setWidth( '90px' ) );

	var videoQuality = new UISelect( 'Quality' ).setOptions({
		low: 'Low',
		medium: 'Medium',
		high: 'High',
		veryhigh: 'Very High'
	}).setValue( 'medium' );
	videoQualityRow.add( videoQuality );

	container.add( videoQualityRow );

	// Render

	container.add( new UIText( '' ).setWidth( '90px' ) );

	const progress = new UIProgress( 0 );
	progress.setDisplay( 'none' );
	progress.setWidth( '170px' );
	container.add( progress );

	const renderButton = new UIButton( 'RENDER' );
	renderButton.setWidth( '170px' );
	renderButton.onClick( async () => {
		console.time( 'Video encoding mp4-h264' );

		renderButton.setDisplay( 'none' );
		progress.setDisplay( '' );
		progress.setValue( 0 );

		const width = videoWidth.getValue();
		const height = videoHeight.getValue();
		const fps = videoFPS.getValue();
		const quality = videoQuality.getValue();
		const duration = videoDuration.getValue();
		const frames = Math.floor( duration * fps );

		const player = new APP.Player();
		player.load( editor.toJSON() );
		player.setPixelRatio( 1 );
		player.setSize( width, height );

		const canvas = player.dom.firstElementChild;

		const Encoder = await lazyLoadEncoder();

		const presetOpts = qualityPresets[quality];
		console.log( "Encoding with Compression Preset", quality, presetOpts );

		// Create a new encoder interface
		const encoder = Encoder.create({
			...presetOpts,
			width: width,
			height: height,
			fps: fps,
		});

		let currentTime = 0;
		const canvasCopy = document.createElement( 'canvas' );
		canvasCopy.width = width;
		canvasCopy.height = height;
		const contextCopy = canvasCopy.getContext( '2d' );
		for (let i = 0; i < frames; i++) {
			player.render( currentTime );
			contextCopy.drawImage( canvas, 0, 0 );
			const rgba = contextCopy.getImageData( 0, 0, width, height ).data;
			encoder.encodeRGB( rgba );

			currentTime += 1 / fps;

			progress.setValue( i / frames );
			await new Promise(resolve => setTimeout( resolve, 0 ));
		}

		const mp4 = encoder.end();

		save( new Blob([mp4], { type: 'video/mp4' }), 'out-' + width + 'x' + height + '-' + fps + 'fps-' + quality +'.mp4' );

		player.dispose();

		renderButton.setDisplay( '' );
		progress.setDisplay( 'none' );

		console.timeEnd( 'Video encoding mp4-h264' );
	} );
	container.add( renderButton );

	// SAVE

	const link = document.createElement( 'a' );

	function save( blob, filename ) {

		// revoke previously downloaded URL, if any
		if ( link.href ) {

			URL.revokeObjectURL( link.href );

		}

		link.href = URL.createObjectURL( blob );
		link.download = filename;
		link.dispatchEvent( new MouseEvent( 'click' ) );

	}

	//

	return container;

}

export { SidebarProjectVideo };
