var GSVPANO = GSVPANO || {};
GSVPANO.PanoLoader = function (parameters) {

	'use strict';

	var _parameters = parameters || {},
		_location,
		_zoom,
		_panoId,
		_panoClient = new google.maps.StreetViewService(),
		_count = 0,
		_total = 0,
		_canvas = [],
		_ctx = [],
		_wc = 0,
		_hc = 0,
		result = null,
		rotation = 0,
		copyright = '',
		onSizeChange = null,
		onPanoramaLoad = null;

	var levelsW = [ 1, 2, 4, 7, 13, 26 ],
		levelsH = [ 1, 1, 2, 4, 7, 13 ];

	var widths = [ 416, 832, 1664, 3328, 6656 ],
		heights = [ 416, 416, 832, 1664, 3328 ];

	var gl = null;
	try{
		var canvas = document.createElement( 'canvas' );
	    gl = canvas.getContext('experimental-webgl');
	    if(gl == null){
	        gl = canvas.getContext('webgl');
	    }
	}
	catch(error){}

	var maxW = 1024,
		maxH = 1024;

	if( gl ) {
		var maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		console.log( 'MAX_TEXTURE_SIZE ' + maxTexSize );
		maxW = maxH = maxTexSize;
	}
		
	this.setProgress = function (p) {
	
		if (this.onProgress) {
			this.onProgress(p);
		}
		
	};

	this.throwError = function (message) {
	
		if (this.onError) {
			this.onError(message);
		} else {
			console.error(message);
		}
		
	};

	this.adaptTextureToZoom = function () {
	
		var w = levelsW[ _zoom ] * 416,
			h = levelsH[ _zoom ] * 416;

		w = widths [ _zoom ];
		h = heights[ _zoom ];

		_wc = Math.ceil( w / maxW );
		_hc = Math.ceil( h / maxH );

		_canvas = []; _ctx = [];

		var ptr = 0;
		for( var y = 0; y < _hc; y++ ) {
			for( var x = 0; x < _wc; x++ ) {
				var c = document.createElement('canvas');
				if( x < ( _wc - 1 ) ) c.width = maxW; else c.width = w - ( maxW * x );
				if( y < ( _hc - 1 ) ) c.height = maxH; else c.height = h - ( maxH * y );
				console.log( 'New canvas of ' + c.width + 'x' + c.height );
				_canvas.push( c );
				_ctx.push( c.getContext('2d') );
				ptr++;
			}
		}

		//console.log( _canvas );

	};

	this.composeFromTile = function (x, y, texture) {
	
		x *= 512;
		y *= 512;
		var px = Math.floor( x / maxW ), py = Math.floor( y / maxH );

		x -= px * maxW;
		y -= py * maxH;

		_ctx[ py * _wc + px ].drawImage(texture, 0, 0, texture.width, texture.height, x, y, 512, 512 );
		this.progress();
		
	}; 

	this.progress = function() {

		_count++;
		
		var p = Math.round(_count * 100 / _total);
		this.setProgress(p);
		
		if (_count === _total) {
			this.canvas = _canvas;
			this.panoId = _panoId;
			this.zoom = _zoom;
			if (this.onPanoramaLoad) {
				this.onPanoramaLoad();
			}
		}
	}

	this.loadFromId = function( id ) {

		_panoId = id;
		this.composePanorama();

	};

	this.composePanorama = function () {
	
		this.setProgress(0);
		//console.log('Loading panorama for zoom ' + _zoom + '...');
		
		var w = levelsW[ _zoom ],
			h = levelsH[ _zoom ],
			self = this,
			url,
			x,
			y;

			//console.log( w, h, w * 512, h * 512 );
			
		_count = 0;
		_total = w * h;
		
		var self = this;
		for( var y = 0; y < h; y++ ) {
			for( var x = 0; x < w; x++ ) {
				var url = 'https://cbks2.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + _panoId + '&output=tile&zoom=' + _zoom + '&x=' + x + '&y=' + y + '&' + Date.now();
				url = 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + _panoId + '&output=tile&x=' + x + '&y=' + y + '&zoom=' + _zoom + '&nbt&fover=2';

				( function( x, y ) { 
					if( _parameters.useWebGL ) {
						var texture = THREE.ImageUtils.loadTexture( url, null, function() {
							//console.log( 'loaded ' + url );
							self.composeFromTile( x, y, texture );
						} );
					} else {
						var img = new Image();
						img.addEventListener( 'load', function() {
							self.composeFromTile( x, y, this );			
						} );
						img.crossOrigin = '';
						img.src = url;
					}
				} )( x, y );
			}
		}
		
	};
	
	this.load = function (location) {
	
		//console.log('Load for', location);
		var self = this;

		var url = 'https://maps.google.com/cbk?output=json&hl=x-local&ll=' + location.lat() + ',' + location.lng() + '&cb_client=maps_sv&v=3';
		url = 'https://cbks0.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=polygon&it=1%3A1&rank=closest&ll=' + location.lat() + ',' + location.lng() + '&radius=350';
		
		var http_request = new XMLHttpRequest();
		http_request.open( "GET", url, true );
		http_request.onreadystatechange = function () {
			if ( http_request.readyState == 4 && http_request.status == 200 ) {
				var data = JSON.parse( http_request.responseText );
				//self.loadPano( location, data.Location.panoId );
				self.loadPano( location, data.result[ 0 ].id );
			}
		};
		http_request.send(null);

	};

	this.loadPano = function( location, id ) {

		//console.log( 'Load ' + id );
		var self = this;
		_panoClient.getPanoramaById( id, function (result, status) {
			if (status === google.maps.StreetViewStatus.OK) {
				self.result = result;
				if( self.onPanoramaData ) self.onPanoramaData( result );
				var h = google.maps.geometry.spherical.computeHeading(location, result.location.latLng);
				rotation = (result.tiles.centerHeading - h) * Math.PI / 180.0;
				copyright = result.copyright;
				self.copyright = result.copyright;
				_panoId = result.location.pano;
				self.location = location;
				self.composePanorama();
			} else {
				if( self.onNoPanoramaData ) self.onNoPanoramaData( status );
				self.throwError('Could not retrieve panorama for the following reason: ' + status);
			}
		});
		
	};
	
	this.setZoom = function( z ) {
		_zoom = z;
		console.log( z );
		this.adaptTextureToZoom();
	};

	this.setZoom( _parameters.zoom || 1 );

};