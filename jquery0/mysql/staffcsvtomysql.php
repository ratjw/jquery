<?php

    $conn = mysql_connect("localhost", "root", "Zaq1@wsx");
	if (!$conn)
	    echo "failed to connect the database";

    mysql_query("use neurosurgery")
		or die('failed to opendb: ' . mysql_error());

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
					(number, active, code, staffname, specialty, staffoncall)
				VALUES ('
					.$data[0].',"'.$data[1]
					.'","'.$data[2].'","'.$data[3]
					.'","'.$data[4].'","'.$data[5].'");';
		mysql_query($sql) 
			or die (mysql_error());
    }

    print 'Wrote data from CSV-File into MySQL';
    fclose ($f);

    mysql_close($conn);

?>
