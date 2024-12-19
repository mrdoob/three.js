import { StringInput, Element } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { NodeUtils } from 'three/webgpu';
import { arrayBuffer } from 'three/tsl';

export class FileEditor extends BaseNodeEditor {

	constructor( buffer = null, name = 'File' ) {

		super( 'File', arrayBuffer( buffer ), 250 );

		this.nameInput = new StringInput( name ).setReadOnly( true );

		this.add( new Element().add( this.nameInput ) );

		this.url = null;

	}

	set buffer( arrayBuffer ) {

		if ( this.url !== null ) {

			URL.revokeObjectUR( this.url );

		}

		this.value.value = arrayBuffer;
		this.url = null;

	}

	get buffer() {

		return this.value.value;

	}

	getURL() {

		if ( this.url === null ) {

			const blob = new Blob( [ this.buffer ], { type: 'application/octet-stream' } );

			this.url = URL.createObjectURL( blob );

		}

		return this.url;

	}

	serialize( data ) {

		super.serialize( data );

		data.buffer = NodeUtils.arrayBufferToBase64( this.buffer );
		data.name = this.nameInput.getValue();

	}

	deserialize( data ) {

		super.deserialize( data );

		this.buffer = NodeUtils.base64ToArrayBuffer( data.buffer );
		this.nameInput.setValue( data.name );

	}

}
