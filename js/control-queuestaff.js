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
	$("#container").html($("#queuetbl"));
	$("#container").dialog({
		dialogClass: "dialog",
		title: staffname,
		height: window.innerHeight * 50 / 100,
		width: window.innerWidth * 70 / 100
	});
	$("#queuetbl").css("display", "block")
	$(".dialog").css("display", "block")
	DragDropStaff()
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
	var clickedCell = event.target || window.event.srcElement

	//checkpoint#1 : click in editing area
	if (clickedCell.id == "editcell") {
		return
	} else {
		$("#tbl").siblings().not("#queuetbl").hide()
		if (clickedCell.nodeName != "TD")
			return
	}

	savePreviouscellQueue()
	storePresentcellQueue(clickedCell)
	$("#editcell").focus()
}

function editingQueue(event)
{
	var keycode = event.which || window.event.keyCode
	var thiscell

	if ($($("#editcell").data("located")).closest("table").attr("id") != "queuetbl")
		return

	if (keycode == 9)
	{
		savePreviouscellQueue()
		if (event.shiftKey)
			thiscell = findPrevcellQueue(event)
		else
			thiscell = findNextcellQueue(event)
		if (thiscell) {
			storePresentcellQueue(thiscell)
			thiscell.focus()
		} else {
			$("#editcell").hide()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 13)
	{
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscellQueue()
		thiscell = findNextcellQueue(event)
		if (thiscell) {
			storePresentcellQueue(thiscell)
			thiscell.focus()
		} else {
			$("#editcell").hide()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 27)
	{
		if ($($("#editcell").data("located")).index() == QSINCE)
		{
			$("#editcell").hide()
			$("#queuemenu").hide()	//dialog enwraped container
		}
		else
		{
			$($("#editcell").data("located")).html($("#editcell").data("content"))
		}
		window.focus()
		event.preventDefault()
		return false
	}
}

function savePreviouscellQueue() 
{
	if (!$("#editcell").data("located"))
		return

	var content = $("#editcell").html()

	if (content == $("#editcell").data("content"))
		return

	var editcindex = $($("#editcell").data("located")).index()

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
	var rowcell = $($("#editcell").data("located")).closest("tr").children("td")
	var opdate = new Date().MysqlDate()
	var qn = rowcell.eq(QQN).html()
	var staffname = $( "#container" ).dialog( "option", "title" )
	var sqlstring
	var waitnum

	$("#queuetbl").css("cursor", "wait")
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
			$("#editcell").hide()
		}
		else
		{
			updateBOOK(response);
			fillselectQueue(rowcell, waitnum, qn)
			$("#editcell").data("content", "")
		}
		$("#queuetbl").css("cursor", "")
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

	$("#editcell").hide()
	editcell(pointing)

	switch(cindex)
	{
		case QSINCE:
			fillSetTableQueue(pointing, rindex)
			break
		case QNAME:
		case QAGE:
			$("#editcell").hide() //disable self (uneditable cell)
			break
		case QHN:
		case QDIAGNOSIS:
		case QTREATMENT:
		case QTEL:	//store value in attribute "title" of editcell
			$("#editcell").data("content", $(pointing).html())
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
			$("#editcell").hide()
			$("#queuemenu").hide()
			event.stopPropagation()
			return false
		}
	});

	$("#queuemenu").insertAfter($("#queuetbl"))
	showupQueue(pointing, '#queuemenu')
}

function showupQueue(pointing, menuID)
{
	var pos = $(pointing).position();
	var height = pos.top + $(pointing).outerHeight()
	var width = pos.left  + $(pointing).outerWidth();

	$(menuID).css({
		position: "absolute",
		top: height + "px",
		left: width + "px",
		zIndex: 1000,
		modal:true,
		display: "block",
		boxShadow: "10px 20px 30px slategray"
	})
}

function addnewrowQ()
{
	var queuetbl = document.getElementById("queuetbl")

	rownum = $("#queuetbl tr").length	//always append to table end
	rowi = makenextrowQueue(queuetbl, rownum)
	rowi.cells[QSINCE].innerHTML = new Date().MysqlDate().thDate()
	DragDropStaff()
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
}

function findPrevcellQueue(event) 
{
	var prevcell = $("#editcell").data("located")

	if (column = EDITQUEUE[($.inArray(column, EDITQUEUE) - 1)])
	{
		prevcell = $(prevcell).parent().children().eq(column)
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

	return $(prevcell).get(0)
}

function findNextcellQueue(event) 
{
	var nextcell = $("#editcell").data("located")
	var column = $(nextcell).index()
	var lastrow = $('#queuetbl tr:last-child').index()
	
	if (column = EDITQUEUE[($.inArray(column, EDITQUEUE) + 1)])
	{
		nextcell = $(nextcell).parent().children().eq(column)
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

	return $(nextcell).get(0)
}

function saveHNinputQueue(hn, content)
{
	var rowtr = $($("#editcell").data("located")).closest("tr").children("td")
	var opdate = rowtr.eq(QSINCE).html().numDate()
	var patient = rowtr.eq(QNAME).html()
	var qn = rowtr.eq(QQN).html()
	var staffname = $( "#container" ).dialog( "option", "title" )
	var sqlstring, waitnum

	if (patient)
	{
		$("#editcell").html($("#editcell").data("content"))
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
