
// trailing whitespace is stripped
var x = 5;        

//
// comments
//

var x = 5; // space between code, comment marker, and comment text

// line comments can be right on top of line of code
var x = 5;

var x = 5;

// line comments should not be directly under line of code

var x = 5;    // line comments can be spaced by hand

//
// expressions
//

//
// variable declarations
//

// OK

var a, b, c, d;
var a,
	b,
	c,
	d = 5;

// NOT OK

// comma should be at end of line
var a
	, b
	, c;

// indent with tabs not spaces
var a,
    b,
    c;

var a=4;
var a =4;
var a= 4;

//
// objects
//

// OK
var o = { a: 1, b: 2, c: 3 };
var o = {
	a: 1,
	b: 2,
	c: 3
};

// OK: alignment spacing
var o = {
	a:   1,
	b:  12,
	c: 123
};
var o = { a: '1', b: '22', c: '333' }; // normal spacing
var o = { a: '1', b:  '2', c:   '3' }; // extra spacing between key and value (right align)

var o = { a: '1', b: '22', c: '333' }; // normal spacing
var o = { a: '1', b: '2',  c: '3'   }; // extra spacing between comma and key (left align)

// incorrect
var obj = {A:1,b:2,C:3};
var obj = {A:1, b:2, C:3};
var obj = {A : 1, b : 2, C : 3};
var obj = { "A" : 1, "b" : 2, "C" : 3 };
var obj = { A : 1, b : 2, C : 3 };
var obj = { A :1, b :2, C :3 };
var obj = { A : 1 , b : 2 , C : 3 };

var obj = {
	A : 1,
	b : 2,
	C : 3,
};

var obj = {
	A : 1
	, b : 2
	, C : 3
};

//
// arrays
//

// OK

var arr = [ 1, 2, 3 ];

var arr = [
	1, 
	2, 
	3 
];

// NOT OK

var arr = [1,2,3];

var arr = [1, 2, 3];

var arr = [ 1 , 2 , 3 ];

var arr = [
	1, 
	2, 
	3,
];

var arr = [
	1
	, 2
	, 3
];

//
// if statements
//

// OK

if ( a === 0 ) {

	// this is good
	return true;

}

// NOT OK

if ( a === 0 ) {
	// this is bad: missing empty line after '{' 
	return true;

}

if ( a === 0 ) {

	// this is bad: missing empty line before '}'
	return true;
}

if ( a === 0 ) { // this is bad:  stuff after '{'

	return true;

}

if ( a === 0 ){

	// this is bad: no space before '{'
	return true;

}

if (test) { 

	// ... 

}

if( test ) { 

	// ... 

}

if (test ) { 

	// ... 

}

if ( test) { 

	// ... 

}

if ( test ){ 

	// ... 

}

if ( test ) { 

	// ... 

}else { 

	// ... 

}

if ( test ) { 

	// ... 

} else{ 

	// ... 

}

// follow each test with two newlines
if ( test ) {
	// ...
}
if ( test ) {
	// ...
}

var x = 5;


// pull statements above within 1 empty newline of if statement
if ( test ) {
	// test
}

//
// Functions
// 

// OK
function foo( a, b, c ) {

	return a + b + c;

}

// NOT OK

function foo ( a ) { return a; }


function foo ( a ) {
	return a;

}

function foo ( a ) {

	return a;
}
function foo ( a, b, c ) {

	// ...

}

function foo(a, b, c ) {

	// ...

}

function foo (a, b, c ) {

	// ...

}

function foo ( a, b, c ){

	// ...

}

//
// Unary expressions
//

// OK

var x = ! y;
x ++;
++ x;

// NOT OK

var x = !y;

x++;
++x;

// For Loops

// While Loops

// Switch statements

// delete

// OK

delete obj[ 'abc' ];
delete obj.abc;

// NOT OK

delete
	obj[ 'abc' ];
delete
	obj.abc;
