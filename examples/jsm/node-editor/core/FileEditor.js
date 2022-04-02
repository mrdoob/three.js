import { StringInput, Element } from '../../libs/flow.module.js';
import { BaseNode } from './BaseNode.js';
import { DataFile } from './DataFile.js';

export class FileEditor extends BaseNode {

	constructor( file ) {

		const dataFile = new DataFile( file );

		super( 'File', 1, dataFile, 250 );

		this.file = file;
		this.nameInput = new StringInput( file.name ).setReadOnly( true );

		this.add( new Element().add( this.nameInput ) );

	}

}
