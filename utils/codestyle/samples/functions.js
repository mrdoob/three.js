
// GOOD

function foo( a, b, c ) {

	return a + b + c;

}

var x = function( a, b, c ) {

	// ...

}

foo( 1, 2, 3 );
foo(
	1,
	2,
	3
);
foo(
	1,  // first arg comment
	22, // second arg comment
	3   // third arg comment
);

// BAD

function foo(a,b,c) {

	// ...

}

function foo ( a, b, c ) {
	return a;
}

function foo ( a ) { return a; }

var x = function (a,b) {

	// ...

}

foo(1,2,3);
foo( 1, 2, 3);
foo(1, 2, 3 );

