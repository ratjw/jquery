function staffqueue(staffname)
{	//Display all cases of only one staff in dialog box
	var queuetbl = document.getElementById("queuetbl")
	var i, q
	var rowi = {}

	//delete previous queuetbl lest it accumulates
	while (queuetbl.rows[1])
		queuetbl.deleteRow(-1)

	for (i=0,q=0; q < QWAIT.length; q++)
	{
		if (QWAIT[q].staffname == staffname)
		{
			rowi = makenextrowQueue(queuetbl, ++i)
			filldataQueue(QWAIT[q], $(rowi).children("td"))
		}
	}
	if (i==0)	//no patient in waiting list
	{
		rowi = makenextrowQueue(queuetbl, ++i)
		rowi.cells[QSINCE].innerHTML = new Date().MysqlDate().thDate()
	}
	$("#queuetbl").css("display", "block")
	$("#container").html($("#queuetbl"));
	$("#container").dialog({
		dialogClass: "dialog",
		title: staffname,
		height: window.innerHeight * 50 / 100,
		width: window.innerWidth * 70 / 100
	});
	DragDropStaff(event)
}
//$("#container").parent().find('.ui-dialog-titlebar').click(function() {
//    alert("test");
//});
//$("#container").dialog('option', 'title', 'New Title');
function makenextrowQueue(table, i)
{	// i = the row to be made
	var cols = table.rows[0].cells.length
	var rowi
	var j = 0

	rowi = table.insertRow(i)
	table.rows[i].innerHTML = qdatatitle.innerHTML
	rowi.cells[QQN].style.display = "none"
	return rowi
}

function Qclicktable(event)
{
	//checkpoint#1 : click in editing area
	var clickedCell = window.event.srcElement || event.target
//	if (clickedCell.id == "editcell")
//		return

	if (clickedCell.nodeName != "TD")
	{
		if ($("#editcell").get(0))
			$("#editcell").attr("id","")
		return
	}

	savePreviouscellQueue()
	storePresentcellQueue(clickedCell)
	event.preventDefault()
	clickedCell.focus()
}

function editingQueue(event)
{
	var keycode = event.which || window.event.keyCode
	var thatcell = $("#editcell").get(0)
	var thiscell

	if ($("#editcell").closest("table").attr("id") != "queuetbl")
		return

	if (keycode == 9)
	{
		savePreviouscellQueue()
		if (event.shiftKey)
			thiscell = findPrevcellQueue()
		else
			thiscell = findNextcellQueue()
		storePresentcellQueue(thiscell)
		if (thiscell)
			thiscell.focus()
		else
		{
			thatcell.id = "editcell"
			thatcell.focus()
		}
		event.preventDefault()
	}
	else if (keycode == 13)
	{
		if (event.shiftKey || event.ctrlKey)
			return false

		savePreviouscellQueue()
		thiscell = findNextcellQueue()
		storePresentcellQueue(thiscell)
		if (thiscell)
			thiscell.focus()
		else
		{
			thatcell.id = "editcell"
			thatcell.focus()
		}
		event.preventDefault()
	}
	else if (keycode == 27)
	{
		if ($("#editcell").index() == QSINCE)
		{
			$("#editcell").attr("id","")
			$("#container").parent().hide()	//dialog enwraped container
		}
		else
		{
			$("#editcell").html($("#editcell").attr("title"))
		}
		event.preventDefault()
		window.focus()
	}
}

function savePreviouscellQueue() 
{
	if (!$("#editcell").get(0))
		return

	var content = $("#editcell").html()

	if (content == $("#editcell").attr("title"))
		return

	var editcindex = $("#editcell").closest("td").index()

	switch(editcindex)
	{
		case QSINCE:
		case QNAME:
		case QAGE:
			break
		case QHN:
			saveHNinputQueue("hn", content)
			break
		case QDIAGNOSIS:
			saveContentQueue("diagnosis", content)
			break
		case QTREATMENT:
			saveContentQueue("treatment", content)
			break
		case QTEL:
			saveContentQueue("tel", content)
			break
	}
}

function saveContentQueue(column, content)
{
	var rowcell = $("#editcell").closest("tr").children("td")
	var opdate = new Date().MysqlDate()
	var qn = rowcell.eq(QQN).html()
	var staffname = $( "#container" ).dialog( "option", "title" )
	var sqlstring
	var waitnum

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
		waitnum = findMAXwaitnum() + 1

		sqlstring = "sqlReturnbook=INSERT INTO book ("
		sqlstring += "waitnum, opdate, staffname, "+ column +", editor) VALUES ("
		sqlstring += waitnum +", '"+ opdate +"', '"+ staffname +"', '"
		sqlstring += content +"', '"+ THISUSER +"');"
	}

	Ajax(MYSQLIPHP, sqlstring, callbacksaveContentQueue);

	function callbacksaveContentQueue(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
			$("#editcell").attr("title")
		}
		else
		{
			updateBOOK(response);
			fillselectQueue(rowcell, waitnum, qn)
			DragDropStaff(event)
		}
	}
}

function findwaitnum(qn)	
{
	var q = 0
	while ((q < QWAIT.length) && (QWAIT[q].qn != qn))
		q++

	return QWAIT[q].waitnum
}

function findMAXwaitnum()	
{
	if (QWAIT.length == 0)
		return 0
	var waitnum = QWAIT[0].waitnum
	for (var q = 1; q < QWAIT.length; q++)
	{
		waitnum = Math.max(waitnum, QWAIT[q].waitnum)
	}
	return waitnum
}

function fillselectQueue(rowcell, waitnum, qn)	//seek the QWAIT row
{
	var q = 0
	if (waitnum)	//come from old queuetbl row
		while ((q < QWAIT.length) && (QWAIT[q].waitnum != waitnum))
			q++	
	else			//come from new queuetbl row
		while ((q < QWAIT.length) && (QWAIT[q].qn != qn))
			q++	

	filldataQueue(QWAIT[q], rowcell)
}

function filldataQueue(bookq, rowcell)		
{
	rowcell.eq(QSINCE).html(bookq.opdate? bookq.opdate.thDate() : "")
	rowcell.eq(QHN).html(bookq.hn)
	rowcell.eq(QNAME).html(bookq.patient)
	rowcell.eq(QAGE).html(bookq.dob? bookq.dob.getAge(bookq.opdate) : "")
	rowcell.eq(QDIAGNOSIS).html(bookq.diagnosis? bookq.diagnosis : "")
	rowcell.eq(QTREATMENT).html(bookq.treatment? bookq.treatment : "")
	rowcell.eq(QTEL).html(bookq.tel)
	rowcell.eq(QQN).html(bookq.qn)
}

function storePresentcellQueue(pointing)
{  
	var cindex = $(pointing).closest("td").index()
	var rowtr = $(pointing).closest("tr")
	var rindex = $(rowtr).index()
	var qn = $(rowtr).children("td").eq(QQN).html()

	$("#editcell").attr("id","")
	pointing.id = "editcell"

	switch(cindex)
	{
		case QSINCE:
			fillSetTableQueue(pointing, rindex)
			break
		case QNAME:
		case QAGE:
			$("#editcell").attr("id","") //disable any editcell
			break
		case QHN:
		case QDIAGNOSIS:
		case QTREATMENT:
		case QTEL:	//store value in attribute "title" of editcell
			$("#editcell").attr("title", pointing.innerHTML)
			break
	}
}

function fillSetTableQueue(pointing, rindex)
{
	var table = document.getElementById("queuetbl")
	var rowmain = table.rows[rindex]
	var tcell = rowmain.cells
	var casename = tcell[QNAME].innerHTML
	var thisqqn = tcell[QQN].innerHTML
	var disabled = "ui-state-disabled"

	casename = casename.substring(0, casename.indexOf(' '))
	i = table.rows.length
	lastqqn = table.rows[i-1].cells[QQN].innerHTML

	$("#qitem1").html("เพิ่ม case")
	if (lastqqn)
		$("#qitem1").removeClass(disabled)
	else
		$("#qitem1").addClass(disabled)
	$("#qitem2").html("ลบ case " + casename)
	if (thisqqn)
		$("#qitem2").removeClass(disabled)
	else
		$("#qitem2").addClass(disabled)

	$("#queuemenu").menu({
		select: function( event, ui ) {
			var item = this.getAttribute("aria-activedescendant")
			switch(item)
			{
				case "qitem1":
					addnewrowQ()
					break
				case "qitem2":
					deletecaseQ(rowmain, thisqqn)
					break
			}
			$("#editcell").attr("id","")
			$("#queuemenu").hide()
			event.stopPropagation()
//			event.preventDefault()
		}
	});

	$("#queuemenu").insertAfter($("#queuetbl"))
	showupQueue(pointing, '#queuemenu')
}

function addnewrowQ()
{
	var queuetbl = document.getElementById("queuetbl")

	rownum = $("#queuetbl tr").length	//always append to table end
	rowi = makenextrowQueue(queuetbl, rownum)
	rowi.cells[QSINCE].innerHTML = new Date().MysqlDate().thDate()
	$("#editcell").attr("id", "")	//editcell was started by storePresentcellQueue
}

function deletecaseQ(rowmain, qn)
{
	var staffname = $( "#container" ).dialog( "option", "title" )
	var sql = "sqlReturnbook=UPDATE book SET waitnum=0 WHERE qn="+ qn +";"

	Ajax(MYSQLIPHP, sql, qcallbackdeleterow)

	function qcallbackdeleterow(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Delete & Refresh failed!\n" + response)
		else
			updateBOOK(response);
			$(rowmain).remove()
	}
	$("#editcell").attr("id", "")	//editcell was started by storePresentcellQueue
}

function findPrevcellQueue() 
{
	var prevcell = $("#editcell")

	do {
		if ($(prevcell).index() > QHN)
		{
			prevcell = $(prevcell).prev()
		}
		else
		{
			if ($(prevcell).parent().index() > 1)
			{	//go to prev row last editable
				do {
					prevcell = $(prevcell).parent().prev("tr").children().eq(QTEL)
				}
				while ($(prevcell).get(0).nodeName == "TH")	//THEAD row
			}
			else
			{	//#tbl tr:1 td:1
				event.preventDefault()
				return false
			}
		}
	} while (!$(prevcell).get(0).isContentEditable)

	return $(prevcell).get(0)
}

function findNextcellQueue() 
{
	var nextcell = $("#editcell")
	var lastrow = $('#queuetbl tr:last-child').index()
	
	do {
		if ($(nextcell).index() < QTEL)
		{
			nextcell = $(nextcell).next()
		}
		else
		{
			if ($(nextcell).parent().index() < lastrow)
			{	//go to next row first editable
				do {
					nextcell = $(nextcell).parent().next("tr").children().eq(QHN)
				}
				while ($(nextcell).get(0).nodeName == "TH")	//THEAD row
			}
			else
			{	//#tbl tr:last-child td:last-child
				event.preventDefault()
				return false
			}
		}
	} while (!$(nextcell).get(0).isContentEditable)

	return $(nextcell).get(0)
}

function saveHNinputQueue(hn, content)
{
	var rowtr = $("#editcell").closest("tr").children("td")
	var opdate = rowtr.eq(QSINCE).html().numDate()
	var patient = rowtr.eq(QNAME).html()
	var qn = rowtr.eq(QQN).html()
	var staffname = $( "#container" ).dialog( "option", "title" )
	var sqlstring, waitnum

	if (patient)
	{
		$("#editcell").html($("#editcell").attr("title"))
		return
	}

	content = content.replace(/<br>/g, "")
	content = content.replace(/^\s+/g, "")

	if (qn)
		waitnum = findwaitnum(qn)
	else
		waitnum = findMAXwaitnum() + 1

	sqlstring = "hn=" + content
	sqlstring += "&waitnum="+ waitnum
	sqlstring += "&opdate="+ opdate
	sqlstring += "&staffname="+ staffname
	sqlstring += "&qn="+ qn
	sqlstring += "&username="+ THISUSER

	Ajax(GETNAMEHN, sqlstring, callbackgetByHNqueue)
	//AJAX-false to prevent repeated GETNAMEHN when press <enter>

	function callbackgetByHNqueue(response)
	{
		if (!response || response.indexOf("patient") == -1)	//no patient
			alert("Error getnamehn : "+ response)
		else if (response.indexOf("DBfailed") != -1)
			alert("Failed! book($mysqli)" + response)
		else if (response.indexOf("{") != -1)
		{	//Only one patient
			updateBOOK(response)
			staffqueue(staffname)
		}
	}
}
