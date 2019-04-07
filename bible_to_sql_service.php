<?php

abstract class Servant {

    protected $host; // MYSQL Hostname: from line 25
    protected $user; // MYSQL Username: from Line 26
    protected $pass; // MYSQL Password: from Line 27
    protected $db;   // MYSQL Database: from Line 28
    protected $mysqli; //MYSQLI object
    protected $connected=false;
    public $error = false; //end of mysqli related
    protected $table;
    protected $book = null; // begin bible variables
	protected $bookName = null;
	protected $chapter = null;
	protected $chapterHuman = null;
	protected $verse = 001;
	protected $endverse = 999;
	protected $range = FALSE;
	protected $prepared=FALSE;
	/** 
     * Init connect variables upon new object. 
     */
    public function __construct(){
        $this->host='localhost';
        $this->user='bible';
        $this->pass='bible';
        $this->db='bible';
    }
    /** 
     * MYSQLI Connect ---- to db via mysqli 
     */
    private function connect(){
        $this->mysqli = new mysqli($this->host, $this->user, $this->pass, $this->db);
        if (!$this->mysqli) {  // if no connection
            if ($this->error) { $this->error($type=1); } 
            return false;
        }
        //echo "connected <br />";  
    }
    /** 
     * MYSQLI Close ---- the mysqli connection 
     */
    private function close() {
        if ($this->mysqli){ 
        	if ($this->mysqli->close()){
        	}else { 
        		if($this->error){return $this->error($type=4);}  }
        	}
    }
    /** 
     * MYSQLI error types ---- display for failed mysqli connection 
     */
   public function error($type=''){ 
        if (empty($type)) { return false;}
        else { //Choose error type
            if ($type==1){  echo "<strong>Database could not connect</strong> "; }
            else if ($type==2){ echo "<strong>mysql error</strong> " . mysql_error(); }
            else if ($type==3){ echo "<strong>error </strong>, Proses has been stopped"; }
            else{ echo "<strong>error </strong>, no connection !!!"; }
        }
	}
	// Method used in testing to see if prepare has finished.
	public function showState() {
	    return $this->prepared;
	}
	//
	// BEGIN BIBLE DB FUNCTIONS
	/* CONVERT
	 * During processing, converts Book to Number || Number to Book
	 */
	private function convert($table, $selCol , $whrCol, $matches){
	    self::connect(); //connect to db
	    //set mysql string, then escape any counterfiet input on the next line.
	    $sql = "SELECT ".$selCol ." FROM ".$table." WHERE ".$whrCol."=?";
	    $sql = $this->mysqli->real_escape_string($sql);
	    $stmt = $this->mysqli->stmt_init();
	    if($stmt->prepare($sql)){
	    $stmt->bind_param("s", $matches);
	    $stmt->execute();
	    $stmt->bind_result($id);
	    $stmt->fetch();
	    return $id;
	    $stmt->close();
		}else{ die('convert() failed on mysqli->prepare: ' . htmlspecialchars($this->mysqli->error));  }	    

		self::close();
	}
	/* ADVENT
	 * the Word manifests from here :)
	 */
	private function advent($table = NULL){
	    self::connect(); //connect to db
	    if ($this->range) {
			$sql = "SELECT * FROM `".$table."` WHERE id BETWEEN ".$this->book.$this->chapter.$this->verse." and ".$this->book.$this->chapter.$this->endverse."";
		} else {
			$sql = "SELECT * FROM `".$table."` WHERE id=".$this->book.$this->chapter.$this->verse."";
		}
		$sql = $this->mysqli->real_escape_string($sql);
	    //set mysql string
	   $stmt = $this->mysqli->stmt_init();
	    $stmt->prepare($sql);
		$stmt->execute();
        
        /* bind variables to prepared statement */
        $stmt->bind_result($id, $b, $c, $v, $t);
        $hubBook = str_replace(' ', '_', $this->getBook());
        $hubBook = strtolower($hubBook);
    	echo "</article>
    			<h5>{$this->getBook()} {$this->getChapter()}</h5>";
    	/* fetch values */
        while ($stmt->fetch()){ 
           // printf("%s %s\n", $v, $t); 
            print "<span class=\"versetext\"><a target=\"_blank\" rel=\"noopener noreferrer\"  href=\"https://biblehub.com/text/$hubBook/{$this->getChapter()}-$v.htm\" title=\"Original Texts for {$this->getBook()} {$this->getChapter()}-$v\" class=\"versenum\">$v</a> ${t}</span>";
	    } 
	    echo "</article>";

		self::close();
    	
		
	}
	// begin public bible functions

	/** PREPARE
     * Reference Processor
     */
	public function prepare($string, $range = NULL){
			//places a . between book name and reference. 
			//i.e. changes "Song of Solomon 9:6" to "Song of Solomon.9:6"
			$string = preg_replace('/\s(\S*)$/', '.$1', trim($string)); //trim end for sanitization.	
			//split
			$separatedArray = explode(".",$string);
			// converts book name to number
			$this->book = $this->addZeros($this->convert("key_abbreviations_english","b","a",$separatedArray[0]),2); 
			// converts to book name (human readable)
			$this->bookName = $this->convert("key_english","n","b",$this->book);

			//split chapter and verse
			$separatedVerse = explode(":",$separatedArray[1]);
			$this->chapterHuman = $separatedVerse[0];
			$this->chapter = $this->addZeros($separatedVerse[0],3);
			//determine if single or range
			if (strpos($string, '-') !== FALSE) {
					$range = TRUE;
				}
			
			if (!$separatedVerse[1]) {
				$range = TRUE;
			}
			
			//set range
			$this->range = $range;
			
			if ($range) {
				$anotherSplit = explode("-",$separatedVerse[1]);
				$this->verse = $this->addZeros($anotherSplit[0],3);
					if ($anotherSplit[1]) {
						$this->endverse = $this->addZeros($anotherSplit[1],3);
					}
			} else {
				$this->verse = $this->addZeros($separatedVerse[1],3);
			}
			$this->prepared=1;
	}
	/* Translation
	 * Translation table marked for advent
	 */
	public function translation($table = NULL){
		if($this->prepared==FALSE){die('$r needs to be sent to prepare first');}else if($table==NULL){die('specify a table');}
		$table= stripslashes($table);
		$this->advent($table);
	}
	
	/** ADDZEROS
	 * Adds zeros to input
	 */
	private function addZeros($input,$max) {		
		$len = strlen($input);
		for ($len; $len < $max; $len++) {
			$input = "0".$input;
		}	
		return $input;	
	}	

	public function getBook() {
		return $this->bookName;
	}
	
	public function getChapter() {
		return $this->chapterHuman;
	}
	
	public function getVerse() {
		return $this->verse;
	}
	
	public function getEndVerse() {
		return $this->endverse;
	}
	
	public function getRange() {
		return $this->range;
	}
	/** 
	 * used in testing to see if db request will complete ** CHANGE TO PUBLIC FUNCTION FOR TESTING**
	 */
	private function querytest($tableName){
	    self::connect(); //connect to db
	    //set mysql string
	    $sql = "SELECT * FROM `".$tableName."` WHERE `b` = 1 AND `c` = 1 AND `v` = 2";
	    //do query and pass to $result
	    $result=  $this->mysqli->query($sql);
	    //run query else show error and exit
	    if ($result->num_rows > 0) {
	        // output data of each row
	        while($row = $result->fetch_assoc()) {
	            echo "<br/><br/><br/>Verse Text: " . $row["t"]. "<br><br/><br/><br/>";
	        }
	    } else {
	        echo "0 results";
		}
	}

	
	//// END Servant
}


class Librarian extends Servant{
    protected $reference;
    public function __construct(){ parent::__construct(); }
    
    public function setReference($r) { $this->reference=$r; }
    public function getValue() { return "I'm a librarian"; }
    public function getReference() {return $this->reference;}
}

?>
