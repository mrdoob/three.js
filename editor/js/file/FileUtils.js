function getFileStem( file ) {

	const pathname = ( file instanceof File ) ? file.name : file;
	const basename = pathname.split( '/' ).pop();
	const index = basename.lastIndexOf( '.' );

	return index < 0 ? basename : basename.slice( 0, index );

}

function getFileExt( file ) {

	const pathname = ( file instanceof File ) ? file.name : file;

	return '.' + pathname.split( '/' ).pop().split( '.' ).pop().toLowerCase();

}

//

function formatFileSize( sizeB, K = 1024 ) {

	if ( sizeB === 0 ) return '0B';

	const sizes = [ sizeB, sizeB / K, sizeB / K / K ].reverse();
	const units = [ 'B', 'KB', 'MB' ].reverse();
	const index = sizes.findIndex( size => size >= 1 );

	return new Intl.NumberFormat( 'en-us', { useGrouping: true, maximumFractionDigits: 1 } )
		.format( sizes[ index ] ) + units[ index ];

}

//

function defaultOnProgress( event, file ) {

	const loaded = Math.floor( event.loaded / event.total ) * 100;

	const fileSize = formatFileSize( event.loaded );

	console.log( `Reading ${ file.name } (${ fileSize }) ${ loaded }%` );

}

function readAsArrayBuffer( file, onProgress = defaultOnProgress ) {

	return new Promise( ( resolve, reject ) => {

		const reader = new FileReader();
		reader.addEventListener( 'progress', ( event ) => onProgress( event, file ) );
		reader.addEventListener( 'error', reject );
		reader.addEventListener( 'load', ( event ) => resolve( event.target.result ) );
		reader.readAsArrayBuffer( file );

	} );

}

function readAsText( file, encoding = 'utf-8', onProgress = defaultOnProgress ) {

	return new Promise( ( resolve, reject ) => {

		const reader = new FileReader();
		reader.addEventListener( 'progress', ( event ) => onProgress( event, file ) );
		reader.addEventListener( 'error', reject );
		reader.addEventListener( 'load', ( event ) => resolve( event.target.result ) );
		reader.readAsText( file, encoding );

	} );

}

//

function getFilesFromItemList( dataTransferItems ) {

	return new Promise( ( resolve /*, reject */ ) => {

		// TOFIX: setURLModifier() breaks when the file being loaded is not in root

		let itemsCount = 0;
		let itemsTotal = 0;

		const files = [];

		function onEntryHandled() {

			itemsCount ++;

			if ( itemsCount === itemsTotal ) {

				resolve( files );

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

					onEntryHandled();

				} );

			}

			itemsTotal ++;

		}

		for ( let i = 0; i < dataTransferItems.length; i ++ ) {

			const item = dataTransferItems[ i ];

			if ( item.kind === 'file' ) {

				handleEntry( item.webkitGetAsEntry() );

			}

		}

	} );

}

//

export {
	getFileStem, getFileExt,
	formatFileSize,
	readAsArrayBuffer, readAsText,
	getFilesFromItemList
};
