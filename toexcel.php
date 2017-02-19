//1. Preparing the data
<?PHP
  $data = [
    ["firstname" => "Mary", "lastname" => "Johnson", "age" => 25],
    ["firstname" => "Amanda", "lastname" => "Miller", "age" => 18],
    ["firstname" => "James", "lastname" => "Brown", "age" => 31],
    ["firstname" => "Patricia", "lastname" => "Williams", "age" => 7],
    ["firstname" => "Michael", "lastname" => "Davis", "age" => 43],
    ["firstname" => "Sarah", "lastname" => "Miller", "age" => 24],
    ["firstname" => "Patrick", "lastname" => "Miller", "age" => 27]
  ];
?>

<?PHP
  header("Content-Type: text/plain");

  $flag = false;
  foreach($data as $row) {
    if(!$flag) {
      // display field/column names as first row
      echo implode("\t", array_keys($row)) . "\r\n";
      $flag = true;
    }
    echo implode("\t", array_values($row)) . "\r\n";
  }
  exit;
?>

<?PHP
  function cleanData(&$str)
  {
    $str = preg_replace("/\t/", "\\t", $str);
    $str = preg_replace("/\r?\n/", "\\n", $str);
  }

  header("Content-Type: text/plain");

  $flag = false;
  foreach($data as $row) {
    if(!$flag) {
      // display field/column names as first row
      echo implode("\t", array_keys($row)) . "\r\n";
      $flag = true;
    }
    array_walk($row, __NAMESPACE__ . '\cleanData');
    echo implode("\t", array_values($row)) . "\r\n";
  }
  exit;
?>

//2. Triggering a download
<?PHP
  function cleanData(&$str)
  {
    $str = preg_replace("/\t/", "\\t", $str);
    $str = preg_replace("/\r?\n/", "\\n", $str);
    if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
  }

  // filename for download
  $filename = "website_data_" . date('Ymd') . ".xls";

  header("Content-Disposition: attachment; filename=\"$filename\"");
  header("Content-Type: application/vnd.ms-excel");

  $flag = false;
  foreach($data as $row) {
    if(!$flag) {
      // display field/column names as first row
      echo implode("\t", array_keys($row)) . "\r\n";
      $flag = true;
    }
    array_walk($row, __NAMESPACE__ . '\cleanData');
    echo implode("\t", array_values($row)) . "\r\n";
  }
  exit;
?>

<p style="text-align: center;"><button onclick="self.location.href = '/php/dataexport/1/';">click here to trigger XLS download</button>
<small><a href="/dataexport1.phps">source</a></small></p>

//3. Exporting from an SQL database
<?PHP
  // Original PHP code by Chirp Internet: www.chirp.com.au
  // Please acknowledge use of this code by including this header.

  function cleanData(&$str)
  {
    $str = preg_replace("/\t/", "\\t", $str);
    $str = preg_replace("/\r?\n/", "\\n", $str);
    if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
  }

  // filename for download
  $filename = "website_data_" . date('Ymd') . ".xls";

  header("Content-Disposition: attachment; filename=\"$filename\"");
  header("Content-Type: application/vnd.ms-excel");

  $flag = false;
  $result = pg_query("SELECT * FROM table ORDER BY field") or die('Query failed!');
  while(false !== ($row = pg_fetch_assoc($result))) {
    if(!$flag) {
      // display field/column names as first row
      echo implode("\t", array_keys($row)) . "\r\n";
      $flag = true;
    }
    array_walk($row, __NAMESPACE__ . '\cleanData');
    echo implode("\t", array_values($row)) . "\r\n";
  }
  exit;
?>

//4. Preventing Excel's ridiculous auto-format
<?PHP
  // Original PHP code by Chirp Internet: www.chirp.com.au
  // Please acknowledge use of this code by including this header.

  function cleanData(&$str)
  {
    // escape tab characters
    $str = preg_replace("/\t/", "\\t", $str);

    // escape new lines
    $str = preg_replace("/\r?\n/", "\\n", $str);

    // convert 't' and 'f' to boolean values
    if($str == 't') $str = 'TRUE';
    if($str == 'f') $str = 'FALSE';

    // force certain number/date formats to be imported as strings
    if(preg_match("/^0/", $str) || preg_match("/^\+?\d{8,}$/", $str) || preg_match("/^\d{4}.\d{1,2}.\d{1,2}/", $str)) {
      $str = "'$str";
    }

    // escape fields that include double quotes
    if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
  }
?>

//SELECT a,b,a+b INTO OUTFILE '/tmp/result.txt' FIELDS TERMINATED BY ',' 
//OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' FROM test_table;

SELECT * FROM table ORDER BY field
INTO OUTFILE '/tmp/table.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'

//5. Exporting to CSV format
<?PHP
  // Original PHP code by Chirp Internet: www.chirp.com.au
  // Please acknowledge use of this code by including this header.

  function cleanData(&$str)
  {
    if($str == 't') $str = 'TRUE';
    if($str == 'f') $str = 'FALSE';
    if(preg_match("/^0/", $str) || preg_match("/^\+?\d{8,}$/", $str) || preg_match("/^\d{4}.\d{1,2}.\d{1,2}/", $str)) {
      $str = "'$str";
    }
    if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
  }

  // filename for download
  $filename = "website_data_" . date('Ymd') . ".csv";

  header("Content-Disposition: attachment; filename=\"$filename\"");
  header("Content-Type: text/csv");

  $out = fopen("php://output", 'w');

  $flag = false;
  $result = pg_query("SELECT * FROM table ORDER BY field") or die('Query failed!');
  while(false !== ($row = pg_fetch_assoc($result))) {
    if(!$flag) {
      // display field/column names as first row
      fputcsv($out, array_keys($row), ',', '"');
      $flag = true;
    }
    array_walk($row, __NAMESPACE__ . '\cleanData');
    fputcsv($out, array_values($row), ',', '"');
  }

  fclose($out);
  exit;
?>

//6. Exporting to CSV with Unicode intact
<?PHP
  // Original PHP code by Chirp Internet: www.chirp.com.au
  // Please acknowledge use of this code by including this header.

  function cleanData(&$str)
  {
    if($str == 't') $str = 'TRUE';
    if($str == 'f') $str = 'FALSE';
    if(preg_match("/^0/", $str) || preg_match("/^\+?\d{8,}$/", $str) || preg_match("/^\d{4}.\d{1,2}.\d{1,2}/", $str)) {
      $str = "'$str";
    }
    if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
    $str = mb_convert_encoding($str, 'UTF-16LE', 'UTF-8');
  }

  // filename for download
  $filename = "website_data_" . date('Ymd') . ".csv";

  header("Content-Disposition: attachment; filename=\"$filename\"");
  header("Content-Type: text/csv; charset=UTF-16LE");

  $out = fopen("php://output", 'w');

  $flag = false;
  $result = pg_query("SELECT * FROM table ORDER BY field") or die('Query failed!');
  while(false !== ($row = pg_fetch_assoc($result))) {
    if(!$flag) {
      // display field/column names as first row
      fputcsv($out, array_keys($row), ',', '"');
      $flag = true;
    }
    array_walk($row, __NAMESPACE__ . '\cleanData');
    fputcsv($out, array_values($row), ',', '"');
  }

  fclose($out);
  exit;
?>
//7. Changing column headings
<?PHP
  $colnames = [
    'memberno' => "Member No.",
    'date_joined' => "Date joined",
    'title' => "Title",
    'firstname' => "First name",
    'lastname' => "Last name",
    'address' => "Address",
    'postcode' => "Postcode",
    'city' => "City",
    'country' => "Country",
    'phone' => "Telephone",
    'mobile' => "Mobile",
    'fax' => "Facsimile",
    'email' => "Email address",
    'notes' => "Notes"
  ];

  function map_colnames($input)
  {
    global $colnames;
    return isset($colnames[$input]) ? $colnames[$input] : $input;
  }

  // filename for download
  $filename = "website_data_" . date('Ymd') . ".csv";

  ...

    if(!$flag) {
      // display field/column names as first row
      $firstline = array_map(__NAMESPACE__ . '\map_colnames', array_keys($row));
      fputcsv($out, $firstline, ',', '"');
      $flag = true;
    }

   ...

?>

<?PHP
  function cleanData(&$str)
  {
    $str = preg_replace("/\t/", "\\t", $str);
    $str = preg_replace("/\r?\n/", "\\n", $str);
    if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
  }

  // filename for download
  $filename = "website_data_" . date('Ymd') . ".xls";

  header("Content-Disposition: attachment; filename=\"$filename\"");
  header("Content-Type: application/vnd.ms-excel");

  $flag = false;
  foreach($data as $row) {
    if(!$flag) {
      // display field/column names as first row
      echo implode("\t", array_keys($row)) . "\r\n";
      $flag = true;
    }
    array_walk($row, __NAMESPACE__ . '\cleanData');
    echo implode("\t", array_values($row)) . "\r\n";
  }
  exit;
?>

<?PHP
  // Original PHP code by Chirp Internet: www.chirp.com.au
  // Please acknowledge use of this code by including this header.

  function cleanData(&$str)
  {
    // escape tab characters
    $str = preg_replace("/\t/", "\\t", $str);

    // escape new lines
    $str = preg_replace("/\r?\n/", "\\n", $str);

    // convert 't' and 'f' to boolean values
    if($str == 't') $str = 'TRUE';
    if($str == 'f') $str = 'FALSE';

    // force certain number/date formats to be imported as strings
    if(preg_match("/^0/", $str) || preg_match("/^\+?\d{8,}$/", $str) || preg_match("/^\d{4}.\d{1,2}.\d{1,2}/", $str)) {
      $str = "'$str";
    }

    // escape fields that include double quotes
    if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
  }
?>

<?PHP
  function cleanData(&$str)
  {
    $str = preg_replace("/\t/", "\\t", $str);
    $str = preg_replace("/\r?\n/", "\\n", $str);
  }

  header("Content-Type: text/plain");

  $flag = false;
  foreach($data as $row) {
    if(!$flag) {
      // display field/column names as first row
      echo implode("\t", array_keys($row)) . "\r\n";
      $flag = true;
    }
    array_walk($row, __NAMESPACE__ . '\cleanData');
    echo implode("\t", array_values($row)) . "\r\n";
  }
  exit;
?>
