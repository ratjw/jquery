<?php
include "connect.php";
require_once "book.php";

	// start.js (start)
	if (isset($_POST['start']))
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
		$return = multiquery($mysqli, $_POST['sqlReturnService']);
		if (gettype($return) === "string") {
			echo $return;
		} else {
			$data = book($mysqli);
			$data["SERVICE"] = $return;
			echo json_encode($data);
		}
	}

	// equip.js (fillEquipTable)
	// history.js (editHistory, sqlFind)
	else if (isset($_POST['sqlReturnData'])) {
		$return = multiquery($mysqli, $_POST['sqlReturnData']);
		if (gettype($return) === "string") {
			echo $return;
		} else {
			echo json_encode($return);
		}
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
