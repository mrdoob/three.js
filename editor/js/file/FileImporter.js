import { FileHandlers } from './handlers/FileHandlers.js';
import { getFileExt, getFilesFromItemList } from './FileUtils.js';
import { FileManager } from './FileManager.js';

class FileImporter {

	constructor( editor ) {

		this.editor = editor;

	}

	async import( files, manager ) {

		if ( files instanceof DataTransferItemList ) {

			files = await getFilesFromItemList( files );

		}

		manager = manager || new FileManager( files );

		for ( const file of files ) {

			if ( ! FileImporter.canImport( file ) ) continue;

			const handler = FileHandlers.getImportHandler( file, this.editor, manager );
			await handler.import( file );

		}

	}

	static getAcceptedFileExts() {

		return Object.keys( FileHandlers.ImportableHandlers ).sort();

	}

	static canImport( file ) {

		return getFileExt( file ) in FileHandlers.ImportableHandlers;

	}

}

export { FileImporter };
