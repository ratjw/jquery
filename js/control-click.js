function clicktable(clickedCell)
{
	//checkpoint#1 : click in editing div
	if (clickedCell.id == "editcell") {
		return
	} else {
		if (clickedCell.nodeName != "TD") {
			$("#tbl").siblings().hide()
			return
		}
	}

	savePreviouscell()
	storePresentcell(clickedCell)
}

function editing(event)
{
	var keycode = event.which || window.event.keyCode
	var thiscell

	if ($("#editcell").data("located").closest("table").attr("id") != "tbl")
		return

	if (keycode == 9)
	{
		savePreviouscell()
		if (event.shiftKey)
			thiscell = findPrevcell(event)
		else
			thiscell = findNextcell(event)
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			$("#tbl").siblings().hide()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 13)
	{
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscell()
		thiscell = findNextcell(event)
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			$("#tbl").siblings().hide()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 27)
	{
		if ($("#editcell").data("located").index() == OPDATE)
		{
			$("#tbl").siblings().hide()
		}
		else
		{
			$("#editcell").data("located").html($("#editcell").data("content"))
		}
		$("#editcell").hide()
		window.focus()
		event.preventDefault()
		return false
	}
}

function savePreviouscell() 
{
	if (!$("#editcell").data("located"))
		return

	var content = $("#editcell").html()
	if ($("#editcell").data("located").index() == HN)
		content = content.replace(/<br>/g, "")
	if (content == $("#editcell").data("content"))
		return

	$("#editcell").data("located").html(content)
	var editcindex = $("#editcell").data("located").index()

	switch(editcindex)
	{
		case OPDATE:
			break
		case STAFFNAME:
			saveContent("staffname", content)	//column name in MYSQL
			break
		case HN:
			saveHNinput("hn", content)
			break
		case NAME:
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

function saveContent(column, content)	//column name in MYSQL
{
	var rowcell = $("#editcell").data("located").closest("tr").children("td")
	var opdate = rowcell.eq(OPDATE).html().numDate()
	var qn = rowcell.eq(QN).html()
	var sqlstring

	$("#tbl").css("cursor", "wait")
	content = URIcomponent(content)			//take care of white space, double qoute, 
											//single qoute, and back slash
	if (qn)
	{
		sqlstring = "sqlReturnbook=UPDATE book SET "
		sqlstring += column +" = '"+ content
		sqlstring += "', editor='"+ THISUSER
		sqlstring += "' WHERE qn = "+ qn +";"
	}
	else
	{
		sqlstring = "sqlReturnbook=INSERT INTO book ("
		sqlstring += "waitnum, qsince, opdate, "+ column +", editor) VALUES ("
		sqlstring += "0, '"+ opdate +"', '"+ opdate +"', '"+ content +"', '"+ THISUSER +"');"
	}

	Ajax(MYSQLIPHP, sqlstring, callbacksaveContent);

	function callbacksaveContent(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
			$("#editcell").data("located").html($("#editcell").data("content"))
		}
		else
		{
			updateBOOK(response);
			fillselect("tbl", opdate)
			$("#editcell").data("content", "")
		}
		$("#tbl").css("cursor", "")
	}
}

function saveHNinput(hn, content)
{
	var rowtr = $("#editcell").data("located").parent().children("td")
	var opdate = rowtr.eq(OPDATE).html().numDate()
	var patient = rowtr.eq(NAME).html()
	var qn = rowtr.eq(QN).html()

	if (patient)
	{
		$("#editcell").html($("#editcell").data("content"))
		return
	}
	content = content.replace(/<br>/g, "")
	content = content.replace(/^\s+/g, "")

	var sqlstring = "hn=" + content
	sqlstring += "&waitnum=0"
	sqlstring += "&qsince="+ opdate
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
			fillselect("tbl", opdate)
		}
	}
}

function storePresentcell(pointing)
{  
	var cindex = $(pointing).closest("td").index()
	var rowtr = $(pointing).closest("tr")
	var rindex = $(rowtr).index()
	var qn = $(rowtr).children("td").eq(QN).html()

	$("#tbl").siblings().hide()
	editcell(pointing, "#tbl")

	switch(cindex)
	{
		case OPDATE:
			fillSetTable(rindex, pointing)
			break
		case STAFFNAME:
			stafflist(pointing)
			break
		case NAME:
		case AGE:
			$("#editcell").hide() //disable self (uneditable cell)
			break
		case HN:
		case DIAGNOSIS:
		case TREATMENT:
		case TEL:		//store content in "data" of editcell
			$("#editcell").data("content", $(pointing).html())
			break
	}
}

function editcell(pointing, id)
{
	var pos = $(pointing).position()

	$(id).append($("#editcell"))
	$("#editcell").html($(pointing).html())
	$("#editcell").data("located", $(pointing))
	$("#editcell").css({
		top: pos.top + "px",
		left: pos.left + "px",
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		display: "block"
	})
	$("#editcell").focus()
}

function findPrevcell(event) 
{
	var prevcell = $("#editcell").data("located")
	var column = prevcell.index()

	if (column = EDITABLE[($.inArray(column, EDITABLE) - 1)])
	{
		prevcell = $(prevcell).parent().children().eq(column)
	}
	else
	{
		if ($(prevcell).parent().index() > 1)
		{	//go to prev row last editable
			do {
				prevcell = $(prevcell).parent().prev("tr").children().eq(EDITABLE[EDITABLE.length-1])
			}
			while ($(prevcell).get(0).nodeName == "TH")	//THEAD row
		}
		else
		{	//#tbl tr:1 td:1
			event.preventDefault()
			return false
		}
	}

	return $(prevcell).get(0)
}

function findNextcell(event) 
{
	var nextcell = $("#editcell").data("located")
	var column = nextcell.index()
	var lastrow = $('#tbl tr:last-child').index()

	if (column = EDITABLE[($.inArray(column, EDITABLE) + 1)])
	{
		nextcell = $(nextcell).parent().children().eq(column)
	}
	else
	{
		if ($(nextcell).parent().index() < lastrow)
		{	//go to next row first editable
			do {
				nextcell = $(nextcell).parent().next("tr").children().eq(EDITABLE[0])
			}
			while ($(nextcell).get(0).nodeName == "TH")	//THEAD row
		}
		else
		{	//#tbl tr:last-child td:last-child
			event.preventDefault()
			return false
		}
	}

	return $(nextcell).get(0)
}
