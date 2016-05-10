
// GOOD

a + b;

a + b +
	c + d;

x ++;
++ x;
! x;

a ? b : c;

new ( a ? b : c )();
delete a[ 'prop' ];

obj[ 'key' ];
obj.key;

// BAD

! x

x++;
++x;
!x;

a?b:c;
a ? b: c;

obj['key'];
obj[ 'key'];
obj['key' ];
