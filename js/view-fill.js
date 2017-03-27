
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	if (BOOK.length == 0)
		BOOK.push({"opdate" : getSunday()})

	var start = new Date()
	start = new Date(start.getFullYear(), start.getMonth()-3).mysqlDate()
	start = getSunday(start)

	fillall(start)

	//scroll to today
	var today = new Date().mysqlDate().thDate()
	var thishead = $("tr:contains(" + today + ")").eq(0).prevAll(":has(th)").first()
	$('html, body').animate({
		scrollTop: thishead.offset().top
	}, 300);
	DragDrop()
}

function fillall(start)
{
	var table = document.getElementById("tbl")
	var i = k = q = 0
	var rowi = {}
	var date = ""
	var madedate

	date = start
	while ((q < BOOK.length) && (BOOK[q].opdate < start)) {
		q++
	}	

	//delete previous queuetbl lest it accumulates
	$('#tbl tr').slice(1).remove()

	//i for rows in table
	//q for rows in BOOK
	for (q; q < BOOK.length; q++)
	{	
		while (date < BOOK[q].opdate)
		{	//step over each day that is not in QBOOK
			if (date != madedate)
			{
				//make a blank row for matched opday which is not already in the table
				i++
				rowi = makenextrow(i, date)	//insertRow
				
				madedate = date
			}
			date = date.nextdays(1)
			//make table head row before every Sunday
			if ((new Date(date).getDay())%7 == 0)
			{
				var clone = table.getElementsByTagName("TR")[0].cloneNode(true)
				rowi.parentNode.appendChild(clone, rowi)
 				i++
			}
		}
		i++
		rowi = makenextrow(i, date)	//insertRow
		filldata(BOOK[q], rowi)
		madedate = date
	}
	//fill until 1 year from now
	var nextyear = new Date().getFullYear() + 1
	var month = new Date().getMonth()
	var todate = new Date().getDate()
	var until = (new Date(nextyear, month, todate)).mysqlDate()

	date = date.nextdays(1)
	while (date < until)
	{
		//make a blank row
		i++
		rowi = makenextrow(i, date)	//insertRow
		
		date = date.nextdays(1)
		//make table head row before every Sunday
		if (((new Date(date)).getDay())%7 == 0)
		{
			var clone = table.getElementsByTagName("TR")[0].cloneNode(true)
			rowi.parentNode.appendChild(clone, rowi)
			i++
		}
	}
}

function refillall()
{
	var table = document.getElementById("tbl")
	var rowi = {}
	var date = ""
	var madedate
	var start = $('#tbl tr:has("td"):first td').eq(OPDATE).html().numDate()
	var tlength = $('#tbl > tbody > tr').length

	date = start	//find this row in BOOK

	//q for rows in BOOK
	var q = 0
	while ((q < BOOK.length) && (BOOK[q].opdate < start)) {
		q++
	}	

	//i for rows in table with head as the first row
	var i = 1
	while (i < tlength)
	{
		if (q < BOOK.length) {
			while (date < BOOK[q].opdate)
			{	//step over each day that is not in QBOOK
				if (date != madedate)
				{
					//make a blank row for matched opday which is not already in the table
					rowi = makenextrow(table.rows[i], date)	//existing row
					i++
					if (i >= tlength)
						return
					
					madedate = date
				}
				date = date.nextdays(1)
				//make table head row before every Sunday
				if ((new Date(date).getDay())%7 == 0)
				{
					table.rows[i].innerHTML = table.getElementsByTagName("TR")[0].innerHTML
					i++
					if (i >= tlength)
						return
				}
			}
			rowi = makenextrow(table.rows[i], date)	//existing row
			filldata(BOOK[q], rowi)
			madedate = date
			i++
			q++
		}
		else
		{
			date = date.nextdays(1)

			//make table head row before every Sunday
			if (((new Date(date)).getDay())%7 == 0)
			{
				table.rows[i].innerHTML = $('#tbl tr:first').html()
				i++
				if (i >= tlength)
					return
			}

			//make a blank row
			rowi = makenextrow(table.rows[i], date)	//existing row
			i++
		}
	}
}

function makenextrow(i, date)
{
	var table = document.getElementById("tbl")
	var cols = table.rows[0].cells.length
	var datatitle = document.getElementById("datatitle")
	var row = datatitle.cloneNode(true)
	var rowi = table.appendChild(row)

	row.id = ""
	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
	rowi.style.backgroundImage = holiday(date)
	return rowi
}

function filldata(bookq, rowi)		//bookq = BOOK[q]
{
	rowi.cells[STAFFNAME].innerHTML = bookq.staffname
	rowi.cells[HN].innerHTML = bookq.hn
	rowi.cells[NAME].innerHTML = bookq.patient
	rowi.cells[AGE].innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
	rowi.cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	rowi.cells[TREATMENT].innerHTML = bookq.treatment
	rowi.cells[TEL].innerHTML = bookq.tel
	rowi.cells[QN].innerHTML = bookq.qn
}

function staffqueue(staffname)
{
	var todate = new Date().mysqlDate()
	var scrolled = $("#queuecontainer").scrollTop()

	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	$.each( BOOK, function() {	// each == this
		if (( this.staffname == staffname ) && this.opdate >= todate) {
			$('#qdatatitle tr').clone()
				.insertAfter($('#queuetbl tr:last'))
					.filldataQueue(this)
		}
	});

	$("#queuecontainer").scrollTop(scrolled)

	DragDropStaff()
}

jQuery.fn.extend({
	filldataQueue : function(bookq) {
		var rowcell = this[0].cells
		rowcell[OPDATE].innerHTML = bookq.opdate.thDate()
		rowcell[SINCE].innerHTML = bookq.qsince.thDate().slice(0,-4)
		rowcell[STAFFNAME].innerHTML = bookq.staffname
		rowcell[HN].innerHTML = bookq.hn
		rowcell[NAME].innerHTML = bookq.patient
		rowcell[AGE].innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
		rowcell[DIAGNOSIS].innerHTML = bookq.diagnosis
		rowcell[TREATMENT].innerHTML = bookq.treatment
		rowcell[TEL].innerHTML = bookq.tel
		rowcell[QN].innerHTML = bookq.qn
	}
})

function SplitPane()
{
	var tohead = findVisibleHead('html, body', '#tbl')

	$("html, body").css( {
		height: "100%",
		overflow: "hidden",
		margin: "0"
	})
	$("#queuecontainer").show()
	$("#tblcontainer").css("width", "60%")
	$("#queuecontainer").css("width", "40%")
	initResize("#tblcontainer")
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))

	$('#tblcontainer').scrollTop($(tohead).offset().top - 300)
	$('#tblcontainer').animate({
		scrollTop: $('#tblcontainer').scrollTop() + 300
	}, 500);
	DragDrop()
}

function closequeue()
{
	var tohead = findVisibleHead('html, body', '#tbl')
	
	$("html, body").css( {
		height: "",
		overflow: "",
		margin: ""
	})
	$("#tblcontainer").css("width", "100%")
	$("#queuecontainer").css("width", "0%")
	$("#queuecontainer").hide()
	$("#tblcontainer").resizable('destroy');

	$('html, body').scrollTop($(tohead).offset().top - 300)
	$('html, body').animate({
		scrollTop: $('html, body').scrollTop() + 300
	}, 500);
	DragDrop()
}

function findVisibleHead(container, table)
{
	var tohead
	var topscroll = $(container).scrollTop()

	$.each($(table + ' tr:has(th)'), function() {
		tohead = this
		return ($(this).offset().top < topscroll)
	})
	return tohead
}

function initResize(id)
{
	$(id).resizable(
	{
		autoHide: true,
		handles: 'e',
		resize: function(e, ui) 
		{
			var parent = ui.element.parent();
			var remainSpace = parent.width() - ui.element.outerWidth()
			var divTwo = ui.element.next()
			var margin = divTwo.outerWidth() - divTwo.innerWidth()
			var divTwoWidth = (remainSpace-margin)/parent.width()*100+"%";
			divTwo.css("width", divTwoWidth);
		},
		stop: function(e, ui) 
		{
			var parent = ui.element.parent();
			var remainSpace = parent.width() - ui.element.outerWidth()
			var divTwo = ui.element.next()
			ui.element.css(
			{
				width: ui.element.outerWidth()/parent.width()*100+"%",
			});
			ui.element.next().css(
			{
				width: remainSpace/parent.width()*100+"%",
			});
		}
	});
}

function holiday(date)
{
	var monthdate = date.substring(5)
	var dayofweek = (new Date(date)).getDay()
	var holidayname = ""

	for (var key in HOLIDAY) 
	{
		if (key == date)
			return HOLIDAY[key]	//matched a holiday
		if (key > date)
			break		//not a listed holiday
						//either a fixed or a compensation holiday
	}
	switch (monthdate)
	{
	case "12-31":
		holidayname = "url('pic/Yearend.jpg')"
		break
	case "01-01":
		holidayname = "url('pic/Newyear.jpg')"
		break
	case "01-02":
		if ((dayofweek == 1) || (dayofweek == 2))
			holidayname = "url('pic/Yearendsub.jpg')"
		break
	case "01-03":
		if ((dayofweek == 1) || (dayofweek == 2))
			holidayname = "url('pic/Newyearsub.jpg')"
		break
	case "04-06":
		holidayname = "url('pic/Chakri.jpg')"
		break
	case "04-07":
	case "04-08":
		if (dayofweek == 1)
			holidayname = "url('pic/Chakrisub.jpg')"
		break
	case "04-13":
	case "04-14":
	case "04-15":
		holidayname = "url('pic/Songkran.jpg')"
		break
	case "04-16":
	case "04-17":
		if (dayofweek && (dayofweek < 4))
			holidayname = "url('pic/Songkransub.jpg')"
		break
	case "05-05":
		holidayname = "url('pic/Coronation.jpg')"
		break
	case "05-06":
	case "05-07":
		if (dayofweek == 1)
			holidayname = "url('pic/Coronationsub.jpg')"
		break
	case "08-12":
		holidayname = "url('pic/Queen.jpg')"
		break
	case "08-13":
	case "08-14":
		if (dayofweek == 1)
			holidayname = "url('pic/Queensub.jpg')"
		break
	case "10-23":
		holidayname = "url('pic/Piya.jpg')"
		break
	case "10-24":
	case "10-25":
		if (dayofweek == 1)
			holidayname = "url('pic/Piyasub.jpg')"
		break
	case "12-05":
		holidayname = "url('pic/King.jpg')"
		break
	case "12-06":
	case "12-07":
		if (dayofweek == 1)
			holidayname = "url('pic/Kingsub.jpg')"
		break
	case "12-10":
		holidayname = "url('pic/Constitution.jpg')"
		break
	case "12-11":
	case "12-12":
		if (dayofweek == 1)
			holidayname = "url('pic/Constitutionsub.jpg')"
		break
	}
	return holidayname
}
