import { UIBreak, UIButton, UIInteger, UIPanel, UIRow, UIText } from './libs/ui.js';

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

	resolutionRow.add( new UIText( strings.getKey( 'sidebar/project/resolution' ) ).setClass( 'Label' ) );

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
	videoDurationRow.add( new UIText( strings.getKey( 'sidebar/project/duration' ) ).setClass( 'Label' ) );

	const videoDuration = new UIInteger( 10 );
	videoDurationRow.add( videoDuration );

	container.add( videoDurationRow );

	// Render

	const renderButton = new UIButton( strings.getKey( 'sidebar/project/render' ) );
	renderButton.setWidth( '170px' );
	renderButton.setMarginLeft( '120px' );
	renderButton.onClick( async () => {

		const player = new APP.Player();
		player.load( editor.toJSON() );
		player.setPixelRatio( 1 );
		player.setSize( videoWidth.getValue(), videoHeight.getValue() );

		//

		const width = videoWidth.getValue() / window.devicePixelRatio;
		const height = videoHeight.getValue() / window.devicePixelRatio;

		const canvas = player.canvas;
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';

		const left = ( screen.width - width ) / 2;
		const top = ( screen.height - height ) / 2;

		const output = window.open( '', '_blank', `location=no,left=${left},top=${top},width=${width},height=${height}` );

		const meta = document.createElement( 'meta' );
		meta.name = 'viewport';
		meta.content = 'width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0';
		output.document.head.appendChild( meta );

		output.document.body.style.background = '#000';
		output.document.body.style.margin = '0px';
		output.document.body.style.overflow = 'hidden';
		output.document.body.appendChild( canvas );

		const progress = document.createElement( 'progress' );
		progress.style.position = 'absolute';
		progress.style.top = '10px';
		progress.style.left = ( ( width - 170 ) / 2 ) + 'px';
		progress.style.width = '170px';
		progress.value = 0;
		output.document.body.appendChild( progress );

		//

		const { createFFmpeg, fetchFile } = FFmpeg; // eslint-disable-line no-undef
		const ffmpeg = createFFmpeg( { log: true } );

		await ffmpeg.load();

		ffmpeg.setProgress( ( { ratio } ) => {

			progress.value = ( ratio * 0.5 ) + 0.5;

		} );

		const fps = videoFPS.getValue();
		const duration = videoDuration.getValue();
		const frames = duration * fps;

		let currentTime = 0;

		for ( let i = 0; i < frames; i ++ ) {

			player.render( currentTime );

			const num = i.toString().padStart( 5, '0' );
			ffmpeg.FS( 'writeFile', `tmp.${num}.png`, await fetchFile( canvas.toDataURL() ) );
			currentTime += 1 / fps;

			progress.value = ( i / frames ) * 0.5;

		}

		await ffmpeg.run( '-framerate', String( fps ), '-pattern_type', 'glob', '-i', '*.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', String( 5 ), 'out.mp4' );

		const data = ffmpeg.FS( 'readFile', 'out.mp4' );

		for ( let i = 0; i < frames; i ++ ) {

			const num = i.toString().padStart( 5, '0' );
			ffmpeg.FS( 'unlink', `tmp.${num}.png` );

		}

		output.document.body.removeChild( canvas );
		output.document.body.removeChild( progress );

		const video = document.createElement( 'video' );
		video.width = width;
		video.height = height;
		video.controls = true;
		video.loop = true;
		video.src = URL.createObjectURL( new Blob( [ data.buffer ], { type: 'video/mp4' } ) );
		output.document.body.appendChild( video );

		player.dispose();

	} );
	container.add( renderButton );

	//

	return container;

}

export { SidebarProjectVideo };
