import { getFileStem } from '../FileUtils.js';

class FileHandler {

	constructor( editor, manager ) {

		this.editor = editor;
		this.manager = manager;

	}

	async instantiate( loaderPath, loaderName = '' ) {

		const module = await import( loaderPath );

		loaderName = loaderName || getFileStem( loaderPath );

		return new module[ loaderName ]( this.manager );

	}

}

export { FileHandler };
