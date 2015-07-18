#!/bin/sh

cd `dirname $0`/../../
perl -MIO::All -e 'io(":8080")->fork->accept->(sub { $_[0] < io(-x $1 
+? "./$1 |" : $1) if /^GET \/(.*) / })'