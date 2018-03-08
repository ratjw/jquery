<?php
include "connect.php";
require_once "book.php";
require_once "mysqli.php";

	$ipserver = gethostbyname($_SERVER['SERVER_NAME']);
	if (strpos($ipserver, "10.6") === false) {
		return;
	}

	$from = $_POST["from"];
	$to = $_POST["to"];
	$sql = $_POST["sql"];

	$result = $mysqli->query ("SELECT opdate, hn, admit, discharge, qn
		FROM book
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
		$oldAdmit = $case[$i][admit];
		$oldDischarge = $case[$i][discharge];
		if ($oldAdmit && $oldDischarge) {
			continue;
		}

		$opdate = $case[$i]["opdate"];
		$hn = $case[$i]["hn"];
		$qn = $case[$i]["qn"];
		$ipd = getipd($hn);

		if (empty($ipd[effectivestartdate])) {
			$newAdmit = null;
		} else {
			$DateTime = DateTime::createFromFormat('d/m/Y H:i:s', $ipd[effectivestartdate]);
			$newAdmit = $DateTime->format('Y-m-d');
		}
		if (empty($ipd[effectiveenddate])) {
			$newDischarge = null;
		} else {
			$DateTime = DateTime::createFromFormat('d/m/Y H:i:s', $ipd[effectiveenddate]);
			$newDischarge = $DateTime->format('Y-m-d');
		}

		$admit = "";
		$discharge = "";
		if ($oldAdmit !== $newAdmit) {
			$admit = "admit='$newAdmit',";
		}
		if (!$oldDischarge !== $newDischarge) {
				$discharge = "discharge='$newDischarge',";
		}
		$mysqli->query ("UPDATE book SET .$admit.$discharge.editor='getipd' WHERE qn=$qn;");
	}

 	echo returnService($mysqli, $sql);

//use json encode-decode to convert XML to assoc array
function getipd($hn)
{
	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);
	$resultx = $client->GetEncounterDetailByMRNENCTYPE($hn, "IMP");
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())
		$resulty = $resulty->children();
	$resultj = json_encode($resulty);

	return json_decode($resultj,true);
}
