<?php
//Bust cache in the head
     header ("Expires: Mon, 26 Jul 1997 05:00:00 GMT");    // Date in the past
     header ("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
     //always modified
     header ("Cache-Control: no-cache, must-revalidate");  // HTTP/1.1
     header ("Pragma: no-cache");                          // HTTP/1.0

	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
	if ($mysqli->connect_errno) {
		exit("Connect failed: %s\n". $mysqli->connect_error);
	}

    extract($_GET);

    $rowi =  array();
    $data =  array();
	$SETORFIELD =  array("clinictype","casetype","blood","anaesthetic",
				"wardadmit","or_type","sub_att","r_entry","status_or","qn");

	if(isset($qn_or))
	{
		$sqlqn= "SELECT * FROM ordetail WHERE qn = $qn_or;";
		$result =  $mysqli->query ($sqlqn);
		if ($result)
		{ 
			while ($rowi = $result->fetch_row())
			{
				$data["Orlist"][] = $rowi;
			}
			echo json_encode($data);
		}
		else
		{
			echo 'failed:load orlistdetail ' . $mysqli->error;
		}
	}
	else if(isset($flagdx))
	{
		$result = $mysqli->query ("SELECT code , diagnosis, 'icd10' as ftable  FROM icd10 i WHERE code ='0000' UNION
					   SELECT code ,treatment as diagnosis, 'icd9cm' as ftable FROM icd9cm i9 WHERE code ='0000' ORDER BY ftable;");
		if ($result)
		{
		    while ($rowi = $result->fetch_row())
		    {
				$data["code"][] = $rowi;
		    }
		    echo json_encode($data);
		}
		else
		{
		    echo 'failed:load DxOp10 ' . $mysqli->error;
		}
	}
	else if(isset($SETORLIST))
	{ //// code for insert update or table only
		$SETOR_Split = explode("%2C", $SETORLIST);
		$sqlchkstring ="Select qn From ordetail Where qn=$qn;";

		if($mysqli->query($sqlchkstring)->num_rows > 0){
			$sqlstring ="UPDATE ordetail SET ";
			for ($i=0; $i<count($SETORFIELD)-1; $i++)
			{
				if ($i)
				{
					$sqlstring .= ",";
				}
				$sqlstring .= "$SETORFIELD[$i]='".rawurldecode($SETOR_Split[$i])."'";
			} 
			$sqlstring .= " Where qn=$qn;";
			echo $sqlstring;
			if(!($mysqli->query($sqlstring)))
				echo 'failed to query sqlstring for update setORdata : ' . mysql_error();	
		}
		else
		{
			$sqlstring = "INSERT INTO ordetail VALUES (";
			for ($i=0; $i<count($SETORFIELD)-1; $i++)
			{
				if ($i)
				{
					$sqlstring .= ",";
				}
				$sqlstring .= "'".rawurldecode($SETOR_Split[$i])."'";
			} 
			$sqlstring .= ",$SETOR_Split[$i]);";
			echo $sqlstring;
			if(!($mysqli->query($sqlstring)))
				echo 'failed to query sqlstring for setORdata : ' . mysql_error();	
		}			
	}
    $mysqli->close();
