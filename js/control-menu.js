
function fillSetTable(rownum, pointing)
{
	var tableID = $('#editcell').data("tableID")
	var table = document.getElementById(tableID)
	var rowmain = table.rows[rownum]
	var tcell = rowmain.cells
	var opdateth = tcell[OPDATE].innerHTML	//Thai date
	var opdate = opdateth.numDate()		//Thai to mysql date
	var staffname = tcell[STAFFNAME].innerHTML
	var casename = tcell[NAME].innerHTML
	var hn = tcell[HN].innerHTML
	var qn = tcell[QN].innerHTML
	var disabled = "ui-state-disabled"

	casename = casename.substring(0, casename.indexOf(' '))

	$("#item2").html("เลื่อนทุกราย 1 สัปดาห์")
	if ($('#editcell').data("tableID") == "queuetbl")
		$("#item2").parent().removeClass(disabled)
	else
		$("#item2").parent().addClass(disabled)

	$("#item3").html("เพิ่ม case วันที่ " + opdateth)
	if (qn)
		$("#item3").parent().removeClass(disabled)
	else
		$("#item3").parent().addClass(disabled)

	$("#item4").html("Delete " + casename)
	if (!qn && !(checkblank(opdate, qn)))
		$("#item4").parent().addClass(disabled)
	else
		$("#item4").parent().removeClass(disabled)

	$("#item5").html("List of Deleted Cases")

	$("#item6").html("การแก้ไขของ " + casename)
	if (qn)
		$("#item6").parent().removeClass(disabled)
	else
		$("#item6").parent().addClass(disabled)

	$("#item7").html("PACS")
	if (hn)
		$("#item7").parent().removeClass(disabled)
	else
		$("#item7").parent().addClass(disabled)

	$("#item8").html("Equipment")
	if (qn)
		$("#item8").parent().removeClass(disabled)
	else
		$("#item8").parent().addClass(disabled)

	$("#item9").html("Service Review ")

	$("#menu").menu({
		select: function( event, ui ) {

			var item = $(ui.item).find("div").attr("id")

			switch(item)
			{
				case "item1":
					staffqueue(ui.item.text())
					if ($("#queuecontainer").css("display") != "block")
						SplitPane()
					break
				case "item2":
//					postpone()
					break
				case "item3":
					addnewrow(rowmain)
					break
				case "item4":
					if (checkblank(opdate, qn))		//from add new row (this opdate case in another row)
						$(rowmain).remove()		//delete blank row
					else
						deleteCase(rowmain, opdate, qn)
					break
				case "item5":
					deleteHistory()
					break
				case "item6":
					editHistory(rowmain, qn)
					break
				case "item7":
					PACS(hn)
					break
				case "item8":
					fillEquipTable(rownum, qn)
					break
				case "item9":
					serviceReview()
					break
			}

			$("#editcell").data("location", "")
			$("#editcell").hide()		//to disappear after selection
			$("#menu").hide()		//to disappear after selection
			event.stopPropagation()
			return false
		}
	});

	showMenu(pointing, '#menu')
}

function stafflist(pointing)
{
	$("#stafflist").menu({
		select: function( event, ui ) {
			var staffname = ui.item.text()
			$(pointing).html(staffname)
			saveContent("staffname", staffname)
			$("#editcell").data("location", "")
			$("#editcell").hide()		//to disappear after selection
			$('#stafflist').hide()		//to disappear after selection
			event.stopPropagation()
			return false
		}
	});

	showMenu(pointing, '#stafflist')
}

function showMenu(pointing, menuID)
{
	var pos = $(pointing).position();
	var height = pos.top + $(pointing).outerHeight();	//bottom
	var width = pos.left + $(pointing).outerWidth();	//right

	if ((height + $(menuID).outerHeight()) > 
		$(window).innerHeight() + $(window).scrollTop())
	{
		height = pos.top - $(menuID).innerHeight()
	}
	$(menuID).css({
		top: height + "px",
		left: width + "px"
	})
	$(menuID).show()
}

function checkblank(opdate, qn)
{	//No case in this date? 
	var q = 0

	if (qn)
		return false	//No, it's not empty
	while (opdate > BOOK[q].opdate)
	{
		q++
		if (q >= BOOK.length)
			return false	//beyond BOOK, do not delete
	}
	if (opdate == BOOK[q].opdate)
		return true	//there is this opdate case in another row, can delete
	else
		return false	//No this opdate case in another row, do not delete
}

function addnewrow(rowmain)
{
	if (rowmain.cells[QN].innerHTML)	//not empty
	{
		var clone = rowmain.cloneNode(true)

		rowmain.parentNode.insertBefore(clone,rowmain)
		for (i=1; i<rowmain.cells.length; i++)
			rowmain.cells[i].innerHTML = ""	
		DragDrop()
	}
}

function deleteCase(rowmain, opdate, qn)
{
	$('#delete').show()
	$('#delete').position( {
		my: "left center",
		at: "left center",
		of: $(rowmain)
	})

	doDelete = function() 
	{
		//not actually delete the case but set waitnum=NULL
		var sql = "sqlReturnbook=UPDATE book SET waitnum=NULL WHERE qn="+ qn +";"

		Ajax(MYSQLIPHP, sql, callbackdeleterow)

		function callbackdeleterow(response)
		{
			if (!response || response.indexOf("DBfailed") != -1)
				alert ("Delete & Refresh failed!\n" + response)
			else
			{
				updateBOOK(response);
				deleteRow(rowmain, opdate)
			}
		}
		$('#delete').hide()
	}
}

function closeDel() 
{
	$('#delete').hide()
}

function deleteRow(rowmain, opdate)
{
	var prevDate = $(rowmain).prev().children().eq(OPDATE).html()
	var nextDate = $(rowmain).next().children().eq(OPDATE).html()

	if (prevDate)	//avoid "undefined" error message
		prevDate = prevDate.numDate()

	if (nextDate)
		nextDate = nextDate.numDate()

	if ((prevDate == opdate) ||
		(nextDate == opdate))
	{
		$(rowmain).remove()
	} else {
		$(rowmain).children().eq(OPDATE).siblings().html("")
	}
}
