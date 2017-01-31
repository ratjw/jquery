
function addUp()
{
	var Set = new Array()
	Set[1] = "ข้อมูลอาจารย์"
	Set[2] = "ข้อมูลห้องผ่าตัด"
	Set[3] = "แก้ไขชื่อโรค/การรักษา"
	var menu = document.getElementById("menudiv")
	menu.innerHTML = ""
	for (var each=1; each<Set.length; each++)
	{
	    var txt = "javascript:addUpClick('"+ each +"')"
	    txt = '<a href="'+ txt +'">'+ Set[each] +'</a>'
	    menu.innerHTML += txt
	}
}

function addUpClick(each)
{
	switch(each)
	{
		case "1":
			addStaff()
			break;
		case "2":
			addOrlist()		
			break;
		case "3":
			LoadListDXRX()
			return;
	}
	document.getElementById("menudiv").style.display = ""
	document.getElementById("editmode").style.display = ""
}

function addStaff()
{
	var AddStaff = document.getElementById("AddStaff");
   	AddStaff.style.display = "block";
	var txt = '<table><tr><td>Code :</td><td><label>' ;
	txt += "<input type='text' id='scode' name='code' maxlength='6' ></label></td>";
	txt += "<td>Name :</td><td><label> <input type='text' id='sname' name='name' ></label></td>";
	txt += "<td>Specialty :</td><td><select id='scbb' onchange=getCombo1(this)>";
	for (var each=0; each<SPECIALTY.length; each++)
	{
		txt += "<option value="+SPECIALTY[each]+">"+SPECIALTY[each]+"</option> ";
	}
	txt += "</select></td></tr><br/><hr>";
	txt += "<tr><td><button onClick=doadddata('staff','AddStaff') >AddStaff</button></td>";
	txt += "<td><button onClick=doupdatedata('staff','AddStaff') >UpdateStaff</button></td>";
	txt += "<td><button onClick=dodeletedata('staff','AddStaff') >DeleteStaff</button></td>";
	txt += "<td><button onClick=hidedivmanageseou('AddStaff') >Close</button></td>";
	txt += "<input id='shidden' name='shidden' type='hidden' value='' </tr> <hr>";
	txt += "<table border=1><tr><td>code</td> <td>name</td> <td>specialty</td></tr>";

	for (each=0; each<ALLLISTS.staff.length; each++)
	{
		getvalue = 'javascript:getval("'+ALLLISTS.staff[each]+'","staff")';
		txt += "<tr><td><a href='"+ getvalue +"'>"+ALLLISTS.staff[each][0]+"</a></td> <td>"+ ALLLISTS.staff[each][1] +"</td> <td>"+ ALLLISTS.staff[each][2] +"</td></tr>";
	}
	txt += "</table>";
	AddStaff.innerHTML = txt;
	if (AddStaff.offsetHeight > 400)
	{
		AddStaff.style.height = 400 + "px";
		AddStaff.style.overflowY = "scroll"
	}
}

function addOrlist(){
	var AddOrlist = document.getElementById("AddOrlist");
	AddOrlist.style.display = "block";
	txt = '<div id="Morlist" class=""><tr><td>Room :</td><td><label>' ;
	txt += "<input type='text' id='orroom' name='orroom' maxlength='10' ></label></td>";
	txt += "<td>Specialty :</td><td><select id='ocbb' onchange=getCombo1(this)>";
	for (var each=0; each<SPECIALTY.length; each++)
	{
		txt += "<option value="+SPECIALTY[each]+">"+SPECIALTY[each]+"</option> ";
	}
	txt += "</select></td></tr><br/><hr>";
	txt += "<tr><td><button onclick=doadddata('orlist','AddOrlist') >AddOrlist</button></td>";
	txt += "<td><button onClick=doupdatedata('orlist','AddOrlist') >UpdateOrlist</button></td>";
	txt += "<td><button onClick=dodeletedata('orlist','AddOrlist') >DeleteOrlist</button></td>";
	txt += "<td><button onClick=hidedivmanageseou('AddOrlist') >Close</button></td>";
	txt += "<input id='ohidden' name='ohidden' type='hidden' value='' </tr> <hr></div>";
	txt += "<div id='Dorlist' class=''><table border=1><tr><td>room</td> <td>specialty</td></tr>";
	for (each=0; each<ALLLISTS.or.length; each++)
	{
		getvalue = 'javascript:getval("'+ALLLISTS.or[each]+'","orlist")';
		txt += "<tr><td><a href='"+ getvalue +"'>"+ALLLISTS.or[each][0]+"</a></td> <td>"+ ALLLISTS.or[each][1] +"</td></tr>";
	}
	txt += "</table></div>";
	AddOrlist.innerHTML = txt;
	if (AddOrlist.offsetHeight > 400)
	{
		AddOrlist.style.height = 400 + "px";
		AddOrlist.style.overflowY = "scroll"
	}
}

function LoadListDXRX()
{
	var flag = "flagdx="+ true;	
	
	Ajax(MYSQL_ALLOR,flag, LoadListDX);

	function LoadListDX(response)
	{
	    if (response && response.charAt(0) == "{")
	    {
			var temp
			if (!this.JSON)	//for older browser with no native JSON
				temp = eval("("+ response +")");
			else
				temp = JSON.parse(response);
			SETDXRX9(temp.code)
	    }
	    else 
		{
			alert("No Edit List")
		}
	} 
}

function SETDXRX9(EDXLIST9)
{
	var EditDX = document.getElementById("AddStaff");				
	EditDX.style.display = "block";
	txt = '<div id="Esearchdiv" style="border: 1px solid slategray"><tr><td> ICD : </td><td><label>' ;
	txt += "<input type='text' id='Ecode9' name='Ecode9' size='7' ><input id='DChidden9' name='DChidden9' type='hidden' value=''</label></td>";
	txt += "<td>Disease :</td><td><label> <input type='text' id='EDisease9' name='EDisease9' size='50'> </label></td>";
	txt += "<input id='ftable' name='ftable' type='hidden' value=''> ";
	txt += "<input id='DDhidden9' name='DDhidden9' type='hidden' value=''>";
	txt += " </tr> <hr>";
	txt += "<tr><td><button  style='width:100px' onclick=editDXRX9() >Edit OK</button></td>";
	txt += "<tr><td><button  style='width:100px' onclick=DelDXRX9() >Delete</button></td>"; 				   /////// Create 28-11-2013
	txt += "<td><button  style='width:100px' onClick=hidedivmanageseou('AddStaff') >Cancel</button></td> </tr> <hr></div>"; /////// Create 28-11-2013
	txt += "<table border=1><tr> <td>Code</td> <td>Disease</td><td>From ICD?</td></tr>";

   	for (var each=0; each<EDXLIST9.length; each++)
	{
		getvalue = 'javascript:getval("'+EDXLIST9[each]+'","EDXOP9")';
		txt += "<tr><td><a href='"+ getvalue +"'>"+EDXLIST9[each][0]+"</a></td> <td>"+ EDXLIST9[each][1] +"</td><td>"+ EDXLIST9[each][2] +"</td></tr>";
	}
	txt += "</table>";
	EditDX.innerHTML = txt;
	if (EditDX.offsetHeight > 400)
		EditDX.style.height = 400 + "px";
}

function editDXRX9()
{
	var r=confirm("ต้องการแก้ไขข้อมูลนี้หรือไม่");
	if (r==true)
	  {
		vcode = document.getElementById("Ecode9"); 
		vchidden = document.getElementById("DChidden9");
		vdxrx = document.getElementById("EDisease9");
		vdxhidden = document.getElementById("DDhidden9");
		vftable = document.getElementById("ftable");

		if (vftable.value == "icd9cm")
		{
			var mode = "treatment"
			var tabledxrx = "qbookrx"
		}
		else if (vftable.value == "icd10")
		{
			var mode = "diagnosis"
			var tabledxrx = "qbookdx"
		}

		sqlstring = "sqlReturnQbook=UPDATE "+ vftable.value +" SET code= '"+ vcode.value  +"', "+ mode +"='"+ vdxrx.value +"'"		  //// chok for new chain dxrx
		sqlstring +=" WHERE code='"+ vchidden.value  +"' and "+ mode +" ='"+ vdxhidden.value +"'; "
		sqlstring += "UPDATE "+ tabledxrx +" SET code= '"+ vcode.value  +"', "+ mode +"='"+ vdxrx.value +"'" //// chok for new chain dxrx
		sqlstring +=" WHERE code='"+ vchidden.value  +"' and "+ mode +" ='"+ vdxhidden.value +"'; "
		sqlstring += "&username="+ THISUSER ;

		var callbackdodata = function (response)
		{
			if (!response || response.indexOf("failed") != -1){
				alert("Failed! update database \n\n Restore previous value\n\n" + response)
			}else{
				LoadListDXRX();
				document.getElementById("AddStaff").style.display = "none";
			}
		}
		Ajax(MYSQLIPHP, sqlstring, callbackdodata);
	}else{
		return false;
	}
}
					
function DelDXRX9()
{
	var r=confirm("ต้องการลบข้อมูลนี้หรือไม่");
	if (r==true)
	  {
		vcode = document.getElementById("Ecode9"); 
		vchidden = document.getElementById("DChidden9");
		vdxrx = document.getElementById("EDisease9");
		vdxhidden = document.getElementById("DDhidden9");
		vftable = document.getElementById("ftable");

		if (vftable.value == "icd9cm")
		{
			var mode = "treatment"
			var tabledxrx = "qbookrx"
		}
		else if (vftable.value == "icd10")
		{
			var mode = "diagnosis"
			var tabledxrx = "qbookdx"
		}
		var sqlstring ="sqlReturnQbook=DELETE FROM "+ vftable.value +" WHERE code='"+ vchidden.value  +"' and "+ mode +"='"+ vdxhidden.value +"';" 
		sqlstring += "DELETE FROM "+ tabledxrx +" WHERE code='"+ vchidden.value  +"' and "+ mode +"='"+ vdxhidden.value +"';" 
		sqlstring += "&username="+ THISUSER ;

		var callbackdodata = function (response)
		{
			if (!response || response.indexOf("failed") != -1){
				alert("Failed! update database \n\n Restore previous value\n\n" + response)
			}else{
				LoadListDXRX();
				document.getElementById("AddStaff").style.display = "none";
			}
		}
		Ajax(MYSQLIPHP, sqlstring, callbackdodata);
	}else{
		return false;
	}
}// Create 28-11-2013

function getCombo1(sel) {
  var valuecbb = sel.options[sel.selectedIndex].value; 
}  

function getval(string,chkstate){	
	var myarr = string.split(",");
	if(chkstate=='staff'){
		 document.getElementById("scode").value=myarr[0]; 
		 document.getElementById("shidden").value=myarr[0];
		 document.getElementById("sname").value=myarr[1];
		 document.getElementById("scbb").value=myarr[2];
	}
	else if (chkstate=='user'){
		 document.getElementById("uusername").value=myarr[0]; 
	//	 document.getElementById("upassword").value=""; 
		 document.getElementById("uhidden").value=myarr[0]; 
		 document.getElementById("ucbb").value=myarr[1];
	}
	else if (chkstate=='orlist'){
		 document.getElementById("orroom").value=myarr[0]; 
		 document.getElementById("ohidden").value=myarr[0];
		 document.getElementById("ocbb").value=myarr[1];
	}
	else if (chkstate=='equip'){
		document.getElementById("ecode").value=myarr[0];
		document.getElementById("ehidden").value=myarr[0];
		document.getElementById("ename").value=myarr[1]; 
		document.getElementById("ecbb").value=myarr[2];
	}
	else if(chkstate=='EDXOP9'){
		 document.getElementById("Ecode9").value=myarr[0];
		 document.getElementById("DChidden9").value=myarr[0];
		 document.getElementById("EDisease9").value=myarr[1];
		 document.getElementById("DDhidden9").value=myarr[1];
		 document.getElementById("ftable").value=myarr[2];
	}
}

function hidedivmanageseou(ndiv){
	document.getElementById(ndiv).style.display = ""
}

function doadddata(dbtable,ndiv)
{
	var sqlstring="";
	if(dbtable=='staff'){
		vcode = document.getElementById("scode"); 
		vname = document.getElementById("sname");
		vspecialty = document.getElementById("scbb")
		var sqlstring ="functionName=sqlchknumrow&sqlforchk=Select code From "+ dbtable +" Where code='"+ vcode.value  +"';";
		sqlstring +="&sqlinsert=INSERT INTO "+ dbtable +" VALUES( '"+ vcode.value  +"','"+ vname.value  +"','"+ vspecialty.value  +"');"
		sqlstring += "&username="+ THISUSER;
		var flagstate = chkvalue(dbtable,vcode,vname,vspecialty);
		//alert(sqlstring);	
	}else if(dbtable=='user'){
		vcode = document.getElementById("uusername"); 
		//vname = document.getElementById("upassword");
		vspecialty = document.getElementById("ucbb")
		var sqlstring ="functionName=sqlforuser&constate="+ dbtable +"";
		sqlstring +="&doflag=add";
		sqlstring +="&state1="+ vcode.value +"";
		sqlstring +="&state2="+ vcode.value +"";
		sqlstring +="&state3="+ vspecialty.value +"";
		sqlstring +="&username="+ THISUSER;
		var flagstate = chkvalue(dbtable,vcode,"true",vspecialty);
	}else if(dbtable=='orlist'){
		room = document.getElementById("orroom"); 
		vspecialty = document.getElementById("ocbb")
		var sqlstring ="functionName=sqlchknumrow&sqlforchk=Select room From "+ dbtable +" Where room='"+ room.value  +"';";
		sqlstring +="&sqlinsert=INSERT INTO "+ dbtable +" VALUES( '"+ room.value  +"','"+ vspecialty.value  +"');"
		sqlstring += "&username="+ THISUSER;
		var flagstate = chkvalue(dbtable,"true",room,vspecialty);
	}else if(dbtable=='equip'){
		vcode = document.getElementById("ecode"); 
		vname = document.getElementById("ename");
		vspecialty = document.getElementById("ecbb")
		var sqlstring ="functionName=sqlchknumrow&sqlforchk=Select code From "+ dbtable +" Where code='"+ vcode.value  +"';";
		sqlstring +="&sqlinsert=INSERT INTO "+ dbtable +" VALUES( '"+ encodeURIComponent(vcode.value) +"','"+ encodeURIComponent(vname.value) +"','"+ encodeURIComponent(vspecialty.value) +"');"
		sqlstring += "&username="+ THISUSER;
		var flagstate = chkvalue(dbtable,vcode,vname,vspecialty);
	}
	if(flagstate==true){
		var callbackdodata = function (response)
		{
			if (!response || response.indexOf("failed") != -1){
				alert("Failed! update database \n\n Restore previous value\n\n" + response)
			}else{
				alert("'"+ vcode.value +"' is added")
				LoadLists();
				document.getElementById(ndiv).style.display = "none";//alert(ALLLISTS.username.toString())
			}
		}
		Ajax(MYSQLIPHP, sqlstring, callbackdodata);
	 }///  end of if(flagstate==true){	
}

function doupdatedata(dbtable,ndiv)
{
	var r=confirm("ต้องการแก้ไขข้อมูลนี้หรือไม่");
	if (r==true)
	  {
		var sqlstring="";
		if(dbtable=='staff'){
			vcode = document.getElementById("scode"); 
			vname = document.getElementById("sname");
			vspecialty = document.getElementById("scbb");
			vshidden = document.getElementById("shidden");
			var sqlstring ="sqlReturnSEOU=UPDATE "+ dbtable +" SET code= '"+ vcode.value  +"', name='"+ vname.value +"',"
			sqlstring +=" specialty='" +vspecialty.value  +"' WHERE code='"+ vshidden.value  +"' ;"
			sqlstring += "&username="+ THISUSER;
			var flagstate = chkvalue(dbtable,vcode,vname,vspecialty);
		}else if(dbtable=='user'){
			vcode = document.getElementById("uusername"); 
			//vname = document.getElementById("password");
			vspecialty = document.getElementById("ucbb")
			vshidden = document.getElementById("uhidden");
			var sqlstring ="functionName=sqlforuser&constate="+ dbtable +"";
			sqlstring +="&doflag=up";
			sqlstring +="&state1="+ vcode.value +"";
			sqlstring +="&state2="+ vcode.value +"";
			sqlstring +="&state3="+ vspecialty.value +"";
			sqlstring +="&state4="+ vshidden.value +"";
			sqlstring +="&username="+ THISUSER;
			var flagstate = chkvalue(dbtable,vcode,"true",vspecialty);
		}else if(dbtable=='orlist'){
			room = document.getElementById("orroom");
			vspecialty = document.getElementById("ocbb");
			vshidden = document.getElementById("ohidden");
			var sqlstring ="sqlReturnSEOU=UPDATE "+ dbtable +" SET room= '"+ room.value  +"',"
			sqlstring +="specialty='" +vspecialty.value  +"' WHERE room='"+ vshidden.value  +"' ;"
			sqlstring += "&username="+ THISUSER;
			var flagstate = chkvalue(dbtable,"true",room,vspecialty);
		}else if(dbtable=='equip'){
			vcode = document.getElementById("ecode"); 
			vname = document.getElementById("ename");
			vspecialty = document.getElementById("ecbb")
			vshidden = document.getElementById("ehidden");
			var sqlstring ="sqlReturnSEOU=UPDATE "+ dbtable +" SET code= '"+encodeURIComponent(vcode.value)+"', name='"+encodeURIComponent(vname.value)+"',"
			sqlstring +="specialty='" +encodeURIComponent(vspecialty.value)+"' WHERE code='"+ vshidden.value  +"' ;"
			sqlstring += "&username="+ THISUSER;

			var sqlstring ="sqlReturnSEOU=UPDATE "+ dbtable +" SET code= '"+encodeURIComponent(vcode.value)+"', name='"+encodeURIComponent(vname.value)+"',"
			sqlstring +="specialty='" +encodeURIComponent(vspecialty.value)+"' WHERE code='"+ vshidden.value  +"' ;"
			sqlstring += "&username="+ THISUSER;

			var flagstate = chkvalue(dbtable,vcode,vname,vspecialty);
		}
			if((flagstate==true)&&(vshidden.value!="")){
				var callbackdodata = function (response)
				{
				if (!response || response.indexOf("failed") != -1){
					alert("Failed! update database \n\n Restore previous value\n\n" + response)
					}else{
					//	alert("Success Insert Data")
						LoadLists();
						document.getElementById(ndiv).style.display = "none"
					}
				}
				Ajax(MYSQLIPHP, sqlstring, callbackdodata);
			 }///  if((flagstate==true)&&(vshidden.value!="")){
			 else
			 {
				alert("ไม่ได้เลือกรายการที่ต้องการแก้ไข");
			 }		
	}else{
		return false;
	}//// end of alert confirm box
} // end of function doupdatedata

function dodeletedata(dbtable,ndiv)
{
	var r=confirm("ต้องการลบข้อมูลนี้หรือไม่");
	if (r==true)
	  {
		if(dbtable=='staff'){
			vcode = document.getElementById("scode"); 
			vshidden = document.getElementById("shidden");
			var sqlstring ="sqlReturnSEOU=DELETE FROM "+ dbtable +" WHERE code='"+ vshidden.value  +"' ;"
			sqlstring += "&username="+ THISUSER;
			var flagstate = chkvalue(dbtable,vcode,"true","true");
		}else if(dbtable=='user'){
			vcode = document.getElementById("uusername"); 
			vshidden = document.getElementById("uhidden");
			var sqlstring ="sqlReturnSEOU=DELETE FROM "+ dbtable +" WHERE username='"+ vshidden.value  +"' ;"
			sqlstring += "&username="+ THISUSER;
			var flagstate = chkvalue(dbtable,vcode,"true","true");
		}else if(dbtable=='orlist'){
			room = document.getElementById("orroom"); 
			vshidden = document.getElementById("ohidden");
			var sqlstring ="sqlReturnSEOU=DELETE FROM "+ dbtable +" WHERE room='"+ vshidden.value  +"' ;"
			sqlstring += "&username="+ THISUSER;
			var flagstate = chkvalue(dbtable,"true","true","true");
		}else if(dbtable=='equip'){
			vcode = document.getElementById("ecode"); 
			vshidden = document.getElementById("ehidden");
			var sqlstring ="sqlReturnSEOU=DELETE FROM "+ dbtable +" WHERE code='"+ encodeURIComponent(vshidden.value)  +"' ;"
			sqlstring += "&username="+ THISUSER;
			var flagstate = chkvalue(dbtable,vcode,"true","true");
		}
			if((flagstate==true)&&(vshidden.value!="")){	
				var callbackdodata = function (response)
				{
					if (!response || response.indexOf("failed") != -1){
						alert("Failed! update database \n\n Restore previous value\n\n" + response)
					}else{
					//	alert("Success Insert Data")
						LoadLists();
						document.getElementById(ndiv).style.display = "none"
					}
				}
				Ajax(MYSQLIPHP, sqlstring, callbackdodata);
			}///  if((flagstate==true)&&(vshidden.value!="")){
			else
			{
				alert("ไม่ได้เลือกรายการที่ต้องการลบ");
			}
	}else{
	  return false;
	}
}

function chkvalue(dbtable,vcode,vname,vspecialty){
var chkNumb=/^\d+$/; //Pattern ตรวจสอบข้อมูลที่เป็นตัวเลขเท่านั้น  
var chkEmail=/^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+/; //Pattern ตรวจสอบอีเมล เช่น 123-abc_@hotmail.co.th  
var chkStr=/^[a-zA-Z0-9]+$/;//Pattern ตรวจสอบการกรอกตัวอักษร 5-16 ตัวอักษร  
var chk4=/^[a-zA-Z0-9]{4}/;//Pattern ตรวจสอบการกรอกข้อมูล 4 ตัวอักษรขึ้นไป 
var flag=true;

	if((vcode.value!="")&&(vname.value!="")&&(vspecialty.value!="")){
		if(dbtable=='staff' || dbtable=='user' ){
			if(vcode.value.search(chkNumb) || (vcode.value.length<6)){  
				alert("รหัสแพทย์กับรหัสผู้ใช้ต้องเป็นตัวเลขและกรอกใส่ครบ 6 หลัก\n");
				flag= false;
			}
		}
		else if(dbtable=='equip' || dbtable=='orlist' ){
			if(vcode.value ==""){  
				alert("รหัสอุปกรณ์หรือรหัสห้องต้องให้ครบ\n");
				flag= false;
			}
		}
	}else{ 
		alert("กรอกข้อมูลไม่ครบ");
	  	flag= false;
	}
	return flag;
}
