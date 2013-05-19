// String

UI.ParamString = function ( name ) {

  UI.Panel.call( this );

	var scope = this;

	var row = new UI.Panel();

	this.name = new UI.Text( name ).setWidth( '90px' ).setColor( '#666' );
	this.string = new UI.Input().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' );
	this.string.dom.name = name;

	row.add( this.name, this.string );
	this.add( row );

	return this;

};

UI.ParamString.prototype = Object.create( UI.Panel.prototype );


UI.ParamString.prototype.setValue = function ( value ) {

	this.string.setValue( value );

};


UI.ParamString.prototype.getValue = function ( value ) {

	return this.string.getValue( value );

};

// Integer

UI.ParamInteger = function ( name ) {

  UI.Panel.call( this );

	var scope = this;

	var row = new UI.Panel();

	this.name = new UI.Text( name ).setWidth( '90px' ).setColor( '#666' );
	this.integer = new UI.Integer();
	this.integer.dom.name = name;
	
	row.add( this.name, this.integer );
	this.add( row );

	return this;

};

UI.ParamInteger.prototype = Object.create( UI.Panel.prototype );

UI.ParamInteger.prototype.setValue = function ( value ) {

	this.integer.setValue( value );

};

UI.ParamInteger.prototype.getValue = function () {

	return this.integer.getValue();

};

// Float

UI.ParamFloat = function ( name ) {

  UI.Panel.call( this );

	var scope = this;

	var row = new UI.Panel();

	this.name = new UI.Text( name ).setWidth( '90px' ).setColor( '#666' );
	this.float = new UI.Number();
	this.float.dom.name = name;
	
	row.add( this.name, this.float );
	this.add( row );

	return this;

};

UI.ParamFloat.prototype = Object.create( UI.Panel.prototype );

UI.ParamFloat.prototype.setValue = function ( value ) {

	this.float.setValue( value );

};

UI.ParamFloat.prototype.getValue = function () {

	return this.float.getValue();

};

// Bool

UI.ParamBool = function ( name ) {

  UI.Panel.call( this );

	var scope = this;

	var row = new UI.Panel();

	this.name = new UI.Text( name ).setWidth( '90px' ).setColor( '#666' ).setPosition( 'relative' ).setLeft( '25px' );
	this.bool = new UI.Checkbox().setPosition( 'absolute' ).setLeft( '10px' );
	this.bool.dom.name = name;

	row.add( this.name, this.bool );
	this.add( row );

	return this;

};

UI.ParamBool.prototype = Object.create( UI.Panel.prototype );

UI.ParamBool.prototype.setValue = function ( value ) {

	this.bool.setValue( value );

};


UI.ParamBool.prototype.getValue = function () {

	return this.bool.getValue();

};

// Vector3

UI.ParamVector3 = function ( name, scaleLock ) {

  UI.Panel.call( this );

  scaleLock = scaleLock ? scaleLock : false;

	var scope = this;

	var row = new UI.Panel();

	this.name = new UI.Text( name ).setWidth( '90px' ).setColor( '#666' );

	this.x = new UI.Number().setWidth( '50px' ).onChange( setYZ );
	this.y = new UI.Number().setWidth( '50px' ).onChange( setXZ );
	this.z = new UI.Number().setWidth( '50px' ).onChange( setXY );
	this.x.dom.name = name;
	this.y.dom.name = name;
	this.z.dom.name = name;
	
	row.add( this.name, this.x, this.y, this.z );

	if ( scaleLock ) {
	
		this.scaleLock = new UI.Checkbox().setPosition( 'absolute' ).setLeft( '75px' );
		row.add( this.scaleLock );

	}

	this.add( row );

	function setYZ( event ) {

		if ( scope.scaleLock && scope.scaleLock.getValue() && event.srcElement.oldValue ) {

			var scale = event.srcElement.value / event.srcElement.oldValue;
			scope.y.setValue( parseFloat(scope.y.getValue()) * scale );
			scope.z.setValue( parseFloat(scope.z.getValue()) * scale );

		}

	}

	function setXZ( event ) {

		if ( scope.scaleLock && scope.scaleLock.getValue() && event.srcElement.oldValue ) {

			var scale = event.srcElement.value / event.srcElement.oldValue;
			scope.x.setValue( parseFloat(scope.x.getValue()) * scale );
			scope.z.setValue( parseFloat(scope.z.getValue()) * scale );

		}

	}

	function setXY( event ) {

		if ( scope.scaleLock && scope.scaleLock.getValue() && event.srcElement.oldValue ) {

			var scale = event.srcElement.value / event.srcElement.oldValue;
			scope.x.setValue( parseFloat(scope.x.getValue()) * scale );
			scope.y.setValue( parseFloat(scope.y.getValue()) * scale );

		}

	}

	return this;

};

UI.ParamVector3.prototype = Object.create( UI.Panel.prototype );

UI.ParamVector3.prototype.setValue = function ( value ) {

	this.x.setValue( value.x );
	this.y.setValue( value.y );
	this.z.setValue( value.z );

};


UI.ParamVector3.prototype.getValue = function () {

	return new THREE.Vector3( this.x.getValue(), this.y.getValue(), this.z.getValue() );

};

// Color

UI.ParamColor = function ( name ) {

  UI.Panel.call( this );

	var scope = this;

	var row = new UI.Panel();

	this.name = new UI.Text( name ).setWidth( '90px' ).setColor( '#666' );
	this.color = new UI.Color();
	this.color.dom.name = name;
	
	row.add( this.name, this.color );
	this.add( row );

	return this;

};

UI.ParamColor.prototype = Object.create( UI.Panel.prototype );

UI.ParamColor.prototype.setValue = function ( color ) {

	this.color.setValue( '#' + color.getHexString() );

};


UI.ParamColor.prototype.getValue = function () {

	return this.color.getHexValue();

};

// Select

UI.ParamSelect = function ( name ) {

  UI.Panel.call( this );

	var scope = this;

	this.onChangeCallback;

	var row = new UI.Panel();

	this.name = new UI.Text( name ).setWidth( '90px' ).setColor( '#666' );
	this.select = new UI.Select().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' );
	this.select.dom.name = name;

	row.add( this.name, this.select );
	this.add( row );

	return this;

};

UI.ParamSelect.prototype = Object.create( UI.Panel.prototype );

UI.ParamSelect.prototype.setValue = function ( value ) {

	this.select.setValue( value );

};


UI.ParamSelect.prototype.getValue = function ( value ) {

	return this.select.getValue( value );

};

UI.ParamSelect.prototype.setOptions = function ( value ) {

	this.select.setOptions( value );

};


// Texture 

UI.Texture = function ( position ) {

  UI.Element.call( this );

	var scope = this;

	var image = new Image();
	this.texture = null;

	this.dom = document.createElement( 'input' );
	this.dom.type = 'file';
	this.dom.style.position = position || 'relative';

	this.onChangeCallback = null;

	this.dom.addEventListener( 'change', function ( event ) {

		var file = event.target.files[ 0 ];

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					scope.texture = new THREE.Texture( this );
					scope.texture.needsUpdate = true;

					// remember the original filename (including extension)
					// this is used for url field in the scene export

					scope.texture.sourceFile = file.name;

					// generate unique name per texture
					// based on source file name

					var chunks = file.name.split( '.' );
					var extension = chunks.pop().toLowerCase();
					var filename = chunks.join( '.' );

					if ( ! ( filename in scope.textureNameMap ) ) {

						scope.textureNameMap[ filename ] = true;
						scope.texture.name = filename;

					} else {

						scope.texture.name = filename + "_" + scope.texture.id;

					}

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

UI.Texture.prototype.textureNameMap = {};

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

// Json

UI.ParamJson = function ( name ) {

  UI.Panel.call( this );

	var scope = this;

	var row = new UI.Panel();

	this.name = new UI.Text( name ).setWidth( '90px' ).setColor( '#666' );
	this.json = new UI.TextArea().setWidth( '150px' ).setHeight( '40px' ).setColor( '#444' ).setFontSize( '12px' );
	this.json.dom.name = name;
	this.json.onKeyUp( function () {
		try {
			JSON.parse( scope.json.getValue() );
			scope.json.setBorderColor( '#ccc' );
			scope.json.setBackgroundColor( '' );
		} catch ( error ) {
			scope.json.setBorderColor( '#f00' );
			scope.json.setBackgroundColor( 'rgba(255,0,0,0.25)' );
		}
	} );
	
	row.add( this.name, this.json );
	this.add( row );

	return this;

};

UI.ParamJson.prototype = Object.create( UI.Panel.prototype );

UI.ParamJson.prototype.setValue = function ( value ) {

	this.json.setValue( value );

};


UI.ParamJson.prototype.getValue = function () {

	return this.json.getValue();

};

