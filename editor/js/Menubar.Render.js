import * as THREE from 'three';

import { UIPanel, UIRow, UIButton, UIInteger, UISelect, UIText } from './libs/ui.js';

import { ViewportPathtracer } from './Viewport.Pathtracer.js';
import { APP } from './libs/app.js';

function MenubarRender( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/render' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Image

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/render/image' ) );
	option.onClick( function () {

		showImageDialog();

	} );
	options.add( option );

	// Video

	if ( 'SharedArrayBuffer' in window ) {

		option = new UIRow();
		option.setClass( 'option' );
		option.setTextContent( strings.getKey( 'menubar/render/video' ) );
		option.onClick( function () {

			showVideoDialog();

		} );
		options.add( option );

	}

	// Image Dialog

	function showImageDialog() {

		const dialog = new RenderImageDialog( editor, strings );
		document.body.appendChild( dialog.dom );

	}

	// Video Dialog

	function showVideoDialog() {

		const dialog = new RenderVideoDialog( editor, strings );
		document.body.appendChild( dialog.dom );

	}

	return container;

}

class RenderImageDialog {

	constructor( editor, strings ) {

		const dom = document.createElement( 'div' );
		dom.className = 'Dialog';
		this.dom = dom;

		const background = document.createElement( 'div' );
		background.className = 'Dialog-background';
		background.addEventListener( 'click', () => this.close() );
		dom.appendChild( background );

		const content = document.createElement( 'div' );
		content.className = 'Dialog-content';
		dom.appendChild( content );

		// Title

		const titleBar = document.createElement( 'div' );
		titleBar.className = 'Dialog-title';
		titleBar.textContent = strings.getKey( 'menubar/render' ) + ' ' + strings.getKey( 'menubar/render/image' );
		content.appendChild( titleBar );

		// Body

		const body = document.createElement( 'div' );
		body.className = 'Dialog-body';
		content.appendChild( body );

		// Shading

		const shadingRow = new UIRow();
		body.appendChild( shadingRow.dom );

		shadingRow.add( new UIText( strings.getKey( 'sidebar/project/shading' ) ).setClass( 'Label' ) );

		const shadingTypeSelect = new UISelect().setOptions( {
			'solid': 'SOLID',
			'realistic': 'REALISTIC'
		} ).setWidth( '170px' ).onChange( refreshShadingRow ).setValue( 'solid' );
		shadingRow.add( shadingTypeSelect );

		const pathTracerMinSamples = 3;
		const pathTracerMaxSamples = 65536;
		const samplesNumber = new UIInteger( 16 ).setRange( pathTracerMinSamples, pathTracerMaxSamples );

		const samplesRow = new UIRow();
		samplesRow.add( new UIText( strings.getKey( 'sidebar/project/image/samples' ) ).setClass( 'Label' ) );
		samplesRow.add( samplesNumber );
		body.appendChild( samplesRow.dom );

		function refreshShadingRow() {

			samplesRow.setHidden( shadingTypeSelect.getValue() !== 'realistic' );

		}

		refreshShadingRow();

		// Resolution

		const resolutionRow = new UIRow();
		body.appendChild( resolutionRow.dom );

		resolutionRow.add( new UIText( strings.getKey( 'sidebar/project/resolution' ) ).setClass( 'Label' ) );

		const imageWidth = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' );
		resolutionRow.add( imageWidth );

		resolutionRow.add( new UIText( '\u00D7' ).setTextAlign( 'center' ).setFontSize( '12px' ).setWidth( '12px' ) );

		const imageHeight = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' );
		resolutionRow.add( imageHeight );

		// Buttons

		const buttonsRow = document.createElement( 'div' );
		buttonsRow.className = 'Dialog-buttons';
		body.appendChild( buttonsRow );

		const renderButton = new UIButton( strings.getKey( 'sidebar/project/render' ) );
		renderButton.setWidth( '80px' );
		renderButton.onClick( async () => {

			if ( shadingTypeSelect.getValue() === 'realistic' ) {

				let isMaterialsValid = true;

				editor.scene.traverseVisible( ( object ) => {

					if ( object.isMesh ) {

						const materials = Array.isArray( object.material ) ? object.material : [ object.material ];

						for ( let i = 0; i < materials.length; i ++ ) {

							const material = materials[ i ];

							if ( ! material.isMeshStandardMaterial ) {

								isMaterialsValid = false;
								return;

							}

						}

					}

				} );

				if ( isMaterialsValid === false ) {

					alert( strings.getKey( 'prompt/rendering/realistic/unsupportedMaterial' ) );
					return;

				}

			}

			//

			const json = editor.toJSON();
			const project = json.project;

			//

			const loader = new THREE.ObjectLoader();

			const camera = loader.parse( json.camera );
			camera.aspect = imageWidth.getValue() / imageHeight.getValue();
			camera.updateProjectionMatrix();
			camera.updateMatrixWorld();

			const scene = loader.parse( json.scene );

			const renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setSize( imageWidth.getValue(), imageHeight.getValue() );

			if ( project.shadows !== undefined ) renderer.shadowMap.enabled = project.shadows;
			if ( project.shadowType !== undefined ) renderer.shadowMap.type = project.shadowType;
			if ( project.toneMapping !== undefined ) renderer.toneMapping = project.toneMapping;
			if ( project.toneMappingExposure !== undefined ) renderer.toneMappingExposure = project.toneMappingExposure;

			// popup

			const width = imageWidth.getValue() / window.devicePixelRatio;
			const height = imageHeight.getValue() / window.devicePixelRatio;

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

			const canvas = renderer.domElement;
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
			output.document.body.appendChild( canvas );

			//

			switch ( shadingTypeSelect.getValue() ) {

				case 'solid':

					renderer.render( scene, camera );
					renderer.dispose();

					break;

				case 'realistic':

					const status = document.createElement( 'div' );
					status.style.position = 'absolute';
					status.style.top = '10px';
					status.style.left = '10px';
					status.style.color = 'white';
					status.style.fontFamily = 'system-ui';
					status.style.fontSize = '12px';
					output.document.body.appendChild( status );

					const pathTracer = new ViewportPathtracer( renderer );
					pathTracer.init( scene, camera );
					pathTracer.setSize( imageWidth.getValue(), imageHeight.getValue() );

					const maxSamples = Math.max( pathTracerMinSamples, Math.min( pathTracerMaxSamples, samplesNumber.getValue() ) );

					function animate() {

						if ( output.closed === true ) return;

						const samples = Math.floor( pathTracer.getSamples() ) + 1;

						if ( samples < maxSamples ) {

							requestAnimationFrame( animate );

						}

						pathTracer.update();

						const progress = Math.floor( samples / maxSamples * 100 );

						status.textContent = `${ samples } / ${ maxSamples } ( ${ progress }% )`;

						if ( progress === 100 ) {

							status.textContent += ' \u2713';

						}

					}

					animate();

					break;

			}

			this.close();

		} );
		buttonsRow.appendChild( renderButton.dom );

		const cancelButton = new UIButton( strings.getKey( 'menubar/render/cancel' ) );
		cancelButton.setWidth( '80px' );
		cancelButton.setMarginLeft( '8px' );
		cancelButton.onClick( () => this.close() );
		buttonsRow.appendChild( cancelButton.dom );

	}

	close() {

		this.dom.remove();

	}

}

class RenderVideoDialog {

	constructor( editor, strings ) {

		const dom = document.createElement( 'div' );
		dom.className = 'Dialog';
		this.dom = dom;

		const background = document.createElement( 'div' );
		background.className = 'Dialog-background';
		background.addEventListener( 'click', () => this.close() );
		dom.appendChild( background );

		const content = document.createElement( 'div' );
		content.className = 'Dialog-content';
		dom.appendChild( content );

		// Title

		const titleBar = document.createElement( 'div' );
		titleBar.className = 'Dialog-title';
		titleBar.textContent = strings.getKey( 'menubar/render' ) + ' ' + strings.getKey( 'menubar/render/video' );
		content.appendChild( titleBar );

		// Body

		const body = document.createElement( 'div' );
		body.className = 'Dialog-body';
		content.appendChild( body );

		// Resolution

		function toDiv2() {

			this.setValue( 2 * Math.floor( this.getValue() / 2 ) );

		}

		const resolutionRow = new UIRow();
		body.appendChild( resolutionRow.dom );

		resolutionRow.add( new UIText( strings.getKey( 'sidebar/project/resolution' ) ).setClass( 'Label' ) );

		const videoWidth = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' ).setStep( 2 ).onChange( toDiv2 );
		resolutionRow.add( videoWidth );

		resolutionRow.add( new UIText( '\u00D7' ).setTextAlign( 'center' ).setFontSize( '12px' ).setWidth( '12px' ) );

		const videoHeight = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' ).setStep( 2 ).onChange( toDiv2 );
		resolutionRow.add( videoHeight );

		const videoFPS = new UIInteger( 30 ).setTextAlign( 'center' ).setWidth( '20px' );
		resolutionRow.add( videoFPS );

		resolutionRow.add( new UIText( 'fps' ).setFontSize( '12px' ) );

		// Duration

		const videoDurationRow = new UIRow();
		videoDurationRow.add( new UIText( strings.getKey( 'sidebar/project/duration' ) ).setClass( 'Label' ) );
		body.appendChild( videoDurationRow.dom );

		const videoDuration = new UIInteger( 10 );
		videoDurationRow.add( videoDuration );

		// Buttons

		const buttonsRow = document.createElement( 'div' );
		buttonsRow.className = 'Dialog-buttons';
		body.appendChild( buttonsRow );

		const renderButton = new UIButton( strings.getKey( 'sidebar/project/render' ) );
		renderButton.setWidth( '80px' );
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
			encodingText.textContent = ' encoding';
			encodingText.hidden = true;
			status.appendChild( encodingText );

			const encodingStatus = document.createElement( 'span' );
			encodingStatus.hidden = true;
			status.appendChild( encodingStatus );

			const videoSizeText = document.createElement( 'span' );
			videoSizeText.textContent = ' size';
			videoSizeText.hidden = true;
			status.appendChild( videoSizeText );

			const videoSizeStatus = document.createElement( 'span' );
			videoSizeStatus.hidden = true;
			status.appendChild( videoSizeStatus );

			const completedStatus = document.createElement( 'span' );
			completedStatus.textContent = ' \u2713';
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

			this.close();

		} );
		buttonsRow.appendChild( renderButton.dom );

		const cancelButton = new UIButton( strings.getKey( 'menubar/render/cancel' ) );
		cancelButton.setWidth( '80px' );
		cancelButton.setMarginLeft( '8px' );
		cancelButton.onClick( () => this.close() );
		buttonsRow.appendChild( cancelButton.dom );

	}

	close() {

		this.dom.remove();

	}

}

function formatFileSize( sizeB, K = 1024 ) {

	if ( sizeB === 0 ) return '0B';

	const sizes = [ sizeB, sizeB / K, sizeB / K / K ].reverse();
	const units = [ 'B', 'KB', 'MB' ].reverse();
	const index = sizes.findIndex( size => size >= 1 );

	return new Intl.NumberFormat( 'en-us', { useGrouping: true, maximumFractionDigits: 1 } )
		.format( sizes[ index ] ) + units[ index ];

}

export { MenubarRender };
