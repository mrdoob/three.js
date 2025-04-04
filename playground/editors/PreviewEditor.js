import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';
import { Element, LabelElement, SelectInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { vec4 } from 'three/tsl';
import { PerspectiveCamera, Scene, Mesh, DoubleSide, SphereGeometry, BoxGeometry, PlaneGeometry, TorusKnotGeometry, WebGPURenderer } from 'three';
import { setInputAestheticsFromType } from '../DataTypeLib.js';

const sceneDict = {};

const getScene = ( name ) => {

	let scene = sceneDict[ name ];

	if ( scene === undefined ) {

		scene = new Scene();

		if ( name === 'box' ) {

			const box = new Mesh( new BoxGeometry( 1.3, 1.3, 1.3 ) );
			scene.add( box );

		} else if ( name === 'sphere' ) {

			const sphere = new Mesh( new SphereGeometry( 1, 32, 16 ) );
			scene.add( sphere );

		} else if ( name === 'plane' || name === 'sprite' ) {

			const plane = new Mesh( new PlaneGeometry( 2, 2 ) );
			scene.add( plane );


		} else if ( name === 'torus' ) {

			const torus = new Mesh( new TorusKnotGeometry( .7, .1, 100, 16 ) );
			scene.add( torus );

		}

		sceneDict[ name ] = scene;

	}

	return scene;

};

export class PreviewEditor extends BaseNodeEditor {

	constructor() {

		const width = 300;
		const height = 300;

		super( 'Preview', null, width );

		const material = new MeshBasicNodeMaterial();
		material.colorNode = vec4( 0, 0, 0, 1 );
		material.side = DoubleSide;
		material.transparent = true;

		const previewElement = new Element();
		previewElement.dom.style[ 'padding-top' ] = 0;
		previewElement.dom.style[ 'padding-bottom' ] = 0;
		previewElement.dom.style[ 'padding-left' ] = 0;
		previewElement.dom.style[ 'padding-right' ] = '14px';

		const sceneInput = new SelectInput( [
			{ name: 'Box', value: 'box' },
			{ name: 'Sphere', value: 'sphere' },
			{ name: 'Plane', value: 'plane' },
			{ name: 'Sprite', value: 'sprite' },
			{ name: 'Torus', value: 'torus' }
		], 'box' );

		const inputElement = setInputAestheticsFromType( new LabelElement( 'Input' ), 'Color' ).onConnect( () => {

			material.colorNode = inputElement.getLinkedObject() || vec4( 0, 0, 0, 1 );
			material.dispose();

		}, true );

		const canvas = document.createElement( 'canvas' );
		canvas.style.position = 'absolute';
		previewElement.dom.append( canvas );
		previewElement.setHeight( height );

		previewElement.dom.addEventListener( 'wheel', e => e.stopPropagation() );

		const renderer = new WebGPURenderer( {
			canvas,
			alpha: true,
			antialias: true
		} );

		renderer.autoClear = false;
		renderer.setSize( width, height, true );
		renderer.setPixelRatio( window.devicePixelRatio );

		const camera = new PerspectiveCamera( 45, width / height, 0.1, 100 );
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		camera.position.set( - 2, 2, 2 );
		camera.lookAt( 0, 0, 0 );

		const controls = new OrbitControls( camera, previewElement.dom );
		controls.enableKeys = false;
		controls.update();

		const viewHelper = new ViewHelper( camera, previewElement.dom );

		this.sceneInput = sceneInput;
		this.viewHelper = viewHelper;
		this.material = material;
		this.camera = camera;
		this.renderer = renderer;

		this.add( inputElement )
			.add( new LabelElement( 'Object' ).add( sceneInput ) )
			.add( previewElement );

	}

	setEditor( editor ) {

		super.setEditor( editor );

		this.updateAnimationRequest();

	}

	updateAnimationRequest() {

		if ( this.editor !== null ) {

			requestAnimationFrame( () => this.update() );

		}

	}

	async update() {

		const { viewHelper, material, renderer, camera, sceneInput } = this;

		this.updateAnimationRequest();

		const sceneName = sceneInput.getValue();

		const scene = getScene( sceneName );
		const mesh = scene.children[ 0 ];

		mesh.material = material;

		if ( sceneName === 'sprite' ) {

			mesh.lookAt( camera.position );

		}

		await renderer.clearAsync();
		await renderer.renderAsync( scene, camera );

		viewHelper.render( renderer );

	}

}
