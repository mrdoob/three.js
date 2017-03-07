const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require( 'path' );
const url = require( 'url' );

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {

	mainWindow = new BrowserWindow( { webPreferences: {
		nodeIntegration: false
	} } );

	mainWindow.maximize();
	mainWindow.setMenu( null );

	mainWindow.loadURL( url.format( {
		pathname: path.join( __dirname, 'index.html' ),
		protocol: 'file:',
		slashes: true
	} ) );

	mainWindow.on( 'closed', function () {

		mainWindow = null;

	} );

}

app.on( 'ready', createWindow );

app.on( 'window-all-closed', function () {

	if ( process.platform !== 'darwin' ) {

		app.quit();

	}

} );

app.on( 'activate', function () {

	if ( mainWindow === null ) {

		createWindow();

	}

} );
