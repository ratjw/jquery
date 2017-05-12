<?php
include "connect.php";
require_once "book.php";

	$from = $_GET["from"];
	$to = $_GET["to"];

	$result = $mysqli->query ("SELECT hn, admit, discharge, qn from book
		WHERE opdate BETWEEN '$from' AND '$to';";

	if (!$result) {
		return
	}

	while ($rowi = $result->fetch_assoc()) {
		$case[] = $rowi;
	}

	$update = false;
	for ($i = 0; $i < $case.length; $i++)
	{
		$OldAdmit = $case[$i].admit;
		$OldDischarge = $case[$i].discharge;
		if (!$OldAdmit || !$OldDischarge) {
			$hn = $case[$i][hn];
			$qn = $case[$i][qn];
			$ipd = getipd($hn);
			$newadmit = $ipd[admission_date];
			$newdischarge = $ipd[discharge_date];
		} else {
			continue;
		}
		if (!$OldAdmit) {
			if (!$OldDischarge) {
				$mysqli->query ("UPDATE book SET admit = '$admit', discharge = '$discharge' WHERE qn = $qn;")
			} else {
				$mysqli->query ("UPDATE book SET admit = '$admit', discharge = '$discharge' WHERE qn = $qn;")
			}

			if (!$case[$i].admit && !$case[$i].discharge) {
				if () {
				}
				$mysqli->query ("UPDATE book SET admit = '$admit', discharge = '$discharge' WHERE qn = $qn;")
			}
			elseif ($case[$i].admit && !$case[$i].discharge) {
				$mysqli->query ("UPDATE book SET admit = '$admit' WHERE qn = $qn;";)
			}
			elseif (!$case[$i].admit && $case[$i].discharge) {
				$mysqli->query ("UPDATE book SET discharge = '$discharge' WHERE qn = $qn;";)
			}
		} else {
			if (!$OldDischarge) {
				$mysqli->query ("UPDATE book SET admit = '$admit', discharge = '$discharge' WHERE qn = $qn;")
			}
		}
	}


function getipd($hn)
{
	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);
	$resultx = $client->Get_demographic_short($hn);
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())			//find last children
		$resulty = $resulty->children();
	$resultj = json_encode($resulty);		//use json encode-decode to make
	return json_decode($resultj,true);		//numeric array	into assoc array
/*
	array(16) { ["an"]=> string(7) "1788094" ["iseq"]=> string(1) "0" ["admission_date"]=> string(10) "2017-04-29" ["attending_doc_code"]=> string(6) "004606" ["attending_doc_name"]=> string(59) "เกรียงศักดิ์ แซ่เตีย" ["referring_doc_code"]=> array(0) { } ["referring_doc_name"]=> array(0) { } ["referring_doc_dept_code"]=> array(0) { } ["referring_doc_dept_name"]=> array(0) { } ["primary_location"]=> array(0) { } ["current_location"]=> string(3) "9SE" ["current_loc_tel_no"]=> string(21) "02-2011501,02-2011591" ["discharge_date"]=> array(0) { } ["discharge_time"]=> array(0) { } ["current_bed"]=> string(2) "12" ["enc_type"]=> string(3) "IMP" } 
*/
}
