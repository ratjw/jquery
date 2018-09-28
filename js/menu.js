
function oneRowMenu()
{
	var	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		patient = $cell.eq(PATIENT).html(),
		qn = $cell.eq(QN).html(),
		notLARGE = (opdate !== LARGESTDATE)

	disable(qn, "#addrow")

	var postpone = qn && staffname && notLARGE
	if (postpone) {
		$("#postponecase").html("<b>Confirm เลื่อน ไม่กำหนดวัน  </b><br>" + patient)
	}
	disable(postpone, "#postpone")

	disable(qn, "#changedate")

	disable(qn, "#history")

	var Delete = qn || checkblank($row, opdate)
	if (Delete) {
		$("#delcase").html("<b>Confirm Delete </b><br>" + patient)
	}
	disable(Delete, "#delete")
}

function clickConfirm(id, message, $cell)
{
	var $itemdiv = $(id).find("div"),
		itemname = $cell.eq(PATIENT).html()
	$(id).html(message + "<br>" + itemname)
}

function disable(item, id)
{
	if (item) {
		$(id).removeClass("disabled")
	} else {
		$(id).addClass("disabled")
	}
}

function menustyle($me, $target)
{
	if ($me.position().top > $target.position().top) {
		var shadow = '10px 20px 30px slategray'
	} else {
		var shadow = '10px -20px 30px slategray'
	}

	$me.css({
		boxShadow: shadow
	})
}

// blank row: a row with no case, and is not the only row of this date
function checkblank($row, opdate)
{
	var	$row = $(".selected").closest('tr'),
		$cell = $row.find("td"),
		opdate = getOpdate($cell.eq(OPDATE).html()),
		prevDate = $row.prev().find("td").eq(OPDATE).html() || ""

	if (prevDate.numDate() === opdate) {
		return true
	} else {
		return false
	}
}

function addnewrow()
{
	var	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		keepcell = tableID === "tbl" ? OPDATE : STAFFNAME

	$row.clone()
		.removeClass("selected")
		.insertAfter($row)
			.find("td").eq(HN).removeClass("pacs")
			.parent().find("td").eq(PATIENT).removeClass("camera")
			.parent().find("td").eq(keepcell)
				.nextAll()
					.html("")
}

function postponeCase()
{
	var	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		qn = $cell.eq(QN).html(),
		theatre = $cell.eq(THEATRE).html(),
		oproom = $cell.eq(OPROOM).html(),
		allCases, index,

		sql = "sqlReturnbook=UPDATE book SET opdate='" + LARGESTDATE
			+ "', editor='" + gv.user
			+ "' WHERE qn="+ qn + ";"

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
		index = allCases.indexOf(qn)
		allCases.splice(index, 1)

		for (var i=0; i<allCases.length; i++) {
			sql += sqlCaseNum(i + 1, allCases[i])
		}
	}

	Ajax(MYSQLIPHP, sql, callbackpostpone)

	function callbackpostpone(response)
	{
		if (typeof response === "object") {
			updateBOOK(response)
			refillOneDay(opdate)
			if ((isSplited()) && 
				(isStaffname(staffname))) {
				// changeDate of this staffname's case
				refillstaffqueue()
			}
			scrolltoThisCase(qn)
		} else {
			Alert ("postpone", response)
		}
	}
}

function changeDate()
{
	var	$selected = $(".selected"),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		args = [
			$row,
			opdateth = $cell.eq(OPDATE).html(),
			opdate = getOpdate(opdateth),
			staffname = $cell.eq(STAFFNAME).html(),
			qn = $cell.eq(QN).html()
		],
		$allRows = $("#tbl tr:has('td'), #queuetbl tr:has('td')")

	$allRows.on("mouseover", overDate)
	$allRows.on("mouseout", outDate)
	$allRows.on("click", args, clickDate)

	$row.removeClass("selected").addClass("changeDate")
	$(document).on("keydown", clearOnEscape)
}

function overDate() { $(this).addClass("pasteDate") }

function outDate() { $(this).removeClass("pasteDate") }

// args = [$row, opdateth, opdate, staffname, qn]
function clickDate(event)
{
	var args = event.data,
		$moverow = args[0],
		moveOpdateth = args[1],
		moveOpdate = args[2],
		staffname = args[3],
		moveQN = args[4],
		movetheatre = $moverow.find("td").eq(THEATRE).html(),
		moveroom = $moverow.find("td").eq(OPROOM).html(),

		$thisrow = $(this),
		$thiscell = $thisrow.children("td"),
		thisOpdateth = $thiscell.eq(OPDATE).html(),
		thisOpdate = getOpdate(thisOpdateth),
		thistheatre = $thiscell.eq(THEATRE).html(),
		thisroom = $thiscell.eq(OPROOM).html(),
		thisqn = $thiscell.eq(QN).html(),
		thisWaitnum = calcWaitnum(thisOpdateth, $thisrow, $thisrow.next()),
		allSameDate,
		allOldCases, moveindex,
		allNewCases, index, thisindex, casenum,
		sql = ""

	allOldCases = sameDateRoomTableQN(moveOpdateth, moveroom, movetheatre)
	moveindex = allOldCases.indexOf(moveQN)
	// remove itself from old sameDateRoom
	if (moveindex >= 0) {
		allOldCases.splice(moveindex, 1)
	}

	allNewCases = sameDateRoomTableQN(thisOpdateth, thisroom, thistheatre)
	sameroomindex = allNewCases.indexOf(moveQN)
	// remove itself in new sameDateRoom, in case new === old
	if (sameroomindex >= 0) {
		allNewCases.splice(sameroomindex, 1)
	}
	thisindex = allNewCases.indexOf(thisqn)

	allNewCases.splice(thisindex + 1, 0, moveQN)

	event.stopPropagation()
	clearMouseoverTR()
	// click the same case
	if (thisqn === moveQN) { return }

	for (var i=0; i<allOldCases.length; i++) {
		sql += sqlCaseNum(i + 1, allOldCases[i])
	}

	for (var i=0; i<allNewCases.length; i++) {
		if (allNewCases[i] === moveQN) {
			casenum = thisroom? (i + 1) : null
			sql += sqlMover(thisWaitnum, thisOpdate, thisroom || null, casenum, moveQN)
		} else {
			sql += sqlCaseNum(i + 1, allNewCases[i])
		}
	}

	if (!sql) { return }
	sql = "sqlReturnbook=" + sql

	Ajax(MYSQLIPHP, sql, callbackClickDate)

	function callbackClickDate(response)
	{
		if (typeof response === "object") {
			updateBOOK(response);
			if (moveOpdateth) {
				refillOneDay(moveOpdate)
			}
			if (moveOpdate !== thisOpdate) {
				refillOneDay(thisOpdate)
			}
			if (isSplited()) {
				var titlename = $('#titlename').html()
				if ((titlename === staffname) ||
					(titlename === "Consults")) {
					// changeDate of this staffname's case
					refillstaffqueue()
				}
			} 
			scrolltoThisCase(moveQN)
		} else {
			Alert ("changeDate", response)
		}
	}
}

function clearOnEscape(event) {
	var keycode = event.which || window.event.keyCode

	if (keycode === 27)	{
		clearMouseoverTR()
	}
}

function clearMouseoverTR()
{
	$("#tbl tr:has('td'), #queuetbl tr:has('td')").off({
		"mouseover": overDate,
		"mouseout": outDate,
		"click": clickDate
	})
	$(".pasteDate").removeClass("pasteDate")
	$(".changeDate").removeClass("changeDate")
	$(document).off("keydown", clearOnEscape)
}

// not actually delete the case but set deleted = 1
function delCase()
{
	var	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		qn = $cell.eq(QN).html(),
		theatre = $cell.eq(THEATRE).html(),
		oproom = $cell.eq(OPROOM).html(),
		allCases, index,
		sql = "sqlReturnbook=UPDATE book SET "
			+ "deleted=1, "
			+ "editor = '" + gv.user
			+ "' WHERE qn="+ qn + ";"

	if (!qn) {
		$row.remove()
		return
	}

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
		index = allCases.indexOf(qn)
		allCases.splice(index, 1)

		for (var i=0; i<allCases.length; i++) {
			sql += sqlCaseNum(i + 1, allCases[i])
		}
	}

	Ajax(MYSQLIPHP, sql, callbackdeleterow)

	function callbackdeleterow(response)
	{
		if (typeof response === "object") {
			updateBOOK(response)
			if (tableID === "tbl") {
				refillOneDay(opdate)
				if ((isSplited()) && 
					(isStaffname(staffname))) {
					refillstaffqueue()
				}
			} else {
				if (isConsults()) {
					deleteRow($row, opdate)
				} else {
					$row.remove()
				}
				refillOneDay(opdate)
			}
		} else {
			Alert ("delCase", response)
		}
	}
}

function deleteRow($row, opdate)
{
	var prevDate = $row.prev().children("td").eq(OPDATE).html()
	var nextDate = $row.next().children("td").eq(OPDATE).html()

	prevDate = getOpdate(prevDate)
	nextDate = getOpdate(nextDate)

	if ((prevDate === opdate)
	|| (nextDate === opdate)
	|| $row.closest("tr").is(":last-child")) {
		$row.remove()
	} else {
		$row.children("td").eq(OPDATE).siblings().html("")
		$row.children("td").eq(HN).removeClass("pacs")
		$row.children("td").eq(PATIENT).removeClass("camera")
		$row.children('td').eq(STAFFNAME).html(showStaffOnCall(opdate))
	}
}

function splitPane()
{
	var scrolledTop = document.getElementById("tblcontainer").scrollTop
	var tohead = findVisibleHead('#tbl')
	var width = screen.availWidth
	var height = screen.availHeight

	$("#queuewrapper").show()
	$("#tblcontainer").css({"float":"left", "height":"100%", "width":"50%"})
	$("#queuewrapper").css({"float":"right", "height":"100%", "width":"50%"})
	initResize($("#tblcontainer"))
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))

	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead.offsetTop)
}

// remainSpace-margin-1 to prevent right pane disappear while resizing in Chrome 
function initResize($wrapper)
{
	$wrapper.resizable(
	{
		autoHide: true,
		handles: 'e',
		resize: function(e, ui) 
		{
			var parent = ui.element.parent();
			var remainSpace = parent.width() - ui.element.outerWidth()
			var divTwo = ui.element.next()
			var margin = divTwo.outerWidth() - divTwo.innerWidth()
			var divTwoWidth = (remainSpace-margin-1)/parent.width()*100+"%";
			divTwo.css("width", divTwoWidth);
		},
		stop: function(e, ui) 
		{
			var parent = ui.element.parent();
			var remainSpace = parent.width() - ui.element.outerWidth()
			var divTwo = ui.element.next()
			var margin = divTwo.outerWidth() - divTwo.innerWidth()
			ui.element.css(
			{
				width: ui.element.outerWidth()/parent.width()*100+"%",
			});
			ui.element.next().css(
			{
				width: (remainSpace-margin)/parent.width()*100+"%",
			});
		}
	});
}

function closequeue()
{
	var scrolledTop = document.getElementById("tblcontainer").scrollTop
	var tohead = findVisibleHead('#tbl')
	
	$("#queuewrapper").hide()
	$("#tblcontainer").css({
		"height": "100%", "width": "100%"
	})

	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead.offsetTop)
}

function fakeScrollAnimate(containerID, tableID, scrolledTop, offsetTop)
{
	var $container = $('#' + containerID)
	var $table = $('#' + tableID)
	var pixel = 300
	if ((scrolledTop > offsetTop) || (offsetTop < 300)) {
		pixel = -300
	}
	if ((offsetTop + $container.height()) < $table.height()) {
		$container.scrollTop(offsetTop - pixel)
		$container.animate({
			scrollTop: $container.scrollTop() + pixel
		}, 500);
	} else {
		$container.scrollTop(offsetTop)
	}	// table end
}

function findVisibleHead(table)
{
	var tohead,
        tablecontainer = $(table).closest('div')[0],
        tablescrolled = tablecontainer.scrollTop

	$.each($(table + ' tr'), function() {
		tohead = this
		return this.offsetTop < tablescrolled
	})
	return tohead
}
