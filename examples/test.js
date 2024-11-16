import * as THREE from 'three';
import { storageObject, If, vec3, uniform, uv, uint, float, Fn, vec2, uvec2, floor, instanceIndex, workgroupBarrier, atomicAdd, atomicStore, workgroupId, storage } from 'three/tsl';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const numElements = 16384;


const computePrefixSklanskyFn = Fn( ( currentElements, uniformStorage ) => {

	If( instanceIndex.equal( numElements - 1 ), () => {

		uniformStorage.element( 0 ).mulAssign( 2 );

	} );


} )().compute();

const prefixSumMethods = {
	// Emulates a prefix sum by manually assigning the instanceIndex to the storage buffer
	'Fake Prefix': {
		// # of values in the threads array indicates the number of dispatches
		threads: [ numElements ],
		initFn: ( currentElements ) => {

			currentElements.element( instanceIndex ).assign( 1 );

		},
		runFn: ( currentElements ) => {

			currentElements.element( instanceIndex ).assign( instanceIndex );

		},
	},
	// Incorrect prefix sum to test the validation
	'Incorrect': {
		threads: [ numElements ],
		initFn: ( currentElements ) => {

			currentElements.element( instanceIndex ).assign( 7 );


		},
		runFn: ( currentElements ) => {

			currentElements.element( instanceIndex ).assign( uint( numElements ).sub( instanceIndex ) );

		},
	},
	'Sklansky (Favor Dispatch)': {
		threads: Array( Math.log2( numElements ) ).fill( numElements / 2 ),
		initFn: () => console.log( 'test' ),
		runFn: ( currentElements ) => {




		},
	},
	'Kogge-Stone (Favor Dispatch)': {
		threads: Array( Math.log2( numElements ) ).map( ( _, idx ) => {

			return numElements - 2 ** idx;

		} ),
		initFn: ( currentElements, info ) => {

			currentElements.element( instanceIndex ).assign( 1 );
			info.element( 0 ).assign( 1 );

		},
		runFn: ( currentElements, info ) => {

			const offset = info.element( 0 );

			const baseValue = currentElements.element( instanceIndex );
			const offsetValue = currentElements.element( instanceIndex.add( offset ) );

			offsetValue.addAssign( baseValue );

			workgroupBarrier();

			If( instanceIndex.equal( numElements - 1 ), () => {

				info.element( 0 ).mulAssign( 2 );

			} );

		}
	}
};


// Pre-compile shaders
for ( const key in prefixSumMethods ) {

	const method = prefixSumMethods[ key ];

	// Compile init function
	method.initFunction = Fn( ( [ currentElements, info ] ) => {

		method.initFn( currentElements, info );

	} )().compute( numElements );

	method.runFunctions = [];

	const functionTemplate = Fn( ( currentElements, info ) => {

		method.runFn( currentElements, info );

	} );

	for ( let i = 0; i < prefixSumMethods[ key ].threads.length; i ++ ) {

		prefixSumMethods[ key ].runFunctions.push( functionTemplate().compute( method.threads[ i ] ) );


	}

}


const effectController = {
	// Sqr root of 16834
	gridWidth: uniform( Math.sqrt( numElements ) ),
	gridHeight: uniform( Math.sqrt( numElements ) ),
	validate: uniform( 0 ),
	'Left Display Algo': 'Fake Prefix',
	'Right Display Algo': 'Incorrect',
};

const algorithms = [
	'Sklansky (Favor Dispatch)',
	'Kogge-Stone (Favor Dispatch)',
	'Fake Prefix',
	'Incorrect'
];

const gui = new GUI();

gui.add( effectController, 'Step' );
gui.add( effectController, 'Left Display Algo', algorithms );
gui.add( effectController, 'Right Display Algo', algorithms );

// Allow Workgroup Array Swaps
init( false, 'Fake Prefix' );

// Global Swaps Only
init( true, 'Incorrect' );


// When forceGlobalSwap is true, force all valid local swaps to be global swaps.
async function init( rightSide ) {

	const aspect = ( window.innerWidth / 2 ) / window.innerHeight;
	const camera = new THREE.OrthographicCamera( - aspect, aspect, 1, - 1, 0, 2 );
	camera.position.z = 1;

	const scene = new THREE.Scene();

	const array = new Uint32Array( Array.from( { length: numElements }, ( _, i ) => {

		return i;

	} ) );

	const infoArray = new Uint32Array( 5 ).fill( 1 );

	const currentElementsBuffer = new THREE.StorageInstancedBufferAttribute( array, 1 );
	const currentElementsStorage = storage( currentElementsBuffer, 'uint', currentElementsBuffer.count ).label( 'Elements' );
	const infoBuffer = new THREE.StorageInstancedBufferAttribute( infoArray, 1 );
	const infoStorage = storage( infoBuffer, 'uint', infoBuffer.count );

	const material = new THREE.MeshBasicNodeMaterial( { color: 0x00ff00 } );

	const display = Fn( () => {

		const { gridWidth, gridHeight } = effectController;
		const newUV = uv().mul( vec2( gridWidth, gridHeight ) );
		const pixel = uvec2( uint( floor( newUV.x ) ), uint( floor( newUV.y ) ) );
		const elementIndex = uint( gridWidth ).mul( pixel.y ).add( pixel.x );
		const colorChanger = currentElementsStorage.element( elementIndex );
		const subtracter = float( colorChanger ).div( gridWidth.mul( gridHeight ) );
		const color = vec3( subtracter.oneMinus() ).toVar();
		If( effectController.validate.equal( 1 ), () => {

			If( colorChanger.equal( elementIndex ), () => {

				color.g.assign( 255.0 );

			} ).Else( () => {

				color.r.assign( 255.0 );

			} );


		} );

		return color;

	} );

	material.colorNode = display();

	const plane = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), material );
	scene.add( plane );

	const renderer = new THREE.WebGPURenderer( { antialias: false, trackTimestamp: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth / 2, window.innerHeight );

	//renderer.setAnimationLoop( animate );

	document.body.appendChild( renderer.domElement );
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0';
	renderer.domElement.style.left = '0';
	renderer.domElement.style.width = '50%';
	renderer.domElement.style.height = '100%';

	if ( rightSide ) {

		renderer.domElement.style.left = '50%';

		scene.background = new THREE.Color( 0x212121 );

	} else {

		scene.background = new THREE.Color( 0x313131 );

	}

	//renderer.compute( initFunction );

	let stepType = 'Run';

				 const stepAnimation = async function () {

		const algoType = rightSide ?
			effectController[ 'Right Display Algo' ] :
			effectController[ 'Left Display Algo' ];

		const algorithm = prefixSumMethods[ algoType ];

		switch ( stepType ) {

			case 'Run': {

				console.log( `Running algo: ${algoType}` );

				for ( let i = 0; i < algorithm.threads.length; i ++ ) {

					renderer.compute( algorithm.runFunctions[ i ] );

				}

				stepType = 'Validate';


			}

				break;

			case 'Validate': {

				console.log( `Validating algo: ${algoType}` );

				effectController.validate.value = 1;
				stepType = 'Init';

			}

				break;


			case 'Init': {

				console.log( `Initializing algo: ${algoType}` );

				renderer.compute( algorithm.initFunction( [ currentElementsStorage ] ) );

				stepType = 'Run';


			}

				break;


		}


		renderer.render( scene, camera );
		effectController.validate.value = 0;

		setTimeout( stepAnimation, 1000 );


	};

	stepAnimation();

	window.addEventListener( 'resize', onWindowResize );

	function onWindowResize() {

		renderer.setSize( window.innerWidth / 2, window.innerHeight );

		const aspect = ( window.innerWidth / 2 ) / window.innerHeight;

		const frustumHeight = camera.top - camera.bottom;

		camera.left = - frustumHeight * aspect / 2;
		camera.right = frustumHeight * aspect / 2;

		camera.updateProjectionMatrix();

		renderer.render( scene, camera );

	}

}
