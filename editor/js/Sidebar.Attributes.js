Sidebar.Attributes = function ( signals ) {

  var scope = this;
  var object;
  var param = {};

  var primaryParams = [
    'name',
    'parent',
    'geometry',
    'material',
    'position',
    'rotation',
    'scale',
    'width',
    'height',
    'depth',
    'widthSegments',
    'heightSegments',
    'depthSegments',
    'radialSegments',
    'tubularSegments',
    'radius',
    'radiusTop',
    'radiusBottom',
    'phiStart',
    'phiLength',
    'thetaStart',
    'thetaLength',
    'tube',
    'arc',
    'detail',
    'p',
    'q',
    'heightScale',
    'openEnded',
    'color',
    'groundColor',
    'ambient',
    'emissive',
    'specular',
    'reflectivity',
    'shininess',
    'intensity',
    'opacity',
    'transparent',
    'metal',
    'wireframe',
    'visible',
    'userData'
  ];
  
  var secondaryParams = [
    'castShadow',
    'receiveShadow',
    'useQuaternion',
    'fog',
    'depthTest',
    'depthWrite',
    'dynamic'
  ];

  var integerParams = [
    'widthSegments',
    'heightSegments',
    'depthSegments',
    'radialSegments',
    'tubularSegments'
  ];

  var container = new UI.Panel();

  var group1 = new UI.Panel().setBorderTop( '1px solid #ccc' ).setPadding( '10px' );
  var group2 = new UI.Panel().setBorderTop( '1px solid #ccc' ).setPadding( '10px' ).setOpacity( 0.5 );
  var group3 = new UI.Panel().setBorderTop( '1px solid #ccc' ).setPadding( '10px' ).setOpacity( 0.25 );//.setDisplay( 'none' ); 

  container.add( group1, group2, group3 );

  signals.objectChanged.add( function ( changed ) {
      
    if ( object === changed ) updateUI();

  } );

  signals.selected.add( function ( selected ) {
      
    var selected = editor.listSelected();
    object = ( selected.length ) ? selected[0] : null;

    createUI();
    updateUI();

  } );

  function createUI() {

    param = {};

    while ( group1.dom.hasChildNodes() ) group1.dom.removeChild( group1.dom.lastChild );
    while ( group2.dom.hasChildNodes() ) group2.dom.removeChild( group2.dom.lastChild );
    while ( group3.dom.hasChildNodes() ) group3.dom.removeChild( group3.dom.lastChild );

    if ( object ) {

      for ( var i in primaryParams ) addElement( primaryParams[i], group1 );

      for ( var i in secondaryParams ) addElement( secondaryParams[i], group2 );

      for ( var key in object ) addElement( key, group3 );

    }


  }

  function addElement( key, parent ) {

    if ( object[ key ] !== undefined && param[ key ] === undefined ) {

      if ( typeof object[ key ] === 'string' ) {

        param[ key ] = new UI.ParamString( key ).onChange( updateParam );
        parent.add( param[ key ] );

      } else if ( typeof object[ key ] === 'boolean' ) {

        param[ key ] = new UI.ParamBool( key ).onChange( updateParam );
        parent.add( param[ key ] );

      } else if ( typeof object[ key ] === 'number' ) {

        if ( integerParams.indexOf( key ) != -1 )
          param[ key ] = new UI.ParamInteger( key ).onChange( updateParam );

        else
          param[ key ] = new UI.ParamFloat( key ).onChange( updateParam );
        
        parent.add( param[ key ] );

      } else if ( object[ key ] instanceof THREE.Vector3 ) {

        var hasLock = ( key === 'scale' ) ? true : false;
        param[ key ] = new UI.ParamVector3( key, hasLock ).onChange( updateParam );
        parent.add( param[ key ] );

      } else if ( object[ key ] instanceof THREE.Color ) {

        param[ key ] = new UI.ParamColor( key ).onChange( updateParam );
        parent.add( param[ key ] );

      } else if ( key === 'parent' ) {

        param[ key ] = new UI.ParamSelect( key ).onChange( updateParam );
        param[ key ].name.setColor( '#0080f0' ).onClick( function(){  editor.select( editor.objects[ param[ key ].getValue() ] ) } );
        parent.add( param[ key ] );

      } else if ( key === 'geometry' ) {

        param[ key ] = new UI.ParamSelect( key ).onChange( updateParam );
        param[ key ].name.setColor( '#0080f0' ).onClick( function(){  editor.select( editor.geometries[ param[ key ].getValue() ] ) } );
        parent.add( param[ key ] );

      } else if ( key == 'material' ) {

        param[ key ] = new UI.ParamSelect( key ).onChange( updateParam );
        param[ key ].name.setColor( '#0080f0' ).onClick( function(){  editor.select( editor.materials[ param[ key ].getValue() ] ) } );
        parent.add( param[ key ] );

      } else if ( key == 'userData' ) {

        param[ key ] = new UI.ParamJson( key ).onChange( updateParam );
        parent.add( param[ key ] );

      }

    }
         
  }

  function updateUI() {

    if ( object ) {

      for ( var key in object ) {

        if ( typeof object[ key ] === 'string' ) param[ key ].setValue( object[ key ] );

        else if ( typeof object[ key ] === 'boolean' ) param[ key ].setValue( object[ key ] );

        else if ( typeof object[ key ] === 'number' ) param[ key ].setValue( object[ key ] );

        else if ( object[ key ] instanceof THREE.Vector3 ) param[ key ].setValue( object[ key ] );

        else if ( object[ key ] instanceof THREE.Color ) param[ key ].setValue( object[ key ] );

        else if ( object[ key ] && key === 'parent' ) {

          var options = {};
          for ( var id in editor.objects ) if ( object.id != id ) options[ id ] = editor.objects[ id ].name;
          param[ key ].setOptions( options );
          if ( object.parent !== undefined ) param[ key ].setValue( object.parent.id );

        } else if ( object[ key ] && key === 'geometry' ) {

          var options = {};
          for ( var id in editor.geometries ) if ( object.id != id ) options[ id ] = editor.geometries[ id ].name;
          param[ key ].setOptions( options );
          if ( object.geometry !== undefined ) param[ key ].setValue( object.geometry.id );

        } else if ( object[ key ] && key === 'material' ) {

          var options = {};
          for ( var id in editor.materials ) if ( object.id != id ) options[ id ] = editor.materials[ id ].name;
          param[ key ].setOptions( options );
          if ( object.material !== undefined ) param[ key ].setValue( object.material.id );

        } else if ( key == 'userData' ) {

          try {

            param[ key ].setValue( JSON.stringify( object.userData, null, '  ' ) );

          } catch ( error ) {

            console.log( error );

          }

        }

      }

    }

  }

  function updateParam( event ) {

    var key = event.srcElement.name;

    if ( typeof object[ key ] === 'string' ) object[ key ] = param[ key ].getValue();

    else if ( typeof object[ key ] === 'boolean' ) object[ key ] = param[ key ].getValue();

    else if ( typeof object[ key ] === 'number' ) object[ key ] = param[ key ].getValue();

    else if ( object[ key ] instanceof THREE.Color ) object[ key ].setHex( param[ key ].getValue() );

    else if ( object[ key ] instanceof THREE.Vector3 ) object[ key ].copy( param[ key ].getValue() );

    else if ( key === 'parent' ) {

      if ( param[ key ].getValue() != object.id )
        editor.parent( object, editor.objects[ param[ key ].getValue() ] );

    } else if ( key === 'geometry' ) {

      if ( param[ key ].getValue() != object.geometry.id )
        object.geometry = editor.geometries[ param[ key ].getValue() ];

    } else if ( key === 'material' ) {

      if ( param[ key ].getValue() != object.material.id )
        object.material = editor.materials[ param[ key ].getValue() ];

    } else if ( key === 'userData' ) {

      try {

        object.userData = JSON.parse( param[ key ].getValue() );

      } catch ( error ) {

        console.log( error );

      }

    }

    if ( object instanceof THREE.Object3D ) {

      signals.objectChanged.dispatch( object );

    } else if ( object instanceof THREE.Geometry ) {

      var geoParams = {};
      for ( var i in param ) geoParams[ i ] = param[ i ].getValue();
      editor.updateGeometry( object, geoParams );

    } else if ( object instanceof THREE.Material ) {

      signals.materialChanged.dispatch( object );

    }

    signals.sceneChanged.dispatch( editor.scene );

  }

  return container;

}
