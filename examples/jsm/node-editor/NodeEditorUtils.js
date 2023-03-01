export const exportJSON = ( object, name ) => {

	const json = JSON.stringify( object );

	const a = document.createElement( 'a' );
	const file = new Blob( [ json ], { type: 'text/plain' } );

	a.href = URL.createObjectURL( file );
	a.download = name + '.json';
	a.click();

};
