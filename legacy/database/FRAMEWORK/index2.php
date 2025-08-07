<?php
/**
 * example.php
 * Displays some examples of class.db.php usage
 *
 * @author Bennett Stone
 * @version 1.0
 * @date 18-Feb-2013
 * @package class.db.php
 **/

define( 'DB_HOST', 'localhost' ); // set database host
define( 'DB_USER', 'hpcom' ); // set database user
define( 'DB_PASS', 'Genesis1:1*8' ); // set database password
define( 'DB_NAME', 'bible' ); // set database name
define( 'SEND_ERRORS_TO', 'example@example.com' ); //set email notification email address
define( 'DISPLAY_DEBUG', true ); //display db errors?

require_once( 'class.db.php' );

//Initiate the class
$database = new DB();

//OR...
//$database = DB::getInstance();
////////////////////////////////////////////
////////////////////////////////////////////
require("bible_to_sql.php");
//echo "b: ".$_GET['b']." r: ".$_GET['r']."<br />";


//split at commas
$references = explode(",",$_GET['b']);





/*

//T ***runcating tables
// ***Commented out intentionally (just in case!)
//Truncate a single table, no output display
//$truncate = $database->truncate( array('example_phpmvc') );
//Truncate multiple tables, display number of tables truncated
//echo $database->truncate( array('example_phpmvc', 'my_other_table') );


//List the fields in a table
$fields = $database->list_fields( "SELECT * FROM example_phpmvc" );
echo '<pre>';
print_r( $fields );
echo '</pre>';


//Output the number of fields in a table
echo $database->num_fields( "SELECT * FROM example_phpmvc" );

//Display the number of queries performed by the class
//Applies across multiple instances of the DB class
echo '<hr />' . $database->total_queries();
*/

?>
<html>
<head>
<title>Bible Search</title>
</head>
<body>
<header>
<form action="index.php" action="GET">
<!-- TODO: Bible dropdown. Defaults to KJV. -->
<label for="b">Reference(s): </label><input type="text" name="b" value="<?php if ($_GET['b']) { echo $_GET['b']; } else { echo $default_text; } ?>" /><input type="submit" value="Search" /><br />

</form>
</header>
<main>
<?php
/**
 * Checking to see if a table exists
 */
if( !$database->table_exists( 'key_english' ) )
{
    //Run a table install, the table doesn't exist
    echo 'table doesnt exist';
}else{echo "table exists";}

//Output the number of fields in a table
//echo $database->num_fields( "SELECT * FROM key_abbreviations_english" );

?>
</main>
<footer>
<form action="index.php" action="GET">
<!-- TODO: Bible dropdown. Defaults to KJV. -->
<label for="b">Reference(s): </label><input type="text" name="b" value="<?php if ($_GET['b']) { echo $_GET['b']; } else { echo "John 3:16"; } ?>" /><input type="submit" value="Search" /><br />

</form>
</footer>
</body>
</html>