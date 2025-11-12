const DevTools = {
	enabled: true,

	setEnabled( value ) {
		this.enabled = Boolean( value );
		if ( typeof localStorage !== 'undefined' ) {
			localStorage.setItem( 'three-devtools-enabled', this.enabled );
		}
	},

	toggle() {
		this.setEnabled( !this.enabled );
		return this.enabled;
	}
};

// Load saved preference
if ( typeof localStorage !== 'undefined' ) {
	const saved = localStorage.getItem( 'three-devtools-enabled' );
	if ( saved !== null ) {
		DevTools.enabled = saved === 'true';
	}
}

export { DevTools };