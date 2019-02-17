<?php
include "connect.php";
require_once "book.php";

header('X-Accel-Buffering: no');
header('Cache-Control: no-cache');
header("Content-Type: text/event-stream");

//fastcgi_keep_conn on; //# < solution

//proxy_buffering off;
//gzip off;

$oldtimestamp = 0;
$newtimestamp = 0;

while (!connection_aborted()) {
  set_time_limit(10);

  $sql = "SELECT MAX(editdatetime) from bookhistory;";

  if (!$result = $mysqli->query ($sql)) { break; }
  $rowi = $result->fetch_row();
  $newtimestamp = $rowi[0];

  if($oldtimestamp < $newtimestamp) {
    echo 'data: ' . json_encode(book($mysqli)) . "$i\n\n";
    echo "PHP_EOL . PHP_EOL";
    $oldtimestamp = $newtimestamp;
  } else {
    echo "data: $newtimestamp " . 'json_encode(book($mysqli))' . "$i\n\n";
    echo "PHP_EOL . PHP_EOL";
  }

  // flush the output buffer and send echoed messages to the browser
  ob_end_flush();
  flush();

  // sleep for 1 second before running the loop again
  sleep(1);

}
