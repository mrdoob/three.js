/**
 * @author anhr / https://github.com/anhr/
*/

//Attenttion!!! Save this file as UTF-8 for localization

//load JavaScript file
//http://javascript.ru/forum/events/21439-dinamicheskaya-zagruzka-skriptov.html
//https://learn.javascript.ru/onload-onerror
//src: Point to an external JavaScript file.
THREE.loadScript = function ( src ) {

	function loadScriptBase( callback, appendTo ) {

		script = document.createElement( 'script' );
		script.setAttribute( "type", 'text/javascript' );
		callback( script );
		appendTo.appendChild( script );

	}

	//Synchronous load JavaScript file
	//this.sync = function () { loadScriptBase( function ( script ) { script.innerHTML = getSynchronousResponse( src ); } ); }

	//Asynchronous load JavaScript file
	//options: followed options is available
	//{
	//	onload: The onload event occurs when a script has been loaded.
	//	onerror: The onerror event occurs when aт error has been occured.
	//	appendTo: The node to which the new script will be append.
	//}
	this.async = function ( options ) {

		options = options || {};
		options.appendTo = options.appendTo || document.getElementsByTagName( 'head' )[0];

		var isrc;

		function async( srcAsync ) {
			var scripts = options.appendTo.querySelectorAll( 'script' );
			for ( i in scripts ) {

				var child = scripts[i];
				if ( child.id == srcAsync ) {
					if ( options.onload !== undefined ) {

						//setTimeout( function () { onload() }, 100 );//Если не сделать эту задержку, то при открыити локальной веб камеры иногда не успевает скачиваться app.js и появляется ошибка addMedia.js:6 Uncaught ReferenceError: App is not defined
						options.onload();

					}
					return;
				}

			}
			loadScriptBase( function ( script ) {
				script.setAttribute( "id", srcAsync );

				if ( script.readyState && !script.onload ) {
					// IE, Opera
					script.onreadystatechange = function () {
						if ( script.readyState == "complete" ) { // на случай пропуска loaded
							if ( options.onload !== undefined ) options.onload(); // (2)
						}

						if ( script.readyState == "loaded" ) {
							setTimeout( options.onload, 0 );  // (1)

							// убираем обработчик, чтобы не сработал на complete
							this.onreadystatechange = null;
						}
					}
				}
				else {
					// Rest
					function _onload() {
						//console.log( 'loadScript.onload() ' + this.src );
						if ( options.onload !== undefined ) {

							if ( src instanceof Array && ( isrc < ( src.length - 1 ) ) ) {

								isrc++;
								async( src[isrc] );

							}
							else options.onload();

						}
					}
					script.onload = _onload;

					if ( options.onerror !== undefined )
						script.onerror = options.onerror;
					else script.onerror = function () {
						console.error( 'loadScript: "' + this.src + '" failed' );
					};
				}

				script.src = srcAsync;
			}, options.appendTo );
		}

		if ( src instanceof Array ) {

			isrc = 0;
			async( src[ isrc ] );
//			src.forEach( function ( src ) { async( src ); } );

		}  else async( src );

	}
	return this;
}

//collection of interactive mathematical visualizations
//options: default is undefined.
//{
//	axesHelper: THREE.AxesHelper object. Default is undefined.
//	scale: scale of object. Default is 1
//	scales: scales of the axes. Default is undefined.
//	{
//		x: X axis options. Default is undefined.
//		{
//			min: Minimum range of the x axis. Default is -1.
//			max: Maximum range of the x axis. Default is 1.
//			name: name of the x axis. Default is 'x'.
//		}
//		y: Y axis options. Default is undefined.
//		{
//			min: Minimum range of the x axis. Default is -1.
//			max: Maximum range of the x axis. Default is 1.
//			name: name of the y axis. Default is 'y'.
//		}
//		z: Z axis options. Default is undefined.
//		{
//			min: Minimum range of the x axis. Default is -1.
//			max: Maximum range of the x axis. Default is 1.
//			name: name of the z axis. Default is 'z'.
//		}
//	}
//	color: color of the mathematical visualizations. Default is 0xffffff - white color
//	colorsHelper: intensity of the gray color of the dashed lines from selected point to appropriate axis.
//		Available values from 0x00 - dark to 0xff - white. Default is 0x80.
//	folder: gui folder or scene
//}
THREE.MathBox = function ( options ) {

	options = options || {};
	options.color = options.color || 0xffffff;
	options.colorsHelper = options.colorsHelper || 0x80;

	options.scale = options.scale || 1;
	options.scales = options.scales || options.axesHelper === undefined ? {} : options.axesHelper.options.scales;

	options.scales.x = options.scales.x || {};
	options.scales.x.min = options.scales.x.min || -1;
	options.scales.x.max = options.scales.x.max || 1;
	options.scales.x.name = options.scales.x.name || 'x';


	options.scales.y = options.scales.y || {};
	options.scales.y.min = options.scales.y.min || -1;
	options.scales.y.max = options.scales.y.max || 1;
	options.scales.y.name = options.scales.y.name || 'y';

	options.scales.z = options.scales.z || {};
	options.scales.z.min = options.scales.z.min || -1;
	options.scales.z.max = options.scales.z.max || 1;
	options.scales.z.name = options.scales.z.name || 'z';

	var mathBox = this;

	//working out what points in the 3d space the mouse is over. https://threejs.org/docs/index.html#api/en/core/Raycaster

	var raycaster = {

		positionDif: null, // THREE.Vector3 is difference between position of the raycaster.particles object and position of the axesd
		setPositionDif: function ( particles ) {

			particles = particles || this.particles;
			if ( Array.isArray( particles ) ) {

				console.error( 'THREE.MathBox.raycaster.setPositionDif: Invalid particles' )
				return;

			}
			this.positionDif = new THREE.Vector3( 0, 0, 0 );
			scaleObject.positionVector3( this.positionDif, particles.scale );//position of the axes
			this.positionDif.x = ( particles.position.x - this.positionDif.x ) / particles.scale.x;
			this.positionDif.y = ( particles.position.y - this.positionDif.y ) / particles.scale.y;
			this.positionDif.z = ( particles.position.z - this.positionDif.z ) / particles.scale.z;

		},
		particles: null,//THREE.Points object
		setParticles: function ( particles ) {

			this.particles = particles;
			this.setPositionDif();

		},
		raycaster: new THREE.Raycaster(),
		intersects: null,
		getIntersects: function () {

			this.intersects = Array.isArray( this.particles ) ?
				this.raycaster.intersectObjects( this.particles ) :
				this.raycaster.intersectObject( this.particles );

		},
		mouse: new THREE.Vector2(),

		//for Stereo effect modes
		mouseL: new THREE.Vector2(),
		mouseR: new THREE.Vector2(),

		spriteText: null,
		index: null,
		group: scene,
		removeSpriteText: function () {

			if ( this.spriteText === null )
				return;
			this.group.remove( this.spriteText );
			delete this.spriteText;
			this.spriteText = null;

		},
		remove: function () {

			delete this.pointSelected;

			if ( this.spriteText === null )
				return;
			this.removeSpriteText();
			this.particles = null;
			this.index = null;

		},
		setThreshold: function () { this.raycaster.params.Points.threshold = threshold * 3 / 5; },
		getMousePosition: function () {

			this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			this.mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

			function mousePosition( vectorName ) {

				raycaster.mouseL.copy( raycaster.mouse );
				raycaster.mouseR.copy( raycaster.mouse );
				var a = 0.5;

				raycaster.mouseL[vectorName] += a;
				raycaster.mouseL[vectorName] *= 2;

				raycaster.mouseR[vectorName] -= a;
				raycaster.mouseR[vectorName] *= 2;

			}
			switch ( parseInt( effect.options.spatialMultiplex ) ) {

				case THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono:
					return;
				case THREE.StereoEffectParameters.spatialMultiplexsIndexs.SbS:
					mousePosition( 'x' );
					break;
				case THREE.StereoEffectParameters.spatialMultiplexsIndexs.TaB:
					mousePosition( 'y' );
					break;
				default: console.error( 'THREE.MathBox.raycaster.getMousePosition: Invalid effect.options.spatialMultiplex = ' + effect.options.spatialMultiplex );
					return;

			}

		},
		onDocumentMouseMove: function ( event ) {

			//this.raycaster.stereo.onDocumentMouseMove( event );
			event.preventDefault();
			this.getMousePosition();
			//console.log( 'mouse.x = ' + this.mouse.x + ' mouse.y = ' + this.mouse.y )

		},
		intersection: function ( intersection ) {

			if ( parseInt( effect.options.spatialMultiplex ) !== THREE.StereoEffectParameters.spatialMultiplexsIndexs.Mono ) {

				this.raycaster.setFromCamera( this.mouseL, camera );
				if ( !intersection() ) {

					this.raycaster.setFromCamera( this.mouseR, camera );
					intersection();

				}

			} else {

				this.raycaster.setFromCamera( this.mouse, camera );
				intersection();

			}

		},
		onDocumentMouseDown: function ( event ) {

			if ( this.particles === null )
				return;

			this.getMousePosition();
			this.intersection( intersection );

			function intersection() {

				raycaster.getIntersects();
				if ( raycaster.intersects.length <= 0 )
					return false;

				if ( raycaster.index === null )
					return false;

				//console.log( 'raycaster.index = ' + raycaster.index );

				var object = raycaster.intersects[0].object;
				if ( raycaster.pointSelected !== undefined ) {

					//find selected line
					for ( var iz = 0; iz < raycaster.particles.length; iz++ ) {

						if ( raycaster.particles[iz].geometry.uuid === object.geometry.uuid ) {

							raycaster.pointSelected( iz, raycaster.intersects[0].index );
							break;

						}

					}

				} //else {

				//for resolving of the bug
				//Testing:
				//select Points in the Examples drop down menu of the webgl_math.html page.
				//Click mouse over any point. 
				//Now you can see number of selected point in the Select Point drop down menu.
				//Select "no select" in the Select Point drop down menu.
				//Click mouse over any point again. 
				//Now you can see a bug: You see "no select" instead of number of selected point in the Select Point drop down menu.
				//				raycaster.particles.userData.controllerSelectPoint.__li.querySelector( 'select' ).selectedIndex = raycaster.index;
				if ( object.userData.controllerSelectPoint.__li !== undefined )
					object.userData.controllerSelectPoint.__li.querySelector( 'select' ).selectedIndex = raycaster.index;

				if ( object.userData.owner !== undefined )
					object.userData.owner.userData.onDocumentMouseDown();
				object.userData.controllerSelectPoint.setValue( raycaster.index + 1 );

				//}
				raycaster.index = null;
				//			console.log( 'distance = ' + raycaster.intersects[0].distance + ' distanceToRay = ' + raycaster.intersects[0].distanceToRay
				//				+ ' index = ' + raycaster.intersects[0].index );
				return false;
			}

		},
		render: function () {

			if ( this.particles === null )
				return;
			//this.raycaster.stereo.render();
			this.intersection( intersection );
			function intersection() {

				raycaster.getIntersects();
				if ( raycaster.intersects.length <= 0 ) {

					raycaster.removeSpriteText();
					return false;

				}

				if ( raycaster.spriteText === null ) {

					//console.log( 'distance = ' + raycaster.intersects[0].distance + ' distanceToRay = ' + raycaster.intersects[0].distanceToRay
					//	+ ' index = ' + raycaster.intersects[0].index );

					var intersection = raycaster.intersects[0],
						distanceToRay = intersection.distanceToRay,
						distanceToRayMin = 0.1;
					//if ( ( raycaster.spriteText === null ) && ( distanceToRay < distanceToRayMin ) )
					{

						var array = intersection.object.geometry.attributes.position.array,
							index = intersection.index * 3,
							position = new THREE.Vector3(
								array[index + mathBox.axesEnum.x] + raycaster.positionDif.x,
								array[index + mathBox.axesEnum.y] + raycaster.positionDif.y,
								array[index + mathBox.axesEnum.z] + raycaster.positionDif.z ),
							textColor = 'rgb( ' + options.colorsHelper + ', ' + options.colorsHelper + ', ' + options.colorsHelper + ' )';
						raycaster.spriteText = new THREE.SpriteText(
									options.scales[mathBox.axesEnum.getName( mathBox.axesEnum.x )].name + ': ' + position.x +
							' ' + options.scales[mathBox.axesEnum.getName( mathBox.axesEnum.y )].name + ': ' + position.y +
							' ' + options.scales[mathBox.axesEnum.getName( mathBox.axesEnum.z )].name + ': ' + position.z, {

								textHeight: 0.06 * options.scale,
								fontColor: textColor,
								rect: {

									displayRect: true,
									borderThickness: 3,
									borderRadius: 10,
									borderColor: textColor,
									backgroundColor: 'rgba( 0, 0, 0, 1 )',

								},
								position: scaleObject.getPositionVector3( position, intersection.object.scale ),
								center: new THREE.Vector2( 0.5, 0 ),

							} );
						raycaster.group.add( raycaster.spriteText );
						raycaster.index = intersection.index;

					} //else if ( distanceToRay > distanceToRayMin ) raycaster.removeSpriteText();

				}
				return true;

			}

		},

	}
	//raycaster.raycaster.setStereoEffect( effect );
	var threshold = 0.05 * options.scale;
	raycaster.setThreshold();
	this.onDocumentMouseMove = function ( event ) { raycaster.onDocumentMouseMove( event ); }
	this.onDocumentMouseDown = function ( event ) { raycaster.onDocumentMouseDown( event ); }
	this.render = function () { raycaster.render(); }

	//

	this.axesEnum = {

		x: 0,
		y: 1,
		z: 2,
		getName: function ( axesId ) {

			if ( options.axesHelper !== undefined )
				return options.axesHelper.axesEnum.getName( axesId );
			switch ( axesId ) {

				case mathBox.axesEnum.x: return 'x';
				case mathBox.axesEnum.y: return 'y';
				case mathBox.axesEnum.z: return 'z';
				default: console.error( 'THREE.MathBox.axesEnum.getName: invalid id = ' + axesId );

			}

		}

	}

	this.removeGroup = function ( group ) {

		if ( group !== undefined ) {

			group.remove( group.children[0] );
			group.children.length = 0;
			scene.remove( group );
			//delete group;//Parsing error: Deleting local variable in strict mode

		}
		raycaster.remove();
		dotLines.remove();

	}

	function getAxesPosition( axesId ) {

		if ( options.axesHelper !== undefined )
			return options.axesHelper.getAxesPosition( axesId );
		var axes = mathBox.axesEnum.getName( axesId );
		return {

			min: {
				position: new THREE.Vector3( 0, 0, 0 ),
				scale: options.scales[axes].min,
			},
			max: {

				position: new THREE.Vector3( 0, 0, 0 ),
				scale: options.scales[axes].max,

			}

		}
	}

	//Localization
	var lang;
	if ( THREE.getLanguageCode !== undefined )
		switch ( THREE.getLanguageCode() ) {

			case 'ru'://Russian language
				lang = {

					zero: 'Ноль',
					zeroTitle: 'Переместить точку в ноль',
					zeroTitlePosition: 'Переместить позицию примера в ноль',

					selectPoint: 'Выберите точку',
					noSelect: 'не выбрана',
					point: 'Точка',

					selectLine: 'Выберите линию',

					tMinTitle: 'Минимальные значения параметра "t" формул',
					tMaxTitle: 'Максимальные значения параметра "t" формул',

					pointsCount: 'Точек',
					pointsCountTitle: 'Количество точек кривой',

					restore: 'Восстановить',
					restoreTitle: 'Восстановить формулы',
					restoreLightTitle: 'Восстановить положение источника света',

					fourmulas: 'Формулы',
					position: 'Позиция',

					light: 'Свет',
					displayLight: 'Показать',
					displayLightTitle: 'Показать или скрыть источник света.',

				}
				break;
			default://Custom language
				lang = {

					zero: 'Zero',
					zeroTitle: 'Move point to zero',
					zeroTitlePosition: "Move example's position to zero",

					selectPoint: 'Select Point',
					noSelect: 'no select',
					point: 'Point',

					selectLine: 'Select Line',

					tMinTitle: 'Minimum value of the "t" parameter of the formulas',
					tMaxTitle: 'Maximum value of the "t" parameter of the formulas',

					pointsCount: 'Points Count',
					pointsCountTitle: 'Count of curve points',

					restore: 'Restore',
					restoreTitle: 'Restore formulas',
					restoreLightTitle: 'Restore position of the light source',

					fourmulas: 'Fourmulas',
					position: 'Position',

					light: 'Light',
					displayLight: 'Display',
					displayLightTitle: 'Display or hide the light source.',

				}

		}

	var scaleObject = {

		a: function ( max, min ) { return Math.abs(( 2 * options.scale ) / ( max - min ) ); },
		axis: function ( axis ) { return this.a( axis.max, axis.min ); },
		vector3: function ( scale, scales ) {

			scales = scales || options.scales;
			scale.x = this.axis( scales.x );
			scale.y = this.axis( scales.y );
			scale.z = this.axis( scales.z );

		},
		positionAxis: function ( axis, scale ) { return -( ( axis.max + axis.min ) / 2 ) * scale; },
		positionVector3: function ( position, scale, scales ) {

			scales = scales || options.scales;
			position.x = this.positionAxis( scales.x, scale.x );
			position.y = this.positionAxis( scales.y, scale.y );
			position.z = this.positionAxis( scales.z, scale.z );

		},
		getRealPositionVector3: function ( position, scale ) {

			return new THREE.Vector3(
				-position.x / scale.x,
				-position.y / scale.y,
				-position.z / scale.z
			);

		},
		getRealPosition: function ( object3D ) {

			return this.getRealPositionVector3( object3D.position, object3D.scale );
		},
		setPositionAxis: function ( object3D, axesId, value ) {

			var axesName = mathBox.axesEnum.getName( axesId );
			object3D.position[axesName] = -value * object3D.scale[axesName];
			if ( !Array.isArray( raycaster.particles ) && ( object3D !== raycaster.particles ) )
				console.error( 'THREE.MathBox scaleObject.setPositionAxis: object3D !== raycaster.particles' );
			raycaster.setPositionDif( object3D );

		},
		setPosition: function ( object3D, position ) {

			function setPositionAxis( axesId, value ) {

				var axesName = mathBox.axesEnum.getName( axesId );
				object3D.position[axesName] += value * object3D.scale[axesName];

			};
			setPositionAxis( mathBox.axesEnum.x, position.x );
			setPositionAxis( mathBox.axesEnum.y, position.y );
			setPositionAxis( mathBox.axesEnum.z, position.z );

		},
		object3D: function ( object3D, scales ) {

			scales = scales || options.scales;
			this.vector3( object3D.scale, scales );
			this.positionVector3( object3D.position, object3D.scale, scales );

		},
		getPositionVector3: function ( position, scale ) {

			var positionZero = new THREE.Vector3( 0, 0, 0 );
			scaleObject.positionVector3( positionZero, scale, options.scales );
			positionZero = scaleObject.getRealPositionVector3( positionZero, scale );
			//				position = scaleObject.getRealPositionVector3( position, raycaster.particles.scale );
			return new THREE.Vector3(
				( position.x - positionZero.x ) * scale.x,
				( position.y - positionZero.y ) * scale.y,
				( position.z - positionZero.z ) * scale.z
			);

		},

	}

	//dotted lines
	function dotLines() {

		var lineX, lineY, lineZ;
		var groupDotLines;
		this.remove = function () {

			if ( groupDotLines === undefined )
				return;
			scene.remove( groupDotLines );
			//delete groupDotLines;//Parsing error: Deleting local variable in strict mode
			groupDotLines = undefined;
			//delete lineX;
			lineX = undefined;
			//delete lineY;
			lineY = undefined;
			//delete lineZ;
			lineZ = undefined;

		}
		function createGroup() {

			dotLines.remove();
			groupDotLines = new THREE.Group();
			scene.add( groupDotLines );

		}
		this.dottedLines = function ( pointVertice ) {


			if ( options.axesHelper === undefined )
				return;
			var axesHelper = options.axesHelper;

			createGroup();

			function dottedLine( axesId ) {

				lineVertices = [
					pointVertice,
					new THREE.Vector3( 0, 0, 0 ),
				]
				var scal = new THREE.Vector3( 0, 0, 0 );
				scaleObject.vector3( scal, axesHelper.options.scales );
				lineVertices[1].x = axesId === axesHelper.axesEnum.x ? lineVertices[0].x :
					-scaleObject.positionAxis( axesHelper.options.scales.x, scal.x ) / scal.x;
				lineVertices[1].y = axesId === axesHelper.axesEnum.y ? lineVertices[0].y :
					-scaleObject.positionAxis( axesHelper.options.scales.y, scal.y ) / scal.y;
				lineVertices[1].z = axesId === axesHelper.axesEnum.z ? lineVertices[0].z :
					-scaleObject.positionAxis( axesHelper.options.scales.z, scal.z ) / scal.z;

				var colorsHelper = options.colorsHelper;
				var line = new THREE.LineSegments( new THREE.BufferGeometry().setFromPoints( lineVertices ),
					new THREE.LineDashedMaterial( {
						color: 'rgb(' + colorsHelper + ', ' + colorsHelper + ', ' + colorsHelper + ')',
						dashSize: 0.1, gapSize: 0.1
					} ) );
				line.computeLineDistances();
				scaleObject.object3D( line, axesHelper.options.scales );
				groupDotLines.add( line );
				//						optionsGui.group.add( line );
				return line;

			}
			lineX = dottedLine( axesHelper.axesEnum.x );
			lineY = dottedLine( axesHelper.axesEnum.y );
			lineZ = dottedLine( axesHelper.axesEnum.z );

		}
		this.movePointAxes = function ( axesId, value ) {

			var line;
			switch ( axesId ) {
				case mathBox.axesEnum.x:
					line = lineX;
					break;
				case mathBox.axesEnum.y:
					line = lineY;
					break;
				case mathBox.axesEnum.z:
					line = lineZ;
					break;
				default: console.error( 'point.userData.movePointAxes: invalid axesId: ' + axesId );
					return;
			}
			if ( line === undefined )
				return;
			line.geometry.attributes.position.array[axesId + 3] = value;

			lineX.geometry.attributes.position.array[axesId] = value;
			lineY.geometry.attributes.position.array[axesId] = value;
			lineZ.geometry.attributes.position.array[axesId] = value;

			lineX.geometry.attributes.position.needsUpdate = true;
			lineY.geometry.attributes.position.needsUpdate = true;
			lineZ.geometry.attributes.position.needsUpdate = true;

		}

	}
	dotLines = new dotLines();

	function getPoints( pointVerticesSrc ) {

		return new THREE.Points( Array.isArray( pointVerticesSrc ) ?
			new THREE.BufferGeometry().setFromPoints( pointVerticesSrc ) : pointVerticesSrc,
		new THREE.PointsMaterial( {

			color: options.color, //map: texture,
			size: threshold, alphaTest: 0.5

		} ) );

	}

	//displaying points
	//optionsPoints
	//{
	//	vertices: array of THREE.Vector3 positions of the points for displaying. Defauit is [ new THREE.Vector3( 0, 0, 0 ) ]
	//	functions: formulas for calculating of points positions. Use instead optionsPoints.vertices
	//	{
	//		x: formula for calculating of the x coordinate of the points positions. Default formula is '((t+10)/10-1)*a+b'
	//		y: formula for calculating of the y coordinate of the points positions. Default formula is '((t+10)/10-1)*a+b'
	//		z: formula for calculating of the z coordinate of the points positions. Default formula is '((t+10)/10-1)*a+b'
	//	}
	//	params: parameters for calculating of points positions
	//	{
	//		pointsCount: count of the curve points. Default is 50
	//		t: Minimum and maximum values of the t parameter of the formulas
	//		{
	//			min: Default is -10
	//			max: Default is 10
	//		}
	//		For example if t.min = -1, t.max = 1 and pointsCount = 3. Then
	//		point	t
	//		0		-1
	//		1		0
	//		2		1
	//
	//		a: first parameter, you can use in your formula. For example 't*a+1'. Default is 1
	//		b: second parameter, you can use in your formula. For example 't+b'. Default is 0
	//
	//		onChangePoint
	//		{
	//			onChangeX: callback function is called if user has changed the x position of the point. Default is undefined.
	//			onChangeY: callback function is called if user has changed the y position of the point. Default is undefined.
	//			onChangeZ: callback function is called if user has changed the z position of the point. Default is undefined.
	//		}
	//
	//	}
	//	position: A THREE.Vector3 representing the points local position. Default is (0, 0, 0).
	//	groupParent: THREE.Group parent group for adding of the group of the points. Default is scene
	//	folder: gui folder or scene. Default is undefined - no user gui
	//}
	this.addPoints = function ( optionsPoints ) {

		optionsPoints = optionsPoints || {};

		var pointVerticesSrc = optionsPoints.vertices || [];
		if( Array.isArray( pointVerticesSrc ) ){

			while ( pointVerticesSrc.length < 1 )
				pointVerticesSrc.push( new THREE.Vector3( pointVerticesSrc.length, pointVerticesSrc.length, pointVerticesSrc.length ) );

		}

		if ( optionsPoints.functions !== undefined ) {
			var functions = optionsPoints.functions || {},
				f = '((t+10)/10-1)*a+b';
			functions.x = functions.x || f;
			functions.y = functions.y || f;
			functions.z = functions.z || f;

			var params = optionsPoints.params || {};
			params.a = params.a || 1;
			params.b = params.b || 0;
			params.t = params.t || {};
			params.t.min = params.t.min || -10;
			params.t.max = params.t.max || 10;
			params.pointsCount = params.pointsCount || 50;
			var paramsRestore = Object.assign( {}, params );
			paramsRestore.t = Object.assign( {}, params.t );

			groupParent = optionsPoints.groupParent || scene;

			var functionsDefault = Object.assign( {}, functions );
			funcs = {}
			function setFuncs() {

				funcs.x = new Function( 't', 'a', 'b', 'return ' + functions.x ),
				funcs.y = new Function( 't', 'a', 'b', 'return ' + functions.y ),
				funcs.z = new Function( 't', 'a', 'b', 'return ' + functions.z );

			}
			function pushLineVertices() {

				pointVerticesSrc.length = 0;
				for ( var i = 0; i < params.pointsCount; i += 1 ) {

					var t = params.t.min + i * ( params.t.max - params.t.min ) / params.pointsCount;
					pointVerticesSrc.push( new THREE.Vector3(
						funcs.x( t, params.a, params.b ),
						funcs.y( t, params.a, params.b ),
						funcs.z( t, params.a, params.b )
					) );

				}

			}

			setFuncs();
			pushLineVertices();

		}

		var group = new THREE.Group();
		groupParent = optionsPoints.groupParent || scene;
		groupParent.add( group );


		function drawPoints() {

			var scales = axesHelper === undefined ? options.scales : axesHelper.options.scales,
				points = getPoints( pointVerticesSrc );
			scaleObject.object3D( points, scales );
			group.add( points );
			return points;

		}
		var axesHelper = options.axesHelper,
			colorsHelper = options.colorsHelper,
			point = drawPoints();
		if ( optionsPoints.position !== undefined )
			scaleObject.setPosition( point, optionsPoints.position );
		raycaster.setParticles( point );
		point.userData.group = group;

		//Points Settings

		//Point's gui
		//pointVerticesSrc: array of THREE.Vector3 Point's positions
		//folder: gui folder or scene
		//optionsGui: default is undefined.
		//{
		//	onChangeX: callback function is called if user has changed the x position of the point. Default is undefined.
		//	onChangeY: callback function is called if user has changed the y position of the point. Default is undefined.
		//	onChangeZ: callback function is called if user has changed the z position of the point. Default is undefined.
		//	zeroTitle: Title of Zero buttin. Default is undefined.
		//	group: THREE.Group group of the points. Default is undefined
		//	points: THREE.Points. Default is undefined
		//}
		function guiPoint( pointVerticesSrc, folder, optionsGui ) {

			if ( dat.controllerNameAndTitle === undefined ) {

				console.error( 'THREE.MathBox.guiPoint: dat.controllerNameAndTitle is undefined. Plese include StereoEffect.js into your project.' );
				return;

			}

			var axesHelper = options.axesHelper;

			optionsGui = optionsGui || {};
			var points = optionsGui.points || point;

			function emptySelectController( select )
			{

				select.setValue( 0 );
				for ( var member in select.object ) delete select.object[member];
				var selectbox = select.__li.querySelector( 'select' );
				for ( i = selectbox.options.length - 1 ; i >= 0 ; i-- ) { selectbox.remove( i ); }
				return selectbox;

			}

			function appendSelectPoint( selectbox, length ) {

				for ( var i = 0; i <= length; i++ ) {

					var opt = document.createElement( 'option' );
					opt.value = i;
					opt.innerHTML = i === 0 ? lang.noSelect : i;
					selectbox.appendChild( opt );

				};

			}

			//formulas
			if ( optionsGui.functions !== undefined ) {

				var points = optionsGui.points,
					functions = optionsGui.functions,
					params = optionsGui.params;
				function onChangeFunction() {

					try {
						setFuncs();
						var array = points.geometry.attributes.position.array,
							j = 0;
						for ( var i = 0; i < params.pointsCount * 2; i++ ) {

							var t = params.t.min + i * ( ( params.t.max - params.t.min ) / 2 ) / params.pointsCount;
							array[j] = funcs.x( t, params.a * options.scale, params.b * options.scale );
							j++;
							array[j] = funcs.y( t, params.a * options.scale, params.b * options.scale );
							j++;
							array[j] = funcs.z( t, params.a * options.scale, params.b * options.scale );
							j++;

						}
						points.geometry.attributes.position.needsUpdate = true;
						selectPoint.setValue( selectPoint.getValue() );
					} catch ( e ) {

						console.error( e.message );

					}
				}

				if ( folder !== undefined ) {

					var f = '=f(t)=',
						fFourmulas = folder.addFolder( lang.fourmulas );
					fFourmulas.open();

					//x
					var controllerFX = fFourmulas.add( functions, 'x' ).
						onChange( function ( value ) { functions.x = value; onChangeFunction() } );
					dat.controllerNameAndTitle( controllerFX, options.scales.x.name + f );

					//y
					var controllerFY = fFourmulas.add( functions, 'y' ).
						onChange( function ( value ) { functions.y = value; onChangeFunction() } );
					dat.controllerNameAndTitle( controllerFY, options.scales.y.name + f );

					//z
					var controllerFZ = fFourmulas.add( functions, 'z' ).
						onChange( function ( value ) { functions.z = value; onChangeFunction() } );
					dat.controllerNameAndTitle( controllerFZ, options.scales.z.name + f );

					//a
					var controllerA = fFourmulas.add( params, 'a', 0.1, 3 ).
							onChange( function ( value ) { params.a = value; onChangeFunction() } ),
					//b
						controllerB = fFourmulas.add( params, 'b', -3, 3 ).
							onChange( function ( value ) { params.b = value; onChangeFunction() } ),
						mid = ( params.t.max + params.t.min ) / 2,
					//t min
						controllerTMin = fFourmulas.add( params.t, 'min', 2 * params.t.min - params.t.max, mid ).
							onChange( function ( value ) { params.t.min = value; onChangeFunction() } );
					dat.controllerNameAndTitle( controllerTMin, 't min', lang.tMinTitle );
					//t max
					var controllerTMax = fFourmulas.add( params.t, 'max', mid, 2 * params.t.max - params.t.min ).
						onChange( function ( value ) { params.t.max = value; onChangeFunction() } );
					dat.controllerNameAndTitle( controllerTMax, 't max', lang.tMaxTitle );
					//Points Count
					var controllerPC = fFourmulas.add( params, 'pointsCount', 0, params.pointsCount * 2, 1 ).
						onChange( function ( value ) {

							params.pointsCount = value;
							points.parent.remove( points );
							var isOwner = false;
							if ( points.userData.owner !== undefined ) {

								points.userData.owner.parent.remove( points.userData.owner );
								delete points.userData.owner;
								isOwner = true;

							}
							pushLineVertices();
							points = drawPoints();
							points.userData.controllerSelectPoint = selectPoint;
							raycaster.setParticles( points );
							if ( isOwner )
								points.userData.owner = drawLine( groupParent, { points: points } );
							appendSelectPoint( emptySelectController( selectPoint ), pointVerticesSrc.length );

						} );
					dat.controllerNameAndTitle( controllerPC, lang.pointsCount, lang.pointsCountTitle );

					//restore
					var restore = {

						restore: function () {

							functions = Object.assign( {}, functionsDefault );
							controllerFX.setValue( functions.x );
							controllerFY.setValue( functions.y );
							controllerFZ.setValue( functions.z );
							controllerA.setValue( paramsRestore.a );
							controllerB.setValue( paramsRestore.b );
							controllerTMin.setValue( paramsRestore.t.min );
							controllerTMax.setValue( paramsRestore.t.max );
							controllerPC.setValue( paramsRestore.pointsCount );

						}

					}
					dat.controllerNameAndTitle( fFourmulas.add( restore, 'restore' ), lang.restore, lang.restoreTitle );

				}

			}

			//select point

			//points indexes

			var pointsIndexes = {},
				pointId;
			pointsIndexes[lang.noSelect] = 0;

			var length = Array.isArray( pointVerticesSrc ) ? pointVerticesSrc.length :
				pointVerticesSrc.constructor.name === "Vector3" ? 1 : pointVerticesSrc.attributes.position.array.length / 3;
			for ( var i = 0; i < length; i++ ) {

				pointsIndexes[i + 1] = i + 1;

			};

			function movePointAxes( axesId, value, index ) {

				points.geometry.attributes.position.array[axesId + ( index === undefined ? pointId : index ) * 3] = value - raycaster.positionDif[mathBox.axesEnum.getName( axesId )];
				points.geometry.attributes.position.needsUpdate = true;
				dotLines.movePointAxes( axesId, value );
			}

			if ( folder === undefined ) {

				if ( points !== undefined ) {

					points.userData.controllerSelectPoint = {

						setValue: function ( index ) {

							dat.getControllerByName( points.userData.owner.userData.onChangeSelectedPoint(), lang.selectPoint ).setValue( index );

						}

					};
					points.userData.movePointAxes = movePointAxes;

				}
				return;

			}

			function onChangeSelectedPoint( pointIdC, points ) {

				if ( pointIdC === undefined ) {

					//for testing
					//	Select Сurve in the Example drop down menu in the webgl_math.html page.
					//	Change Points Count.
					//	Change "a"
					selectPoint.setValue( 0 );
					return;

				}

				pointId = parseInt( pointIdC ) - 1;
				if ( fPoint !== undefined ) {

					fPoint.domElement.style.display = pointId === -1 ? 'none' : 'block';

					//remove previous point gui
					if ( fPoint.__controllers.length > 0 ) {

						for ( var i = fPoint.__controllers.length - 1; i >= 0; i-- ) {

							fPoint.remove( fPoint.__controllers[i] );

						}

					}

				}

				//remove previous dotted lines
				dotLines.remove();
				if ( pointId < 0 )
					return;//point is not selected

				var array = points.geometry.getAttribute( 'position' ).array,
					index = pointId * 3,
					pointVertice = new THREE.Vector3(
						array[index + 0] + raycaster.positionDif.x,
						array[index + 1] + raycaster.positionDif.y,
						array[index + 2] + raycaster.positionDif.z
					);//pointVerticesSrc[pointId];
				dotLines.dottedLines( pointVertice );

				if ( folder === undefined )
					return;

				function axesGui( axesId, onChange ) {

					function setScale( scale ) {

						axesPosition.min.scale = scale.min;
						axesPosition.max.scale = scale.max;

					}
					var axesPosition = getAxesPosition( axesId ),
						axesName = mathBox.axesEnum.getName( axesId ),
						object = {

							scale: pointVertice[axesName],

						},
						controller = fPoint.add( object, 'scale',
							object.scale < axesPosition.min.scale ? object.scale : axesPosition.min.scale,
							object.scale > axesPosition.max.scale ? object.scale : axesPosition.max.scale,
							( axesPosition.max.scale - axesPosition.min.scale ) / 100 ).
							onChange( function ( value ) {

								movePointAxes( axesId, value );
								if ( onChange !== undefined )
									onChange( value );

							} );
					dat.controllerNameAndTitle( controller, options.scales[axesName].name );
					controller.setScale = function ( scale ) {

						var value = this.getValue();
						this.min( scale.min );
						this.max( scale.max );
						this.step(( scale.max - scale.min ) / 100 );
						this.setValue( value );
						setScale( scale );

					}
					return controller

				}
				controllerX = axesGui( mathBox.axesEnum.x, optionsGui.onChangeX );
				controllerY = axesGui( mathBox.axesEnum.y, optionsGui.onChangeY );
				controllerZ = axesGui( mathBox.axesEnum.z, optionsGui.onChangeZ );
				points.userData.controllers = {

					x: controllerX,
					y: controllerY,
					z: controllerZ,
					pointId: pointId,

				};

				//button of moving point to zero 

				var zeroParams = {

					zero: function ( value ) {

						function zeroAxes( axesId, controller ) {

							if ( controller === undefined )
								return;
							var axesPosition = getAxesPosition( axesId );
							controller.setValue(( axesPosition.max.scale + axesPosition.min.scale ) / 2 );

						}
						zeroAxes( mathBox.axesEnum.x, controllerX );
						zeroAxes( mathBox.axesEnum.y, controllerY );
						zeroAxes( mathBox.axesEnum.z, controllerZ );

					},

				}
				dat.controllerNameAndTitle( fPoint.add( zeroParams, 'zero' ), lang.zero,
					optionsGui.zeroTitle === undefined ? lang.zeroTitle : optionsGui.zeroTitle );

				//			} else console.error( 'guiPoint: all optionsGui.onChangeX, optionsGui.onChangeY, optionsGui.onChangeZ methods is undefined' );

			}

			var object = { point: 0 }//lang.noSelect }
			var selectPoint = dat.getControllerByName( folder, lang.selectPoint );
			if ( selectPoint === undefined ) {

				selectPoint = folder.add( object, 'point', pointsIndexes ).onChange( function ( value ) { onChangeSelectedPoint( value, points ) } );
				dat.controllerNameAndTitle( selectPoint, lang.selectPoint );

			} else {

				appendSelectPoint( emptySelectController( selectPoint ), length );
				selectPoint.__onChange = function ( value ) { onChangeSelectedPoint( value, points ); }
				selectPoint.domElement.parentElement.parentElement.style.display = 'block';

			}
			if ( points !== undefined )
				points.userData.controllerSelectPoint = selectPoint;
			var fPoint = folder.__folders[lang.point];
			if ( fPoint === undefined ) {

				fPoint = folder.addFolder( lang.point );
				fPoint.domElement.style.display = 'none';
				fPoint.open();

			}

			var controllerX,
				controllerY,
				controllerZ;

			//Points position

			var fPosition = folder.__folders[lang.position];
			if ( fPosition === undefined )
				fPosition = folder.addFolder( lang.position );
			else fPosition.domElement.style.display = 'block';

			var realPosition = scaleObject.getRealPosition( points );//group.userData.object3D );
			//			changePosition = false;
			function controllerPosition( axesId ) {

				var axesPosition = getAxesPosition( axesId ),
					axesName = mathBox.axesEnum.getName( axesId ),
					object = { position: realPosition[axesName], },
					controller = dat.getControllerByName( fPosition, options.scales[axesName].name );
				function onChangePosition( value ) {

					scaleObject.setPositionAxis( points, axesId, value );
					if ( points.userData.owner !== undefined )
						points.userData.owner.userData.setPosition( points.position );

					if ( points.userData.controllers !== undefined ) {

						var controller = points.userData.controllers[axesName];
						var positionDif = raycaster.positionDif;
						var array = points.geometry.getAttribute( 'position' ).array,
							index = points.userData.controllers.pointId * 3,
							pointVertice = new THREE.Vector3(
								array[index + 0] + positionDif.x,
								array[index + 1] + positionDif.y,
								array[index + 2] + positionDif.z
							);

						var val = pointVertice[axesName];
						if ( controller.__min > val )
							controller.min( val );
						if ( controller.__max < val )
							controller.max( val );
						controller.setValue( val );

					}

				}
				if ( controller === undefined )
					controller = fPosition.add( object, 'position',
						object.scale < axesPosition.min.scale ? object.scale : axesPosition.min.scale,
						object.scale > axesPosition.max.scale ? object.scale : axesPosition.max.scale,
						( axesPosition.max.scale - axesPosition.min.scale ) / 100 ).
						onChange( onChangePosition );
				else controller.__onChange = onChangePosition;
				dat.controllerNameAndTitle( controller, options.scales[axesName].name );

			}
			controllerPosition( mathBox.axesEnum.x );
			controllerPosition( mathBox.axesEnum.y );
			controllerPosition( mathBox.axesEnum.z );

		}

		point.userData.guiPoint = guiPoint;

		guiPoint( pointVerticesSrc, optionsPoints.folder, {

			group: group,
			points: point,
			functions: optionsPoints.functions,
			params: optionsPoints.params,

			onChangeX: optionsPoints.onChangePoint === undefined ? undefined : optionsPoints.onChangePoint.onChangeX,
			onChangeY: optionsPoints.onChangePoint === undefined ? undefined : optionsPoints.onChangePoint.onChangeY,
			onChangeZ: optionsPoints.onChangePoint === undefined ? undefined : optionsPoints.onChangePoint.onChangeZ,

		} );
		return point;

	}

	function drawLine( group, optionsDrawLine ) {

		optionsDrawLine = optionsDrawLine || {};
		optionsDrawLine.color = optionsDrawLine.color || options.color;
		var lineVertices = optionsDrawLine.lineVertices || [];
		var optionsMaterial = Object.assign( {}, optionsDrawLine );
		delete optionsMaterial.folder;
		delete optionsMaterial.vertices;
		delete optionsMaterial.groupParent;
		delete optionsMaterial.points;
		delete optionsMaterial.position;
		delete optionsMaterial.lineVertices;
		var owner = optionsMaterial.owner;
		delete optionsMaterial.owner;
		var line = new THREE.Line(
			( lineVertices.length === 0 ) && ( optionsDrawLine.points !== undefined ) ?
				optionsDrawLine.points.geometry
				: new THREE.BufferGeometry().setFromPoints( lineVertices ),
			new THREE.LineBasicMaterial( optionsMaterial ) );
		group.userData.object3D = line;
		scaleObject.object3D( line, options.scales );

		group.add( line );

		line.userData.setPosition = function ( position ) {

			line.position.copy( position );
			owner.setPosition( position, line );

		}
		line.userData.onChangeSelectedPoint = function () { return owner.onLineSelected( line.uuid ); }
		line.userData.onDocumentMouseDown = function () { owner.onLineSelected( line.uuid ); }

		return line;

	}

	//displaying line
	//optionsLine
	//{
	//	points: THREE.Points Points of the vertices of the line 
	//	vertices: array of THREE.Vector3 vertices of the line for displaying.
	//		Defauit is [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 1, 1 ) ] or optionsLine.points.geomerty
	//	position: A THREE.Vector3 representing the points local position. Default is (0, 0, 0) or optionsLine.points.position.
	//	groupParent: THREE.Group parent group for adding of the group of the line. Default is scene or optionsLine.points.parent
	//	folder: for future using. gui folder or scene. Default is undefined - no user gui
	//	color: line color. Default is options.color
	//}
	this.line = function ( optionsLine ) {

		optionsLine = optionsLine || {};

		if ( optionsLine.points === undefined )
			raycaster.particles = null;
		var lineVerticesSrc = optionsLine.vertices || [];
		if ( ( lineVerticesSrc.length === 0 ) && ( optionsLine.points !== undefined ) ){}
		else while ( lineVerticesSrc.length < 2 )
			lineVerticesSrc.push( new THREE.Vector3( lineVerticesSrc.length, lineVerticesSrc.length, lineVerticesSrc.length ) );

		var group;
		if ( optionsLine.points == undefined ) {

			group = new THREE.Group();
			groupParent = optionsLine.groupParent || scene;
			groupParent.add( group );

		} else group = optionsLine.points.parent;
		optionsLine.lineVertices = lineVerticesSrc;
		var line = drawLine( group, optionsLine );
		if ( optionsLine.position !== undefined )
			scaleObject.setPosition( line, optionsLine.position );
		else if ( optionsLine.points !== undefined ) {

			line.position.copy( optionsLine.points.position );
			optionsLine.points.userData.owner = line;

		}
		if ( optionsLine.folder === undefined )
			return line;

		//Line Settings

		return line;

	}

	//displaying surface
	//optionsSurface
	//{
	//	vertices: Vertices of the surface. It is two dimensional array of THREE.Vector3.
	//		First dimention is array of THREE.Vector3 vertices of lines
	//		Second dimention is array of THREE.Vector3 vertices of each line
	//		For example surface have three lines. Each line have four vertices
	//			vertices: [

	//				[
	//					new THREE.Vector3( -10, -3, -102 ),
	//					new THREE.Vector3( -5, 0, -102 ),
	//					new THREE.Vector3( 5, 1, -102 ),
	//					new THREE.Vector3( 10, -2, -102 )
	//				],
	//				[
	//					new THREE.Vector3( -10, 1, -104 ),
	//					new THREE.Vector3( -5, 0, -104 ),
	//					new THREE.Vector3( 5, -1, -104 ),
	//					new THREE.Vector3( 10, -2, -104 )
	//				],
	//				[
	//					new THREE.Vector3( -10, -2, -108 ),
	//					new THREE.Vector3( -5, -1, -108 ),
	//					new THREE.Vector3( 5, 0, -108 ),
	//					new THREE.Vector3( 10, 1, -108 )
	//				],

	//			],
	//		Default points is [
	//				[Vector3 {x: 0, y: 0, z: 0}, Vector3 {x: 0, y: 0, z: 0}],
	//				[Vector3 {x: 0, y: 0, z: 0}, Vector3 {x: 0, y: 0, z: 0}],
	//			]
	//	position: A THREE.Vector3 representing the surface local position. Default is (0, 0, 0) or optionsSurface.points.position.
	//	groupParent: THREE.Group parent group for adding of the group of the surface. Default is scene or optionsSurface.points.parent
	//	folder: for future using. gui folder or scene. Default is undefined - no user gui
	//	color: surface color. Default is options.color
	//	light: THREE.PointLight object. Default is undefined - no light
	//}
	this.surface = function ( optionsSurface ) {

		optionsSurface = optionsSurface || {};

		mathBox.pointLight().add();

		var group = new THREE.Group();
		groupParent = optionsSurface.groupParent || scene;
		groupParent.add( group );

		var particles = [],
			lines = [],
			linesIndexes = {},
			mesh;
		linesIndexes[lang.noSelect] = -1;

		function getBlodLine() {

			var blodLine = group.getObjectByName( lineName );
			if ( blodLine === undefined )
				return;
			return blodLine.getObjectByProperty( 'type', "Line2" );

		}

		function moveSurfaceLine( linePositionIndex, lineLength ) {

			var line = lines[selectedLineIndex.line],
				linePositionArray = line.geometry.attributes.position.array;
				meshPositionIndex = linePositionIndex,
				positionDiff = new THREE.Vector3();

			positionDiff.x = ( line.position.x - mesh.position.x ) / mesh.scale.x;
			positionDiff.y = ( line.position.y - mesh.position.y ) / mesh.scale.y;
			positionDiff.z = ( line.position.z - mesh.position.z ) / mesh.scale.z;

			for ( var i = 0; i < selectedLineIndex.line; i++ )
				meshPositionIndex += optionsSurface.vertices[i].length * 3;
			var meshPositionArray = mesh.geometry.attributes.position.array;

			while ( linePositionIndex < linePositionArray.length ) {

				meshPositionArray[meshPositionIndex] = linePositionArray[linePositionIndex] + positionDiff.x;
				meshPositionIndex++;
				linePositionIndex++;
				meshPositionArray[meshPositionIndex] = linePositionArray[linePositionIndex] + positionDiff.y;
				meshPositionIndex++;
				linePositionIndex++;
				meshPositionArray[meshPositionIndex] = linePositionArray[linePositionIndex] + positionDiff.z;
				meshPositionIndex++;
				linePositionIndex++;

			}

			mesh.geometry.attributes.position.needsUpdate = true;

		}

		function redrawLine() {

			//redrawBoldLine
			var blodLine = getBlodLine(),
				line = lines[ selectedLineIndex.line ],
				linePositionArray = line.geometry.attributes.position.array;
			if ( blodLine !== undefined )
				blodLine.geometry.setPositions( linePositionArray );

			moveSurfaceLine(( parseInt( dat.getControllerByProperty( folder, "point" ).getValue() ) - 1 ) * 3, 1 );

		}

		var onChangePoint = {

			onChangeX: function ( value ) { redrawLine(); },
			onChangeY: function ( value ) { redrawLine(); },
			onChangeZ: function ( value ) { redrawLine(); },

		}

		//lines
		if ( optionsSurface.vertices === undefined ) {

//			var xmid = options.scales.x.min + ( options.scales.x.max - options.scales.x.min ) / 2;
			var ymid = options.scales.y.min + ( options.scales.y.max - options.scales.y.min ) / 2;
//			var zmid = options.scales.z.min + ( options.scales.z.max - options.scales.z.min ) / 2;
			optionsSurface.vertices = [
				[
					new THREE.Vector3( options.scales.x.min, ymid, options.scales.z.min ),
//					new THREE.Vector3( xmid, ymid + 1, options.scales.z.min ),
					new THREE.Vector3( options.scales.x.max, ymid, options.scales.z.min ),
				],
				[
					new THREE.Vector3( options.scales.x.min, ymid, options.scales.z.max ),
//					new THREE.Vector3( xmid, ymid, options.scales.z.max ),
					new THREE.Vector3( options.scales.x.max, ymid, options.scales.z.max ),
				],
			]

		}
		for ( var i = 0; i < optionsSurface.vertices.length; i++ ) {

			var lineVertices = optionsSurface.vertices[ i ];
			lines.push ( mathBox.line( {

				points: mathBox.addPoints( {

					vertices: lineVertices,
					groupParent: group,
					onChangePoint: onChangePoint,

				} ),
				owner: {
					
					setPosition: function ( position, line ) {

						var blodLine = getBlodLine();
						if ( blodLine !== undefined )
							blodLine.position.copy( position );

						moveSurfaceLine( 0, line.geometry.attributes.position.array.length );

					},
					onLineSelected: function ( uuid ) {

						for ( var i = 0; i < lines.length; i++ ) {

							line = lines[i];
							if ( line.uuid === uuid ) {

								selectLine.setValue( i );

								//for resolving of the bug
								//Testing:
								//select Surface in the Examples drop down menu of the webgl_math.html page.
								//Click mouse over any point. 
								//Now you can see number of selected line in the Select Line drop down menu
								//	and number of selected point in the Select Point drop down menu.
								//Select "no select" in the Select Line drop down menu.
								//Click mouse over any point again. 
								//Now you can see a bug: You see "no select" instead of number of selected line in the Select Line drop down menu.
								selectLine.__li.querySelector( 'select' ).selectedIndex = i;

								return folder;

							}

						}

					},

				},

			} ) );
			particles.push( raycaster.particles );
			linesIndexes[ i + 1 ] = i;

		}
		raycaster.particles = particles;

		//surface

		function surfaceMesh() {

			var group = new THREE.Group();
			groupParent = optionsSurface.groupParent || scene;
			groupParent.add( group );

			var geometry = new THREE.BufferGeometry();

			var indices = [];

			var vertices = [];

			// build surface

			// indices

			var iPoint1 = 0;
			for ( var iLine = 0; iLine < optionsSurface.vertices.length - 1; iLine++ ) {

				//console.log( 'iLine = ' + iLine );
				var line1 = optionsSurface.vertices[iLine],
					line2 = optionsSurface.vertices[iLine + 1],
					line1Length = line1.length,
					line2Length = line2.length,
					iPoint2 = iPoint1 + line1Length,
					indiceNextLine;
				for ( var iVertice = 0; iVertice < ( line1Length < line2Length ? line2Length : line1Length ) - 1 ; iVertice++ ) {

					var shortLine1 = iVertice >= line1Length - 1,
						indice1 = iPoint1 + ( shortLine1 ? line1Length - 1 : iVertice ),
						shortLine2 = iVertice >= line2Length - 1,
						indice2 = iPoint2 + ( shortLine2 ? line2Length - 2 : iVertice );
					if ( iVertice === 0 )
						indiceNextLine = indice2;
					//console.log( 'indice1 = ' + indice1 + ' indice2 = ' + indice2 );

					var a = indice1;
					var b = indice2;
					var c = indice2 + 1;
					var d = indice1 + 1;

					// faces

					if ( !shortLine2 ) {

						//console.log( 'a = ' + a + ' c = ' + c + ' b = ' + b );
						indices.push( a, c, b );

					}
					if ( !shortLine1 ) {

						//console.log( 'a = ' + a + ' c = ' + c + ' d = ' + d );
						indices.push( a, c, d );

					}

				}
				iPoint1 += indiceNextLine;

			}

			//

			geometry.setIndex( indices );

			optionsSurface.vertices.forEach( function ( line ) {

				line.forEach( function ( point ) {

					vertices.push( point.x, point.y, point.z );

				} );

			} );

			geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
			mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {

				color: 0x156289,
				transparent: true,
				opacity: 0.8,
				emissive: 0x072534,
				side: THREE.DoubleSide,
				flatShading: true

			} ) );
			scaleObject.object3D( mesh );
			group.add( mesh );

			// light

			mathBox.pointLight().controls( group, optionsSurface.folder );

		}
		surfaceMesh();

		if ( optionsSurface.folder === undefined )
			return;

		//Surface Settings

		var folder = optionsSurface.folder,
			selectedLineIndex = { line: -1 },//lang.noSelect }
			lineName = 'lineX',
			selectLine = folder.add( selectedLineIndex, 'line', linesIndexes ).onChange( function ( value ) {

				var fPosition = folder.__folders[lang.position];
				value = parseInt( value );
				if ( value === -1 ) {

					//no select

					//remove bold line
					group.remove( group.getObjectByName( lineName ) );

					//hide Select Point controller
					folder.__controllers.forEach( function ( controller ) {

						if ( controller.property === "point" ) {

							controller.domElement.parentElement.parentElement.style.display = 'none';
							return;

						}

					} );

					//hide Position folder
					fPosition.domElement.style.display = 'none';

					//remove previous dotted lines
					dotLines.remove();

					//hide Point folder
					folder.__folders[lang.point].domElement.style.display = 'none';

					return;

				}

				var vertices = optionsSurface.vertices[value];

				//select point gui
				var points = group.children[value].getObjectByProperty( 'type', "Points" );
				points.userData.guiPoint( vertices, folder, {

					onChangeX: onChangePoint.onChangeX,
					onChangeY: onChangePoint.onChangeY,
					onChangeZ: onChangePoint.onChangeZ,

				} );//, { points: points } );

				//position gui
				if ( fPosition !== undefined ) {

					var position = scaleObject.getRealPosition( points );
					fPosition.__controllers[0].setValue( position.x );
					fPosition.__controllers[1].setValue( position.y );
					fPosition.__controllers[2].setValue( position.z );

				}

				//bold line See https://github.com/mrdoob/three.js/blob/master/examples/webgl_lines_fat.html for details
				function boldLine( vertices, optionsBoldLine ) {

					optionsBoldLine = optionsBoldLine || {}
					var color = optionsBoldLine.color || new THREE.Color( 1, 0, 0 ),//red
						group = new THREE.Group(),//optionsBoldLine.group || scene;
						lineName = optionsBoldLine.lineName || '',
						groupParent = optionsBoldLine.groupParent || scene;

					group.name = lineName;
					groupParent.remove( groupParent.getObjectByName( lineName ) );
					groupParent.add( group );

					var colors = [];
					for ( var i = 0; i < vertices.length; i++ ) {

						colors.push( color.r, color.g, color.b );

					}

					THREE.loadScript( [
							"../examples/js/lines/LineSegmentsGeometry.js",
							"../examples/js/lines/LineGeometry.js",
							"../examples/js/lines/LineMaterial.js",
							"../examples/js/lines/LineSegments2.js",
							"../examples/js/lines/Line2.js",
					] ).async( {

						onload: function () {

							var geometry = new THREE.LineGeometry();
							geometry.setPositions( lines[value].geometry.attributes.position.array );
							geometry.setColors( colors );

							if ( THREE.LineMaterial !== undefined ) {
								var matLine = new THREE.LineMaterial( {

									color: 0xffffff,
									linewidth: 0.005, // in pixels
									vertexColors: THREE.VertexColors,
									//resolution:  // to be set by renderer, eventually
									dashed: false

								} );
								var line = new THREE.Line2( geometry, matLine );
								//					line.name = lineName;
								line.computeLineDistances();
								line.scale.set( 1, 1, 1 );
								scaleObject.object3D( line, options.scales );
								group.add( line );
								line.position.copy( lines[value].position );

							} else {

								//issue of Internet Explorer - load of the LineMaterial.js file is impossible.
								//Instead I see "Invalid character" error message in the LineMaterial.js (34,3) line.

								function arrayToPositions( array ) {

									var positions = [];
									for ( var i = 0; i < array.length; i += 3 )
										positions.push( new THREE.Vector3( array[0 + i], array[1 + i], array[2 + i] ) );
									return positions;

								}

								mathBox.line( {

									vertices: arrayToPositions( positions ),
									groupParent: group,
									color: 0xFF00FF,

								} );//.name = lineName;

							}

						}

					} );
				}
				boldLine( vertices, {

					color: new THREE.Color( 1, 0, 1 ),
					groupParent: group,
					lineName: lineName,

				} );//, colors, group, 'lineX' );

			} );
		dat.controllerNameAndTitle( selectLine, lang.selectLine );

	}
	var Matrix3D = function ( limits, points, group, optionsMatrix3D ) {

		limits = limits || {};
		limits.x = limits.x || {};
		limits.x.min = limits.x.min || options.scales.x.min;
		limits.x.max = limits.x.max || options.scales.x.max;

		limits.z = limits.z || {};
		limits.z.min = limits.z.min || options.scales.z.min;
		limits.z.max = limits.z.max || options.scales.z.max;

		optionsMatrix3D = optionsMatrix3D || {};

		points = points || [];
		while ( points.length < 2 ) {

			var lenghtMin = 3;
			var length = points.length === 0 ? lenghtMin : points[0].length,
				row = [];
			while ( length < lenghtMin ) {

				points[0].push( 0 );
				length = points[0].length
			}
			for ( var i = 0; i < length; i++ )
				row.push( 0 );
			points.push( row );

		}

		THREE.loadScript( [
				"../examples/js/lines/LineSegmentsGeometry.js",
				"../examples/js/lines/LineGeometry.js",
				"../examples/js/lines/LineMaterial.js",
				"../examples/js/lines/LineSegments2.js",
				"../examples/js/lines/Line2.js",
		] ).async( {

			onload: function () { console.log( 'onload' ); }

		});

		//groupExample.userData.object3D = group;

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [], 3 ) );

		var lineMaterial = new THREE.LineBasicMaterial( {

			color: 0xffffff,
			transparent: true,
			opacity: 0

		} );
		var meshMaterial = new THREE.MeshPhongMaterial( {

			color: 0x156289,
			transparent: true,
			opacity: 0.8,
			emissive: 0x072534,
			side: THREE.DoubleSide,
			flatShading: true

		} );

		var lineSegments = new THREE.LineSegments( geometry, lineMaterial );
		scaleObject.object3D( lineSegments );
		var mesh = new THREE.Mesh( geometry, meshMaterial );
		scaleObject.object3D( mesh );

		group.add( lineSegments );
		group.add( mesh );

		THREE.BufferGeometry.call( this );

		this.type = 'Matrix3D';
		var scope = this;

		// buffers

		var indices = [];
		var vertices = [];

		// helper variables

		var numberOfVertices = 0;
		var groupStart = 0;

		// build 3D matrix

		var gridX1 = points[0].length,
			gridZ1 = points.length,
			gridX = gridX1 - 1,
			gridZ = gridZ1 - 1,

			segmentWidth = ( limits.x.max - limits.x.min ) / ( gridX ),
			segmentHeight = ( limits.z.max - limits.z.min ) / ( gridZ ),

			groupCount = 0,

			ix, iz,

			vector = new THREE.Vector3();

		// generate vertices

		var particles = [];
		for ( iz = 0; iz < gridZ1; iz++ ) {

			var lineVertices = [];
			for ( ix = 0; ix < gridX1; ix++ ) {

				if ( gridX1 !== points[iz].length ) {

					console.error( 'THREE.Matrix3D: points[' + iz + '].length: ' + points[iz].length + ' != ' + gridX1 );
					return;

				}

				var point = new THREE.Vector3(
					limits.x.min + ix * segmentWidth,
					points[iz][ix],
					limits.z.min + iz * segmentHeight
				);
				vertices.push( point.x, point.y, point.z );
				lineVertices.push( point );

				// counters

			}
			mathBox.line( {

				points: mathBox.addPoints( {

					vertices: lineVertices,
					//position: new THREE.Vector3( 0.1, 1, -3 ),
					groupParent: group,
					//folder: fExampleSettings,

				} ),

			} ).userData.iz = iz;
			
			particles.push( raycaster.particles );

		}
		raycaster.particles = particles;
		raycaster.pointSelected = function ( iz, ix ) {

			controllerRowsZ.setValue( iz + 1 );
			controllerRowsX.setValue( ix + 1 );

		}

		// indices

		// 1. you need three indices to draw a single face
		// 2. a single segment consists of two faces
		// 3. so we need to generate six (2*3) indices per segment

		for ( iz = 0; iz < gridZ; iz++ ) {

			for ( ix = 0; ix < gridX; ix++ ) {

				var a = numberOfVertices + ix + gridX1 * iz;
				var b = numberOfVertices + ix + gridX1 * ( iz + 1 );
				var c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iz + 1 );
				var d = numberOfVertices + ( ix + 1 ) + gridX1 * iz;

				// faces

				indices.push( a, b, d );
				indices.push( b, c, d );

				// increase counter

				groupCount += 6;

			}

		}

		// add a group to the geometry. this will ensure multi material support

		scope.addGroup( groupStart, groupCount, 0 );//materialIndex );

		// calculate new start value for groups

		groupStart += groupCount;

		// build geometry

		this.setIndex( indices );
		this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

		if ( optionsMatrix3D.folder === undefined )
			return;

		//controls

		//bold line See https://github.com/mrdoob/three.js/blob/master/examples/webgl_lines_fat.html for details
		function boldLine( positions, colors, lineName ) {

			var geometry = new THREE.LineGeometry();
			geometry.setPositions( positions );
			geometry.setColors( colors );

			if ( THREE.LineMaterial !== undefined ) {
				var matLine = new THREE.LineMaterial( {

					color: 0xffffff,
					linewidth: 0.005, // in pixels
					vertexColors: THREE.VertexColors,
					//resolution:  // to be set by renderer, eventually
					dashed: false

				} );
				var line = new THREE.Line2( geometry, matLine );
				line.name = lineName;
				line.computeLineDistances();
				line.scale.set( 1, 1, 1 );
				scaleObject.object3D( line, options.scales );
				group.add( line );
			} else {

				//issue of Internet Explorer - load of the LineMaterial.js file is impossible.
				//Instead I see "Invalid character" error message in the LineMaterial.js (34,3) line.

				function arrayToPositions( array ) {

					var positions = [];
					for ( var i = 0; i < array.length; i += 3 )
						positions.push( new THREE.Vector3( array[0 + i], array[1 + i], array[2 + i] ) );
					return positions;

				}

				mathBox.line( {

					vertices: arrayToPositions( positions ),
					groupParent: group,
					color: 0xFF00FF,

				} ).name = lineName;
				//						group.userData.object3D.name = lineName;

			}
		}

		function linesCrossing() {

			var display = 'none';
			if ( ( lineZselected >= 0 ) && ( lineXselected >= 0 ) ) {

				var position = new THREE.Vector3(
					limits.x.min + lineXselected * segmentWidth,
					points[lineZselected][lineXselected],
					limits.z.min + lineZselected * segmentHeight
				);

				controllerY.setValue( position.y );

				dotLines.dottedLines( position );

				display = 'block';

			}
			controllerY.domElement.parentElement.parentElement.style.display = display;

		}

		//I have detected bug in the dat.GUI. I can not correctly sort options in OptionController. Here I am sorting of options again.
		function sortOptions( line, controller ) {

			line.forEach( function ( value, key ) {

				controller.__select[key].innerHTML = value;
				controller.__select[key].value = key;
				controller.__select[key].selected = key === 0 ? true : false;

			} );

		}

		var colorBoldLine = new THREE.Color( 1, 0, 1 );//

		//line Z
		var rowsZ = [lang.noSelect, ],
			lineZselected = -1;
		for ( var i = 0; i < points.length; i++ )
			rowsZ.push( limits.z.min + i * segmentHeight );
		function selectLineZ( rowId ) {

			var lineName = 'lineZ';
			var line = group.getObjectByName( lineName );
			if ( line !== undefined ) line.parent.remove( line );
			var iz = rowId - 1;
			if ( iz < 0 ) {

				dotLines.remove();
				return; //no select a row

			}
			var positions = [];
			var colors = [];
			for ( var ix = 0; ix < points[iz].length; ix++ ) {

				positions.push(
					limits.x.min + ix * segmentWidth,
					points[iz][ix],
					limits.z.min + iz * segmentHeight
				);

				colors.push( colorBoldLine.r, colorBoldLine.g, colorBoldLine.b );

			}
			boldLine( positions, colors, lineName );

		}
		var controllerRowsZ = optionsMatrix3D.folder.add( rowsZ, 0,//lang.noSelect,
			rowsZ ).onChange( function ( rowId ) {

				selectLineZ( rowId );
				lineZselected = rowId - 1;
				linesCrossing();

			} );
		sortOptions( rowsZ, controllerRowsZ );
		dat.controllerNameAndTitle( controllerRowsZ, options.scales[mathBox.axesEnum.getName( mathBox.axesEnum.z )].name );

		//line X
		var rowsX = [ lang.noSelect, ],
			lineXselected = -1;
		for ( var i = 0; i < points[0].length; i++ )
			rowsX.push( limits.x.min + i * segmentWidth );
		function selectLineX( rowId ) {

			var lineName = 'lineX';
			var line = group.getObjectByName( lineName );
			if ( line !== undefined ) line.parent.remove( line );
			var ix = rowId - 1;
			if ( ix < 0 ) {

				dotLines.remove();
				return; //no select a row

			}
			var positions = [];
			var colors = [];
			for ( var iz = 0; iz < points.length; iz++ ) {

				positions.push(
					limits.x.min + ix * segmentWidth,
					points[iz][ix],
					limits.z.min + iz * segmentHeight
				);

				colors.push( colorBoldLine.r, colorBoldLine.g, colorBoldLine.b );

			}
			boldLine( positions, colors, lineName );

		}
		var controllerRowsX = optionsMatrix3D.folder.add( rowsX, 0,//lang.noSelect,
			rowsX ).onChange( function ( rowId ) {

				selectLineX( rowId );
				lineXselected = rowId - 1;
				linesCrossing();

			} );
		sortOptions( rowsX, controllerRowsX );
		dat.controllerNameAndTitle( controllerRowsX, options.scales[mathBox.axesEnum.getName( mathBox.axesEnum.x )].name );

		//y
		var y = {

			y: points[0][0],

		}
		var controllerY = optionsMatrix3D.folder.add( y, 'y', options.scales.y.min, options.scales.y.max ).onChange( function ( y ) {

			var iX = parseInt( controllerRowsX.getValue() ) - 1,
				iZ = parseInt( controllerRowsZ.getValue() ) - 1,
				i = ( iX * 3 + 1 ) + iZ * points[0].length * 3;

			if ( points[iZ][iX] === y )
				return;

			//move vertice
			threeMatrix3D.attributes.position.array[i] = y;
			threeMatrix3D.attributes.position.needsUpdate = true;
			updateGroupGeometry( group, scope );
			
			//move point
			group.children.forEach( function ( childGroup ) {

				if ( childGroup.type === 'Group' ) {

					childGroup.children.forEach( function ( childLine ) {

						if ( ( childLine.type === 'Line' ) && ( childLine.userData.iz === iZ ) ) {

							childGroup.children.forEach( function ( childPoints ) {

								if ( childPoints.type === 'Points' ) {

									childPoints.userData.movePointAxes( mathBox.axesEnum.y, y, iX );
									return;

								}

							} );
							return;

						}

					} );

				}

			} );
			
			//move selected lines
			points[iZ][iX] = y;
			selectLineX( iX + 1 );
			selectLineZ( iZ + 1 );
			//console.log( 'iX = ' + iX + ' iZ = ' + iZ + ' y = ' + y );

		} );
		controllerY.domElement.parentElement.parentElement.style.display = 'none';
		dat.controllerNameAndTitle( controllerRowsX, options.scales[mathBox.axesEnum.getName( mathBox.axesEnum.x )].name );

		mathBox.pointLight().controls( group, optionsMatrix3D.folder );

	}

	Matrix3D.prototype = Object.create( THREE.BufferGeometry.prototype );
	Matrix3D.prototype.constructor = THREE.Matrix3D;

	var threeMatrix3D;

	//displaying 3d Matrix
	//optionsMatrix3D
	//{
	//	limits: minimum and maximum values of x and z axes
	//	{
	//		x: minimum and maximum values of x axis
	//		{
	//			min: minimum value of x axis. Default is options.scales.x.min
	//			max: maximum value of x axis. Default is options.scales.x.max
	//		}
	//		z: minimum and maximum values of z axis
	//		{
	//			min: minimum value of z axis. Default is options.scales.z.min
	//			max: maximum value of z axis. Default is options.scales.z.max
	//		}
	//	}
	//	points: two dimensional array of y axis values.
	//		First dimention is y array for z axis
	//		Second dimention is y array for x axis
	//		For example 
	//			points = [
	//				[-1, 0, 1, 2],
	//				[0, 0, -4, 0],
	//				[1, 1, 1, 1],
	//			]
	//		y value for z = 1 and z = 2 is points[1][2] = -4
	//		Default points is [
	//				[0, 0],
	//				[0, 0],
	//			]
	//	groupParent: THREE.Group parent group for adding of the group of the 3d Matrix. Default is scene
	//	folder: gui folder or scene. Default is undefined - no user gui
	//	light: THREE.PointLight object. Default is undefined - no light
	//}
	this.matrix3D = function ( optionsMatrix3D ) {

		optionsMatrix3D = optionsMatrix3D || {};

		var group = new THREE.Group();
		groupParent = optionsMatrix3D.groupParent || scene;
		groupParent.add( group );

		threeMatrix3D = new Matrix3D( optionsMatrix3D.limits, optionsMatrix3D.points, group, optionsMatrix3D );
		THREE.loadScript( [
			"../docs/scenes/js/geometry.js",
		] ).async( {

			onload: function () {

				updateGroupGeometry( group, threeMatrix3D );

			},

		} );

	}

	//displaying 3d function
	//optionsFunction3D
	//{
	//	functions: formulas for calculating of curve points positions
	//	{
	//		x: formula for calculating of the x coordinate of the curve points positions. Default formula is '((t+10)/10-1)*a+b'
	//		y: formula for calculating of the y coordinate of the curve points positions. Default formula is '((t+10)/10-1)*a+b'
	//		z: formula for calculating of the z coordinate of the curve points positions. Default formula is '((t+10)/10-1)*a+b'
	//	}
	//	limits: minimum and maximum values of x and z axes
	//	{
	//		x: minimum and maximum values of x axis
	//		{
	//			min: minimum value of x axis. Default is options.scales.x.min
	//			max: maximum value of x axis. Default is options.scales.x.max
	//		}
	//		z: minimum and maximum values of z axis
	//		{
	//			min: minimum value of z axis. Default is options.scales.z.min
	//			max: maximum value of z axis. Default is options.scales.z.max
	//		}
	//	}
	//	points: two dimensional array of y axis values.
	//		First dimention is y array for z axis
	//		Second dimention is y array for x axis
	//		For example 
	//			points = [
	//				[-1, 0, 1, 2],
	//				[0, 0, -4, 0],
	//				[1, 1, 1, 1],
	//			]
	//		y value for z = 1 and z = 2 is points[1][2] = -4
	//		Default points is [
	//				[0, 0],
	//				[0, 0],
	//			]
	//	groupParent: THREE.Group parent group for adding of the group of the 3d Matrix. Default is scene
	//	folder: gui folder or scene. Default is undefined - no user gui
	//	light: THREE.PointLight object. Default is undefined - no light
	//}
	this.function3D = function ( optionsFunction3D ) {

		optionsFunction3D = optionsFunction3D || {};
		console.log( 'THREE.MathBox.function3D' );

	}

	//A light that gets emitted from a single point in all directions.
	this.pointLight = function () {

		var strLight = 'mathBoxLight',
			light = scene.getObjectByName( strLight ),
			position = new THREE.Vector3( 0.5 * options.scale, 0.5 * options.scale, 0.5 * options.scale );

		this.add = function () {

			if ( light === undefined ) {

				light = new THREE.PointLight( 0xffffff, 1 );
				light.position.copy( position );
				light.name = strLight;
				scene.add( light );

			} else console.error( 'duplicate ' + strLight );
			return light;

		}
		this.remove = function () {

			if ( light == undefined )
				return;
			scene.remove( light );
			delete light;
			light = undefined;

		}
		this.controls = function ( group, folder ) {

			var fLight = folder.addFolder( lang.light ),
				lightSource;

			//displayLight
			dat.controllerNameAndTitle( fLight.add( { display: false }, 'display' ).onChange( function ( value ) {

				if ( value ) {

					lightSource = getPoints( [light.position] );
					group.add( lightSource );

				} else {

					group.remove( lightSource );
					delete lightSource;
					lightSource = undefined;

				}

			} ), lang.displayLight, lang.displayLightTitle );

			//move light
			var min = -2 * options.scale, max = 2 * options.scale,
				controllers = {};
			function guiLightAxis( axesId ) {

				var axesPosition = getAxesPosition( axesId ),
					axesName = mathBox.axesEnum.getName( axesId );
				controllers[ axesId ] = fLight.add( light.position, axesName, min, max )
					.onChange( function ( value ) {

						if ( lightSource === undefined )
							return;

						lightSource.geometry.attributes.position.array[axesId] = value;
						lightSource.geometry.attributes.position.needsUpdate = true;

					} );
				dat.controllerNameAndTitle( controllers[ axesId ], options.scales[axesName].name );

			}
			guiLightAxis( mathBox.axesEnum.x );
			guiLightAxis( mathBox.axesEnum.y );
			guiLightAxis( mathBox.axesEnum.z );

			var restore = {

				restore: function () {

					controllers[mathBox.axesEnum.x].setValue( position.x );
					controllers[mathBox.axesEnum.y].setValue( position.y );
					controllers[mathBox.axesEnum.z].setValue( position.z );

				}
			}
			dat.controllerNameAndTitle( fLight.add( restore, 'restore' ), lang.restore, lang.restoreLightTitle );

		}
		return this;

	}

}

if ( typeof dat !== 'undefined' ) {

	//dat.GUI is included into current project
	//See https://github.com/dataarts/dat.gui/blob/master/API.md about dat.GUI API.

	if ( dat.getControllerByProperty === undefined ) {

		dat.getControllerByProperty = function ( folder, property ) {

			for ( var i = 0; i < folder.__controllers.length; i++ ) {

				if ( folder.__controllers[i].property === property )
					return folder.__controllers[i];

			}

		}

	} else console.error( 'Duplicate dat.getControllerByProperty method.' );

	if ( dat.getControllerByName === undefined ) {

		dat.getControllerByName = function ( folder, name ) {

			for ( var i = 0; i < folder.__controllers.length; i++ ) {

				if ( folder.__controllers[i].__li.querySelector( ".property-name" ).innerHTML === name )
					return folder.__controllers[i];

			}

		}

	} else console.error( 'Duplicate dat.getControllerByName method.' );

}