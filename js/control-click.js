function clicktable(event)
{
	clickedCell = window.event.srcElement || event.target

	if (clickedCell.id == "editcell") {
		return false
	} else {
		$("#tbl").siblings().hide()
		if (clickedCell.nodeName != "TD")
			return
	}

	savePreviouscell()
	storePresentcell(clickedCell)
	$("#editcell").focus()
}

function editing(event)
{
	var keycode = event.which || window.event.keyCode
	var thatcell = $("#editcell").get(0)
	var thiscell

	if (keycode == 9)
	{
		savePreviouscell()
		if (event.shiftKey)
			thiscell = findPrevcell()
		else
			thiscell = findNextcell()
		if (thiscell) {
			storePresentcell(thiscell)
			thiscell.focus()
		} else {
			$("#tbl").siblings().hide()
		}
		event.preventDefault()
	}
	else if (keycode == 13)
	{
		if (event.shiftKey || event.ctrlKey)
			return false
		event.preventDefault()
		savePreviouscell()
		thiscell = findNextcell()
		storePresentcell(thiscell)
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
		if ($("#editcell").index() == OPDATE)
		{
			$("#editcell").attr("id","")
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
	if (!$("#editcell").data("located"))
		return

//	if ($("#queuetbl").css("display") == "block")
//		return

	var content = $("#editcell").html()

	if (content == $("#editcell").data("content"))
		return

	var editcindex = $($("#editcell").data("located")).index()

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
	var rowtr = $($("#editcell").data("located")).closest("tr").children("td")
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
			$($("#editcell").data("located")).html($("#editcell").data("content"))
		}
		else
		{
			updateBOOK(response);
			fillselect("tbl", opdate)
		}
		$("#tbl").css("cursor", "")
	}
}

function saveHNinput(hn, content)
{
	var rowtr = $($("#editcell").data("located")).closest("tr").children("td")
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
	editcell(pointing)

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
			$("#editcell").hide() //disable any editcell
			break
		case HN:
		case DIAGNOSIS:
		case TREATMENT:
		case TEL:	//store content in "data" of editcell
			$("#editcell").data({
				content : $(pointing).html()
			})
			break
	}
}

function editcell(pointing)
{
	var pos = $(pointing).position()

	$("#editcell").html($(pointing).html())
	$("#editcell").data({
		located : pointing
	})
	$("#editcell").css({
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		top: pos.top + "px",
		left: pos.left + "px",
		display: "block",
	})
	$("#editcell").focus()
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
	if (qn)
		$("#item1").removeClass(disabled)
	else
		$("#item1").addClass(disabled)
	$("#item2").html("ลบ case " + casename)
	if (qn)
		$("#item2").removeClass(disabled)
	else
		$("#item2").addClass(disabled)
	$("#item3").html("Delete Blank Row")
	if (checkblank(opdate, qn))
		$("#item3").removeClass(disabled)
	else
		$("#item3").addClass(disabled)
	$("#item4").html("คิวของอาจารย์")
	$("#item5").html("คิวเฉพาะวัน")
	$("#item6").html("การแก้ไขของ " + casename)
	if (qn)
		$("#item6").removeClass(disabled)
	else
		$("#item6").addClass(disabled)
	$("#item7").html("รายชื่อที่ถูกลบ")

	$("#menu").menu({
		select: function( event, ui ) {
			var item = this.getAttribute("aria-activedescendant")
			switch(item)
			{
				case "item1":
					addnewrow(rowmain)
					break
				case "item2":
					deletecase(rowmain, qn)
					break
				case "item3":
					deleteblankrow(rowmain)
				case "item4":
					break
				case "item51":
				case "item52":
				case "item53":
				case "item54":
				case "item55":
				case "item56":
				case "item57":
					fillday($('#'+item).html())
					break
				case "item6":
					edithistory(rowmain, qn)
					break
				case "item7":
					deletehistory(rowmain, qn)
					break
				default :
					staffqueue(item)
			}
			event.stopPropagation()
//			event.preventDefault()
			$("#editcell").hide()
			$("#menu").hide()
			$( "#item4" ).removeClass( "ui-state-active" )
			$( "#item4" ).prepend('<span class="ui-menu-icon ui-icon  ui-icon-caret-1-e"></span>')
			$( "#item40" ).hide()
			$( "#item40" ).attr("aria-hidden", "true")
			$( "#item40" ).attr("aria-expanded", "false")
		}
	});

	showup(pointing, '#menu')
}

function stafflist(pointing)
{
	showup(pointing, '#stafflist')

	$("#stafflist").menu({
		select: function( event, ui ) {
			var staffname = $(this).attr("aria-activedescendant")
			$(pointing).html(staffname);
			saveContent("staffname", staffname)
			$('#stafflist').hide();
			event.stopPropagation()
//			event.preventDefault()
		}
	});
}

function showup(pointing, menuID)
{
	var pos = $(pointing).position();
	var height = pos.top + $(pointing).outerHeight();
	var width = pos.left + $(pointing).outerWidth();

	if ((height + $(menuID).outerHeight()) > $(window).innerHeight() + document.body.scrollTop)
	{
		height = pos.top - $(menuID).innerHeight()
		$(menuID).css("box-shadow", "10px -10px 30px slategray")
	}
	$(menuID).css({
		position: "absolute",
		top: height + "px",
		left: width + "px",
		display: "block",
		boxShadow: "10px 20px 30px slategray"
	})
}

function showupQueue(pointing, menuID)
{
	var pos = $(pointing).position();
	var height = pos.top + $(pointing).outerHeight()
	var width = pos.left  + $(pointing).outerWidth();

	$(menuID).css("box-shadow", "10px 20px 30px slategray")
	$(menuID).css({
		position: "absolute",
		top: height + "px",
		left: width + "px",
		zIndex: 1000,
		modal:true,
		display: "block"
	})
}

function findPrevcell() 
{
	var prevcell = $("#editcell").data("located")
	var column = $(prevcell).index()

	if (column > 1)
	{
		column = EDITABLE[($.inArray(column, EDITABLE) - 1)];
		prevcell = $(prevcell).parent().children().eq(column)
	}
	else
	{
		if ($(prevcell).parent().index() > 1)
		{	//go to prev row last editable
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

	return $(prevcell).get(0)
}

function findNextcell() 
{
	var nextcell = $("#editcell").data("located")
	var column = $(nextcell).index()
	var lastrow = $('#tbl tr:last-child').index()

	if (column < TEL)
	{
		column = EDITABLE[($.inArray(column, EDITABLE) + 1)]
		nextcell = $(nextcell).parent().children().eq(column)
	}
	else
	{
		if ($(nextcell).parent().index() < lastrow)
		{	//go to next row first editable
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

	return $(nextcell).get(0)
}
