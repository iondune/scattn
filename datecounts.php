
<?php
include("dbconnect.php");
?>
<script>

  var dtinln = [
<?php
$sql = "select date(report_dt) as THEDATE, count(*) as THECOUNT from report_history group by THEDATE";
$result = $conn->query($sql);

if ($result->num_rows > 0)
{
  while($row = $result->fetch_assoc())
  {
    echo "{ Date: '" . $row["THEDATE"] . "', Count: " . $row["THECOUNT"] . "}, \n";
  }
}
?>
];
</script>
