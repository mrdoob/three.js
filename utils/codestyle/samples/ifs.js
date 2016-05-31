
// GOOD

if ( x === 2 ) {

	// do stuff...

}

if ( x )
	doStuff();

if ( x ) doStuff();

if ( test ) {

	// ...

} else {

	// ...

}

// BAD

if (x) {

	doStuff();

}

if ( x) doStuff();
if (x ) doStuff();
if (x) doStuff();
if ( x ) { doStuff(); }
