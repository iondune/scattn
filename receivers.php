
<?php
include("dbconnect.php");
?>
<script>

  var receivers_info = [

<?php
$sql = "select id, name, lat, lng from receiver";
$result = $conn->query($sql);

if ($result->num_rows > 0)
{
  while($row = $result->fetch_assoc())
  {
    echo "{ id: '" . $row["id"] . "', name: '" . $row["name"] . "', lat: " . $row["lat"] . ", lng: " . $row["lng"] . "}, \n";
  }
}
?>

];
</script>
