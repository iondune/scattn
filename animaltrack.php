<?php
include("dbconnect.php");

if ($stmt = $conn->prepare("SELECT animal.id, lat, lng, report_dt from animal inner join report_history on animal.id=animal_id inner join receiver on receiver.id=receiver_id where animal.id=? order by report_dt")) {
    $stmt->bind_param("i", $_GET["id"]);

    $stmt->execute();
    $result = $stmt->get_result();

    $lines = array();
    if ($result->num_rows > 0) {
      while($row = $result->fetch_assoc()) {
        $line = array(
          "lat"=>floatval($row["lat"]),
          "lng"=>floatval($row["lng"])//,
          // "report_dt"=>$row["report_dt"]
          );
        $lines[] = $line;
      }
    }
    else {
      echo "No results";
    }

    $stmt->close();
}

header('Content-type: application/json');
echo json_encode($lines);

?>
