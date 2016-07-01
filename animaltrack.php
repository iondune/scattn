<?php
include("dbconnect.php");
?>
<script>

  var animal_track =

<?php
$sql = "SELECT animal.id, lat, lng, report_dt from animal inner join report_history on animal.id=animal_id inner join receiver on receiver.id=receiver_id where animal.id=12 order by report_dt";
$result = $conn->query($sql);

$lines = array();

if ($result->num_rows > 0)
{
  while($row = $result->fetch_assoc())
  {
    $line = array(
      "lat"=>floatval($row["lat"]),
      "lng"=>floatval($row["lng"])//,
      // "report_dt"=>$row["report_dt"]
      );
    $lines[] = $line;
  }
}

echo json_encode($lines);
?>
;
</script>
