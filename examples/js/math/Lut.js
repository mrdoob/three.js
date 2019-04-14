/**
 * @author daron1337 / http://daron1337.github.io/
 */

THREE.Lut = function ( colormap, numberofcolors ) {

	this.lut = [];
	this.setColorMap( colormap, numberofcolors );
	return this;

};

var defaultLegendParameters = {
	layout: 'vertical',
	position: new THREE.Vector3(),
	dimensions: { width: 0.5, height: 3 }
};

var defaultLabelParameters = {
	fontsize: 24,
	fontface: 'Arial',
	title: '',
	um: '',
	ticks: 0,
	decimal: 2,
	notation: 'standard'
};

var defaultBackgroundColor = { r: 255, g: 100, b: 100, a: 0.8 };
var defaultBorderColor = { r: 255, g: 0, b: 0, a: 1.0 };
var defaultBorderThickness = 4;

THREE.Lut.prototype = {

	constructor: THREE.Lut,

	lut: [], map: [], mapname: 'rainbow', n: 256, minV: 0, maxV: 1, legend: null,

	set: function ( value ) {

		if ( value instanceof THREE.Lut ) {

			this.copy( value );

		}

		return this;

	},

	setMin: function ( min ) {

		this.minV = min;

		return this;

	},

	setMax: function ( max ) {

		this.maxV = max;

		return this;

	},

	setColorMap: function ( colormap, numberofcolors ) {

		this.map = THREE.ColorMapKeywords[ colormap ] || THREE.ColorMapKeywords.rainbow;
		this.n = numberofcolors || 32;
		this.mapname = colormap;

		var step = 1.0 / this.n;

		this.lut.length = 0;
		for ( var i = 0; i <= 1; i += step ) {

			for ( var j = 0; j < this.map.length - 1; j ++ ) {

				if ( i >= this.map[ j ][ 0 ] && i < this.map[ j + 1 ][ 0 ] ) {

					var min = this.map[ j ][ 0 ];
					var max = this.map[ j + 1 ][ 0 ];

					var minColor = new THREE.Color( this.map[ j ][ 1 ] );
					var maxColor = new THREE.Color( this.map[ j + 1 ][ 1 ] );

					var color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );

					this.lut.push( color );

				}

			}

		}

		return this;

	},

	copy: function ( lut ) {

		this.lut = lut.lut;
		this.mapname = lut.mapname;
		this.map = lut.map;
		this.n = lut.n;
		this.minV = lut.minV;
		this.maxV = lut.maxV;

		return this;

	},

	getColor: function ( alpha ) {

		if ( alpha <= this.minV ) {

			alpha = this.minV;

		} else if ( alpha >= this.maxV ) {

			alpha = this.maxV;

		}

		alpha = ( alpha - this.minV ) / ( this.maxV - this.minV );

		var colorPosition = Math.round( alpha * this.n );
		colorPosition == this.n ? colorPosition -= 1 : colorPosition;

		return this.lut[ colorPosition ];

	},

	addColorMap: function ( colormapName, arrayOfColors ) {

		THREE.ColorMapKeywords[ colormapName ] = arrayOfColors;

	},

	createCanvas: function () {

		var canvas = document.createElement( 'canvas' );
		canvas.setAttribute( 'width', 1 );
		canvas.setAttribute( 'height', this.n );
		canvas.setAttribute( 'id', 'legend' );
		canvas.setAttribute( 'hidden', true );

		this.updateCanvas( canvas );

		return canvas;

	},

	updateCanvas: function ( canvas ) {

		canvas = canvas || this.legend.canvas;

		var ctx = canvas.getContext( '2d', { alpha: false } );

		var imageData = ctx.getImageData( 0, 0, 1, this.n );

		var data = imageData.data;

		this.map = THREE.ColorMapKeywords[ this.mapname ];

		var k = 0;

		var step = 1.0 / this.n;

		for ( var i = 1; i >= 0; i -= step ) {

			for ( var j = this.map.length - 1; j >= 0; j -- ) {

				if ( i < this.map[ j ][ 0 ] && i >= this.map[ j - 1 ][ 0 ] ) {

					var min = this.map[ j - 1 ][ 0 ];
					var max = this.map[ j ][ 0 ];

					var minColor = new THREE.Color( this.map[ j - 1 ][ 1 ] );
					var maxColor = new THREE.Color( this.map[ j ][ 1 ] );

					var color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );

					data[ k * 4 ] = Math.round( color.r * 255 );
					data[ k * 4 + 1 ] = Math.round( color.g * 255 );
					data[ k * 4 + 2 ] = Math.round( color.b * 255 );
					data[ k * 4 + 3 ] = 255;

					k += 1;

				}

			}

		}

		ctx.putImageData( imageData, 0, 0 );

		return canvas;

	},

	setLegendOn: function ( parameters ) {

		parameters = parameters || defaultLegendParameters;

		this.legend = {};

		this.legend.layout = parameters.layout || defaultLegendParameters.layout;

		this.legend.position = parameters.position || defaultLegendParameters.position;

		this.legend.dimensions = parameters.dimensions || defaultLegendParameters.dimensions;

		var canvas = this.createCanvas();

		document.body.appendChild( canvas );

		this.legend.canvas = canvas;

		this.legend.texture = new THREE.Texture( canvas );
		this.legend.texture.needsUpdate = true;

		this.legend.legendGeometry = new THREE.PlaneBufferGeometry( this.legend.dimensions.width, this.legend.dimensions.height );
		this.legend.legendMaterial = new THREE.MeshBasicMaterial( { map: this.legend.texture, side: THREE.DoubleSide } );

		this.legend.mesh = new THREE.Mesh( this.legend.legendGeometry, this.legend.legendMaterial );

		if ( this.legend.layout == 'horizontal' ) {

			this.legend.mesh.rotation.z = - 90 * ( Math.PI / 180 );

		}

		this.legend.mesh.position.copy( this.legend.position );

		return this.legend.mesh;

	},

	setLegendOff: function () {

		this.legend = null;

		return this.legend;

	},

	setLegendLayout: function ( layout ) {

		if ( ! this.legend ) {

			return false;

		}

		if ( this.legend.layout == layout ) {

			return false;

		}

		if ( layout != 'horizontal' && layout != 'vertical' ) {

			return false;

		}

		this.layout = layout;

		if ( layout == 'horizontal' ) {

			this.legend.mesh.rotation.z = 90 * ( Math.PI / 180 );

		}

		if ( layout == 'vertical' ) {

			this.legend.mesh.rotation.z = - 90 * ( Math.PI / 180 );

		}

		return this.legend.mesh;

	},

	setLegendPosition: function ( position ) {

		if ( position.isVector3 ) {

			this.legend.position.copy( position );

		} else {

			this.legend.position.set( position.x, position.y, position.z );

		}

		return this.legend;

	},

	setLegendLabels: function ( parameters, callback ) {

		if ( ! this.legend ) {

			return false;

		}

		if ( typeof parameters === 'function' ) {

			callback = parameters;
			parameters = undefined;

		}

		parameters = parameters || defaultLabelParameters;
		this.legend.labels = {};

		this.legend.labels.fontsize = parameters.fontsize || defaultLabelParameters.fontsize;

		this.legend.labels.fontface = parameters.fontface || defaultLabelParameters.fontface;

		this.legend.labels.title = parameters.title || defaultLabelParameters.title;

		this.legend.labels.um = parameters.um || defaultLabelParameters.um;

		this.legend.labels.ticks = parameters.ticks || defaultLabelParameters.ticks;

		this.legend.labels.decimal = parameters.decimal || defaultLabelParameters.decimal;

		this.legend.labels.notation = parameters.notation || defaultLabelParameters.notation;

		var canvasTitle = document.createElement( 'canvas' );
		var contextTitle = canvasTitle.getContext( '2d' );

		contextTitle.font = 'Normal ' + this.legend.labels.fontsize * 1.2 + 'px ' + this.legend.labels.fontface;

		contextTitle.fillStyle = 'rgba(' + defaultBackgroundColor.r + ',' + defaultBackgroundColor.g + ',' + defaultBackgroundColor.b + ',' + defaultBackgroundColor.a + ')';

		contextTitle.strokeStyle = 'rgba(' + defaultBorderColor.r + ',' + defaultBorderColor.g + ',' + defaultBorderColor.b + ',' + defaultBorderColor.a + ')';

		contextTitle.lineWidth = defaultBorderThickness;

		contextTitle.fillStyle = 'rgba( 0, 0, 0, 1.0 )';

		contextTitle.fillText( this.legend.labels.title.toString() + this.legend.labels.um.toString(), defaultBorderThickness, this.legend.labels.fontsize + defaultBorderThickness );

		var txtTitle = new THREE.CanvasTexture( canvasTitle );
		txtTitle.minFilter = THREE.LinearFilter;

		var spriteMaterialTitle = new THREE.SpriteMaterial( { map: txtTitle } );

		var spriteTitle = new THREE.Sprite( spriteMaterialTitle );

		spriteTitle.scale.set( 2, 1, 1.0 );

		if ( this.legend.layout == 'vertical' ) {

			spriteTitle.position.set( this.legend.position.x + this.legend.dimensions.width, this.legend.position.y + ( this.legend.dimensions.height * 0.45 ), this.legend.position.z );

		}

		if ( this.legend.layout == 'horizontal' ) {

			spriteTitle.position.set( this.legend.position.x * 1.015, this.legend.position.y + ( this.legend.dimensions.height * 0.03 ), this.legend.position.z );

		}

		if ( this.legend.labels.ticks > 0 ) {

			var ticks = {};
			var lines = {};

			if ( this.legend.layout == 'vertical' ) {

				var topPositionY = this.legend.position.y + ( this.legend.dimensions.height * 0.36 );
				var bottomPositionY = this.legend.position.y - ( this.legend.dimensions.height * 0.61 );

			}

			if ( this.legend.layout == 'horizontal' ) {

				var topPositionX = this.legend.position.x + ( this.legend.dimensions.height * 0.75 );
				var bottomPositionX = this.legend.position.x - ( this.legend.dimensions.width * 1.2 );

			}

			for ( var i = 0; i < this.legend.labels.ticks; i ++ ) {

				var value = ( this.maxV - this.minV ) / ( this.legend.labels.ticks - 1 ) * i + this.minV;

				if ( callback ) {

					value = callback( value );

				} else {

					if ( this.legend.labels.notation == 'scientific' ) {

						value = value.toExponential( this.legend.labels.decimal );

					} else {

						value = value.toFixed( this.legend.labels.decimal );

					}

				}

				var canvasTick = document.createElement( 'canvas' );
				var contextTick = canvasTick.getContext( '2d' );

				contextTick.font = 'Normal ' + this.legend.labels.fontsize + 'px ' + this.legend.labels.fontface;

				contextTick.fillStyle = 'rgba(' + defaultBackgroundColor.r + ',' + defaultBackgroundColor.g + ',' + defaultBackgroundColor.b + ',' + defaultBackgroundColor.a + ')';

				contextTick.strokeStyle = 'rgba(' + defaultBorderColor.r + ',' + defaultBorderColor.g + ',' + defaultBorderColor.b + ',' + defaultBorderColor.a + ')';

				contextTick.lineWidth = defaultBorderThickness;

				contextTick.fillStyle = 'rgba( 0, 0, 0, 1.0 )';

				contextTick.fillText( value.toString(), defaultBorderThickness, this.legend.labels.fontsize + defaultBorderThickness );

				var txtTick = new THREE.CanvasTexture( canvasTick );
				txtTick.minFilter = THREE.LinearFilter;

				var spriteMaterialTick = new THREE.SpriteMaterial( { map: txtTick } );

				var spriteTick = new THREE.Sprite( spriteMaterialTick );

				spriteTick.scale.set( 2, 1, 1.0 );

				if ( this.legend.layout == 'vertical' ) {

					var position = bottomPositionY + ( topPositionY - bottomPositionY ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) );

					spriteTick.position.set( this.legend.position.x + ( this.legend.dimensions.width * 2.7 ), position, this.legend.position.z );

				}

				if ( this.legend.layout == 'horizontal' ) {

					var position = bottomPositionX + ( topPositionX - bottomPositionX ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) );

					if ( this.legend.labels.ticks > 5 ) {

						if ( i % 2 === 0 ) {

							var offset = 1.7;

						} else {

							var offset = 2.1;

						}

					} else {

						var offset = 1.7;

					}

					spriteTick.position.set( position, this.legend.position.y - this.legend.dimensions.width * offset, this.legend.position.z );

				}

				var material = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } );

				var points = [];


				if ( this.legend.layout == 'vertical' ) {

					var linePosition = ( this.legend.position.y - ( this.legend.dimensions.height * 0.5 ) + 0.01 ) + ( this.legend.dimensions.height ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) * 0.99 );

					points.push( new THREE.Vector3( this.legend.position.x + this.legend.dimensions.width * 0.55, linePosition, this.legend.position.z ) );

					points.push( new THREE.Vector3( this.legend.position.x + this.legend.dimensions.width * 0.7, linePosition, this.legend.position.z ) );

				}

				if ( this.legend.layout == 'horizontal' ) {

					var linePosition = ( this.legend.position.x - ( this.legend.dimensions.height * 0.5 ) + 0.01 ) + ( this.legend.dimensions.height ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) * 0.99 );

					points.push( new THREE.Vector3( linePosition, this.legend.position.y - this.legend.dimensions.width * 0.55, this.legend.position.z ) );

					points.push( new THREE.Vector3( linePosition, this.legend.position.y - this.legend.dimensions.width * 0.7, this.legend.position.z ) );

				}

				var geometry = new THREE.BufferGeometry().setFromPoints( points );

				var line = new THREE.Line( geometry, material );

				lines[ i ] = line;
				ticks[ i ] = spriteTick;

			}

		}

		return { 'title': spriteTitle, 'ticks': ticks, 'lines': lines };

	}

};


THREE.ColorMapKeywords = {

	"rainbow": [[ 0.0, 0x0000FF ], [ 0.2, 0x00FFFF ], [ 0.5, 0x00FF00 ], [ 0.8, 0xFFFF00 ], [ 1.0, 0xFF0000 ]],
	"cooltowarm": [[ 0.0, 0x3C4EC2 ], [ 0.2, 0x9BBCFF ], [ 0.5, 0xDCDCDC ], [ 0.8, 0xF6A385 ], [ 1.0, 0xB40426 ]],
	"blackbody": [[ 0.0, 0x000000 ], [ 0.2, 0x780000 ], [ 0.5, 0xE63200 ], [ 0.8, 0xFFFF00 ], [ 1.0, 0xFFFFFF ]],
	"grayscale": [[ 0.0, 0x000000 ], [ 0.2, 0x404040 ], [ 0.5, 0x7F7F80 ], [ 0.8, 0xBFBFBF ], [ 1.0, 0xFFFFFF ]]

};
