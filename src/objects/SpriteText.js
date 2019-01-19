/**
 * @author anhr / https://github.com/anhr/
*/

//Attenttion!!! Save this file as UTF-8 for localization

//A sprite based text component.
//text: The text to be displayed on the sprite.
//options:
//{
//	position: THREE.Vector3 - position of the text. Default is new THREE.Vector3(0,0,0)
//	textHeight: The height of the text. Default is 1
//	fontFace: CSS font-family - specifies the font of the text. Default is 'Arial'
//	fontFaces: array of fontFaces. Example ['Arial', 'Verdana', 'Times']
//	fontColor: RGBA object or RGB object or HEX value. Default is 'rgba(255, 255, 255, 1)'
//			Examples 'rgba(0, 0, 255, 0.5)', '#00FF00'
//	bold: CSS font-weight. Equivalent of 700. Default is false.
//	italic: CSS font-style. Default is false.
//	fontProperties: string. Other font properties. The font property uses the same syntax as the CSS font property.
//		Default is empty string. Example "900", "oblique lighter".
//	center: THREE.Vector2 - The text's anchor point.
//		A value of (0.5, 0.5) corresponds to the midpoint of the text.
//		A value of (0, 0) corresponds to the left lower corner of the text.
//		A value of (0, 1) corresponds to the left upper corner of the text.
//		Default is (0, 1).
//	rect: rectangle around the text.
//	{
//		displayRect: true - the rectangle around the text is visible. Default is false
//		backgroundColor: RGBA object or RGB object or HEX value. Default is 'rgba(100, 100, 100, 1)' - gray.
//			Examples 'rgba(0, 0, 255, 0.5)', '#00FF00'
//		borderColor: RGBA object or RGB object or HEX value. Default is 'rgba(0, 0, 0, 0)' - black transparent
//		borderThickness: Default is 0 - no border
//		borderRadius: Default is 0
//	}
//	cookie: Your custom cookie function for saving and loading of the SpriteText settings. Default cookie is not saving settings.
//}
//
//Thanks to / https://github.com/vasturiano/three-spritetext
THREE.SpriteText = function ( text, options ) {

	var sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: new THREE.Texture() } ) );

	options = options || {};
	sprite.options = options;
	if ( options.cookie === undefined )
		options.cookie = function ( name ) {

			this.get = function ( defaultValue ) {

				// Default cookie is not loading settings
				return defaultValue;

			};

			this.set = function () {

				// Default cookie is not saving settings

			};

			this.isTrue = function ( defaultValue ) {

				return defaultValue;

			};

		};
	options.text = text;//options.text || new options.cookie( 'SpriteText' ).get( 'Sprite Text' );
	options.position = options.position || new THREE.Vector3( 0, 0, 0 );
	options.textHeight = options.textHeight || 1;
	options.fontFace = options.fontFace || 'Arial';
	options.bold = options.bold || false;
	options.italic = options.italic || false;
	options.fontProperties = options.fontProperties || '';
	options.rect = options.rect || {};
	options.rect.displayRect = options.rect.displayRect || false;
	options.fontColor = options.fontColor || 'rgba(255, 255, 255, 1)';
	options.center = options.center || new THREE.Vector2( 0, 1 );

	//Default options
	options.optionsDefault = Object.assign( {}, options ),
	options.optionsDefault.center = Object.assign( {}, options.center );
	options.optionsDefault.rect = Object.assign( {}, options.rect );

	options.text = new options.cookie( 'text' ).get( options.text );
	options.textHeight = parseFloat( new options.cookie( 'textHeight' ).get( options.textHeight ) );
	if ( isNaN( options.textHeight ) ) options.textHeight = 1;
	options.fontFace = new options.cookie( 'fontFace' ).get( options.fontFace );
	options.bold = new options.cookie( 'bold' ).isTrue( options.bold );
	options.italic = new options.cookie( 'italic' ).isTrue( options.italic );
	options.fontProperties = new options.cookie( 'fontProperties' ).get( options.fontProperties );
	options.rect.displayRect = new options.cookie( 'displayRect' ).isTrue( options.rect.displayRect );
	options.fontColor = new options.cookie( 'fontColor' ).get( options.fontColor );
	options.center = JSON.parse( new options.cookie( 'center' ).get( JSON.stringify( options.center ) ) );

	var canvas = document.createElement( 'canvas' );
	sprite.material.map.minFilter = THREE.LinearFilter;
	var fontSize = 90;
	const context = canvas.getContext( '2d' );

	sprite.update = function ( optionsUpdate ) {

		if ( optionsUpdate !== undefined )
			Object.keys( optionsUpdate ).forEach( function ( key ) {

				options[ key ] = optionsUpdate[ key ];

			} );

		options.font = `${options.fontProperties ? options.fontProperties + ' ' : ''}${options.bold ? 'bold ' : ''}${options.italic ? 'italic ' : ''}${fontSize}px ${options.fontFace}`;

		context.font = options.font;
		const textWidth = context.measureText( options.text ).width;
		canvas.width = textWidth;
		canvas.height = fontSize;

		context.font = options.font;

		//Rect
		//Thanks to http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html

		var borderThickness = options.rect.hasOwnProperty( "borderThickness" ) ?
				options.rect["borderThickness"] : 0;
		if ( options.rect.displayRect ) {

			// background color
			context.fillStyle = options.rect.hasOwnProperty( "backgroundColor" ) ?
				options.rect[ "backgroundColor" ] : 'rgba(0, 0, 0, 0)';

			// border color
			context.strokeStyle = options.rect.hasOwnProperty( "borderColor" ) ?
				options.rect[ "borderColor" ] : 'rgba(0, 255, 0, 1)';

			context.lineWidth = borderThickness;

			// function for drawing rounded rectangles
			function roundRect( ctx, x, y, w, h, r ) {

				ctx.beginPath();
				ctx.moveTo( x + r, y );
				ctx.lineTo( x + w - r, y );
				ctx.quadraticCurveTo( x + w, y, x + w, y + r );
				ctx.lineTo( x + w, y + h - r );
				ctx.quadraticCurveTo( x + w, y + h, x + w - r, y + h );
				ctx.lineTo( x + r, y + h );
				ctx.quadraticCurveTo( x, y + h, x, y + h - r );
				ctx.lineTo( x, y + r );
				ctx.quadraticCurveTo( x, y, x + r, y );
				ctx.closePath();
				ctx.fill();
				ctx.stroke();

			}
			roundRect( context,
				borderThickness / 2,
				borderThickness / 2,
				textWidth - borderThickness,
				fontSize - borderThickness,
				options.rect.borderRadius === undefined ? 0 : options.rect.borderRadius
			);

		}

		context.fillStyle = options.fontColor;
		context.textBaseline = 'bottom';
		context.fillText( options.text, 0, canvas.height + 2 * borderThickness );

		// Inject canvas into sprite
		sprite.material.map.image = canvas;
		sprite.material.map.needsUpdate = true;

		if ( options.hasOwnProperty( 'textHeight' ) )
			sprite.scale.set( options.textHeight * canvas.width / canvas.height, options.textHeight );
		if ( options.hasOwnProperty( 'position' ) )
			sprite.position.copy( options.position );
		if ( options.hasOwnProperty( 'center' ) )
			sprite.center = options.center;

	};
	sprite.update();

	return sprite;

};

//Adds SpriteText folder into gui.
//See src\objects\SpriteText.js for SpriteText details
//gui: see https://github.com/dataarts/dat.gui/blob/master/API.md for details
//sprite: sprite with text component or array of sprites
//guiParams:
//{
//	getLanguageCode: Your custom getLanguageCode() function.
//		returns the "primary language" subtag of the language version of the browser.
//		Examples: "en" - English language, "ru" Russian.
//		See the "Syntax" paragraph of RFC 4646 https://tools.ietf.org/html/rfc4646#section-2.1 for details.
//		Default returns the 'en' is English language.
//	lang: Object with localized language values
//	parentFolder:
//	spriteFolder: sprite folder name. Default is lang.spriteText
//}
//options: options of the SpriteText.
THREE.gui.spriteText = function ( gui, sprite, guiParams, options ) {

	if ( options === undefined ) options = sprite.options;
	if ( options.optionsDefault === undefined ) {

		if ( Array.isArray( sprite ) )
			options.optionsDefault = sprite[ 0 ].options.optionsDefault;
		else console.error( 'THREE.gui.spriteText: options.optionsDefault is undefined.' );

	}

	guiParams = guiParams || {};

	if ( options.cookie === undefined )
		options.cookie = function () {

			this.get = function ( defaultValue ) {

				// Default cookie is not loading settings
				return defaultValue;

			};

			this.set = function () {

				// Default cookie is not saving settings

			};

			this.isTrue = function ( defaultValue ) {

				return defaultValue;

			};

		};

	//Localization

	var lang = {
		spriteText: 'Sprite Text',

		text: 'Text',
		textTitle: 'The text to be displayed on the sprite.',

		textHeight: 'Height',
		textHeightTitle: 'Text Height.',

		fontFace: 'Font Face',
		fontFaceTitle: 'Choose text font.',

		bold: 'Bold',

		italic: 'Italic',

		fontProperties: 'Font Properties',
		fontPropertiesTitle: 'Other font properties. The font property uses the same syntax as the CSS font property.',

		fontStyle: 'Font Style',
		fontStyleTitle: 'Text style being used when drawing text. Read only.',

		displayRect: 'Rect',
		displayRectTitle: 'Display a rectangle around the text.',

		fontColor: 'Font Color',

		anchor: 'Anchor',
		anchorTitle: 'The text anchor point.',

		defaultButton: 'Default',
		defaultTitle: 'Restore default Sprite Text settings.',

	};

	var _languageCode = guiParams.getLanguageCode === undefined ? function () {

		return 'en';//Default language is English

	} : guiParams.getLanguageCode();
	switch ( _languageCode ) {

		case 'ru'://Russian language
			lang.spriteText = 'Текстовый спрайт';//'Sprite Text'

			lang.text = 'Текст';
			lang.textTitle = 'Текст, который будет отображен в спрайте.';

			lang.textHeight = 'Высота';
			lang.textHeightTitle = 'Высота текста.';

			lang.fontFace = 'Имя шрифта';
			lang.fontFaceTitle = 'Выберите шрифта текста.';

			lang.bold = 'Жирный';

			lang.italic = 'Наклонный';

			lang.fontProperties = 'Дополнительно';
			lang.fontPropertiesTitle = 'Дополнительные свойства шрифта. Свойство шрифта использует тот же синтаксис, что и свойство шрифта CSS.';

			lang.fontStyle = 'Стиль шрифта';
			lang.fontStyleTitle = 'Стиль шрифта, используемый при рисовании текста. Не редактируется.';

			lang.displayRect = 'Прямоугольник';
			lang.displayRectTitle = 'Отобразить прямоугольник вокруг текста.';

			lang.fontColor = 'Цвет шрифта';

			lang.anchor = 'Якорь';
			lang.anchorTitle = 'Точка привязки текста.';

			lang.defaultButton = 'Восстановить';
			lang.defaultTitle = 'Восстановить настройки текстового спрайта по умолчанию.';
			break;
		default://Custom language
			if ( ( guiParams.lang === undefined ) || ( guiParams.lang.languageCode != _languageCode ) )
				break;

			Object.keys( guiParams.lang ).forEach( function ( key ) {

				if ( lang[ key ] === undefined )
					return;
				lang[ key ] = guiParams.lang[ key ];

			} );

	}

	//

	function updateSpriteText() {

		if ( Array.isArray( sprite ) )
			sprite.forEach( function ( sprite ) {

				sprite.update( options );

			} );
		else sprite.update( options );

		if ( controllerFont !== undefined )
			controllerFont.setValue( options.font );

	}

	if ( ! guiParams.hasOwnProperty( 'parentFolder' ) )
		guiParams.parentFolder = gui;

	//Sprite folder
	var fSpriteText = guiParams.parentFolder.addFolder( guiParams.spriteFolder || lang.spriteText );//'Sprite Text'

	//Sprite text
	if ( options.hasOwnProperty( 'text' ) )
		dat.controllerNameAndTitle(
			fSpriteText.add( options, 'text' ).onChange( function ( value ) {

				updateSpriteText();
				new options.cookie( 'text' ).set( value );

			} ), lang.text, lang.textTitle );

	//Sprite text height
	if ( options.hasOwnProperty( 'textHeight' ) ) {

		var textHeightDefault = options.optionsDefault.textHeight;
		dat.controllerNameAndTitle(
			fSpriteText.add( options, 'textHeight', textHeightDefault / 10, textHeightDefault * 10, textHeightDefault / 10 ).onChange( function ( value ) {

				updateSpriteText();
				new options.cookie( 'textHeight' ).set( value );

			} ), lang.textHeight, lang.textHeightTitle );

	}

	//font faces
	if ( options.fontFaces !== undefined )
		dat.controllerNameAndTitle(
			fSpriteText.add( options, 'fontFace', options.fontFaces ).onChange( function ( value ) {

				updateSpriteText();
				new options.cookie( 'fontFace' ).set( value );

			} ), lang.fontFace, lang.fontFaceTitle );

	//bold
	if ( options.hasOwnProperty( 'bold' ) )
		dat.controllerNameAndTitle(
			fSpriteText.add( options, 'bold' ).onChange( function ( value ) {

				updateSpriteText();
				new options.cookie( 'bold' ).set( value );

			} ), lang.bold );

	//italic
	if ( options.hasOwnProperty( 'italic' ) )
		dat.controllerNameAndTitle(
			fSpriteText.add( options, 'italic' ).onChange( function ( value ) {

				updateSpriteText();
				new options.cookie( 'italic' ).set( value );

			} ), lang.italic );

	//font properties
	if ( options.hasOwnProperty( 'fontProperties' ) )
		dat.controllerNameAndTitle(
			fSpriteText.add( options, 'fontProperties' ).onChange( function ( value ) {

				updateSpriteText();
				new options.cookie( 'fontProperties' ).set( value );

			} ), lang.fontProperties, lang.fontPropertiesTitle );

	//font style
	if ( options.hasOwnProperty( 'font' ) ) {

		var controllerFont = fSpriteText.add( options, 'font' );
		controllerFont.__input.readOnly = true;
		dat.controllerNameAndTitle( controllerFont, lang.fontStyle, lang.fontStyleTitle );

	}

	//text rectangle
	if ( ( options.hasOwnProperty( 'rect' ) ) && ( options.rect.hasOwnProperty( 'displayRect' ) ) )
		dat.controllerNameAndTitle( fSpriteText.add( options.rect, 'displayRect' ).onChange( function ( value ) {

			updateSpriteText();
			new options.cookie( 'displayRect' ).set( value );

		} ), lang.displayRect, lang.displayRectTitle );

	//font сolor
	if ( options.hasOwnProperty( 'fontColor' ) )
		dat.controllerNameAndTitle( fSpriteText.addColor( options, 'fontColor' ).onChange( function ( value ) {

			updateSpriteText();
			new options.cookie( 'fontColor' ).set( value );

		} ), lang.fontColor );

	if ( options.hasOwnProperty( 'center' ) ) {

		//anchor
		var fAnchor = fSpriteText.addFolder( 'center' );
		dat.folderNameAndTitle( fAnchor, lang.anchor, lang.anchorTitle );

		//anchor x
		fAnchor.add( options.center, 'x', 0, 1, 0.1 ).onChange( function ( value ) {

			updateSpriteText();
			new options.cookie( 'center' ).set( JSON.stringify( options.center ) );

		} );

		//anchor y
		fAnchor.add( options.center, 'y', 0, 1, 0.1 ).onChange( function ( value ) {

			updateSpriteText();
			new options.cookie( 'center' ).set( JSON.stringify( options.center ) );

		} );

	}

	//default button
	var optionsDefault = options.optionsDefault,
		defaultParams = {
			defaultF: function ( value ) {

				function setValues( folder, key, optionsDefault ) {

					folder.__controllers.forEach( function ( controller ) {

						if ( controller.property !== key ) {

							if ( typeof optionsDefault[ key ] !== "object" )
								return;
							Object.keys( optionsDefault[ key ] ).forEach( function ( optionKey ) {

								if ( controller.property !== optionKey )
									return;
								controller.setValue( optionsDefault[ key ][ optionKey ] );

							} );
							return;

						}
						controller.setValue( optionsDefault[ key ] );

					} );

				}

				Object.keys( optionsDefault ).forEach( function ( key ) {

					setValues( fSpriteText, key, optionsDefault );

					Object.keys( fSpriteText.__folders ).forEach( function ( keyFolder ) {

						if ( keyFolder !== key )
							return;
						Object.keys( optionsDefault[ keyFolder ] ).forEach( function ( key ) {

							setValues( fSpriteText.__folders[ keyFolder ], key, optionsDefault[ keyFolder ] );

						} );

					} );

				} );

			},

		};
	dat.controllerNameAndTitle( fSpriteText.add( defaultParams, 'defaultF' ), lang.defaultButton, lang.defaultTitle );

};

