
function oneRowMenu()
{
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		prevDate = $row.prev().find("td").eq(OPDATE).html() || ""
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		patient = $cell.eq(PATIENT).html(),
		qn = $cell.eq(QN).html(),
		notLARGE = (opdate !== LARGESTDATE)

	enable(qn, "#addrow")

	let postpone = qn && staffname && notLARGE
	if (postpone) {
		$("#postponecase").html("<b>Confirm เลื่อน ไม่กำหนดวัน  </b><br>" + patient)
	}
	enable(postpone, "#postpone")

	enable(qn, "#changedate")

	enable(qn, "#history")

	let Delete = qn || prevDate === opdateth
	if (Delete) {
		$("#delcase").html("<b>Confirm Delete </b><br>" + patient)
	}
	enable(Delete, "#delete")

	enable(true, "#EXCEL")

	enable(true, "#LINE")
}

function disableOneRowMenu()
{
	let ids = ["#addrow", "#postpone", "#changedate", "#history", "#delete"]

	ids.forEach(function(each) {
		enable(false, each)
	})
}

function disableExcelLINE()
{
	$("#EXCEL").addClass("disabled")
	$("#LINE").addClass("disabled")
}

function enable(able, id)
{
	if (able) {
		$(id).removeClass("disabled")
	} else {
		$(id).addClass("disabled")
	}
}

function addnewrow()
{
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		keepcell = tableID === "tbl" ? OPDATE : STAFFNAME,
		$clone = $row.clone()

	$clone.removeClass("selected")
		.insertAfter($row)
			.find("td").eq(HN).removeClass("pacs")
			.parent().find("td").eq(PATIENT).removeClass("upload")
			.parent().find("td").eq(keepcell)
				.nextAll()
					.html("")
    clearSelection()
	createEditcell($clone.find("td")[HN])
}

async function postponeCase()
{
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		qn = $cell.eq(QN).html(),
		theatre = $cell.eq(THEATRE).html(),
		oproom = $cell.eq(OPROOM).html(),
		allCases,
		index,
		sql = "sqlReturnbook="

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
		index = allCases.indexOf(qn)
		allCases.splice(index, 1)
		sql += updateCasenum(allCases)
	}

	waitnum = getLargestWaitnum(staffname) + 1

	sql += "UPDATE book SET opdate='" + LARGESTDATE
		+ "',waitnum=" + waitnum
		+ ",theatre='',oproom=null,casenum=null,optime=''"
		+ ",editor='" + gv.user
        + "' WHERE qn="+ qn + ";"

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response)
		refillOneDay(opdate)
		if ((isSplit()) && 
			(isStaffname(staffname))) {
			// changeDate of this staffname's case
			refillstaffqueue()
		}
		scrolltoThisCase(qn)
	} else {
		Alert ("postpone", response)
	}

    clearSelection()
}

// The second parameter (, 0) ensure a default value if arrayAfter.map is empty
function getLargestWaitnum(staffname)
{
	let dateStaff = gv.BOOK.filter(function(patient) {
		return patient.staffname === staffname && patient.opdate === LARGESTDATE
	})

	return Math.max(...dateStaff.map(patient => patient.waitnum), 0)
}

function changeDate()
{
	let	$selected = $(".selected"),
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
}

function overDate() { $(this).addClass("pasteDate") }

function outDate() { $(this).removeClass("pasteDate") }

// args = [$row, opdateth, opdate, staffname, qn]
async function clickDate(event)
{
	let args = event.data,
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

	// remove itself from old sameDateRoom
	allOldCases = sameDateRoomTableQN(moveOpdateth, moveroom, movetheatre)
					.filter(e => e !== moveQN);

	// remove itself in new sameDateRoom, in case new === old
	allNewCases = sameDateRoomTableQN(thisOpdateth, thisroom, thistheatre)
					.filter(e => e !== moveQN);

	// insert itself into new sameDateRoom after the clicked row
	thisindex = allNewCases.indexOf(thisqn)
	allNewCases.splice(thisindex + 1, 0, moveQN)

	event.stopPropagation()
	clearMouseoverTR()
	// click the same case
	if (thisqn === moveQN) { return }

	sql += updateCasenum(allOldCases)

	for (let i=0; i<allNewCases.length; i++) {
		if (allNewCases[i] === moveQN) {
			casenum = thisroom? (i + 1) : null
			sql += sqlMover(thisWaitnum, thisOpdate, thisroom || null, casenum, moveQN)
		} else {
			sql += sqlCaseNum(i + 1, allNewCases[i])
		}
	}

	if (!sql) { return }
	sql = "sqlReturnbook=" + sql

    clearSelection()

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response);
		if (moveOpdateth) {
			refillOneDay(moveOpdate)
		}
		if (moveOpdate !== thisOpdate) {
			refillOneDay(thisOpdate)
		}
		if (isSplit()) {
			let titlename = $('#titlename').html()
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

function clearMouseoverTR()
{
	$("#tbl tr:has('td'), #queuetbl tr:has('td')").off({
		"mouseover": overDate,
		"mouseout": outDate,
		"click": clickDate
	})
	$(".pasteDate").removeClass("pasteDate")
	$(".changeDate").removeClass("changeDate")
}

// not actually delete the case but set deleted = 1
async function delCase()
{
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		qn = $cell.eq(QN).html(),
		theatre = $cell.eq(THEATRE).html(),
		oproom = $cell.eq(OPROOM).html(),
		allCases, index, sql

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
		sql += updateCasenum(allCases)
	}

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response)
		if (tableID === "tbl") {
			refillOneDay(opdate)
			if ((isSplit()) && 
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

	clearSelection()
}

function deleteRow($row, opdate)
{
	let prevDate = $row.prev().children("td").eq(OPDATE).html()
	let nextDate = $row.next().children("td").eq(OPDATE).html()

	prevDate = getOpdate(prevDate)
	nextDate = getOpdate(nextDate)

	if ((prevDate === opdate)
	|| (nextDate === opdate)
	|| $row.closest("tr").is(":last-child")) {
		$row.remove()
	} else {
		$row.children("td").eq(OPDATE).siblings().html("")
		$row.children("td").eq(HN).removeClass("pacs")
		$row.children("td").eq(PATIENT).removeClass("upload")
		$row.children('td').eq(STAFFNAME).html(showStaffOnCall(opdate))
	}
}

function findVisibleHead(table)
{
	let tohead,
        tablecontainer = $(table).closest('div')[0],
        tablescrolled = tablecontainer.scrollTop

	$.each($(table + ' tr'), function() {
		tohead = this
		return this.offsetTop < tablescrolled
	})
	return tohead
}
