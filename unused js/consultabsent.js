
function fillConsult(rownum)												
{
	var table = document.getElementById("tbl");
	var menu = document.getElementById("menudiv")
	var consultant = table.rows[rownum].cells[CONSULT].innerHTML
	var clickday = table.rows[rownum].cells[OPDATE].innerHTML.numDate();
	var Firstday = getMonday(clickday);
	var Endday = Firstday.nextdays(6);
	var each
	var staffname
	var txt
	var getvalue

	txt ="List Staff Consult <br>";
	txt += " จาก "+ Firstday.thDate() +"<br>";
	txt += " ถึง "+ Endday.thDate() +"<br>";
	for (each=0; each<ALLLISTS.staff.length; each++)
	{
	    staffname = ALLLISTS.staff[each][1]
		if (consultant.indexOf(staffname) == -1)	//non-existing staffname to insert
		{	//cells[CONSULT].innerHTML is "" if no staffname
			getvalue = 'javascript:SaveConsult("'+ ALLLISTS.staff[each][0] +'","'+ 
						staffname +'","'+ Firstday +'","INSERT")';
			txt += '<a href='+ getvalue +'>'+ staffname +'</a>'; 
		}
		else	//existing staffname to delete
		{
			getvalue = 'javascript:SaveConsult("'+ ALLLISTS.staff[each][0] +'","'+ 
						staffname +'","'+ Firstday +'","DELETE")';
			txt += '<a href='+ getvalue +' style="color:black">'+ staffname +'</a>'; 
		}
	}
 	menu.innerHTML = txt;
}

function fillconsultcalendar(that, opdate)	//click date on calendar
{
	var consultant = constring(opdate)
	var Firstday = getMonday(opdate)
	var Endday = Firstday.nextdays(6)
	var overlay = document.getElementById("overlay")	//for fillConsult(rownum)
	var calendar = document.getElementById("calendar")
	var each
	var staffname
	var txt
	var getvalue
	var leftpos

	if (!that.innerHTML || (that.nodeName == "TH"))
	{
		overlay.style.display = ""	//click not on a date cell
		return
	}
	txt ="List Staff Consult <br>";
	txt += " จาก "+ Firstday.thDate() +"<br>";
	txt += " ถึง "+ Endday.thDate() +"<br>";
	for (each=0; each<ALLLISTS.staff.length; each++)
	{
	    staffname = ALLLISTS.staff[each][1]
		if (consultant.indexOf(staffname) == -1)	//non-existing staffname to insert
		{	//cells[CONSULT].innerHTML is "" if no staffname
			getvalue = 'javascript:SaveConsult("'+ ALLLISTS.staff[each][0] +'","'+ 
						staffname +'","'+ Firstday +'","INSERT")';
			txt += '<a href='+ getvalue +'>'+ staffname +'</a>'; 
		}
		else	//existing staffname to delete
		{
			getvalue = 'javascript:SaveConsult("'+ ALLLISTS.staff[each][0] +'","'+ 
						staffname +'","'+ Firstday +'","DELETE")';
			txt += '<a href='+ getvalue +' style="color:black">'+ staffname +'</a>'; 
		}
	}
	overlay.innerHTML = txt;
	overlay.style.display = "block"
	overlay.style.top = that.offsetTop +"px"
	leftpos = that.offsetLeft + that.offsetWidth
	if ((leftpos + overlay.offsetWidth) > calendar.offsetWidth)
		leftpos = that.offsetLeft - overlay.offsetWidth
	overlay.style.left = leftpos +"px"
}

function SaveConsult (Staffid, Staffname, Firstday, action)
{
	var table = document.getElementById("tbl")
	var lastday = Firstday.nextdays(6)	//lastday of DELETE
	var Endday = Firstday.nextdays(7)	//stop fill if reach Endday
	var rowindex = 0
	var sqlstring 

	if (action == "INSERT")
	{
		sqlstring = "sqlReturnSEOU=INSERT INTO consult VALUES"
		for(var i=0; i<=6; i++)
		{	
			if (i)
				sqlstring += ",";
			sqlstring += "('"+ Firstday.nextdays(i)  +"','"+ Staffid  +"')";
		}
		sqlstring += ";";
	}
	else if (action == "DELETE")
	{
		sqlstring = "sqlReturnSEOU=DELETE FROM consult "
		sqlstring += "WHERE staff='"+ Staffid
		sqlstring += "' AND opdate BETWEEN '"+ Firstday +"' AND '"+ lastday +"';"
	}

	Ajax(MYSQLIPHP, sqlstring, callbackCS);

	while ((isNaN(parseInt(table.rows[rowindex].cells[OPDATE].innerHTML)) || //skip thead
		(table.rows[rowindex].cells[OPDATE].innerHTML.numDate() < Firstday)) &&
		(rowindex < table.rows.length))	//not beyond current table
		rowindex++

	function callbackCS(response)	
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
		}
		else	
		{		
			if (!this.JSON)
				ALLLISTS = eval("("+ response +")");
			else
				ALLLISTS = JSON.parse(response);
			ALLLISTS = ALLLISTS.SOCA;
			//fill calendar
			if (document.getElementById("calendar").style.display == "block")
			{
				ConsultCalendar()
				document.getElementById("overlay").style.display = ""
			}
			//fill consult in main table
			var date = table.rows[rowindex].cells[OPDATE].innerHTML.numDate()
			for (var i=0; i<ALLLISTS.consult.length; i++)
				if (ALLLISTS.consult[i].opdate == date)
					break
			//return from MYSQL without this date means it was deleted
			Staffname = ALLLISTS.consult[i]? ALLLISTS.consult[i].consult : ""
			date = table.rows[rowindex].cells[OPDATE].innerHTML
			while ((isNaN(parseInt(date)) || 
				(date.numDate() < Endday)) && (rowindex < table.rows.length))
			{	//skip thead which parseInt(thead) isNaN
				if (!isNaN(parseInt(date)))
					table.rows[rowindex].cells[CONSULT].innerHTML = Staffname;
				rowindex++;
				date = table.rows[rowindex].cells[OPDATE].innerHTML
			}
		}
		document.getElementById("menudiv").style.display = ""
		stopEditmode()
	}
}

function fillAbsent(rownum)
{
	longperiod = false;
	var table = document.getElementById("tbl");
	var Absent = table.rows[rownum].cells[ABSENT].innerHTML;
	var ABOPDATE = table.rows[rownum].cells[OPDATE].innerHTML;
	var menu = document.getElementById("menudiv");
	var hr
	var menuheight = ""
	var hrwidth = ""
	var div1height = ""
	var div3height = ""

	if ((navigator.userAgent.indexOf("MSIE")+1) && 
		(!document.documentMode || (document.documentMode < 7)))
	{
		menu.style.position = "absolute"
		menuheight = 500 +"px"
		hrwidth = 200 +"px"
		div1height = 170 + "px"
		div3height = 85 + "px"
	}
	menu.innerHTML = "";	
	menu.style.height = menuheight;
	var div1 = document.createElement("div");
	div1.id = "divname";
	var div2 = document.createElement("div");	
	div2.id = "divbtn";
	var div3 = document.createElement("div");
	div3.id = "divdmy";
//_______________________________
//menu
//  div3.id = "divdmy"
//    chkbox label1 span1
//    label3 span2
//    label2 comboyear combomonth comboday
//  hr
//  div1.id = "divname"
//    staffabsent span
//    staffabsent span
//    ... .............
//    ... .............
//  hr
//  div2.id = "divbtn"
//    button
//_______________________________
	menu.appendChild(div3);
	hr = document.createElement("hr");
	hr.style.width = hrwidth;
	menu.appendChild(hr);
	div3.style.height = div3height;

	menu.appendChild(div1);
	hr = document.createElement("hr");
	hr.style.width = hrwidth;
	menu.appendChild(hr);
	menu.appendChild(div2);
	menu.style.overflowY = "hidden";
	div1.style.overflowX = "hidden";
	div1.style.overflowY = "scroll";
	div1.style.height = div1height;	

	var chkbox = document.createElement("input");
	chkbox.type = "checkbox";
	chkbox.id = "chkstaffstate";
	chkbox.onchange = function () {CheckMoreAbsent()}

	var label1 = document.createElement('label');
	label1.htmlFor = "chkstaffstate";
	label1.appendChild(document.createTextNode('แพทย์หยุดหลายวัน'));

	var span1 = document.createElement("span");
	span1.innerHTML ="<br>";
	var label3 = document.createElement('label');
	label3.appendChild(document.createTextNode(' จาก '+ ABOPDATE));

	var span2 = document.createElement("span");
	span2.innerHTML ="<br>";
	var label2 = document.createElement('label');
	label2.htmlFor = "cbbyear";
	label2.appendChild(document.createTextNode(' ถึง '));
	
	var d = new Date();
	var yearofabsent = d.getFullYear();

	var comboyear = document.createElement("select");
	comboyear.id = "cbbyear";
	comboyear.disabled = true;
	comboyear.onchange = function() { 
							leap_year(flagyear = this.options[this.selectedIndex].value)
						}
	var option_y = document.createElement("option");
	option_y.text = "ปี";
	option_y.value = "y";
	comboyear.add(option_y, null); //Standard

	var combomonth = document.createElement("select");
	combomonth.id = "cbbmonth";
	combomonth.disabled = true;
	combomonth.onchange = function() {
							chk_month(flagmonth = this.options[this.selectedIndex].value)
						}
	var option__m = document.createElement("option");
	option__m.text = "เดือน";
	option__m.value = "m";
	combomonth.add(option__m, null); //Standard

	var comboday = document.createElement("select");
	comboday.id = "cbbday";
	comboday.disabled = true;
	comboday.onchange = function() {
							flagday = this.options[this.selectedIndex].value;
						}	

	for (var i=0; i<=3; i++){			// for year combobox 
		var option_y = document.createElement("option");
		    option_y.text = yearofabsent+543+i;
		    option_y.value = yearofabsent+i;
		    try {
			comboyear.add(option_y, null); //Standard
		    }catch(error) {
			comboyear.add(option_y); // IE only
		    }
	}
  	for (ThMonth in NUMMONTH){				// for month combobox 
		var option_m = document.createElement("option");
		    option_m.text = ThMonth;
		    option_m.value = NUMMONTH[ThMonth];
		    try {
			combomonth.add(option_m, null); //Standard
		    }catch(error) {
			combomonth.add(option_m); // IE only
		    }
	}

	div3.appendChild(chkbox);
	div3.appendChild(label1);
	div3.appendChild(span1);
	div3.appendChild(label3);
	div3.appendChild(span2);
	div3.appendChild(label2);
	div3.appendChild(comboyear);
	div3.appendChild(combomonth);
	div3.appendChild(comboday);
	for (var each=0; each<ALLLISTS.staff.length; each++)
	{
	    var staffabsent = document.createElement("input");
	    staffabsent.type = "checkbox";
	    staffabsent.value = ALLLISTS.staff[each][0];
	    staffabsent.defaultChecked = Absent? Absent.match(ALLLISTS.staff[each][1]) : false;	
	    var span = document.createElement("span");
	    span.onclick = function() { this.previousSibling.click() };
	    span.innerHTML = ALLLISTS.staff[each][1] + "<br>";
	    div1.appendChild(staffabsent);
	    div1.appendChild(span);
	}
	var button = document.createElement("input");
	button.type = "button";
	button.onclick = function() { SaveAbsent(Absent, ABOPDATE,rownum) }
	button.value = "Ok";
	div2.appendChild(button);
}

function CheckMoreAbsent(){
	var chkbox = document.getElementById("chkstaffstate");
	var cbby = document.getElementById("cbbyear");
	var cbbm = document.getElementById("cbbmonth");
	var cbbd = document.getElementById("cbbday");
	if (chkbox.checked){
		cbby.disabled = false;
		longperiod = true;
	}else{
		cbby.disabled = true;
		cbbm.disabled = true;
		cbbd.disabled = true;
		longperiod = false;
	}
}		

function leap_year(year){			////// chok for check what year have 29 day in febuary
	var cbbm = document.getElementById("cbbmonth");
	var cbbd = document.getElementById("cbbday");
	if(((year % 4) == 0) && (((year % 100) != 0) || ((year %400) == 0))){ 
		leapyear = 1 ;
		cbbm.disabled=false;
	}else if (year=="y"){
		leapyear = 3 ;
		cbbm.disabled=true;
		cbbd.disabled=true;
	}else{
		leapyear = 2;
		cbbm.disabled=false;
	}
}

function chk_month(month){
	var i
	var cbbd = document.getElementById("cbbday");
	cbbd.options.length = 0;
	var option_d = document.createElement("option");
	option_d.text = "วัน";
	option_d.value = "d";
	cbbd.add(option_d, null); //Standard

	if ((leapyear==3) || (month=="m")){
		cbbd.disabled=true;
	}else if ((flagyear!=3)||(month!="m")){
		cbbd.disabled=false;
	}
	
	if((month==01)||(month==03)||(month==05)||(month==07)||(month==08)||(month==10)||(month==12)){
		for (i=1;i<=31;i++){			/////// for day combobox 
		var option_d = document.createElement("option");
		    option_d.text = i;
		    option_d.value = (i < 10)? "0"+i : ""+i;
		    try {
			cbbd.add(option_d, null); //Standard
		    }catch(error) {
			cbbd.add(option_d); // IE only
		    }
		}
	}else if((month==02) && (leapyear==2)){
		for (i=1;i<=28;i++){			/////// for day combobox 
		var option_d = document.createElement("option");
		    option_d.text = i;
		    option_d.value = i;
		    try {
			cbbd.add(option_d, null); //Standard
		    }catch(error) {
			cbbd.add(option_d); // IE only
		    }
		}//cbbd.remove(30);
	}else if((month==02) && (leapyear==1)){
		for (i=1;i<=29;i++){			/////// for day combobox 
		var option_d = document.createElement("option");
		    option_d.text = i;
		    option_d.value = i;
		    try {
			cbbd.add(option_d, null); //Standard
		    }catch(error) {
			cbbd.add(option_d); // IE only
		    }
		}
	}else{
		for (i=1;i<=30;i++){			/////// for day combobox 
		var option_d = document.createElement("option");
		    option_d.text = i;
		    option_d.value = i;
		    try {
			cbbd.add(option_d, null); //Standard
		    }catch(error) {
			cbbd.add(option_d); // IE only
		    }
		}
	}
}

function SaveAbsent(saveval,ABOPDATE,indexrow)
{
	var table = document.getElementById("tbl")
	var rowmain = table.rows[indexrow]
	var cols = table.rows[0].cells.length
	var menu = document.getElementById("menudiv")
	var div1 = document.getElementById("divname")
	var staffabsent = div1.childNodes
	var absentval = new Array()
	var showval = new Array()
	var sqlstring = ""
	var sql1 = ""
	var sql2 = ""
	var i = 0
	var j = 0
	var txt=""
	var untilday = flagyear+"-"+flagmonth+"-"+flagday;
	var datediff = jsDateDiff(ABOPDATE.numDate(),untilday);
	var each

	for (each=0; each<staffabsent.length; each++) {
	    if (staffabsent[each].checked)
		showval[i++] = staffabsent[each].value;
	}
	var absentday  = table.rows[indexrow].cells[ABSENT].innerHTML	
	if (!isEmpty(absentday)) {	
		for (i=0; i<absentday.length; i++)
		{	absentval[i] = isEmpty(absentday[i].absent)? "" : absentday[i].absent }
	}
	for (i=absentval.length-1; i>=0; i--) {
	    for (j=showval.length-1; j>=0; j--) {
		if (absentval[i].match(showval[j])) {
		    absentval.splice(i,1)
		    showval.splice(j,1)
		    break
		}
	    }
	}

	if (absentval.length)
	{	
		sql1 = "DELETE FROM absent WHERE ";
		sql1 += (longperiod)? " (opdate BETWEEN '"+ ABOPDATE.numDate() +"' AND '"+ untilday+"')" :  " opdate='"+ ABOPDATE.numDate() +"'";
	}

	if(longperiod==true){
		if (showval.length)
		{	
			sql1 += (absentval.length)?  " AND staff IN (": ""  /////// shorthand condition 
			sql2 += "INSERT INTO absent VALUES ";
			for (j=0;j<=datediff;j++)
			{
				for (i=0;i<showval.length;i++)
				{
					if (i||j)
						sql2 += ",";
					sql2 += "('"+ (ABOPDATE.numDate()).nextdays(j) +"', '"+ showval[i] +"')";					
					for (each=0; each<ALLLISTS.staff.length; each++)
					{
					   	if(showval[i]==ALLLISTS.staff[each][0])
						{
							txt +=ALLLISTS.staff[each][1]+"<br>"
							if(((longperiod==true)&&(absentval.length))&&j==0){
								if (i)
									sql1 += ",";		
								sql1 += "'"+ALLLISTS.staff[each][0]+"'"
							}/// end of if longperiod
						}			   
					}  /// end of for (each in ALLLISTS.staff)	
				} /// end of for (i=0; i<showval.length; i++)
			}
			sql1 += (absentval.length)? ")" :""
		}  /// end of if (showval.length)	
	}else{
		if (showval.length)
		{
			sql2 += "INSERT INTO absent VALUES ";
			for (i=0; i<showval.length; i++) 
			{
				if (i)
					sql2 += ",";
				sql2 += "('"+ ABOPDATE.numDate() +"', '"+ showval[i] +"')";
										
				for (each=0; each<ALLLISTS.staff.length; each++)
				{
				   	if(showval[i]==ALLLISTS.staff[each][0])
					{
						txt +=ALLLISTS.staff[each][1]+"<br>"
					}			   
				}  /// end of for (each in ALLLISTS.staff)	
			} /// end of for (i=0; i<showval.length; i++)
		}  /// end of if (showval.length)	
	}
	
	if (sql1)
		sql1 += ";"
	if (sql2)
		sql2 += ";"
	if (sql1 == "" && sql2 == "")
	{
		document.getElementById("menudiv").style.display = ""
		stopEditmode()
		return
	}
	sqlstring = "sqlReturnSEOU="+ sql1 + sql2

	var callbackAb = function (response)	
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
			point.innerHTML = table.rows[indexrow].cells[ABSENT].innerHTML
		}
		else	
		{		
			if (!this.JSON)
				ALLLISTS = eval("("+ response +")");
			else
				ALLLISTS = JSON.parse(response);
			ALLLISTS = ALLLISTS.SOCA;
			if (longperiod)
				filluprefill()
			else
				table.rows[indexrow].cells[ABSENT].innerHTML = txt;
		}
		document.getElementById("menudiv").style.display = ""
		stopEditmode()
	}

	Ajax(MYSQLIPHP, sqlstring, callbackAb);

}

function jsDateDiff(strDate1,strDate2){

	var StartDate = strDate1
	var EndDate = strDate2
	var defDate = (EndDate.getTime() - StartDate.getTime()) / 86400000;
	return defDate;
}
