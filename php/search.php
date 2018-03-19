<?php
include "connect.php";
require_once "mysqli.php";

//$hn = "";
//$staffname = "";
//$others = "menigioma craniotomy";

	extract($_POST);

	if ($hn) {
		$sql .= "hn='$hn'";
	}
	if ($staffname) {
		if ($sql) { $sql .= " AND "; }
		$sql .= "staffname='$staffname'";
	}
	if ($others) {
		$data = getData($mysqli, $sql, $others);
	} else {
		if ($sql) {
			$data = search($mysqli, $sql);
		}
	}
//var_dump($data);
	echo $data;

function getData($mysqli, $sql, $others)
{
	$column = array("diagnosis","treatment","admission","final");
	$data = array();
	$wordArr = explode(" ", $others);

	// Create array for the names that are close to or match the search term
	$qns = array();

	$sqlx = "SELECT diagnosis,treatment,admission,final,qn FROM book";
	$sqlx .= ($sql ? " WHERE $sql;" : ";");

	if (!$result = $mysqli->query ($sqlx)) {
		return $mysqli->error;
	}

	while ($rowi = $result->fetch_assoc()) {
		$data[] = $rowi;
	}

	foreach($data as $col) {
		$allcols = "";
		// Add together
		foreach($column as $key) {
			$allcols .= $col[$key]." ";
		}

		$allcols = preg_replace("/[^A-Za-z0-9 ']/", ' ', $allcols);
		$allcols = preg_replace('/\s\s+/', ' ', $allcols);
		$allwords = explode(" ", $allcols);

		foreach ($wordArr as $val) {
			$match = false;
			foreach ($allwords as $word) {
				$leven = levenshtein($val, $word);
				if ($leven >= 0 && $leven <= 2) {
					$match = true;
					break;
				}
			}
			if (!$match) { break; }
		}
		if ($match === true) {
			array_push($qns, $col[qn]);
		}
	}
	// don't know why many " OR " phrases cause error (PHP to Mysql)
	$sql = "";
	foreach($qns as $qn) {
		$sql .= "SELECT * FROM book where qn=$qn;";
	}

	$return = multiquery($mysqli, $sql);
	if (gettype($return) === "string") {
		return $return;
	} else {
		return json_encode($return);
	}
}

function search($mysqli, $sql)
{
	$data = array();

	if (!$result = $mysqli->query ("SELECT * FROM book WHERE $sql;")) {
		return $mysqli->error;
	}

	while ($rowi = $result->fetch_assoc()) {
		$data[] = $rowi;
	}

	return json_encode($data);
}

/*
$word = strtolower(mysql_real_escape_string($_GET['term']));

$rs = mysql_query("SELECT LOWER(`term`) FROM `words` WHERE SOUNDEX(term) = SOUNDEX(" . $word . ")");

while ($row = mysql_fetch_assoc($rs)) { 

    $lev = levenshtein($word, $row['term']);

    ....

}

//-----------------------

// Users search terms is saved in $_POST['q']
$q = $_POST['q'];
// Create array for the names that are close to or match the search term
$results = array();
foreach($db->query('SELECT `id`, `name` FROM `users`') as $name) {
  // Keep only relevant results
  if (levenshtein($q, $name['name']) < 4) {
    array_push($results,$name['name']);
  }
}
// Echo out results
foreach ($results as $result) {
  echo $result."\n";
}

//-----------------------

if (levenshtein(metaphone($q), metaphone($name['name'])) < 4) {
  array_push($results,$name['name']);
}

or

if (similar_text(metaphone($q), metaphone($name)['name']) < 2) {
  array_push($results,$name['name']);
}

or

if (similar_text($q, $name['name']) > 2) {
 array_push($results,$name['name']);
}
*/
