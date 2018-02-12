<?php
include "connect.php";
require_once "book.php";

	$from = $_POST["from"];
	$to = $_POST["to"];

	$result = $mysqli->query ("SELECT opdate, hn, admit, discharge, qn from book
		WHERE opdate BETWEEN '$from' AND '$to';");

	if (!$result) {
		return;
	}

	while ($rowi = $result->fetch_assoc()) {
		$case[] = $rowi;
	}

	$update = false;
	for ($i = 0; $i < count($case); $i++)
	{
		$OldAdmit = $case[$i][admit];
		$OldDischarge = $case[$i][discharge];
		if ($OldAdmit && $OldDischarge) {
			continue;
		}

		$opdate = $case[$i]["opdate"];
		$hn = $case[$i]["hn"];
		$qn = $case[$i]["qn"];
		$ipd = getipd($hn);

		if (empty($ipd[effectivestartdate])) {
			$admit = null;
		} else {
			$DateTime = DateTime::createFromFormat('d/m/Y H:i:s', $ipd[effectivestartdate]);
			$admit = $DateTime->format('Y-m-d');
		}
		if (empty($ipd[effectiveenddate])) {
			$discharge = null;
		} else {
			$DateTime = DateTime::createFromFormat('d/m/Y H:i:s', $ipd[effectiveenddate]);
			$discharge = $DateTime->format('Y-m-d');
		}
//echo "admit ".$admit." discharge ".$discharge;exit;
		$date1 = date_create($admit);
		$date2 = date_create($opdate);
		$diff = date_diff($date1, $date2);
		$datediff = $diff->format("%R%a");

		if (($datediff < 0) || ($datediff > 30)) {
			continue;
		}

		if (!$OldAdmit) {
			if (!$OldDischarge && $discharge) {
				if ($admit) {
					$mysqli->query ("UPDATE book SET admit = '$admit', discharge = '$discharge' WHERE qn = $qn;");
				}
			} else {
				if ($admit) {
					$mysqli->query ("UPDATE book SET admit = '$admit' WHERE qn = $qn;");
				}
			}
		} else {
			if (!$OldDischarge && $discharge) {
				$mysqli->query ("UPDATE book SET discharge = '$discharge' WHERE qn = $qn;");
			}
		}
	}

 	echo json_encode(book($mysqli));

function getipd($hn)
{
	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);
	$resultx = $client->GetEncounterDetailByMRNENCTYPE($hn, "IMP");
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())			//find last children
		$resulty = $resulty->children();
	$resultj = json_encode($resulty);		//use json encode-decode to
	return json_decode($resultj,true);		//convert XML to assoc array
}
