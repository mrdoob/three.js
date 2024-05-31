import * as THREE from 'three';

import { UIBreak, UIButton, UIInteger, UIPanel, UIRow, UISelect, UIText } from './libs/ui.js';

import { ViewportPathtracer } from './Viewport.Pathtracer.js';

function SidebarProjectImage( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setId( 'render' );

	// Image

	container.add( new UIText( strings.getKey( 'sidebar/project/image' ) ).setTextTransform( 'uppercase' ) );
	container.add( new UIBreak(), new UIBreak() );

	// Shading

	const shadingRow = new UIRow();
	container.add( shadingRow );

	shadingRow.add( new UIText( strings.getKey( 'sidebar/project/shading' ) ).setClass( 'Label' ) );

	const shadingTypeSelect = new UISelect().setOptions( {
		0: 'SOLID',
		1: 'REALISTIC'
	} ).setWidth( '170px' ).setTextTransform( 'unset' ).onChange( refreshShadingRow ).setValue( 0 );
	shadingRow.add( shadingTypeSelect );

	const pathTracerMinSamples = 3;
	const pathTracerMaxSamples = 65536;
	const samplesNumber = new UIInteger( 16 ).setRange( pathTracerMinSamples, pathTracerMaxSamples );

	const samplesRow = new UIRow();
	samplesRow.add( new UIText( strings.getKey( 'sidebar/project/image/samples' ) ).setClass( 'Label' ) );
	samplesRow.add( samplesNumber );

	container.add( samplesRow );

	function refreshShadingRow() {

		samplesRow.setHidden( shadingTypeSelect.getValue() !== '1' );

	}

	refreshShadingRow();

	// Resolution

	const resolutionRow = new UIRow();
	container.add( resolutionRow );

	resolutionRow.add( new UIText( strings.getKey( 'sidebar/project/resolution' ) ).setClass( 'Label' ) );

	const imageWidth = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' );
	resolutionRow.add( imageWidth );

	resolutionRow.add( new UIText( '×' ).setTextAlign( 'center' ).setFontSize( '12px' ).setWidth( '12px' ) );

	const imageHeight = new UIInteger( 1024 ).setTextAlign( 'center' ).setWidth( '28px' );
	resolutionRow.add( imageHeight );

	// Render

	const renderButton = new UIButton( strings.getKey( 'sidebar/project/render' ) );
	renderButton.setWidth( '170px' );
	renderButton.setMarginLeft( '120px' );
	renderButton.onClick( async () => {

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

		switch ( Number( shadingTypeSelect.getValue() ) ) {

			case 0: // SOLID

				renderer.render( scene, camera );
				renderer.dispose();

				break;

			case 1: // REALISTIC

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

						status.textContent += ' ✓';

					}

				}

				animate();

				break;

		}

	} );
	container.add( renderButton );

	//

	return container;

}

export { SidebarProjectImage };
