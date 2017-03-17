<?php

	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");

	if ($mysqli->connect_errno) {
		printf("Connect failed: %s\n", $mysqli->connect_error);
		exit();
	}
	$column = $_GET["column"];
	$commons = $_GET["commons"];
	$listDxRx = "javascript:listDxRx";

	if ($column == "treatment")
	{
		$icdtable = "icd9cmneurosurgery";
		$icdtabledetail = "icd9cmneurosurgerydetail";
	}
	else if ($column == "diagnosis")
	{
		$icdtable = "icd10neurosurgery";
		$icdtabledetail = "icd10neurosurgerydetail";
	}

	if ((strlen($commons) >= 3) && ctype_digit(substr($commons, 1)))
	{
		if ($icdname = searchcode($mysqli, $icdtable, $commons))
		{
			$mysqli->close();
			exit (json_encode(encapsulate($icdname, $listDxRx)));
		}
	}

	$commarr = explode(" ", $commons);
	$wordarr = array();
	$words = "";
	foreach ($commarr as $common)
	{
		$wordarr = searchabbr($mysqli, $common);
		if ($wordarr)
		{
			if ($wordarr[0])
				$wordstr = implode(' ', $wordarr);
			$words .= " $wordstr";
		}
		else 
			$words .= " $common*";
	}
	$words = trim($words);
	$BOOL = "";
	if (strpos($words, "*") !== false)
		$BOOL = " IN BOOLEAN MODE";
	$words = str_replace("'", "\'", $words);
	$words = str_replace(" ", " +", $words);
	$words = "+".$words;
	$sql = "SELECT t.code, t.$column, d.$column,
			MATCH (d.$column) AGAINST ('$words'$BOOL) AS relevance
			FROM $icdtabledetail AS d
			LEFT JOIN $icdtable AS t
			ON d.code = t.code
			WHERE
			MATCH (d.$column) AGAINST ('$words'$BOOL)
			UNION
			SELECT t.code, t.$column, NULL,
			MATCH (t.$column) AGAINST ('$words'$BOOL) AS relevance
			FROM $icdtable AS t
			WHERE
			MATCH (t.$column) AGAINST ('$words'$BOOL)
			ORDER BY relevance DESC
			LIMIT 50;";

	if ($result = $mysqli->query ($sql))
	{
		$rowi = array();
		$data = array();
		while ($rowi = $result->fetch_row())
			$data[] = $rowi;
		echo (json_encode(encapsulate($data, $listDxRx)));
	}
	else
		echo 'failed: ' . $mysqli->error;
	
	$mysqli->close();

function searchcode($mysqli, $icdtable, $code)
{
	$result = $mysqli->query ("SELECT * FROM $icdtable WHERE code LIKE '%$code%' LIMIT 25;");
	if ($result)
	{
		$rowi = array();
		$data = array();
		while ($rowi = $result->fetch_row())
			$data[] = $rowi;
		return $data;
	}
}

function searchabbr($mysqli, $abbr)
{
	$result = $mysqli->query ("SELECT full FROM icdabbr WHERE abbr like '%$abbr%';");
	if ($result)
	{
		$rowi = array();
		$data = array();
		while ($rowi = $result->fetch_row())
			$data[] = $rowi[0];
		return $data;
	}
}

function encapsulate($data, $listDxRx)
{
	$icdname = array();
	foreach ($data as $val)
	{
		if ($val[2])
		{
			$val[1] = str_replace("'", "\\'", $val[1]);
			$val[2] = str_replace("'", "\\'", $val[2]);
			$codetxt = "$listDxRx('$val[0]', '$val[1]', '$val[2]')";
			$codetxt = "<a href=\"$codetxt\">$val[0] :: $val[2]</a>";
			if (strpos($val[2], '"') !== false)
			{
				$val[2] = str_replace('"', '\\"', $val[2]);
				$codetxt = "$listDxRx(\"$val[0]\", \"$val[1]\", \"$val[2]\")";
				$codetxt = "<a href='$codetxt'>$val[0] :: $val[2]</a>";
			}
		}
		else
		{
			$val[1] = str_replace("'", "\\'", $val[1]);
			$codetxt = "$listDxRx('$val[0]','$val[1]')";
			$codetxt = "<a href=\"$codetxt\">$val[0] :: $val[1]</a>";
			if (strpos($val[1], '"') !== false)
			{
				$val[1] = str_replace('"', '\\"', $val[1]);
				$codetxt = "$listDxRx(\"$val[0]\",\"$val[1]\")";
				$codetxt = "<a href='$codetxt'>$val[0] :: $val[1]</a>";
			}
		}
		$icdname[] = $codetxt;
	}
	return $icdname;
}
