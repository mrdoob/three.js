/**
 * @author mrdoob / http://mrdoob.com/
 */

var LoaderUtils = {

	createFilesMap: function ( files ) {

		var map = {};

		for ( var i = 0; i < files.length; i ++ ) {

			var file = files[ i ];
			map[ file.name ] = file;

		}

		return map;

	},

	getFilesFromItemList: function ( items, onDone ) {

		// TOFIX: setURLModifier() breaks when the file being loaded is not in root

		var itemsCount = 0;
		var itemsTotal = 0;

		var files = [];
		var filesMap = {};

		function onEntryHandled() {

			itemsCount ++;

			if ( itemsCount === itemsTotal ) {

				onDone( files, filesMap );

			}

		}

		function handleEntry( entry ) {

			if ( entry.isDirectory ) {

				var reader = entry.createReader();
				reader.readEntries( function ( entries ) {

					for ( var i = 0; i < entries.length; i ++ ) {

						handleEntry( entries[ i ] );

					}

					onEntryHandled();

				} );

			} else if ( entry.isFile ) {

				entry.file( function ( file ) {

					files.push( file );

					filesMap[ entry.fullPath.substr( 1 ) ] = file;
					onEntryHandled();

				} );

			}

			itemsTotal ++;

		}

		for ( var i = 0; i < items.length; i ++ ) {

			handleEntry( items[ i ].webkitGetAsEntry() );

		}

	}

};

export { LoaderUtils };
