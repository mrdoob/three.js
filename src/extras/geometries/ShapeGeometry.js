/**
 * @author jonobr1 / http://jonobr1.com
 *
 * Creates a one-sided polygonal geometry from a path shape. Similar to
 * ExtrudeGeometry.
 *
 * parameters = {
 *
 *  curveSegments: <int>, // number of points on the curves. NOT USED AT THE MOMENT.
 *
 *  material: <int> // material index for front and back faces
 *  uvGenerator: <Object> // object that provides UV generator functions
 *
 * }
 **/

(function() {

  THREE.ShapeGeometry = function( _shapes, options ) {

    THREE.Geometry.call( this );

    var shapes = _shapes instanceof Array ? _shapes : [ _shapes ];

    this.shapebb = shapes[ shapes.length - 1 ].getBoundingBox();

    this.addShapeList( shapes, options );

    this.computeCentroids();
    this.computeFaceNormals();

  };

  /**
   * Extends THREE.Geometry
   */
  THREE.ShapeGeometry.prototype = Object.create( THREE.Geometry.prototype );

  /**
   * Add an array of shapes to THREE.ShapeGeometry.
   */
  THREE.ShapeGeometry.prototype.addShapeList = function( shapes, options ) {

    for ( var i = 0, l = shapes.length; i < l; i++ ) {

      var shape = shapes[ i ];
      this.addShape( shape, options );

    }

    return this;

  };

  /**
   * Adds a shape to THREE.ShapeGeometry, based on THREE.ExtrudeGeometry.
   */
  THREE.ShapeGeometry.prototype.addShape = function( shape, _options ) {

    var options = isUndefined( _options ) ? {} : _options;

    // TODO: This exists in THREE.ExtrudeGeometry, but not really used.
    // var curveSegments = isNumber( options.curveSegments ) ? options.curveSegments : 12;

    var material = options.material;
    var uvgen = isUndefined( options.UVGenerator ) ? THREE.ExtrudeGeometry.WorldUVGenerator : options.UVGenerator;

    var shapebb = this.shapebb;

    // Variable initialization

    var scope = this,
      i, l, hole, s; // Iterable variables

    var shapesOffset = this.vertices.length;
    var shapePoints = shape.extractPoints();

    var vertices = shapePoints.shape;
    var holes = shapePoints.holes;

    var reverse = !THREE.Shape.Utils.isClockWise( vertices );

    if ( reverse ) {

      vertices = vertices.reverse();

      // Maybe we should also check if holes are in the opposite direction, just to be safe...

      for ( i = 0, l = holes.length; i < l; i++ ) {

        hole = holes[ i ];

        if ( THREE.Shape.Utils.isClockWise( hole ) ) {

          holes[ i ] = hole.reverse();

        }

      }

      reverse = false;

    }

    var faces = THREE.Shape.Utils.triangulateShape( vertices, holes );

    // Vertices

    var contour = vertices;

    for ( i = 0, l = holes.length; i < l; i++ ) {

      hole = holes[ i ];
      vertices = vertices.concat( hole );

    }

    // Variable initialization round 2

    var vert, vlen = vertices.length,
        face, flen = faces.length,
        cont, clen = contour.length;

    /* Vertices */

    // Make sure there is a z-depth, usually not the case
    // when converting from THREE.Shape

    for ( i = 0; i < vlen; i++ ) {

      vert = vertices[ i ];
      v( vert.x, vert.y, 0 );

    }

    /* Faces */

    for ( i = 0; i < flen; i++ ) {

      face = faces[ i ];
      f3( face[ 2 ], face[ 1 ], face[ 0 ] );

    }

    /**
     * Utility functions for addShape method
     */

    function v( x, y, z ) {

      scope.vertices.push( new THREE.Vector3( x, y, z ) );

    }

    function f3( a, b, c ) {

      a += shapesOffset;
      b += shapesOffset;
      c += shapesOffset;

      scope.faces.push( new THREE.Face3( a, b, c, null, null, material ) );
      var uvs = uvgen.generateBottomUV( scope, shape, options, a, b, c );

      scope.faceVertexUvs[ 0 ].push( uvs );

    }

  };

  /**
   * A few utility functions.
   */

  function isNumber(o) {
    return toString.call(o) == '[object Number]';
  }

  function isUndefined(o) {
    return o === void 0;
  }

})();
