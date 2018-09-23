<?php
	$servername = "localhost";
	$username = "root";
	$password = "Zaq1@wsx";
	$dbname = "neurosurgery";

	$mysqli = new mysqli($servername, $username, $password, $dbname);
	$mysqli->query("SET CHARACTER SET utf8");

	if ($mysqli->connect_errno)
		exit("Connect failed: %s\n". $mysqli->connect_error);

    $file = 'staff.csv';
    $size = filesize($file);
    echo 'Filename: '.$file.'; Filesize: '.$size.' Bytes <br><br><br>';

    $f = fopen ($file, "r");
    $i = 0;

	//eliminate notepad header of utf-8
    while (ord(fgetc($f)) > 128) {
		$i++;
    }
    fseek($f,$i);
    while($line = fgets($f, 255)) {
		$data = explode(",", $line);
		$data = array_map("trim", $data);
		if (!array_filter($data))
			continue;
		$sql = 'INSERT INTO staff
					(number, staffname, specialty, oncall, startoncall)
				VALUES ('
					.$data[0].',"'.$data[1]
					.'","'.$data[2].'","'.$data[3]
					.'","'.$data[4].'");';
		$result = $mysqli->query($sql);
		if (!$result) {
			return $mysqli->error;
		}
		echo $sql."<br>";
    }

    print 'Wrote data from CSV-File into MySQL';
    fclose ($f);

?>
