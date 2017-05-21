
function fillSetTable(pointing)
{
	var tableID = $(pointing).closest('table').attr('id')
	var rowmain = $(pointing).closest('tr')[0]
	var tcell = rowmain.cells
	var opdateth = tcell[OPDATE].innerHTML
	var opdate = getOpdate(opdateth)		//Thai to ISO date
	var staffname = tcell[STAFFNAME].innerHTML
	var casename = tcell[NAME].innerHTML
	var hn = tcell[HN].innerHTML
	var qn = tcell[QN].innerHTML
	var disabled = "ui-state-disabled"

	casename = casename.substring(0, casename.indexOf(' '))

	$("#item2 div").html("เพิ่ม case ต่อท้าย ไม่ระบุวันที่")
	if (tableID == "queuetbl") {
		$("#item2").removeClass(disabled)
	} else {
		$("#item2").addClass(disabled)
	}
	$("#item3 div").html("เพิ่ม case วันที่ " + opdateth)
	if (qn) {
		$("#item3").removeClass(disabled)
	} else {
		$("#item3").addClass(disabled)
	}
	$("#item4 div").html("Delete " + casename)
	if (!qn && !(checkblank(opdate, qn))) {
		$("#item4").addClass(disabled)
	} else {
		$("#item4").removeClass(disabled)
	}
	$("#item5 div").html("List of Deleted Cases")

	$("#item6 div").html("การแก้ไขของ " + casename)
	if (qn) {
		$("#item6").removeClass(disabled)
	} else {
		$("#item6").addClass(disabled)
	}
	$("#item7 div").html("PACS")
	if (hn) {
		$("#item7").removeClass(disabled)
	} else {
		$("#item7").addClass(disabled)
	}
	$("#item8 div").html("Equipment")
	if (qn) {
		$("#item8").removeClass(disabled)
	} else {
		$("#item8").addClass(disabled)
	}
	$("#item9 div").html("Service Review")

	$("#item10 div").html("Readme")

	$("#menu").menu({
		select: function( event, ui ) {

			var item = $(ui.item).attr("id")

			switch(item)
			{
				case "item1":
					staffqueue(ui.item.text())
					if ($("#queuewrapper").css("display") != "block")
						splitPane()
					break
				case "item2":
					noOpdate()
					break
				case "item3":
					addnewrow(tableID, rowmain, qn)
					break
				case "item4":
					if (checkblank(opdate, qn))	{	//from add new row (check case in this opdate)
						$(rowmain).remove()			//delete blank row
						var caseNum = findBOOKrow("")
						BOOK.splice(caseNum, 1)
					} else
						deleteCase(rowmain, opdate, qn, pointing)
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
					fillEquipTable(qn)
					break
				case "item9":
					serviceReview()
					break
			}

			clearEditcellData("hide")
			$("#menu").hide()		//to disappear after selection
			event.stopPropagation()
		}
	});

	var width = $("#menu").outerWidth()

	$("#menu").appendTo($(pointing).closest('div'))
	reposition("#menu", "left top", "left bottom", pointing)
	menustyle("#menu", pointing, width)
}

function stafflist(pointing)
{
	$("#stafflist").menu({
		select: function( event, ui ) {
			var staffname = ui.item.text()
			$(pointing).html(staffname)
			saveContent(pointing, "staffname", staffname)
			clearEditcellData("hide")
			$('#stafflist').hide()		//to disappear after selection
			event.stopPropagation()
			return false
		}
	});

	var width = $("#stafflist").outerWidth()

	$("#stafflist").appendTo($(pointing).closest('div'))
	reposition("#stafflist", "left top", "left bottom", pointing)
	menustyle("#stafflist", pointing, width)
}

function menustyle(me, target, width)
{
	if ($(me).position().top > $(target).position().top) {
		var shadow = '10px 20px 30px slategray'
	} else {
		var shadow = '10px -20px 30px slategray'
	}

	$(me).css({
		width: width,
		boxShadow: shadow
	})
}

function checkblank(opdate, qn)
{	//Is this a blank row?
	//If blank, is there a case(s) in this date? 
	var q = 0

	if (qn) {
		return false	//No, this is not a blank row
	}
	//the following is a blank row
	while (opdate > BOOK[q].opdate)	//find this opdate in BOOK
	{
		q++
		if (q >= BOOK.length) {			//not found
			return false	//beyond BOOK, do not delete blank row
		}
	}
	if (opdate == BOOK[q].opdate) {	//found
		return true	//there is a case(s) in this opdate, can delete blank row
	} else {
		return false	//No case in this opdate, do not delete blank row
	}
}

function splitPane()
{
	var tohead = findVisibleHead('#tbl')
	var width = screen.availWidth
	var height = screen.availHeight

	if (width > height) {
		$("#tblwrapper").css({"float":"left", "height":"100%", "width":"60%"})
		$("#queuewrapper").css({"float":"right", "height":"100%", "width":"40%"})
	} else {
		$("#tblwrapper").css({"float":"left", "height":"60%", "width":"100%"})
		$("#queuewrapper").css({"float":"left", "height":"40%", "width":"100%"})
	}
	$("#queuewrapper").show()
	initResize("#tblwrapper")
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))

	fakeScrollAnimate("#tblcontainer", "#tbl", tohead)
}

function closequeue()
{
	var tohead = findVisibleHead('#tbl')
	
	$("#queuewrapper").hide()
	$("#tblwrapper").css({
		"height": "100%", "width": "100%"
	})

	fakeScrollAnimate("#tblcontainer", "#tbl", tohead)
}

function fakeScrollAnimate(container, table, tohead)
{
	if (tohead.offsetTop < 300)
		return
	if (tohead.offsetTop + $(container).height() < $(table).height())
	{
		$(container).scrollTop(tohead.offsetTop - 300)
		$(container).animate({
			scrollTop: $(container).scrollTop() + 300
		}, 500);
	}
	else
		$(container).scrollTop(tohead.offsetTop)
}

function noOpdate()
{
	//must use jQuery in order to be recognized
	$("#queuetbl tr:last").clone()
							.appendTo($("#queuetbl tbody"))
								.children().html("")

	//change pointing to STAFFNAME
	var staffname = $('#titlename').html()
	var pointing = $("#queuetbl tr:last td")[STAFFNAME]
	var $addedRow = $("#queuetbl tr:last")
	saveContent(pointing, "staffname", staffname)
	addColor($addedRow, LARGESTDATE)
	$addedRow.children()[OPDATE].className = NAMEOFDAYABBR[(new Date(LARGESTDATE)).getDay()]

	var queue = $("#queuetbl").height()
	var container = $("#queuecontainer").height()
	var scrolltop = $("#queuecontainer").scrollTop()
	var toscroll = queue - container + scrolltop
	$("#queuecontainer").animate({
		scrollTop: toscroll + 50
	}, 500);
}

function addnewrow(tableID, rowmain, qn)
{
	var caseNum = findBOOKrow(qn)
	var bookq = JSON.parse(JSON.stringify(BOOK[caseNum]))
	$.each( bookq, function(key, val) {
		bookq[key] = ""
	})
	bookq.opdate = BOOK[caseNum].opdate
	BOOK.splice(caseNum + 1, 0, bookq)
	
	$(rowmain).clone()
		.insertAfter($(rowmain))
			.find("td").eq(OPDATE)
				.siblings()
					.html("")
	
	if (tableID == "queuetbl") {
		//change pointing to STAFFNAME
		var staffname = $('#titlename').html()
		var pointing = $(rowmain).children().eq(STAFFNAME)[0]
		saveContent(pointing, "staffname", staffname)
	}
}

function deleteCase(rowmain, opdate, qn)
{
	//not actually delete the case but set waitnum=NULL
	var sql = "sqlReturnbook=UPDATE book SET waitnum=NULL, "
	sql += "editor = '" + THISUSER + "' WHERE qn="+ qn + ";"

	Ajax(MYSQLIPHP, sql, callbackdeleterow)

	function callbackdeleterow(response)
	{
		if (!response || response.indexOf("DBfailed") != -1) {
			alert ("deleteCase", response)
		} else {
			updateBOOK(response);
			deleteRow(rowmain, opdate)
		}
	}
}

function deleteRow(rowmain, opdate)
{
	var prevDate = $(rowmain).prev().children().eq(OPDATE).html()
	var nextDate = $(rowmain).next().children().eq(OPDATE).html()

	prevDate = getOpdate(prevDate)
	nextDate = getOpdate(nextDate)

	if ((prevDate == opdate)
	|| (nextDate == opdate)
	|| $(rowmain).closest("tr").is(":last-child")) {
		$(rowmain).remove()
	} else {
		$(rowmain).children().eq(OPDATE).siblings().html("")
	}
}
