/*
 * Copyright 2009 The Closure Compiler Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//
// Contents
//

The Closure Compiler performs checking, instrumentation, and
optimizations on JavaScript code. The purpose of this README is to
explain how to build and run the Closure Compiler.

The Closure Compiler requires Java 6 or higher.
http://www.java.com/


//
// Building The Closure Compiler
//

There are three ways to get a Closure Compiler executable.

1) Use one we built for you.

Pre-built Closure binaries can be found at
http://code.google.com/p/closure-compiler/downloads/list


2) Check out the source and build it with Apache Ant.

First, check out the full source tree of the Closure Compiler. There
are instructions on how to do this at the project site.
http://code.google.com/p/closure-compiler/source/checkout

Apache Ant is a cross-platform build tool.
http://ant.apache.org/

At the root of the source tree, there is an Ant file named
build.xml. To use it, navigate to the same directory and type the
command

ant jar

This will produce a jar file called "build/compiler.jar".


3) Check out the source and build it with Eclipse.

Eclipse is a cross-platform IDE.
http://www.eclipse.org/

Under Eclipse's File menu, click "New > Project ..." and create a
"Java Project."  You will see an options screen. Give the project a
name, select "Create project from existing source," and choose the
root of the checked-out source tree as the existing directory. Verify
that you are using JRE version 6 or higher.

Eclipse can use the build.xml file to discover rules. When you
navigate to the build.xml file, you will see all the build rules in
the "Outline" pane. Run the "jar" rule to build the compiler in
build/compiler.jar.


//
// Running The Closure Compiler
//

Once you have the jar binary, running the Closure Compiler is straightforward.

On the command line, type

java -jar compiler.jar

This starts the compiler in interactive mode. Type

var x = 17 + 25;

then hit "Enter", then hit "Ctrl-Z" (on Windows) or "Ctrl-D" (on Mac or Linux)
and "Enter" again. The Compiler will respond:

var x=42;

The Closure Compiler has many options for reading input from a file,
writing output to a file, checking your code, and running
optimizations. To learn more, type

java -jar compiler.jar --help

You can read more detailed documentation about the many flags at
http://code.google.com/closure/compiler/docs/gettingstarted_app.html


//
// Compiling Multiple Scripts
//

If you have multiple scripts, you should compile them all together with
one compile command.

java -jar compiler.jar --js=in1.js --js=in2.js ... --js_output_file=out.js

The Closure Compiler will concatenate the files in the order they're
passed at the command line.

If you need to compile many, many scripts together, you may start to
run into problems with managing dependencies between scripts. You
should check out the Closure Library. It contains functions for
enforcing dependencies between scripts, and a tool called calcdeps.py
that knows how to give scripts to the Closure Compiler in the right
order.

http://code.google.com/p/closure-library/

//
// Licensing
//

Unless otherwise stated, all source files are licensed under
the Apache License, Version 2.0.


-----
Code under:
src/com/google/javascript/rhino
test/com/google/javascript/rhino

URL: http://www.mozilla.org/rhino
Version:  1.5R3, with heavy modifications
License:  Netscape Public License and MPL / GPL dual license

Description: A partial copy of Mozilla Rhino. Mozilla Rhino is an
implementation of JavaScript for the JVM.  The JavaScript parser and
the parse tree data structures were extracted and modified
significantly for use by Google's JavaScript compiler.

Local Modifications: The packages have been renamespaced. All code not
relevant to parsing has been removed. A JsDoc parser and static typing
system have been added.


-----
Code in:
lib/rhino

Rhino
URL: http://www.mozilla.org/rhino
Version:  Trunk
License:  Netscape Public License and MPL / GPL dual license

Description: Mozilla Rhino is an implementation of JavaScript for the JVM.

Local Modifications: Minor changes to parsing JSDoc that usually get pushed
up-stream to Rhino trunk.


-----
Code in:
lib/args4j.jar

Args4j
URL: https://args4j.dev.java.net/
Version: 2.0.12
License: MIT

Description:
args4j is a small Java class library that makes it easy to parse command line
options/arguments in your CUI application.

Local Modifications: None.


-----
Code in:
lib/guava.jar

Guava Libraries
URL: http://code.google.com/p/guava-libraries/
Version:  r08
License: Apache License 2.0

Description: Google's core Java libraries.

Local Modifications: None.


-----
Code in:
lib/jsr305.jar

Annotations for software defect detection
URL: http://code.google.com/p/jsr-305/
Version: svn revision 47
License: BSD License

Description: Annotations for software defect detection.

Local Modifications: None.


-----
Code in:
lib/jarjar.jar

Jar Jar Links
URL: http://jarjar.googlecode.com/
Version: 1.1
License: Apache License 2.0

Description:
A utility for repackaging Java libraries.

Local Modifications: None.


----
Code in:
lib/junit.jar

JUnit
URL:  http://sourceforge.net/projects/junit/
Version:  4.8.2
License:  Common Public License 1.0

Description: A framework for writing and running automated tests in Java.

Local Modifications: None.


---
Code in:
lib/protobuf-java.jar

Protocol Buffers
URL: http://code.google.com/p/protobuf/
Version: 2.3.0
License: New BSD License

Description: Supporting libraries for protocol buffers,
an encoding of structured data.

Local Modifications: None


---
Code in:
lib/ant.jar
lib/ant-launcher.jar

URL: http://ant.apache.org/bindownload.cgi
Version: 1.8.1
License: Apache License 2.0
Description:
  Ant is a Java based build tool. In theory it is kind of like "make"
  without make's wrinkles and with the full portability of pure java code.

Local Modifications: None


---
Code in:
lib/json.jar
URL: http://json.org/java/index.html
Version: JSON version 20090211
License: MIT license
Description:
JSON is a set of java files for use in transmitting data in JSON format.

Local Modifications: None

---
Code in:
tools/maven-ant-tasks-2.1.1.jar
URL: http://maven.apache.org
Version 2.1.1
License: Apache License 2.0
Description:
  Maven Ant tasks are used to manage dependencies and to install/deploy to
  maven repositories.

Local Modifications: None
