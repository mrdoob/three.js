How to implement additional commands for undo/redo functionality?
===

### Basics ###

After evaluating different design patterns for undo/redo we decided to use the [command-pattern](http://en.wikipedia.org/wiki/Command_pattern) for implementing undo/redo functionality in the three.js-editor.

This means that every action is encapsulated in a command-object which contains all the relevant information to restore the previous state.

In our implementation we store the old and the new state separately (we don't store the complete state but rather the attribute and value which has changed).
It would also be possible to only store the difference between the old and the new state.

**Before implementing your own command you should look if you can't reuse one of the already existing ones.**

For numbers, strings or booleans the Set...ValueCommand-commands can be used.
Then there are separate commands for:
- setting a color property (THREE.Color)
- setting maps (THREE.Texture)
- setting geometries
- setting materials
- setting position, rotation and scale

### Template for new commands ###

Every command needs a constructor. In the constructor

```javascript
	
var DoSomethingCommand = function () {

	Command.call( this ); // Required: Call default constructor

	this.type = 'DoSomethingCommand';            // Required: has to match the object-name!
	this.name = 'Set/Do/Update Something'; // Required: description of the command, used in Sidebar.History

	// TODO: store all the relevant information needed to 
	// restore the old and the new state

};
```

And as part of the prototype you need to implement four functions
- **execute:** which is also used for redo
- **undo:** which reverts the changes made by 'execute'
- **toJSON:** which serializes the command so that the undo/redo-history can be preserved across a browser refresh
- **fromJSON:** which deserializes the command

```javascript
DoSomethingCommand.prototype = {

	execute: function () {

		// TODO: apply changes to 'object' to reach the new state 

	},

	undo: function () {

		// TODO: restore 'object' to old state 

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this ); // Required: Call 'toJSON'-method of prototype 'Command'

		// TODO: serialize all the necessary information as part of 'output' (JSON-format)
		// so that it can be restored in 'fromJSON'

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json ); // Required: Call 'fromJSON'-method of prototype 'Command'

		// TODO: restore command from json

	}

};

```

### Executing a command ###

To execute a command we need an instance of the main editor-object. The editor-object functions as the only entry point through which all commands have to go to be added as part of the undo/redo-history.
On **editor** we then call **.execute(...)*** with the new command-object which in turn calls **history.execute(...)** and adds the command to the undo-stack.

```javascript

editor.execute( new DoSomethingCommand() );

```

### Updatable commands ###

Some commands are also **updatable**. By default a command is not updatable. Making a command updatable means that you
have to implement a fifth function 'update' as part of the prototype. In it only the 'new' state gets updated while the old one stays the same.

Here as an example is the update-function of **SetColorCommand**:

```javascript
update: function ( cmd ) {

	this.newValue = cmd.newValue;

},

```

#### List of updatable commands

- SetColorCommand
- SetGeometryCommand
- SetMaterialColorCommand
- SetMaterialValueCommand
- SetPositionCommand
- SetRotationCommand
- SetScaleCommand
- SetValueCommand
- SetScriptValueCommand

The idea behind 'updatable commands' is that two commands of the same type which occur
within a short period of time should be merged into one.
**For example:** Dragging with your mouse over the x-position field in the sidebar
leads to hundreds of minor changes to the x-position.
The user expectation is not to undo every single change that happened while he dragged
the mouse cursor but rather to go back to the position before he started to drag his mouse.

When editing a script the changes are also merged into one undo-step.
