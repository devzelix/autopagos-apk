<?php 

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST");

$response = array();
$upload_dir = 'uploads/';
$server_url = 'http://127.0.0.1:8000';

if( $_POST['image'])
{
    //Si tiene nombre de imagen se la asigno
    if($_POST['nameimg']){
        $name_img  = $_POST['nameimg'];
    }else{
    //Genero un nombre unico por imagen
        $name_img = rand(1000,1000000)."-".time();
    }
    
    $img = preg_replace('#^data:image/[^;]+;base64,#', '', $_POST['image']);
    $imgbase64 = base64_decode($img);
    $f = finfo_open();
    $mime_type = finfo_buffer($f, $imgbase64, FILEINFO_MIME_TYPE);
    $mime_type_image = array(
        'png' => 'image/png',
        'jpe' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'jpg' => 'image/jpeg'
    );
    $extimg = array_search($mime_type, $mime_type_image);

    //Hasta aqui
    if(!$extimg){
        $response = array(
            "status" => "error",
            "error" => true,
            "code" => "2122",
            "message" => "Error formato del archivo no admitido!"
        );
    }else 
    {
        $random_name = $name_img.'.'.$extimg;
        $upload_name = $upload_dir.strtolower($random_name);
        $upload_name = preg_replace('/\s+/', '-', $upload_name);
        $result = file_put_contents($upload_name,$imgbase64);
        if($result){
            $response = array(
                "status" => "success",
                "error" => false,
                "message" => "File uploaded successfully",
                "url" => $server_url."/".$upload_name
              );
        }else{
            $response = array(
                "status" => "error",
                "error" => true,
                "code" => "2123",
                "message" => "Error uploading the file!"
            );
        }
    }

    }else{
        $response = array(
            "status" => "error",
            "error" => true,
            "code" => "2124",
            "message" => "No file was sent!"
        );
    }
    echo json_encode($response);
?>