
<?php
//$hn = "4838912";
	$hn = $_GET["hn"];

	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);

	$resultx = $client->get_demographic_short($hn);
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())
		$resulty = $resulty->children();	//numeric array
	$resulty = json_encode($resulty);		//use json encode-decode
	$resultz = json_decode($resulty,true);	//to make assoc array

	$listlab = "<div>".$hn." ".$resultz["initial_name"]." ".$resultz["first_name"]." ".$resultz["last_name"];
	$listlab .= " ".$resultz["dob"]." ".$resultz["gender"];
	$listlab .= "</div>";
	$listlab .= "<button onclick=labclose()>Close</button>";

	$resultx = $client->get_lab_data($hn);
	$resulty = simplexml_load_string($resultx);				//_labwrapper____________________________________
															//|_____________________________________________|
	$listlab .= "<div id='labwrapper'>";					//| labdateheadbody	|labresultheadbody			|
	$listlab .= "<div id='labdateheadbody'>";				//|   labheader		|	labheader				|
	$listlab .= "<div class='labheader'>Date / Lab</div>";	//|_________________|___________________________|
	$listlab .= "<div id='labdate'>";						//|   labdate		|	labtext					|
	$temp = "";												//| 	labeachdate	|	labiframediv			|
	foreach($resulty as $each)								//| 	labeachdate	|		labiframe			|
	{	//to get value										//| 	labeachdate	|							|
		foreach ($each as $key=>$val)						//|_________________|___________________________|
		{
			if (($key == "hn") || ($key == "type") || ($key == "sid"))	//discarded value
				continue;
			if ($key == "report")
			{
				$listlab .= "<div class='labeachdate' title='$val' onclick='labresult(this.title)'>$temp</div>";
				$temp = "";
			}
			else
				$temp .= "|$val";
		}
	}
	$listlab .= "</div>";				//labdate
	$listlab .= "</div>";				//labdateheadbody
	$listlab .= "<div id='labresultheadbody'>";
	$listlab .= "<div class='labheader'>Result</div>";
	$listlab .= "<textarea readonly id='labtext'></textarea>";
	$listlab .= "<div id='labiframediv'>";
	$listlab .= "<iframe id='labiframe'></iframe>";
	$listlab .= "</div>";				//labiframediv
	$listlab .= "</div>";				//labresultheadbody
	$listlab .= "</div>";				//labwrapper
	echo $listlab;
?>
