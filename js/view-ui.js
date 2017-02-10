
function DragDrop()
{
	$("#tbl tr").draggable({
		helper: "clone",
		revert: true,
		start : function () {
			$("editcell").attr("id", "")
			hidePopup()
		}
	});

	$("#tbl tr").droppable({
		accept: "#tbl tr",
		drop: function (event, ui) {

			if (!$(this).children("td").eq(OPDATE).html())
				return true

			$("#tbl").css("cursor", 'wait')
			var that_row = ui.draggable
			var this_row = this
			var uihelper = ui.helper
			var prevdate
			var nextdate

			if (prevdate = $(ui.draggable).prev().children("td").eq(OPDATE).html()) 
				prevdate = prevdate.numDate()
			var thatdate = $(ui.draggable).children("td").eq(OPDATE).html().numDate()
			if (nextdate = $(ui.draggable).next().children("td").eq(OPDATE).html())
				nextdate = nextdate.numDate()
			var thatqn = $(ui.draggable).children("td").eq(QN).html()

			var thisdate = $(this).children("td").eq(OPDATE).html().numDate()
			var thisqn = $(this).children("td").eq(QN).html()
			var opdate = $(this).children("td").eq(OPDATE).html()	//Thai date

			$(uihelper).children("td").eq(OPDATE).html(opdate)
			$(uihelper).attr("class", $(this_row).attr("class"))
			$(uihelper).children("td").eq(OPDATE).attr("class", $(this_row)
						.children("td").eq(OPDATE).attr("class"))
			$(uihelper).css("position", "")

			var sql = "sqlReturnbook=UPDATE book SET opdate='" + thisdate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ thatqn +";"

			Ajax(MYSQLIPHP, sql, callbackmove);

			function callbackmove(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
				}
				else
				{

					if (prevdate != thatdate && thatdate != nextdate)
						filldeleterow(that_row.get(0))
					else
						$(that_row).remove();				

					if (thisqn)
						$(uihelper).insertAfter(this_row);
					else
						$(this_row).replaceWith(uihelper);				

					updateBOOK(response);
					updateBOOKFILL()
					fillselect(opdate.numDate())
					DragDrop()
				}
				$("#tbl").css("cursor", 'default')
			}	
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
