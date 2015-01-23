# Running tests
In order to use the test scripts you must have your shell setup to execute Blender from the command line using `$ blender`. This either done by setting up your own wrapper scripts or by symlinking /usr/bin/blender directly to $BLENDER_ROOT/blender. 

## OS X
Make sure your do not point to blender.app as it will not pass the arguments corrently. It is required to execute on $BLENDER_ROOT/blender.app/Contents/MacOS/blender in order for the tests to function correctly.

# Testing
Each test script focuses on a specific context and feature of the exporter. 

## Context
Context determines whether an entire scene is being exported or a single mesh node.

## Features
Features should be tested separately (whenever possible), example: animations should be tested separately from bump maps.

## Review
When a test is executed a new root directory, if it doesn't already exist, is created at three.js/utils/exporters/blender/tests/review. Inside will contain subdirectories of each test (named the same as the script but with the `test_` prefix removed. The test directory will contain the exported JSON file(s), index.html, and textures (if textures are being tested). The index.html is already setup to source the required libraries and load the JSON file. There is nothing else that a user should need to do in order to test their export.

The review directory has been added to the .gitignore and will not be included when committing changes.
