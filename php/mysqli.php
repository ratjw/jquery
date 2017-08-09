<?php
include "connect.php";
require_once "book.php";

	if (isset($_POST['nosqlReturnbook']))
	{
		echo json_encode(book($mysqli));
	}
	else if (isset($_POST['sqlReturnbook']))
	{
		$return = sqlexecute($mysqli, $_POST['sqlReturnbook']);
		if (strpos($return, "DBfailed") !== false)
			echo $return;
		else
			echo json_encode(book($mysqli));
	}
	else if (isset($_POST['sqlReturnData']))	//from view-history
	{
		echo sqlexecute($mysqli, $_POST['sqlReturnData']);
	}
	else if (isset($_POST['functionName']))
	{
		echo json_encode($_POST['functionName']($mysqli));
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
	$time = $_POST['time'];
	$result = $mysqli->query ("SELECT MAX(editdatetime) from bookhistory;");
	if ($result) {
		$stamp = $result->fetch_row();
		if ($time < $stamp[0]) {		//fetch_row result is an array
			return book($mysqli);	//there is an update
		}
		//no update if ($time > $stamp[0])
		//current time > TIMESTAMP of last entry
	} else {
		return "";	//no front-end update
	}
}

function findwaitnum($mysqli)
{
	$qn = $_POST['qn'];
	$editor = $_POST['editor'];

	$sql = "SELECT waitnum from bookhistory 
			where qn=$qn AND action='delete' 
			ORDER BY revision DESC LIMIT 1;";
	$result = $mysqli->query($sql);
	if (!$result) {
		return $mysqli->error;
	}
	$waitnum = $result->fetch_row();
	$waitnum = $waitnum[0];

	$sql = "UPDATE book SET waitnum=$waitnum, editor='$editor' WHERE qn=$qn";

	$result = $mysqli->query ($sql);
	if (!$result) {
		return $mysqli->error;
	}
	
	return book($mysqli);

}

function deletedCases($mysqli)
{
	$sql = "SELECT a.editdatetime, a.opdate, a.staffname, a.hn, a.patient, 
				a.diagnosis, a.treatment, a.contact, a.editor, a.qn 
			FROM (SELECT editdatetime, revision, b.* 
					FROM book b INNER JOIN bookhistory bh ON b.qn = bh.qn 
					WHERE b.waitnum IS NULL AND bh.action = 'delete') a 
				INNER JOIN (SELECT MAX(revision) mr, qn 
					FROM (SELECT editdatetime, revision, b.qn 
						FROM book b INNER JOIN bookhistory bh ON b.qn = bh.qn 
						WHERE b.waitnum IS NULL AND bh.action = 'delete') aa 
						GROUP BY qn) d 
				ON a.qn = d.qn 
				WHERE a.revision = d.mr 
			ORDER BY a.editdatetime DESC;";
	$result = $mysqli->query ($sql);
	if (!$result) {
		return $mysqli->error;
	}

	while ($rowi = $result->fetch_assoc()) {
		$case[] = $rowi;
	}

	return $case;
}
