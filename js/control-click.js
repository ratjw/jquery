function clicktable(event)
{
	MOUSEDOWNCELL = whichElement(event)
	if (MOUSEDOWNCELL.id == "editcell")
		return

	if (MOUSEDOWNCELL.nodeName != "TD")
	{
		stopEditmode()
		hidePopup()
		return
	}

	savePreviouscell()
	storePresentcell(MOUSEDOWNCELL)
}

function editing(e)
{
	var keycode = getkeycode(e)
	if (keycode == 9)
	{
		savePreviouscell()
		nextcell = findNextcell(document.getElementById("editcell"))
		storePresentcell(nextcell)
	}
	else if (keycode == 27)
	{
		if ($("#editcell").index() == OPDATE)
		{
			stopEditmode()
			hidePopup()
		}
		else
		{
			$("#editcell").html(PREVIOUSCELLCONTENT)
		}
	}
}

function findNextcell(editcell) 
{
	var nextcell = $(editcell).next()	//always has QN cell as the last one
	while (!nextcell.get(0).isContentEditable)
	{
		var previous = nextcell
		nextcell = $(nextcell).next()
		if (!$(nextcell).get(0))
		{
			nextcell = $(previous).parent().next().find('td').eq(1)
		}
	}		
	return $(nextcell).get(0)
}

function savePreviouscell() 
{
	var editcell
	if (!(editcell = document.getElementById("editcell")))
		return

	var content = editcell.innerHTML
	if (content == PREVIOUSCELLCONTENT)
		return

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
			saveHNinput(editcell, content)
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
}

function saveContent(column, content)
{
	var rowtr = $("#editcell").closest("tr").children("td")
	var opdate = $(rowtr).eq(OPDATE).html().numDate()
	var qn = $(rowtr).eq(QN).html()

	$("#tbl").css("cursor", "wait")
	content = content.replace(/<br>/g,"")

	if (qn)
	{
		var sqlstring = "sqlReturnbook=UPDATE book SET "
		sqlstring += column +" = '"+ content
		sqlstring += "', editor='"+ THISUSER
		sqlstring += "' WHERE qn = "+ qn +";"
	}
	else
	{
		var sqlstring = "sqlReturnbook=INSERT INTO book ("
		sqlstring += "opdate, "+ column +", editor) VALUES ('"
		sqlstring += opdate +"', '"+ content +"', '"+ THISUSER +"');"
	}

	Ajax(MYSQLIPHP, sqlstring, callbacksaveContent);

	function callbacksaveContent(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n Restore previous value\n\n" + response)
			$("#editcell").html(PREVIOUSCELLCONTENT)
		}
		else
		{
			updateBOOK(response);
			updateBOOKFILL()
			fillselect(opdate)
		}
		$("#tbl").css("cursor", "")
	}
}

function storePresentcell(pointing)
{  
	var cindex = $(pointing).closest("td").index()
	var rowtr = $(pointing).closest("tr")
	var rindex = $(rowtr).index()
	var qn = $(rowtr).children("td").eq(QN).html()

	stopEditmode()

	switch(cindex)
	{
		case OPDATE:
			fillSetTable(rindex, pointing)
			pointing.id = "editcell"
			popup (pointing);
			if ($("#alert").css("display") == "block")
				$("#alert").fadeOut();
			break
		case OPROOM:
		case OPTIME:
		case STAFFNAME:
		case HN:
		case DIAGNOSIS:
		case TREATMENT:
		case TEL:
			PREVIOUSCELLCONTENT = pointing.innerHTML
			pointing.id = "editcell"
		case NAME:
		case AGE:
			hidePopup()
			break
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

	while (NAMEOFDAYFULL[i] != opday)
		i++
	opday = NAMEOFDAYTHAI[i]

	casename = casename.substring(0, casename.indexOf(' '))
	Set[0] = ""		//queue? "เพิ่ม case ผ่าตัด " + opdateth : ""
	Set[1] = queue? "ลบ case ผ่าตัด " + casename : ""
	Set[2] = check(opdate, queue)? "Delete Blank Row" : ""
	Set[3] = ""		//queue? "Move case " + casename +" ไปวันอื่น" : ""
	Set[4] = ""		//queue? "Move case " + casename +" ไป Waiting List" : ""
	Set[5] = ""		//queue? "Copy case " + casename : ""
	Set[6] = (STATE[0] != "FILLUP")? "คิวทั้งหมด" : ""
	Set[7] = (STATE[0] != "FILLDAY")? "คิวผ่าตัด วัน" + opday : ""
	Set[8] = (STATE[0] != "FILLSTAFF")? (staffname? "คิวผ่าตัด " + staffname : "") : ""
	Set[9] = ""		//"หาคำ"
	Set[10] = ""	//queue? "เครื่องมือผ่าตัด/set OR" : ""
	Set[11] = ""	//queue? "PACS" : "" 
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

		if (BOOKFILL[0] == undefined)
			return false
		if (queue)
			return false
		while (opdate > BOOKFILL[q].opdate)
		{
			q++
			if (q >= BOOKFILL.length)
				return false
		}
		if (opdate == BOOKFILL[q].opdate)
			return true
		else
			return false
	}
}

function saveHNinput(editcell, content)
{
	var rowtr = $(editcell).closest("tr").children("td")
	var opdate = rowtr.eq(OPDATE).html().numDate()
	var patient = rowtr.eq(NAME).html()
	var qn = rowtr.eq(QN).html()

	if (patient)
	{
		$(editcell).html(PREVIOUSCELLCONTENT)
		return
	}
	content = content.replace(/<br>/g, "")
	content = URIcomponent(content)

	var sqlstring = "hn=" + content
	sqlstring += "&opdate="+ opdate
	sqlstring += "&qn="+ qn
	sqlstring += "&username="+ THISUSER


	Ajax(GETNAMEHN, sqlstring, callbackgetByHN)

	function callbackgetByHN(response)
	{
		if (!response || response.indexOf("patient") == -1)	//no patient
			alert("Error getnamehn : "+ response)
		else if (response.indexOf("DBfailed") != -1)
			alert("Failed! book($mysqli)" + response)
		else if (response.indexOf("{") != -1)
		{	//Only one patient
			updateBOOK(response)
			updateBOOKFILL()
			fillselect(opdate)
		}
	}
}
