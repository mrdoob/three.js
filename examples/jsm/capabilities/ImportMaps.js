class ImportMaps {

	static isAvailable() {

		return ( 'supports' in HTMLScriptElement && HTMLScriptElement.supports( 'importmap' ) );

	}

	static getErrorMessage() {

		const message = 'Your browser does not support <a href="https://wicg.github.io/import-maps/" style="color:blue">Import Maps</a>';

		const element = document.createElement( 'div' );
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '5em auto 0';

		element.innerHTML = message;

		return element;

	}

}

export default ImportMaps;
