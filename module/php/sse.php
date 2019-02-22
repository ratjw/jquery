<?php
include "connect.php";
require_once "book.php";

header('Cache-Control: no-cache');
header("Content-Type: text/event-stream");

$oldtimestamp = 0;
$newtimestamp = 0;

// must set iis in win 32 at
// Configuration Editor -> system.webServer/handlers -> (Collection)' Element
// -> Name > FastCGI -> Properties -> responseBufferLimit -> 0
// fastCGI Activity Timout and Request Timeout
while (!connection_aborted()) {
  set_time_limit(10);

  $sql = "SELECT MAX(editdatetime) from bookhistory;";

  if (!$result = $mysqli->query ($sql)) { break; }
  $rowi = $result->fetch_row();
  $newtimestamp = $rowi[0];

  if($oldtimestamp < $newtimestamp) {
    $oldtimestamp = $newtimestamp;
    echo 'data: ' . json_encode(book($mysqli)) . "\n\n";
    ob_flush();
    flush();
  }

  sleep(1);
}
