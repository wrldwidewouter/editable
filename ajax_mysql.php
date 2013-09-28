
<?php
//sleep(1);

// FUNCTIONS:
function id_exists($id){
	$id = mysql_real_escape_string($id);
	$query = mysql_query("SELECT COUNT(`id`) FROM `items` WHERE `id` = '$id'");
	return (mysql_result($query, 0) == 1) ? true : false;
}
function array_sanitize(&$item){
	$item = mysql_real_escape_string($item);
}
function update_item($item_data){
        array_walk($item_data,'array_sanitize');
	foreach($item_data as $field=>$data){
		$update[] = '`' . $field . '` = \'' . $data . '\'';
	}
	mysql_query("UPDATE `items` SET " . implode(', ', $update) . " WHERE `id` = '" . $item_data['id'] . "'");	
}
function create_item($item_data){
        array_walk($item_data,'array_sanitize');
	$fields = '`' . implode('`, `', array_keys($item_data)). '`';
	$data = '\'' . implode('\', \'', $item_data). '\'';
	mysql_query("INSERT INTO `items` ($fields) VALUES ($data)");	
}


if (isset($_POST['method']) && $_POST['method'] == 'update_create'){
    
    require './database/connect.php';
    
    $id = $_POST['id'];
    $content = $_POST['content'];
    $type = $_POST['type'];
    
    if ($type == 'IMG'){  
        
	define('UPLOAD_DIR', 'images/');
        $part = explode(";base64,", $content);
        $img = $part[1];
        $filetype = str_replace('data:image/', '', $part[0]);
        $img = str_replace(' ', '+', $img);
        $data = base64_decode($img);
        $uniq_id = uniqid();
        $file = UPLOAD_DIR . $uniq_id . '.' . $filetype;      
        $success = file_put_contents($file, $data);
        
        $content = $file;
        
        if (extension_loaded('gd') && function_exists('gd_info')) {
            
            include("./includes/image-class.php");
            
            $original = $file;
            $cropObj = new resize($original);  

            //Resize image (options: exact, portrait, landscape, auto, crop)  
            $cropObj -> resizeImage(500, 500,'landscape');  

            //Save image             
            $newfile = UPLOAD_DIR . $uniq_id . '_cropped.' . $filetype;
            $cropObj -> saveImage($newfile, 100);  
            
            $content = $newfile;
        }
        
        
    } else {       
        $content = preg_replace('/\s+/', ' ',trim($content)); // trim + delete multible spaces
    }
    
    $item_data = array(
    'id' 	=> $id,
    'content' 	=> $content,
    'type' 	=> $type         
    );

    if (id_exists($id)){
        update_item($item_data);
    } else {
        create_item($item_data);
    }
}
?>   

<html>
    <head></head>
    <body>
    
    </body>
</html>