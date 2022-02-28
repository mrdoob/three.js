import { StringInput, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';

export class FileEditor extends BaseNode {

	constructor( file ) {

		super( 'File', 1, file, 250 );

		this.file = file;
		this.nameInput = new StringInput( file.name ).setReadOnly( true );

		this.add( new Element().add( this.nameInput ) );

	}

}
