function clicktable(clickedCell)
{
	savePreviouscell()
	storePresentcell(clickedCell)
}

function keyin(event)
{
	var keycode = event.which || window.event.keyCode
	var pointing = getEditTD()
	var thiscell

	if (!pointing) {
		return
	}
		
	if (keycode == 9)
	{
		$('#menu').hide();
		$('#stafflist').hide();
		savePreviouscell()
		if (event.shiftKey) {
			thiscell = findPrevcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
				thiscell = findPrevcell(event, EDITABLE, $(thiscell))
			}
		} else {
			thiscell = findNextcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
				thiscell = findNextcell(event, EDITABLE, $(thiscell))
			}
		}
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			clearEditcellData("hide")
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 13)
	{
		$('#menu').hide();
		$('#stafflist').hide();
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscell()
		thiscell = findNextRow(event, EDITABLE, pointing)
		if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
			thiscell = findNextcell(event, EDITABLE, $(thiscell))
		}
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			clearEditcellData("hide")
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 27)
	{
		$('#menu').hide();
		$('#stafflist').hide();
		clearEditcellData("hide")
		window.focus()
		event.preventDefault()
		return false
	}
}

function savePreviouscell() 
{
	if (!getEditTD())
		return

	var content = ""
	switch($("#editcell").data("cellIndex"))
	{
		case OPDATE:
			break
		case STAFFNAME:
			content = getData()
			saveContent("staffname", content)	//column name in MYSQL
			break
		case HN:
			content = getData()
			saveHNinput("hn", content)
			break
		case NAME:
		case AGE:
			break
		case DIAGNOSIS:
			content = getData()
			saveContent("diagnosis", content)
			break
		case TREATMENT:
			content = getData()
			saveContent("treatment", content)
			break
		case CONTACT:
			content = getData()
			saveContent("contact", content)
			break
	}
}
 
function getData()
{
	var trimHTML = /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
	var HTMLnotBR =/(<((?!br)[^>]+)>)/ig
	var content = ""

	return $("#editcell").html().replace(trimHTML, '').replace(HTMLnotBR, '')
}

function saveContent(column, content)	//column name in MYSQL
{
	if (content == $("#editcell").data("content")) {
		return
	}
	var rowcell = $($("#editcell").data("editRow")).children("td")
	var opdate = rowcell.eq(OPDATE).html().numDate()
	var staffname = rowcell.eq(STAFFNAME).html()
	var qn = rowcell.eq(QN).html()
	var sql

	getEditTD().html(content)	//just for show instantly

	if (content) {
		 content = URIcomponent(content)	//take care of white space, double qoute, 
	}										//single qoute, and back slash

	if (qn)
	{
		sql = "sqlReturnbook=UPDATE book SET "
		sql += column +" = '"+ content
		sql += "', editor='"+ THISUSER
		sql += "' WHERE qn = "+ qn +";"
	}
	else
	{
		var since = new Date().mysqlDate()

		sql = "sqlReturnbook=INSERT INTO book ("
		sql += "since, opdate, "+ column +", editor) VALUES ('"
		sql += since +"', '"+ opdate +"', '"+ content +"', '"+ THISUSER +"');"
	}

	Ajax(MYSQLIPHP, sql, callbacksaveContent);

	var tableID = $("#editcell").data("tableID")
	var cellindex = $("#editcell").data("cellIndex")
	var updateCell = $($("#editcell").data("editRow")).children()
	var gotEditTD = getEditTD()
	var oldContent = $("#editcell").data("content")

	function callbacksaveContent(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
			gotEditTD.html(oldContent)
			//return to previous content
		}
		else
		{
			updateBOOK(response);

			if (tableID == 'tbl') {
				if (!qn) {
					var NewRow = findNewRow(opdate)
					updateCell.eq(QN).html(BOOK[NewRow].qn)
				}
				if (($("#titlecontainer").css('display') == 'block') && 
					($('#titlename').html() == staffname)) {

					refillanother('queuetbl', cellindex, qn)
				}
			} else {
				refillanother('tbl', cellindex, qn)
			}
		}
	}
}

function saveHNinput(hn, content)
{
	var rowcell = $($("#editcell").data("editRow")).children("td")
	var opdate = rowcell.eq(OPDATE).html().numDate()
	var staffname = rowcell.eq(STAFFNAME).html()
	var patient = rowcell.eq(NAME).html()
	var qn = rowcell.eq(QN).html()
	var since

	getEditTD().html(content)

	content = content.replace(/<br>/g, "")
	content = content.replace(/^\s+/g, "")

	if (content.length != 7)
		return
	if (!qn)
		since = new Date().mysqlDate()

	var sql = "hn=" + content
	sql += "&since="+ since
	sql += "&opdate="+ opdate
	sql += "&qn="+ qn
	sql += "&username="+ THISUSER

	Ajax(GETNAMEHN, sql, callbackgetByHN)

	var tableID = $("#editcell").data("tableID")
	var cellindex = $("#editcell").data("cellIndex")
	var updateCell = $($("#editcell").data("editRow")).children()
	var gotEditTD = getEditTD()
	var oldContent = $("#editcell").data("content")

	function callbackgetByHN(response)
	{
		if ((!response) || (response.indexOf("patient") == -1) || (response.indexOf("{") == -1)) 
		{
			alert(response)
			gotEditTD.html(oldContent)
			//return to previous content
		}
		else 
		{
			updateBOOK(response)
			if (!qn) {	//No HN input in staffqueue table
				var NewRow = findNewRow(opdate)
				var bookq = BOOK[NewRow]
				updateCell.eq(NAME).html(bookq.patient)
				updateCell.eq(AGE).html(bookq.dob? bookq.dob.getAge(bookq.opdate) : "")
				updateCell.eq(QN).html(bookq.qn)
			}
			if (($("#titlecontainer").css('display') == 'block') && 
				($('#titlename').html() == staffname)) {

				refillanother('queuetbl', cellindex, qn)
			}
		}
	}
}

function findNewRow(opdate)	//find new row (max. qn)
{
	var q = 0
	while (BOOK[q].opdate != opdate)
	{
		q++
		if (q >= BOOK.length)
			return ""
	}

	var qn = Number(BOOK[q].qn)
	var newq = q
	q++
	while (q < BOOK.length && BOOK[q].opdate == opdate) {
		if (Number(BOOK[q].qn) > qn) {
			qn = Number(BOOK[q].qn)
			newq = q
		}
		q++
	}
	return newq
}

function storePresentcell(pointing)
{
	var rindex = $(pointing).closest("tr").index()
	var cindex = $(pointing).closest("td").index()

	createEditcell(pointing)

	switch(cindex)
	{
		case OPDATE:
			clearEditcellData()
			var content = window.getComputedStyle(pointing,':before').content
			content = content.replace(/\"/g, "")
			$("#editcell").html(content + pointing.innerHTML)
			fillSetTable(rindex, pointing)
			break
		case STAFFNAME:
			saveDataPoint("#editcell", pointing)
			stafflist(pointing)
			break
		case HN:
			if (!pointing.innerHTML) {
				saveDataPoint("#editcell", pointing)
				break
			}
		case NAME:
		case AGE:
			clearEditcellData("hide")
			break
		case DIAGNOSIS:
		case TREATMENT:
		case CONTACT:		//store content in "data" of editcell
			saveDataPoint("#editcell", pointing)
			break
	}
}

function createEditcell(pointing)
{
	$("#editcell").css({
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		fontSize: $(pointing).css("fontSize")
	})

	$("#editcell").appendTo($(pointing).closest('div'))
	reposition("#editcell", "center", "center", pointing)
	$("#editcell").focus()
}

function reposition(me, mypos, atpos, target)
{
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
}

function saveDataPoint(editcell, pointing)
{
	var tableID = $(pointing).closest('table').attr('id')
	var rowIndex = $(pointing).closest('tr').index()
	var cellIndex = $(pointing).index()

	$(editcell).data("editRow", "#"+ tableID +" tr:eq("+ rowIndex +")")
	$(editcell).data("tableID", tableID)
	$(editcell).data("rowIndex", rowIndex)
	$(editcell).data("cellIndex", cellIndex)
	$(editcell).data("content", pointing.innerHTML)
	$(editcell).html(pointing.innerHTML)
}

function getEditTD()
{
	var editcell = "#editcell"
	var tableID = $(editcell).data("tableID")
	var rowIndex = $(editcell).data("rowIndex")
	var cellIndex = $(editcell).data("cellIndex")

	if (rowIndex) {
		return $("#" + tableID + " tr:eq(" + rowIndex + ") td:eq(" + cellIndex + ")")	
	} else {
		return false
	}
}

function clearEditcellData(display)
{
	var editcell = "#editcell"
	$(editcell).data("editCell", "")
	$(editcell).data("editRow", "")
	$(editcell).data("tableID", "")
	$(editcell).data("rowIndex", "")
	$(editcell).data("cellIndex", "")
	$(editcell).data("content", "")
	$(editcell).html("")
	if (display == "hide") {
		$(editcell).hide()
	}
}

function findPrevcell(event, editable, pointing) 
{
	var prevcell = pointing
	var column = prevcell.index()

	if ((column = editable[($.inArray(column, editable) - 1)]))
	{
		prevcell = prevcell.parent().children().eq(column)
	}
	else
	{
		do {
			if (prevcell.parent().index() > 1)
			{	//go to prev row last editable
				prevcell = prevcell.parent().prev("tr").children().eq(editable[editable.length-1])
			}
			else
			{	//#tbl tr:1 td:1
				event.preventDefault()
				return false
			}
		}
		while ((prevcell.get(0).nodeName == "TH")	//THEAD row
			|| (!prevcell.is(':visible')))			//invisible due to colspan
	}

	return prevcell.get(0)
}

function findNextcell(event, editable, pointing) 
{
	var nextcell = pointing
	var column = nextcell.index()

	if ((column = editable[($.inArray(column, editable) + 1)]))
	{
		nextcell = nextcell.parent().children().eq(column)
	}
	else
	{
		do {//go to next row first editable
			nextcell = $(nextcell).parent().next("tr").children().eq(editable[0])
			if (!(nextcell.length)) {
				event.preventDefault()
				return false
			}
		}
		while ((!nextcell.is(':visible'))	//invisible due to colspan
			|| (nextcell.get(0).nodeName == "TH"))	//TH row
	}

	return nextcell.get(0)
}

function findNextRow(event, editable, pointing) 
{
	var nextcell = pointing

	//go to next row first editable
	do {
		nextcell = $(nextcell).parent().next("tr").children().eq(editable[0])
		if (!(nextcell.length)) {
			event.preventDefault()
			return false	
		}
	}
	while ((!nextcell.is(':visible'))	//invisible due to colspan
		|| (nextcell.get(0).nodeName == "TH"))	//TH row

	return nextcell.get(0)
}
