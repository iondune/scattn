<?php
include("dbconnect.php");

$sql = "select id, name, lat, lng from receiver";
$result = $conn->query($sql);

$lines = array();
if ($result->num_rows > 0)
{
  while($row = $result->fetch_assoc())
  {
    $line = array(
      "id"=>$row["id"],
      "lat"=>floatval($row["lat"]),
      "lng"=>floatval($row["lng"])
      );
    $lines[] = $line;
  }
}

header('Content-type: application/json');
echo json_encode($lines);

?>
