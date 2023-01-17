import { UIBreak, UIButton, UIInteger, UIPanel, UIProgress, UIRow, UIText } from './libs/ui.js';

import { APP } from './libs/app.js';

function SidebarProjectVideo( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setId( 'render' );

	// Video

	container.add( new UIText( strings.getKey( 'sidebar/project/video' ) ).setTextTransform( 'uppercase' ) );
	container.add( new UIBreak(), new UIBreak() );

	// Resolution

	const resolutionRow = new UIRow();
	container.add( resolutionRow );

	resolutionRow.add( new UIText( strings.getKey( 'sidebar/project/resolution' ) ).setWidth( '90px' ) );

	const videoWidth = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' );
	resolutionRow.add( videoWidth );

	resolutionRow.add( new UIText( '×' ).setTextAlign( 'center' ).setFontSize( '12px' ).setWidth( '12px' ) );

	const videoHeight = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' );
	resolutionRow.add( videoHeight );

	const videoFPS = new UIInteger( 30 ).setTextAlign( 'center' ).setWidth( '20px' );
	resolutionRow.add( videoFPS );

	resolutionRow.add( new UIText( 'fps' ).setFontSize( '12px' ) );

	// Duration

	const videoDurationRow = new UIRow();
	videoDurationRow.add( new UIText( strings.getKey( 'sidebar/project/duration' ) ).setWidth( '90px' ) );

	const videoDuration = new UIInteger( 10 );
	videoDurationRow.add( videoDuration );

	container.add( videoDurationRow );

	// Render

	container.add( new UIText( '' ).setWidth( '90px' ) );

	const progress = new UIProgress( 0 );
	progress.setDisplay( 'none' );
	progress.setWidth( '170px' );
	container.add( progress );

	const renderButton = new UIButton( strings.getKey( 'sidebar/project/render' ) ).setTextTransform( 'uppercase' );
	renderButton.setWidth( '170px' );
	renderButton.onClick( async () => {

		renderButton.setDisplay( 'none' );
		progress.setDisplay( '' );
		progress.setValue( 0 );

		const player = new APP.Player();
		player.load( editor.toJSON() );
		player.setPixelRatio( 1 );
		player.setSize( videoWidth.getValue(), videoHeight.getValue() );

		const canvas = player.dom.firstElementChild;

		//

		const width = videoWidth.getValue();
		const height = videoHeight.getValue();

		const duration = videoDuration.getValue();
		const fps = videoFPS.getValue();
		const frames = duration * fps;
		const frameDuration = Math.floor( 1_000_000 / fps );

		//

		const mp4 = MP4Box.createFile(); // eslint-disable-line no-undef
		let trackID = null;
		let frame = 0;

		const encoder = new VideoEncoder( {

			output: function ( chunk, config ) {

				if ( trackID === null ) {

					trackID = mp4.addTrack( {
						timescale: 1_000 * 1_000,
						width: width,
						height: height,
						nb_samples: frames,
						media_duration: duration * 1_000 * 1_000,
						avcDecoderConfigRecord: config.decoderConfig.description
					} );

				}

				let uint8 = new ArrayBuffer( chunk.byteLength );
				chunk.copyTo( uint8 );

				mp4.addSample( trackID, uint8, {
					dts: chunk.timestamp,
					cts: chunk.timestamp,
					duration: chunk.duration,
					is_sync: chunk.type === 'key'
				} );

				frame ++;

				if ( frame === frames ) {

					encoder.close();
					
					mp4.save( "mp4box.mp4" );

					renderButton.setDisplay( '' );
					progress.setDisplay( 'none' );

				}

				progress.setValue( ( frame / frames ) * 0.5 + 0.5 );

			},

			error: function ( error ) {

				console.error( error );

			}

		} );

		encoder.configure( {

			codec: 'avc1.640020',
			width: width,
			height: height,
			framerate: fps,
			bitrate: 50_000_000 // Doesn't seem to work?

		} );

		let currentTime = 0;
		let nextKeyFrameTime = 0;

		for ( let i = 0; i < frames; i ++ ) {

			currentTime = i * frameDuration;

			player.render( currentTime / 1_000_000 );

			const frame = new VideoFrame( canvas, { timestamp: currentTime, duration: frameDuration } );

			const isKeyFrame = currentTime >= nextKeyFrameTime;
			if ( isKeyFrame ) nextKeyFrameTime += 2_000_000;

			encoder.encode( frame, { keyFrame: isKeyFrame } );

			frame.close();

			progress.setValue( ( i / frames ) * 0.5 );

		}

		player.dispose();

	} );
	container.add( renderButton );

	//

	return container;

}

export { SidebarProjectVideo };
