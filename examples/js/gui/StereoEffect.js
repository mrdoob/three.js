/**
 * @author anhr / https://github.com/anhr/
*/

//Attenttion!!! Save this file as UTF-8 for localization.

//Adds StereoEffects folder into gui.
//See examples\js\effects\StereoEffect.js for StereoEffect details
//gui: see https://github.com/dataarts/dat.gui/blob/master/API.md for details
//options: See options of StereoEffect in examples\js\effects\StereoEffect.js for details.
//guiParams:
//{
//	getLanguageCode: Your custom getLanguageCode() function. 
//		returns the "primary language" subtag of the language version of the browser.
//		Examples: "en" - English language, "ru" Russian.
//		See the "Syntax" paragraph of RFC 4646 https://tools.ietf.org/html/rfc4646#section-2.1 for details.
//		Default returns the 'en' is English language.
//	SetCookie: Your custom SetCookie(name, value) function for saving of the StereoEffects settings
//			name: name of current setting
//			value: current setting
//			Default function is nothing saving.
//	lang: Object with localized language values
//	scale: scale of allowed values. Default is 1.
//}
THREE.gui.stereoEffect = function (gui, options, guiParams) {

	if (guiParams == undefined) guiParams = {};
	guiParams.scale = guiParams.scale || 1;

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

			Object.keys(guiParams.lang).forEach(function (key) {
				if (lang[key] === undefined)
					return;
				lang[key] = guiParams.lang[key];
			});
	}

	//

	gui.remember(options);

	function displayControllers(value) {
		var display = value == THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono ? 'none' : 'block';
		controllerEyeSep.__li.style.display = display;
		controllerDefaultF.__li.style.display = display;
		controllerZeroParallax.__li.style.display = display;
	}

	var fStereoEffects = gui.addFolder(lang.stereoEffects);//Stero effects folder

	function controllerNameAndTitle(controller, name, title) {
		var elPropertyName = controller.__li.querySelector(".property-name");
		elPropertyName.innerHTML = name;
		elPropertyName.title = title;
	}

	//Spatial  multiplex
	var controllerSpatialMultiplex = fStereoEffects.add(options, 'spatialMultiplex',
		lang.spatialMultiplexs).onChange(function (value) {

			value = parseInt(value);

			displayControllers(value);

			SetCookie('spatialMultiplex', value);
		});
	controllerNameAndTitle(controllerSpatialMultiplex, lang.spatialMultiplexName, lang.spatialMultiplexTitle);

	//eyeSeparation
	//http://paulbourke.net/papers/vsmm2007/stereoscopy_workshop.pdf
	var controllerEyeSep = fStereoEffects.add(options.stereo, 'eyeSep', 0, 1 * guiParams.scale, 0.001 * guiParams.scale)
		.onChange(function (value) {
			SetCookie('eyeSeparation', value);
		});
	controllerNameAndTitle(controllerEyeSep, lang.eyeSeparationName, lang.eyeSeparationTitle);

	//Zero parallax
	//http://paulbourke.net/papers/vsmm2007/stereoscopy_workshop.pdf
	var minMax = (60 - (400 / 9)) * guiParams.scale + 400 / 9;
	var controllerZeroParallax = fStereoEffects.add(options, 'zeroParallax', -minMax, minMax)
		.onChange(function (value) {
			SetCookie('zeroParallax', value);
		});
	controllerNameAndTitle(controllerZeroParallax, lang.zeroParallaxName, lang.zeroParallaxTitle);

	//default button
	var defaultParams = {
		defaultF: function (value) {
			options.stereo.eyeSep = new THREE.StereoCamera().eyeSep;
			controllerEyeSep.setValue(options.stereo.eyeSep);

			options.zeroParallax = THREE.StereoEffectParameters.zeroParallaxDefault;
			controllerZeroParallax.setValue(THREE.StereoEffectParameters.zeroParallaxDefault);
		},
	}
	var controllerDefaultF = fStereoEffects.add(defaultParams, 'defaultF');
	controllerNameAndTitle(controllerDefaultF, lang.defaultButton, lang.defaultTitle);

	displayControllers(options.spatialMultiplex);
};
