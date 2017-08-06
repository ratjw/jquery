
function fillSetTable(pointing)
{
	var tableID = $(pointing).closest('table').attr('id')
	var rowi = $(pointing).closest('tr')[0]
	var tcell = rowi.cells
	var opdateth = tcell[OPDATE].innerHTML
	var opdate = getOpdate(opdateth)		//Thai to ISO date
	var staffname = tcell[STAFFNAME].innerHTML
	var hn = tcell[HN].innerHTML
	var qn = tcell[QN].innerHTML
	var book = BOOK
	if ((tableID == "queuetbl") && ($('#titlename').html() == "Consults")) {
		book = CONSULT
	}

	disable(qn, "#item1")

	var item2 = (tableID == "queuetbl")? true : false
	disable(item2, "#item2")

	disable(qn, "#item3")

	disable(qn, "#item4")

	disable(qn, "#item5")

	disable(hn, "#item6")

	var unuse = (checkblank(book, opdate, qn))? true : false
	var item7 = (qn || unuse)? true : false
	disable(item7, "#item7")

	var $menu = $("#menu")
	$menu.menu({
		select: function( event, ui ) {

			var item = $(ui.item).attr("id")

			switch(item)
			{
				case "item1":
					addnewrow(tableID, rowi, qn)
					break
				case "item2":
					noOpdate()
					break
				case "item3":
					changeDate(tableID, opdate, staffname, qn, pointing)
					break
				case "item4":
					fillEquipTable(book, rowi, qn)
					break
				case "item5":
					editHistory(rowi, qn)
					break
				case "item6":
					PACS(hn)
					break
				case "item7":
					if (unuse) {	//from add new row (check case in this opdate)
						$(rowi).remove()			//delete blank row
						var caseNum = findBOOKrow(book, "")
						book.splice(caseNum, 1)
					} else {
						deleteCase(rowi, opdate, staffname, qn)
					}
					break
				case "item88":
					staffqueue(ui.item.text())
					if ($("#queuewrapper").css("display") != "block")
						splitPane()
					break
				case "item9":
					serviceReview()
					break
				case "item10":
					deletedCases()
					break
				case "item11":
					find()
					break
				case "item12":
					readme()
					break
			}

			clearEditcellData()
			$menu.hide()		//to disappear after selection
			event.stopPropagation()
		}
	});

	var width = $menu.outerWidth()

	$menu.appendTo($(pointing).closest('div'))
	reposition($menu, "left top", "left bottom", pointing)
	menustyle($menu, pointing, width)
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
	var $stafflist = $("#stafflist")
	$stafflist.menu({
		select: function( event, ui ) {
			var staffname = ui.item.text()
			saveContent(pointing, "staffname", staffname)
			$(pointing).html(staffname)
			clearEditcellData()
			$stafflist.hide()		//to disappear after selection
			event.stopPropagation()
		}
	});

	var width = $stafflist.outerWidth()

	$stafflist.appendTo($(pointing).closest('div'))
	reposition($stafflist, "left top", "left bottom", pointing)
	menustyle($stafflist, pointing, width)
	reposition($stafflist, "left top", "left bottom", pointing)
}

function menustyle($me, target, width)
{
	if ($me.position().top > $(target).position().top) {
		var shadow = '10px 20px 30px slategray'
	} else {
		var shadow = '10px -20px 30px slategray'
	}

	$me.css({
		width: width,
		boxShadow: shadow
	})
}

function fillRoomTime(pointing)
{
	var roomtime = pointing.innerHTML
	roomtime = roomtime? roomtime.split("<br>") : ""
	var oproom = roomtime[0]? roomtime[0] : ""
	var optime = roomtime[1]? roomtime[1] : ""
	var theatre = (oproom && oproom.match(/\D+/))? oproom.match(/\D+/)[0] : OPROOM
	var $editcell = $("#editcell")
	$editcell.css("height", "")
	$editcell.html(theatre)
	$editcell.append('<input id="orroom"><br><input id="ortime">')
	var $orroom = $("#orroom")
	var $ortime = $("#ortime")
	$orroom.val(oproom? oproom.match(/\d+/)[0] : "(4)")
	$ortime.val(optime? optime : "(09.00)")

	var orroom = ""
	if (theatre == OPROOM) {
		var min = 1
		var max = 11
	}
	$orroom.spinner({
		min: min,
		max: max,
		step: 1,
		spin: function( event, ui ) {
			if ($orroom.val() == "(4)") {
				orroom = "4"
			}
		},
		stop: function( event, ui ) {
			if (orroom) {
				$orroom.val(orroom)
				orroom = ""	
			}
		}
	});

	var ortime
	$ortime.spinner({
		min: 00,
		max: 24,
		step: 0.5,
		create: function( event, ui ) {
			$ortime.val(optime? optime : "(09.00)")
		},
		spin: function( event, ui ) {
			if ($ortime.val() == "(09.00)") {
				ortime = "09.00"
			} else {
				var val = []
				if (ui.value % 1 == 0) {
					val[0] = String(ui.value)
					val[1] = "00"
				} else {
					val[0] = String(ui.value - 0.5)
					val[1] = "30"
				}
				if (val[0].length == 1) {
					val[0] = "0" + val[0]
				}
				ortime = val.join(".")
			}
		},
		stop: function( event, ui ) {
			if (ortime) {
				$ortime.val(ortime)
				ortime = ""	
			}
		}
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

function addnewrow(tableID, rowi, qn)
{
	var book = BOOK
	if ((tableID == "queuetbl") && ($('#titlename').html() == "Consults")) {
		book = CONSULT
	}
	var caseNum = findBOOKrow(book, qn)
	var bookq = JSON.parse(JSON.stringify(book[caseNum]))	//deep clone
	$.each( bookq, function(key, val) {		//book[caseNum] is not changed
		bookq[key] = ""
	})
	bookq.opdate = book[caseNum].opdate
	bookq.oproom = book[caseNum].oproom
	bookq.optime = book[caseNum].optime
	book.splice(caseNum + 1, 0, bookq)
	
	$(rowi).clone()
		.insertAfter($(rowi))
			.find("td").eq(ROOMTIME)
				.nextAll()
					.html("")

	if (tableID == "queuetbl") {
		//change pointing to STAFFNAME
		var staffname = $('#titlename').html()
		var pointing = $(rowi).next().children("td")[STAFFNAME]
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
//	$addedRow.children("td")[OPDATE].className = NAMEOFDAYABBR[(new Date(LARGESTDATE)).getDay()]

	var $queuecontainer = $("#queuecontainer")
	var queue = $("#queuetbl").height()
	var container = $queuecontainer.height()
	var scrolltop = $queuecontainer.scrollTop()
	var toscroll = queue - container + scrolltop
	$queuecontainer.animate({
		scrollTop: toscroll + 300
	}, 500);
}

function changeDate(tableID, opdate, staffname, qn, pointing)
{
	var $datepicker = $('#datepickertbl')
	if (tableID == "queuetbl") {
		$datepicker = $('#datepickerqueuetbl')
	}
	$datepicker.css({
		height: $(pointing).height(),
		width: $(pointing).width()
	})
	reposition($datepicker, "center", "center", pointing)

	$datepicker.datepicker( {
		dateFormat: "yy-mm-dd",
		minDate: "-1y",
		maxDate: "+1y",
		onClose: function () {
			$('.ui-datepicker').css("fontSize", '')
			$datepicker.hide()
			if (opdate == $datepicker.val()) {
				return
			}
			opdate = $datepicker.val()
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
					if (($("#queuewrapper").css('display') == 'block') && 
						($('#titlename').html() == staffname)) {
						//changeDate of this staffname's case
						refillstaffqueue()
					}
					scrolltoThisCase(qn)
				}
			}
		}
	})
	$datepicker.datepicker("setDate", new Date(opdate))
	$datepicker.datepicker( 'show' )
	var $uidatepicker = $('.ui-datepicker')
	$uidatepicker.css("fontSize", "12px")
	reposition($uidatepicker, "left top", "left bottom", pointing)
}

function deleteCase(rowi, opdate, staffname, qn)
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
			deleteRow(rowi, opdate)
			if (($("#queuewrapper").css('display') == 'block') && 
				($('#titlename').html() == staffname)) {
				refillstaffqueue()
			}
		}
	}
}

function deleteRow(rowi, opdate)
{
	var prevDate = $(rowi).prev().children("td").eq(OPDATE).html()
	var nextDate = $(rowi).next().children("td").eq(OPDATE).html()

	prevDate = getOpdate(prevDate)
	nextDate = getOpdate(nextDate)

	if ((prevDate == opdate)
	|| (nextDate == opdate)
	|| $(rowi).closest("tr").is(":last-child")) {
		$(rowi).remove()
	} else {
		$(rowi).children("td").eq(OPDATE).siblings().html("")
	}
}

function splitPane()
{
	var scrolledTop = document.getElementById("tblcontainer").scrollTop
	var tohead = findVisibleHead('#tbl')
	var width = screen.availWidth
	var height = screen.availHeight

	$("#queuewrapper").show()
	$("#tblwrapper").css({"float":"left", "height":"100%", "width":"50%"})
	$("#queuewrapper").css({"float":"right", "height":"100%", "width":"50%"})
	initResize("#tblwrapper")
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))

	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead)
}

function closequeue()
{
	var scrolledTop = document.getElementById("tblcontainer").scrollTop
	var tohead = findVisibleHead('#tbl')
	
	$("#queuewrapper").hide()
	$("#tblwrapper").css({
		"height": "100%", "width": "100%"
	})

	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead)
}

function fakeScrollAnimate(containerID, tableID, scrolledTop, tohead)
{
	var $container = $('#' + containerID)
	var $table = $('#' + tableID)
	var pixel = 300
	if ((scrolledTop > tohead.offsetTop) || (tohead.offsetTop < 300)) {
		pixel = -300
	}
	if ((tohead.offsetTop + $container.height()) < $table.height()) {
		$container.scrollTop(tohead.offsetTop - pixel)
		$container.animate({
			scrollTop: $container.scrollTop() + pixel
		}, 500);
	} else {
		$container.scrollTop(tohead.offsetTop)
	}	//table end
}
