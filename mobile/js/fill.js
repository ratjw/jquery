// Display all cases in each day of the week
// from the 1st of last month
// fill until 10 days from now
function fillupstart()
{
	let	table = document.getElementById("tbl"),
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

function fillall(book, table, start, until, num=0)
{
	let tbody = table.getElementsByTagName("tbody")[0],
		rows = table.rows,
		head = table.rows[0],
		date = start,
		madedate,
		q = findStartRowInBOOK(book, start),
		k = findStartRowInBOOK(book, LARGESTDATE)

	// get rid of cases with unspecified opdate (LARGESTDATE)
	// Consult cases have no LARGESTDATE, findStartRowInBOOK returns k = -1
	if (k >= 0) {
		book = book.slice(0, k)
	}

	//i for rows in table (with head as the first row)
	let i = num
	let blen = book.length

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
				let clone = head.cloneNode(true)
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
			let clone = head.cloneNode(true)
			tbody.appendChild(clone)
		}
		//make a blank row
		makenextrow(table, date)	//insertRow
	}
}

function refillall()
{
	let book = gv.BOOK,
		table = document.getElementById("tbl"),
		$tbody = $("#tbl tbody"),
		start = $('#tbl tr:has("td")').first().find('td').eq(OPDATE).html().numDate(),
		until = $('#tbl tr:has("td")').last().find('td').eq(OPDATE).html().numDate()

	$tbody.html($tbody.find("tr:first").clone())
	fillall(book, table, start, until)
	hoverMain()
	// For new HN added to this table
}

// main table (#tbl) only
// others would refill entire table
function refillOneDay(opdate)
{
	if (opdate === LARGESTDATE) { return }
	let book = gv.BOOK,
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
	let	tbody = table.getElementsByTagName("tbody")[0],
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
	let cells = rowi.cells
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
	let cells = row.cells

	row.title = bookq.waitnum
//	if (bookq.hn && gv.isPACS) { cells[HN].className = "pacs" }
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
	let	todate = new Date().ISOdate(),
		book = gv.BOOK,
		consult = gv.CONSULT,
		$queuetbl = $('#queuetbl'),
		queuetbl = $queuetbl[0]
		

	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()
	$queuetbl.find("tbody").html($("#tbl tbody tr:first").clone())

	if (staffname === "Consults") {
		if (consult.length === 0)
			consult.push({"opdate" : todate})

		let start = getStart()

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

	if (!isSplited()) { splitPane() }
	hoverMain()
}

function refillstaffqueue()
{
	let today = new Date()
	let todate = today.ISOdate()
	let staffname = $('#titlename').html()
	let book = gv.BOOK
	let consult = gv.CONSULT

	if (!isSplited()) { return }

	if (staffname === "Consults") {
		//Consults table is rendered same as fillall
		$('#queuetbl tr').slice(1).remove()
		if (consult.length === 0)
			consult.push({"opdate" : todate})

		let table = document.getElementById("queuetbl")
		let start = (new Date((today).getFullYear(), (today).getMonth() - 1, 1)).ISOdate()

		fillall(consult, table, start, todate)
	} else {
		//render as staffqueue
		let i = 0
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
		let	$cells = this.find("td")

		this[0].title = bookq.waitnum
		addColor(this, bookq.opdate)
		$cells[OPDATE].className = dayName(NAMEOFDAYABBR, bookq.opdate)
//		$cells[HN].className = (bookq.hn && gv.isPACS)? "pacs" : ""
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

function splitPane()
{
	let scrolledTop = document.getElementById("tblcontainer").scrollTop
	let tohead = findVisibleHead('#tbl')
	let menuHeight = $("#cssmenu").height()
	let titleHeight = $("#titlebar").height()

	$("#tblwrapper").css({
		"height": "100%" - menuHeight,
		"width": "20%"
	})
	$("#queuewrapper").show().css({
		"height": "100%" - menuHeight,
		"width": "80%"
	})
	$("#queuecontainer").css({
		"height": $("#tblcontainer").height() - titleHeight
	})

	initResize($("#tblwrapper"))
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))

//	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead.offsetTop)
}

// remainSpace-margin-1 to prevent right pane disappear while resizing in Chrome 
function initResize($container)
{
	$container.resizable(
	{
		autoHide: true,
		handles: 'e',
		resize: function(e, ui) 
		{
			let parent = ui.element.parent();
			let remainSpace = parent.width() - ui.element.outerWidth()
			let divTwo = ui.element.next()
			let margin = divTwo.outerWidth() - divTwo.innerWidth()
			let divTwoWidth = (remainSpace-margin-1)/parent.width()*100+"%";
			divTwo.css("width", divTwoWidth);
		},
		stop: function(e, ui) 
		{
			let parent = ui.element.parent();
			let remainSpace = parent.width() - ui.element.outerWidth()
			let divTwo = ui.element.next()
			let margin = divTwo.outerWidth() - divTwo.innerWidth()
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
	let scrolledTop = document.getElementById("tblcontainer").scrollTop
	let tohead = findVisibleHead('#tbl')
	
	$("#queuewrapper").hide()
	$("#tblwrapper").css({
		"height": "100%" - $("#cssmenu").height(),
		"width": "100%"
	})

//	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead.offsetTop)
}

// hover on background pics
function hoverMain()
{
	let	paleClasses = ["pacs", "camera"],
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
	let	classname = thiscell.className,
		classes = classname.split(" "),
		oldClass = checkMatch(classes, fromClass)

	if (oldClass) {
		let hasIndex = fromClass.indexOf(oldClass),
			newClass = toClass[hasIndex]
		thiscell.className = classname.replace(oldClass, newClass)
	}
}

function checkMatch(classes, oldClasses)
{
	for (let i=0; i<classes.length; i++) {
		for (let j=0; j<oldClasses.length; j++) {
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
	let predate = $this.prev().children("td").eq(OPDATE).html(),
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

function setHoliday()
{
	let	$dialogHoliday = $("#dialogHoliday"),
		$holidaytbl = $("#holidaytbl"),
		$holidateth = $("#holidateth")

	fillHoliday($holidaytbl)
	$dialogHoliday.dialog({
		title: "Holiday",
		closeOnEscape: true,
		modal: true,
		show: 200,
		hide: 200,
		width: 500,
		height: 600,
		buttons: [{
			text: "Save",
			click: function () {
				saveHoliday()
			}
		}],
		close: function() {
			let	$inputRow = $("#holidaytbl tr:has('input')")

			if ($inputRow.length) {
				holidayInputBack($inputRow)
			}
		}
	})
	$holidateth.datepicker({
		autoSize: true,
		dateFormat: "dd M yy",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		// use Short names to be consistent with the month converted by numDate()
		monthNamesShort: THAIMONTH,
		yearSuffix: new Date().getFullYear() +  543,
		beforeShow: function (input, inst) {
			if (inst.selectedYear) {
				// prevent using Buddhist year from <input>
				$(this).datepicker("setDate",
					new Date(inst.currentYear, inst.currentMonth, inst.currentDay))
			} else {
				$(this).datepicker("setDate", new Date())
			}
			$holidateth.one("click", function() {
				if (input.value) {
					$holidateth.val(input.value.slice(0, -4) + (inst.selectedYear + 543))
				}
			})
		},
		onChangeMonthYear: function (year, month, inst) {
			$(this).datepicker("setDate",
				new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay))
			inst.settings.yearSuffix = inst.selectedYear + 543
			$holidateth.val($holidateth.val().slice(0, -4) + (inst.selectedYear + 543))
		},
		onSelect: function (input, inst) {
			$holidateth.val(input.slice(0, -4) + (inst.selectedYear + 543))
		}
	})
}

function fillHoliday($holidaytbl)
{
	let	holidaylist = '<option style="display:none"></option>'

	$.each(HOLIDAYENGTHAI, function(key, val) {
		holidaylist += '<option value="' + key
					+ '">' + val
					+ '</option>'
	})
	document.getElementById("holidayname").innerHTML = holidaylist

	$holidaytbl.find('tr').slice(1).remove()

	$.each( gv.HOLIDAY, function(i) {
		$('#holidaycells tr').clone()
			.appendTo($holidaytbl.find('tbody'))
				.filldataHoliday(this)
		$holidaytbl.find("tbody tr:last td:last")
				.append($(".delholiday").eq(0).clone())
	});
}

jQuery.fn.extend({
	filldataHoliday : function(q) {
		let	cells = this[0].cells,
			data = [
				putThdate(q.holidate),
				HOLIDAYENGTHAI[q.dayname]
			]

		dataforEachCell(cells, data)
	}
})

function addHoliday()
{
	let	$dialogHoliday = $("#dialogHoliday"),
		$holidaytbl = $("#holidaytbl")

	// already has an <input> row
	if ($holidaytbl.find("input").length) { return }

	$holidaytbl.find("tbody")
		.append($("#holidayInput tr"))

	let	append = $holidaytbl.height(),
		height = $dialogHoliday.height()
	if (append > height) {
		$dialogHoliday.scrollTop(append - height)
	}
}

async function saveHoliday()
{
	let	vdateth = document.getElementById("holidateth").value,
		vdate = vdateth.numDate(),
		vname = document.getElementById("holidayname").value,
		rows = getTableRowsByDate(vdateth),

		sql = "sqlReturnData="
			+ "INSERT INTO holiday (holidate,dayname) VALUES('"
			+ vdate + "','"+ vname
			+ "');SELECT * FROM holiday ORDER BY holidate;"

	if (!vdate || !vname) { return }

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		gv.HOLIDAY = response
		holidayInputBack($("#holidateth").closest("tr"))
		fillHoliday($("#holidaytbl"))
		$(rows).each(function() {
			this.cells[DIAGNOSIS].style.backgroundImage = holiday(vdate)
		})
	} else {
		alert(response)
	}
}

async function delHoliday(that)
{
	let	$row = $(that).closest("tr")

	if ($row.find("input").length) {
		holidayInputBack($row)
	} else {
		let	$cell = $row.find("td"),
			vdateth = $cell[0].innerHTML,
			vdate = vdateth.numDate(),
			vname = $cell[1].innerHTML.replace(/<button.*$/, ""),
			rows = getTableRowsByDate(vdateth),
			holidayEng = getHolidayEng(vname),

			sql = "sqlReturnData=DELETE FROM holiday WHERE "
				+ "holidate='" + vdate
				+ "' AND dayname='" + holidayEng
				+ "';SELECT * FROM holiday ORDER BY holidate;"

		let response = await postData(MYSQLIPHP, sql)
		if (typeof response === "object") {
			gv.HOLIDAY = response
			$(rows).each(function() {
				this.cells[DIAGNOSIS].style.backgroundImage = ""
			})
			$row.remove()
		} else {
			alert(response)
		}
	}
}

function getHolidayEng(vname) {
	return Object.keys(HOLIDAYENGTHAI).find(function(key) {
		return HOLIDAYENGTHAI[key] === vname
	})
}

function holidayInputBack($inputRow)
{
	$("#holidateth").val("")
	$("#holidayname").val("")
	$('#holidayInput tbody').append($inputRow)
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
