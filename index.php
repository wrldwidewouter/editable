<!DOCTYPE html>
<?php
    require './database/connect.php';
    $query = "SELECT * FROM `items`"; 
    $result = mysql_query("SELECT * FROM `items`");
    while($row = mysql_fetch_assoc($result)){     
         $items[$row["id"]] = $row; //row key as id
    }
?>
<html>
<head>
    <meta charset="UTF-8">
    <title>Editable</title>

    <!-- jQuery -->
    <script src="http://code.jquery.com/jquery-1.9.1.js" type="text/javascript"></script>
    <!-- jQuery UI -->
    <script src="http://code.jquery.com/ui/1.9.2/jquery-ui.js" type="text/javascript"></script>
    <link href="http://code.jquery.com/ui/1.9.2/themes/base/jquery-ui.css" type="text/css" rel="stylesheet">
    <!-- Font-awesome -->
    <link href="http://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" type="text/css" rel="stylesheet">
    <!-- Bootstrap -->
    <link href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" type="text/css" rel="stylesheet">
    <!-- Editable -->
    <link rel="stylesheet" href="css/editable.css">
    <script src="js/editable.js"></script>

</head>
<body>
    <div class="wrap"> 
        <img id="1000" width="300px" height="174px" class="editable" src="<?php echo $items[1000]['content'];?>" />
        <img id="1001" width="500px" class="editable" src="<?php echo $items[1001]['content'];?>" />
        <img id="1002" height="300px" class="editable" src="<?php echo $items[1002]['content'];?>" />
        <img id="1003" class="editable" src="<?php echo $items[1003]['content'];?>" />
    </div>    

</body>
</html>
