Sidebar.Properties.Geometry = function ( signals ) {

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text().setText( 'GEOMETRY' ).setColor( '#666' ) );
	container.add( new UI.Button( 'absolute' ).setRight( '0px' ).setText( 'Export' ).onClick( exportGeometry ) );
	container.add( new UI.Break(), new UI.Break() );

	container.add( new UI.Text().setText( 'Name' ).setColor( '#666' ) );
	var geometryName = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( geometryName );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Class' ).setColor( '#666' ) );
	var geometryClass = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( geometryClass );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Vertices' ).setColor( '#666' ) );
	var verticesCount = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( verticesCount );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Faces' ).setColor( '#666' ) );
	var facesCount = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( facesCount );
	container.add( new UI.Break(), new UI.Break(), new UI.Break() );

	//

	var selected = null;

	signals.objectSelected.add( function ( object ) {

		if ( object && object.geometry ) {

			selected = object.geometry;

			container.setDisplay( 'block' );

			geometryName.setText( object.geometry.name );
			geometryClass.setText( getGeometryInstanceName( object.geometry ) );
			verticesCount.setText( object.geometry.vertices.length );
			facesCount.setText( object.geometry.faces.length );

		} else {

			selected = null;

			container.setDisplay( 'none' );

		}

	} );

	function getGeometryInstanceName( geometry ) {

		// TODO: Is there a way of doing this automatically?

		if ( geometry instanceof THREE.ConvexGeometry ) return "ConvexGeometry";
		if ( geometry instanceof THREE.CubeGeometry ) return "CubeGeometry";
		if ( geometry instanceof THREE.CylinderGeometry ) return "CylinderGeometry";
		if ( geometry instanceof THREE.ExtrudeGeometry ) return "ExtrudeGeometry";
		if ( geometry instanceof THREE.IcosahedronGeometry ) return "IcosahedronGeometry";
		if ( geometry instanceof THREE.LatheGeometry ) return "LatheGeometry";
		if ( geometry instanceof THREE.OctahedronGeometry ) return "OctahedronGeometry";
		if ( geometry instanceof THREE.ParametricGeometry ) return "ParametricGeometry";
		if ( geometry instanceof THREE.PlaneGeometry ) return "PlaneGeometry";
		if ( geometry instanceof THREE.PolyhedronGeometry ) return "PolyhedronGeometry";
		if ( geometry instanceof THREE.SphereGeometry ) return "SphereGeometry";
		if ( geometry instanceof THREE.TetrahedronGeometry ) return "TetrahedronGeometry";
		if ( geometry instanceof THREE.TextGeometry ) return "TextGeometry";
		if ( geometry instanceof THREE.TorusGeometry ) return "TorusGeometry";
		if ( geometry instanceof THREE.TorusKnotGeometry ) return "TorusKnotGeometry";
		if ( geometry instanceof THREE.TubeGeometry ) return "TubeGeometry";
		if ( geometry instanceof THREE.Geometry ) return "Geometry";

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
