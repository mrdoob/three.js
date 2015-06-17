/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 */

 /**
 *此为修改版本，兼容IE10及11，禁止preserve3d渲染时，在部分手机上缩放也不会有闪烁的问题。
 *@author 路妖精 http://112.74.80.241/luyaojing
 */
 
THREE.CSS3DObject = function ( element ) {

	THREE.Object3D.call( this );

	this.element = element;
	this.element.style.position = 'absolute';

	this.addEventListener( 'removed', function ( event ) {

		if ( this.element.parentNode !== null ) {

			this.element.parentNode.removeChild( this.element );

		}

	} );

};

THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );
THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject;

THREE.CSS3DSprite = function ( element ) {

	THREE.CSS3DObject.call( this, element );

};

THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );
THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite;

//

THREE.CSS3DRenderer = function ( parameters ) {

	console.log( 'THREE.CSS3DRenderer', THREE.REVISION );
	
	parameters = parameters || {};
	
	//是否启用preserve3d渲染。使用.preserve3d，而不要使用._preserve3d。禁止preserve3d渲染，手机上不会出现缩放时闪烁现象。
	this._preserve3d = parameters.preserve3d === undefined ? true : parameters.preserve3d; 
	
	//是否排序对象。启用后近的对象可以遮住远的对象；不启用，会出现远的对象出现在近的对象前面的现象。禁止preserve3d渲染时有效。
	this.sortObjects = parameters.sortObjects === undefined ? true : parameters.sortObjects; 

	var _width, _height;
	var _widthHalf, _heightHalf;
	
	var _fov;

	var matrix = new THREE.Matrix4();
	var matrix_1 = new THREE.Matrix4();
	
	var _scope = this;
	
	var cache = {
		camera: { fov: 0, style: '' },
		objects: {}
	};
	
	Object.defineProperty( this, 'preserve3d', { 
	
		get: function(){ return this._preserve3d },

		set: function( value ){ 

			cache.preserve3d = this._preserve3d = value;
			
			if ( this._supportPreserve3d === undefined ){
			
				var testDiv = document.createElement( 'div' ).style;
			
				if ( testDiv.WebkitTransformStyle !== undefined ) testDiv.WebkitTransformStyle = 'preserve-3d';
				if ( testDiv.MozTransformStyle !== undefined ) testDiv.MozTransformStyle = 'preserve-3d';
				if ( testDiv.oTransformStyle !== undefined ) testDiv.oTransformStyle = 'preserve-3d';
				if ( testDiv.transformStyle !== undefined )testDiv.transformStyle = 'preserve-3d';
				
				setTimeout( function(){
				
					if ( testDiv.WebkitTransformStyle === 'preserve-3d' ||
						 testDiv.MozTransformStyle === 'preserve-3d' ||
						 testDiv.oTransformStyle === 'preserve-3d' ||
						 testDiv.transformStyle === 'preserve-3d' ){
						 
						 _scope._supportPreserve3d = true;
						 _scope.preserve3d = _scope._preserve3d;
						 
					}
					else{
					
						_scope._supportPreserve3d = false;
						_scope.preserve3d = false;
						
					};
				
				}, 50 );
				
				return;
				
			};
			
			var sl = domElement.style, sc = cameraElement.style;
			
			if ( !this._supportPreserve3d ) this._preserve3d = false;
			
			if ( this._preserve3d ){
			
				sl.WebkitTransformStyle = 'preserve-3d';
				sl.MozTransformStyle = 'preserve-3d';
				sl.oTransformStyle = 'preserve-3d';
				sl.transformStyle = 'preserve-3d';
					
				sc.WebkitTransformStyle = 'preserve-3d';
				sc.MozTransformStyle = 'preserve-3d';
				sc.oTransformStyle = 'preserve-3d';
				sc.transformStyle = 'preserve-3d';
				//sl['background-color']='rgba(255,255,255,0.25)';
			
				return;
			
			}
			else{
					
				sl.WebkitTransformStyle = '';
				sl.MozTransformStyle = '';
				sl.oTransformStyle = '';
				sl.transformStyle = '';
				
				sc.WebkitTransformStyle = '';
				sc.MozTransformStyle = '';
				sc.oTransformStyle = '';
				sc.transformStyle = '';
				
				var style = 'translate3d(' + _widthHalf + 'px,' + _heightHalf + 'px, 0px)' ;

				sc.WebkitTransform = style;
				sc.MozTransform = style;
				sc.oTransform = style;
				sc.transform = style;
					
			};
			
		} 
		
	} );

	var domElement = parameters.div && ( parameters.div.nodeName === 'DIV' ) ? parameters.div : document.createElement( 'div' );
	domElement.style.overflow = 'hidden';
	
	this.domElement = domElement;

	var cameraElement = document.createElement( 'div' );
	
	this.preserve3d = this._preserve3d;
	
	domElement.appendChild( cameraElement );

	this.setClearColor = function ( color ) {  //color是字符串表示的CSS颜色属性。
	
		domElement.style['background-color'] = color;
		
	};

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		domElement.style.width = width + 'px';
		domElement.style.height = height + 'px';
		
		var sl = cameraElement.style;
		
		sl.width = width + 'px';
		sl.height = height + 'px';
		
		if ( !this._preserve3d ){
		
			var style = 'translate3d(' + _widthHalf + 'px,' + _heightHalf + 'px, 0px)';

			sl.WebkitTransform = style;
			sl.MozTransform = style;
			sl.oTransform = style;
			sl.transform = style;
		
		};

	};

	var epsilon = function ( value ) {

		return Math.abs( value ) < 0.000001 ? 0 : value;

	};

	var getCameraCSSMatrix = function ( matrix ) {

		var m = matrix.elements;

		return 'matrix3d(' +
			epsilon( m[ 0 ] ) + ',' +
			epsilon( - m[ 1 ] ) + ',' +
			epsilon( m[ 2 ] ) + ',' +
			epsilon( m[ 3 ] ) + ',' +
			epsilon( m[ 4 ] ) + ',' +
			epsilon( - m[ 5 ] ) + ',' +
			epsilon( m[ 6 ] ) + ',' +
			epsilon( m[ 7 ] ) + ',' +
			epsilon( m[ 8 ] ) + ',' +
			epsilon( - m[ 9 ] ) + ',' +
			epsilon( m[ 10 ] ) + ',' +
			epsilon( m[ 11 ] ) + ',' +
			epsilon( m[ 12 ] ) + ',' +
			epsilon( - m[ 13 ] ) + ',' +
			epsilon( m[ 14 ] ) + ',' +
			epsilon( m[ 15 ] ) +
		')';

	};

	var getObjectCSSMatrix = function ( matrix ) {
		
		var m = matrix.elements;
		
		if ( _scope._preserve3d ){
			
			return 'translate3d(-50%,-50%,0) matrix3d(' +
				epsilon( m[ 0 ] ) + ',' +
				epsilon( m[ 1 ] ) + ',' +
				epsilon( m[ 2 ] ) + ',' +
				epsilon( m[ 3 ] ) + ',' +
				epsilon( - m[ 4 ] ) + ',' +
				epsilon( - m[ 5 ] ) + ',' +
				epsilon( - m[ 6 ] ) + ',' +
				epsilon( - m[ 7 ] ) + ',' +
				epsilon( m[ 8 ] ) + ',' +
				epsilon( m[ 9 ] ) + ',' +
				epsilon( m[ 10 ] ) + ',' +
				epsilon( m[ 11 ] ) + ',' +
				epsilon( m[ 12 ] ) + ',' +
				epsilon( m[ 13 ] ) + ',' +
				epsilon( m[ 14 ] ) + ',' +
				epsilon( m[ 15 ] ) +
			')';
		
		};
			
			return 'translate3d(-50%,-50%,0) perspective(' + _fov + 'px)' + 
					' translate3d(0,0,' + _fov  + 'px) matrix3d(' +
				epsilon( m[ 0 ] ) + ',' +
				epsilon( - m[ 1 ] ) + ',' +
				epsilon( m[ 2 ] ) + ',' +
				epsilon( m[ 3 ] ) + ',' +
				epsilon( - m[ 4 ] ) + ',' +
				epsilon( m[ 5 ] ) + ',' +
				epsilon( - m[ 6 ] ) + ',' +
				epsilon( - m[ 7 ] ) + ',' +
				epsilon( m[ 8 ] ) + ',' +
				epsilon( - m[ 9 ] ) + ',' +
				epsilon( m[ 10 ] ) + ',' +
				epsilon( m[ 11 ] ) + ',' +
				epsilon( m[ 12 ] ) + ',' +
				epsilon( - m[ 13 ] ) + ',' +
				epsilon( m[ 14 ] ) + ',' +
				epsilon( m[ 15 ] ) +
			')';
		
	};
	

	var renderObject = function ( object, camera ) {
		
		if ( object instanceof THREE.CSS3DObject ) {

			var style, m = matrix.elements;
			
			if ( _scope._preserve3d ){
			
				if ( object instanceof THREE.CSS3DSprite ) {

					// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

					matrix.copy( camera.matrixWorldInverse );
					matrix.transpose();
					matrix.copyPosition( object.matrixWorld );
					matrix.scale( object.scale );

					m[ 3 ] = 0;
					m[ 7 ] = 0;
					m[ 11 ] = 0;
					m[ 15 ] = 1;

					style = getObjectCSSMatrix( matrix );

				} 
				else {

					style = getObjectCSSMatrix( object.matrixWorld );

				};
			
			}
			else{
			
				if ( object instanceof THREE.CSS3DSprite ) {

					matrix_1.copy( camera.matrixWorld );
					
					matrix_1.copyPosition( object.matrixWorld );
					matrix_1.scale( object.scale );
					
					matrix.copy( camera.matrixWorldInverse );
					matrix.multiply( matrix_1 );

					style = getObjectCSSMatrix( matrix );

				} 
				else {
				
					matrix.copy( camera.matrixWorldInverse );
					matrix.multiply( object.matrixWorld );

					style = getObjectCSSMatrix( matrix );
							
				};
			
			};

			var element = object.element;
			var cachedStyle = cache.objects[ object.id ];

			if ( cachedStyle === undefined || cachedStyle !== style ) {

				element.style.WebkitTransform = style;
				element.style.MozTransform = style;
				element.style.oTransform = style;
				element.style.transform = style;

				cache.objects[ object.id ] = style;

			};
			
			if ( !_scope._preserve3d && _scope.sortObjects ){
			
				var cachezIndex = cache.objects[ object.id + 'zIndex' ],
					zIndex = Math.round( camera.far * camera.far - ( m[ 12 ] * m[ 12 ] + m[ 13 ] * m[ 13 ] + m[ 14 ] * m[ 14 ] ) );
				
				if ( cachezIndex === undefined || cachezIndex !== zIndex ){
				
					element.style.zIndex = zIndex + '';
					cache.objects[ object.id + 'zIndex' ] = zIndex;
				
				};
			
			};

			if ( element.parentNode !== cameraElement ) {

				cameraElement.appendChild( element );

			};

		};

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			renderObject( object.children[ i ], camera );

		}

	};

	this.render = function ( scene, camera ) {
	
		scene.updateMatrixWorld();
		
		if ( camera.parent === undefined ) camera.updateMatrixWorld();
		camera.matrixWorldInverse.getInverse( camera.matrixWorld );
	
		if ( this._preserve3d ){
		
			if ( cache.camera.fov !== camera.fov ) {
			
				cache.camera.fov = camera.fov;

				_fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * _height;
			
				domElement.style.WebkitPerspective = _fov + "px";
				domElement.style.MozPerspective = _fov + "px";
				domElement.style.oPerspective = _fov + "px";
				domElement.style.perspective = _fov + "px";

			};

			var style = "translate3d(0,0," + _fov + "px)" + getCameraCSSMatrix( camera.matrixWorldInverse ) +
				" translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

			if ( cache.camera.style !== style ) {

				cameraElement.style.WebkitTransform = style;
				cameraElement.style.MozTransform = style;
				cameraElement.style.oTransform = style;
				cameraElement.style.transform = style;
				
				cache.camera.style = style;

			};
		
		}
		else{
		
			if ( cache.camera.fov !== camera.fov ) {
			
				_fov = Math.tan( THREE.Math.degToRad( ( 180 - ( camera.fov || 180 ) ) * 0.5 ) ) * _heightHalf;
				cache.camera.fov = camera.fov;

			};
			
		};

		renderObject( scene, camera );

	};

};


