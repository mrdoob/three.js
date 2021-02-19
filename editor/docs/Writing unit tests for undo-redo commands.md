Writing unit tests for undo-redo commands
===

### Overview ###

Writing unit tests for undo/redo commands is easy.
The main idea to simulate a scene, execute actions and perform undo and redo.
Following steps are required.

1. Create a new unit test file
2. Include the new command and the unit test file in the editor's test suite
3. Write the test
4. Execute the test

Each of the listed steps will now be described in detail.

### 1. Create a new unit test file ###

Create a new file in path `test/unit/editor/TestDoSomethingCommand.js`.

### 2. Include the new command in the editor test suite ###

Navigate to the editor test suite `test/unit/unittests_editor.html` and open it.
Within the file, go to the `<!-- command object classes -->` and include the new command:

```html
// <!-- command object classes -->
//...
<script src="../../editor/js/commands/AddScriptCommand.js"></script>
<script src="../../editor/js/commands/DoSomethingCommand.js"></script>         // add this line
<script src="../../editor/js/commands/MoveObjectCommand.js"></script>
//...
```

It is recommended to keep the script inclusions in alphabetical order, if possible.

Next, in the same file, go to `<!-- Undo-Redo tests -->` and include the test file for the new command:

```html
// <!-- Undo-Redo tests -->
//...
<script src="editor/TestAddScriptCommand.js"></script>
<script src="editor/TestDoSomethingCommand.js"></script>              // add this line
<script src="editor/TestMoveObjectCommand.js"></script>
//...
```

Again, keeping the alphabetical order is recommended.

### 3. Write the test ###

#### Template ####

Open the unit test file `test/unit/editor/TestDoSomethingCommand.js` and paste following code:

```javascript
module( "DoSomethingCommand" );

test("Test DoSomethingCommand (Undo and Redo)", function() {

    var editor = new Editor();

    var box = aBox( 'Name your box' );

    // other available objects from "CommonUtilities.js"
    // var sphere = aSphere( 'Name your sphere' );
    // var pointLight = aPointLight( 'Name your pointLight' );
    // var perspectiveCamera = aPerspectiveCamera( 'Name your perspectiveCamera' );

    // in most cases you'll need to add the object to work with
    editor.execute( new AddObjectCommand( editor, box ) );


    // your test begins here...


} );
```

The predefined code is just meant to ease the development, you do not have to stick with it.
However, the test should cover at least one `editor.execute()`, one `editor.undo()` and one `editor.redo()` call.

Best practice is to call `editor.execute( new DoSomethingCommand( {custom parameters} ) )` **twice**. Since you'll have to do one undo (go one step back), it is recommended to have a custom state for comparison. Try to avoid assertions `ok()` against default values.

#### Assertions ####
After performing `editor.execute()` twice, you can do your first assertion to check whether the executes are done correctly.

Next, you perform `editor.undo()` and check if the last action was undone.

Finally, perform `editor.redo()` and verify if the values are as expected.

### 4. Execute the test ###

Open the editor's unit test suite `test/unit/unittests_editor.html` in your browser and check the results from the test framework.
