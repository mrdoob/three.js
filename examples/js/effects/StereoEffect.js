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
//parameters: - optional
//{
//  spatialMultiplex: Default spatial multiplex
//      See https://en.wikipedia.org/wiki/DVB_3D-TV for details
//      Available values:
//
//          THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono - no stereo effacts
//
//          THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS - 'Side by side' format just put the left and right images one next to the other.
//              See https://en.wikipedia.org/wiki/DVB_3D-TV#Side_by_side for dretails
//
//          THREE.StereoEffectParameters.spatialMultiplexsIndexs.TaB - 'Top and bottom' format put left and right images one above the other.
//              See //https://en.wikipedia.org/wiki/DVB_3D-TV#Top_and_bottom for details
//
//      Example - spatialMultiplex: THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono
//
//  zeroParallax: Distance to objects with zero parallax.
//      See http://paulbourke.net/papers/vsmm2007/stereoscopy_workshop.pdf for details
//  get_cookie: Your custom get_cookie(name, defaultValue) function for loading of the StereoEffects settings
//          name: name of current setting
//          defaultValue: default setting
//      returns a StereoEffects setting, saved before or defaultValue
//}
THREE.StereoEffect = function (renderer, parameters) {

	var _stereo = new THREE.StereoCamera();
	_stereo.aspect = 0.5;

	function get_cookie(cookie_name, defaultValue) { return defaultValue;}

	if (parameters == undefined) parameters = {};
	if (parameters.get_cookie != undefined)
	    get_cookie = parameters.get_cookie;
	if (parameters.spatialMultiplex == undefined)
	    parameters.spatialMultiplex = get_cookie('spatialMultiplex', THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS);//Use 'Side by side' for compability with previous version of THREE.StereoEffect
	if (parameters.zeroParallax == undefined)
	    parameters.zeroParallax = parseInt(get_cookie('zeroParallax', THREE.StereoEffectParameters.zeroParallaxDefault));

	_stereo.eyeSep = (get_cookie('eyeSeparation', new THREE.StereoCamera().eyeSep) * 10000) / 10000;

	this.setEyeSeparation = function ( eyeSep ) {

	    _stereo.eyeSep = eyeSep;

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
	        parallax = parameters.zeroParallax,
            spatialMultiplex = parseInt(parameters.spatialMultiplex),
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

//		        parallax = -27.77777777 * _stereo.eyeSep - 0.2222222;

		        xL = 0 + parallax; yL = 0;               widthL = size.width; heightL = size.height / 2;
		        xR = 0 - parallax; yR = size.height / 2; widthR = size.width; heightR = size.height / 2;

		        break;
		    default: console.error('Invalid "Spatial  multiplex" parameter: ' + spatialMultiplex);
		}

		_stereo.update( camera );

		renderer.setScissor(xL, yL, widthL, heightL);
		renderer.setViewport(xL, yL, widthL, heightL);
		renderer.render(scene, _stereo.cameraL);

		renderer.setScissor(xR, yR, widthR, heightR);
		renderer.setViewport(xR, yR, widthR, heightR);
		renderer.render(scene, _stereo.cameraR);

		renderer.setScissorTest( false );
	};

    //Adds StereoEffects folder into gui.
    //https://github.com/dataarts/dat.gui/blob/master/API.md
    //guiParams:
    //{
    //  getLanguageCode: Your custom getLanguageCode() function. 
    //      returns the "primary language" subtag of the language version of the browser.
    //      Examples: "en" - English language, "ru" Russian.
    //      See the "Syntax" paragraph of RFC 4646 https://tools.ietf.org/html/rfc4646#section-2.1 for details.
    //  SetCookie: Your custom SetCookie(name, value) function for saving of the StereoEffects settings
    //          name: name of current setting
    //          value: current setting
    //  lang: Object with custom language values
    //}
	this.gui = function (gui, guiParams) {

	    if (guiParams == undefined) guiParams = {};

	    function getLanguageCode() { return 'en'; }//Default language is English
	    if (guiParams.getLanguageCode != undefined) getLanguageCode = guiParams.getLanguageCode;

	    function SetCookie(name, value, settings) { }
	    if (guiParams.SetCookie != undefined) SetCookie = guiParams.SetCookie;

	    //Localization

	    var lang = {
	        stereoEffects: 'Stereo effects',

	        spatialMultiplexName: 'Spatial  multiplex',
	        spatialMultiplexTitle: 'Choose a way to do spatial multiplex.',

	        spatialMultiplexs: {
	            'Mono': THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono,
	            'Side by side': THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS, //https://en.wikipedia.org/wiki/DVB_3D-TV#Side_by_side
	            'Top and bottom': THREE.StereoEffectParameters.spatialMultiplexsIndexs.TaB, //https://en.wikipedia.org/wiki/DVB_3D-TV#Top_and_bottom
	        },

	        eyeSeparationName: 'Eye separation',
	        eyeSeparationTitle: 'The distance between left and right cameras.',

	        zeroParallaxName: 'Zero parallax',
	        zeroParallaxTitle: 'Distance to objects with zero parallax.',

	        defaultButton: 'Default',
	        defaultTitle: 'Restore default stereo effects settings.',
	    }

	    var languageCode = getLanguageCode();
	    switch (languageCode) {
            case 'ru'://Russian language
                lang.stereoEffects = 'Стерео эффекты';//'Stereo effects'
        
                lang.spatialMultiplexName = 'Мультиплекс';//'Spatial  multiplex'
                lang.spatialMultiplexTitle = 'Выберите способ создания пространственного мультиплексирования.';
        
                lang.spatialMultiplexs = {
                    'Моно': THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono,//Mono
                    'Слева направо': THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS, //https://en.wikipedia.org/wiki/DVB_3D-TV#Side_by_side
                    'Сверху вниз': THREE.StereoEffectParameters.spatialMultiplexsIndexs.TaB, //https://en.wikipedia.org/wiki/DVB_3D-TV#Top_and_bottom
                };
        
                lang.eyeSeparationName = 'Развод камер';
                lang.eyeSeparationTitle = 'Расстояние между левой и правой камерами.';
        
                lang.zeroParallaxName = 'Параллакс 0';
                lang.zeroParallaxTitle = 'Расстояние до объектов с нулевым параллаксом.';
        
                lang.defaultButton = 'Восстановить';
                lang.defaultTitle = 'Восстановить настройки стерео эффектов по умолчанию.';
                break;
            default://Custom language
                if ((guiParams.lang == undefined) || (guiParams.lang.languageCode != languageCode))
                    break;

                if (guiParams.lang.stereoEffects != undefined) lang.stereoEffects = guiParams.lang.stereoEffects;//'Stereo effects'

                if (guiParams.lang.spatialMultiplexName != undefined) lang.spatialMultiplexName = guiParams.lang.spatialMultiplexName;//'Spatial  multiplex'
                if (guiParams.lang.spatialMultiplexTitle != undefined) lang.spatialMultiplexTitle = guiParams.lang.spatialMultiplexTitle;

                if (guiParams.lang.spatialMultiplexs != undefined) lang.spatialMultiplexs = guiParams.lang.spatialMultiplexs;

                if (guiParams.lang.eyeSeparationName != undefined) lang.eyeSeparationName = guiParams.lang.eyeSeparationName;
                if (guiParams.lang.eyeSeparationTitle != undefined) lang.eyeSeparationTitle = guiParams.lang.eyeSeparationTitle;

                if (guiParams.lang.zeroParallaxName != undefined) lang.zeroParallaxName = guiParams.lang.zeroParallaxName;
                if (guiParams.lang.zeroParallaxTitle != undefined) lang.zeroParallaxTitle = guiParams.lang.zeroParallaxTitle;

                if (guiParams.lang.defaultButton != undefined) lang.defaultButton = guiParams.lang.defaultButton;
                if (guiParams.lang.defaultTitle != undefined) lang.defaultTitle = guiParams.lang.defaultTitle;
	    }

        //

	    gui.remember(parameters);
	    gui.remember(_stereo);

	    function displayControllers(value) {
	        var display = value == THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono ? 'none' : 'block';
	        controllerEyeSep.__li.style.display = display;
	        controllerDefaultF.__li.style.display = display;
	        controllerZeroParallax.__li.style.display = display;
        }

	    var fStereoEffects = gui.addFolder(lang.stereoEffects),//Stero effects folder
	        elPropertyName, propertyName = ".property-name";

	    //Spatial  multiplex
	    var controllerSpatialMultiplex = fStereoEffects.add(parameters, 'spatialMultiplex',
            lang.spatialMultiplexs).onChange(function (value) {

                value = parseInt(value);

                displayControllers(value);

                SetCookie('spatialMultiplex', value);
            });
	    elPropertyName = controllerSpatialMultiplex.__li.querySelector(propertyName);
	    elPropertyName.innerHTML = lang.spatialMultiplexName;
	    elPropertyName.title = lang.spatialMultiplexTitle;

	    //eyeSeparation
	    //http://paulbourke.net/papers/vsmm2007/stereoscopy_workshop.pdf
	    var controllerEyeSep = fStereoEffects.add(_stereo, 'eyeSep', -1, 1, 0.001);
	    elPropertyName = controllerEyeSep.onChange(function (value) {
	        SetCookie('eyeSeparation', value);
	    }).__li.querySelector(propertyName);
	    elPropertyName.innerHTML = lang.eyeSeparationName;
	    elPropertyName.title = lang.eyeSeparationTitle;

	    //Zero parallax
	    //http://paulbourke.net/papers/vsmm2007/stereoscopy_workshop.pdf
	    var controllerZeroParallax = fStereoEffects.add(parameters, 'zeroParallax', -60, 30);
	    elPropertyName = controllerZeroParallax.onChange(function (value) {
	        SetCookie('zeroParallax', value);
	    }).__li.querySelector(propertyName);
	    elPropertyName.innerHTML = lang.zeroParallaxName;
	    elPropertyName.title = lang.zeroParallaxTitle;

	    //default button
	    var defaultParams = {
	        defaultF: function (value) {
	            _stereo.eyeSep = new THREE.StereoCamera().eyeSep;
	            controllerEyeSep.setValue(_stereo.eyeSep);

	            parameters.zeroParallax = THREE.StereoEffectParameters.zeroParallaxDefault;
	            controllerZeroParallax.setValue(THREE.StereoEffectParameters.zeroParallaxDefault);
	        },
	    }
	    var controllerDefaultF = fStereoEffects.add(defaultParams, 'defaultF');
	    elPropertyName = controllerDefaultF.__li.querySelector(propertyName);
	    elPropertyName.innerHTML = lang.defaultButton;
	    elPropertyName.title = lang.defaultTitle;

	    displayControllers(parameters.spatialMultiplex);
	};
};
