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

	function toDiv2() {

		// Make sure dimensions are divisible by 2 (requirement of libx264)

		this.setValue( 2 * Math.floor( this.getValue() / 2 ) );

	}

	const resolutionRow = new UIRow();
	container.add( resolutionRow );

	resolutionRow.add( new UIText( strings.getKey( 'sidebar/project/resolution' ) ).setClass( 'Label' ) );

	const videoWidth = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' ).setStep( 2 ).onChange( toDiv2 );
	resolutionRow.add( videoWidth );

	resolutionRow.add( new UIText( '×' ).setTextAlign( 'center' ).setFontSize( '12px' ).setWidth( '12px' ) );

	const videoHeight = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' ).setStep( 2 ).onChange( toDiv2 );
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

		const status = document.createElement( 'div' );
		status.style.position = 'absolute';
		status.style.top = '10px';
		status.style.left = '10px';
		status.style.color = 'white';
		status.style.fontFamily = 'system-ui';
		status.style.fontSize = '12px';
		status.style.textShadow = '0 0 2px black';
		output.document.body.appendChild( status );

		const writeFileStatus = document.createElement( 'span' );
		status.appendChild( writeFileStatus );

		const encodingText = document.createElement( 'span' );
		encodingText.textContent = ' encoding'; // TODO: l10n
		encodingText.hidden = true;
		status.appendChild( encodingText );

		const encodingStatus = document.createElement( 'span' );
		encodingStatus.hidden = true;
		status.appendChild( encodingStatus );

		const videoSizeText = document.createElement( 'span' );
		videoSizeText.textContent = ' size'; // TODO: l10n
		videoSizeText.hidden = true;
		status.appendChild( videoSizeText );

		const videoSizeStatus = document.createElement( 'span' );
		videoSizeStatus.hidden = true;
		status.appendChild( videoSizeStatus );

		const completedStatus = document.createElement( 'span' );
		completedStatus.textContent = ' ✓';
		completedStatus.hidden = true;
		status.appendChild( completedStatus );

		const video = document.createElement( 'video' );
		video.width = width;
		video.height = height;
		video.controls = true;
		video.loop = true;
		video.hidden = true;
		output.document.body.appendChild( video );

		//

		const { createFFmpeg, fetchFile } = FFmpeg; // eslint-disable-line no-undef
		const ffmpeg = createFFmpeg( { log: true } );

		await ffmpeg.load();

		ffmpeg.setProgress( ( { ratio } ) => {

			encodingStatus.textContent = `( ${ Math.floor( ratio * 100 ) }% )`;

		} );

		output.addEventListener( 'unload', function () {

			if ( video.src.startsWith( 'blob:' ) ) {

				URL.revokeObjectURL( video.src );

			} else {

				ffmpeg.exit();

			}

		} );

		const fps = videoFPS.getValue();
		const duration = videoDuration.getValue();
		const frames = duration * fps;

		//

		await ( async function () {

			let currentTime = 0;

			for ( let i = 0; i < frames; i ++ ) {

				player.render( currentTime );

				const num = i.toString().padStart( 5, '0' );

				if ( output.closed ) return;

				ffmpeg.FS( 'writeFile', `tmp.${num}.png`, await fetchFile( canvas.toDataURL() ) );
				currentTime += 1 / fps;

				const frame = i + 1;
				const progress = Math.floor( frame / frames * 100 );
				writeFileStatus.textContent = `${ frame } / ${ frames } ( ${ progress }% )`;

			}

			encodingText.hidden = false;
			encodingStatus.hidden = false;

			await ffmpeg.run( '-framerate', String( fps ), '-pattern_type', 'glob', '-i', '*.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', String( 5 ), 'out.mp4' );

			const videoData = ffmpeg.FS( 'readFile', 'out.mp4' );

			for ( let i = 0; i < frames; i ++ ) {

				const num = i.toString().padStart( 5, '0' );
				ffmpeg.FS( 'unlink', `tmp.${num}.png` );

			}

			ffmpeg.FS( 'unlink', 'out.mp4' );

			output.document.body.removeChild( canvas );

			videoSizeText.hidden = false;
			videoSizeStatus.textContent = `( ${ formatFileSize( videoData.buffer.byteLength ) } )`;
			videoSizeStatus.hidden = false;

			completedStatus.hidden = false;

			video.src = URL.createObjectURL( new Blob( [ videoData.buffer ], { type: 'video/mp4' } ) );
			video.hidden = false;

		} )();

		player.dispose();

	} );
	container.add( renderButton );

	//

	return container;

}

function formatFileSize( sizeB, K = 1024 ) {

	if ( sizeB === 0 ) return '0B';

	const sizes = [ sizeB, sizeB / K, sizeB / K / K ].reverse();
	const units = [ 'B', 'KB', 'MB' ].reverse();
	const index = sizes.findIndex( size => size >= 1 );

	return new Intl.NumberFormat( 'en-us', { useGrouping: true, maximumFractionDigits: 1 } )
		.format( sizes[ index ] ) + units[ index ];

}

export { SidebarProjectVideo };
