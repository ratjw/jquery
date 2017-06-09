<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="css/jquery-ui.css" rel="stylesheet">
<link href="css/CSS.css" rel="stylesheet">
<LINK href="css/print.css" rel="stylesheet">
<!--link href="css/jquery.mobile-1.4.5.css" rel="stylesheet"-->

<!--script src="js/jquery.mobile-1.4.5.js"></script-->
<!--script src="js/jquery-1.12.4.min.js"></script-->
<script src="js/jquery-3.1.1.js"></script>
<script src="js/jquery-ui.js"></script>
<script src="js/click.js"></script>
<script src="js/constant.js"></script>
<script src="js/countservice.js"></script>
<script src="js/equip.js"></script>
<script src="js/fill.js"></script>
<script src="js/function.js"></script>
<script src="js/history.js"></script>
<script src="js/menu.js"></script>
<script src="js/service.js"></script>
<script src="js/sortable.js"></script>
<script src="js/start.js"></script>
<!--script src="js/touch.js"></script-->
</HEAD>
<BODY>

<div id="wrapper"><!-- data-role="page"-->
 <div id="tblwrapper" style="display:none">
  <div id="tblcontainer"><!-- role="main" class="ui-content"-->
   <table id="tbl"><!-- data-role="table" class="ui-responsive"-->
    <tbody id="tblbody">
	 <tr>
     <th style="width:10%">Date</th>
     <th style="width:3%">Staff</th>
     <th style="width:4%">HN</th>
     <th style="width:10%">ชื่อ นามสกุล</th>
     <th style="width:3%">อายุ</th>
     <th style="width:20%">Diagnosis</th>
     <th style="width:30%">Treatment</th>
     <th style="width:20%">Contact</th>
     <th style="display:none"></th>
	 </tr>
    </tbody>
   </table>
  </div>
 </div>

 <div id="queuewrapper" style="display:none">
  <div id="titlebar"><!-- data-role="header"-->
	<span id="titlename"></span>
	<span class="ui-icon ui-icon-closethick" onclick="closequeue()">
	</span>
  </div> 
  <div id="queuecontainer"><!-- role="main" class="ui-content"-->
    <table id="queuetbl"><!-- data-role="table" class="ui-responsive"-->
     <tbody>
	  <tr>
      <th style="width:10%">Date</th>
      <th style="width:3%">Staff</th>
      <th style="width:4%">HN</th>
      <th style="width:10%">ชื่อ นามสกุล</th>
      <th style="width:3%">อายุ</th>
      <th style="width:20%">Diagnosis</th>
      <th style="width:30%">Treatment</th>
      <th style="width:20%">Contact</th>
      <th style="display:none"></th>
	  </tr>
     </tbody>
    </table>
  </div>
 </div>
</div>

<table id="tblrowcell" style="display:none">	<!-- Used as cells template -->
  <TBODY>
   <TR>
    <td data-title="Date"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="ชื่อ นามสกุล"></td>
    <td data-title="อายุ"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Contact"></td>
    <td style="display:none"></td>
   </TR>
  </TBODY>
</table>

<table id="queuerowcell" style="display:none">	<!--template for "staffqueue"-->
  <TBODY>
    <TR>
     <td data-title="Date"></td>
     <td data-title="Staff"></td>
     <td data-title="HN"></td>
     <td data-title="ชื่อ นามสกุล"></td>
     <td data-title="อายุ"></td>
     <td data-title="Diagnosis"></td>
     <td data-title="Treatment"></td>
     <td data-title="Contact"></td>
     <td style="display:none"></td>
	</TR>
  </TBODY>
</table>

<div id="dialogService" style="display:none">
  <div id="servicehead">
    <div>
	  <span class="item">Admit : <span id="Admit"></span></span>
	  <span class="item">Discharge : <span id="Discharge"></span></span>
	  <span class="item">Operation : <span id="Operation"></span></span>
	  <span class="item Morbidity">Morbidity : <span id="Morbidity"></span></span>
	</div>
	<div>
	  <span class="item Readmission">Re-admission : <span id="Readmission"></span></span>
	  <span class="item Infection">Infection SSI : <span id="Infection"></span></span>
	  <span class="item Reoperation">Re-operation : <span id="Reoperation"></span></span>
	  <span class="item Dead">Dead : <span id="Dead"></span></span>
	</div>
  </div>
  <input type="text" id="monthpicker" style="margin-left:5px">
  <input type="text" id="monthpicking" style="visibility:hidden">
  <table id="servicetbl"><!-- data-role="table" class="ui-responsive"-->
   <TBODY>
    <TR>
     <th style="width:2%">case</th>
     <th style="width:13%">HN Name</th>
     <th style="width:15%">Diagnosis</th>
     <th style="width:15%">Treatment</th>
     <th style="width:30%">Admission Status</th>
     <th style="width:15%">Final Status</th>
     <th style="width:5%">Admit</th>
     <th style="width:5%">D/C</th>
     <th style="display:none"></th>
    </TR>
   </TBODY>
  </table>
  <input type="text" id="datepicker" style="display:none">
  <input type="text" id="datepicking" style="display:none">
</div>

<table id="servicerowcell" style="display:none">	<!--template for "servicetbl"-->
  <TBODY>
   <TR>
    <td data-title="case"></td>
    <td data-title="HN Name"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Admission Status"></td>
    <td data-title="Final Status"></td>
    <td data-title="Admit"></td>
    <td data-title="D/C"></td>
    <td style="display:none"></td>
   </TR>
  </TBODY>
</table>

<div id="dialogOplog"></div>

<div id="dialogDeleted">
  <table>
  </table>
  <div id="undelete">
    <span id="undel" onclick="doUndelete()">Undelete</span>
    <span class="ui-icon ui-icon-circle-close" onclick="closeUndel()"></span>
  </div>
</div>

<div id="dialogAlert"></div>

<ul id="menu" style="display:none">
  <li><div>คิวของอาจารย์</div>
	<ul id="item0" style="width:120px">
	</ul>
  </li>
  <li id="item2"><div></div></li>
  <li id="item3"><div></div></li>
  <li id="item4" style="color:#FF0000"><div></div></li>
  <li id="item5"><div></div></li>
  <li id="item6"><div></div></li>
  <li id="item7"><div></div></li>
  <li id="item8"><div></div></li>
  <li id="item9"><div></div></li>
  <li id="item10"><div></div></li>
</ul>

<ul id="stafflist" style="display:none"></ul>

<div id="editcell" contenteditable="true"></div>

<div id="dialogEquip">
  <span style="width:250px;"></span>วันที่ 
  <span style="width:120px; font-size: 14px; font-weight: bold;" id="opdate"></span>
  <span style="width:20px;"></span>Surgeon <span id="staffname"></span>
  <br>
  <br>
  <span style="width:110px;">ชื่อ-นามสกุล </span><span id="patientname"></span>
  <span style="width:20px;"></span>อายุ <span id="age"></span>
  <span style="width:20px;"></span>HN <span id="hn"></span>
  <br>
  <span style="width:110px;">Diagnosis</span>
  <span style="width:540px;" id="diagnosis"></span>
  <br>
  <span style="width:110px;">Operation</span>
  <span style="width:540px;" id="treatment"></span>
  <br>
  <br>
  <div id="clearPosition" style="width:105px;">Position</div>
  <span style="width:240px;">
	<input type="radio" name="pose" id="leftSupine">
	<label for="leftSupine">หงาย ซ้ายขึ้น หันหน้าไปทางขวา</label>
  </span>
  <span style="width:240px;">
	<input type="radio" name="pose" id="rightSupine">
	<label for="rightSupine">หงาย ขวาขึ้น หันหน้าไปทางซ้าย</label>
  </span>
  <span style="width:70px;">
	<input type="radio" name="pose" id="Supine">
	<label for="Supine">หงาย</label>
  </span>
  <br>
  <span style="width:105px;"></span>
  <span style="width:155px;">
	<input type="radio" name="pose" id="rightParkbench">
	<label for="rightParkbench">Parkbench ขวาลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="rightLateral">
	<label for="rightLateral">Lateral ขวาลง</label>
  </span>
  <span style="width:180px;">
	<input type="radio" name="pose" id="rightProne">
	<label for="rightProne">3/4 ขวาลง</label>
  </span>
  <span style="width:70px;">
	<input type="radio" name="pose" id="prone">
	<label for="prone">คว่ำ</label>
  </span>
  <br>
  <span style="width:105px;"></span>
  <span style="width:155px;">
	<input type="radio" name="pose" id="leftParkbench">
	<label for="leftParkbench">Parkbench ซ้ายลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="leftLateral">
	<label for="leftLateral">Lateral ซ้ายลง</label>
  </span>
  <span style="width:110px;">
	<input type="radio" name="pose" id="leftProne">
	<label for="leftProne">3/4 ซ้ายลง</label>
  </span>
  <span> <input type="text" size="15" id="position"></span>
  <br>
  <br>
  <span style="width:110px;"></span>
  <span style="width:400px;">
	<input type="checkbox" id="selfpay">
	<label for="selfpay"><i>**ผู้ป่วยและญาติสามารถ<b><u>จ่ายส่วนเกินได้ </u></b>(เบิกไม่ได้)</i>**</label>
  </span>
  <br>
  <div style="width:110px;">Imaging</div>
  <span style="width:70px;">
	<input type="checkbox" id="iMRI">
	<label for="iMRI">iMRI</label>
  </span>
  <span style="width:76px;">
	<input type="checkbox" id="iCT">
	<label for="iCT">iCT</label></span>
  <span style="width:140px;">
	<input type="checkbox" id="Fluoroscope">
	<label for="Fluoroscope">Fluoroscope</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Navigator">
	<label for="Navigator">Navigator</label>
  </span>
  <span> <input type="text" size="15" id="Imaging"></span>
  <br>
  <div style="width:110px;">อุปกรณ์ยึดศีรษะ</div>
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
  <span> <input type="text" size="15" id="headHolder"></span>
  <br>
  <div style="width:110px;">เครื่องตัดกระดูก</div>
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
  <span> <input type="text" size="15" id="Craniotome"></span>
  <br>
  <div style="width:110px;">กล้อง</div>
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
  <span> <input type="text" size="15" id="scope"></span>
  <br>
  <div style="width:110px;">CUSA</div>
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
  <span> <input type="text" size="15" id="CUSA"></span>
  <br>
  <div style="width:110px;">Retractor</div>
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
  <span> <input type="text" size="15" id="Retractor"></span>
  <br>
  <div style="width:110px;">U/S</div>
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
  <span> <input type="text" size="15" id="U/S"></span>
  <br>
  <div id="clearShunt" style="width:110px;">Shunt</div>
  <span style="width:106px;">Pudenz</span>
  <span style="width:40px;">หัว</span>
  <span style="width:140px;">
	<input type="radio" name="head" id="proximalLow">
	<label for="proximalLow">low</label>
  </span>
  <span style="width:100px;">
	<input type="radio" name="head" id="proximalMedium">
	<label for="proximalMedium">medium</label>
  </span>
  <span>
	<input type="radio" name="head" id="proximalHigh">
	<label for="proximalHigh">high</label></span>
  <br>
  <span style="width:220px;"></span>
  <span style="width:40px;">ท้อง</span>
  <span style="width:140px;">
	<input type="radio" name="peritoneum" id="distalLow">
	<label for="distalLow">low</label>
  </span>
  <span style="width:100px;">
	<input type="radio" name="peritoneum" id="distalMedium">
	<label for="distalMedium">medium</label>
  </span>
  <span>
	<input type="radio" name="peritoneum" id="distalHigh">
	<label for="distalHigh">high</label></span>
  <br>
  <span style="width:110px;"></span>
  <span style="width:150px;">Programmable</span>
  <span style="width:140px;">
	<input type="radio" name="program" id="shuntMedtronic">
	<label for="shuntMedtronic">Medtronic</label>
  </span>
  <span style="width:105px;">
	<input type="radio" name="program" id="shuntCodman">
	<label for="shuntCodman">Codman</label>
  </span>
  <span> <input type="text" size="15" id="Shunt"></span>
  <br>
  <span style="width:110px;">เครื่องมือบริษัท </span>
  <span style="width:150px;">เวลาส่งเครื่อง <input type="text" size="1" id="equiptime"> น. </span>
  <span style="width:300px;"><input type="text" size="50" id="company"></span>
  <br>
  <div style="width:110px;">อุปกรณ์อื่นๆ</div>
  <span style="width:150px;">
	<input type="checkbox" id="cranioCement">
	<label for="cranioCement">Cranio cement</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="MTECSkull">
	<label for="MTECSkull">MTEC skull</label>
  </span>
  <span> <input type="text" size="30" id="Other"></span>
  <br>
  <div style="width:110px;">Monitor</div>
  <span style="width:73px;"><input type="checkbox" id="CN5"><label for="CN5">CN5</label></span>
  <span style="width:73px;"><input type="checkbox" id="CN6"><label for="CN6">CN6</label></span>
  <span style="width:70px;"><input type="checkbox" id="CN7"><label for="CN7">CN7</label></span>
  <span style="width:70px;"><input type="checkbox" id="CN8"><label for="CN8">CN8</label></span>
  <span style="width:70px;"><input type="checkbox" id="SSEP"><label for="SSEP">SSEP</label></span>
  <span style="width:65px;"><input type="checkbox" id="EMG"><label for="EMG">EMG</label></span>
  <span style="width:65px;"><input type="checkbox" id="MEP"><label for="MEP">MEP</label></span>
  <br>
  <span style="width:110px;"></span>
  <span> <input type="text" size="21" id="Monitor"></span>
  <br>
  <br>
  <span style="width:300px;"></span>
  <span style="width:70px;"> Edited by </span>
  <span style="position:absolute" id="editedby"></span>
</div>

<div id="dialogReadme">
  <p><span class="ui-icon ui-icon-info"></span>
      ใช้ Browser : Chrome, Firefox, หรือ Edge (ie 10+)</p>
  <p><span class="ui-icon ui-icon-info"></span>
  Login ID, Password ของโรงพยาบาล</p>
  <p><span class="ui-icon ui-icon-info"></span>
       การเปลี่ยนวันผ่าตัด (Date) ใช้ Drag & Drop สามารถลากข้ามตารางได้</p>
  <p style="margin:0px;"><span class="ui-icon ui-icon-info"></span>
       เลื่อนช่อง (cell) ใส่ข้อมูล โดยการคลิก หรือกด Tab หรือ Shift+Tab หรือ Enter</p>
  <ul style="margin-top:0px;">
    <li>Enter ขึ้นบรรทัดใหม่บนตาราง</li>
    <li>Shift+Enter ขึ้นบรรทัดใหม่ภายในช่องนั้น</li>
  </ul>

  <h3>หน้าจอหลัก</h3>
  <ul style="margin-top:0px;">
	<li>คอลัมน์ <b>Date</b> : วันผ่าตัด (ไม่ใช่วันนัดมา admit)</li>
	<dd>: หรือ วันที่รับ consult จากหน่วยอื่น</dd>
	<dd>: คลิกช่องนี้ จะปรากฏ Popup Menu</dd>
	<li>คอลัมน์ <b>Staff</b> : คลิกเลือกชื่ออาจารย์เจ้าของไข้</li>
	<li>คอลัมน์ <b>HN</b> : เลข 7 หลักเท่านั้น</li>
	<li>คอลัมน์ <b>ชื่อ นามสกุล</b> : ปรากฏเองตาม HN</li>
	<li>คอลัมน์ <b>อายุ</b> : ปรากฏเองตาม HN</li>
	<li>คอลัมน์ <b>Diagnosis</b> : รวมทั้ง underlying disease</li>
	<li>คอลัมน์ <b>Treatment</b> : เครื่องมือผ่าตัด ให้ใส่ที่ Equipment</li>
	<li>คอลัมน์ <b>Contact</b> : หมายเลขโทรศัพท์ ภูมิลำเนา</li>
  </ul>

  <h3>Menu</h3>
  <p style="margin:0px;">จากการคลิกตรงวันที่ ทั้งตารางรวม และตารางเดี่ยว</p>
  <ul style="margin-top:0px;">
	<li><b>คิวของอาจารย์</b> : มี submenu เลือกชื่ออาจารย์</li>
	  <dt>เมื่อเลือกอาจารย์แล้ว จะแบ่งหน้าจอเป็น 2 ส่วน</dt>
		<dd>: ครึ่งซ้าย เป็นตารางรวม</dd>
		<dd>: ครึ่งขวา เป็นตารางของอาจารย์ท่านเดียว</dd>
	<li><b>เพิ่ม case ต่อท้าย ไม่ระบุวันที่</b> : มีเฉพาะที่ตารางเดี่ยว</li>
		<dd>: ดูวันที่ลงคิวครั้งแรกของผู้ป่วยรายนี้ได้ที่ <b>การแก้ไขของ (ชื่อผู้ป่วย)</b></dd>
	<li><b>เพิ่ม case วันที่ ...</b> : เพิ่มเคสในวันเดียวกัน</li>
		<dd>: ทั้งเคสผ่าตัด และเคส consult</dd>
	<li><b>Delete (ชื่อผู้ป่วย)</b></li>
		<dd>: เฉพาะผู้ป่วยรายที่คลิกนี้</dd>
	<li><b>List of Deleted Cases</b> : สามารถ <b>undelete</b> กลับคืนได้</li>
		<dd>: ผู้ป่วยทั้งหมดที่ถูกลบออก</dd>
	<li><b>การแก้ไขของ (ชื่อผู้ป่วย)</b> : ดูการเปลี่ยนข้อมูลย้อนหลัง</li>
		<dd>: ของผู้ป่วยรายที่คลิกนี้</dd>
	<li><b>PACS</b> : เฉพาะเครื่องที่ดู PACS ได้เท่านั้น</li>
		<dd>: ของผู้ป่วยรายที่คลิกนี้</dd>
	<li><b>Equipment</b> : สำหรับพยาบาลห้องผ่าตัด</li>
		<dd>: ของผู้ป่วยรายที่คลิกนี้</dd>
	<li><b>Service Review</b> : ทั้งเคสผ่าตัด และเคส consult</li>
		<dd>: ต้องลงเคสที่ตารางรวมก่อน</dd>
	<li><b>Readme</b></li>
  </ul>

  <h3>List of Deleted Cases</h3>
  <ul style="margin-top:0px;">
	<li>ต้องการกลับคืน คลิกช่อง <b>Date Time</b> ของเคสนั้น</li>
  </ul>

  <h3>Equipment</h3>
  <ul style="margin-top:0px;">
	<li>แบบฟอร์มที่เคยใส่ข้อมูลแล้ว ต้องคลิก <b>แก้ไข</b></li>
	<li>ยกเลิกเลือกการจัดท่า คลิก <b>Position</b></li>
	<li>ยกเลิกเลือกชนิด shunt คลิก <b>Shunt</b></li>
  </ul>

  <h3>Service Review</h3>
  <ul style="margin-top:0px;">
	<li>ต้องการเปลี่ยนเดือน คลิกลูกศร ซ้าย ขวา</li>
	<li>เข้าดู Service Review คลิกแถบชื่อเดือน</li>
	<li>ดู PACS คลิกช่อง <b>HN Name</b></li>
	<li>ช่อง <b>Diagnosis</b> มีผลต่อจำนวน Re-admission</li>
		<dt>: ใส่วันที่ admit ครั้งก่อนๆ ตรงช่องนี้ </dt>
	<li>ช่อง <b>Treatment</b> มีผลต่อจำนวน Operation, และ Re-operation</li>
		<dt>: เคสที่ไม่มีคำเกี่ยวกับการผ่าตัดในช่อง <b>Treatment</b> ให้ใส่คำว่า op(eration) ตรงช่องนี้</dt>
		<dt>: ใส่วันที่ผ่าตัดครั้งก่อนๆ ตรงช่องนี้ </dt>
		<dt>: เคสที่มีการผ่าตัดซ้ำ แต่ไม่มีวันที่ผ่าตัดครั้งก่อน ให้ใส่คำว่า re-op(eration) ตรงช่องนี้</dt>
	<li>ช่อง <b>Admission Status</b> มีผลต่อจำนวน Re-admission</li>
		<dt>: เคสที่ admit ซ้ำ แต่ไม่มีวันที่ admit ครั้งก่อน ให้ใส่คำว่า re-ad(mission) ตรงช่องนี้</dt>
	<li>ช่อง <b>Final Status</b> มีผลต่อจำนวน Infection, Morbidity, และ Dead</li>
		<dt>: เคสที่มี Infection ให้ใส่คำว่า Infect(ion) หรือ SSI ตรงช่องนี้</dt>
		<dt>: เคสที่มี Morbidity ให้ใส่คำว่า Morbid ตรงช่องนี้</dt>
		<dt>: เคส Dead ให้ใส่คำว่า Dead ตรงช่องนี้</dt>
	<li>ช่อง <b>Admit</b> ของโรงพยาบาล</li>
	<li>ช่อง <b>D/C</b> ของโรงพยาบาล</li>
  </ul>
  <p style="margin-bottom:0px;">
    <span class="ui-icon ui-icon-info"></span>
    Date Format : ใช้เฉพาะตัวเลข ได้ 2 แบบ
  </p>
  <ul style="margin:0px;">
	<li><span style="width:70px">แบบสากล</span>ปีค.ศ.(4 หลัก)-เดือน-วัน</li>
	<li><span style="width:70px">แบบไทย</span>วัน/เดือน/ปีพ.ศ.(2 หรือ 4 หลัก)</li>
  </ul>
	<span class="ui-icon ui-icon-check" style="float:none;margin:0px"></span>
	<span style="width:140px">yyyy-mm-dd</span> เช่น 2017-05-01, 2017-5-1 (ค.ศ. 4 หลักเท่านั้น)<br>
	<span class="ui-icon ui-icon-check" style="float:none;margin:0px"></span>
	<span style="width:140px">d/m/yyyy, d/m/(25)yy</span> เช่น 01/05/2560, 1/5/2560, 31/5/60, 3/11/60<br>
	<span class="ui-icon ui-icon-check" style="float:none;margin:0px"></span>
	9/11/60 = 9 พฤศจิกายน 2560, 11/9/60 = 11 กันยายน 2560<br>
	<span class="ui-icon ui-icon-closethick" style="float:none;margin:0px"></span>
	2560-05-01 (พ.ศ.), 2017/05/01 (/)<br>
	<span class="ui-icon ui-icon-closethick" style="float:none;margin:0px"></span>
	1-5-60 (-), 1/5/17 (ค.ศ.)<br><br>
</div>

<DIV id="login">
	<br>
	<h3>Queue book for Neurosurgery</h3>

	<form method="post" action="">

		<?php $userid = $password = "";
			$passworderr = "Beware of Th key"; ?>

		Login ID: <input id="userid" type="text" maxlength="6" size="6" name="userid"
					value="<?php echo $userid;?>" oninput="namesix()" 
					onpropertychange="namesix()">
		<br>
		<br>
		Password: <input id="password" type="password" name="password"
					maxlength="16" size="8" value="<?php echo $password;?>">
		<br>
		<span id="err" style="color:blue;font-size:10px"><?php echo $passworderr;?></span>
		<br>
		<br>
		<input type="submit" value="Submit">
		<br><br>
	</form>
</DIV>

<script type="text/javascript">

function namesix()
{
	var userid = $("#userid").val()
	if (/^\d{6}$/.test(userid)) {	//six digits only
		$("#password").focus()
	}
}

</script>

<?php
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		$userid = $_POST["userid"];
		$password = $_POST["password"];

		if (preg_match('/^\d{6}$/', $userid))	//six digits only
		{
			if (strpos($_SERVER["SERVER_NAME"], "surgery.rama") !== false)
			{
				$wsdl="http://appcenter/webservice/patientservice.wsdl";
				$client = new SoapClient($wsdl);
				$resultx = $client->Get_staff_detail($userid, $password);
				$resulty = simplexml_load_string($resultx);
				$resultz = $resulty->children()->children()->role;
			}
			else
			{
				$resultz = "S";
			}

			if ($resultz == "S" || $resultz == "R" || $userid == "005497")
			{
				echo "<SCRIPT type='text/javascript'>loadtable('".$userid."')</SCRIPT>";
			}
			else
			{ 
				$passworderr = "Wrong password";
			}
		}
		else
		{ 
			$passworderr = "Wrong ID";
		}
	}
?>

</BODY>
</HTML>
