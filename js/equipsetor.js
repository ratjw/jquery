
function fillEquipTable(rownum, qn)
{
	var table = document.getElementById("tbl")
	var rowmain = table.rows[rownum]
	var opdate = rowmain.cells[OPDATE].innerHTML
	var oproom = rowmain.cells[OPROOM].innerHTML
	var optime = rowmain.cells[OPTIME].innerHTML
	var staffname = rowmain.cells[STAFFNAME].innerHTML
	var hn = rowmain.cells[HN].innerHTML
	var patientname = rowmain.cells[NAME].innerHTML
	var age = rowmain.cells[AGE].innerHTML
	var diagnosis = rowmain.cells[DIAGNOSIS].innerHTML
	var treatment = rowmain.cells[TREATMENT].innerHTML
	var equipOR = document.getElementById("paperdiv")
	var txt = ""
	var q = 0

	while (QBOOKFILL[q].qn != qn)
		q++
	txt = "<div id='oequip' style='display:none'></div>";	//hidden copy of equip to be compared with new ones
	txt += "<div id='equip'>";
	txt += "<span style='width:400px;'></span>";
	txt += "<span style='width:100px; font-size: 18px; font-weight: bold;'>ห้อง "+ oproom +"</span>";
	txt += "<span style='width:20px;'></span>เวลา "+ optime;
	txt += "<br>";
	txt += "<br>";
	txt += "<span style='width:250px;'></span>วันที่ผ่าตัด ";
	txt += "<span style='width:120px; font-size: 18px; font-weight: bold;'); >"+ opdate +"</span>";
	txt += "<span style='width:20px;'></span>Surgeon "+ staffname;
	txt += "<br>";
	txt += "<span style='width:100px;'>ชื่อ-นามสกุล</span>"+ patientname;
	txt += "<span style='width:20px;'></span>อายุ "+ age;
	txt += "<span style='width:20px;'></span>HN "+ hn;
	txt += "<br>";
	txt += "<span style='width:100px;'>Diagnosis</span>"+ diagnosis;
	txt += "<br>";
	txt += "<span style='width:100px;'>Operation</span>"+ treatment;
	txt += "<br>";
	txt += "<span style='width:120px;'>Position </span>";
	txt += "<span style='width:70px;'><label><input type='radio' name='pose' value='prone'>คว่ำ</label></span>";
	txt += "<span style='width:70px;'><label><input type='radio' name='pose' value='supine'>หงาย</label></span>";
	txt += "<span style='width:120px;'><label><input type='radio' name='pose' value='right lateral'>ตะแคงขวาลง</label></span>";
	txt += "<span style='width:120px;'><label><input type='radio' name='pose' value='left lateral'>ตะแคงซ้ายลง</label></span>";
	txt += "<span>อื่นๆ<input type='text' size='7' id='position'></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'></span>";
	txt += "<span><label><input type='radio' name='pay' value='selfpay'><i>**ผู้ป่วยและญาติสามารถ<b><u>จ่ายส่วนเกินได้ </b></u>(เบิกไม่ได้)</i>**</label></span>";
	txt += "<span style='width:10px;'></span>";
	txt += "<span><label><input type='radio' name='pay' value='nopay'><i>จ่ายไม่ได้ </i></label></span>";
	txt += "<br>";
	txt += "<br>";
	txt += "<span style='width:120px;'>1.Imaging</span>";
	txt += "<span style='width:70px;'><label><input type='checkbox' value='iMRI'>iMRI</label></span>";
	txt += "<span style='width:70px;'><label><input type='checkbox' value='iCT'>iCT</label></span>";
	txt += "<span style='width:110px;'><label><input type='checkbox' value='Navigator'>Navigator</label></span>";
	txt += "<span style='width:130px;'><label><input type='checkbox' value='Fluoroscope'>Fluoroscope</label></span>";
	txt += "<span>อื่นๆ<input type='text' size='7' id='Other1'></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'>2.อุปกรณ์ยึดศีรษะ</span>";
	txt += "<span style='width:140px;'><label><input type='checkbox' value='Mayfield'>Mayfield</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='Horseshoe'>Horseshoe</label></span>";
	txt += "<span>อื่นๆ<input type='text' size='7' id='Other2'></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'>3.เครื่องตัดกระดูก</span>";
	txt += "<span style='width:150px;'><label><input type='checkbox' value='High Speed Drill'>High Speed Drill</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='Sagittal Saw'>Sagittal Saw</label></span>";
	txt += "<span style='width:110px;'><label><input type='checkbox' value='Osteotome'>Osteotome</label></span>";
	txt += "<span>อื่นๆ<input type='text' size='7' id='Other3'></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'>4.กล้อง</span>";
	txt += "<span style='width:140px;'><label><input type='checkbox' value='Microscope'>Microscope</label></span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='ICG'>ICG</label></span>";
	txt += "<span><label><input type='checkbox' value='Endoscope'>Endoscope</label></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'>5.CUSA</span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='Excell'>Excell</label></span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='Soring'>Soring</label></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'>6.Retractor</span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='Leylar'>Leylar</label></span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='Halo'>Halo</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='Greenberg'>Greenberg</label></span>";
	txt += "<span>อื่นๆ<input type='text' size='7' id='Other4'></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'>7.U/S</span>";
	txt += "<span style='width:300px;'><label><input type='checkbox' value='Ultrasound'>Ultrasound เครื่องใหญ่ ขนาดหัว.......</label></span>";
	txt += "<span><label><input type='checkbox' value='Doppler'>Doppler</label></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'>8.Shunt</span>";
	txt += "<span style='width:80px;'>Pudenz</span>";
	txt += "<span style='width:30px;'>หัว</span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='Pudenz หัว low'>low</label></span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='Pudenz หัว medium'>medium</label></span>";
	txt += "<span><label><input type='checkbox' value='Pudenz หัว high'>high</label></span>";
	txt += "<br>";
	txt += "<span style='width:200px;'></span>";
	txt += "<span style='width:30px;'>ท้อง</span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='ท้อง low'>low</label></span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='ท้อง medium'>medium</label></span>";
	txt += "<span><label><input type='checkbox' value='ท้อง high'>high</label></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'></span>";
	txt += "<span style='width:120px;'>Programmable</span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='Programmable Medtronic'>Medtronic</label></span>";
	txt += "<span style='width:100px;'><label><input type='checkbox' value='Programmable Codman'>Codman</label></span>";
	txt += "<span>อื่นๆ<input type='text' size='7' id='Other5'></span>";
	txt += "<br>";
	txt += "<span style='width:160px;'>9.เครื่องมือของบริษัท </span>เวลาส่งเครื่อง ";
	txt += "<span><input type='text' size='4' id='equiptime'></span>น ";
	txt += "<span style='width:20px;'></span>";
	txt += "<span><input type='text' size='25' id='Other6'></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'>10.อุปกรณ์อื่นๆ</span>";
	txt += "<span style='width:200px;'><label><input type='checkbox' value='Cranioplastic cement'>Cranioplastic cement</label></span>";
	txt += "<span style='width:200px;'><label><input type='checkbox' value='MTEC artificial skull'>MTEC artificial skull</label></span>";
	txt += "<span>อื่นๆ<input type='text' size='7' id='Other7'></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'>11.Monitor</span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='CN5'>CN5</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='CN6'>CN6</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='CN7'>CN7</label></span>";
	txt += "<span><label><input type='checkbox' value='CN8 (BAER)'>CN8 (BAER)</label></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='CN9'>CN9</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='CN10'>CN10</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='SSEP'>SSEP</label></span>";
	txt += "<span><label><input type='checkbox' value='MEP'>MEP</label></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='Direct Stim'>Direct Stim</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='Phase Reversal'>Phase Reversal</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='ECOG'>ECoG</label></span>";
	txt += "<span><label><input type='checkbox' value='EEG'>EEG</label></span>";
	txt += "<br>";
	txt += "<span style='width:120px;'></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='EMG'>EMG</label></span>";
	txt += "<span style='width:120px;'><label><input type='checkbox' value='D-wave'>D-wave</label></span>";
	txt += "<span>อื่นๆ<input type='text' size='7' id='Other8'></span>";
	txt += "<br>";
	txt += "<br>";
	txt += "<span style='width:350px;'></span>Set ผ่าตัดโดย <span id='setby'></span>";
	txt += "<br>";
	txt += "<span style='width:350px;'></span>วัน เวลา <span id='setdate'></span>";
	txt += "<br>";
	txt += "<span style='width:350px;'></span>รับ Set ผ่าตัดโดย ....................";
	txt += "<br>";
	txt += "<span style='width:350px;'></span>วัน เวลา ....................";
	txt += "</div>";

	txt += "<br>";
	txt += "<hr>";
	txt += "<br>";

	txt += "<div id='setor'>";
	txt += "<span style='width:120px; font-weight: bold;'>ประเภทคลีนิค :</span>";
	txt += "<span style='width:90px;'><label><input type='radio' id='intime' name='group1' value='intime'> ในเวลา </label></span>";
	txt += "<span style='width:90px;'><label><input type='radio' id='outtime' name='group1' value='outtime'> นอกเวลา </label></span>";
	txt += "<label><input type='radio' id='premium' name='group1' value='premium'> พรีเมียม </label>";
	txt += "<span style='width:50px;'></span><span style='font-weight: bold;'>Case :</span><span style='width:10px;'></span>";
	txt += "<span style='width:70px;'><label><input type='radio' id='I' name='group2' value='I'> IPD </label></span>";
	txt += "<label><input type='radio' id='O' name='group2' value='O'> OPD </label>";
	txt += "<br>";
	txt += "<span style='width:120px; font-weight: bold;'>Type : </span>";	
	txt += "<span style='width:90px;'><label><input type='radio' id='M' name='group3' value='M'> Major </label></span>";
	txt += "<label><input type='radio' id='N' name='group3' value='N'> Minor </label>";
	txt += "<span style='width:60px; font-weight: bold;'></span><span style='font-weight: bold;'>Special : </span>";
	txt += "<span style='width:50px;'><label><input type='radio' id='+' name='group5' value='+' disabled> +ve </label></span>";
	txt += "<span style='width:50px;'><label><input type='radio' id='-' name='group5' value='-' disabled> -ve </label></span>";
	txt += "<label><input type='radio' id='N' name='group5' value='N' disabled> Not assessed </label>";
	txt += "<br>";
	txt += "<span style='width:120px; font-weight: bold;'>Blood :</span>";
	txt += "<select id='blcbb' onchange=do_addblood('add','0')>";
	txt += "<option value='- -'> - - </option>";
	for (each=0; each<BLOODLIST.length; each++)
	{
		txt += "<option value='"+ BLOODVALUE[each] +"'>"+ BLOODLIST[each] +"</option> ";
	}
	txt += "</select>";
	txt += " unit : <select id='bunitcbb' onchange=do_addblood('add','0')>";
	txt += "<option value='- -'> - - </option> ";
	for (i=1; i<=10; i++)
	{
		txt += "<option value="+ i +">"+ i +"</option> "; 
	}
	txt += "</select><span style='vertical-align: bottom;'>";
	txt += "<div style='border: 1px solid slategray;width:250px;height:18px;' id='bdlist'></div></span>";
	txt += "<br>";
	txt += "<span style='width:120px; font-weight: bold;'>Anaes Tech :</span><select id='anacbb'>";
	txt += "<option value='- -'> - - </option> ";
	for (each=0; each<ANESTECHLIST.length; each++)
	{
		txt += "<option value='"+ ANESTECHNUMLIST[each] +"'>"+ ANESTECHLIST[each] +"</option>";
	}
	txt += "</select>";
	txt += "<span id='LRclick' style='display:none'>";
	txt += "<span style='width:20px;'></span><span style='color:red;'>Click to change unit</span>";
	txt += "<span style='width:20px;'></span><span style='color:red;'>Right mouse to delete</span></span>";
	txt += "<br>";
	txt += "<span style='width:120px; font-weight: bold;'>หน่วยที่ดูแล :</span><select id='sub_attcbb'>";
	txt += "<option value='- -'> - - </option> ";
	for (each=0; each<UNITCARELIST.length; each++)
	{
		txt += "<option value='"+ UNITCARELIST[each] +"'>"+ UNITCARELIST[each] +"</option>";
	}
	txt += "</select>";
	txt += "<span style='width:50px;'></span>Ward : <select id='wadcbb'>";
	txt += "<option value='- -'> - - </option> ";
	for (each=0; each<WARDLIST.length; each++)
	{
		txt += "<option value='"+ WARDLIST[each] +"'>"+ WARDTEXTLIST[each] +"</option>";
	}
	txt += "</select>";
	txt += "<br>";
	txt += "<br>";
	txt += "<button onclick=saveequip("+ qn +")>SAVE ALL (no print)</button>";
	txt += "<button onclick=printpaper("+ qn +")>Print & Save Equipments</button>";
	txt += "<button onClick=cancelset()>CANCEL</button>";
	txt += "<br>";
	txt += "<br>";
	txt += "</div>";

	equipOR.innerHTML = txt;
	equipOR.style.display = "block";
	equipOR.style.top = "0px"
	equipOR.style.left = rowmain.cells[OPDATE].offsetWidth +"px"	//show first column
	if (equipOR.offsetHeight > $(window).height() - 140)
	{	//paperdiv padding = top:70px; bottom:70px that add up to 140
		equipOR.style.height = $(window).height() - 200 +"px"
		equipOR.style.overflowY = "scroll"
		equipOR.scrollTop = equipOR.scrollHeight	//scroll to bottom
	}
	else
	{
		equipOR.style.height = ""
		equipOR.style.overflowY = ""
	}
	document.getElementById("position").onclick = function () { 
		var pose = document.getElementsByName("pose")
		for (var i=0; i<pose.length; i++)
			pose[i].checked = false
	}

	var oequip = document.getElementById("oequip")
	var equip = document.getElementById("equip")
	var listequip = equip.getElementsByTagName("INPUT");
	var i;
	var j;	

	if (!isEmpty(QBOOKFILL[q].equip))
	{	//fill checked equip if any
		for (j = 0; j < QBOOKFILL[q].equip.length; j++)
		{
			var qequipj = QBOOKFILL[q].equip[j]
			if (qequipj.code)				//input text "others" items
				document.getElementById(qequipj.code).value = qequipj.name; 
			else							//checkbox items have no code
				for (i = 0; i < listequip.length; i++) 
					if (listequip[i].value == qequipj.name) 
					   listequip[i].checked = true;
		} 
 	}
	oequip.innerHTML = equip.innerHTML	//copy equip to be compared with new ones

	var olistequip = oequip.getElementsByTagName('SPAN')
	for (i=0; i<olistequip.length; i++)
		if (olistequip[i].id == "setby" || olistequip[i].id == "setdate")
			olistequip[i].id = ""			//delete duplicated id in <span>
	olistequip = oequip.getElementsByTagName('INPUT')
	for (i=0; i<listequip.length; i++)
	{
		olistequip[i].id = ""		//delete duplicated id in <input>
		olistequip[i].name = ""		//delete radio button name
		olistequip[i].checked = listequip[i].checked
	}
//	setdefault("fillEquipTable", equip)

	//setor part
	var specialcare = gethiv(q);
	var rdbhiv = document.getElementsByName("group5");
	for (i=0; i<rdbhiv.length; i++) {	
		if (rdbhiv[i].value == specialcare) {
			rdbhiv[i].checked = true;
		}
	}

	Ajax(MYSQL_ALLOR, "qn_or="+ qn, LoadListOR);

	function LoadListOR(response)
	{
		if (response && response.charAt(0) == "{")
		{	
			var AllLists = eval("(" + response + ")");
			var SETORLIST = AllLists.Orlist;
			if (SETORLIST[0][9] == qn)
			{	
				document.getElementById(SETORLIST[0][0]).checked = true;	//rdclinic
				document.getElementById(SETORLIST[0][1]).checked = true;	//rdcase
				var bdval = SETORLIST[0][2].split(".");	// retrieve old blood val
				for(i=0; i<bdval.length; i++)			
					do_addblood('select', bdval[i]);
				document.getElementById("anacbb").value = SETORLIST[0][3];	//anaes
				document.getElementById("wadcbb").value = SETORLIST[0][4];	//w_admit
				document.getElementById(SETORLIST[0][5]).checked = true;	//or_type
				document.getElementById("sub_attcbb").value = SETORLIST[0][6];	//sub_att
			}
		}
		else
			setdefault("LoadListOR", document.getElementById("setor"))
	}
}

function saveequip(qn) 
{
	Checklistequip(qn)
	doSet_OR(qn)
	cancelset()
}

function Checklistequip(qn) 
{
	var newequip = document.getElementById("equip").getElementsByTagName("INPUT");
	var oldequip = document.getElementById("oequip").getElementsByTagName("INPUT");
	var listnewequipid = new Array();
	var listnewequip = new Array();
	var listoldequip = new Array();
	var listupdateid = new Array();
	var listupdate = new Array();
	var i;
	var sql="";

	for (i = 0; i < newequip.length; i++) 
	{
		if (newequip[i].id)
		{
			if (oldequip[i].value)
			{
				if (newequip[i].value)
				{
					if (oldequip[i].value != newequip[i].value) 
					{	// get id input to update
						listupdate.push(newequip[i].value);
						listupdateid.push(newequip[i].id);
					}
				}
				else
				{	// get old input to delete
					listoldequip.push(oldequip[i].value);
				}
			}
			else
			{
				if (newequip[i].value)
				{	// get id input to insert
					listnewequip.push(newequip[i].value);
					listnewequipid.push(newequip[i].id);
				}
			}
		}
		else
		{
			if (oldequip[i].checked && !newequip[i].checked) 
			{	// get old equip to delete
				listoldequip.push(oldequip[i].value);
			}
			else if (!oldequip[i].checked && newequip[i].checked) 
			{	// get new equip to insert
				listnewequip.push(newequip[i].value);
				listnewequipid.push(newequip[i].id);
			}
		}
	}
	if (listoldequip.length)
	{		
		sql = "SET @editor='"+ THISUSER +"';"
		sql += "DELETE FROM qbookeq WHERE "
		for (i=0; i<listoldequip.length; i++)
		{
			if (i)
				sql += " OR "
			sql += "(qn="+ qn +" AND name='"+ listoldequip[i] +"')"
		}
		sql += ";"
	}
	if (listnewequip.length)
	{
		sql += "INSERT INTO qbookeq (qn, code, name, editor) VALUES ";
		for (i=0; i<listnewequip.length; i++)
		{
			if (i)
				sql += ",";
			sql += "("+ qn +",'"+ listnewequipid[i] +"' ,'"+ listnewequip[i] +"','"+THISUSER+"')";
		}
		sql += ";"
	}
	if (listupdate.length)
	{
		for (i=0; i<listupdate.length; i++)
		{
			sql += "UPDATE qbookeq SET ";
			sql += "name='"+ listupdate[i] +"' ,";
			sql += "editor='"+ THISUSER +"' ";
			sql += "WHERE qn="+ qn ;
			sql += " AND code='"+ listupdateid[i] +"';";
		}
	}
	if (!sql)
		return

	Ajax(MYSQLIPHP, "sqlReturnQbook="+ sql, callbackEq);

	function callbackEq(response)
	{
		if (!response || response.indexOf("QTIME") == -1)
		{
			alert("Failed! update database \n\n" + response)
		}
		else	//there is some change
		{
			updateQBOOK(response)
			updateQBOOKFILL()
		}
	}
}

function printpaper(qn)
{
	var equip = document.getElementById("equip")
	var win = window.open()
	var newequip
	var winequip
	var i
	var temp
	var setby = THISUSER
	var setdate = (new Date()).toString().replace(/GMT.*|UTC.*/, "")

	Checklistequip(qn) 
	win.document.open();
	win.document.write('<LINK type="text/css" rel="stylesheet" href="print.css">');
	win.document.write(equip.outerHTML)
	//clone cannot be used across window
	//outerHTML comes with container of itself
	//outerHTML comes without checked status
	temp = win.document.getElementById("equip")
	win.document.getElementById("setby").innerHTML = setby
	win.document.getElementById("setdate").innerHTML = setdate
	newequip = equip.getElementsByTagName("INPUT");
	winequip = win.equip.getElementsByTagName("INPUT");
	for (i = 0; i < newequip.length; i++) 
	{
		winequip[i].checked = newequip[i].checked
		winequip[i].value = newequip[i].value
		if (!winequip[i].checked || !winequip[i].value)
		{	//pale color for no input items
			temp = winequip[i]
			while (temp.nodeName != "SPAN")
				temp = temp.parentNode
			temp.className = "pale"
		}
	}
	win.document.close();
	win.focus();
	win.print();
	win.close();
}

function cancelset()
{
	document.getElementById("paperdiv").style.display = ""
	document.getElementById("menudiv").style.display = ""	//menudiv from click FirstColumn
	stopeditmode()
}

function doSet_OR(qn)
{
	var rdclinic,rdcase,blood,anaes,w_admit,or_type,sub_att,r_entry,status_or;
	var list = document.getElementById("bdlist");
	var items = list.getElementsByTagName("SPAN");
	var group1 = document.getElementsByName("group1");
	var group2 = document.getElementsByName("group2");
	var group3 = document.getElementsByName("group3");
	var i

	for (i=0; i<group1.length; i++)
	{
		if (group1[i].checked)
			rdclinic = group1[i].value
	}
	for (i=0; i<group2.length; i++)
	{
		if (group2[i].checked)
			rdcase = group2[i].value
	}
	for (i=0; i<group3.length; i++)
	{
		if (group3[i].checked)
			or_type = group3[i].value
	}
	for (i=0; i<items.length; i++) 
	{
		if (i)
			blood += "."
		else
			blood = ""
		blood += items[i].innerHTML;
		var itemi = items[i].nextSibling	//click to change unit in bdlist
		if (itemi && (itemi.nodeName == "SELECT"))	//but left unselected 
			blood += itemi.firstChild.innerHTML		//add the current number
	}
	anaes = document.getElementById("anacbb").value
	w_admit = document.getElementById("wadcbb").value
	sub_att = document.getElementById("sub_attcbb").value
	r_entry = THISUSER
	status_or = "A"

	var VALSETORLIST = [rdclinic,rdcase,blood,anaes,w_admit,or_type,sub_att,r_entry,status_or,qn];
	var setORVariable = "SETORLIST="+ encodeURIComponent(VALSETORLIST);	//join array to csv string implicitly
	setORVariable += "&qn="+ qn;
	setORVariable += "&username="+ THISUSER;

	Ajax(MYSQL_ALLOR, setORVariable, callbackdoSetOR);

	function callbackdoSetOR(response){
		if (!response || response.indexOf("failed") != -1){
			alert("Failed! update ordetail \n\n Restore previous value\n\n" + response)
//		}else{
//			var addalert = ""
//			if (chknull(VALSETORLIST)) 
//				addalert = "\r\rคำเตือน : ข้อมูลในการ SET_OR ยังไม่ครบ";
//			alert("Save ข้อมูลสำเร็จ")//+ addalert)	
		}
	}
}

function chknull(LIST)
{
	for (each=0; each<LIST.length; each++)
	{ 
		if (!LIST[each])	// (LIST[each] == "") missed "undefined"
			return true;
	}
	return false;
}

function do_addblood(choice, bdtext)
{
	var divbd = document.getElementById("bdlist")
	var spabd = document.createElement("SPAN")
	var blood = document.getElementById("blcbb")
	var unit = document.getElementById("bunitcbb")
	var help = document.getElementById("LRclick")
	var temp

	spabd.style.border = "thin solid #000000"
	spabd.style.padding = "0px 5px 0px 5px"	//top right bottom left
	spabd.onclick = function() {
		var current = spabd.innerHTML.match(/\d+$/)	//one or more digit at the end
		if (!current)	//has been left clicked, no unit number at the end
			return
		var txt = '<option value="" disabled selected style="display:none;">'+ current +'</option>'
		// selected value "" lets select current value (displayed by "current") triggers onchange
		//this is a work-around when select the same current value combo box not trigger onchange
		for (i=1; i<=10; i++)
		{
			txt += "<option value="+ i +">"+ i +"</option>"; 
		}
		temp = document.createElement("SELECT")
		temp.onchange = function (){
			spabd.innerHTML += this.value	//*this* is the element <SELECT>
			divbd.removeChild(this)
		}
		temp.innerHTML = txt
		spabd.innerHTML = spabd.innerHTML.match(/^[A-Za-z]+/)	//from beginning one or more character to delete unit number
		divbd.insertBefore(temp, spabd.nextSibling)	//for not last element can't use appendChild
	}
	spabd.oncontextmenu = function() {
		if (spabd.nextSibling && spabd.nextSibling.nodeName == "SELECT")	//left combobox unselected
			spabd.parentNode.removeChild(spabd.nextSibling)		//remove unselected combo box
		spabd.parentNode.removeChild(spabd)		//remove the clicked list
		if (!divbd.innerHTML)		//no list, close display help
			help.style.display = "none"
	}

	if (choice == "add")	//add from new input
	{
		if ((blood.value != "- -") && (unit.value != "- -"))
		{
			if (temp = chkblood(divbd, blood.value))	//check existing requested blood type
			{
				temp.innerHTML = blood.value + unit.value	//write over the same SPAN element
			}
			else
			{
				spabd.innerHTML = blood.value + unit.value
				divbd.appendChild(spabd)
			}
			blood.value = "- -"
			unit.value = "- -"
		}
	}
	else if (choice == "select")	//values from database
	{
		spabd.innerHTML = bdtext
		if (spabd.innerHTML)		//empty spabd has style that display as a dot (.)
			divbd.appendChild(spabd)
	}
	if (divbd.innerHTML)		//there's a list, display help
		help.style.display = "inline-block"	//have to be inline
}

function chkblood(divbd, blval)
{
	var spanbddiv = divbd.getElementsByTagName("SPAN")
	for (var i=0; i<spanbddiv.length; i++)
	{
		if (spanbddiv[i].innerHTML.match(/^[A-Za-z]+/) == blval)	//blood type stripped unit
			return spanbddiv[i];
	}
	return false;
}

function gethiv(q)
{
	var dxcode = QBOOKFILL[q].diagnosis

	if (!dxcode || !dxcode.length)
		return ''
	for (var i=0; i<dxcode.length; i++)
	{ 
		if (/HIV \+ve/.test(dxcode[i].diagnosis))
			return '+'
		else if (/HIV -ve/.test(dxcode[i].diagnosis))
			return '-'
	
	}
	return 'N'
}
