Sidebar.Attributes = function ( signals ) {

	var scope = this;
	var model;
	var param = {};

	var primaryParams = [ 'name', 'parent', 'geometry', 'material', 'position', 'rotation', 'scale', 'width', 'height', 'depth',
	'widthSegments', 'heightSegments', 'depthSegments', 'radialSegments', 'tubularSegments', 'radius', 'radiusTop', 'radiusBottom',
	'phiStart', 'phiLength', 'thetaStart', 'thetaLength', 'tube', 'arc', 'detail', 'p', 'q', 'heightScale', 'openEnded',
	'image', 'sourceFile', 'wrapS', 'wrapT', 'minFilter', 'magFilter', 'format', 'repeat', 'offset', 'flipY', 'type', 'color',
	'groundColor', 'ambient', 'emissive', 'specular', 'reflectivity', 'shininess', 'intensity', 'opacity', 'transparent', 'metal',
	'wireframe', 'wireframeLinewidth', 'linewidth', 'visible', 'fog', 'near', 'far', 'exponent', 'map', 'lightMap', 'bumpMap',
	'normalMap', 'specularMap', 'envMap', 'normalScale', 'bumpScale', 'userData' ];

	var secondaryParams = [ 'quaternion', 'up', 'distance', 'castShadow', 'receiveShadow', 'useQuaternion', 'depthTest', 'depthWrite',
	'dynamic', 'children', 'elements', 'vertices', 'normals', 'colors', 'faces', 'faceUvs', 'faceVertexUvs', 'boundingBox',
	'boundingSphere', 'verticesNeedUpdate', 'elementsNeedUpdate', 'uvsNeedUpdate', 'normalsNeedUpdate', 'tangentsNeedUpdate',
	'colorsNeedUpdate', 'lineDistancesNeedUpdate', 'buffersNeedUpdate', 'matrix', 'matrixWorld', 'blending', 'side', 'blendSrc',
	'blendDst', 'blendEquation', 'generateMipmaps', 'premultiplyAlpha', 'needsUpdate', 'anisothropy' ];

	var integerParams = [ 'widthSegments', 'heightSegments', 'depthSegments', 'radialSegments', 'tubularSegments' ];

	var textureParams = [ 'map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap', 'envMap' ];

	var multiOptions = {
		'blending': {
			'NoBlending': THREE.NoBlending,
			'NormalBlending': THREE.NormalBlending,
			'AdditiveBlending': THREE.AdditiveBlending,
			'SubtractiveBlending': THREE.SubtractiveBlending,
			'MultiplyBlending': THREE.MultiplyBlending,
			'CustomBlending': THREE.CustomBlending
		}
		,
		'side': {
			'FrontSide': THREE.FrontSide,
			'BackSide': THREE.BackSide,
			'DoubleSide': THREE.DoubleSide
		},
		'blendSrc': {
			'ZeroFactor': THREE.ZeroFactor,
			'OneFactor': THREE.OneFactor,
			'SrcAlphaFactor': THREE.SrcAlphaFactor,
			'OneMinusSrcAlphaFactor': THREE.OneMinusSrcAlphaFactor,
			'DstAlphaFactor': THREE.DstAlphaFactor,
			'OneMinusDstAlphaFactor': THREE.OneMinusDstAlphaFactor,			
			'DstColorFactor': THREE.DstColorFactor,
			'OneMinusDstColorFactor': THREE.OneMinusDstColorFactor,
			'SrcAlphaSaturateFactor': THREE.SrcAlphaSaturateFactor
		},
		'blendDst': {
			'ZeroFactor': THREE.ZeroFactor,
			'OneFactor': THREE.OneFactor,
			'SrcColorFactor': THREE.SrcColorFactor,
			'OneMinusSrcColorFactor': THREE.OneMinusSrcColorFactor,
			'SrcAlphaFactor': THREE.SrcAlphaFactor,
			'OneMinusSrcAlphaFactor': THREE.OneMinusSrcAlphaFactor,
			'DstAlphaFactor': THREE.DstAlphaFactor,
			'OneMinusDstAlphaFactor': THREE.OneMinusDstAlphaFactor
		},
		'blendEquation': {
			'AddEquation': THREE.AddEquation,
			'SubtractEquation': THREE.SubtractEquation,
			'ReverseSubtractEquation': THREE.ReverseSubtractEquation
		},
		'wrapS': {
			'RepeatWrapping': THREE.RepeatWrapping,
			'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
			'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
		},
		'wrapT': {
			'RepeatWrapping': THREE.RepeatWrapping,
			'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
			'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
		},
		'magFilter': {
			'NearestFilter': THREE.NearestFilter,
			'NearestMipMapNearestFilter': THREE.NearestMipMapNearestFilter,
			'NearestMipMapLinearFilter': THREE.NearestMipMapLinearFilter,
			'LinearFilter': THREE.LinearFilter,
			'LinearMipMapNearestFilter': THREE.LinearMipMapNearestFilter,
			'LinearMipMapLinearFilter': THREE.LinearMipMapLinearFilter,
		},
		'minFilter': {
			'NearestFilter': THREE.NearestFilter,
			'NearestMipMapNearestFilter': THREE.NearestMipMapNearestFilter,
			'NearestMipMapLinearFilter': THREE.NearestMipMapLinearFilter,
			'LinearFilter': THREE.LinearFilter,
			'LinearMipMapNearestFilter': THREE.LinearMipMapNearestFilter,
			'LinearMipMapLinearFilter': THREE.LinearMipMapLinearFilter,
		},
		'type': {
			'UnsignedByteType': THREE.UnsignedByteType,
			'ByteType': THREE.ByteType,
			'ShortType': THREE.ShortType,
			'UnsignedShortType': THREE.UnsignedShortType,
			'IntType': THREE.IntType,
			'UnsignedIntType': THREE.UnsignedIntType,
			'FloatType': THREE.FloatType
		},
		'format': {
			'AlphaFormat': THREE.AlphaFormat,
			'RGBFormat': THREE.RGBFormat,
			'RGBAFormat': THREE.RGBAFormat,
			'LuminanceFormat': THREE.LuminanceFormat,
			'LuminanceAlphaFormat': THREE.LuminanceAlphaFormat,
			'RGB_S3TC_DXT1_Format': THREE.RGB_S3TC_DXT1_Format,
			'RGBA_S3TC_DXT1_Format': THREE.RGBA_S3TC_DXT1_Format,
			'RGBA_S3TC_DXT3_Format': THREE.RGBA_S3TC_DXT3_Format,
			'RGBA_S3TC_DXT5_Format': THREE.RGBA_S3TC_DXT5_Format,
			'RGB_PVRTC_4BPPV1_Format': THREE.RGB_PVRTC_4BPPV1_Format,
			'RGB_PVRTC_2BPPV1_Format': THREE.RGB_PVRTC_2BPPV1_Format,
			'RGBA_PVRTC_4BPPV1_Format': THREE.RGBA_PVRTC_4BPPV1_Format,
			'RGBA_PVRTC_2BPPV1_Format': THREE.RGBA_PVRTC_2BPPV1_Format,
		}
	}

	var container = new UI.Panel();

	var group1 = new UI.Panel().setBorderTop( '1px solid #ccc' ).setPadding( '10px' ).setBackgroundColor( '#ddd' ); // Primary parameters
	var group2 = new UI.Panel().setBorderTop( '1px solid #ccc' ).setPadding( '10px' ); // Secondary params 
	var group3 = new UI.Panel().setBorderTop( '1px solid #ccc' ).setPadding( '10px' ).setBackgroundColor( '#ddd' ).setOpacity( 0.25 );//.setDisplay( 'none' ); // everything else

	container.add( group1, group2, group3 );

	signals.objectChanged.add( function ( changed ) {

		if ( model === changed ) updateUI();

	} );

	signals.selected.add( function ( selected ) {

		var selected = editor.listSelected();
		var firstSelected = ( selected.length ) ? selected[0] : null;
		createUI( firstSelected );

	} );

	function createUI( newModel ) {

		model = newModel;

		param = {};

		while ( group1.dom.hasChildNodes() ) group1.dom.removeChild( group1.dom.lastChild );
		while ( group2.dom.hasChildNodes() ) group2.dom.removeChild( group2.dom.lastChild );
		while ( group3.dom.hasChildNodes() ) group3.dom.removeChild( group3.dom.lastChild );

		if ( model ) {
			for ( var i in primaryParams ) addElement( primaryParams[i], group1 );
			for ( var i in secondaryParams ) addElement( secondaryParams[i], group2 );
			for ( var key in model ) addElement( key, group3 );
		}

		updateUI();

	}

	function addElement( key, parent ) {

		if ( model[ key ] !== undefined && param[ key ] === undefined ) {

			// Params from multiOptions

			for ( var i in multiOptions ) {
				if ( i == key ) {
					param[ key ] = new UI.ParamSelect( key ).onChange( updateParam );
					parent.add( param[ key ] );
					return;
				}
			}

			// Special params

			if ( key === 'parent' ) {

				param[ key ] = new UI.ParamSelect( key ).onChange( updateParam );
				param[ key ].name.setColor( '#0080f0' ).onClick( function(){ createUI( editor.objects[ param[ key ].getValue() ] ) } );
				parent.add( param[ key ] );
				return;

			}

			if ( key === 'geometry' ) {

				param[ key ] = new UI.ParamSelect( key ).onChange( updateParam );
				param[ key ].name.setColor( '#0080f0' ).onClick( function(){	createUI( editor.geometries[ param[ key ].getValue() ] ) } );
				parent.add( param[ key ] );
				return;

			}

			if ( key == 'material' ) {

				param[ key ] = new UI.ParamSelect( key ).onChange( updateParam );
				param[ key ].name.setColor( '#0080f0' ).onClick( function(){	createUI( editor.materials[ param[ key ].getValue() ] ) } );
				parent.add( param[ key ] );
				return;

			}

			if ( key == 'userData' ) {

				param[ key ] = new UI.ParamJson( key ).onChange( updateParam );
				parent.add( param[ key ] );
				return;

			}

			// Texture params

			for ( var i in textureParams ) {

				if ( key == textureParams[ i ] ) {

					param[ key ] = new UI.ParamSelect( key ).onChange( updateParam );
					param[ key ].name.setColor( '#0080f0' ).onClick( function(){

						var value = param[ key ].getValue();
						if ( value == 'new' ) {

							var texture = editor.createTexture();
							model[ key ] = texture;
							createUI( texture );

						} else createUI( editor.textures[ value ] )

					} );
					parent.add( param[ key ] );
					return;

				}

			}

			// Params by type

			if ( typeof model[ key ] === 'string' ) {

				param[ key ] = new UI.ParamString( key ).onChange( updateParam );
				parent.add( param[ key ] );

			} else if ( typeof model[ key ] === 'boolean' ) {

				param[ key ] = new UI.ParamBool( key ).onChange( updateParam );
				parent.add( param[ key ] );

			} else if ( typeof model[ key ] === 'number' ) {

				if ( integerParams.indexOf( key ) != -1 )
					param[ key ] = new UI.ParamInteger( key ).onChange( updateParam );

				else
					param[ key ] = new UI.ParamFloat( key ).onChange( updateParam );

				parent.add( param[ key ] );

			} else if ( model[ key ] instanceof THREE.Vector2 ) {

				param[ key ] = new UI.ParamVector2( key ).onChange( updateParam );
				parent.add( param[ key ] );

			} else if ( model[ key ] instanceof THREE.Vector3 ) {

				param[ key ] = new UI.ParamVector3( key ).onChange( updateParam );
				parent.add( param[ key ] );

			} else if ( model[ key ] instanceof THREE.Vector4 || model[ key ] instanceof THREE.Quaternion ) {

				param[ key ] = new UI.ParamVector4( key ).onChange( updateParam );
				parent.add( param[ key ] );

			} else if ( model[ key ] instanceof THREE.Color ) {

				param[ key ] = new UI.ParamColor( key ).onChange( updateParam );
				parent.add( param[ key ] );

			} else if ( model[ key ] instanceof Array ) {

				if ( model[ key ].length ) {

					param[ key ] = new UI.Text( key ).setColor( '#0080f0' ).onClick( function(){	createUI( model[ key ] ) } );
					parent.add( param[ key ], new UI.Break() );

				}

			} else if ( typeof model[ key ] !== 'function' ) {

				param[ key ] = new UI.Text( key ).setColor( '#0080f0' ).onClick( function(){	createUI( model[ key ] ) } );
				parent.add( param[ key ], new UI.Break() );

			}

		}

	}

	function updateUI() {

		if ( model ) {

			for ( var key in model ) {

				if ( param[ key ] === undefined ) continue;

				// Params from multiOptions

				for ( var i in multiOptions ) {
					if ( i == key ) {
						for ( var j in multiOptions[ i ] ) {

							var options = {};

							for ( var j in multiOptions[ i ] ) options[ multiOptions[ i ][ j ] ] = j;

							param[ key ].setOptions( options );
							param[ key ].setValue( model[ key ] );
							break;

						}
					}
				}

				// Special params

				if ( key === 'parent' ) {

					var options = {};
					for ( var id in editor.objects ) if ( model.id != id ) options[ id ] = editor.objects[ id ].name;
					param[ key ].setOptions( options );
					if ( model[ key ] !== undefined ) param[ key ].setValue( model[ key ].id );

				} else if ( key === 'geometry' ) {

					var options = {};
					for ( var id in editor.geometries ) options[ id ] = editor.geometries[ id ].name;
					param[ key ].setOptions( options );
					if ( model[ key ] !== undefined ) param[ key ].setValue( model[ key ].id );

				} else if ( key === 'material' ) {

					var options = {};
					for ( var id in editor.materials ) options[ id ] = editor.materials[ id ].name;
					param[ key ].setOptions( options );
					if ( model[ key ] !== undefined ) param[ key ].setValue( model[ key ].id );

				} else if ( key == 'userData' ) {

					try {

						param[ key ].setValue( JSON.stringify( model.userData, null, '	' ) );

					} catch ( error ) {

						console.log( error );

					}

				// Texture params

				} else if ( textureParams.indexOf( key ) != -1 ) {

					var options = {};
					options[ 'new' ] = 'New texture';
					for ( var id in editor.textures ) options[ id ] = editor.textures[ id ].name;
					param[ key ].setOptions( options );

					param[ key ].setValue( 'new' );
					if ( model[ key ] ) param[ key ].setValue( model[ key ].id );

				} 

				// Params by type

				else if ( typeof model[ key ] === 'string' ) param[ key ].setValue( model[ key ] );

				else if ( typeof model[ key ] === 'boolean' ) param[ key ].setValue( model[ key ] );

				else if ( typeof model[ key ] === 'number' ) param[ key ].setValue( model[ key ] );

				else if ( model[ key ] instanceof THREE.Vector3 ) param[ key ].setValue( model[ key ] );

				else if ( model[ key ] instanceof THREE.Color ) param[ key ].setValue( model[ key ] );

			}

		}

	}

	function updateParam( event ) {

		var key = event.srcElement.name;
		var value = ( param[ key ].getValue ) ? param[ key ].getValue() : null;

		// Special params

		if ( key === 'parent' ) editor.parent( object, editor.objects[ value ] );

		else if ( key === 'geometry' ) model[ key ] = editor.geometries[ value ];

		else if ( key === 'material' ) model[ key ] = editor.materials[ value ];

		else if ( key === 'userData' ) {

			try {
				 model[ key ] = JSON.parse( value );
			} catch ( error ) {
				console.log( error );
			}

		} else if ( textureParams.indexOf( key ) != -1 ) {

			if ( value == 'new' ) {

				var texture = editor.createTexture();
				model[ key ] = texture;
				createUI( texture );

			} else model[ key ] = editor.textures[ value ];

		}

		// Params by type

		else if ( typeof model[ key ] === 'string' ) model[ key ] = value;

		else if ( typeof model[ key ] === 'boolean' ) model[ key ] = value;

		else if ( typeof model[ key ] === 'number' ) model[ key ] = parseFloat( value );

		else if ( model[ key ] instanceof THREE.Color ) model[ key ].setHex( value );

		else if ( model[ key ] instanceof THREE.Vector3 ) model[ key ].copy( value );

		// Post actions

		if ( model instanceof THREE.Object3D ) {

			signals.objectChanged.dispatch( model );

		} else if ( model instanceof THREE.Geometry ) {

			var geoParams = {};
			for ( var i in param )
				if ( param[ i ].getValue ) geoParams[ i ] = param[ i ].getValue();
			editor.updateGeometry( model, geoParams );

		} else if ( model instanceof THREE.Material ) {

			signals.materialChanged.dispatch( model );

		}

		signals.sceneChanged.dispatch( editor.scene );

	}

	return container;

}
