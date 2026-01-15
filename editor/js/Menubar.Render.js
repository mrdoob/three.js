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

	if ( 'VideoEncoder' in window ) {

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

			const camera = await loader.parseAsync( json.camera );
			camera.aspect = imageWidth.getValue() / imageHeight.getValue();
			camera.updateProjectionMatrix();
			camera.updateMatrixWorld();

			const scene = await loader.parseAsync( json.scene );

			const renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true } );
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

		// Quality

		const qualityRow = new UIRow();
		qualityRow.add( new UIText( strings.getKey( 'menubar/render/quality' ) ).setClass( 'Label' ) );
		body.appendChild( qualityRow.dom );

		const videoQuality = new UISelect().setOptions( {
			'low': 'Low',
			'medium': 'Medium',
			'high': 'High',
			'ultra': 'Ultra'
		} ).setWidth( '170px' ).setValue( 'high' );
		qualityRow.add( videoQuality );

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

			const video = document.createElement( 'video' );
			video.width = width;
			video.height = height;
			video.controls = true;
			video.loop = true;
			video.hidden = true;
			output.document.body.appendChild( video );

			output.addEventListener( 'unload', function () {

				if ( video.src.startsWith( 'blob:' ) ) {

					URL.revokeObjectURL( video.src );

				}

			} );

			//

			const fps = videoFPS.getValue();
			const duration = videoDuration.getValue();
			const frames = duration * fps;

			const encodedChunks = [];
			let codecConfig = null;

			const videoEncoder = new VideoEncoder( {

				output: ( chunk, metadata ) => {

					if ( metadata?.decoderConfig?.description ) {

						codecConfig = new Uint8Array( metadata.decoderConfig.description );

					}

					const chunkData = new Uint8Array( chunk.byteLength );
					chunk.copyTo( chunkData );
					encodedChunks.push( { data: chunkData, timestamp: chunk.timestamp, type: chunk.type } );

				},
				error: ( e ) => console.error( 'VideoEncoder error:', e )

			} );

			const qualityToBitrate = {
				'low': 2e6,
				'medium': 5e6, 
				'high': 10e6,
				'ultra': 20e6
			};

			videoEncoder.configure( {
				codec: 'avc1.640028',
				width: videoWidth.getValue(),
				height: videoHeight.getValue(),
				bitrate: qualityToBitrate[ videoQuality.getValue() ],
				framerate: fps,
				avc: { format: 'avc' }
			} );

			let currentTime = 0;
			let aborted = false;

			for ( let i = 0; i < frames; i ++ ) {

				if ( output.closed ) {

					aborted = true;
					break;

				}

				player.render( currentTime );

				const bitmap = await createImageBitmap( canvas );
				const frame = new VideoFrame( bitmap, { timestamp: i * ( 1_000_000 / fps ) } );

				videoEncoder.encode( frame, { keyFrame: i % fps === 0 } );
				frame.close();
				bitmap.close();

				currentTime += 1 / fps;

				const progress = Math.floor( ( i + 1 ) / frames * 100 );
				status.textContent = `${ i + 1 } / ${ frames } ( ${ progress }% )`;

			}

			if ( ! aborted ) {

				await videoEncoder.flush();
				videoEncoder.close();

				output.document.body.removeChild( canvas );

				const mp4Data = createMP4( encodedChunks, codecConfig, videoWidth.getValue(), videoHeight.getValue(), fps );

				status.textContent = `${ frames } / ${ frames } ( 100% ) ${ formatFileSize( mp4Data.byteLength ) } \u2713`;

				video.src = URL.createObjectURL( new Blob( [ mp4Data ], { type: 'video/mp4' } ) );
				video.hidden = false;

			}

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

// Simple MP4 muxer for H.264 encoded chunks

function createMP4( chunks, avcC, width, height, fps ) {

	const timescale = 90000;
	const frameDuration = timescale / fps;

	function u32( value ) {

		return new Uint8Array( [ ( value >> 24 ) & 0xFF, ( value >> 16 ) & 0xFF, ( value >> 8 ) & 0xFF, value & 0xFF ] );

	}

	function u16( value ) {

		return new Uint8Array( [ ( value >> 8 ) & 0xFF, value & 0xFF ] );

	}

	function str( s ) {

		return new TextEncoder().encode( s );

	}

	function concat( ...arrays ) {

		const totalLength = arrays.reduce( ( sum, arr ) => sum + arr.length, 0 );
		const result = new Uint8Array( totalLength );
		let offset = 0;
		for ( const arr of arrays ) {

			result.set( arr, offset );
			offset += arr.length;

		}

		return result;

	}

	function box( type, ...contents ) {

		const data = concat( ...contents );
		const size = data.length + 8;
		return concat( u32( size ), str( type ), data );

	}

	function fullBox( type, version, flags, ...contents ) {

		return box( type, new Uint8Array( [ version, ( flags >> 16 ) & 0xFF, ( flags >> 8 ) & 0xFF, flags & 0xFF ] ), ...contents );

	}

	// ftyp
	const ftyp = box( 'ftyp',
		str( 'isom' ),
		u32( 512 ),
		str( 'isom' ), str( 'iso2' ), str( 'avc1' ), str( 'mp41' )
	);

	// Collect sample info
	const sampleSizes = [];
	const syncSamples = [];

	for ( let i = 0; i < chunks.length; i ++ ) {

		sampleSizes.push( chunks[ i ].data.length );
		if ( chunks[ i ].type === 'key' ) syncSamples.push( i + 1 );

	}

	// mdat
	let mdatSize = 8;
	for ( const chunk of chunks ) mdatSize += chunk.data.length;

	// stsd - Sample Description
	const avc1 = box( 'avc1',
		new Uint8Array( 6 ), // reserved
		u16( 1 ), // data reference index
		new Uint8Array( 16 ), // pre-defined + reserved
		u16( width ),
		u16( height ),
		u32( 0x00480000 ), // horizontal resolution 72 dpi
		u32( 0x00480000 ), // vertical resolution 72 dpi
		u32( 0 ), // reserved
		u16( 1 ), // frame count
		new Uint8Array( 32 ), // compressor name
		u16( 0x0018 ), // depth
		new Uint8Array( [ 0xFF, 0xFF ] ), // pre-defined
		box( 'avcC', avcC )
	);

	const stsd = fullBox( 'stsd', 0, 0, u32( 1 ), avc1 );

	// stts - Time-to-Sample
	const stts = fullBox( 'stts', 0, 0,
		u32( 1 ),
		u32( chunks.length ),
		u32( frameDuration )
	);

	// stsc - Sample-to-Chunk
	const stsc = fullBox( 'stsc', 0, 0,
		u32( 1 ),
		u32( 1 ), u32( chunks.length ), u32( 1 )
	);

	// stsz - Sample Sizes
	const stszData = [ u32( 0 ), u32( chunks.length ) ];
	for ( const size of sampleSizes ) stszData.push( u32( size ) );
	const stsz = fullBox( 'stsz', 0, 0, ...stszData );

	// stco - Chunk Offsets (placeholder, will be updated)
	const stco = fullBox( 'stco', 0, 0, u32( 1 ), u32( 0 ) );

	// stss - Sync Samples
	const stssData = [ u32( syncSamples.length ) ];
	for ( const sync of syncSamples ) stssData.push( u32( sync ) );
	const stss = fullBox( 'stss', 0, 0, ...stssData );

	// stbl
	const stbl = box( 'stbl', stsd, stts, stsc, stsz, stco, stss );

	// dinf
	const dref = fullBox( 'dref', 0, 0,
		u32( 1 ),
		fullBox( 'url ', 0, 1 )
	);
	const dinf = box( 'dinf', dref );

	// vmhd
	const vmhd = fullBox( 'vmhd', 0, 1, new Uint8Array( 8 ) );

	// minf
	const minf = box( 'minf', vmhd, dinf, stbl );

	// hdlr
	const hdlr = fullBox( 'hdlr', 0, 0,
		u32( 0 ), // pre-defined
		str( 'vide' ),
		new Uint8Array( 12 ), // reserved
		str( 'VideoHandler' ), new Uint8Array( 1 )
	);

	// mdhd
	const durationInTimescale = chunks.length * frameDuration;
	const mdhd = fullBox( 'mdhd', 0, 0,
		u32( 0 ), // creation time
		u32( 0 ), // modification time
		u32( timescale ),
		u32( durationInTimescale ),
		u16( 0x55C4 ), // language (und)
		u16( 0 ) // quality
	);

	// mdia
	const mdia = box( 'mdia', mdhd, hdlr, minf );

	// tkhd
	const tkhd = fullBox( 'tkhd', 0, 3,
		u32( 0 ), // creation time
		u32( 0 ), // modification time
		u32( 1 ), // track id
		u32( 0 ), // reserved
		u32( durationInTimescale ),
		new Uint8Array( 8 ), // reserved
		u16( 0 ), // layer
		u16( 0 ), // alternate group
		u16( 0 ), // volume
		u16( 0 ), // reserved
		// matrix
		u32( 0x00010000 ), u32( 0 ), u32( 0 ),
		u32( 0 ), u32( 0x00010000 ), u32( 0 ),
		u32( 0 ), u32( 0 ), u32( 0x40000000 ),
		u32( width << 16 ), // width (16.16 fixed point)
		u32( height << 16 ) // height (16.16 fixed point)
	);

	// trak
	const trak = box( 'trak', tkhd, mdia );

	// mvhd
	const mvhd = fullBox( 'mvhd', 0, 0,
		u32( 0 ), // creation time
		u32( 0 ), // modification time
		u32( timescale ),
		u32( durationInTimescale ),
		u32( 0x00010000 ), // rate (1.0)
		u16( 0x0100 ), // volume (1.0)
		new Uint8Array( 10 ), // reserved
		// matrix
		u32( 0x00010000 ), u32( 0 ), u32( 0 ),
		u32( 0 ), u32( 0x00010000 ), u32( 0 ),
		u32( 0 ), u32( 0 ), u32( 0x40000000 ),
		new Uint8Array( 24 ), // pre-defined
		u32( 2 ) // next track id
	);

	// moov
	const moov = box( 'moov', mvhd, trak );

	// Calculate actual mdat offset and update stco
	const mdatOffset = ftyp.length + moov.length;
	const moovArray = new Uint8Array( moov );
	// Find and update stco offset (search for 'stco' in moov)
	for ( let i = 0; i < moovArray.length - 16; i ++ ) {

		if ( moovArray[ i ] === 0x73 && moovArray[ i + 1 ] === 0x74 &&
			 moovArray[ i + 2 ] === 0x63 && moovArray[ i + 3 ] === 0x6F ) {

			// Found 'stco', offset value is at i + 12
			const offset = mdatOffset + 8;
			moovArray[ i + 12 ] = ( offset >> 24 ) & 0xFF;
			moovArray[ i + 13 ] = ( offset >> 16 ) & 0xFF;
			moovArray[ i + 14 ] = ( offset >> 8 ) & 0xFF;
			moovArray[ i + 15 ] = offset & 0xFF;
			break;

		}

	}

	// Update mdat size
	const mdatSizeBytes = u32( mdatSize );

	// Combine all parts
	const result = new Uint8Array( ftyp.length + moovArray.length + mdatSize );
	let offset = 0;
	result.set( ftyp, offset ); offset += ftyp.length;
	result.set( moovArray, offset ); offset += moovArray.length;
	result.set( mdatSizeBytes, offset );
	result.set( str( 'mdat' ), offset + 4 );
	offset += 8;

	for ( const chunk of chunks ) {

		result.set( chunk.data, offset );
		offset += chunk.data.length;

	}

	return result;

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
