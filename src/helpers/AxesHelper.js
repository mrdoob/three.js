/**
 * @author sroucheray / http://sroucheray.org/
 * @author mrdoob / http://mrdoob.com/
 * @authod anhr / https://github.com/anhr/
 */

import { LineSegments } from '../objects/LineSegments.js';
import { VertexColors } from '../constants.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

//options:
//{
//	negativeAxes: true - draw negative axes. Default is false.
//	cookie: Your custom cookie function for saving and loading of the AxesHelper settings. Default cookie is not saving settings.
//	colors: axes colors array
//			Each array color item defines the intensity of color as an value between 0 and 1.
//						0 is dark
//						1 is max intensity.
//				Array length is 3. Same color for all axis.
//					Item 0 is red intensity.
//					Item 1 is green intensity.
//					Item 2 is blue intensity.
//					Example
//					[
//						//red	green	blue
//						0.5,	0.5,	0.5,//gray axes
//					]
//				Array length is 9. Specifies a color for each axis.
//					From 0 to 2 items is x axis color.
//					From 3 to 5 items is y axis color.
//					From 6 to 8 items is z axis color.
//					Example
//					[
//						//red	green	blue
//						0,		0,		1,//x is blue
//						0,		1,		0,//y is green
//						1,		0,		0,//z is red
//					]
//				Array length is 18. Specifies a color for each vertex of the axis.
//					Array items format
//						0  to 5  is color of the axes x
//						6  to 11 is color of the axes y
//						12 to 17 is color of the axes z
//					Format of each axes
//						0 to 2 is color of the begin vertex of the axis
//						3 to 6 is color of the end vertex of the axis
//					Format of each color
//						0 is read
//						1 is green
//						2 is blue
//
//					Default is
//					[
//						begin					end
//						red		green	blue	red		green	blue
//						1,		0,		0,		1,		0.6,	0,//Axes x
//						0,		1,		0,		0.6,	1,		0,//Axes y
//						0,		0,		1,		0,		0.6,	1,//Axes z
//					]
//	scales:
//	{
//		display: true - displays the label and scale of the axes. Default is false.
//		x: X axis options
//		{
//			name: axis name. Default is "X"
//			min: Minimum range of the x axis. Default is undefined.
//			max: Maximum range of the x axis. Default is undefined.
//			marks: Number of x scale marks. Default is 7.
//		}
//		y: Y axis options
//		{
//			name: axis name. Default is "Y"
//			min: Minimum range of the y axis. Default is undefined.
//			max: Maximum range of the y axis. Default is undefined.
//			marks: Number of y scale marks. Default is 7.
//		}
//		z: Z axis options
//		{
//			name: axis name. Default is "Z"
//			min: Minimum range of the z axis. Default is undefined.
//			max: Maximum range of the z axis. Default is undefined.
//			marks: Number of z scale marks. Default is 7.
//		}
//	}
//	onchangeWindowRange: The callback function is called if the user has changed the minimum or maximum axis value. Can be undefined.
//}
function AxesHelper( size, options ) {

	var axesHelper = this,
		marksDefault = 7;

	size = size || 1;

	options = options || {};
	this.options = options;
	options.negativeAxes = options.negativeAxes || false;
	options.scales = options.scales || { display: false, };

	options.scales.x = options.scales.x || { };
	options.scales.x.name = options.scales.x.name || 'X';
	options.scales.x.marks = options.scales.x.marks || marksDefault;

	options.scales.y = options.scales.y || { };
	options.scales.y.name = options.scales.y.name || 'Y';
	options.scales.y.marks = options.scales.y.marks || marksDefault;

	options.scales.z = options.scales.z || { };
	options.scales.z.name = options.scales.z.name || 'Z';
	options.scales.z.marks = options.scales.z.marks || marksDefault;

	new THREE.cookie('axes').getObject ( options, {

		negativeAxes: options.negativeAxes,
		//		scales: Object.assign( {}, options.scales ),
		scales: JSON.parse(JSON.stringify(options.scales)),

	} );

	this.axesEnum = {
		x: 0,
		y: 1,
		z: 2,
		getName: function ( id ){

			var axesEnum = this,
				name;
			Object.keys( this ).forEach( function ( key ){

				if ( axesEnum[ key ] === id )
					name = key;

			} );
			if( name === undefined )
				console.error( 'THREE.AxesHelper.axesEnum.getName: invalid id = ' + id );
			return name;

		}
	};

	function getVertices(){
		var negativeSize = options.negativeAxes ? -size : 0;

		var vertices = [
			//begin	vertex									end vertex
			//x				y				z				x		y		z
			negativeSize,	0,				0,				size,	0,		0,	//Axes x
			0,				negativeSize,	0,				0,		size,	0,	//Axes y
			0,				0,				negativeSize,	0,		0,		size//Axes z
		];

		return new Float32BufferAttribute( vertices, 3 );
	}

	//colors
	if ( options.colors ) {

		if (typeof options.colors === 'string')
			options.colors = [ options.colors, options.colors, options.colors ];
		if ( Array.isArray( options.colors ) )
			switch ( options.colors.length ) {

				case 18://Specifies a color for each vertex of the axis.
					break;
				case 9://Specifies a color for each axis.
					var colors = options.colors;
					options.colors = [
						//begin									end
						//red		green			blue		red			green		blue
						colors[ 0 ], colors[ 1 ], colors[ 2 ], colors[ 0 ], colors[ 1 ], colors[ 2 ],//x
						colors[ 3 ], colors[ 4 ], colors[ 5 ], colors[ 3 ], colors[ 4 ], colors[ 5 ],//y
						colors[ 6 ], colors[ 7 ], colors[ 8 ], colors[ 6 ], colors[ 7 ], colors[ 8 ],//z
					];
					break;
				case 3://Same color for all axis.
					var colors = options.colors;
					options.colors = [
						//begin									end
						//red		green			blue		red			green		blue
						colors[ 0 ], colors[ 1 ], colors[ 2 ], colors[ 0 ], colors[ 1 ], colors[ 2 ],//x
						colors[ 0 ], colors[ 1 ], colors[ 2 ], colors[ 0 ], colors[ 1 ], colors[ 2 ],//y
						colors[ 0 ], colors[ 1 ], colors[ 2 ], colors[ 0 ], colors[ 1 ], colors[ 2 ],//z
					];
					break;
				default: console.error( 'THREE.AxesHelper: Invalid options.colors.length = ' + options.colors.length );
					return;

			}
		else {

			console.error( 'THREE.AxesHelper: Invalid options.colors: ' + options.colors );
			return;

		}

	}
	var colors = options.colors || [
		//begin					end
		//red	green	blue	red		green	blue
		1,		0,		0,		1,		0.6,	0,//Axes x
		0,		1,		0,		0.6,	1,		0,//Axes y
		0,		0,		1,		0,		0.6,	1,//Axes z
	];
	function getColor(colorIndex){
		colorIndex *= 3;
		return ((colors[colorIndex] * 0xff) << 16) + ((colors[colorIndex + 1] * 0xff) << 8) + colors[colorIndex + 2] * 0xff;
	}

	var geometry = new BufferGeometry();
	geometry.addAttribute( 'position', getVertices() );
	geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

	var material = new LineBasicMaterial( { vertexColors: VertexColors } );

	LineSegments.call( this, geometry, material );

	function getVerticePosition(verticeIndex){
		verticeIndex *= 3;
		var array = geometry.attributes.position.array;
		return new THREE.Vector3(array[verticeIndex], array[verticeIndex + 1], array[verticeIndex + 2]);
	}
	this.getAxesPosition = function ( axesId ){

		var axes = this.axesEnum.getName( axesId );
		return {

			min: {
				position: getVerticePosition(axesId * 2),
				scale: options.scales[axes].min,
			},
			max: {
					
				position: getVerticePosition(axesId * 2 + 1 ),
				scale: options.scales[axes].max,

			}

		}

	};

	//axes scales

	var axesScales;

	this.arraySpriteText = [];
	this.arraySpriteText.options = {

		textHeight: 0.06 * size,
		rect: {
			displayRect: true,
			borderThickness: 3,
			borderRadius: 10,
			//borderColor: 'rgb( 100, 100, 100 )',
			backgroundColor: 'rgba( 0, 0, 0, 1 )',
		},
		cookie: THREE.cookie,

	};
	function addAxesScales(){

		var groupMarksTextX, groupMarksTextY, groupMarksTextZ;
		if( ! axesScales ){

			axesScales = new THREE.Group();

			groupMarksTextX = new THREE.Group();
			axesScales.add( groupMarksTextX );

			groupMarksTextY = new THREE.Group();
			axesScales.add( groupMarksTextY );

			groupMarksTextZ = new THREE.Group();
			axesScales.add( groupMarksTextZ );

		}

		//////////////////////////////////////////
		//The label keeps facing to you
		//Example https://stackoverflow.com/questions/28337772/make-text-always-appear-orthogonal-to-the-plane-when-rotating-a-cube/28340855

		// convert a 24 bit binary color to 0..255 R,G,B
		//https://gist.github.com/lrvick/2080648
		function binToRGB( bin ) {
			return {

				r: bin >> 16,
				g: bin >> 8 & 0xFF,
				b: bin & 0xFF,

			};
		}

		function drawScale( scaleIndex ){

			var scales,
				position = getVerticePosition( scaleIndex * 2 + 1 ),
				color = getColor( scaleIndex * 2 + 1 ),//0x0000ff,//blue
				textColor = binToRGB( color ),

				markX = 0, markY = 0, markZ = 0,
				groupMarksText, marksTextCenter,
				textPositionMarks = new THREE.Vector3( 0, 0, 0 ),

				rotate = new THREE.Vector3( 0, 0, 0 ), angle = Math.PI * 0.5,
				textPosition = new THREE.Vector3( 0, 0, 0 ).copy( position ), delta = 0;//0.03
			textColor.a = 1.0;
			switch(scaleIndex){

				case axesHelper.axesEnum.x:
					rotate.z = - angle;
					textPosition.y -= delta;
					textPosition.z -= delta;
					scales = options.scales.x;
					markY = 1;
					groupMarksText = groupMarksTextX;
					marksTextCenter = new THREE.Vector2( 1, 1 );
					break;
				case axesHelper.axesEnum.y:
					textPosition.x += delta;
					textPosition.z += delta;
					scales = options.scales.y;
					markX = 1;
					groupMarksText = groupMarksTextY;
					marksTextCenter = new THREE.Vector2( 0, 0 );
					textPositionMarks.x = 1;
					textPositionMarks.y = 1;
					break;
				case axesHelper.axesEnum.z:
					rotate.x = angle;
					textPosition.x += delta;
					textPosition.y -= delta;
					scales = options.scales.z;
					markY = 1;
					groupMarksText = groupMarksTextZ;
					marksTextCenter = new THREE.Vector2( 0, 1 );
					break;
				default: console.error( 'THREE.AxesHelper.addAxesScales.drawScale: Invalid scaleIndex = ' + scaleIndex );

			}

			//Adds to the axes scale an arrow as cone
			//options
			//	position: THREE.Vector3 - position of the cone
			//	rotate: THREE.Vector3 of radians - Rotate the cone about the X, Y, Z axis.
			//	height: height of the cone
			function drawCone(options) {

				options = options || {};
				/*
							options.scale = options.scale || 1;
							var height = (options.height || 0.2) * options.scale,
				*/
				var height = 0.05 * size,
					radius = height / 5,
					geometry = new THREE.ConeBufferGeometry( radius, height, 8 );
				if ( options.rotate !== undefined ){

					geometry.rotateX( options.rotate.x );
					geometry.rotateY( options.rotate.y );
					geometry.rotateZ( options.rotate.z );

				}

				var material = new THREE.MeshBasicMaterial( { color: options.color === undefined ? 0xffffff : options.color } );

				var mesh = new THREE.Mesh( geometry, material );
				if ( options.position !== undefined ) mesh.position.copy( options.position );
				axesScales.add( mesh );

			}
			drawCone( {

				position: position,
				rotate: rotate,
				color: color,

			} );

			function text( text, position, options ){

				var optionsCur = {},
					strColor = textColor.r + "," + textColor.g + "," + textColor.b;
				/*
								if ( axesHelper.arraySpriteText.options.cookieObject !== undefined ) {
			
									delete axesHelper.arraySpriteText.options.cookieObject.options.cookieObject;
									delete axesHelper.arraySpriteText.options.cookieObject.options.commonOptions;
			
								}
				*/
				optionsCur.commonOptions = axesHelper.arraySpriteText.options;
				optionsCur.rect = { borderColor: 'rgb( ' + strColor + ' )', };
				var delta = 0.01 * size;
				optionsCur.position = new THREE.Vector3(
					position.x + delta * textPositionMarks.x,
					position.y - delta * ( options.up === undefined ? 1 : -1 ) + delta * textPositionMarks.y,
					position.z + delta * textPositionMarks.z );
				optionsCur.fontColor = "rgba(" + strColor + "," + textColor.a + ")";
				if ( options.center !== undefined )
					optionsCur.center = options.center;
				var spriteText = new THREE.SpriteText( text, optionsCur );
				axesHelper.arraySpriteText.push( spriteText );
				if ( options.group === undefined )
					axesScales.add( spriteText );
				else options.group.add( spriteText );

			}

			//Window Range

			function scaleMark( position, markText ) {

				var material = new THREE.LineBasicMaterial( { color: color } ),
					geometry = new THREE.Geometry();

				//scale mark
				var markSize = 0.01 * size;
				geometry.vertices.push( new THREE.Vector3(
					position.x - markSize * markX,
					position.y - markSize * markY,
					position.z - markSize * markZ ) );
				geometry.vertices.push( new THREE.Vector3( 
					position.x + markSize * markX,
					position.y + markSize * markY,
					position.z + markSize * markZ ) );
				groupMarksText.add(new THREE.Line( geometry, material ));
				text( markText, position, {

					group: groupMarksText,
					center: marksTextCenter,

				} );

			}

			function windowRange() {

				//remove all old mark's texts
				for( var i = groupMarksText.children.length - 1; i >= 0; i-- ) {

					groupMarksText.remove( groupMarksText.children[ i ] );

				}

				var minPosition = getVerticePosition(scaleIndex * 2);
				if ( scales.min !== undefined )
					scaleMark( minPosition, scales.min );

				var maxPosition = getVerticePosition(scaleIndex * 2 + 1 );
				if ( scales.max !== undefined )
					scaleMark( maxPosition, scales.max );

				if ( ( scales.min !== undefined ) && ( scales.max !== undefined ) && ( scales.min !== scales.max )){

					var marks = scales.marks - 1;// || 6;
					var step = ( scales.max - scales.min ) / marks,
						distanceX = ( maxPosition.x - minPosition.x ) / marks,
						distanceY = ( maxPosition.y - minPosition.y ) / marks,
						distanceZ = ( maxPosition.z - minPosition.z ) / marks;
					for ( var i = 1; i < marks; i++ ){

						scaleMark( new THREE.Vector3(
							minPosition.x + distanceX * i,
							minPosition.y + distanceY * i,
							minPosition.z + distanceZ * i ),scales.min + step * i );

					}

				}
				options.cookieObject.setObject();

			}

			switch(scaleIndex){
				case axesHelper.axesEnum.x:
					axesHelper.windowRangeX = windowRange;
					break;
				case axesHelper.axesEnum.y:
					axesHelper.windowRangeY = windowRange;
					break;
				case axesHelper.axesEnum.z:
					axesHelper.windowRangeZ = windowRange;
					break;
				default: console.error( 'THREE.AxesHelper.addAxesScales.drawScale: Invalid scaleIndex = ' + scaleIndex );
			}
			windowRange();

			//text

			text( scales.name, textPosition, {
					
				center: new THREE.Vector2( 1, 0 ),
				up: true,
				
			} );

		}
		drawScale( axesHelper.axesEnum.x );
		drawScale( axesHelper.axesEnum.y );
		drawScale( axesHelper.axesEnum.z );

		//

		axesHelper.add(axesScales);

	}

	//	var axesHelper = this;
	//	this.name = 'AxesHelper';

	if (options.scales.display) addAxesScales();
	//	axesScales.visible = options.scales.display;

	//Adds AxesHelper folder into gui.
	//https://github.com/dataarts/dat.gui/blob/master/API.md
	//guiParams:
	//{
	//	getLanguageCode: Your custom getLanguageCode() function. 
	//		returns the "primary language" subtag of the language version of the browser.
	//		Examples: "en" - English language, "ru" Russian.
	//		See the "Syntax" paragraph of RFC 4646 https://tools.ietf.org/html/rfc4646#section-2.1 for details.
	//		Default returns the 'en' is English language.
	//	cookie: Your custom cookie function for saving of the AxesHelper settings
	//	lang: Object with localized language values
	//}
	this.gui = function (gui, guiParams) {

		if ( guiParams === undefined ) guiParams = {};

		function getLanguageCode() { return 'en'; }//Default language is English
		if ( guiParams.getLanguageCode !== undefined ) getLanguageCode = guiParams.getLanguageCode;

		//Localization

		var lang = {
			axesHelper: 'Axes Helper',

			negativeAxes: 'Negative Axes',
			negativeAxesTitle: 'Draw negative axes.',

			scales: 'Scales',
			//scalesTitle: '',

			displayScales: 'Display',
			displayScalesTitle: 'Display or hide axes scales.',

			min: 'Min',
			max: 'Max',

			marks: 'Marks',
			marksTitle: 'Number of scale marks',

			defaultButton: 'Default',
			defaultTitle: 'Restore default Axes Helper settings.',
		};

		var languageCode = getLanguageCode();
		switch (languageCode) {
			/*
			case 'ru'://Russian language
			//Warning. This file is not support an international language.
				break;
			*/
			default://Custom language
				if (( guiParams.lang === undefined ) || ( guiParams.lang.languageCode != languageCode ))
					break;

				Object.keys(guiParams.lang).forEach(function (key) {
					if ( lang[ key ] === undefined )
						return;
					lang[ key ] = guiParams.lang[ key ];
				});
		}

		//

		if( guiParams.gui !== undefined )
			guiParams.gui.remember(options);

		//AxesHelper folder
		var fAxesHelper = gui.addFolder(lang.axesHelper);
		/*
		//negative Axes
		var controllerNegativeAxes = fAxesHelper.add(options, 'negativeAxes').onChange(function (value) {
			var position = geometry.attributes.position;
			position.array = getVertices().array;
			position.needsUpdate = true;
			options.cookieObject.setObject();
		});
		dat.controllerNameAndTitle(controllerNegativeAxes, lang.negativeAxes, lang.negativeAxesTitle);
		*/
		//scales folder
		var fScales = fAxesHelper.addFolder(lang.scales);

		//display scales
		function displayControllers( value ) {

			var display = value ? 'block' : 'none';
			fSpriteText.domElement.style.display = display;
			options.scalesControllers.x.folder.domElement.style.display = display;
			options.scalesControllers.y.folder.domElement.style.display = display;
			options.scalesControllers.z.folder.domElement.style.display = display;

		}
		var controllerDisplayScales = fScales.add( options.scales, 'display' ).onChange(function ( value ) {

			axesScales.visible = value;
			displayControllers( value );
			options.cookieObject.setObject();

		});
		dat.controllerNameAndTitle( controllerDisplayScales, lang.displayScales, lang.displayScalesTitle );

		function onchangeWindowRange( windowRange ){

			windowRange();
			if ( options.onchangeWindowRange !== undefined )
				options.onchangeWindowRange();

		}

		function scale ( axes, windowRange, scaleControllers ){

			scaleControllers.folder = fAxesHelper.addFolder( axes.name );

			//min
			scaleControllers.min = dat.controllerZeroStep( scaleControllers.folder, axes, 'min', function (value) {

				onchangeWindowRange( windowRange );

			} );
			dat.controllerNameAndTitle( scaleControllers.min, lang.min );

			//max
			scaleControllers.max = dat.controllerZeroStep( scaleControllers.folder, axes, 'max', function (value) {

				onchangeWindowRange( windowRange );

			} );
			dat.controllerNameAndTitle( scaleControllers.max, lang.max );

			//marks
			scaleControllers.marks = dat.controllerZeroStep( scaleControllers.folder, axes, 'marks', function (value) {

				windowRange();

			} );
			dat.controllerNameAndTitle( scaleControllers.marks, lang.marks, lang.marksTitle );

		}
		options.scalesControllers = { x: {}, y: {}, z: {}, };
		scale ( options.scales.x, axesHelper.windowRangeX, options.scalesControllers.x );
		scale ( options.scales.y, axesHelper.windowRangeY, options.scalesControllers.y );
		scale ( options.scales.z, axesHelper.windowRangeZ, options.scalesControllers.z );

		//default button
		var defaultParams = {

			defaultF: function (value) {

				if (typeof controllerNegativeAxes !== 'undefined')
					controllerNegativeAxes.setValue( options.optionsDefault.negativeAxes );
				controllerDisplayScales.setValue( options.optionsDefault.scales.display );
				function restore ( scaleControllers, scale, windowRange ){

					scaleControllers.min.setValue( scale.min );
					scaleControllers.max.setValue( scale.max );
					scaleControllers.marks.setValue( scale.marks );
					//					windowRange();
					onchangeWindowRange( windowRange );

				}
				restore ( options.scalesControllers.x, options.optionsDefault.scales.x, axesHelper.windowRangeX );
				restore ( options.scalesControllers.y, options.optionsDefault.scales.y, axesHelper.windowRangeY );
				restore ( options.scalesControllers.z, options.optionsDefault.scales.z, axesHelper.windowRangeZ );

			},

		};
		var controllerDefaultF = fAxesHelper.add(defaultParams, 'defaultF');
		dat.controllerNameAndTitle(controllerDefaultF, lang.defaultButton, lang.defaultTitle);

		if( axesHelper.arraySpriteText.length === 0 ) {
				
			addAxesScales();
			axesScales.visible = options.scales.display;

		}
		var fSpriteText = THREE.gui.spriteText(gui, axesHelper.arraySpriteText, {

			parentFolder: fScales,
			getLanguageCode: function () { return languageCode; },

		} );
		displayControllers( options.scales.display );
	};
}

AxesHelper.prototype = Object.create( LineSegments.prototype );
AxesHelper.prototype.constructor = AxesHelper;


export { AxesHelper };
