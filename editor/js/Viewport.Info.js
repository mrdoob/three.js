/**
 * @author mrdoob / http://mrdoob.com/
 */

Viewport.Info = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'info' );
	container.setPosition( 'absolute' );
	container.setLeft( '10px' );
	container.setBottom( '10px' );
	container.setFontSize( '12px' );
	container.setColor( '#fff' );

        var smallerDim = Math.min(window.innerHeight, window.innerWidth);
        var imgDim = Math.max(smallerDim / 15, 30);
        var logo = new UI.Image('imgs/OpenSimApplicationIcon.png', imgDim, imgDim, 0.5, 
                                function(img) {
                                    var smallerDim = Math.min(window.innerHeight, window.innerWidth);
                                    var imgDim = Math.max(smallerDim / 15, 30);
                                    img.dom.width = imgDim;
                                    img.dom.height = imgDim;
                                });
        var div = new UI.Div();
        div.add( logo );
        container.add( div );

	var objectsText = new UI.Text( '0' ).setMarginLeft( '6px' );
	var verticesText = new UI.Text( '0' ).setMarginLeft( '6px' );
	var trianglesText = new UI.Text( '0' ).setMarginLeft( '6px' );

	container.add( new UI.Text( 'objects' ), objectsText, new UI.Break() );
	container.add( new UI.Text( 'vertices' ), verticesText, new UI.Break() );
	container.add( new UI.Text( 'triangles' ), trianglesText, new UI.Break() );

	signals.objectAdded.add( update );
	signals.objectRemoved.add( update );
	signals.geometryChanged.add( update );

	//

	function update() {

		var scene = editor.scene;

		var objects = 0, vertices = 0, triangles = 0;

		for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

			var object = scene.children[ i ];

			object.traverseVisible( function ( object ) {

				objects ++;

				if ( object instanceof THREE.Mesh ) {

					var geometry = object.geometry;

					if ( geometry instanceof THREE.Geometry ) {

						vertices += geometry.vertices.length;
						triangles += geometry.faces.length;

					} else if ( geometry instanceof THREE.BufferGeometry ) {

						if ( geometry.index !== null ) {

							vertices += geometry.index.count * 3;
							triangles += geometry.index.count;

						} else {

							vertices += geometry.attributes.position.count;
							triangles += geometry.attributes.position.count / 3;

						}

					}

				}

			} );

		}

		objectsText.setValue( objects.format() );
		verticesText.setValue( vertices.format() );
		trianglesText.setValue( triangles.format() );

	}

	return container;

}
