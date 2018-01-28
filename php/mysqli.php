<?php
include "connect.php";
require_once "book.php";

	// start.js (initialize)
	if ($_POST['initialize'])
	{
		$sql = "UPDATE staff,(SELECT MAX(dateoncall) AS max FROM staff) as oncall
					SET staffoncall=staffname,
						dateoncall=DATE_ADD(oncall.max,INTERVAL 1 WEEK)
				WHERE dateoncall<=CURDATE();
				SELECT * FROM staff ORDER BY number;";
		$return = multiquery($mysqli, $sql);
		if (gettype($return) === "string") {
			echo $return;
		} else {
			$data = book($mysqli);
			$data["STAFF"] = $return;
			echo json_encode($data);
		}
	}
	// start.js (updating)
	else if (isset($_POST['nosqlReturnbook']))
	{
		echo json_encode(book($mysqli));
	}

	// click.js (saveRoomTime 2 ways, saveContentQN, saveContentNoQN 2 ways)
	// equip.js (Checklistequip)
	// menu.js (changeDate - $datepicker, changeDate - $trNOth, deleteCase)
	// sortable.js (sortable)
	else if (isset($_POST['sqlReturnbook']))
	{
		$return = multiquery($mysqli, $_POST['sqlReturnbook']);
		if (gettype($return) === "string") {
			echo $return;
		} else {
			echo json_encode(book($mysqli));
		}
	}

	// service.js (saveScontent)
	else if (isset($_POST['sqlReturnService'])) {
		$service = multiquery($mysqli, $_POST['sqlReturnService']);
		if (gettype($return) === "string") {
			echo $return;
		} else {
			$data = book($mysqli);
			$data["SERVICE"] = $service;
			echo json_encode($data);
		}
	}

	// equip.js (fillEquipTable)
	// history.js (editHistory, sqlFind)
	else if (isset($_POST['sqlReturnData'])) {
		echo json_encode(multiquery($mysqli, $_POST['sqlReturnData']));
	}

	// history.js (deletedCases, undelete)
	// start.js (updating)
	else if (isset($_POST['functionName'])) {
		echo json_encode($_POST['functionName']($mysqli, $_POST['opdate']));
	}

	// click.js (changeOncall)
	else if (isset($_POST['sqlnoReturn'])) {
		$return = multiquery($mysqli, $_POST['sqlnoReturn']);
		if (gettype($return) === "string") {
			echo $return;
		} else {
			echo "success";
		}
	}

function multiquery($mysqli, $sql)
{
	$rowi = array();
	$data = array();
	$returndata = array();
	$message = "";
	if ($mysqli->multi_query(urldecode($sql))) {
		do {
			// This will be skipped when no result, but no error (success query INSERT, UPDATE)
			if ($result = $mysqli->store_result())
			{
				while ($rowi = $result->fetch_assoc()) {
					$data[] = $rowi;
				}
				$returndata = array_merge($returndata, $data);
			}
			// if error, return error message
			// if has no result, but no error (INSERT, UPDATE), fall through
			else if ($mysqli->errno)
			{
				$message .= 'DBfailed multi query ' . $sql . " \n" . $mysqli->error;
			}
			// no more query
			if (!$mysqli->more_results()) {
				break;
			}
		// next query
		} while ($mysqli->next_result());
	}
	// handle failed first query
	else if ($mysqli->errno)
	{
		$message .= 'DBfailed first query ' . $sql . " \n" . $mysqli->error;
	}

	if ($mysqli->errno) {
		return $message;
	} else {
		return $returndata;
	}
}
/*
// $stamp = $result->fetch_row() is an array, so [0]
// return BOOK if there is an update
// no update if ($time > $stamp[0])
// that is current time > TIMESTAMP of last entry
function checkupdate($mysqli)
{
	$time = $_POST['time'];
	$result = $mysqli->query ("SELECT MAX(editdatetime) from bookhistory;");
	if ($result) {
		$stamp = $result->fetch_row();
		if ($time < $stamp[0]) {
			return book($mysqli);
		}
	} else {
		return $mysqli->error;
	}
}
*/
// current(): array.toString();
function undelete($mysqli, $opdate)
{
	$qn = $_POST['qn'];
	$editor = $_POST['editor'];

	$sql = "SELECT waitnum FROM bookhistory WHERE qn=$qn ORDER BY revision DESC LIMIT 1;";
	$result = $mysqli->query($sql);
	if (!$result) {
		return $mysqli->error;
	}
	$owaitnum = current($result->fetch_row());
	$neg_pos = $owaitnum ? $owaitnum / abs($owaitnum) : 1;

	$sql = "SELECT MAX(ABS(waitnum)) FROM book WHERE opdate='$opdate';";
	$result = $mysqli->query($sql);
	if (!$result) {
		return $mysqli->error;
	}
	$waitnum = current($result->fetch_row());
	$waitnum = ($waitnum  + 1) * $neg_pos;

	$sql = "UPDATE book SET waitnum=$waitnum, editor='$editor' WHERE qn=$qn";
	$result = $mysqli->query ($sql);
	if (!$result) {
		return $mysqli->error;
	}
	
	return book($mysqli);
}
/*
function deletedCases($mysqli)
{
	$case = array();
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
*/