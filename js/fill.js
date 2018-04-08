
function fillupstart()
{	// Display all cases in each day of 5 weeks
	// Find the 1st of last month
	// fill until 1 year from now
	var today = new Date(),
		start = getStart(),
		nextyear = today.getFullYear() + 2,
		month = today.getMonth(),
		date = today.getDate(),
		until = (new Date(nextyear, month, date)).ISOdate(),
		book = gv.BOOK,
		table = document.getElementById("tbl"),
		todate = today.ISOdate(),
		todateth = todate.thDate()

	if (book.length === 0) { book.push({"opdate" : todate}) }
	
	fillall(book, table, start, until)

	//scroll to today
	var thishead = $("#tbl tr:contains(" + todateth + ")").eq(0)
	$('#tblcontainer').animate({
		scrollTop: thishead.offset().top
	}, 300);

	hoverMain()
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
		start = $('#tbl tr:has("td"):first td').eq(OPDATE).html().numDate(),
		until = $('#tbl tr:has("td"):last td').eq(OPDATE).html().numDate()

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
		$cells.eq(NAME).removeClass("camera")
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
			fillrowdate($opdateTblRows[key], this.opdate)
			filldata(this, $opdateTblRows[key])
			staff = $opdateTblRows[key].cells[STAFFNAME].innerHTML
			// on call <p style..>staffname</p>
			if (staff && /<p[^>]*>([^<]*)<\/p>/.test(staff)) {
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
		rowi = tbody.appendChild(row),
		cells = rowi.cells

	rowi.className = dayName(NAMEOFDAYFULL, date)
	cells[OPDATE].innerHTML = date.thDate()
	cells[OPDATE].className = dayName(NAMEOFDAYABBR, date)
	cells[DIAGNOSIS].style.backgroundImage = holiday(date)
}

//renew and decorate existing row
function fillrowdate(rowi, date)
{
	var tblcells = document.getElementById("tblcells")

	// Change TH to TD
	if (rowi.cells[OPDATE].nodeName !== "TD") {
		var row = tblcells.rows[0].cloneNode(true)
		rowi.parentNode.replaceChild(row, rowi)
		rowi = row
	}
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
	cells[ROOM].innerHTML = ""
	cells[CASENUM].innerHTML = ""
	cells[STAFFNAME].innerHTML = ""
	cells[HN].innerHTML = ""
	cells[HN].className = ""
	cells[NAME].innerHTML = ""
	cells[NAME].className = ""
	cells[DIAGNOSIS].innerHTML = ""
	cells[TREATMENT].innerHTML = ""
	cells[CONTACT].innerHTML = ""
	cells[QN].innerHTML = ""
}

function filldata(bookq, row)
{
	var cells = row.cells

	row.title = bookq.waitnum
	if (bookq.hn && gv.isPACS) {
		cells[HN].className = "pacs"
	}
	cells[NAME].className = bookq.patient? "camera" : ""
	cells[TREATMENT].className = bookq.treatment? "equip" : ""

	cells[ROOM].innerHTML = bookq.oproom || ""
	cells[CASENUM].innerHTML = putCasenumTime(bookq)
	cells[STAFFNAME].innerHTML = bookq.staffname
	cells[HN].innerHTML = bookq.hn
	cells[NAME].innerHTML = putNameAge(bookq)
	cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	cells[TREATMENT].innerHTML = bookq.treatment
	cells[CONTACT].innerHTML = bookq.contact
	cells[QN].innerHTML = bookq.qn
}

function staffqueue(staffname)
{
	var today = new Date(),
		todate = today.ISOdate(),
		book = gv.BOOK,
		consult = gv.CONSULT,
		$queuetbl = $('#queuetbl'),
		queuetbl = $queuetbl[0]
		

	if (!isSplited()) { splitPane() }
	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
//	$('#queuetbl tr').slice(1).remove()
	$queuetbl.find("tbody").html($("#tbl tbody tr:first").clone())

	//Consults cases are not in BOOK
	if (staffname === "Consults") {
		if (consult.length === 0)
			consult.push({"opdate" : todate})

		var start = getStart()

		fillall(consult, queuetbl, start, todate)

		var queueh = $queuetbl.height()
		$("#queuecontainer").scrollTop(queueh)
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
		var cells = this[0].cells
		this[0].title = bookq.waitnum
		addColor(this, bookq.opdate)
		cells[OPDATE].className = dayName(NAMEOFDAYABBR, bookq.opdate)
		cells[HN].className = (bookq.hn && gv.isPACS)? "pacs" : ""
		cells[NAME].className = bookq.patient? "camera" : ""

		cells[OPDATE].innerHTML = putThdate(bookq.opdate)
		cells[ROOM].innerHTML = bookq.oproom || ""
		cells[CASENUM].innerHTML = putCasenumTime(bookq)
		cells[STAFFNAME].innerHTML = bookq.staffname
		cells[HN].innerHTML = bookq.hn
		cells[NAME].innerHTML = putNameAge(bookq)
		cells[DIAGNOSIS].innerHTML = bookq.diagnosis
		cells[TREATMENT].innerHTML = bookq.treatment
		cells[CONTACT].innerHTML = bookq.contact
		cells[QN].innerHTML = bookq.qn
	}
})

// hover on background pics
function hoverMain()
{
	var	paleClasses = ["pacs", "camera", "equip"],
		boldClasses = ["pacs2", "camera2", "equip2"]

	$("td.pacs, td.camera, td.equip").mousemove(function(event) {
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

function putCasenumTime(bookq)
{
	return (bookq.casenum || "")
		+ (bookq.optime ? ("<br>" + bookq.optime) : "")
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
 
Date.prototype.ISOdate = function () 
{	// Javascript Date Object to MySQL date (2014-05-11)
    var yyyy = this.getFullYear();
    var mm = this.getMonth()+1;
	mm = (mm < 10)? "0"+mm : ""+mm;
    var dd = this.getDate();
	dd = (dd < 10)? "0"+dd : ""+dd;
    return yyyy + "-" + mm + "-" + dd;
} 

String.prototype.nextdays = function (days)
{	// ISOdate to be added or substract by days
	var morrow = new Date(this);
	morrow.setDate(morrow.getDate()+days);
	return morrow.ISOdate();
}

function holiday(date)
{
	var HOLIDAY = {
		"2018-03-01" : "url('css/pic/Magha.png')",
		"2018-05-09" : "url('css/pic/Ploughing.png')",
		"2018-05-29" : "url('css/pic/Vesak.png')",
		"2018-07-27" : "url('css/pic/Asalha.png')",
		"2018-07-28" : "url('css/pic/Vassa.png')",
		"2019-02-19" : "url('css/pic/Magha.png')",		//วันมาฆบูชา
		"2019-05-13" : "url('css/pic/Ploughing.png')",	//วันพืชมงคล
		"2019-05-18" : "url('css/pic/Vesak.png')",		//วันวิสาขบูชา
		"2019-05-20" : "url('css/pic/Vesaksub.png')",	//หยุดชดเชยวันวิสาขบูชา
		"2019-07-16" : "url('css/pic/Asalha.png')",		//วันอาสาฬหบูชา
		"2019-07-17" : "url('css/pic/Vassa.png')"		//วันเข้าพรรษา
		}
	var monthdate = date.substring(5)
	var dayofweek = (new Date(date)).getDay()
	var holidayname = ""
	var Mon = (dayofweek === 1)
	var Tue = (dayofweek === 2)
	var Wed = (dayofweek === 3)

	if (date === LARGESTDATE) { return }
	for (var key in HOLIDAY) 
	{
		if (key === date)
			return HOLIDAY[key]
		if (key > date)
			//Not a listed holiday. Neither a fixed nor a compensation holiday
			break
	}
	switch (monthdate)
	{
	case "12-31":
		holidayname = "url('css/pic/Yearend.png')"
		break
	case "01-01":
		holidayname = "url('css/pic/Newyear.png')"
		break
	case "01-02":
		if (Mon || Tue)
			holidayname = "url('css/pic/Yearendsub.png')"
		break
	case "01-03":
		if (Mon || Tue)
			holidayname = "url('css/pic/Newyearsub.png')"
		break
	case "04-06":
		holidayname = "url('css/pic/Chakri.png')"
		break
	case "04-07":
	case "04-08":
		if (Mon)
			holidayname = "url('css/pic/Chakrisub.png')"
		break
	case "04-13":
	case "04-14":
	case "04-15":
		holidayname = "url('css/pic/Songkran.png')"
		break
	case "04-16":
	case "04-17":
		if (Mon || Tue || Wed)
			holidayname = "url('css/pic/Songkransub.png')"
		break
	case "07-28":
		holidayname = "url('css/pic/King10.png')"
		break
	case "07-29":
	case "07-30":
		if (Mon)
			holidayname = "url('css/pic/King10sub.png')"
		break
	case "08-12":
		holidayname = "url('css/pic/Queen.png')"
		break
	case "08-13":
	case "08-14":
		if (Mon)
			holidayname = "url('css/pic/Queensub.png')"
		break
	case "10-13":
		holidayname = "url('css/pic/King09.png')"
		break
	case "10-14":
	case "10-15":
		if (Mon)
			holidayname = "url('css/pic/King09sub.png')"
		break
	case "10-23":
		holidayname = "url('css/pic/Piya.png')"
		break
	case "10-24":
	case "10-25":
		if (Mon)
			holidayname = "url('css/pic/Piyasub.png')"
		break
	case "12-05":
		holidayname = "url('css/pic/King9.png')"
		break
	case "12-06":
	case "12-07":
		if (Mon)
			holidayname = "url('css/pic/Kingsub.png')"
		break
	case "12-10":
		holidayname = "url('css/pic/Constitution.png')"
		break
	case "12-11":
	case "12-12":
		if (Mon)
			holidayname = "url('css/pic/Constitutionsub.png')"
		break
	}
	return holidayname
}
