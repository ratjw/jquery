<?php
include "connect.php";
require_once "book.php";

	// start.js (start)
	// xstart.js (start)
	if (isset($_POST['start'])) {
		echo start($mysqli, $_POST['start']);
	}
	// xstart.js (getUpdate)
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
	// start.js (getUpdate)
	// This also gets BOOK
	else if (isset($_POST['sqlReturnService'])) {
		echo returnService($mysqli, $_POST['sqlReturnService']);
	}

	// click.js (changeOncall)
	// equip.js (getEditedBy)
	// history.js (editHistory, deletedCases, allCases, sqlFind)
	// service.js (getServiceOneMonth)
	// start.js (updating)
	// xequip.js (getEditedBy)
	// xstart.js (updating)
	else if (isset($_POST['sqlReturnData'])) {
		echo returnData($mysqli, $_POST['sqlReturnData']);
	}

	// start.js (doadddata)
	else if (isset($_POST['sqlReturnStaff'])) {
		echo returnStaff($mysqli, $_POST['sqlReturnStaff']);
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

function returnStaff($mysqli, $sql)
{
	$return = multiquery($mysqli, $sql);
	if (gettype($return) === "string") {
		return $return;
	} else {
		$data["STAFF"] = $return;
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
/*
function setConsultant()
{
	var	todate = new Date().ISOdate(),

	
}

function sqlNextOncall()
{
	var	nextSat = getNextDayOfWeek(new Date(), 6).ISOdate(),
		sql = ""

	gv.STAFF.forEach(function(staff, i) {
		if (staff.active) {
			sql += "UPDATE staff SET "
				+ "dateoncall='" + nextSat.nextdays(7*(staff.number-1))
				+ "' WHERE number=" + staff.number
		}
	})

	return sql
}

function getStaffOncall()
{
	var a = []

	gv.STAFF.forEach(function(staff, i) {
		a.push(staff.staffname)
	})

	return a
}

function getDateOncall()
{
	var a = []

	gv.STAFF.forEach(function(staff, i) {
		a.push(staff.dateoncall)
	})

	return a
}
