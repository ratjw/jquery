<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8"/>
<title>Neurosurgery Service</title>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="css/jquery-ui.min.css" rel="stylesheet">
<link href="css/CSS.css" rel="stylesheet">
<script src="js/jquery-1.12.4.min.js"></script>
<script src="js/jquery.mousewheel.min.js"></script>
<script src="js/jquery-ui.min.js"></script>

<script src="js/constant.js"></script>
<script src="js/equip.js"></script>
<script src="js/fill.js"></script>
<script src="js/function.js"></script>
<script src="js/start.js"></script>
</HEAD>
<BODY>

<p id="logo" style="text-align:center;"><img width="170" height="150" src="css/pic/logoRama.png"></p>

<div id="login">
	<br>
	<h3>Neurosurgery Service</h3>

	<form method="post" action="">

		<?php 
			$userid = $password = "";
		?>

		Login ID: <input id="userid" type="text" maxlength="6" size="6" name="userid"
					value="<?php echo $userid;?>" oninput="namesix()" 
					onpropertychange="namesix()">
		<br>
		<br>
		Password: <input id="password" type="password" name="password"
					maxlength="16" size="8" value="<?php echo $password;?>">
		<br>
		<br>
		<input type="submit" value="Sign in">
		<br><br>
	</form>
</div>

<div id="wrapper">
 <div id="tblwrapper" style="display:none">
  <div id="tblcontainer">
   <table id="tbl">
    <tbody>
	 <tr>
     <th style="width:10%">Date</th>
     <th style="width:3%">Room</th>
     <th style="width:3%">Case</th>
     <th style="width:5%">Staff</th>
     <th style="width:5%">HN</th>
     <th style="width:14%">PatientName</th>
     <th style="width:30%">Diagnosis</th>
     <th style="width:30%">Treatment</th>
     <th style="display:none">Note</th>
     <th style="display:none"></th>
	 </tr>
    </tbody>
   </table>
  </div>
 </div>

 <div id="queuewrapper" style="display:none">
  <div id="titlebar">
	<span id="titlename"></span>
	<span class="ui-icon ui-icon-closethick" onclick="closequeue()">
	</span>
  </div> 
  <div id="queuecontainer">
    <table id="queuetbl">
     <tbody>
	  <tr>
      <th style="width:10%">Date</th>
      <th style="width:2%">Room</th>
      <th style="width:2%">Case</th>
      <th style="width:3%">Staff</th>
      <th style="width:3%">HN</th>
      <th style="width:10%">PatientName</th>
      <th style="width:20%">Diagnosis</th>
      <th style="width:30%">Treatment</th>
      <th style="width:20%">Note</th>
      <th style="display:none"></th>
	  </tr>
     </tbody>
    </table>
  </div>
 </div>
</div>

<table id="tblcells" style="display:none">	<!-- Used as cells template -->
  <tbody>
   <tr>
    <td data-title="Date"></td>
    <td data-title="Room"></td>
    <td data-title="Case"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="PatientName"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td style="display:none"></td>
    <td style="display:none"></td>
   </tr>
  </tbody>
</table>

<div id="dialogAlert"></div>

<div id="dialogEquip">
  <span style="width:100px;">
	ห้อง <span id="oproom" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <span style="width:80px;">
	Case <span id="casenum" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <span style="width:120px;">
	เวลา <span id="optime" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <span style="width:200px;">วัน<span id="opday"></span>ที่
	<span id="opdate" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <span style="width:150px;">
	Surgeon <span id="staffname" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <br>
  <br>
  <span style="width:110px;">ชื่อ-นามสกุล </span><span id="patientname"></span>
  <span style="width:20px;"></span>อายุ <span id="age"></span>
  <span style="width:20px;"></span>HN <span id="hn"></span>
  <br>
  <span style="width:110px;float:left;">Diagnosis</span>
  <span style="width:540px;" id="diagnosis"></span>
  <br>
  <span style="width:110px;float:left;">Operation</span>
  <span style="width:540px;" id="treatment"></span>
  <br>
  <br>
 <div title="ส่วนเกิน">
  <span style="width:110px;"></span>
  <span style="width:500px;">
	<span style="color:red;"> ***</span>
	<i>ผู้ป่วยและญาติสามารถ<b><u>จ่ายส่วนเกินได้ </u></b></i> 
	<input type="text" style="width:70px;text-align:center" id="copay"> บาท
	<span style="color:red;"> ***</span>
  </span>
  <br>
  <br>
 </div>
 <div title="Position">
  <span id="clearPosition" style="width:110px;">Position <small>(คลิกลบ)</small></span>
  <span style="width:230px;">
	<input type="radio" name="pose" id="leftSupine">
	<label for="leftSupine">หงาย ซ้ายขึ้น หันหน้าไปทางขวา</label>
  </span>
  <span style="width:230px;">
	<input type="radio" name="pose" id="rightSupine">
	<label for="rightSupine">หงาย ขวาขึ้น หันหน้าไปทางซ้าย</label>
  </span>
  <span style="width:90px;">
	<input type="radio" name="pose" id="supine">
	<label for="supine">หงายตรง</label>
  </span>
  <br>
  <span style="width:110px;"></span>
  <span style="width:150px;">
	<input type="radio" name="pose" id="rightParkbench">
	<label for="rightParkbench">Parkbench ขวาลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="rightLateral">
	<label for="rightLateral">Lateral ขวาลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="right3quarter">
	<label for="right3quarter">3/4 ขวาลง</label>
  </span>
  <span style="width:100px;">
	<input type="radio" name="pose" id="Concorde">
	<label for="Concorde">Concorde</label>
  </span>
  <br>
  <span style="width:110px;"></span>
  <span style="width:150px;">
	<input type="radio" name="pose" id="leftParkbench">
	<label for="leftParkbench">Parkbench ซ้ายลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="leftLateral">
	<label for="leftLateral">Lateral ซ้ายลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="left3quarter">
	<label for="left3quarter">3/4 ซ้ายลง</label>
  </span>
  <span style="width:70px;">
	<input type="radio" name="pose" id="prone">
	<label for="prone">คว่ำ</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="position">
  <br>
  <br>
 </div>
 <div title="Imaging">
  <span style="width:110px;">Imaging</span>
  <span style="width:120px;">
	<input type="checkbox" id="Fluoroscope">
	<label for="Fluoroscope">Fluoroscope</label>
  </span>
  <span style="width:100px;">
	<input type="checkbox" id="Navigator">
	<label for="Navigator">Navigator</label>
  </span>
  <span style="width:70px;">
	<input type="checkbox" id="iMRI">
	<label for="iMRI">iMRI</label>
  </span>
  <span style="width:70px;">
	<input type="checkbox" id="iCT">
	<label for="iCT">iCT</label>
  </span>
  <span style="width:90px;">
	<input type="checkbox" id="Robotic">
	<label for="Robotic">Robotic</label>
  </span>
  <span style="width:70px;">
	<input type="checkbox" id="OArm">
	<label for="OArm">O-Arm</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="Imaging">
  <br>
  <br>
 </div>
 <div title="อุปกรณ์ยึดศีรษะ">
  <span style="width:110px;">อุปกรณ์ยึดศีรษะ</span>
  <span style="width:150px;">
	<input type="checkbox" id="Mayfield">
	<label for="Mayfield">Mayfield</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="GelHeadRing">
	<label for="GelHeadRing">Gel Head Ring</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Horseshoe">
	<label for="Horseshoe">Horseshoe</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="headHolder">
  <br>
  <br>
 </div>
 <div title="เครื่องตัดกระดูก">
  <span style="width:110px;">เครื่องตัดกระดูก</span>
  <span style="width:150px;">
	<input type="checkbox" id="HighSpeedDrill">
	<label for="HighSpeedDrill">High Speed Drill</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="SagittalSaw">
	<label for="SagittalSaw">Sagittal Saw</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Osteotome">
	<label for="Osteotome">Osteotome</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="Craniotome">
  <br>
  <br>
 </div>
 <div title="กล้อง">
  <span style="width:110px;">กล้อง</span>
  <span style="width:150px;">
	<input type="checkbox" id="Microscope">
	<label for="Microscope">Microscope</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="ICG">
	<label for="ICG">ICG</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Endoscope">
	<label for="Endoscope">Endoscope</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="scope">
  <br>
  <br>
 </div>
 <div title="Retractor">
  <span style="width:110px;">Retractor</span>
  <span style="width:150px;">
	<input type="checkbox" id="Leylar">
	<label for="Leylar">Leylar</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="Halo">
	<label for="Halo">Halo</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Greenberg">
	<label for="Greenberg">Greenberg</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="Retractor">
  <br>
  <br>
 </div>
 <div title="CUSA">
  <span style="width:110px;">CUSA</span>
  <span style="width:150px;">
	<input type="checkbox" id="Excell">
	<label for="Excell">Excell</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="Soring">
	<label for="Soring">Soring</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Sonar">
	<label for="Sonar">Sonar</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="CUSA">
  <br>
  <br>
 </div>
 <div title="U/S">
  <span style="width:110px;">U/S</span>
  <span style="width:150px;">
	<input type="checkbox" id="ultrasound">
	<label for="ultrasound">Ultrasound</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="Doppler">
	<label for="Doppler">Doppler</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Duplex">
	<label for="Duplex">Duplex</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="US">
  <br>
  <br>
 </div>
 <div title="Shunt">
  <span id="clearShunt" style="width:110px;">Shunt <small>(คลิกลบ)</small></span>
  <span style="width:70px;">Pudenz</span>
  <span style="width:22px;">หัว</span>
  <span style="width:50px;">
	<input type="radio" name="head" id="proximalLow">
	<label for="proximalLow">low</label>
  </span>
  <span style="width:55px;">
	<input type="radio" name="head" id="proximalMedium">
	<label for="proximalMedium">med</label>
  </span>
  <span style="width:85px;">
	<input type="radio" name="head" id="proximalHigh">
	<label for="proximalHigh">high</label>
  </span>
  <span style="width:30px;">ท้อง</span>
  <span style="width:50px;">
	<input type="radio" name="peritoneum" id="distalLow">
	<label for="distalLow">low</label>
  </span>
  <span style="width:55px;">
	<input type="radio" name="peritoneum" id="distalMedium">
	<label for="distalMedium">med</label>
  </span>
  <span>
	<input type="radio" name="peritoneum" id="distalHigh">
	<label for="distalHigh">high</label>
  </span>
  <br>
  <span style="width:110px;"></span>
  <span style="width:150px;">Programmable</span>
  <span style="width:140px;">
	<input type="radio" name="program" id="shuntMedtronic">
	<label for="shuntMedtronic">Medtronic</label>
  </span>
  <span style="width:110px;">
	<input type="radio" name="program" id="shuntCodman">
	<label for="shuntCodman">Codman</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="Shunt">
  <br>
  <br>
 </div>
 <div title="เครื่องมือบริษัท">
  <span style="width:110px;">เครื่องมือบริษัท </span>
  <span style="width:150px;">เวลาส่งเครื่อง 
	<input type="text" style="width:40px;text-align:right" id="equiptime"> น. 
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="company">
  <br>
  <br>
 </div>
 <div title="อุปกรณ์อื่นๆ">
  <span style="width:110px;">อุปกรณ์อื่นๆ</span>
  <span style="width:150px;">
	<input type="checkbox" id="cranioCement">
	<label for="cranioCement">Cranio cement</label>
  </span>
  <span style="width:120px;">
	<input type="checkbox" id="MTECSkull">
	<label for="MTECSkull">MTEC skull</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="other">
  <br>
  <br>
 </div>
 <div title="Monitor">
  <span style="width:110px;">Monitor</span>
  <span style="width:73px;"><input type="checkbox" id="CN5"><label for="CN5">CN5</label></span>
  <span style="width:73px;"><input type="checkbox" id="CN6"><label for="CN6">CN6</label></span>
  <span style="width:70px;"><input type="checkbox" id="CN7"><label for="CN7">CN7</label></span>
  <span style="width:70px;"><input type="checkbox" id="CN8"><label for="CN8">CN8</label></span>
  <span style="width:70px;"><input type="checkbox" id="SSEP"><label for="SSEP">SSEP</label></span>
  <span style="width:65px;"><input type="checkbox" id="EMG"><label for="EMG">EMG</label></span>
  <span style="width:65px;"><input type="checkbox" id="MEP"><label for="MEP">MEP</label></span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="Monitor">
  <br>
  <br>
 </div>
 <div>
  <br>
  <br>
  <span style="width:350px;"></span>
  <span style="width:70px;"> Edited by </span>
  <span style="position:absolute" id="editedby"></span>
  <br>
  <br>
 </div>
</div>

<script type="text/javascript">

function namesix()
{
	var userid = $("#userid").val()
	if (/^\d{6}$/.test(userid)) {
		$("#password").focus()
	}
}

</script>

<?php
	if ($_SERVER["REQUEST_METHOD"] === "POST") {
		$userid = $_POST["userid"];
		$password = $_POST["password"];

		// for each OR room
		if ($userid > "0" && $userid < "20") {
			echo "<SCRIPT type='text/javascript'>initialize('".$userid."')</SCRIPT>";
		}

		elseif (preg_match('/^\d{6}$/', $userid)) {
			// for production
			if (strpos($_SERVER["SERVER_NAME"], "surgery.rama") !== false) {
				$wsdl="http://appcenter/webservice/patientservice.wsdl";
				$client = new SoapClient($wsdl);
				$resultx = $client->Get_staff_detail($userid, $password);
				$resulty = simplexml_load_string($resultx);
				$resultz = (string)$resulty->children()->children()->role;
			}
			// for developer
			elseif (strpos($_SERVER["SERVER_NAME"], "localhost") !== false)  {
				$resultz = "S";
			}
			elseif (strpos($_SERVER["SERVER_NAME"], "10.6.166.92") !== false)  {
				$resultz = "S";
			}
			elseif (strpos($_SERVER["SERVER_NAME"], "192.168") !== false)  {
				$resultz = "S";
			}

			if ($resultz === "S" || $resultz === "R" || $resultz === "N") {
				echo "<SCRIPT type='text/javascript'>initialize('".$userid."')</SCRIPT>";
			} else {
				echo "<SCRIPT type='text/javascript'>Alert('Login Error','<br><br>wrong username or password')</SCRIPT>";
			}
		}
	}
?>

</BODY>
</HTML>
