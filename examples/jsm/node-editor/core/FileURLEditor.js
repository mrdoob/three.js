import { StringInput, Element } from '../../libs/flow.module.js';
import { BaseNode } from './BaseNode.js';
import { DataFile } from './DataFile.js';

export class FileURLEditor extends BaseNode {

	constructor() {

		const dataFile = new DataFile();

		super( 'File URL', 1, dataFile, 250 );

		const urlInput = new StringInput().onChange( () => {

			if ( urlInput.getValue() !== dataFile.getURL() ) {

				dataFile.setValue( urlInput.getValue() );

				this.invalidate();

			}

		} );

		this.add( new Element().add( urlInput ) );

	}

}
