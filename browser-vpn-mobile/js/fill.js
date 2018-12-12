// Display all cases in each day of the week
// Find the 1st of last month
// fill until 10 days from now
function fillupstart()
{
	var	table = document.getElementById("tbl"),
		today = new Date(),
		start = getStart(),
		end = today.setDate(today.getDate() + 10),
		until = new Date(end).ISOdate(),
		book = gv.BOOK,
		todate = today.ISOdate()

	if (book.length === 0) { book.push({"opdate" : todate}) }
	
	fillall(book, table, start, until)

//	hoverMain()
}

// Display from fillupstart to 1 year from now
function fillupfinish()
{
	let	table = document.getElementById("tbl"),
		today = new Date(),
		begin = today.setDate(today.getDate() + 11),
		start = new Date(begin).ISOdate(),
		nextyear = today.getFullYear() + 1,
		month = today.getMonth(),
		date = today.getDate(),
		until = (new Date(nextyear, month, date)).ISOdate(),
		book = gv.BOOK,
		todate = today.ISOdate()

	fillall(book, table, start, until, table.rows.length-1)
}

function fillall(book, table, start, until)
{
	var tbody = table.getElementsByTagName("tbody")[0],
		rows = table.rows,
		head = table.rows[0],
		date = start,
		madedate,
		q = findStartRowInBOOK(book, start),
		k = findStartRowInBOOK(book, LARGESTDATE)

	// get rid of cases with unspecified opdate
	// Consult cases and new start have no LARGESTDATE, so k = -1
	if (k >= 0) {
		book = book.slice(0, k)
	}

	//i for rows in table (with head as the first row)
	var i = 0
	var blen = book.length

	for (q; q < blen; q++)
	{	
		//step over each day that is not in QBOOK
		while (date < book[q].opdate)
		{
			if (date !== madedate)
			{
				//make a blank row for each day which is not in book
				makenextrow(table, date)	//insertRow
				i++
				
				madedate = date
			}
			date = date.nextdays(1)
			if (date > until) {
				return
			}

			//make table head row before every Monday
			if ((new Date(date).getDay())%7 === 1)
			{
				var clone = head.cloneNode(true)
				tbody.appendChild(clone)
 				i++
			}
		}
		makenextrow(table, date)
		i++
		filldata(book[q], rows[i])
		madedate = date
	}

	while (date < until)
	{
		date = date.nextdays(1)

		//make table head row before every Monday
		if (((new Date(date)).getDay())%7 === 1)
		{
			var clone = head.cloneNode(true)
			tbody.appendChild(clone)
		}
		//make a blank row
		makenextrow(table, date)	//insertRow
	}
}

function refillall()
{
	var book = gv.BOOK,
		table = document.getElementById("tbl"),
		$tbody = $("#tbl tbody"),
		start = $('#tbl tr:has("td")').first().find('td').eq(OPDATE).html().numDate(),
		until = $('#tbl tr:has("td")').last().find('td').eq(OPDATE).html().numDate()

	$tbody.html($tbody.find("tr:first").clone())
	fillall(book, table, start, until)
	hoverMain()
}

// main table (#tbl) only
// others would refill entire table
function refillOneDay(opdate)
{
	if (opdate === LARGESTDATE) { return }
	var book = gv.BOOK,
		opdateth = putThdate(opdate),
		opdateBOOKrows = getBOOKrowsByDate(book, opdate),
		$opdateTblRows = getTableRowsByDate(opdateth),
		bookRows = opdateBOOKrows.length,
		tblRows = $opdateTblRows.length,
		$cells, staff

	// Occur when dragging the only row of a date to somewhere else
	if (!tblRows) {
		createThisdateTableRow(opdate, opdateth)
		$opdateTblRows = getTableRowsByDate(opdateth)
		tblRows = $opdateTblRows.length
	}

	if (!bookRows) {
		while ($opdateTblRows.length > 1) {
			$opdateTblRows.eq(0).remove()
			$opdateTblRows = getTableRowsByDate(opdateth)
		}
		$opdateTblRows.attr("title", "")
		$opdateTblRows.prop("class", dayName(NAMEOFDAYFULL, opdate))
		$cells = $opdateTblRows.eq(0).children("td")
		$cells.eq(OPDATE).siblings().html("")
		$cells.eq(OPDATE).prop("class", dayName(NAMEOFDAYABBR, opdate))
		$cells.eq(STAFFNAME).html(showStaffOnCall(opdate))
		$cells.eq(HN).removeClass("pacs")
		$cells.eq(PATIENT).removeClass("camera")
		$cells.eq(DIAGNOSIS).css("backgroundImage", holiday(opdate))
	} else {
		if (tblRows > bookRows) {
			while ($opdateTblRows.length > bookRows) {
				$opdateTblRows.eq(0).remove()
				$opdateTblRows = getTableRowsByDate(opdateth)
			}
		}
		else if (tblRows < bookRows) {
			while ($opdateTblRows.length < bookRows) {
				$opdateTblRows.eq(0).clone().insertAfter($opdateTblRows.eq(0))
				$opdateTblRows = getTableRowsByDate(opdateth)
			}
		}
		$.each(opdateBOOKrows, function(key, val) {
			rowDecoration($opdateTblRows[key], this.opdate)
			filldata(this, $opdateTblRows[key])
			staff = $opdateTblRows[key].cells[STAFFNAME].innerHTML
			// on call <p style..>staffname</p>
			if (staff && /<p[^>]*>.*<\/p>/.test(staff)) {
				$opdateTblRows[key].cells[STAFFNAME].innerHTML = ""
			}
		})
	}
}

//create and decorate new row
function makenextrow(table, date)
{
	var	tbody = table.getElementsByTagName("tbody")[0],
		tblcells = document.getElementById("tblcells"),
		row = tblcells.rows[0].cloneNode(true),
		rowi = tbody.appendChild(row)

	rowDecoration(rowi, date)
}

function dayName(DAYNAME, date)
{
	return date === LARGESTDATE
		? ""
		: DAYNAME[(new Date(date)).getDay()]
}

function fillblank(rowi)
{
	var cells = rowi.cells
	cells[THEATRE].innerHTML = ""
	cells[OPROOM].innerHTML = ""
	cells[OPTIME].innerHTML = ""
	cells[CASENUM].innerHTML = ""
	cells[STAFFNAME].innerHTML = ""
	cells[HN].innerHTML = ""
	cells[HN].className = ""
	cells[PATIENT].innerHTML = ""
	cells[PATIENT].className = ""
	cells[DIAGNOSIS].innerHTML = ""
	cells[TREATMENT].innerHTML = ""
	cells[EQUIPMENT].innerHTML = ""
	cells[CONTACT].innerHTML = ""
	cells[QN].innerHTML = ""
}

function filldata(bookq, row)
{
	var cells = row.cells

	row.title = bookq.waitnum
	if (bookq.hn && gv.isPACS) { cells[HN].className = "pacs" }
	if (bookq.patient && gv.isMobile) { cells[PATIENT].className = "camera" }

	cells[THEATRE].innerHTML = bookq.theatre
	cells[OPROOM].innerHTML = bookq.oproom || ""
	cells[OPTIME].innerHTML = bookq.optime
	cells[CASENUM].innerHTML = bookq.casenum || ""
	cells[STAFFNAME].innerHTML = bookq.staffname
	cells[HN].innerHTML = bookq.hn
	cells[PATIENT].innerHTML = putNameAge(bookq)
	cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	cells[TREATMENT].innerHTML = bookq.treatment
	cells[EQUIPMENT].innerHTML = showEquip(bookq.equipment)
	cells[CONTACT].innerHTML = bookq.contact
	cells[QN].innerHTML = bookq.qn
}

function staffqueue(staffname)
{
	var	todate = new Date().ISOdate(),
		book = gv.BOOK,
		consult = gv.CONSULT,
		$queuetbl = $('#queuetbl'),
		queuetbl = $queuetbl[0]
		

	if (!isSplited()) { splitPane() }
	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()
	$queuetbl.find("tbody").html($("#tbl tbody tr:first").clone())

	if (staffname === "Consults") {
		if (consult.length === 0)
			consult.push({"opdate" : todate})

		var start = getStart()

		fillall(consult, queuetbl, start, todate)

		$("#queuecontainer").scrollTop($queuetbl.height())
	} else {
		$.each( book, function() {
			if (( this.staffname === staffname ) && this.opdate >= todate) {
				$('#tblcells tr').clone()
					.appendTo($("#queuetbl"))
						.filldataQueue(this)
			}
		});
	}

	hoverMain()
}

function refillstaffqueue()
{
	var today = new Date()
	var todate = today.ISOdate()
	var staffname = $('#titlename').html()
	var book = gv.BOOK
	var consult = gv.CONSULT

	if (!isSplited()) { return }

	if (staffname === "Consults") {
		//Consults table is rendered same as fillall
		$('#queuetbl tr').slice(1).remove()
		if (consult.length === 0)
			consult.push({"opdate" : todate})

		var table = document.getElementById("queuetbl")
		var start = (new Date((today).getFullYear(), (today).getMonth() - 1, 1)).ISOdate()

		fillall(consult, table, start, todate)
	} else {
		//render as staffqueue
		var i = 0
		$.each( book, function(q, each) {
			if ((this.opdate >= todate) && (this.staffname === staffname)) {
				i++
				if (i >= $('#queuetbl tr').length) {
					$('#tblcells tr').clone()
						.appendTo($('#queuetbl'))
							.filldataQueue(this)
				} else {
					$('#queuetbl tr').eq(i)
						.filldataQueue(this)
				}
			}
		})
		if (i < ($('#queuetbl tr').length - 1))
			$('#queuetbl tr').slice(i+1).remove()
	}
}

jQuery.fn.extend({
	filldataQueue : function(bookq) {
		var	$cells = this.find("td")

		this[0].title = bookq.waitnum
		addColor(this, bookq.opdate)
		$cells[OPDATE].className = dayName(NAMEOFDAYABBR, bookq.opdate)
		$cells[HN].className = (bookq.hn && gv.isPACS)? "pacs" : ""
		$cells[PATIENT].className = (bookq.patient && gv.isMobile)? "camera" : ""

		$cells[OPDATE].innerHTML = putThdate(bookq.opdate)
		$cells[OPROOM].innerHTML = bookq.oproom || ""
		$cells[CASENUM].innerHTML = bookq.casenum || ""
		$cells[STAFFNAME].innerHTML = bookq.staffname
		$cells[HN].innerHTML = bookq.hn
		$cells[PATIENT].innerHTML = putNameAge(bookq)
		$cells[DIAGNOSIS].innerHTML = bookq.diagnosis
		$cells[TREATMENT].innerHTML = bookq.treatment
		$cells[EQUIPMENT].innerHTML = showEquip(bookq.equipment)
		$cells[CONTACT].innerHTML = bookq.contact
		$cells[QN].innerHTML = bookq.qn
	}
})

// hover on background pics
function hoverMain()
{
	var	paleClasses = ["pacs", "camera"],
		boldClasses = ["pacs2", "camera2"]

	$("td.pacs, td.camera").mousemove(function(event) {
		if (inPicArea(event, this)) {
			getClass(this, paleClasses, boldClasses)
		} else {
			getClass(this, boldClasses, paleClasses)
		}
	})
	.mouseout(function (event) {
		getClass(this, boldClasses, paleClasses)
	})
}

function getClass(thiscell, fromClass, toClass)
{
	var	classname = thiscell.className,
		classes = classname.split(" "),
		oldClass = checkMatch(classes, fromClass)

	if (oldClass) {
		var hasIndex = fromClass.indexOf(oldClass),
			newClass = toClass[hasIndex]
		thiscell.className = classname.replace(oldClass, newClass)
	}
}

function checkMatch(classes, oldClasses)
{
	for (var i=0; i<classes.length; i++) {
		for (var j=0; j<oldClasses.length; j++) {
			if (classes[i] === oldClasses[j]) {
				return classes[i]
			}
		}
	}
}

function putNameAge(bookq)
{
	return bookq.patient
		+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
}

function addColor($this, bookqOpdate) 
{
	var predate = $this.prev().children("td").eq(OPDATE).html(),
		prevdate = (predate? predate.numDate() : ""),
		prevIsOdd = $this.prev().prop("class").indexOf("odd") >= 0,
		samePrevDate = bookqOpdate === prevdate

	// clear colored NAMEOFDAYFULL row that is moved to non-color opdate
	$this.prop("class", "")
	if ((!samePrevDate && !prevIsOdd) || (samePrevDate && prevIsOdd)) {
		$this.addClass("odd")
	}
	// In LARGESTDATE, prevdate = "" but bookqOpdate = LARGESTDATE
	// So LARGESTDATE cases are !samePrevDate, thus has alternate colors
}

function holiday(date)
{
	var	monthdate = date.substring(5),
		dayofweek = (new Date(date)).getDay(),
		holidayname = "",
		Mon = (dayofweek === 1),
		Tue = (dayofweek === 2),
		Wed = (dayofweek === 3),
		holiday = $.grep(gv.HOLIDAY, function(day) {
			return day.holidate === date
		})[0]

	if (date === LARGESTDATE) { return }
	if (holiday) {
		return "url('css/pic/holiday/" + holiday.dayname + ".png')"
	}

	switch (monthdate)
	{
	case "12-31":
		holidayname = "Yearend"
		break
	case "01-01":
		holidayname = "Newyear"
		break
	case "01-02":
		if (Mon || Tue)
			holidayname = "Yearendsub"
		break
	case "01-03":
		if (Mon || Tue)
			holidayname = "Newyearsub"
		break
	case "04-06":
		holidayname = "Chakri"
		break
	case "04-07":
	case "04-08":
		if (Mon)
			holidayname = "Chakrisub"
		break
	case "04-13":
	case "04-14":
	case "04-15":
		holidayname = "Songkran"
		break
	case "04-16":
	case "04-17":
		if (Mon || Tue || Wed)
			holidayname = "Songkransub"
		break
	case "07-28":
		holidayname = "King10"
		break
	case "07-29":
	case "07-30":
		if (Mon)
			holidayname = "King10sub"
		break
	case "08-12":
		holidayname = "Queen"
		break
	case "08-13":
	case "08-14":
		if (Mon)
			holidayname = "Queensub"
		break
	case "10-13":
		holidayname = "King09"
		break
	case "10-14":
	case "10-15":
		if (Mon)
			holidayname = "King09sub"
		break
	case "10-23":
		holidayname = "Piya"
		break
	case "10-24":
	case "10-25":
		if (Mon)
			holidayname = "Piyasub"
		break
	case "12-05":
		holidayname = "King9"
		break
	case "12-06":
	case "12-07":
		if (Mon)
			holidayname = "King9sub"
		break
	case "12-10":
		holidayname = "Constitution"
		break
	case "12-11":
	case "12-12":
		if (Mon)
			holidayname = "Constitutionsub"
		break
	}
	return "url('css/pic/holiday/" + holidayname +".png')"
}
