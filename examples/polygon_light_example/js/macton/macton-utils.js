jQuery.getFiles = function( file_list, success )
{
  var results    = [];
  var file_count = file_list.length;

  var hold_file = function( ndx, data )
  {
    results[ndx] = data;
    file_count--;
    if ( file_count == 0 ) success( results );
  }    

  var get_file = function( ndx, url )
  {
    $.get( url, function( data ) { hold_file( ndx, data ); } );
  }

  for (var i=0;i<file_count;i++)
  {
    get_file( i, file_list[i] );
  } 
}

jQuery.TriggerEvent = function( event_name, event_parameters_array )
{
  $(document).trigger( event_name, event_parameters_array );
}

jQuery.BindEvent = function( event_name, callback_function )
{
  $(document).bind( event_name, callback_function );
}

jQuery.UnbindEvent = function( event_name )
{
  $(document).unbind( event_name );
}

function fieldCount( obj )
{
  var field_count = 0;
  for (k in obj) 
  {
    if (obj.hasOwnProperty(k))
    {
      field_count++;
    }
  }
  return (field_count);
}

// LD - Lukasz Stilger (javascript version) http://www.mgilleland.com/ld/ldjavascript.htm
// Levenshtein Distance http://www.merriampark.com/ld.htm 

function stringLD(t) 
{
  var s  = this;
  var dG = new Array();
  
  function Minimum(a, b, c) 
  {
    var mi;
    mi = a;
    if (b < mi)
      mi = b;
    if (c < mi)
      mi = c;
    return mi;
  }
 
  var d = new Array();
  var n; // length of s
  var m; // length of t
  var i; // iterates through s
  var j; // iterates through t
  var s_i; // ith character of s
  var t_j; // jth character of t
  var cost; // cost
 
 
  // Step 1
  n = s.length;
  m = t.length;
  if (n == 0) {
    return m;
  }
 
  if (m == 0) {
    return n;
  }
  
  //inicjacja tablicy dwu-wymiarowej w Javascript  
  for(i=0; i<=n; i++)
    d[i] = new Array();
 
 
  // Step 2
  for (i = 0; i <= n; i++) {
    d[i][0] = i;
  }
 
  for (j = 0; j <= m; j++) {
    d[0][j] = j;
  }
 
  // Step 3
  for (i = 1; i <= n; i++) {
 
    s_i = s.charAt(i - 1);
 
    
    // Step 4
    for (j = 1; j <= m; j++) {
 
      t_j = t.charAt(j - 1);
 
      // Step 5
      if (s_i == t_j) {
        cost = 0;
      }
      else {
        cost = 1;
      }
 
      // Step 6
      d[i][j] = Minimum (d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + cost);
    }
 
  }
  
  //przepisanie do tablicy globalnej
  for(i=1; i<=n; i++) {
    dG[i] = new Array();
    for(j=1; j<=m; j++)
      dG[i][j] = d[i][j];
  }
 
  // Step 7
  return d[n][m];
}

String.prototype.LD = stringLD;
