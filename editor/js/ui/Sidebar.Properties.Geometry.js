Sidebar.Properties.Geometry = function ( signals ) {

	var geometries = {

		"ConvexGeometry": THREE.ConvexGeometry,
		"CubeGeometry": THREE.CubeGeometry,
		"CylinderGeometry": THREE.CylinderGeometry,
		"ExtrudeGeometry": THREE.ExtrudeGeometry,
		"IcosahedronGeometry": THREE.IcosahedronGeometry,
		"LatheGeometry": THREE.LatheGeometry,
		"OctahedronGeometry": THREE.OctahedronGeometry,
		"ParametricGeometry": THREE.ParametricGeometry,
		"PlaneGeometry": THREE.PlaneGeometry,
		"PolyhedronGeometry": THREE.PolyhedronGeometry,
		"SphereGeometry": THREE.SphereGeometry,
		"TetrahedronGeometry": THREE.TetrahedronGeometry,
		"TextGeometry": THREE.TextGeometry,
		"TorusGeometry": THREE.TorusGeometry,
		"TorusKnotGeometry": THREE.TorusKnotGeometry,
		"TubeGeometry": THREE.TubeGeometry,
		"Geometry": THREE.Geometry

	};

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text().setValue( 'GEOMETRY' ).setColor( '#666' ) );
	container.add( new UI.Button( 'absolute' ).setRight( '0px' ).setLabel( 'Export' ).onClick( exportGeometry ) );
	container.add( new UI.Break(), new UI.Break() );

	// name

	var geometryNameRow = new UI.Panel();
	var geometryName = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	geometryNameRow.add( new UI.Text().setValue( 'Name' ).setColor( '#666' ) );
	geometryNameRow.add( geometryName );

	container.add( geometryNameRow );

	// class

	var geometryClassRow = new UI.Panel();
	var geometryClass = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	geometryClassRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Class' ).setColor( '#666' ) );
	geometryClassRow.add( geometryClass );

	container.add( geometryClassRow );

	// vertices

	var geometryVerticesRow = new UI.Panel();
	var geometryVertices = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	geometryVerticesRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Vertices' ).setColor( '#666' ) );
	geometryVerticesRow.add( geometryVertices );

	container.add( geometryVerticesRow );

	// faces

	var geometryFacesRow = new UI.Panel();
	var geometryFaces = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	geometryFacesRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Faces' ).setColor( '#666' ) );
	geometryFacesRow.add( geometryFaces );

	container.add( geometryFacesRow );

	container.add( new UI.Break(), new UI.Break(), new UI.Break() );

	//

	var selected = null;

	signals.objectSelected.add( function ( object ) {

		if ( object && object.geometry ) {

			selected = object.geometry;

			container.setDisplay( 'block' );

			geometryName.setValue( object.geometry.name );
			geometryClass.setValue( getGeometryInstanceName( object.geometry ) );
			geometryVertices.setValue( object.geometry.vertices.length );
			geometryFaces.setValue( object.geometry.faces.length );

		} else {

			selected = null;

			container.setDisplay( 'none' );

		}

	} );

	function getGeometryInstanceName( geometry ) {

		for ( var key in geometries ) {

			if ( geometry instanceof geometries[ key ] ) return key;

		}

	}

	function exportGeometry() {

		var geometry = selected;

		var vertices = [];

		for ( var i = 0; i < geometry.vertices.length; i ++ ) {

			var vertex = geometry.vertices[ i ];
			vertices.push( vertex.x, vertex.y, vertex.z );

		}

		var faces = [];
		var uvs = [[]];
		var normals = [];
		var normalsHash = {};

		for ( var i = 0; i < geometry.faces.length; i ++ ) {

			var face = geometry.faces[ i ];

			var isTriangle = face instanceof THREE.Face3;
			var hasMaterial = face.materialIndex !== undefined;
			var hasFaceUv = geometry.faceUvs[ 0 ][ i ] !== undefined;
			var hasFaceVertexUv = geometry.faceVertexUvs[ 0 ][ i ] !== undefined;
			var hasFaceNormal = face.normal.length() > 0;
			var hasFaceVertexNormal = face.vertexNormals[ 0 ] !== undefined;
			var hasFaceColor = face.color;
			var hasFaceVertexColor = face.vertexColors[ 0 ] !== undefined;

			var faceType = 0;

			faceType = setBit( faceType, 0, ! isTriangle );
			// faceType = setBit( faceType, 1, hasMaterial );
			// faceType = setBit( faceType, 2, hasFaceUv );
			// faceType = setBit( faceType, 3, hasFaceVertexUv );
			faceType = setBit( faceType, 4, hasFaceNormal );
			faceType = setBit( faceType, 5, hasFaceVertexNormal );
			// faceType = setBit( faceType, 6, hasFaceColor );
			// faceType = setBit( faceType, 7, hasFaceVertexColor );

			faces.push( faceType );

			if ( isTriangle ) {

				faces.push( face.a, face.b, face.c );

			} else {

				faces.push( face.a, face.b, face.c, face.d );

			}

			if ( hasMaterial ) {

				faces.push( face.materialIndex );

			}

			if ( hasFaceUv ) {

				/*
				var uv = geometry.faceUvs[ 0 ][ i ];
				uvs[ 0 ].push( uv.u, uv.v );
				*/

			}

			if ( hasFaceVertexUv ) {

				/*
				var uvs = geometry.faceVertexUvs[ 0 ][ i ];

				if ( isTriangle ) {

					faces.push(
						uvs[ 0 ].u, uvs[ 0 ].v,
						uvs[ 1 ].u, uvs[ 1 ].v,
						uvs[ 2 ].u, uvs[ 2 ].v
					);

				} else {

					faces.push(
						uvs[ 0 ].u, uvs[ 0 ].v,
						uvs[ 1 ].u, uvs[ 1 ].v,
						uvs[ 2 ].u, uvs[ 2 ].v,
						uvs[ 3 ].u, uvs[ 3 ].v
					);

				}
				*/

			}

			if ( hasFaceNormal ) {

				var faceNormal = face.normal;
				faces.push( getNormalIndex( faceNormal.x, faceNormal.y, faceNormal.z ) );

			}

			if ( hasFaceVertexNormal ) {

				var vertexNormals = face.vertexNormals;

				if ( isTriangle ) {

					faces.push(
						getNormalIndex( vertexNormals[ 0 ].x, vertexNormals[ 0 ].y, vertexNormals[ 0 ].z ),
						getNormalIndex( vertexNormals[ 1 ].x, vertexNormals[ 1 ].y, vertexNormals[ 1 ].z ),
						getNormalIndex( vertexNormals[ 2 ].x, vertexNormals[ 2 ].y, vertexNormals[ 2 ].z )
					);

				} else {

					faces.push(
						getNormalIndex( vertexNormals[ 0 ].x, vertexNormals[ 0 ].y, vertexNormals[ 0 ].z ),
						getNormalIndex( vertexNormals[ 1 ].x, vertexNormals[ 1 ].y, vertexNormals[ 1 ].z ),
						getNormalIndex( vertexNormals[ 2 ].x, vertexNormals[ 2 ].y, vertexNormals[ 2 ].z ),
						getNormalIndex( vertexNormals[ 3 ].x, vertexNormals[ 3 ].y, vertexNormals[ 3 ].z )
					);

				}

			}

		}

		function setBit( value, position, enabled ) {

			return enabled ? value | ( 1 << position ) : value & ( ~ ( 1 << position) );

		}

		function getNormalIndex( x, y, z ) {

				var hash = x.toString() + y.toString() + z.toString();

				if ( normalsHash[ hash ] !== undefined ) { 

					return normalsHash[ hash ];

				}

				normalsHash[ hash ] = normals.length / 3;
				normals.push( x, y, z );

				return normalsHash[ hash ];

		}

		//

		var output = [
			'{',
			'	"metadata": {',
			'		"formatVersion" : 3',
			'	},',
			'	"vertices": ' + JSON.stringify( vertices ) + ',',
			'	"normals": ' + JSON.stringify( normals ) + ',',
			'	"uvs": ' + JSON.stringify( uvs ) + ',',
			'	"faces": ' + JSON.stringify( faces ),
			'}'
		].join( '\n' );

		var file = new BlobBuilder();
		file.append( output );

		var objectURL = URL.createObjectURL( file.getBlob( 'text/json' ) );

		var clickEvent = document.createEvent( 'MouseEvent' );
		clickEvent.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );

		var download = document.createElement( 'a' );
		download.href = objectURL;
		download.download = 'geometry.js';
		download.dispatchEvent( clickEvent );

		URL.revokeObjectURL( objectURL );

	}

	return container;

}
