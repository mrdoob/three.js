How to implement additional commands for undo/redo functionality?
===

### Basics ###

After evaluating different design patterns for undo/redo we decided to use the [command-pattern](http://en.wikipedia.org/wiki/Command_pattern) for implementing undo/redo functionality in the three.js-editor.

This means that every action is encapsulated in a command-object which contains all the relevant information to restore the previous state.


### Template for new commands ###

```javascript
	
CmdXXX = function ( object ) {

	Cmd.call( this );	// Call default constructor

	this.type = 'CmdXXX';	// has to match the object-name!

	// TODO: store all the relevant information needed to 
	// restore the old and the new object-state

};

CmdXXX.prototype = {

	execute: function () {

		// TODO: apply changes to 'object' to reach the new state 

	},

	undo: function () {

		// TODO: restore 'object' to old state 

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		// TODO: serialize relevant information to json so that 
		// it can be restored in 'fromJSON'
	
		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );
		
		// TODO: restore command from json
		
	}

};

```

### Executing a command ###

To execute a command we need an instance of the main editor-object.
On **editor** we then call **.execute(...)*** with the new command-object which in turn calls **history.execute(...)** and adds the command to the undo-stack.

```javascript
	
editor.execute( new CmdXXX( object ) );
		
```