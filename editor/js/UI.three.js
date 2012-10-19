// Texture

UI.Texture = function ( position ) {

    UI.Element.call( this );

	var scope = this;

	this.texture = new THREE.Texture();

	this.dom = document.createElement( 'input' );
	this.dom.type = 'file';
	this.dom.style.position = position || 'relative';
	this.dom.style.marginTop = '-2px';
	this.dom.style.marginLeft = '-2px';

	this.onChangeCallback = null;

	this.dom.addEventListener( 'change', function ( event ) {

		var file = event.target.files[ 0 ];

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					scope.texture.image = this;
					scope.texture.needsUpdate = true;

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );
				image.src = event.target.result;

			}, false );
			reader.readAsDataURL( file );

		}

	}, false );

	return this;

};

UI.Texture.prototype = Object.create( UI.Element.prototype );

UI.Texture.prototype.getValue = function () {

	return this.texture;

};

UI.Texture.prototype.setValue = function ( value ) {

	this.texture = value;

};

UI.Texture.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// CubeTexture

UI.CubeTexture = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	this.texture = new THREE.Texture( [], new THREE.CubeReflectionMapping() );

	this.dom = document.createElement( 'input' );
	this.dom.type = 'file';
	this.dom.style.position = position || 'relative';
	this.dom.style.marginTop = '-2px';
	this.dom.style.marginLeft = '-2px';

	this.onChangeCallback = null;

	this.dom.addEventListener( 'change', function ( event ) {

		var file = event.target.files[ 0 ];

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					scope.texture.image = [ this, this, this, this, this, this ];
					scope.texture.needsUpdate = true;

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );
				image.src = event.target.result;

			}, false );
			reader.readAsDataURL( file );

		}

	}, false );

	return this;

};

UI.CubeTexture.prototype = Object.create( UI.Element.prototype );

UI.CubeTexture.prototype.getValue = function () {

	return this.texture;

};

UI.CubeTexture.prototype.setValue = function ( value ) {

	this.texture = value;

};

UI.CubeTexture.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};