
;(function($) {
	$.fn.fixMe = function($container) {
		var $this = $(this),
			$t_fixed,
			pad = $container.css("paddingLeft")
		init();
		$container.off("scroll").on("scroll", scrollFixed);

		function init() {
			$t_fixed = $this.clone();
			$t_fixed.removeAttr("id")
			$t_fixed.find("tbody").remove().end().addClass("fixed").insertBefore($this);
			$container.scrollTop(0)
			resizeFixed($t_fixed, $this);
			reposition($t_fixed, "left top", "left+" + pad + " top", $container)
			$t_fixed.hide()
		}

		function scrollFixed() {
			var offset = $(this).scrollTop(),
			tableTop = $this[0].offsetTop,
			tableBottom = tableTop + $this.height() - $this.find("thead").height();
			if(offset < tableTop || offset > tableBottom) {
				$t_fixed.hide();
			}
			else if (offset >= tableTop && offset <= tableBottom && $t_fixed.is(":hidden")) {
				$t_fixed.show();
			}
		}
	};
})(jQuery);

function resizeFixed($fix, $this) {
	var over = 0
	$fix.find("th").each(function(index) {
		var wide = $this.find("th").eq(index).width()
		over += (wide - Math.round(wide))
		if (Math.round(over)) {
			wide += 1
			over = 0
		}

		$(this).css("width", wide + "px")
	});
}

function winResizeFix($this, $container) {
	var $fix = $(".fixed"),
		hide = $fix.css("display") === "none",
		pad = $container.css("paddingLeft")

	resizeFixed($fix, $this)
	reposition($fix, "left top", "left+" + pad + " top", $container)
	hide && $fix.hide()
}

String.prototype.thDate = function () 
{	//MySQL date (2014-05-11) to Thai date (11 พค. 2557) 
	var date = this.split("-")
	if ((date.length === 1) || (date[0] < "1900")) {
		return false
	}
	var yyyy = Number(date[0]) + 543;
	var mm = THAIMONTH[Number(date[1]) - 1];
	return (date[2] +' '+ mm + yyyy);
} 

String.prototype.numDate = function () 
{	//Thai date (11 พค. 2557) to MySQL date (2014-05-11)
	var date = this.split(" ")
	if ((date.length === 1) || parseInt(date[1])) {
		return ""
	}
	var thmonth = date[1].slice(0, -4);
	var mm = THAIMONTH.indexOf(thmonth) + 1
	mm = (mm < 10? '0' : '') + mm
    var yyyy = Number(date[1].slice(-4)) - 543;
    return yyyy +"-"+ mm +"-"+ date[0];
} 

String.prototype.getAge = function (toDate)
{	//Calculate age at (toDate) (iso format) from birth date
	//with LARGESTDATE as today
	if (!toDate || this <= '1900-01-01') {
		return this
	}

	var birth = new Date(this);
	if (toDate === LARGESTDATE) {
		var today = new Date()
	} else {
		var today = new Date(toDate);
	}

	if (today.getTime() - birth.getTime() < 0)
		return "wrong date"

	var ayear = today.getFullYear();
	var amonth = today.getMonth();
	var adate = today.getDate();
	var byear = birth.getFullYear();
	var bmonth = birth.getMonth();
	var bdate = birth.getDate();

	var days = adate - bdate;
	var months = amonth - bmonth;
	var years = ayear - byear;
	if (days < 0)
	{
		months -= 1
		days = new Date(byear, bmonth+1, 0).getDate() + days;
	}
	if (months < 0)
	{
		years -= 1
		months += 12
	}

	var ageyears = years? years + Math.floor(months / 6)  + " ปี " : "";
	var agemonths = months? months + Math.floor(days / 15)  + " ด." : "";
	var agedays = days? days + " ว." : "";

	return years? ageyears : months? agemonths : agedays;
}

function getOpdate(date)	//change Thai date from table to ISO date
{
	if ((date === undefined) || (parseInt(date) === NaN)) {
		return ""
	}
	if (date === "") {
		return LARGESTDATE
	}
	return date.numDate()
}

function putOpdate(date)	//change date in book to show on table
{
	if (!date) { return date }
	if (date === LARGESTDATE) {
		return ""
	} else {
		return date.thDate()
	}
}

function putAgeOpdate(dob, date)
{
	if (!date || !dob) {
		return ""
	} else {
		return dob.getAge(date)
	}
}

function Ajax(url, params, callback)
{
	var http = new XMLHttpRequest();
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() 
	{
		if (http.readyState === 4 && http.status === 200) {
			callback(http.responseText);
		}
		if (/404|500|503|504/.test(http.status)) {
			callback(http.statusText);
		}
	}
	http.send(params);
}

function URIcomponent(qoute)	//necessary when post in http, not when export to excel
{
	if (qoute) {
		qoute = qoute.replace(/\s+$/,'')
		qoute = qoute.replace(/\"/g, "&#34;")	// double quotes
		qoute = qoute.replace(/\'/g, "&#39;")	// single quotes
//		qoute = qoute.replace(/%/g, "&#37;")	// per cent, mysql: like "%...%"
		qoute = qoute.replace(/\\/g, "\\\\")
		qoute = encodeURIComponent(qoute)
	}
	return qoute
}

function getMaxQN(book) {
	var qn = Math.max.apply(Math, $.map(book, function(row, i) {
			return row.qn
		}))
	return String(qn)
}

function getBOOKrowByQN(book, qn)
{  
	var bookq
	$.each(book, function() {
		bookq = this
		return (this.qn !== qn);
	})
	if (bookq.qn !== qn) {
		return null
	}
	return bookq
}

function getTableRowByQN(tableID, qn)
{
	var row
	$.each($("#" + tableID + " tr:has(td)"), function() {
		row = this
		return (this.cells[QN].innerHTML !== qn);
	})
	if (row.cells[QN].innerHTML !== qn) {
		return null
	}
	return row
}

function getTableRowsByDate(opdateth)
{
	return $('#tbl tr').filter(function() {
		return $(this).find("td").eq(OPDATE).html() === opdateth;
	})
}

function getBOOKrowsByDate(book, opdate)
{
	return book.filter(function(row) {
		return (row.opdate === opdate);
	})
}

function sameDateRoomTableQN(opdateth, room)
{
	if (!room) { return [] }

	var sameRoom = $('#tbl tr').filter(function() {
		return $(this).find("td").eq(OPDATE).html() === opdateth
			&& $(this).find("td").eq(ROOM).html() === room;
	})
	$.each(sameRoom, function(i) {
		sameRoom[i] = $(this).find("td").eq(QN).html()
	})
	return $.makeArray(sameRoom)
}

function sameDateRoomBookQN(book, opdate, room)
{
	if (!room) { return [] }

	var sameRoom = book.filter(function(row) {
		return row.opdate === opdate && row.oproom === room;
	})
	$.each(sameRoom, function(i) {
		sameRoom[i] = this.qn
	})
	return sameRoom
}

function createThisdateTableRow(opdate, opdateth)
{
	var rows = getTableRowsByDate(opdate.nextdays(-1).thDate()),
		$row = $(rows[rows.length-1]),
		$thisrow = $row && $row.clone().insertAfter($row)

	$thisrow && $thisrow.find("td").eq(OPDATE).html(opdateth)

	return $thisrow
}

function isSplited()
{  
	return $("#queuewrapper").css("display") === "block"
}

function isStaffname(staffname)
{  
	return $('#titlename').html() === staffname
}

function isConsults()
{  
	return $('#titlename').html() === "Consults"
}

function ConsultsTbl(tableID)
{  
	var queuetbl = tableID === "queuetbl"
	var consult = $("#titlename").html() === "Consults"

	return queuetbl && consult
}

// waitnum is for ordering where there is no oproom, casenum
function calculateWaitnum(tableID, $thisrow, thisOpdate)
{
	var prevWaitNum = $thisrow.prev()[0]
	var nextWaitNum = $thisrow.next()[0]
	if (prevWaitNum) {
		prevWaitNum = Number(prevWaitNum.title)
	}
	if (nextWaitNum) {
		nextWaitNum = Number(nextWaitNum.title)
	}
	var $prevRowCell = $thisrow.prev().children("td")
	var $nextRowCell = $thisrow.next().children("td")
	var prevOpdate = $prevRowCell.eq(OPDATE).html()
	var nextOpdate = $nextRowCell.eq(OPDATE).html()
	var defaultWaitnum = (ConsultsTbl(tableID))? -1 : 1
	//Consults cases have negative waitnum

	if (prevOpdate !== thisOpdate && thisOpdate !== nextOpdate) {
		return defaultWaitnum
	}
	else if (prevOpdate === thisOpdate && thisOpdate !== nextOpdate) {
		return prevWaitNum + defaultWaitnum
	}
	else if (prevOpdate !== thisOpdate && thisOpdate === nextOpdate) {
		return nextWaitNum? (nextWaitNum / 2) : defaultWaitnum
	}
	else if (prevOpdate === thisOpdate && thisOpdate === nextOpdate) {
		return nextWaitNum? ((prevWaitNum + nextWaitNum) / 2) : (prevWaitNum + defaultWaitnum)
	}	// nextWaitNum is undefined in case of new blank row
}

function decimalToTime(dec)
{
	var time = [],
		integer = Math.floor(dec),
		decimal = dec - integer,
		time0 = "" + integer

	time[0] = (integer < 10)? "0" + time0 : time0
	time[1] = decimal? String(decimal * 60) : "00"
	return time.join(".")
}

function findPrevcell(event, editable, pointing) 
{
	var $prevcell = $(pointing)
	var column = $prevcell.index()

	if ((column = editable[($.inArray(column, editable) - 1)]))
	{
		$prevcell = $prevcell.parent().children("td").eq(column)
	}
	else
	{
		do {
			if ($prevcell.parent().index() > 1)
			{	//go to prev row last editable
				$prevcell = $prevcell.parent().prev("tr")
										.children().eq(editable[editable.length-1])
			}
			else
			{	//#tbl tr:1 td:1
				event.preventDefault()
				return false
			}
		}
		while (($prevcell.get(0).nodeName === "TH")
			|| (!$prevcell.is(':visible')))
				//invisible due to colspan
	}

	return $prevcell.get(0)
}

function findNextcell(event, editable, pointing) 
{
	var $nextcell = $(pointing)
	var column = $nextcell.index()

	if ((column = editable[($.inArray(column, editable) + 1)]))
	{
		$nextcell = $nextcell.parent().children("td").eq(column)
	}
	else
	{
		do {//go to next row first editable
			$nextcell = $($nextcell).parent().next("tr")
										.children().eq(editable[0])
			if (!($nextcell.length)) {
				event.preventDefault()
				return false
			}
		}
		while ((!$nextcell.is(':visible'))	//invisible due to colspan
			|| ($nextcell.get(0).nodeName === "TH"))	//TH row
	}

	return $nextcell.get(0)
}

function findNextRow(event, editable, pointing) 
{
	var $nextcell = $(pointing)

	//go to next row first editable
	do {
		$nextcell = $nextcell.parent().next("tr").children().eq(editable[0])
		if (!($nextcell.length)) {
			event.preventDefault()
			return false	
		}
	}
	while ((!$nextcell.is(':visible'))	//invisible due to colspan
		|| ($nextcell.get(0).nodeName === "TH"))	//TH row

	return $nextcell.get(0)
}
