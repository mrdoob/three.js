export class DataFile {

	constructor( value ) {

		this.value = value;
		this.url = null;

	}

	setValue( value ) {

		this.value = value;
		this.url = null;

	}

	isURL( uri ) {

		const pattern = new RegExp( '^((ft|htt)ps?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?' + // port
			'(\\/[-a-z\\d%@_.~+&:]*)*' + // path
			'(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$', 'i' ); // fragment locator

		return pattern.test( uri );

	}

	getURL() {

		let url = this.url;

		if ( url === null ) {

			const value = this.value;

			if ( value instanceof File ) {

				url = URL.createObjectURL( value );

			} else {

				url = value;

			}

			this.url = this.isURL( url ) ? url : null;

		}

		return url;

	}

}

DataFile.prototype.isDataFile = true;
