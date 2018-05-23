/**
 * @author arodic / https://github.com/arodic
 */

THREE.TransformControlsGizmo = function () {

  'use strict';

  THREE.Object3D.call( this );

	this.type = 'TransformControlsGizmo';

  // shared materials

  var gizmoMaterial = new THREE.MeshBasicMaterial({
    depthTest: false,
    depthWrite: false,
    transparent: true,
    side: THREE.DoubleSide,
    fog: false
  });

  var gizmoLineMaterial = new THREE.LineBasicMaterial({
    depthTest: false,
    depthWrite: false,
    transparent: true,
    linewidth: 1,
    fog: false
  });

  var matInvisible = gizmoMaterial.clone();
  matInvisible.opacity = 0.15;

  var matRed = gizmoMaterial.clone();
  matRed.color.set(0xff0000);

  var matGreen = gizmoMaterial.clone();
  matGreen.color.set(0x00ff00);

  var matBlue = gizmoMaterial.clone();
  matBlue.color.set(0x0000ff);

  var matWhiteTransperent = gizmoMaterial.clone();
  matWhiteTransperent.opacity = 0.25;

  var matYellowTransparent = matWhiteTransperent.clone();
  matYellowTransparent.color.set(0xffff00);

  var matCyanTransparent = matWhiteTransperent.clone();
  matCyanTransparent.color.set(0x00ffff);

  var matMagentaTransparent = matWhiteTransperent.clone();
  matMagentaTransparent.color.set(0xff00ff);

  var matYellow = gizmoMaterial.clone();
  matYellow.color.set(0xffff00);

  var matLineRed = gizmoLineMaterial.clone();
  matLineRed.color.set(0xff0000);

  var matLineGreen = gizmoLineMaterial.clone();
  matLineGreen.color.set(0x00ff00);

  var matLineBlue = gizmoLineMaterial.clone();
  matLineBlue.color.set(0x0000ff);

  var matLineCyan = gizmoLineMaterial.clone();
  matLineCyan.color.set(0x00ffff);

  var matLineMagenta = gizmoLineMaterial.clone();
  matLineMagenta.color.set(0xff00ff);

  var matLineBlue = gizmoLineMaterial.clone();
  matLineBlue.color.set(0x0000ff);

  var matLineYellow = gizmoLineMaterial.clone();
  matLineYellow.color.set(0xffff00);

  var matLineGray = gizmoLineMaterial.clone();
  matLineGray.color.set(0x787878);

  var matLineYellowTransparent = matLineYellow.clone();
  matLineYellowTransparent.opacity = 0.25;

  // shared objects

  var arrowGeometry = new THREE.CylinderGeometry( 0, 0.05, 0.2, 12, 1, false);

  var scaleHandleGeometry = new THREE.BoxGeometry( 0.125, 0.125, 0.125);

  var lineGeometry = new THREE.BufferGeometry( );
  lineGeometry.addAttribute('position', new THREE.Float32BufferAttribute([ 0, 0, 0,  1, 0, 0 ], 3));

  var CircleGeometry = function(radius, arc) {
    var geometry = new THREE.BufferGeometry( );
    var vertices = [];
    for (var i = 0; i <= 64 * arc; ++i) {
      vertices.push(0, Math.cos(i / 32 * Math.PI) * radius, Math.sin(i / 32 * Math.PI) * radius);
    }
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  };

  // gizmos

  var gizmoTranslate = {
    X: [
      [ new THREE.Mesh( arrowGeometry, matRed ), [ 1, 0, 0 ], [ 0, 0, -Math.PI / 2 ], null, 'fwd' ],
      [ new THREE.Mesh( arrowGeometry, matRed ), [ 1, 0, 0 ], [ 0, 0, Math.PI / 2 ], null, 'bwd' ],
      [ new THREE.Line( lineGeometry, matLineRed ) ]
    ],
    Y: [
      [ new THREE.Mesh( arrowGeometry, matGreen ), [ 0, 1, 0 ], null, null, 'fwd' ],
      [ new THREE.Mesh( arrowGeometry, matGreen ), [ 0, 1, 0 ], [ Math.PI, 0, 0 ], null, 'bwd' ],
      [ new THREE.Line( lineGeometry, matLineGreen ), null, [ 0, 0, Math.PI / 2 ] ]
    ],
    Z: [
      [ new THREE.Mesh( arrowGeometry, matBlue ), [ 0, 0, 1 ], [ Math.PI / 2, 0, 0 ], null, 'fwd' ],
      [ new THREE.Mesh( arrowGeometry, matBlue ), [ 0, 0, 1 ], [ -Math.PI / 2, 0, 0 ], null, 'bwd' ],
      [ new THREE.Line( lineGeometry, matLineBlue ), null, [ 0, -Math.PI / 2, 0 ] ]
    ],
    XYZ: [
      [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), matWhiteTransperent ), [ 0, 0, 0 ], [ 0, 0, 0 ] ]
    ],
    XY: [
      [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.295, 0.295 ), matYellowTransparent ), [ 0.15, 0.15, 0 ] ],
      [ new THREE.Line( lineGeometry, matLineYellow ), [ 0.18, 0.3, 0 ], null, [ 0.125, 1, 1 ] ],
      [ new THREE.Line( lineGeometry, matLineYellow ), [ 0.3, 0.18, 0 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ] ]
    ],
    YZ: [
      [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.295, 0.295 ), matCyanTransparent ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ] ],
      [ new THREE.Line( lineGeometry, matLineCyan ), [ 0, 0.18, 0.3 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ] ],
      [ new THREE.Line( lineGeometry, matLineCyan ), [ 0, 0.3, 0.18 ], [ 0, -Math.PI / 2, 0 ], [ 0.125, 1, 1 ] ]
    ],
    XZ: [
      [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.295, 0.295 ), matMagentaTransparent ), [ 0.15, 0, 0.15 ], [ -Math.PI / 2, 0, 0 ] ],
      [ new THREE.Line( lineGeometry, matLineMagenta ), [ 0.18, 0, 0.3 ], null, [ 0.125, 1, 1 ] ],
      [ new THREE.Line( lineGeometry, matLineMagenta ), [ 0.3, 0, 0.18 ], [ 0, -Math.PI / 2, 0 ], [ 0.125, 1, 1 ] ]
    ]
  };

  var pickerTranslate = {
    X: [
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0.6, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ]
    ],
    Y: [
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0, 0.6, 0 ] ]
    ],
    Z: [
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
    ],
    XYZ: [
      [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.2, 0 ), matInvisible ) ]
    ],
    XY: [
      [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0.2, 0.2, 0 ] ]
    ],
    YZ: [
      [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
    ],
    XZ: [
      [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0.2, 0, 0.2 ], [ -Math.PI / 2, 0, 0 ] ]
    ]
  };

  var gizmoRotate = {
    X: [
      [ new THREE.Line( new CircleGeometry( 1, 0.5 ), matLineRed ) ],
      [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.04, 0 ), matRed ), [ 0, 0, 0.99 ], null, [ 1, 3, 1 ], 'linear' ],
      [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.03, 0 ), matRed ), [ 0, 0, 1 ], null, [ 4, 1, 4 ], 'radial' ],
    ],
    Y: [
      [ new THREE.Line( new CircleGeometry( 1, 0.5 ), matLineGreen ), null, [ 0, 0, -Math.PI / 2 ] ],
      [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.04, 0 ), matGreen ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ], 'linear' ],
      [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.03, 0 ), matGreen ), [ 0, 0, 1 ], null, [ 1, 4, 4 ], 'radial' ],
    ],
    Z: [
      [ new THREE.Line( new CircleGeometry( 1, 0.5 ), matLineBlue ), null, [ 0, Math.PI / 2, 0 ] ],
      [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.04, 0 ), matBlue ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ], 'linear' ],
      [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.03, 0 ), matBlue ), [ 1, 0, 0 ], null, [ 4, 1, 4 ], 'radial' ],
    ],
    E: [
      [ new THREE.Line( new CircleGeometry( 1.25, 1 ), matLineYellowTransparent ), null, [ 0, Math.PI / 2, 0 ] ],
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ 1.17, 0, 0 ], [ 0, 0, -Math.PI / 2 ], [ 1, 1, 0.001 ]],
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ -1.17, 0, 0 ], [ 0, 0, Math.PI / 2 ], [ 1, 1, 0.001 ]],
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ 0, -1.17, 0 ], [ Math.PI, 0, 0 ], [ 1, 1, 0.001 ]],
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ 0, 1.17, 0 ], [ 0, 0, 0 ], [ 1, 1, 0.001 ]],
    ],
    XYZE: [
      [ new THREE.Line( new CircleGeometry( 0.99, 1 ), matLineGray ), null, [ 0, Math.PI / 2, 0 ] ]
    ]
  };

  var pickerRotate = {
    X: [
      [ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, -Math.PI / 2, -Math.PI / 2 ] ],
    ],
    Y: [
      [ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ],
    ],
    Z: [
      [ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ],
    ],
    E: [
      [ new THREE.Mesh( new THREE.TorusGeometry( 1.25, 0.1, 2, 24 ), matInvisible ) ]
    ],
    XYZE: [
      [ new THREE.Mesh( new THREE.SphereGeometry( 0.7, 10, 8 ), matInvisible ) ]
    ]
  };

  var gizmoScale = {
    X: [
      [ new THREE.Mesh( scaleHandleGeometry, matRed ), [ 0.8, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ],
      [ new THREE.Line( lineGeometry, matLineRed ), null, null, [ 0.8, 1, 1 ] ]
    ],
    Y: [
      [ new THREE.Mesh( scaleHandleGeometry, matGreen ), [ 0, 0.8, 0 ] ],
      [ new THREE.Line( lineGeometry, matLineGreen ), null, [ 0, 0, Math.PI / 2 ], [ 0.8, 1, 1 ] ]
    ],
    Z: [
      [ new THREE.Mesh( scaleHandleGeometry, matBlue ), [ 0, 0, 0.8 ], [ Math.PI / 2, 0, 0 ] ],
      [ new THREE.Line( lineGeometry, matLineBlue ), null, [ 0, -Math.PI / 2, 0 ], [ 0.8, 1, 1 ] ]
    ],
    XY: [
      [ new THREE.Mesh( scaleHandleGeometry, matYellowTransparent ), [ 0.85, 0.85, 0 ], null, [ 2, 2, 0.2 ] ],
      [ new THREE.Line( lineGeometry, matLineYellow ), [ 0.855, 0.98, 0 ], null, [ 0.125, 1, 1 ] ],
      [ new THREE.Line( lineGeometry, matLineYellow ), [ 0.98, 0.855, 0 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ] ]
    ],
    YZ: [
      [ new THREE.Mesh( scaleHandleGeometry, matCyanTransparent ), [ 0, 0.85, 0.85 ], null, [ 0.2, 2, 2 ] ],
      [ new THREE.Line( lineGeometry, matLineCyan ), [ 0, 0.855, 0.98 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ] ],
      [ new THREE.Line( lineGeometry, matLineCyan ), [ 0, 0.98, 0.855 ], [ 0, -Math.PI / 2, 0 ], [ 0.125, 1, 1 ] ]
    ],
    XZ: [
      [ new THREE.Mesh( scaleHandleGeometry, matMagentaTransparent ), [ 0.85, 0, 0.85 ], null, [ 2, 0.2, 2 ] ],
      [ new THREE.Line( lineGeometry, matLineMagenta ), [ 0.855, 0, 0.98 ], null, [ 0.125, 1, 1 ] ],
      [ new THREE.Line( lineGeometry, matLineMagenta ), [ 0.98, 0, 0.855 ], [ 0, -Math.PI / 2, 0 ], [ 0.125, 1, 1 ] ]
    ],
    XYZX: [
      [ new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ), matWhiteTransperent ), [ 1.1, 0, 0 ] ],
    ],
    XYZY: [
      [ new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ), matWhiteTransperent ), [ 0, 1.1, 0 ] ],
    ],
    XYZZ: [
      [ new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ), matWhiteTransperent ), [ 0, 0, 1.1 ] ],
    ]
  };

  var pickerScale = {
    X: [
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible ), [ 0.5, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ]
    ],
    Y: [
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible ), [ 0, 0.5, 0 ] ]
    ],
    Z: [
      [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ]
    ],
    XY: [
      [ new THREE.Mesh( scaleHandleGeometry, matInvisible ), [ 0.85, 0.85, 0 ], null, [ 3, 3, 0.2 ] ],
    ],
    YZ: [
      [ new THREE.Mesh( scaleHandleGeometry, matInvisible ), [ 0, 0.85, 0.85 ], null, [ 0.2, 3, 3 ] ],
    ],
    XZ: [
      [ new THREE.Mesh( scaleHandleGeometry, matInvisible ), [ 0.85, 0, 0.85 ], null, [ 3, 0.2, 3 ] ],
    ],
    XYZX: [
      [ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 1.1, 0, 0 ] ],
    ],
    XYZY: [
      [ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 0, 1.1, 0 ] ],
    ],
    XYZZ: [
      [ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 0, 0, 1.1 ] ],
    ]
  };

  var setupGizmo = function( gizmoMap ) {

    var gizmo = new THREE.Object3D();

    for ( var name in gizmoMap ) {

      for ( var i = gizmoMap[ name ].length; i --; ) {

        var object = gizmoMap[ name ][ i ][ 0 ].clone();
        var position = gizmoMap[ name ][ i ][ 1 ];
        var rotation = gizmoMap[ name ][ i ][ 2 ];
        var scale = gizmoMap[ name ][ i ][ 3 ];
        var tag = gizmoMap[ name ][ i ][ 4 ];

        object.name = name;
        object.tag = tag;

        if (position) {
          object.position.set(position[ 0 ], position[ 1 ], position[ 2 ]);
        }
        if (rotation) {
          object.rotation.set(rotation[ 0 ], rotation[ 1 ], rotation[ 2 ]);
        }
        if (scale) {
          object.scale.set(scale[ 0 ], scale[ 1 ], scale[ 2 ]);
        }

        object.updateMatrix();

        var tempGeometry = object.geometry.clone();
        tempGeometry.applyMatrix(object.matrix);
        object.geometry = tempGeometry;

        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);

        gizmo.add(object);

      }

    }

    return gizmo;

  };

  var vec1 = new THREE.Vector3( 0, 0, 0 );
  var tempVector = new THREE.Vector3();
  var alignVector = new THREE.Vector3( 0, 1, 0 );
  var lookAtMatrix = new THREE.Matrix4();
  var tempQuaternion = new THREE.Quaternion();
  var tempQuaternion2 = new THREE.Quaternion();
  var identityEuler = new THREE.Euler();

  var unitX = new THREE.Vector3( 1, 0, 0 );
  var unitY = new THREE.Vector3( 0, 1, 0 );
  var unitZ = new THREE.Vector3( 0, 0, 1 );

  this.gizmo = {};
	this.picker = {};

  this.add( this.gizmo[ "translate" ] = setupGizmo( gizmoTranslate ) );
  this.add( this.gizmo[ "rotate" ] = setupGizmo( gizmoRotate ) );
  this.add( this.gizmo[ "scale" ] = setupGizmo( gizmoScale ) );
  this.add( this.picker[ "translate" ] = setupGizmo( pickerTranslate ) );
  this.add( this.picker[ "rotate" ] = setupGizmo( pickerRotate ) );
  this.add( this.picker[ "scale" ] = setupGizmo( pickerScale ) );

  this.picker[ "translate" ].visible = false;
  this.picker[ "rotate" ].visible = false;
  this.picker[ "scale" ].visible = false;

  this.updateMatrixWorld = function () {

    var rotation = this.parent.space === "local" ? this.parent._worldRotation : identityEuler;
    var eye = this.parent._eye
    var mode = this.parent.mode;
    var axis = this.parent.axis;

    this.gizmo[ "translate" ].visible = mode === "translate";
    this.gizmo[ "rotate" ].visible = mode === "rotate";
    this.gizmo[ "scale" ].visible = mode === "scale";

    this.picker[ "translate" ].visible = false; // mode === "translate";
    this.picker[ "rotate" ].visible = false; // mode === "rotate";
    this.picker[ "scale" ].visible = false; // mode === "scale";

    var handles = [];
    handles = handles.concat( this.picker[ mode ].children );
    handles = handles.concat( this.gizmo[ mode ].children );

    for ( var i = 0; i < handles.length; i++ ) {

      var handle = handles[i];

      // hide aligned to camera

      handle.visible = true;
      handle.scale.set( 1, 1, 1 );
      handle.position.set( 0, 0, 0 );
      handle.rotation.set( 0, 0, 0 );

      if ( mode === 'translate' || mode === 'scale' ) {

        // Hide translate and scale axis facing the camera

        if ( handle.name === 'X' || handle.name === 'XYZX' ) {
          if ( Math.abs( alignVector.set( 1, 0, 0 ).applyEuler( rotation ).dot( eye ) ) > 0.99 ) {
            handle.scale.set( 1e-3, 1e-3, 1e-3 );
            handle.visible = false;
          }
        }
        if ( handle.name === 'Y' || handle.name === 'XYZY' ) {
          if ( Math.abs( alignVector.set( 0, 1, 0 ).applyEuler( rotation ).dot( eye ) ) > 0.99 ) {
            handle.scale.set( 1e-3, 1e-3, 1e-3 );
            handle.visible = false;
          }
        }
        if ( handle.name === 'Z' || handle.name === 'XYZZ' ) {
          if ( Math.abs( alignVector.set( 0, 0, 1 ).applyEuler( rotation ).dot( eye ) ) > 0.99 ) {
            handle.scale.set( 1e-3, 1e-3, 1e-3 );
            handle.visible = false;
          }
        }
        if ( handle.name === 'XY' ) {
          if ( Math.abs( alignVector.set( 0, 0, 1 ).applyEuler( rotation ).dot( eye ) ) < 0.2 ) {
            handle.scale.set( 1e-3, 1e-3, 1e-3 );
            handle.visible = false;
          }
        }
        if ( handle.name === 'YZ' ) {
          if ( Math.abs( alignVector.set( 1, 0, 0 ).applyEuler( rotation ).dot( eye ) ) < 0.2 ) {
            handle.scale.set( 1e-3, 1e-3, 1e-3 );
            handle.visible = false;
          }
        }
        if ( handle.name === 'XZ' ) {
          if ( Math.abs( alignVector.set( 0, 1, 0 ).applyEuler( rotation ).dot( eye ) ) < 0.2 ) {
            handle.scale.set( 1e-3, 1e-3, 1e-3 );
            handle.visible = false;
          }
        }

        // Flip translate and scale axis ocluded behind another axis

        if ( handle.name.search( 'X' ) !== -1 ) {
          if ( alignVector.set( 1, 0, 0 ).applyEuler( rotation ).dot( eye ) < -0.4 ) {
            if ( handle.tag === 'fwd' ) {
              handle.visible = false;
            } else {
              handle.scale.x = -1;
            }
          } else if ( handle.tag === 'bwd' ) {
            handle.visible = false;
          }
        }

        if ( handle.name.search( 'Y' ) !== -1 ) {
          if ( alignVector.set( 0, 1, 0 ).applyEuler( rotation ).dot( eye ) < -0.4 ) {
            if ( handle.tag === 'fwd' ) {
              handle.visible = false;
            } else {
              handle.scale.y = -1;
            }
          } else if ( handle.tag === 'bwd' ) {
            handle.visible = false;
          }
        }

        if ( handle.name.search( 'Z' ) !== -1 ) {
          if ( alignVector.set( 0, 0, 1 ).applyEuler( rotation ).dot( eye ) < -0.4 ) {
            if ( handle.tag === 'fwd' ) {
              handle.visible = false;
            } else {
              handle.scale.z = -1;
            }
          } else if ( handle.tag === 'bwd' ) {
            handle.visible = false;
          }
        }

        // Align handles to current local or world rotation

        handle.quaternion.setFromEuler( rotation );

      } else if (mode === 'rotate') {

        // switch between liner/radial rotation handle affordances

        if ( handle.name === 'X' ) {
          if ( Math.abs( alignVector.set( 1, 0, 0 ).applyEuler( rotation ).dot( eye ) ) > 0.3 ) {
            if ( handle.tag === 'linear' ) {
              handle.visible = false;
            }
          } else if ( handle.tag === 'radial' ) {
            handle.visible = false;
          }
        }

        if ( handle.name === 'Y' ) {
          if ( Math.abs( alignVector.set( 0, 1, 0 ).applyEuler( rotation ).dot( eye ) ) > 0.3 ) {
            if ( handle.tag === 'linear' ) {
              handle.visible = false;
            }
          } else if ( handle.tag === 'radial' ) {
            handle.visible = false;
          }
        }

        if ( handle.name === 'Z' ) {
          if ( Math.abs( alignVector.set( 0, 0, 1 ).applyEuler( rotation ).dot( eye ) ) > 0.3 ) {
            if ( handle.tag === 'linear' ) {
              handle.visible = false;
            }
          } else if ( handle.tag === 'radial' ) {
            handle.visible = false;
          }
        }

        // Align handles to current local or world rotation

        tempQuaternion2.setFromEuler( rotation );
        alignVector.copy( eye ).applyQuaternion( tempQuaternion.setFromEuler( rotation ).inverse());

        if ( handle.name.search( "E" ) !== - 1 ) {

          alignVector.set( 0, 1, 0 );
          handle.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, alignVector ) );

        }

        if ( handle.name === 'X' ) {

          tempQuaternion.setFromAxisAngle( unitX, Math.atan2( -alignVector.y, alignVector.z ) );
          tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
          handle.quaternion.copy( tempQuaternion );

        }

        if ( handle.name === 'Y' ) {

          tempQuaternion.setFromAxisAngle( unitY, Math.atan2( alignVector.x, alignVector.z ) );
          tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
          handle.quaternion.copy( tempQuaternion );

        }

        if ( handle.name === 'Z' ) {

          tempQuaternion.setFromAxisAngle( unitZ, Math.atan2( alignVector.y, alignVector.x ) );
          tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
          handle.quaternion.copy( tempQuaternion );

        }

      }

      // highlight selected axis

      handle.material._opacity = handle.material._opacity || handle.material.opacity;
      handle.material._color = handle.material._color || handle.material.color.clone();

      handle.material.color.copy( handle.material._color );
      handle.material.opacity = handle.material._opacity;

      if ( axis ) {

        if ( handle.name === axis ) {

          handle.material.opacity *= 2.0;
          handle.material.color.lerp( new THREE.Color( 1, 1, 1 ), 0.5 );

        } else if ( axis.split('').some( function( a ) { return handle.name === a; } ) ) {

          handle.material.opacity *= 2.0;
          handle.material.color.lerp( new THREE.Color( 1, 1, 1 ), 0.5 );

        } else {

          handle.material.opacity *= 0.15;

        }

      }

    }

		THREE.Object3D.prototype.updateMatrixWorld.call( this );

	};

  this.setMode = function() {

    console.warn( 'THREE.TransformControlsGizmo: setMode function has been depricated.' );

  };

};

THREE.TransformControlsGizmo.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

  constructor: THREE.TransformControlsGizmo,

  isTransformControlsGizmo: true

} );
