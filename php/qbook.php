<?php
//	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
//	if ($mysqli->connect_errno)
//		exit("Connect failed: %s\n". $mysqli->connect_error);
//	echo json_encode(qbook($mysqli));

function qbook($mysqli)
{
	date_default_timezone_set("Asia/Bangkok");

	$sql = "SELECT opdate,oproom,optime,staffname,
		qbook.hn AS hn,
		CONCAT_WS(' ',CONCAT(patient.initial_name,patient.first_name),
			patient.last_name) AS patientname,
		patient.dob AS dob,
		patient.gender AS gender,
		tel,
		qbook.qn AS qn
		FROM qbook 
		LEFT JOIN patient ON patient.hn = qbook.hn 
		WHERE opdate >= curdate()-interval 3 month AND waitnum IS NULL 
		GROUP BY qn ORDER BY opdate,oproom,optime,qn;";
	$rowi = array();
	$data = array();
	$diag = array();
	$trea = array();
	$equi = array();
	$qnar = array();
    if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
	{
		$data[] = $rowi;
		$qnar[] = $rowi["qn"];
	}
	if (!empty($data))
	{
		$maxx = max($qnar);
		$minn = min($qnar);
		$sql = "SELECT qn,code,diagnosis,side,level FROM qbookdx 
				WHERE qn BETWEEN $minn AND $maxx ORDER BY qn;";
		if (!$result = $mysqli->query ($sql))	return $mysqli->error;
		while($rowi = $result->fetch_assoc())
			$diag[] = $rowi;
		$sql = "SELECT qn,code,treatment,side,level FROM qbookrx 
				WHERE qn BETWEEN $minn AND $maxx ORDER BY qn;";
		if (!$result = $mysqli->query ($sql))	return $mysqli->error;
		while($rowi = $result->fetch_assoc())
			$trea[] = $rowi;
		$sql = "SELECT qn,code,name FROM qbookeq 
				WHERE qn BETWEEN $minn AND $maxx ORDER BY qn;";
		if (!$result = $mysqli->query ($sql))	return $mysqli->error;
		while($rowi = $result->fetch_assoc())
			$equi[] = $rowi;

		for ($i=0; $i<count($data); $i++)
		{
			$j = binary_search($diag, 0, count($diag)-1, $data[$i]["qn"]);
			if ($j >= 0)
			{
				while (($j > 0) && ($data[$i]["qn"] == $diag[$j-1]["qn"]))
					$j--;
				while ($data[$i]["qn"] == $diag[$j]["qn"])
				{
					$data[$i]["diagnosis"][] = array_slice($diag[$j], 1);
					$j++;
					if ($j > count($diag)-1)
						break;
				}
			}
			$j = binary_search($trea, 0, count($trea)-1, $data[$i]["qn"]);
			if ($j >= 0)
			{
				while (($j > 0) && ($data[$i]["qn"] == $trea[$j-1]["qn"]))
					$j--;
				while ($data[$i]["qn"] == $trea[$j]["qn"])
				{
					$data[$i]["treatment"][] = array_slice($trea[$j], 1);
					$j++;
					if ($j > count($trea)-1)
						break;
				}
			}
			$j = binary_search($equi, 0, count($equi)-1, $data[$i]["qn"]);
			if ($j >= 0)
			{
				while (($j > 0) && ($data[$i]["qn"] == $equi[$j-1]["qn"]))
					$j--;
				while ($data[$i]["qn"] == $equi[$j]["qn"])
				{
					$data[$i]["equip"][] = array_slice($equi[$j], 1);
					$j++;
					if ($j > count($equi)-1)
						break;
				}
			}
		}
	}

	if ($result = $mysqli->query ("SELECT now();"))
		$datu = current($result->fetch_row());	//array.toString()

	$sql = "SELECT IFNULL(waitnum, ''),opdate,oproom,optime,staffname,
		qbook.hn AS hn,
		CONCAT_WS(' ',CONCAT(patient.initial_name,patient.first_name),
			patient.last_name) AS patientname,
		patient.dob AS dob,
		patient.gender AS gender,
		tel,
		qbook.qn AS qn
		FROM qbook 
		LEFT JOIN patient ON patient.hn = qbook.hn 
		WHERE waitnum > 0 
		GROUP BY qn ORDER BY staffname, waitnum;";
	$rowi = array();
	$dati = array();
	$diag = array();
	$trea = array();
	$equi = array();
	$qnar = array();
    if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
	{
		$dati[] = $rowi;
		$qnar[] = $rowi["qn"];
	}
	if (!empty($dati))
	{
		$maxx = max($qnar);
		$minn = min($qnar);
		$sql = "SELECT qn,code,diagnosis,side,level FROM qbookdx 
			WHERE qn BETWEEN $minn AND $maxx ORDER BY qn;";
		if (!$result = $mysqli->query ($sql))	return $mysqli->error;
		while($rowi = $result->fetch_assoc())
			$diag[] = $rowi;
		$sql = "SELECT qn,code,treatment,side,level FROM qbookrx 
			WHERE qn BETWEEN $minn AND $maxx ORDER BY qn;";
		if (!$result = $mysqli->query ($sql))	return $mysqli->error;
		while($rowi = $result->fetch_assoc())
			$trea[] = $rowi;
		$sql = "SELECT qn,code,name FROM qbookeq 
			WHERE qn BETWEEN $minn AND $maxx ORDER BY qn;";
		if (!$result = $mysqli->query ($sql))	return $mysqli->error;
		while($rowi = $result->fetch_assoc())
			$equi[] = $rowi;

		for ($i=0; $i<count($dati); $i++)
		{
			$j = binary_search($diag, 0, count($diag)-1, $dati[$i]["qn"]);
			if ($j >= 0)
			{
				while (($j > 0) && ($dati[$i]["qn"] == $diag[$j-1]["qn"]))
					$j--;
				while ($dati[$i]["qn"] == $diag[$j]["qn"])
				{
					$dati[$i]["diagnosis"][] = array_slice($diag[$j], 1);
					$j++;
					if ($j > count($diag)-1)
						break;
				}
			}
			$j = binary_search($trea, 0, count($trea)-1, $dati[$i]["qn"]);
			if ($j >= 0)
			{
				while (($j > 0) && ($dati[$i]["qn"] == $trea[$j-1]["qn"]))
					$j--;
				while ($dati[$i]["qn"] == $trea[$j]["qn"])
				{
					$dati[$i]["treatment"][] = array_slice($trea[$j], 1);
					$j++;
					if ($j > count($trea)-1)
						break;
				}
			}
			$j = binary_search($equi, 0, count($equi)-1, $dati[$i]["qn"]);
			if ($j >= 0)
			{
				while (($j > 0) && ($dati[$i]["qn"] == $equi[$j-1]["qn"]))
					$j--;
				while ($dati[$i]["qn"] == $equi[$j]["qn"])
				{
					$dati[$i]["equip"][] = array_slice($equi[$j], 1);
					$j++;
					if ($j > count($equi)-1)
						break;
				}
			}
		}
	}

	$result = $mysqli->query ("SELECT code,name,specialty FROM staff ORDER BY code;");
	if (!$result)
		exit ('failed:load staff list ' . $mysqli->error);
	while ($rowi = $result->fetch_row())
		$dats["staff"][] = $rowi;

	$allarray["QBOOK"] = $data;
	$allarray["QTIME"] = $datu;
	$allarray["QWAIT"] = $dati;
	$allarray["STAFF"] = $dats;

	return $allarray;
}

function binary_search(array $arr, $first, $last, $key)
{
	$lo = $first; 
	$hi = $last;

	while ($lo <= $hi)
	{
		$mid = (int)(($hi - $lo) / 2) + $lo;
		$mqn = $arr[$mid]["qn"];
		if ($mqn < $key)
			$lo = $mid + 1;
		elseif ($mqn > $key)
			$hi = $mid - 1;
		else
			return $mid;
	}
	return -($lo + 1);
}
