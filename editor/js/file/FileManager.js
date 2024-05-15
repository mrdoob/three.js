import { LoadingManager } from 'three';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';

class FileManager extends LoadingManager {

	constructor( files ) { // File[] | FileList

		super();

		const fileEntries = Array.prototype.map.call( files, file => [ file.name, file ] );
		const filesMap = Object.fromEntries( fileEntries );

		this.setURLModifier( url => {

			url = url.replace( /^(\.?\/)/, '' ); // remove './'

			const file = filesMap[ url ];

			if ( file ) {

				console.log( 'Loading', url );

				return URL.createObjectURL( file );

			}

			return url;

		} );

		this.addHandler( /\.tga$/i, new TGALoader() );

	}

}

export { FileManager };
