function clicktable(event)
{
	mousedownCell = event.target || window.event.srcElement
	if (mousedownCell.id == "editcell")
		return false

	if (mousedownCell.nodeName != "TD")
	{
		if ($("#editcell").get(0))
			$("#editcell").attr("id","")
		$("#tbl").siblings().hide()
		return
	}

	savePreviouscell()
	storePresentcell(mousedownCell)
	event.preventDefault()
	mousedownCell.focus()
}

function editing(event)
{
	var keycode = event.which || window.event.keyCode

	if (keycode == 9)
	{
		savePreviouscell()
		if (event.shiftKey)
			thiscell = findPrevcell()
		else
			thiscell = findNextcell()
		storePresentcell(thiscell)
		event.preventDefault()
		thiscell.focus()
	}
	else if (keycode == 13)
	{
		if (event.shiftKey || event.ctrlKey)
			return false
		event.preventDefault()
		savePreviouscell()
		thiscell = findNextcell()
		storePresentcell(thiscell)
		thiscell.focus()
	}
	else if (keycode == 27)
	{
		if ($("#editcell").index() == OPDATE)
		{
			$("editcell").attr("id","")
			$("#tbl").siblings().hide()
		}
		else
		{
			$("#editcell").html($("#editcell").attr("title"))
		}
		event.preventDefault()
		window.focus()
	}
}

function savePreviouscell() 
{
	if (!$("#editcell").get(0))
		return

	var content = $("#editcell").html()

	if (content == $("#editcell").attr("title"))
		return

	var edcindex = $("#editcell").closest("td").index()

	switch(edcindex)
	{
		case OPDATE:
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
}

function saveContent(column, content)
{
	var rowtr = $("#editcell").closest("tr").children("td")
	var opdate = rowtr.eq(OPDATE).html().numDate()
	var qn = rowtr.eq(QN).html()

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

function saveHNinput(hn, content)
{
	var rowtr = $("#editcell").closest("tr").children("td")
	var opdate = rowtr.eq(OPDATE).html().numDate()
	var patient = rowtr.eq(NAME).html()
	var qn = rowtr.eq(QN).html()

	if (patient)
	{
		$("#editcell").html($("#editcell").attr("title"))
		return
	}
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

function storePresentcell(pointing)
{  
	var cindex = $(pointing).closest("td").index()
	var rowtr = $(pointing).closest("tr")
	var rindex = $(rowtr).index()
	var qn = $(rowtr).children("td").eq(QN).html()

	$("#editcell").attr("id","")
	pointing.id = "editcell"
	$("#tbl").siblings().hide()

	switch(cindex)
	{
		case OPDATE:
			fillSetTable(rindex, pointing)
			break
		case STAFFNAME:
			stafflist(pointing)
		case HN:
		case DIAGNOSIS:
		case TREATMENT:
		case TEL:			//store value in attribute "title"
			$("#editcell").attr("title", pointing.innerHTML)
			break
		case NAME:
		case AGE:
			$("#editcell").attr("id","")
			break
	}
}

function fillSetTable(rownum, pointing)
{
	var table = document.getElementById("tbl")
	var rowmain = table.rows[rownum]
	var tcell = table.rows[rownum].cells
	var opdateth = tcell[OPDATE].innerHTML	//Thai date
	var opdate = opdateth.numDate()		//Thai to mysql date
	var staffname = tcell[STAFFNAME].innerHTML
	var casename = tcell[NAME].innerHTML
	var queue = tcell[QN].innerHTML
	var opday = table.rows[rownum].className
	var hn = tcell[HN].innerHTML
	var qn = tcell[QN].innerHTML
	var disabled = "ui-state-disabled"

	var i = 0
	while (opday.indexOf(NAMEOFDAYFULL[i]) == -1)
		i++
	opday = NAMEOFDAYTHAI[i]

	casename = casename.substring(0, casename.indexOf(' '))
	$("#item1").html("เพิ่ม case วันที่ " + opdateth)
	if (queue)
		$("#item1").removeClass(disabled)
	else
		$("#item1").addClass(disabled)
	$("#item2").html("ลบ case " + casename)
	if (queue)
		$("#item2").removeClass(disabled)
	else
		$("#item2").addClass(disabled)
	$("#item3").html("Delete Blank Row")
	if (checkblank(opdate, queue))
		$("#item3").removeClass(disabled)
	else
		$("#item3").addClass(disabled)
	$("#item4").html("ตารางคิว")
	$("#item41").html("คิววัน" + opday)
	if (STATE[0] == "FILLDAY")
		$("#item41").addClass(disabled)
	else
		$("#item41").removeClass(disabled)
	$("#item42").html("คิวรอ " + staffname)
	if (STATE[0] == "FILLSTAFF")
		$("#item42").addClass(disabled)
	else
		$("#item42").removeClass(disabled)
	if (staffname)
		$("#item42").removeClass(disabled)
	else
		$("#item42").addClass(disabled)
	$("#item5").html("การแก้ไข " + casename)
	if (queue)
		$("#item5").removeClass(disabled)
	else
		$("#item5").addClass(disabled)
	$("#item6").html("รายชื่อที่ถูกลบ")

	$("#menu").menu({
		select: function( event, ui ) {
			switch(this.getAttribute("aria-activedescendant"))
			{
				case "item1":
					addnewrow(rowmain)
					break
				case "item2":
					deletecase(rowmain, qn)
					break
				case "item3":
					deleteblankrow(rowmain)
					break
				case "item41":
					STATE[1] = (new Date(opdate)).getDay()
					fillday()
					scrollview(table, opdate)
					break
				case "item42":
					STATE[1] = staffname
					fillstaff()
					scrollview(table, opdate)
					break
				case "item5":
					edithistory(rowmain, qn)
					break
				case "item6":
					deletehistory(rowmain, qn)
					break
			}
			$("#menu").hide()
		}
	});

	showup(pointing, '#menu')
}

function stafflist(pointing)
{
	showup(pointing, '#stafflist')

	$("#stafflist").menu({
		select: function( event, ui ) {
			$(pointing).html($(this).attr("aria-activedescendant"));
			$('#stafflist').hide();
		}
	});
}

function showup(pointing, menuID)
{
	var pos = $(pointing).position();
	var height = pos.top + $(pointing).outerHeight();
	var width = pos.left + $(pointing).outerWidth();

	$(menuID).css("box-shadow", "10px 20px 30px slategray")
	if ((height + $(menuID).outerHeight()) > $(window).innerHeight() + document.body.scrollTop)
	{
		height = pos.top - $(menuID).innerHeight()
		$(menuID).css("box-shadow", "10px -10px 30px slategray")
	}
	$(menuID).css({
		position: "absolute",
		top: height + "px",
		left: width + "px",
		display: ""
	})
}

function findPrevcell() 
{
	var prevcell = $("#editcell")

	do {
		if ($(prevcell).index() > 1)
		{
			prevcell = $(prevcell).prev()
		}
		else
		{
			if ($(prevcell).parent().index() > 1)
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
	} while (!$(prevcell).get(0).isContentEditable)

	return $(prevcell).get(0)
}

function findNextcell() 
{
	var nextcell = $("#editcell")
	var lastrow = $('#tbl tr:last-child').index()
	
	do {
		if ($(nextcell).index() < TEL)
		{
			nextcell = $(nextcell).next()
		}
		else
		{
			if ($(nextcell).parent().index() < lastrow)
			{	//go to next row second cell
				do {
					nextcell = $(nextcell).parent().next("tr").children().eq(STAFFNAME)
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
