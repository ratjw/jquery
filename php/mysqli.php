<?php
include "connect.php";
require_once "book.php";

	//start.js (initialize)
	if (isset($_POST['nosqlReturnbook']))
	{
		echo json_encode(book($mysqli));
	}
	//click.js (saveRoomTime 2 ways, saveContentQN, saveContentNoQN 2 ways)
	//equip.js (Checklistequip)
	//menu.js (changeDate - $datepicker, changeDate - $trNOth, deleteCase)
	//service.js (saveScontent)
	//sortable.js (sortable)
	else if (isset($_POST['sqlReturnbook']))
	{
		$return = multiquery($mysqli, $_POST['sqlReturnbook']);
		if (strpos($return, "DBfailed") !== false)
			echo $return;
		else
			echo json_encode(book($mysqli));
	}
	//equip.js (fillEquipTable)
	//history.js (editHistory, sqlFind)
	else if (isset($_POST['sqlReturnData']))
	{
		echo multiquery($mysqli, $_POST['sqlReturnData']);
	}
	//history.js (deletedCases, undelete)
	//start.js (updating)
	else if (isset($_POST['functionName']))
	{
		echo json_encode($_POST['functionName']($mysqli, $_POST['opdate']));
	}

function multiquery($mysqli, $sql)
{
	$returndata = "";
	if ($mysqli->multi_query(urldecode($sql))) {
		//multiple queries
		do {
			if ($result = $mysqli->store_result())
			{	//has no result, but no error (success query INSERT, UPDATE), skip this
				$rowi = array();
				$data = array();
				while ($rowi = $result->fetch_assoc()) {
					$data[] = $rowi;
				}
				$returndata .= json_encode($data);
			}
			//if error, return error message
			//if has no result, but no error (INSERT, UPDATE), fall through
			else if ($mysqli->errno)
			{
				$returndata .= 'DBfailed multi query ' . $sql . " \n" . $mysqli->error;
			}
			//nom more query
			if (!$mysqli->more_results()) {
				break;
			}
		//next query
		} while ($mysqli->next_result());
	}
	//handle failed first query
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

function undelete($mysqli, $opdate)
{
	$qn = $_POST['qn'];
	$editor = $_POST['editor'];

	$sql = "SELECT waitnum FROM bookhistory WHERE qn=$qn ORDER BY revision DESC LIMIT 1;";
	$result = $mysqli->query($sql);
	if (!$result) {
		return $mysqli->error;
	}
	$owaitnum = current($result->fetch_row());	//array.toString();
	$neg_pos = $owaitnum ? $owaitnum / abs($owaitnum) : 1;

	$sql = "SELECT MAX(ABS(waitnum)) FROM book WHERE opdate='$opdate';";
	$result = $mysqli->query($sql);
	if (!$result) {
		return $mysqli->error;
	}
	$waitnum = current($result->fetch_row());	//array.toString();
	$waitnum = ($waitnum  + 1) * $neg_pos;

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
