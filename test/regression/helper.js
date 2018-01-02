/*
** Helpers used to add a new rendering test.
*/

const TestCanvasWidth = 640;
const TestCanvasHeight = 480;


function testHelperGetCameraAspect() {

	return TestCanvasWidth / TestCanvasWidth;

}

function testHelperSetSizeAndRatio( renderer ) {

	renderer.setPixelRatio( 1 );
	renderer.setSize( TestCanvasWidth, TestCanvasHeight );

}

function testHelperResetMixer( mixer ) {

	for ( var i = 0; i !== mixer._nActiveActions; ++ i ) {

		mixer._actions[ i ].reset();

	}

}

var _testAnimateIntercepted = false;

function testHelperRun( ) {

	if ( _testAnimateIntercepted === false ) {

		setTimeout( testHelperRun, 50 );
		return;

	}

	// Force a loading to make sure the 'onLoad' event must be always triggered.
	var loader = new THREE.FileLoader();
	loader.load( "../test/regression/helper.js" );
	THREE.DefaultLoadingManager.onLoad = _testHelperStart;

}

function _testHelperStart( ) {

	testInit();
	window.parent.testRunner.testSceneReady( testRenderFrame );

}

function testHelperFrameReady( renderer ) {

	window.parent.testRunner.testFrameReady( renderer );

}

window._saved_animate = window.animate;
window.animate = function () {

	_testAnimateIntercepted = true;

};

window._saved_render = window.render;
window.render = function () { };
window.onWindowResize = function () { };
