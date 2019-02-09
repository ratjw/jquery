<?php
//  $mysqli = new mysqli("localhost", "root", "Zaq1@wsx", "neurosurgery");
//  if ($mysqli->connect_errno)
//    exit("Connect failed: %s\n". $mysqli->connect_error);
//  echo json_encode(book($mysqli));

// waitnum < 0    : consult cases
// waitnum > 0    : booking cases
function book($mysqli)
{
  date_default_timezone_set("Asia/Bangkok");

  $rowi = array();
  $book = array();
  $consult = array();
  $time = array();
  $wait = array();
  $staff = array();

  $sql = "SELECT waitnum,opdate,oproom,optime,casenum,theatre,staffname,hn,
            patient,dob,diagnosis,treatment,equipment,contact,qn
          FROM book 
          WHERE opdate >= DATE_FORMAT(CURDATE()-INTERVAL 1 MONTH,'%Y-%m-01')
            AND deleted = 0 AND waitnum > 0
          ORDER BY opdate, theatre='',theatre, oproom is null,oproom,
            casenum is null,casenum, optime='',optime, waitnum;";
            // The one with blank/null will be the last, sorted by ASC

  if (!$result = $mysqli->query ($sql)) {
    return $mysqli->error;
  }
  while ($rowi = $result->fetch_assoc()) {
    $book[] = $rowi;
  }

  $sql = "SELECT waitnum,opdate,oproom,optime,casenum,theatre,staffname,hn,
            patient,dob,diagnosis,treatment,equipment,contact,qn
          FROM book 
          WHERE opdate >= DATE_FORMAT(CURDATE()-INTERVAL 1 MONTH,'%Y-%m-01')
            AND deleted = 0 AND waitnum < 0
          ORDER BY opdate,waitnum DESC;";
          // Consult cases have negative waitnum.
          // Greater waitnum (less negative) are placed first, sorted by DESC

  if (!$result = $mysqli->query ($sql)) {
    return $mysqli->error;
  }
  while ($rowi = $result->fetch_assoc()) {
    $consult[] = $rowi;
  }

  // current() = array.toString()
  if ($result = $mysqli->query ("SELECT now();")) {
    $time = current($result->fetch_row());
  }

  $allarray["BOOK"] = $book;
  $allarray["CONSULT"] = $consult;
  $allarray["QTIME"] = $time;

  return $allarray;
}
