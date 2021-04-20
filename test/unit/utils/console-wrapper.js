// This easy console wrapper introduces the logging level to console for
// preventing console outputs caused when we purposely test the code path
// including console outputs.
//
// Example: Prevent the console warnings caused by Color.setStyle().
//   const c = new Color();
//   console.level = CONSOLE_LEVEL.ERROR;
//   c.setStyle( 'rgba(255,0,0,0.5)' );
//   console.level = CONSOLE_LEVEL.DEFAULT;
//
// See https://github.com/mrdoob/three.js/issues/20760#issuecomment-735190998

export const CONSOLE_LEVEL = {
	OFF : 0,
	ERROR : 1,
	WARN : 2,
	LOG : 3,
	INFO : 4,
	DEBUG : 5,
	ALL: 6,
	DEFAULT: 6
};

console.level = CONSOLE_LEVEL.DEFAULT;

// Save the original methods
console._error = console.error;
console._warn = console.warn;
console._log = console.log;
console._info = console.info;
console._debug = console.debug;

// Wrap console methods
console.error = function () {

	if ( this.level >= CONSOLE_LEVEL.ERROR ) this._error.apply( this, arguments );

};

console.warn = function () {

	if ( this.level >= CONSOLE_LEVEL.WARN ) this._warn.apply( this, arguments );

};

console.log = function () {

	if ( this.level >= CONSOLE_LEVEL.LOG ) this._log.apply( this, arguments );

};

console.info = function () {

	if ( this.level >= CONSOLE_LEVEL.INFO ) this._info.apply( this, arguments );

};

console.debug = function () {

	if ( this.level >= CONSOLE_LEVEL.DEBUG ) this._debug.apply( this, arguments );

};
