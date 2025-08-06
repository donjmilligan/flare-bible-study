<?php
//ini_set('display_errors', 1);/// for debugging
//error_reporting(E_ALL);/// for debugging

require("bible_to_sql_service.php");
// Null coalescing operator (??): https://www.php.net/manual/en/migration70.new-features.php#migration70.new-features.null-coalesce-op
// Fetches $_GET['b'] value, else returns (defaults to) 't_kjv' if it does not exist.
$translation = $_GET['t'] ?? 't_kjv';
// Fetches $_GET['b'] value, else returns (defaults to) 'John 3:16'if it does not exist.
$verse_text = $_GET['b'] ?? 'John 3:16';
//split $verse_text at commas [not sure how to do it inline w/ Null coalescing operator]
$references=explode(",", $verse_text);
?>

<?php 
//return results
	$a ='<div class="col-12 col-md-6">
    		<div class="card nicescroll-box">
    			<div class="wrap">';
	$b= '		</div>
			</div>
	 	</div>';
 	$c= '<div class="card nicescroll-box">
			<div class="wrap">';
    $d= '	</div>
	 	</div>';
	$count= count($references);
	if($count > 1){
		$e='<div class="row">';
		$f=$a;
		$g=$b;
		$h='</div>';
	}else{
		$f=$c;
		$g=$d;
	}
	if (isset($e)) {
	    echo $e;
	}
	foreach ($references as $r) {
		echo $f;
								//stripslashes if any from manual input
								$verse = stripslashes($r);
								// create new object for making query
								$getverse = new Librarian;
								// prepare sql statement
								$getverse ->prepare($verse);
								// query specified translation
								// **only queries db if prepare was successful
								$getverse->translation($translation);
		echo $g;
	}
	if (isset($h)) {
	    echo $h;
	}
?>
