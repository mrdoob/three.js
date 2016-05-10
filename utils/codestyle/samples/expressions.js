
// GOOD

a + b;

a + b +
	c + d;

x ++;
++ x;
! x;

a ? b : c;

a + ( - b ) + c;

new ( a ? b : c )();
delete a[ 'prop' ];

obj[ 'key' ];
obj.key;

foo( aaa, bbb, ccc );
foo( a,   b,   c );
foo(   a,   b,   c );

// BAD

! x

x++;
++x;
!x;

a?b:c;
a ? b: c;

// unary sign operators should have space after them
-a + b + ( -c );

obj['key'];
obj[ 'key'];
obj['key' ];
