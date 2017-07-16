
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
	var book = BOOK
	if ((tableID == "queuetbl") && ($('#titlename').html() == "Consults")) {
		book = CONSULT
	}

	casename = casename.substring(0, casename.indexOf(' '))

	$("#item1 div").html("เพิ่ม case วันที่ " + opdateth)
	disable(qn, "#item1")

	$("#item2 div").html("เพิ่ม case ต่อท้าย ไม่ระบุวันที่")
	var item2 = (tableID == "queuetbl")? true : false
	disable(item2, "#item2")

	$("#item3 div").html("เปลี่ยนวันที่ " + casename)
	disable(qn, "#item3")

	$("#item4 div").html("ห้องผ่าตัด เวลา " + casename)
	disable(qn, "#item4")

	$("#item5 div").html("Equipment " + casename)
	disable(qn, "#item5")

	$("#item6 div").html("การแก้ไขของ " + casename)
	disable(qn, "#item6")

	$("#item7 div").html("PACS " + casename)
	disable(hn, "#item7")

	$("#item8 div").html("Delete " + casename)
	var unuse = (checkblank(book, opdate, qn))? true : false
	var item8 = (qn || unuse)? true : false
	disable(item8, "#item8")

	$("#menu").menu({
		select: function( event, ui ) {

			var item = $(ui.item).attr("id")

			switch(item)
			{
				case "item1":
					addnewrow(tableID, rowmain, qn)
					break
				case "item2":
					noOpdate()
					break
				case "item3":
					changeDate(opdate, qn, pointing)
					break
				case "item4":
					fillRoomTime(book, tableID, casename, qn)
					break
				case "item5":
					fillEquipTable(book, qn)
					break
				case "item6":
					editHistory(rowmain, qn)
					break
				case "item7":
					PACS(hn)
					break
				case "item8":
					if (unuse) {	//from add new row (check case in this opdate)
						$(rowmain).remove()			//delete blank row
						var caseNum = findBOOKrow(book, "")
						book.splice(caseNum, 1)
					} else {
						deleteCase(rowmain, opdate, qn)
					}
					break
				case "item99":
					staffqueue(ui.item.text())
					if ($("#queuewrapper").css("display") != "block")
						splitPane()
					break
				case "item10":
					serviceReview()
					break
				case "item11":
					deleteHistory()
					break
				case "item12":
					find()
					break
				case "item13":
					readme()
					break
			}

			clearEditcellData()
			$("#menu").hide()		//to disappear after selection
			event.stopPropagation()
		}
	});

	var width = $("#menu").outerWidth()

	$("#menu").appendTo($(pointing).closest('div'))
	reposition("#menu", "left top", "left bottom", pointing)
	menustyle("#menu", pointing, width)
}


function disable(item, id)
{
	var disabled = "ui-state-disabled"
	if (item) {
		$(id).removeClass(disabled)
	} else {
		$(id).addClass(disabled)
	}
}

function stafflist(pointing)
{
	$("#stafflist").menu({
		select: function( event, ui ) {
			var staffname = ui.item.text()
			$(pointing).html(staffname)
			saveContent(pointing, "staffname", staffname)
			clearEditcellData()
			$('#stafflist').hide()		//to disappear after selection
			event.stopPropagation()
		}
	});

	var width = $("#stafflist").outerWidth()

	$("#stafflist").appendTo($(pointing).closest('div'))
	reposition("#stafflist", "left top", "left bottom", pointing)
	menustyle("#stafflist", pointing, width)
	reposition("#stafflist", "left top", "left bottom", pointing)
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

function checkblank(book, opdate, qn)
{	//Is this a blank row?
	//If blank, is there a case(s) in this date? 
	var q = 0

	if (qn) {
		return false	//No, this is not a blank row
	}
	//the following is a blank row
	while (opdate > book[q].opdate)	//find this opdate in book
	{
		q++
		if (q >= book.length) {			//not found
			return false	//beyond book, do not delete blank row
		}
	}
	if (opdate == book[q].opdate) {	//found
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

	$("#queuewrapper").show()
//	if (width > height) {
		$("#tblwrapper").css({"float":"left", "height":"100%", "width":"50%"})
		$("#queuewrapper").css({"float":"right", "height":"100%", "width":"50%"})
		initResize("#tblwrapper")
		$('.ui-resizable-e').css('height', $("#tbl").css("height"))
//	} else {
//		$("#tblwrapper").css({"float":"left", "height":"60%", "width":"100%"})
//		$("#queuewrapper").css({"float":"left", "height":"40%", "width":"100%"})
//		initResize("#tblwrapper")
//		$('.ui-resizable-s').css('width', $("#tbl").css("width"))
//	}

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

function addnewrow(tableID, rowmain, qn)
{
	var book = BOOK
	if ((tableID == "queuetbl") && ($('#titlename').html() == "Consults")) {
		book = CONSULT
	}
	var caseNum = findBOOKrow(book, qn)
	var bookq = JSON.parse(JSON.stringify(book[caseNum]))	//???
	$.each( bookq, function(key, val) {
		bookq[key] = ""
	})
	bookq.opdate = book[caseNum].opdate
	book.splice(caseNum + 1, 0, bookq)
	
	$(rowmain).clone()
		.insertAfter($(rowmain))
			.find("td").eq(OPDATE)
				.siblings()
					.html("")

	if (tableID == "queuetbl") {
		//change pointing to STAFFNAME
		var staffname = $('#titlename').html()
		var pointing = $(rowmain).next().children("td")[STAFFNAME]
		saveContent(pointing, "staffname", staffname)
	}
}

function noOpdate()
{
	//must use jQuery in order to be recognized
	$("#queuetbl tr:last").clone()
							.appendTo($("#queuetbl tbody"))
								.children("td").html("")

	//change pointing to STAFFNAME
	var staffname = $('#titlename').html()
	var pointing = $("#queuetbl tr:last td")[STAFFNAME]
	var $addedRow = $("#queuetbl tr:last")
	saveContent(pointing, "staffname", staffname)
	addColor($addedRow, LARGESTDATE)
	$addedRow.children("td")[OPDATE].className = NAMEOFDAYABBR[(new Date(LARGESTDATE)).getDay()]

	var queue = $("#queuetbl").height()
	var container = $("#queuecontainer").height()
	var scrolltop = $("#queuecontainer").scrollTop()
	var toscroll = queue - container + scrolltop
	$("#queuecontainer").animate({
		scrollTop: toscroll + 300
	}, 500);
}

function changeDate(opdate, qn, pointing)
{
	$('#datepickertbl').css({
		height: $(pointing).height(),
		width: $(pointing).width()
	})
	reposition("#datepickertbl", "center", "center", pointing)

	$('#datepickertbl').datepicker( {
		dateFormat: "yy-mm-dd",
		minDate: "-1y",
		maxDate: "+1y",
		onClose: function () {
			$('.ui-datepicker').css("fontSize", '')
//			saveEditPointData(pointing)
			$('#datepickertbl').hide()
			opdate = $('#datepickertbl').val()
			var sql = "sqlReturnbook=UPDATE book SET opdate='" + opdate + "', "
			sql += "editor = '" + THISUSER + "' WHERE qn="+ qn + ";"

			Ajax(MYSQLIPHP, sql, callbackchangeDate)

			function callbackchangeDate(response)
			{
				if (!response || response.indexOf("DBfailed") != -1) {
					alert ("changeDate", response)
				} else {
					updateBOOK(response);
					refillall(BOOK)
					var $cells = $(pointing).closest('tr').children("td")
					if (($("#queuewrapper").css('display') == 'block') && 
						($('#titlename').html() == $cells.eq(STAFFNAME).html())) {
						//changeDate of this staffname's case
						refillstaffqueue()
					}
					alert("To do", "scrolltochangeDateCase")
				}
			}
		}
	})
	$('#datepickertbl').datepicker("setDate", new Date(opdate))
	$('#datepickertbl').datepicker( 'show' )
	$('.ui-datepicker').css("fontSize", "12px")
	reposition(".ui-datepicker", "left top", "left bottom", pointing)
}

function fillRoomTime(book, tableID, casename, qn)
{
	var caseNum = findBOOKrow(book, qn)
	var oproom = book[caseNum].oproom
	var optime = book[caseNum].optime
	document.getElementById("orroom").value = oproom
	document.getElementById("ortime").value = optime
	$("#roomtime").show()
	$("#roomtime").dialog({
		title: casename,
		closeOnEscape: true,
		modal: true,
		buttons: {
			'OK': function () {
				oproom = document.getElementById("orroom").value
				optime = document.getElementById("ortime").value
				var sql = "sqlReturnbook=UPDATE book SET "
				sql += "oproom = '" + oproom + "', "
				sql += "optime = '" + optime + "', "
				sql += "editor = '" + THISUSER + "' WHERE qn="+ qn + ";"

				Ajax(MYSQLIPHP, sql, callbackfillRoomTime)

				$(this).dialog('close')

				function callbackfillRoomTime(response)
				{
					if (!response || response.indexOf("DBfailed") != -1) {
						alert ("fillRoomTime", response)
					} else {
						updateBOOK(response);
						if ($("#queuewrapper").css('display') == 'block') {
							refillstaffqueue()
						}
						refillall(BOOK)
					}
				}
			}
		}
	})

	$( "#orroom" ).spinner({
		min: 1,
		max: 11,
		step: 1
	});

	var time
	$( "#ortime" ).spinner({
		min: 00,
		max: 24,
		step: 1,
		create: function( event, ui ) {
			$( "#ortime" ).val(optime)
		},
		spin: function( event, ui ) {
			time = ui.value
			if (String(time).length == 1) {
				time = "0" + time + ".00"
			} else {
				time = time + ".00"
			}
		},
		stop: function( event, ui ) {
			$( "#ortime" ).val(time)
		}
	})
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
	var prevDate = $(rowmain).prev().children("td").eq(OPDATE).html()
	var nextDate = $(rowmain).next().children("td").eq(OPDATE).html()

	prevDate = getOpdate(prevDate)
	nextDate = getOpdate(nextDate)

	if ((prevDate == opdate)
	|| (nextDate == opdate)
	|| $(rowmain).closest("tr").is(":last-child")) {
		$(rowmain).remove()
	} else {
		$(rowmain).children("td").eq(OPDATE).siblings().html("")
	}
}
