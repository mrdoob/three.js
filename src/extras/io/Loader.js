/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Loader = function ( showStatus ) {

	this.showStatus = showStatus;
	this.statusDomElement = showStatus ? THREE.Loader.prototype.addStatusElement() : null;

	this.onLoadStart = function () {};
	this.onLoadProgress = function() {};
	this.onLoadComplete = function () {};

};

THREE.Loader.prototype = {

	addStatusElement: function () {

		var e = document.createElement( "div" );

		e.style.position = "absolute"; 
		e.style.right = "0px"; 
		e.style.top = "0px"; 
		e.style.fontSize = "0.8em"; 
		e.style.textAlign = "left";
		e.style.background = "rgba(0,0,0,0.25)"; 
		e.style.color = "#fff"; 
		e.style.width = "120px"; 
		e.style.padding = "0.5em 0.5em 0.5em 0.5em"; 
		e.style.zIndex = 1000;

		e.innerHTML = "Loading ...";

		return e;

	},

	updateProgress: function ( progress ) {

		var message = "Loaded ";

		if ( progress.total ) {

			message += ( 100 * progress.loaded / progress.total ).toFixed(0) + "%";


		} else {

			message += ( progress.loaded / 1000 ).toFixed(2) + " KB";

		}

		this.statusDomElement.innerHTML = message;

	},

	extractUrlbase: function( url ) {

		var chunks = url.split( "/" );
		chunks.pop();
		return chunks.join( "/" );

	},

	init_materials: function( scope, materials, texture_path ) {

		scope.materials = [];

		for ( var i = 0; i < materials.length; ++i ) {

			scope.materials[ i ] = [ THREE.Loader.prototype.createMaterial( materials[ i ], texture_path ) ];

		}

	},

	createMaterial: function ( m, texture_path ) {

		function is_pow2( n ) {

			var l = Math.log( n ) / Math.LN2;
			return Math.floor( l ) == l;

		}

		function nearest_pow2( n ) {

			var l = Math.log( n ) / Math.LN2;
			return Math.pow( 2, Math.round(  l ) );

		}

		function load_image( where, url ) {

			var image = new Image();

			image.onload = function () {

				if ( !is_pow2( this.width ) || !is_pow2( this.height ) ) {

					var w = nearest_pow2( this.width ),
						h = nearest_pow2( this.height );

					where.image.width = w;
					where.image.height = h;
					where.image.getContext("2d").drawImage( this, 0, 0, w, h );

				} else {

					where.image = this;

				}

				where.needsUpdate = true;

			};

			image.src = url;

		}

		var material, mtype, mpars, texture, color, vertexColors;

		// defaults

		mtype = "MeshLambertMaterial";

		// vertexColors

		mpars = { color: 0xeeeeee, opacity: 1.0, map: null, lightMap: null, wireframe: m.wireframe };

		// parameters from model file

		if ( m.shading ) {

			if ( m.shading == "Phong" ) mtype = "MeshPhongMaterial";
			else if ( m.shading == "Basic" ) mtype = "MeshBasicMaterial";

		}

		if ( m.blending ) {

			if ( m.blending == "Additive" ) mpars.blending = THREE.AdditiveBlending;
			else if ( m.blending == "Subtractive" ) mpars.blending = THREE.SubtractiveBlending;
			else if ( m.blending == "Multiply" ) mpars.blending = THREE.MultiplyBlending;

		}

		if ( m.transparent !== undefined || m.opacity < 1.0 ) {

			mpars.transparent = m.transparent;

		}

		if ( m.depthTest !== undefined ) {

			mpars.depthTest = m.depthTest;

		}

		if ( m.vertexColors !== undefined ) {

			if ( m.vertexColors == "face" ) {

				mpars.vertexColors = THREE.FaceColors;

			} else if ( m.vertexColors ) {

				mpars.vertexColors = THREE.VertexColors;

			}

		}

		if ( m.mapDiffuse && texture_path ) {

			texture = document.createElement( 'canvas' );

			mpars.map = new THREE.Texture( texture );
			mpars.map.sourceFile = m.mapDiffuse;

			load_image( mpars.map, texture_path + "/" + m.mapDiffuse );

		} else if ( m.colorDiffuse ) {

			color = ( m.colorDiffuse[0] * 255 << 16 ) + ( m.colorDiffuse[1] * 255 << 8 ) + m.colorDiffuse[2] * 255;
			mpars.color = color;
			mpars.opacity =  m.transparency;

		} else if ( m.DbgColor ) {

			mpars.color = m.DbgColor;

		}

		if ( m.mapLightmap && texture_path ) {

			texture = document.createElement( 'canvas' );

			mpars.lightMap = new THREE.Texture( texture );
			mpars.lightMap.sourceFile = m.mapLightmap;

			load_image( mpars.lightMap, texture_path + "/" + m.mapLightmap );

		}

		material = new THREE[ mtype ]( mpars );

		return material;

	}

};
