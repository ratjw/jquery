function clicktable(e)
{
	mousedownCell = window.event.srcElement || e.target;
	if (mousedownCell.id == "editcell")
		return false

	if (mousedownCell.nodeName != "TD")
	{
		stopEditmode()
		hidePopup()
		return
	}

	savePreviouscell()
	storePresentcell(mousedownCell)
	mousedownCell.focus()
}

function editing(e)
{
	var keycode = window.event.keyCode || e.which;

	if (keycode == 9)
	{
		savePreviouscell()
		if (e.shiftKey)
			thiscell = findPrevcell($(editcell).get(0))
		else
			thiscell = findNextcell($(editcell).get(0))
		storePresentcell(thiscell)
	}
	else if (keycode == 13)
	{
		if (e.shiftKey || e.ctrlkey)
			return 
		event.preventDefault()
		savePreviouscell()
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
			$("#editcell").html($("#editcell").attr("title"))
		}
	}
}

function savePreviouscell() 
{
	var editcell
	if (!(editcell = document.getElementById("editcell")))
		return

	var content = editcell.innerHTML
	if (content == $("#editcell").attr("title"))
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
		case TEL:			//store value in attribute "title"
			pointing.id = "editcell"
			$("#editcell").attr("title", pointing.innerHTML)
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

	while (opday.indexOf(NAMEOFDAYFULL[i]) == -1)
		i++
	opday = NAMEOFDAYTHAI[i]

	casename = casename.substring(0, casename.indexOf(' '))
	Set[0] = queue? "เพิ่ม case วันที่ " + opdateth : ""
	Set[1] = queue? "ลบ case ผ่าตัด " + casename : ""
	Set[2] = check(opdate, queue)? "Delete Blank Row" : ""
	Set[3] = (STATE[0] != "FILLUP")? "คิวทั้งหมด" : ""
	Set[4] = (STATE[0] != "FILLDAY")? "คิวผ่าตัด วัน" + opday : ""
	Set[5] = (STATE[0] != "FILLSTAFF")? (staffname? "คิวผ่าตัด " + staffname : "") : ""
	Set[6] = ""		//"หาคำ"
	Set[7] = ""	//queue? "เครื่องมือผ่าตัด/set OR" : ""
	Set[8] = ""	//queue? "PACS" : "" 
	Set[9] = ""	//queue? "LABs" : ""
	Set[10] = ""	//queue? "ประวัติการแก้ไข " + casename : ""
	Set[11] = ""	//"Waiting List"

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
		$(editcell).html($("#editcell").attr("title"))
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

function findPrevcell(editcell) 
{
	var prevcell = $(editcell)

	do {
		if (prevcell.index() > 1)
		{
			prevcell = $(prevcell).prev()
		}
		else
		{
			if (prevcell.parent().index() > 1)
			{	//go to prev row second-to last cell
				do {
					prevcell = $(prevcell).parent().prev("tr").children().eq(TEL)
				}
				while ($(prevcell).get(0).nodeName == "TH")	//THEAD row
			}
			else
			{	//#tbl tr:1 td:1
				event.preventDefault()
				return false
			}
		}
	} while (!prevcell.get(0).isContentEditable)

	return $(prevcell).get(0)
}

function findNextcell(editcell) 
{
	var nextcell = $(editcell)
	var lastrow = $('#tbl tr:last-child').index()
	
	do {
		if (nextcell.index() < TEL)
		{
			nextcell = $(nextcell).next()
		}
		else
		{
			if (nextcell.parent().index() < lastrow)
			{	//go to next row second cell
				do {
					nextcell = $(nextcell).parent().next("tr").children().eq(OPROOM)
				}
				while ($(nextcell).get(0).nodeName == "TH")	//THEAD row
			}
			else
			{	//#tbl tr:last-child td:last-child
				event.preventDefault()
				return false
			}
		}
	} while (!nextcell.get(0).isContentEditable)

	return $(nextcell).get(0)
}

function saveContent(column, content)
{
	var rowtr = $("#editcell").closest("tr").children("td")
	var opdate = $(rowtr).eq(OPDATE).html().numDate()
	var qn = $(rowtr).eq(QN).html()

	$("#tbl").css("cursor", "wait")
	content = URIcomponent(content)			//take care of white space, double qoute, 
											//single qoute, and back slash
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
			alert("Failed! update database \n\n" + response)
			$("#editcell").attr("title")
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
