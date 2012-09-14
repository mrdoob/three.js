/**
 * @author jonobr1 / http://jonobr1.com
 *
 * Creates a one-sided polygonal geometry from a path shape. Similar to 
 * ExtrudeGeometry.
 *
 * parameters = {
 *
 *  size: <float>, // size of the text
 *  height: <float>, // thickness to extrude text
 *  curveSegments: <int>, // number of points on the curves
 *  steps: <int>, // number of points for z-side extrusions / used for subdividing segements of extrude spline too
 *  amount: <int>, // Amount
 *
 *  bevelEnabled: <bool>, // turn on bevel
 *  bevelThickness: <float>, // how deep into text bevel goes
 *  bevelSize: <float>, // how far from text outline is bevel
 *  bevelSegments: <int>, // number of bevel layers
 *
 *  extrudePath: <THREE.CurvePath> // 3d spline path to extrude shape along. (creates Frames if .frames aren't defined)
 *  frames: <THREE.TubeGeometry.FrenetFrames> // containing arrays of tangents, normals, binormals
 *
 *  material: <int> // material index for front and back faces
 *  extrudeMaterial: <int> // material index for extrusion and beveled faces
 *  uvGenerator: <Object> // object that provides UV generator functions
 *
 * }
 **/

(function() {

  THREE.ShapeGeometry = function( shapes, options ) {

    THREE.Geometry.call( this );

    var shapes = shapes instanceof Array ? shapes : [shapes];

    this.shapebb = shapes[ shapes.length - 1 ].getBoundingBox();

  	this.addShapeList( shapes, options );

  	this.computeCentroids();
  	this.computeFaceNormals();

  };

  /**
   * Extends THREE.Geometry
   */
  THREE.ExtrudeGeometry.prototype = Object.create( THREE.Geometry.prototype );

  THREE.ShapeGeometry.prototype = {

    addShapeList: function( shapes, options ) {

      for ( var i = 0, l = shapes.length; i < l; i++ ) {

        var shape = shape[ i ];
        this.addShape( shape, options );

      }

      return this;

    },

    addShape: function( shape, options ) {

      var curveSegments = isNumber( options.curveSegments ) ? options.curveSegments : 12;
      var steps = isNumber( options.steps ) ? options.steps : 1;

      var material = options.material;
      var uvgen = isUndefined( options.UVGenerator ) ? options.UVGenerator : THREE.ExtrudeGeometry.WorldUVGenerator;

      var shapebb = this.shapebb;

      // Variable initialization

      var scope = this;

      var shapesOffset = this.vertices.length;
      var shapePoints = shape.extractPoints();

      var vertices = shapePoints.shape;
      var holes = shapePoints.holes;

      var reverse = !THREE.ShapeUtils.isClockWise( vertices );

      if ( reverse ) {

        vertices = vertices.reverse();

        // Maybe we should also check if holes are in the opposite direction, just to be safe...

        for ( var i = 0, l = holes.length; i < l; i++ ) {

          var hole = holes[ i ];

          if ( THREE.Shape.Utils.isClockWise( hole ) ) {

            holes[ i ] = hole.reverse();

          }

        }

        reverse = false;

      }

      var faces = THREE.Shape.Utils.triangulateShape( vertices, holes );

      // Vertices

      var contour = vertices;

      for ( var i = 0, l = holes.length; i < l; i++ ) {

        var hole = holes[ i ];
        vertices = vertices.concat( hole );

      }

      

    }

  };

  /**
   * A few utility functions.
   */

  function isNumber(o) {
    return toString.call(o) == '[object Number]'
  }

  function isUndefined(o) {
    return obj === void 0;
  }

})();