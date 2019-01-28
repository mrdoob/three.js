/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * @authod fonserbc / http://fonserbc.github.io/
 * @authod anhr / https://github.com/anhr/
*/

//Attenttion!!! Save this file as UTF-8 for localization.

THREE.StereoEffectParameters = {

	//spatialMultiplex
	//https://en.wikipedia.org/wiki/DVB_3D-TV
	spatialMultiplexsIndexs: {
		Mono: 0,
		SbS: 1, //https://en.wikipedia.org/wiki/DVB_3D-TV#Side_by_side
		TaB: 2, //https://en.wikipedia.org/wiki/DVB_3D-TV#Top_and_bottom
	},
};

//StereoEffect
//Uses dual PerspectiveCameras for Parallax Barrier https://en.wikipedia.org/wiki/Parallax_barrier effects
//renderer: THREE.WebGLRenderer
//options:
//{
//	spatialMultiplex: spatial multiplex
//		See https://en.wikipedia.org/wiki/DVB_3D-TV for details
//		Available values
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
//	camera: THREE.PerspectiveCamera. Use the camera key if you want control cameras focus.
//	far: Camera frustum far plane. The far key uses for correct calculation default values of Eye separation. Default is 10.
//	cookie: Your custom cookie function for saving and loading of the StereoEffects settings. Default cookie is not saving settings.
//}
THREE.StereoEffect = function ( renderer, options ) {

	options = options || {};
	this.options = options;

	options.stereo = new THREE.StereoCamera();
	options.stereo.aspect = 0.5;
	options.cookie = options.cookie || new THREE.cookie().default;
	if ( options.far === undefined )
		options.far = new THREE.PerspectiveCamera().focus;
	options.focus = options.camera === undefined ? new THREE.PerspectiveCamera().focus : new THREE.Vector3().distanceTo( options.camera.position );
	options.zeroParallax = 0;
	new THREE.cookie( 'StereoEffect' ).getObject( options, {

		spatialMultiplex: options.spatialMultiplex !== undefined ? options.spatialMultiplex : THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS, //Use default as 'Side by side' for compability with previous version of THREE.StereoEffect
		eyeSep: ( new THREE.StereoCamera().eyeSep / 10 ) * options.far,
		focus: options.focus,
		zeroParallax: 0,

	} );
	if ( options.camera !== undefined )
		options.camera.focus = options.focus;

	this.setEyeSeparation = function ( eyeSep ) {

		options.stereo.eyeSep = eyeSep;

	};

	this.setEyeSeparation( options.eyeSep );

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
			spatialMultiplex = parseInt( options.spatialMultiplex ),
			spatialMultiplexsIndexs = THREE.StereoEffectParameters.spatialMultiplexsIndexs;

		switch ( spatialMultiplex ) {

			case spatialMultiplexsIndexs.Mono://Mono
				renderer.setScissor( 0, 0, size.width, size.height );
				renderer.setViewport( 0, 0, size.width, size.height );
				renderer.render( scene, camera );
				renderer.setScissorTest( false );
				return;

			case spatialMultiplexsIndexs.SbS://'Side by side'

				var _width = size.width / 2;

				xL = 0 + parallax;		yL = 0; widthL = _width; heightL = size.height;
				xR = _width - parallax;	yR = 0; widthR = _width; heightR = size.height;

				break;

			case spatialMultiplexsIndexs.TaB://'Top and bottom'

				xL = 0 + parallax; yL = 0;					widthL = size.width; heightL = size.height / 2;
				xR = 0 - parallax; yR = size.height / 2;	widthR = size.width; heightR = size.height / 2;

				break;
			default: console.error( 'THREE.StereoEffect.render: Invalid "Spatial  multiplex" parameter: ' + spatialMultiplex );

		}

		options.stereo.update( camera );

		renderer.setScissor( xL, yL, widthL, heightL );
		renderer.setViewport( xL, yL, widthL, heightL );
		renderer.render( scene, options.stereo.cameraL );

		renderer.setScissor( xR, yR, widthR, heightR );
		renderer.setViewport( xR, yR, widthR, heightR );
		renderer.render( scene, options.stereo.cameraR );

		renderer.setScissorTest( false );

	};

};

if ( THREE.gui === undefined )
	THREE.gui = {};
else console.error( 'Duplicate THREE.gui object' );

//Adds StereoEffects folder into dat.GUI.
//See https://github.com/dataarts/dat.gui/blob/master/API.md about dat.GUI API.
//gui: dat.GUI object.
//options: See options of StereoEffect above for details.
//guiParams:
//{
//	getLanguageCode: Your custom getLanguageCode() function.
//		returns the "primary language" subtag of the language version of the browser.
//		Examples: "en" - English language, "ru" Russian.
//		See the "Syntax" paragraph of RFC 4646 https://tools.ietf.org/html/rfc4646#section-2.1 for details.
//		Default returns the 'en' is English language.
//	lang: Object with localized language values
//	scale: scale of allowed values. Default is 1.
//}
THREE.gui.stereoEffect = function ( gui, options, guiParams ) {

	if ( guiParams === undefined ) guiParams = {};
	guiParams.scale = guiParams.scale || 1;

	//Localization

	var _lang = {
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

		focus: 'Focus',
		focusTitle: 'Object distance.',

		zeroParallaxName: 'Zero parallax',
		zeroParallaxTitle: 'Distance to objects with zero parallax.',

		defaultButton: 'Default',
		defaultTitle: 'Restore default stereo effects settings.',

	};

	var _languageCode = guiParams.getLanguageCode === undefined ? function () {

		return 'en';//Default language is English

	} : guiParams.getLanguageCode();
	switch ( _languageCode ) {

		case 'ru'://Russian language
			_lang.stereoEffects = 'Стерео эффекты';//'Stereo effects'

			_lang.spatialMultiplexName = 'Мультиплекс';//'Spatial  multiplex'
			_lang.spatialMultiplexTitle = 'Выберите способ создания пространственного мультиплексирования.';

			_lang.spatialMultiplexs = {
				'Моно': THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono, //Mono
				'Слева направо': THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS, //https://en.wikipedia.org/wiki/DVB_3D-TV#Side_by_side
				'Сверху вниз': THREE.StereoEffectParameters.spatialMultiplexsIndexs.TaB, //https://en.wikipedia.org/wiki/DVB_3D-TV#Top_and_bottom
			};

			_lang.eyeSeparationName = 'Развод камер';
			_lang.eyeSeparationTitle = 'Расстояние между левой и правой камерами.';

			_lang.focus = 'Фокус';
			_lang.focusTitle = 'Расстояние до объекта.';

			_lang.zeroParallaxName = 'Параллакс 0';
			_lang.zeroParallaxTitle = 'Расстояние до объектов с нулевым параллаксом.';

			_lang.defaultButton = 'Восстановить';
			_lang.defaultTitle = 'Восстановить настройки стерео эффектов по умолчанию.';
			break;
		default://Custom language
			if ( ( guiParams.lang === undefined ) || ( guiParams.lang._languageCode != _languageCode ) )
				break;

			Object.keys( guiParams.lang ).forEach( function ( key ) {

				if ( _lang[ key ] === undefined )
					return;
				_lang[ key ] = guiParams.lang[ key ];

			} );

	}

	//

	gui.remember( options );

	function displayControllers( value ) {

		var display = value == THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono ? 'none' : 'block';
		_controllerEyeSep.__li.style.display = display;
		if ( _controllerCameraFocus !== undefined )
			_controllerCameraFocus.__li.style.display = display;
		_controllerDefaultF.__li.style.display = display;
		_controllerZeroParallax.__li.style.display = display;

	}

	var _fStereoEffects = gui.addFolder( _lang.stereoEffects );//Stero effects folder

	//Spatial multiplex
	var _controllerSpatialMultiplex = _fStereoEffects.add( options, 'spatialMultiplex',
		_lang.spatialMultiplexs ).onChange( function ( value ) {

		value = parseInt( value );
		displayControllers( value );
		options.cookieObject.setObject();

	} );
	dat.controllerNameAndTitle( _controllerSpatialMultiplex, _lang.spatialMultiplexName, _lang.spatialMultiplexTitle );

	//eyeSeparation
	//http://paulbourke.net/papers/vsmm2007/stereoscopy_workshop.pdf
	var _controllerEyeSep = _fStereoEffects.add( options.stereo, 'eyeSep', 0, options.optionsDefault.eyeSep * 3, options.optionsDefault.eyeSep / 10 )
		.onChange( function ( value ) {

			options.eyeSep = value;
			options.cookieObject.setObject();

		} );
	dat.controllerNameAndTitle( _controllerEyeSep, _lang.eyeSeparationName, _lang.eyeSeparationTitle );

	//camera.focus
	var _controllerCameraFocus;
	if ( options.camera ) {

		_controllerCameraFocus = _fStereoEffects.add( options.camera, 'focus',
			options.optionsDefault.focus / 10, options.optionsDefault.focus * 2, options.optionsDefault.focus / 1000 )
			.onChange( function ( value ) {

				options.focus = value;
				options.cookieObject.setObject();

			} );
		dat.controllerNameAndTitle( _controllerCameraFocus, _lang.focus, _lang.focusTitle );

	}

	//Zero parallax
	//http://paulbourke.net/papers/vsmm2007/stereoscopy_workshop.pdf
	var _minMax = ( 60 - ( 400 / 9 ) ) * guiParams.scale + 400 / 9;
	var _controllerZeroParallax = _fStereoEffects.add( options, 'zeroParallax', - _minMax, _minMax )
		.onChange( function ( value ) {

			options.zeroParallax = value;
			options.cookieObject.setObject();

		} );
	dat.controllerNameAndTitle( _controllerZeroParallax, _lang.zeroParallaxName, _lang.zeroParallaxTitle );

	//default button
	var _controllerDefaultF = _fStereoEffects.add( {
		defaultF: function ( value ) {

			options.stereo.eyeSep = options.optionsDefault.eyeSep;
			_controllerEyeSep.setValue( options.stereo.eyeSep );

			if ( options.camera ) {

				options.camera.focus = options.optionsDefault.focus;
				_controllerCameraFocus.setValue( options.camera.focus );

				options.zeroParallax = options.optionsDefault.zeroParallax;
				_controllerZeroParallax.setValue( options.zeroParallax );

			}

		},

	}, 'defaultF' );
	dat.controllerNameAndTitle( _controllerDefaultF, _lang.defaultButton, _lang.defaultTitle );

	displayControllers( options.spatialMultiplex );

};


if ( THREE.getLanguageCode === undefined ) {

	//returns the "primary language" subtag of the version of the browser.
	//See the "Syntax" paragraph of RFC 4646 https://tools.ietf.org/html/rfc4646#section-2.1 for details.
	THREE.getLanguageCode = function () {

		//returns the language version of the browser.
		function _getLocale() {

			if ( ! navigator ) {

				console.error( "getLocale() failed! !navigator" );
				return "";

			}

			if (
				( navigator.languages !== undefined )
				&& ( typeof navigator.languages !== 'unknown' )//for IE6
				&& ( navigator.languages.length > 0 )
			)
				return navigator.languages[ 0 ];//Chrome

			//IE
			if ( navigator.language ) {

				return navigator.language;

			} else if ( navigator.browserLanguage ) {

				return navigator.browserLanguage;

			} else if ( navigator.systemLanguage ) {

				return navigator.systemLanguage;

			} else if ( navigator.userLanguage ) {

				return navigator.userLanguage;

			}

			console.error( "getLocale() failed!" );
			return "";

		}

		return _getLocale().toLowerCase().match( /([a-z]+)(?:-([a-z]+))?/ )[ 1 ];

	};

} else console.error( 'Duplicate THREE.getLanguageCode method' );

//Saving user settings.
if ( THREE.cookie === undefined ) {

	// name: name of current setting
	THREE.cookie = function ( name ) {

		this.isCookieEnabled = function () {

			if ( ! navigator.cookieEnabled ) {

				console.error( 'navigator.cookieEnabled = ' + navigator.cookieEnabled );
				//Enable cookie
				//Chrome: Settings/Show advanced settings.../Privacy/Content settings.../Cookies/Allow local data to be set
				return false;

			}
			return true;

		};

		// Saving settings.
		// value: current setting
		this.set = function ( value ) {

			if ( ! this.isCookieEnabled() )
				return;

			var _cookieDate = new Date();
			_cookieDate.setTime( _cookieDate.getTime() + 1000 * 60 * 60 * 24 * 365 );//One year of expiry period
			document.cookie = name + "=" + value.toString() + "; expires=" + _cookieDate.toGMTString() + '; path=' + location.pathname;
			return;

		};

		// Loading settings, saved by THREE.cookie.set
		// defaultValue: default setting
		this.get = function ( defaultValue ) {

			if ( ! this.isCookieEnabled() )
				return;
			var _results = document.cookie.match( '(^|;) ?' + name + '=([^;]*)(;|$)' );

			if ( _results )
				return ( unescape( _results[ 2 ] ) );
			if ( defaultValue === undefined )
				return '';
			return defaultValue;

		};

		this.isTrue = function ( defaultValue ) {

			switch ( this.get() ) {

				case 'true':
					return true;
				case 'false':
					return false;

			}
			return defaultValue;

		};

		//Default cookie is not saving settings
		this.default = function ( name ) {

			this.get = function ( defaultValue ) {

				// Default cookie is not loading settings
				return defaultValue;

			};

			this.set = function () {

				// Default cookie is not saving settings

			};

			this.setObject = function () {

				// Default cookie is not saving object's settings

			};

			this.isTrue = function ( defaultValue ) {

				return defaultValue;

			};

		};

		this.getObject = function ( options, optionsDefault ) {

			if ( ! optionsDefault )
				return;//object's settings is not saving

			options.optionsDefault = optionsDefault;
			options.cookieObject = new ( typeof options.cookie === "function" ? options.cookie : options.cookie.cookie
				|| new THREE.cookie().default )( name );

			options.cookieObject.options = options;
			var cookieObject = JSON.parse( options.cookieObject.get( JSON.stringify( options.optionsDefault ) ) );
			Object.keys( options.optionsDefault ).forEach( function ( key ) {

				if ( cookieObject[ key ] === undefined )
					return;
				if ( typeof options.optionsDefault[ key ] === "object" )
					Object.keys( options.optionsDefault[ key ] ).forEach( function ( key2 ) {

						if ( options[ key ] === undefined ) options[ key ] = cookieObject[ key ];
						if ( cookieObject[ key ][ key2 ] !== undefined )
							options[ key ][ key2 ] = cookieObject[ key ][ key2 ];

					} );
				else options[ key ] = cookieObject[ key ];

			} );

		};

		this.setObject = function () {

			var object = {},
				options = this.options;
			Object.keys( options.optionsDefault ).forEach( function ( key ) {

				object[ key ] = options[ key ];

			} );
			options.cookieObject.set( JSON.stringify( object ) );

		};

	};

} else console.error( 'Duplicate THREE.cookie object' );

if ( typeof dat !== 'undefined' ) {

	//dat.GUI is included into current project
	//See https://github.com/dataarts/dat.gui/blob/master/API.md about dat.GUI API.

	function elNameAndTitle( el, name, title ) {

		el.innerHTML = name;
		if ( title !== undefined )
			el.title = title;

	}

	if ( dat.controllerNameAndTitle === undefined ) {

		dat.controllerNameAndTitle = function ( controller, name, title ) {

			elNameAndTitle( controller.__li.querySelector( ".property-name" ), name, title );

		};

	} else console.error( 'Duplicate dat.controllerNameAndTitle method.' );

	if ( dat.folderNameAndTitle === undefined ) {

		dat.folderNameAndTitle = function ( folder, name, title ) {

			elNameAndTitle( folder.__ul.querySelector( "li.title" ), name, title );

		};

	} else console.error( 'Duplicate dat.folderNameAndTitle method.' );

}
