import * as THREE from 'three';

import { zipSync, strToU8 } from 'three/addons/libs/fflate.module.js';

import { UIButton, UICheckbox, UIPanel, UIInput, UIRow, UIText } from './libs/ui.js';

function SidebarProjectApp( editor ) {

	const config = editor.config;
	const signals = editor.signals;
	const strings = editor.strings;

	const save = editor.utils.save;

	const container = new UIPanel();
	container.setId( 'app' );

	const headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/app' ).toUpperCase() ) );
	container.add( headerRow );

	// Title

	const titleRow = new UIRow();
	const title = new UIInput( config.getKey( 'project/title' ) ).setLeft( '100px' ).setWidth( '150px' ).onChange( function () {

		config.setKey( 'project/title', this.getValue() );

	} );

	titleRow.add( new UIText( strings.getKey( 'sidebar/project/app/title' ) ).setClass( 'Label' ) );
	titleRow.add( title );

	container.add( titleRow );

	// Editable

	const editableRow = new UIRow();
	const editable = new UICheckbox( config.getKey( 'project/editable' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/editable', this.getValue() );

	} );

	editableRow.add( new UIText( strings.getKey( 'sidebar/project/app/editable' ) ).setClass( 'Label' ) );
	editableRow.add( editable );

	container.add( editableRow );

	// Play/Stop

	let isPlaying = false;

	const playButton = new UIButton( strings.getKey( 'sidebar/project/app/play' ) );
	playButton.setWidth( '170px' );
	playButton.setMarginLeft( '120px' );
	playButton.setMarginBottom( '10px' );
	playButton.onClick( function () {

		if ( isPlaying === false ) {

			isPlaying = true;
			playButton.setTextContent( strings.getKey( 'sidebar/project/app/stop' ) );
			signals.startPlayer.dispatch();

		} else {

			isPlaying = false;
			playButton.setTextContent( strings.getKey( 'sidebar/project/app/play' ) );
			signals.stopPlayer.dispatch();

		}

	} );

	container.add( playButton );

	// Publish

	const publishButton = new UIButton( strings.getKey( 'sidebar/project/app/publish' ) );
	publishButton.setWidth( '170px' );
	publishButton.setMarginLeft( '120px' );
	publishButton.setMarginBottom( '10px' );
	publishButton.onClick( function () {

		const toZip = {};

		//

		let output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		toZip[ 'app.json' ] = strToU8( output );

		//

		const title = config.getKey( 'project/title' );

		const manager = new THREE.LoadingManager( function () {

			const zipped = zipSync( toZip, { level: 9 } );

			const blob = new Blob( [ zipped.buffer ], { type: 'application/zip' } );

			save( blob, ( title !== '' ? title : 'untitled' ) + '.zip' );

		} );

		const loader = new THREE.FileLoader( manager );
		loader.load( 'js/libs/app/index.html', function ( content ) {

			content = content.replace( '<!-- title -->', title );

			let editButton = '';

			if ( config.getKey( 'project/editable' ) ) {

				editButton = [
					'			let button = document.createElement( \'a\' );',
					'			button.href = \'https://threejs.org/editor/#file=\' + location.href.split( \'/\' ).slice( 0, - 1 ).join( \'/\' ) + \'/app.json\';',
					'			button.style.cssText = \'position: absolute; bottom: 20px; right: 20px; padding: 10px 16px; color: #fff; border: 1px solid #fff; border-radius: 20px; text-decoration: none;\';',
					'			button.target = \'_blank\';',
					'			button.textContent = \'EDIT\';',
					'			document.body.appendChild( button );',
				].join( '\n' );

			}

			content = content.replace( '\t\t\t/* edit button */', editButton );

			toZip[ 'index.html' ] = strToU8( content );

		} );
		loader.load( 'js/libs/app.js', function ( content ) {

			toZip[ 'js/app.js' ] = strToU8( content );

		} );
		
		// Load scene.js for query string configuration
		loader.load( 'js/libs/scene.js', function ( content ) {

			toZip[ 'js/scene.js' ] = strToU8( content );

		} );

		// Load all asset and texture files dynamically using FileLoader with responseType 'arraybuffer'
		const binaryLoader = new THREE.FileLoader( manager );
		binaryLoader.setResponseType( 'arraybuffer' );

		// Helper function to recursively load files from a directory
		function loadFilesFromDirectory( directoryPath, baseOutputPath ) {

			const jsonLoader = new THREE.FileLoader( manager );
			jsonLoader.load( directoryPath + 'files.json', function( content ) {

				const files = JSON.parse( content );
				
				files.forEach( function( file ) {

					if ( file.type === 'directory' ) {

						// Recursively load subdirectory
						loadFilesFromDirectory( directoryPath + file.name + '/', baseOutputPath + file.name + '/' );

					} else {

						// Load file
						const filePath = directoryPath + file.name;
						const outputPath = baseOutputPath + file.name;
						
						binaryLoader.load( filePath, function( buffer ) {

							toZip[ outputPath ] = new Uint8Array( buffer );

						} );

					}

				} );

			}, undefined, function( error ) {

				// If files.json doesn't exist, try scanning common patterns
				console.warn( 'Could not load files.json from ' + directoryPath, error );

			} );

		}

		// Define static file lists for assets and textures (fallback approach)
		const assetFiles = {
			'assets/360_images/': [
				'black.jpg', 'blue_photo_studio_4k.jpg', 'brown_photostudio_06_4k.jpg', 
				'clouds.jpg', 'concrete_tunnel_4k.jpg', 'dancing_hall_4k.jpg', 'dusk.jpg',
				'graffiti_shelter_4k.jpg', 'hall_of_finfish_4k.jpg', 'lapa_4k.jpg',
				'large_corridor_4k.jpg', 'lighter_clouds.jpg', 'moonless_golf_4k.jpg',
				'photo_studio_loft_hall_4k.jpg', 'pillars_4k.jpg', 'rogland_clear_night_4k.jpg',
				'shanghai_bund_4k.jpg', 'teufelsberg_lookout_4k.jpg', 'tv_studio_4k.jpg',
				'vintage_measuring_lab_4k.jpg', 'vulture_hide_4k.jpg', 'wrestling_gym_4k.jpg'
			],
			'assets/spherical/': [
				'earth.jpg', 'jupiter.jpg', 'moon.jpg', 'sun.jpg', 'venus.jpg'
			]
		};

		const textureFiles = {
			'assets/textures/GroundSand005/2K/': [ 'GroundSand005_COL_2K.jpg', 'GroundSand005_NRM_2K.jpg' ],
			'assets/textures/MetalCorrodedHeavy001/2K/': [ 'MetalCorrodedHeavy001_COL_2K_METALNESS.jpg', 'MetalCorrodedHeavy001_NRM_2K_METALNESS.jpg' ],
			'assets/textures/MetalGalvanizedSteelWorn001/2K/': [ 'MetalGalvanizedSteelWorn001_COL_2K_METALNESS.jpg', 'MetalGalvanizedSteelWorn001_NRM_2K_METALNESS.jpg' ],
			'assets/textures/Poliigon_BrickWallReclaimed_8320/2K/': [ 'Poliigon_BrickWallReclaimed_8320_BaseColor.jpg', 'Poliigon_BrickWallReclaimed_8320_Normal.png' ],
			'assets/textures/Poliigon_ClayCeramicGlossy_5212/2K/': [ 'Poliigon_ClayCeramicGlossy_5212_BaseColor.jpg', 'Poliigon_ClayCeramicGlossy_5212_Normal.png' ],
			'assets/textures/Poliigon_ConcreteFloorPoured_7656/2K/': [ 'Poliigon_ConcreteFloorPoured_7656_BaseColor.jpg', 'Poliigon_ConcreteFloorPoured_7656_Normal.png' ],
			'assets/textures/Poliigon_GrassPatchyGround_4585/2K/': [ 'Poliigon_GrassPatchyGround_4585_BaseColor.jpg', 'Poliigon_GrassPatchyGround_4585_Normal.png' ],
			'assets/textures/Poliigon_MetalPaintedMatte_7037/2K/': [ 'Poliigon_MetalPaintedMatte_7037_BaseColor.jpg', 'Poliigon_MetalPaintedMatte_7037_Normal.png' ],
			'assets/textures/Poliigon_MetalSteelBrushed_7174/2K/': [ 'Poliigon_MetalSteelBrushed_7174_BaseColor.jpg', 'Poliigon_MetalSteelBrushed_7174_Normal.png' ],
			'assets/textures/Poliigon_PlasterPainted_7664/2K/': [ 'Poliigon_PlasterPainted_7664_BaseColor.jpg', 'Poliigon_PlasterPainted_7664_Normal.png' ],
			'assets/textures/Poliigon_PlasticMoldWorn_7486/2K/': [ 'Poliigon_PlasticMoldWorn_7486_BaseColor.jpg', 'Poliigon_PlasticMoldWorn_7486_Normal.png' ],
			'assets/textures/Poliigon_SlateFloorTile_7657/2K/': [ 'Poliigon_SlateFloorTile_7657_BaseColor.jpg', 'Poliigon_SlateFloorTile_7657_Normal.png' ],
			'assets/textures/Poliigon_StoneQuartzite_8060/2K/': [ 'Poliigon_StoneQuartzite_8060_BaseColor.jpg' ],
			'assets/textures/Poliigon_WoodVeneerOak_7760/2K/': [ 'Poliigon_WoodVeneerOak_7760_BaseColor.jpg', 'Poliigon_WoodVeneerOak_7760_Normal.png' ],
			'assets/textures/RammedEarth018/2K/': [ 'RammedEarth018_COL_2K_METALNESS.png', 'RammedEarth018_NRM_2K_METALNESS.png' ],
			'assets/textures/StoneBricksSplitface001/2K/': [ 'StoneBricksSplitface001_COL_2K.jpg', 'StoneBricksSplitface001_NRM_2K.jpg' ],
			'assets/textures/TerrazzoSlab018/2K/': [ 'TerrazzoSlab018_COL_2K_METALNESS.png', 'TerrazzoSlab018_NRM_2K_METALNESS.png' ],
			'assets/textures/TilesMosaicYubi003/2K/': [ 'TilesMosaicYubi003_COL_2K.png', 'TilesMosaicYubi003_NRM_2K.png' ],
			'assets/textures/TilesTravertine001/2K/': [ 'TilesTravertine001_COL_2K.jpg', 'TilesTravertine001_NRM_2K.jpg' ]
		};

		// Load all asset files
		Object.keys( assetFiles ).forEach( function( directory ) {

			assetFiles[ directory ].forEach( function( filename ) {

				const filePath = directory + filename;
				binaryLoader.load( filePath, function( buffer ) {

					toZip[ filePath ] = new Uint8Array( buffer );

				} );

			} );

		} );

		// Load all texture files
		Object.keys( textureFiles ).forEach( function( directory ) {

			textureFiles[ directory ].forEach( function( filename ) {

				const filePath = directory + filename;
				binaryLoader.load( filePath, function( buffer ) {

					toZip[ filePath ] = new Uint8Array( buffer );

				} );

			} );

		} );

	} );
	container.add( publishButton );

	// Signals

	signals.editorCleared.add( function () {

		title.setValue( '' );
		config.setKey( 'project/title', '' );

	} );

	return container;

}

export { SidebarProjectApp };
