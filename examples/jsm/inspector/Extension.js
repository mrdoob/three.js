import { Tab } from 'three/addons/inspector/ui/Tab.js';

export class Extension extends Tab {

	constructor( name, options = {} ) {

		super( name, options );

		this.isExtension = true;

	}

}
