function clicktable(event)
{
/*
	event = event || window.event	//for IE

	//checkpoint#1 : click on queue table
	if ($("#queuediv").css("display") == "block")
		return
	
	//checkpoint#2 : click in editing area
	var pointing = whichElement(event)
	if (pointing.id == "editmode")
		return

	//checkpoint#3 : click not in editing cell, disable the editing area, if any
	if ($("#editmode").get(0) || $("#alert").css("display") == "block")
	{
		hidepopup()
		stopeditmode()
		return
	}

	//checkpoint#4 : click on table header
	if (pointing.nodeName != 'TD')
	{
		hidepopup()
		stopeditmode()
		return
	}
	var table = document.getElementById("tbl")
	var cindex = $(pointing).closest("td").index()
	var rowtr = $(pointing).closest("tr")
	var rindex = $(rowtr).index()
	var pointDate = $(rowtr).children("td" ).eq(OPDATE).html()
	var qn = $(rowtr).children("td").eq(QN).html()
	var movemode = document.getElementById("movemode")
	var copymode = document.getElementById("copymode")

	//checkpoint#5 : previously marked row to move
	if (movemode)
	{
		movetoQbook(movemode, pointDate)
		stopeditmode()
		return
	}

	//checkpoint#6 : previously marked row to copy
	if (copymode)
	{
		if ((copymode.cells[OPDATE].innerHTML != pointDate))
		{	//to copy must click not the same day
			copycase(pointDate.numDate())
		}
		stopeditmode()
		return
	}

	//checkpoint#7 : click on blank row
	if (qn < "0")
	{
		if (cindex != OPDATE && cindex != HN)
		{	//allow : fillSetTable, HNinput, fillConsult, fillAbsent
			stopeditmode()
			window.focus()
			return
		}
	}
*/
	savepreviouscell()
	var pointing = whichElement(event)
	pointing.id = "editcell"
	contentAt(pointing)
}

function savepreviouscell() 
{
	var editcell

	if (!(editcell = document.getElementById("editcell")))
		return
	var content = editcell.innerHTML
	var edcindex = $(editcell).closest("td").index()

	switch(edcindex)
	{
		case OPDATE:
			break
		case OPROOM:
			saveContent("oproom", content)
			break
		case OPTIME:
			saveContent("optime", content)
			break
		case STAFFNAME:
			saveContent("staffname", content)
			break
		case HN:
			saveHNinput("hn", content)
			break
		case NAME:
			break
		case AGE:
			break
		case DIAGNOSIS:
			saveContent("diagnosis", content)
			break
		case TREATMENT:
			saveContent("treatment", content)
			break
		case TEL:
			saveContent("tel", content)
			break
	}
	editcell.id = ""
//	hidepopup()
//	stopeditmode()
}
/*
	switch(cindex)
	{
		case OPDATE:
			fillSetTable(rindex, pointing)
			popup (pointing);
			break
		case OPROOM:
			contentAdd(pointing)
			break
		case OPTIME:
			contentAdd(pointing)
			break
		case STAFFNAME:
			contentAdd(pointing)
			popup (pointing);
			break
		case HN:
			HNinput(pointing)
			break
		case NAME:
			stopeditmode()
			break
		case AGE:
			stopeditmode()
			break
		case DIAGNOSIS:
			contentAdd(pointing, qn, QBOOKFILL)
			break
		case TREATMENT:
			contentAdd(pointing, qn, QBOOKFILL)
			break
		case TEL:
			contentAdd(pointing, qn)
			break
	}
}
*/
function contentAt(pointing) 
{  
	var contentval = pointing.innerHTML

	var getContent = function()
	{
		return contentval
	}
}

function saveContent(column, content)
{
	var rowtr = $("#editcell").closest("tr").children("td")
	var opdate = $(rowtr).eq(OPDATE).html().numDate()
	var qn = $(rowtr).eq(QN).html()

	$("#tbl").css("cursor", "'wait'")
	content = content.replace(/<br>/g,"")

	var sqlstring = "sqlReturnQbook=UPDATE qbook SET "
	sqlstring += column +" = '"+ content
	sqlstring += "', editor='"+ THISUSER
	sqlstring += "' WHERE qn = "+ qn +";"

	Ajax(MYSQLIPHP, sqlstring, callbacksaveContent);

	function callbacksaveContent(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n Restore previous value\n\n" + response)
			$("#editcell").html(getContent())
		}
		else
		{
			updateQBOOK(response);
			updateQBOOKFILL()
			if ($(rowtr).eq(OPROOM).html() && $(rowtr).eq(OPTIME).html())
			{	//to rearrange rows
				fillselect(opdate)
			}
		}
		stopeditmode()
		hidepopup()
		document.getElementById("tbl").style.cursor = ''
	}
}

function fillSetTable(rownum, pointing)
{
	var table = document.getElementById("tbl")
	var tcell = table.rows[rownum].cells
	var opdateth = tcell[OPDATE].innerHTML	//Thai date
	var opdate = opdateth.numDate()			//Thai to mysql date
	var staffname = tcell[STAFFNAME].innerHTML
	var casename = tcell[NAME].innerHTML
	var queue = tcell[QN].innerHTML
	var opday = table.rows[rownum].className
	var Set = new Array()
	var each
	var txt, tex
	var menu = document.getElementById("menudiv")
	var i = 0

	pointing.id = "editmode"
	while (NAMEOFDAYFULL[i] != opday)
		i++
	opday = NAMEOFDAYTHAI[i]

	casename = casename.substring(0, casename.indexOf(' '))
	Set[0] = queue? "เพิ่ม case ผ่าตัด " + opdateth : ""
	Set[1] = queue? "ลบ case ผ่าตัด " + casename : ""
	Set[2] = check(opdate, queue)? "ลบช่องว่าง" : ""
	Set[3] = ""		//queue? "Move case " + casename +" ไปวันอื่น" : ""
	Set[4] = ""		//queue? "Move case " + casename +" ไป Waiting List" : ""
	Set[5] = ""		//queue? "Copy case " + casename : ""
	Set[6] = (STATE[0] != "FILLUP")? "คิวทั้งหมด" : ""
	Set[7] = (STATE[0] != "FILLDAY")? "คิวผ่าตัด วัน" + opday : ""
	Set[8] = (STATE[0] != "FILLSTAFF")? (staffname? "คิวผ่าตัด " + staffname : "") : ""
	Set[9] = ""		//"หาคำ"
	Set[10] = ""	//queue? "เครื่องมือผ่าตัด/set OR" : ""
	Set[11] = queue? "PACS" : "" 
	Set[12] = ""	//queue? "LABs" : ""
	Set[13] = ""	//"จัดการข้อมูล"
	Set[14] = ""	//"ปฏิทิน consult"
	Set[15] = queue? "ประวัติการแก้ไข " + casename : ""
	Set[16] = "Waiting List"
	menu.innerHTML = ''
	for (each=0; each<Set.length; each++)
	{
		tex = "javascript:FirstColumn('"+ each +"','"+ rownum +"')"
		txt = '<a href="'+ tex +'">'+ Set[each] +'</a>'
		menu.innerHTML += txt
	}

	function check(opdate, queue)
	{	//Any case in this date? 
		var q = 0

		if (QBOOKFILL[0] == undefined)
			return false
		if (queue)
			return false
		while (opdate > QBOOKFILL[q].opdate)
		{
			q++
			if (q >= QBOOKFILL.length)
				return false
		}
		if (opdate == QBOOKFILL[q].opdate)
			return true
		else
			return false
	}
}

function fillTimeTable(pointing)
{
	pointing.id = "editmode"
	var inputval = createinput(pointing)
	inputval.focus()
	inputval.onkeyup = function (e) {
		if (getkeycode(e) == 13) {
			selecting ("optime")
		}
	}
}

function fillStaffTable(pointing)
{
	var each
	var txt, tex

	pointing.id = "editmode"
	txt = "javascript:selecting('staffname', '')"
	$("#menudiv").html('<a href="'+ txt +'">\---</a>')
	for (each=0; each<ALLLISTS.staff.length; each++)
	{
		tex = "javascript:selecting('staffname','"+ ALLLISTS.staff[each][1] +"')"
		txt = '<a href="'+ tex +'">'+ ALLLISTS.staff[each][1] +'</a>'
		$(txt).appendTo("#menudiv")
	}

	var inputval = createinput(pointing)
	inputval.focus()
	inputval.onkeyup = function (e) {
		if (getkeycode(e) == 13) {
			selecting ("staffname")
		}
	}
}

function selecting (oproomtimestaff, selectstaff)
{	//ห้อง, เวลา, staffname
	var rowtr = $("#editmode").closest("tr").children("td")
	var opdate = $(rowtr).eq(OPDATE).html().numDate()
	var qn = $(rowtr).eq(QN).html()

	$("#menudiv").css("display", "''")		//z-index may mask 'wait' cursor
	$("#tbl").css("cursor", "'wait'")
	var inputval = $('#keyin').val();
	$("#keyin").remove();
	var previousselect = $("#editmode").html()
	if (selectstaff != undefined)
		inputval = selectstaff

	var sqlstring = "sqlReturnQbook=UPDATE qbook SET "
	sqlstring += oproomtimestaff +" = '"+ inputval
	sqlstring += "', editor='"+ THISUSER
	sqlstring += "' WHERE qn = "+ qn +";"

	Ajax(MYSQLIPHP, sqlstring, callbackselect);

	function callbackselect(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n Restore previous value\n\n" + response)
			$("#editmode").html(previousselect)
		}
		else
		{
			updateQBOOK(response);
			updateQBOOKFILL()
			if ($(rowtr).eq(OPROOM).html() && $(rowtr).eq(OPTIME).html())
			{
				fillselect(opdate)
			}
		}
		stopeditmode()
		hidepopup()
		document.getElementById("tbl").style.cursor = ''
	}
}

function HNinput(pointing)
{
	var pointHNname

	if ((pointing.innerHTML == "") && (pointing.id != "editmode"))
	{
		pointing.id = "editmode"
		pointHNname = createinput(pointing)
		pointHNname.onkeyup = getByHN
		pointHNname.focus()
	}
}

function getByHN(e)
{
	var keycode = getkeycode(e)
	var namehn = document.getElementById("keyin")
	var opdate = $("#editmode").parents('tr').children("td" ).eq(OPDATE).html().numDate()
	
	namehn.value = namehn.value.replace(/<br>/g, "")
	namehn.value = namehn.value.replace(/^\s+/g, "")
	namehn.value = namehn.value.replace(/  +/g, " ")
	if (keycode == 13)
	{
		var sqlstring = "hn=" + namehn.value
		sqlstring += "&opdate="+ opdate
		sqlstring += "&username="+ THISUSER

		Ajax(GETNAMEHN, sqlstring, callbackgetByHN)
	}

	function callbackgetByHN(response)
	{
		if (!response || response.indexOf("initial_name") == -1)	//no patient
			alert("Error getnamehn : "+ response)
		else if (response.indexOf("DBfailed") != -1)
			alert("Failed! qbook($mysqli)" + response)
		else if (response.indexOf("{") != -1)
		{	//Only one patient
			var qname = JSON.parse(response)	//convert JSON string into JSON object
			var name = qname.initial_name + qname.first_name +" "+ qname.last_name
			var cells = $("#editmode").parents('tr').children("td" )
			var opdate = $(cells).eq(OPDATE).html().numDate()	//convert Thai date to MySQL date
			var age = qname.dob.replace(/-/g,"/").getAge(opdate.replace(/-/g,"/"))
			$(cells).eq(QN).html(qname.qn);
			$(cells).eq(HN).html(qname.hn);
			$(cells).eq(NAME).html(name);
			$(cells).eq(AGE).html(age);
			var menu = document.getElementById("menudiv")
			menu.style.display = ""
			menu.style.height = ""
			menu.style.overflow = ""
			stopeditmode()
			updateQBOOK(response)
			updateQBOOKFILL()
		}
	}
}

function createinput(pointing)
{
	var text_obj = document.createElement('INPUT');
	text_obj.id = 'keyin';
	text_obj.style.zIndex = "2"
	text_obj.style.width = (pointing.offsetWidth * 8 / 10) + 'px';
	text_obj.style.height = (pointing.offsetHeight * 5 / 10) + 'px';
	text_obj.style.border = '0px';
	text_obj.wrap = 'soft';
	text_obj.style.overflow = 'hidden';
	text_obj.value = pointing.innerHTML;
	pointing.appendChild(text_obj);
 	return text_obj;
}

function phone(pointing, qn)
{
	var textbox = document.getElementById("teldiv")
	var txtarea = document.getElementById("txtarea")
	var oldtxt = pointing.innerHTML

	pointing.id = "editmode"
	textbox.style.display = "block"
	var xpos = pointing.offsetLeft - textbox.offsetWidth - Xscrolled()
	var ypos = pointing.offsetTop - Yscrolled()
	if (ypos > $(window).height() - textbox.offsetHeight)
		ypos = $(window).height() - textbox.offsetHeight
	if (xpos < 0)
		xpos = 0
	if (ypos < 0)
			ypos = 0
	textbox.style.top = ypos + 'px'
	textbox.style.left = xpos + 'px'
	txtarea.onkeyup = savetelnum
	txtarea.focus()
	txtarea.value = pointing.innerHTML

	function savetelnum(e)
	{
		keycode = getkeycode(e)
		if (keycode == 13)
		{
			e = e || window.event
			txtarea.value = txtarea.value.replace("\n", "")
			savetel(false)
			stopeditmode()
			textbox.style.display = ""
		}
	}

	savetel = function (affirm)
	{
		if (txtarea.value == pointing.innerHTML)
			return
		if (affirm)
			if (!confirm("Save the change?"))
				return
		var txt = txtarea.value
		txt = txt.replace(/,(?! )/g, ", ")
		pointing.innerHTML = txt
		txt = txt.replace(/\"/g, "&#34;")	// w3 org recommend use numeric character references to represent 
		txt = txt.replace(/\'/g, "&#39;")	// double quotes (&#34;) or (&quot); and single quotes (&#39;)
		txt = txt.replace(/\\/g, "\\\\")
		txt = encodeURIComponent(txt)	//encode '&' keyed in
		var sqlstring = "sqlReturnQbook=UPDATE qbook SET tel='"+ txt
		sqlstring += "', editor = '"+ THISUSER
		sqlstring += "' WHERE qn = " + qn +";"

		Ajax(MYSQLIPHP, sqlstring, callbacktel)
	}

	callbacktel = function (response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("DBfailed! update database \n\nRestore previous value \n\n" + response)
			pointing.innerHTML = oldtxt
		}
		else
		{
			updateQBOOK(response);
			updateQBOOKFILL()
		}
	}
}
