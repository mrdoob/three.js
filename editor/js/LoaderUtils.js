const LoaderUtils = {

	createFilesMap: function ( files ) {

		const map = {};

		for ( let i = 0; i < files.length; i ++ ) {

			const file = files[ i ];
			map[ file.name ] = file;

		}

		return map;

	},

	getFilesFromItemList: function ( items, onDone ) {

		// TOFIX: setURLModifier() breaks when the file being loaded is not in root

		let itemsCount = 0;
		let itemsTotal = 0;

		const files = [];
		const filesMap = {};

		function onEntryHandled() {

			itemsCount ++;

			if ( itemsCount === itemsTotal ) {

				onDone( files, filesMap );

			}

		}

		function handleEntry( entry ) {

			if ( entry.isDirectory ) {

				const reader = entry.createReader();
				reader.readEntries( function ( entries ) {

					for ( let i = 0; i < entries.length; i ++ ) {

						handleEntry( entries[ i ] );

					}

					onEntryHandled();

				} );

			} else if ( entry.isFile ) {

				entry.file( function ( file ) {

					files.push( file );

					filesMap[ entry.fullPath.slice( 1 ) ] = file;
					onEntryHandled();

				} );

			}

			itemsTotal ++;

		}

		for ( let i = 0; i < items.length; i ++ ) {

			const item = items[ i ];

			if ( item.kind === 'file' ) {

				handleEntry( item.webkitGetAsEntry() );

			}

		}

	}

};

export { LoaderUtils };
