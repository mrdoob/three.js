/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * @authod fonserbc / http://fonserbc.github.io/
 * @authod anhr / https://github.com/anhr/
*/

THREE.StereoEffectParameters = {

	//spatialMultiplex
	//https://en.wikipedia.org/wiki/DVB_3D-TV
	spatialMultiplexsIndexs: {
		Mono: 0,
		SbS: 1, //https://en.wikipedia.org/wiki/DVB_3D-TV#Side_by_side
		TaB: 2, //https://en.wikipedia.org/wiki/DVB_3D-TV#Top_and_bottom
	},

	//Zero parallax
	//http://paulbourke.net/papers/vsmm2007/stereoscopy_workshop.pdf
	zeroParallaxDefault: 0,
}

//StereoEffect
//Uses dual PerspectiveCameras for Parallax Barrier https://en.wikipedia.org/wiki/Parallax_barrier effects
//renderer: THREE.WebGLRenderer
//options:
//{
//	spatialMultiplex: spatial multiplex
//		See https://en.wikipedia.org/wiki/DVB_3D-TV for details
//		Available values:
//
//			THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono - no stereo effacts
//
//			THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS - 'Side by side' format just put the left and right images one next to the other.
//				See https://en.wikipedia.org/wiki/DVB_3D-TV#Side_by_side for dretails
//
//			THREE.StereoEffectParameters.spatialMultiplexsIndexs.TaB - 'Top and bottom' format put left and right images one above the other.
//				See //https://en.wikipedia.org/wiki/DVB_3D-TV#Top_and_bottom for details
//
//		Example - spatialMultiplex: THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono
//		Default is THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS
//
//	zeroParallax: Distance to objects with zero parallax.
//		See http://paulbourke.net/papers/vsmm2007/stereoscopy_workshop.pdf for details.
//		Default is THREE.StereoEffectParameters.zeroParallaxDefault
//	get_cookie: Your custom get_cookie(name, defaultValue) function for loading of the StereoEffects settings
//			name: name of current setting
//			defaultValue: default setting
//		returns a StereoEffects setting, saved before or defaultValue
//		Default returns defaultValue
//}
THREE.StereoEffect = function (renderer, options) {

	options.stereo = new THREE.StereoCamera();
	options.stereo.aspect = 0.5;

	function get_cookie(cookie_name, defaultValue) { return defaultValue;}

	options = options || {};
	if (options.get_cookie != undefined)
		get_cookie = options.get_cookie;
	if (options.spatialMultiplex == undefined)
		options.spatialMultiplex = get_cookie('spatialMultiplex', THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS);//Use 'Side by side' for compability with previous version of THREE.StereoEffect
	if (options.zeroParallax == undefined)
		options.zeroParallax = parseInt(get_cookie('zeroParallax', THREE.StereoEffectParameters.zeroParallaxDefault));

	options.stereo.eyeSep = (get_cookie('eyeSeparation', new THREE.StereoCamera().eyeSep) * 10000) / 10000;

	this.setEyeSeparation = function ( eyeSep ) {

		options.stereo.eyeSep = eyeSep;

	};

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		var size = renderer.getSize();

		if ( renderer.autoClear ) renderer.clear();
		renderer.setScissorTest( true );

		var xL, yL, widthL, heightL,
			xR, yR, widthR, heightR,
			parallax = options.zeroParallax,
			spatialMultiplex = parseInt(options.spatialMultiplex),
			spatialMultiplexsIndexs = THREE.StereoEffectParameters.spatialMultiplexsIndexs;

		switch (spatialMultiplex) {
			case spatialMultiplexsIndexs.Mono://Mono
				renderer.setScissor(0, 0, size.width, size.height);
				renderer.setViewport(0, 0, size.width, size.height);
				renderer.render(scene, camera);
				renderer.setScissorTest(false);
				return;

			case spatialMultiplexsIndexs.SbS://'Side by side'

				var width = size.width / 2;

				xL = 0 + parallax;     yL = 0; widthL = width; heightL = size.height;
				xR = width - parallax; yR = 0; widthR = width; heightR = size.height;

				break;

			case spatialMultiplexsIndexs.TaB://'Top and bottom'

				xL = 0 + parallax; yL = 0;               widthL = size.width; heightL = size.height / 2;
				xR = 0 - parallax; yR = size.height / 2; widthR = size.width; heightR = size.height / 2;

				break;
			default: console.error('THREE.StereoEffect.render: Invalid "Spatial  multiplex" parameter: ' + spatialMultiplex);
		}

		options.stereo.update(camera);

		renderer.setScissor(xL, yL, widthL, heightL);
		renderer.setViewport(xL, yL, widthL, heightL);
		renderer.render(scene, options.stereo.cameraL);

		renderer.setScissor(xR, yR, widthR, heightR);
		renderer.setViewport(xR, yR, widthR, heightR);
		renderer.render(scene, options.stereo.cameraR);

		renderer.setScissorTest( false );
	};
};
