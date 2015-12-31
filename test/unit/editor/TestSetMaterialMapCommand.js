/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "SetMaterialMapCommand" );

test( "Test for SetMaterialMapCommand (Undo and Redo)", function() {

	// setup
	var editor = new Editor();
	var box = aBox( 'Material mapped box' );
	var cmd = new AddObjectCommand( box );
	cmd.updatable = false;
	editor.execute( cmd );

	var mapNames = [ 'map', 'alphaMap', 'bumpMap', 'normalMap', 'displacementMap', 'specularMap', 'envMap', 'lightMap', 'aoMap' ];

	// define files
	var dirt  = { name: 'dirt.png' , data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDMjYxMEI4MzVENDMxMUU1OTdEQUY4QkNGNUVENjg4MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDMjYxMEI4NDVENDMxMUU1OTdEQUY4QkNGNUVENjg4MyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMyNjEwQjgxNUQ0MzExRTU5N0RBRjhCQ0Y1RUQ2ODgzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkMyNjEwQjgyNUQ0MzExRTU5N0RBRjhCQ0Y1RUQ2ODgzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+txizaQAAABVQTFRFh4eHbGxsdFhEWT0puYVclmxKeVU6ppwr+AAAAHtJREFUeNosjgEWBCEIQplFuP+RB5h9lZn2EZxkLzC3D1YSgSlmk7i0ctzDZNBz/VSoX1KwjlFI8WmA2R7JqUa0LJJcd1rLNWRRaMyi+3Y16qMKHhdE48XLsDyHKJ0nSMazY1fxHyriXxV584tmEedcfGNrA/5cmK8AAwCT9ATehDDyzwAAAABJRU5ErkJggg==' };
	var stone = { name: 'stone.png', data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDMjYxMEI4NzVENDMxMUU1OTdEQUY4QkNGNUVENjg4MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDMjYxMEI4ODVENDMxMUU1OTdEQUY4QkNGNUVENjg4MyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMyNjEwQjg1NUQ0MzExRTU5N0RBRjhCQ0Y1RUQ2ODgzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkMyNjEwQjg2NUQ0MzExRTU5N0RBRjhCQ0Y1RUQ2ODgzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+WCxVbAAAAA9QTFRFgICAaGhoj4+Pf39/dHR0lCmHpAAAAG9JREFUeNo8TkkSBDEIEuH/bx7A9HigYlhkKA93sfcaetn10whSQ0jILpqjFQYiqGepXuexaxRpqAQInF2rzJKNx/CZm6yGuoKOzszjL0LbYjlgxzZokJA6CvgsenUaGm3PRPI/W1MUrXC9+v0TYACSUwL7JYc6IAAAAABJRU5ErkJggg==' };
	var files = [ dirt, stone ];

	// define images for given files
	var images = files.map( function( file ) {

		var i = new Image();
		i.src = file.data;
		return { name: file.name, image: i };

	} );


	// test all maps
	mapNames.map( function( mapName ) {


		// define textures for given images
		var textures = images.map( function( img ) {

			var texture = new THREE.Texture( img.image, mapName );
			texture.sourceFile = img.name;
			return texture;

		} );

		// apply the textures
		textures.map( function( texture ) {

			var cmd = new SetMaterialMapCommand( box, mapName, texture );
			cmd.updatable = false;
			editor.execute( cmd );

		} );


		ok( box.material[ mapName ].image.src == images[ images.length - 1 ].image.src,
			"OK, " + mapName + " set correctly " );

		editor.undo();
		ok( box.material[ mapName ].image.src == images[ images.length - 2 ].image.src,
			"OK, " + mapName + " set correctly after undo " );

		editor.redo();
		ok( box.material[ mapName ].image.src == images[ images.length - 1 ].image.src,
			"OK, " + mapName + " set correctly after redo" );

	} );

} );
