<?php

require_once "book.php";

	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
	if ($mysqli->connect_errno)
		exit("Connect failed: %s\n". $mysqli->connect_error);

	if (isset($_GET['nosqlReturnbook']))
	{
		echo json_encode(book($mysqli));
	}
	else if (isset($_GET['sqlReturnbook']))
	{
		$return = sqlexecute($mysqli, $_GET['sqlReturnbook']);
		if (strpos($return, "DBfailed") !== false)
			echo $return;
		else
			echo json_encode(book($mysqli));
	}
	else if (isset($_GET['sqlReturnData']))	//from edithistory
	{
		echo sqlexecute($mysqli, $_GET['sqlReturnData']);
	}
	else if (isset($_GET['functionName']))
	{
		echo json_encode($_GET['functionName']($mysqli));
	}

function sqlexecute($mysqli, $sql)
{
	$returndata = "";
	if ($mysqli->multi_query(urldecode($sql))) {
		do {
			if ($result = $mysqli->store_result())
			{	//has no result, but no error (success query INSERT, UPDATE), skip this
				$rowi = array();
				$data = array();
				while ($rowi = $result->fetch_assoc())
					$data[] = $rowi;
				$returndata .= json_encode($data);
			}
			else if ($mysqli->errno)
			{
				$returndata .= 'DBfailed multi query ' . $sql . " \n" . $mysqli->error;
			}

			if (!$mysqli->more_results()) {
				break;
			}
		} while ($mysqli->next_result());
	}
	else if ($mysqli->errno)
	{
		$returndata .= 'DBfailed first query ' . $sql . " \n" . $mysqli->error;
	}
	return $returndata;
}

function checkupdate($mysqli)
{
	$time = $_GET['time'];
	$result = $mysqli->query ("SELECT MAX(editdatetime) from bookhistory;");
	if ($result)
	{
		$stamp = $result->fetch_row();
		if ($time < $stamp[0])		//fetch_row result is an array
			return book($mysqli);	//there is an update
	}	//no update if current time > TIMESTAMP of last entry, check another

	return "";	//no front-end update
}
