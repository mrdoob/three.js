/**
 * @author elephantatwork, Samuel Vonäsch
 * keyboard Recognition code @author Jérome Etienne
 */

var EditorShortCuts = function (editor) {

	this.editor = editor;
	this.shortcuts = this.editor.shortcuts;

	this.domElement = document;
	// to store the current state
	this.keyCodes	= {};
	this.modifiers	= {};
	
	// create callback to bind/unbind keyboard events
	var _this	= this;
	this._onKeyDown	= function(event){ _this._onKeyChange(event)	}
	this._onKeyUp	= function(event){ _this._onKeyChange(event)	}

	// bind keyEvents
	this.domElement.addEventListener("keydown", this._onKeyDown, false);
	this.domElement.addEventListener("keyup", this._onKeyUp, false);

	// create callback to bind/unbind window blur event
	this._onBlur = function(){
		for(var prop in _this.keyCodes)  _this.keyCodes[prop] = false;
		for(var prop in _this.modifiers)  _this.modifiers[prop] = false;
	}

	// bind window blur
	window.addEventListener("blur", this._onBlur, false);


};

EditorShortCuts.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
EditorShortCuts.ALIAS	= {
	'left'		: 37,
	'up'		: 38,
	'right'		: 39,
	'down'		: 40,
	'space'		: 32,
	'pageup'	: 33,
	'pagedown'	: 34,
	'tab'		: 9,
	'escape'	: 27,
	'num1'		: 97,
	'num2'		: 98,
	'num3'		: 99,
	'num4'		: 100,
	'num5'		: 101,
	'num6'		: 102,
	'num7'		: 103,
	'num8'		: 104,
	'num9'		: 105,
	'num0'		: 96

};

EditorShortCuts.prototype = {


	keyCheck: function( keyCode ){

		//Create the a json file and export it
		if( this.pressed(this.shortcuts.getKey('file/exportscene' ))) {

			var output = this.editor.scene.toJSON();
			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

			this.exportString( output, 'scene.json' );;

		}
		
		//Create Raymond the raycast blocker.
		if( this.pressed(this.shortcuts.getKey('history/undo' ))) this.editor.history.undo();


		//History
		//Undo
		if( this.pressed(this.shortcuts.getKey('history/undo' ))) this.editor.history.undo();

		//Redo
		if( this.pressed(this.shortcuts.getKey('history/redo' ))) this.editor.history.redo();


		//Transform
		//Translate
		if( this.pressed(this.shortcuts.getKey('transform/move' ))) this.editor.signals.transformModeChanged.dispatch( 'translate' );

		//Rotate
		if( this.pressed(this.shortcuts.getKey('transform/rotate' ))) this.editor.signals.transformModeChanged.dispatch( 'rotate' );

		//Sccale
		if( this.pressed(this.shortcuts.getKey('transform/scale' ))) this.editor.signals.transformModeChanged.dispatch( 'scale' );

		//Delete Shortcut -HACK IT ATM, pressing x doesnt work
		if( event.keyCode == 88 ) {
			this.editor.destoryCurrent();
		}

		//Clone Object
		if( this.pressed(this.shortcuts.getKey( 'edit/clone' ))) this.editor.cloneObject();

		//Hide Current
		if( this.pressed(this.shortcuts.getKey( 'view/hide' ))) this.editor.hide();

		//Unhide all
		if( this.pressed(this.shortcuts.getKey( 'view/unhideAll' ))) this.editor.unhideAll();

		//Isolate - toggle
		if( this.pressed(this.shortcuts.getKey( 'view/isolate' ))) this.editor.isolate();

		//Focus object
		if( this.pressed(this.shortcuts.getKey( 'view/focus' ))) this.editor.focus(this.editor.selected);

		//Camera Positions - Hack Style
		if( this.pressed(this.shortcuts.getKey( 'camera/top' ))) this.editor.signals.cameraPositionSnap.dispatch( 'top' );
		if( this.pressed(this.shortcuts.getKey( 'camera/left' ))) this.editor.signals.cameraPositionSnap.dispatch( 'left' );
		if( this.pressed(this.shortcuts.getKey( 'camera/front' ))) this.editor.signals.cameraPositionSnap.dispatch( 'front' );

		if( this.pressed("ctrl+"+this.shortcuts.getKey( 'camera/top' ))) this.editor.signals.cameraPositionSnap.dispatch( 'bottom' );
		if( this.pressed("ctrl+"+this.shortcuts.getKey( 'camera/left' ))) this.editor.signals.cameraPositionSnap.dispatch( 'right' );
		if( this.pressed("ctrl+"+this.shortcuts.getKey( 'camera/front' ))) this.editor.signals.cameraPositionSnap.dispatch( 'back' );

	},

	//Ugly and should be here
	exportString: function ( output, filename ) {
		
		//export scnee hack
		var link = document.createElement( 'a' );
		link.style.display = 'none';
		document.body.appendChild( link ); // Firefox workaround, see #6594

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		link.href = objectURL;
		link.download = filename || 'data.json';
		link.target = '_blank';

		var event = document.createEvent("MouseEvents");
		event.initMouseEvent(
			"click", true, false, window, 0, 0, 0, 0, 0
			, false, false, false, false, 0, null
		);
		link.dispatchEvent(event);
	},

	/**
	* To stop listening of the keyboard events
	*/
	destroy: function(){
		// unbind keyEvents
		this.domElement.removeEventListener("keydown", this._onKeyDown, false);
		this.domElement.removeEventListener("keyup", this._onKeyUp, false);

		// unbind window blur event
		window.removeEventListener("blur", this._onBlur, false);
	},

	/**
	 * to process the keyboard dom event
	*/
	_onKeyChange: function( event ){
		// log to debug
		// console.log("onKeyChange", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);

		// update this.keyCodes
		var keyCode		= event.keyCode
		var pressed		= event.type === 'keydown' ? true : false
		this.keyCodes[keyCode]	= pressed
		// update this.modifiers
		this.modifiers['shift']	= event.shiftKey
		this.modifiers['ctrl']	= event.ctrlKey
		this.modifiers['alt']	= event.altKey
		this.modifiers['meta']	= event.metaKey
	},

	/**
	 * query keyboard state to know if a key is pressed of not
	 *
	 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
	 * @returns {Boolean} true if the key is pressed, false otherwise
	*/
	pressed: function(keyDesc){
		// console.log(keyDesc);
		var keys	= keyDesc.split("+");
		for(var i = 0; i < keys.length; i++){
			var key		= keys[i]
			var pressed	= false
			if( EditorShortCuts.MODIFIERS.indexOf( key ) !== -1 ){
				pressed	= this.modifiers[key];
			}else if( Object.keys(EditorShortCuts.ALIAS).indexOf( key ) != -1 ){
				pressed	= this.keyCodes[ EditorShortCuts.ALIAS[key] ];
			}else {
				pressed	= this.keyCodes[key.toUpperCase().charCodeAt(0)]
			}
			if( !pressed)	return false;
		};
		return true;
	},

	/**
	 * return true if an event match a keyDesc
	 * @param  {KeyboardEvent} event   keyboard event
	 * @param  {String} keyDesc string description of the key
	 * @return {Boolean}         true if the event match keyDesc, false otherwise
	 */
	eventMatches: function( event, keyDesc ) {

		var aliases	= THREEx.KeyboardState.ALIAS
		var aliasKeys	= Object.keys(aliases)
		var keys	= keyDesc.split("+")
		// log to debug
		// console.log("eventMatches", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
		for(var i = 0; i < keys.length; i++){
			var key		= keys[i];
			var pressed	= false;
			if( key === 'shift' ){
				pressed	= (event.shiftKey	? true : false)
			}else if( key === 'ctrl' ){
				pressed	= (event.ctrlKey	? true : false)
			}else if( key === 'alt' ){
				pressed	= (event.altKey		? true : false)
			}else if( key === 'meta' ){
				pressed	= (event.metaKey	? true : false)
			}else if( aliasKeys.indexOf( key ) !== -1 ){
				pressed	= (event.keyCode === aliases[key] ? true : false);
			}else if( event.keyCode === key.toUpperCase().charCodeAt(0) ){
				pressed	= true;
			}

			if( !pressed )	return false;
		}

		return true;
	}

}

