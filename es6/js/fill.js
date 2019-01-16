// Display all cases in each day of the week
// from the 1st of last month until 20 days from now
function fillupstart()
{
	let	table = document.getElementById("tbl"),
		today = new Date(),
		start = getStart(),
		end = today.setDate(today.getDate() + 20),
		until = new Date(end).ISOdate(),
		book = gv.BOOK,
		todate = today.ISOdate()

	if (book.length === 0) { book.push({"opdate" : todate}) }
	
	fillall(book, table, start, until)
}

// Display from fillupstart to 2 year from now
function fillupfinish()
{
	let	table = document.getElementById("tbl"),
		today = new Date(),
		begin = today.setDate(today.getDate() + 21),
		start = new Date(begin).ISOdate(),
		nextyear = today.getFullYear() + 2,
		month = today.getMonth(),
		date = today.getDate(),
		until = (new Date(nextyear, month, date)).ISOdate(),
		book = gv.BOOK
	
	fillall(book, table, start, until, table.rows.length-1)

	hoverMain()
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

	// i for rows in table (with head as the first row)
	// i from fillupfinish = table.rows.length-1
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
	// For new row added to this table
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
		$cells.eq(PATIENT).removeClass("upload")
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
		row = tblcells.rows[0].cloneNode(true)

	row = tbody.appendChild(row)
	rowDecoration(row, date)
}

function dayName(DAYNAME, date)
{
	return date === LARGESTDATE
		? ""
		: DAYNAME[(new Date(date)).getDay()]
}

function fillblank(row)
{
	let cells = row.cells
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
	if (bookq.hn && gv.isPACS) { cells[HN].className = "pacs" }
	if (bookq.patient) { cells[PATIENT].className = "upload" }

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

	if (!isSplit()) { splitPane() }

	clearEditcell()
	hoverMain()
}

function refillstaffqueue()
{
	let today = new Date()
	let todate = today.ISOdate()
	let staffname = $('#titlename').html()
	let book = gv.BOOK
	let consult = gv.CONSULT

	if (!isSplit()) { return }

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
		$cells[HN].className = (bookq.hn && gv.isPACS)? "pacs" : ""
		$cells[PATIENT].className = (bookq.patient)? "upload" : ""

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
		"width": "50%"
	})
	$("#queuewrapper").show().css({
		"height": "100%" - menuHeight,
		"width": "50%"
	})
	$("#queuecontainer").css({
		"height": $("#tblcontainer").height() - titleHeight
	})

	initResize($("#tblwrapper"))
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))
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
}

// hover on background pics
function hoverMain()
{
	let	paleClasses = ["pacs", "upload"],
		boldClasses = ["pacs2", "upload2"]

	$("td.pacs, td.upload").mousemove(function(event) {
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
		$holidateth = $("#holidateth"),
		$holidayname = $("#holidayname"),
		holidaylist = '<option style="display:none"></option>'

	fillHoliday($holidaytbl)
	$dialogHoliday.dialog({
		title: "Holiday",
		closeOnEscape: true,
		modal: true,
		show: 200,
		hide: 200,
		width: 350,
		height: 600,
		buttons: [{
			text: "Save",
			id: "buttonHoliday",
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

	let $buttonHoliday = $("#buttonHoliday")
	$buttonHoliday.hide()

	// select date by calendar
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
			if ($holidayname.val()) {
				$buttonHoliday.show()
			}
		}
	})

	// option holidays Eng: Thai
	$.each(HOLIDAYENGTHAI, function(key, val) {
		holidaylist += `<option value="${key}">${val}</option>`
	})
	$holidayname.html(holidaylist)
	$holidayname.change(function() {
		if ($holidateth.val()) {
			$buttonHoliday.show()
		}
	})
}

function fillHoliday($holidaytbl)
{
	$holidaytbl.find('tr').slice(1).remove()

	$.each( gv.HOLIDAY, function(i) {
		$('#holidaycells tr').clone()
			.appendTo($holidaytbl.find('tbody'))
				.filldataHoliday(this)
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
		$("#buttonHoliday").hide()
		$(rows).each(function() {
			this.cells[DIAGNOSIS].style.backgroundImage = holiday(vdate)
		})
	} else {
		alert(response)
	}
}

function getHolidayEng(vname) {
	return Object.keys(HOLIDAYENGTHAI).find(key => HOLIDAYENGTHAI[key] === vname)
}

// Have to move $inputRow back and forth because datepicker is sticked to #holidateth
function holidayInputBack($inputRow)
{
	$("#holidateth").val("")
	$("#holidayname").val("")
	$('#holidayInput tbody').append($inputRow)
}

function holiday(date)
{
	if (date !== LARGESTDATE) {
		return religiousHoliday(date) || officialHoliday(date)
	}
}

// Thai official holiday & Compensation
function religiousHoliday(date)
{
	let relHoliday = gv.HOLIDAY.find(day => day.holidate === date)
	if (relHoliday) {
		return `url('css/pic/holiday/${relHoliday.dayname}.png')`
	}
}

// Thai official holiday & Compensation
function officialHoliday(date)
{
	let monthdate = date.substring(5),
		dayofweek = (new Date(date)).getDay(),
		Mon = (dayofweek === 1),
		Tue = (dayofweek === 2),
		Wed = (dayofweek === 3),
		Thai = {
			"12-31": "Yearend",
			"01-01": "Newyear",
			"01-02": (Mon || Tue) && "Yearendsub",
			"01-03": (Mon || Tue) && "Newyearsub",
			"04-06": "Chakri",
			"04-07": Mon && "Chakrisub",
			"04-08": Mon && "Chakrisub",
			"04-13": "Songkran",
			"04-14": "Songkran",
			"04-15": "Songkran",
			"04-16": (Mon || Tue || Wed) && "Songkransub",
			"04-17": (Mon || Tue || Wed) && "Songkransub",
			"07-28": "King10",
			"07-29": Mon && "King10sub",
			"07-30": Mon && "King10sub",
			"08-12": "Queen",
			"08-13": Mon && "Queensub",
			"08-14": Mon && "Queensub",
			"10-13": "King09",
			"10-14": Mon && "King09sub",
			"10-15": Mon && "King09sub",
			"10-23": "Piya",
			"10-24": Mon && "Piyasub",
			"10-25": Mon && "Piyasub",
			"12-05": "King9",
			"12-06": Mon && "King9sub",
			"12-07": Mon && "King9sub",
			"12-10": "Constitution",
			"12-11": Mon && "Constitutionsub",
			"12-12": Mon && "Constitutionsub"
		},
		govHoliday = Thai[monthdate]

	if (govHoliday) {
		return `url('css/pic/holiday/${govHoliday}.png')`
	}
}
