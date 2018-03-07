<?php
include "connect.php";
require_once "book.php";

	// start.js (start)
	if (isset($_POST['start'])) {
		echo start($mysqli, $_POST['start']);
	}
	// start.js (getUpdate)
	else if (isset($_POST['nosqlReturnbook']))
	{
		echo json_encode(book($mysqli));
	}

	// click.js (saveRoomTime 2 ways, saveContentQN, saveContentNoQN 2 ways)
	// equip.js (Checklistequip)
	// menu.js (changeDate - $datepicker, changeDate - $trNOth, deleteCase)
	// sortable.js (sortable)
	else if (isset($_POST['sqlReturnbook'])) {
		echo returnbook($mysqli, $_POST['sqlReturnbook']);
	}

	// service.js (saveScontent)
	// This also gets BOOK
	else if (isset($_POST['sqlReturnService'])) {
		echo returnService($mysqli, $_POST['sqlReturnService']);
	}

	// click.js (changeOncall)
	// equip.js (fillEquipTable)
	// history.js (editHistory, deletedCases, allCases, sqlFind)
	// service.js (getServiceOneMonth, updateDiff)
	// start.js (updating)
	else if (isset($_POST['sqlReturnData'])) {
		echo returnData($mysqli, $_POST['sqlReturnData']);
	}

function start($mysqli, $sql)
{
	$return = multiquery($mysqli, $sql);
	if (gettype($return) === "string") {
		return $return;
	} else {
		$data = book($mysqli);
		$data["STAFF"] = $return;
		return json_encode($data);
	}
}

function returnbook($mysqli, $sql)
{
	$return = multiquery($mysqli, $sql);
	if (gettype($return) === "string") {
		return $return;
	} else {
		return json_encode(book($mysqli));
	}
}

function returnService($mysqli, $sql)
{
	$return = multiquery($mysqli, $sql);
	if (gettype($return) === "string") {
		return $return;
	} else {
		$data = book($mysqli);
		$data["SERVICE"] = $return;
		return json_encode($data);
	}
}

function returnData($mysqli, $sql)
{
	$return = multiquery($mysqli, $sql);
	if (gettype($return) === "string") {
		return $return;
	} else {
		return json_encode($return);
	}
}

function multiquery($mysqli, $sql)
{
	$rowi = array();
	$data = array();
	if ($mysqli->multi_query(urldecode($sql))) {
		do {
			// This will be skipped when no result, but no error (success query INSERT, UPDATE)
			if ($result = $mysqli->store_result()) {
				while ($rowi = $result->fetch_assoc()) {
					$data[] = $rowi;
				}
			}
			// no more query
			if (!$mysqli->more_results()) {
				return $data;
			}
		// next query
		} while ($mysqli->next_result());
	}
	// handle failed first query
	if ($mysqli->errno) {
		return 'DBfailed first query ' . $sql . " \n" . $mysqli->error;
	}
}
