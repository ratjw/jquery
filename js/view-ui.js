
function DragDrop(event)
{
	$("#tbl tr").draggable({
		helper: "clone",
		revert: "invalid",
		appendTo: "body",
		stack: ".ui-draggable",
		zIndex: 100,
		start : function () {
			$("editcell").attr("id", "")
			event.stopPropagation()
		}
	});

	$("#tbl tr").droppable({
		accept: "#tbl tr, #tblday tr, #queuetbl tr",
		drop: function (event, ui) {
			event.stopPropagation()

			if(ui.helper.is(".dropped"))
				return false;
			ui.helper.addClass(".dropped");

			if (!$(this).children("td").eq(OPDATE).html())		//drop on header
				return

			$("#tbl").css("cursor", 'wait')
			var that_row = ui.draggable
			var this_row = $(this)
			var uihelper = ui.helper
			var prevdate
			var nextdate
			var dragTable = $(ui.draggable).closest("table").attr("id")
			var thatdate = $(ui.draggable).children("td").eq(OPDATE).html().numDate()
			var thisdate = $(this).children("td").eq(OPDATE).html().numDate()
			var thisqn = $(this).children("td").eq(QN).html()

			if (dragTable == "queuetbl") 
			{
				var thatqn = $(ui.draggable).children("td").eq(QQN).html()
				var sql = "sqlReturnbook=UPDATE book SET waitnum = NULL, "
				sql += "opdate='" + thisdate
				sql += "', editor='"+ THISUSER
				sql += "' WHERE qn="+ thatqn +";"
			}
			else if (dragTable == "tbl")
			{
				var thatqn = $(ui.draggable).children("td").eq(QN).html()
				var sql = "sqlReturnbook=UPDATE book SET opdate='" + thisdate
				sql += "', editor='"+ THISUSER
				sql += "' WHERE qn="+ thatqn +";"

				if (prevdate = $(ui.draggable).prev().children("td").eq(OPDATE).html()) 
					prevdate = prevdate.numDate()
				if (nextdate = $(ui.draggable).next().children("td").eq(OPDATE).html())
					nextdate = nextdate.numDate()
			}

			Ajax(MYSQLIPHP, sql, callbackmove);

			function callbackmove(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
				}
				else
				{
					updateBOOK(response);
					if (prevdate == thatdate || thatdate == nextdate)
						that_row.remove()
					else if (dragTable == "queuetbl")
					{
						var staffname = $( "#container" ).dialog( "option", "title" )
						staffqueue(staffname)
					}

					if (thisqn)
						this_row.after(this_row.clone());

					filluprefill()
					DragDrop(event)
				}
				$("#tbl").css("cursor", 'default')
			}	
		}
	});
}

function DragDropday(event)
{
	$("#tblday tr").draggable({
		helper: "clone",
		revert: "invalid",
		appendTo: "body",
		stack: ".ui-draggable",
		zIndex: 100,
		start : function () {
			$("editcell").attr("id", "")
			event.stopPropagation()
		}
	});

	$("#tblday tr").droppable({
		accept: "#tbl tr, #tblday tr",
		drop: function (event, ui) {
			event.stopPropagation()

			if (!$(this).children("td").eq(OPDATE).html())
				return true

			$("#tbl").css("cursor", 'wait')
			var that_row = ui.draggable
			var this_row = $(this)
			var uihelper = ui.helper
			var prevdate
			var nextdate
			var dragTable = $(ui.draggable).closest("table").attr("id")
			var thatdate = $(ui.draggable).children("td").eq(OPDATE).html().numDate()
			var thisdate = $(this).children("td").eq(OPDATE).html().numDate()
			var thisqn = $(this).children("td").eq(QN).html()

			if (dragTable == "queuetbl") 
			{
				var thatqn = $(ui.draggable).children("td").eq(QQN).html()
				var sql = "sqlReturnbook=UPDATE book SET waitnum = NULL, "
				sql += "opdate='" + thisdate
				sql += "', editor='"+ THISUSER
				sql += "' WHERE qn="+ thatqn +";"

				prevdate = thatdate
				nextdate = thatdate
			}
			else if (dragTable == "tbl")
			{
				var thatqn = $(ui.draggable).children("td").eq(QN).html()
				var sql = "sqlReturnbook=UPDATE book SET opdate='" + thisdate
				sql += "', editor='"+ THISUSER
				sql += "' WHERE qn="+ thatqn +";"

				if (prevdate = $(ui.draggable).prev().children("td").eq(OPDATE).html()) 
					prevdate = prevdate.numDate()
				if (nextdate = $(ui.draggable).next().children("td").eq(OPDATE).html())
					nextdate = nextdate.numDate()
			}

			Ajax(MYSQLIPHP, sql, callbackmove);

			function callbackmove(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
				}
				else
				{
					if (prevdate == thatdate || thatdate == nextdate)
						that_row.remove();				

					if (thisqn)
						this_row.after(this_row.clone());

					updateBOOK(response);
					filluprefill()
					DragDrop(event)
				}
				$("#tbl").css("cursor", 'default')
			}	
		}
	});
}

function DragDropStaff(event)
{
	$("#queuetbl tr").draggable({
		helper: "clone",
		revert: "invalid",
		appendTo: "body",
		stack: ".ui-draggable",
		zIndex: 100,
		tolerance: "pointer",
		start : function () {
			$("editcell").attr("id", "")
			event.stopPropagation()
			event.preventDefault()
		}
	});
	
	$("#queuetbl tr").droppable({
/*
	over:function(evt,ui){
    ui.draggable.attr('drg_time', this.drg_time = evt.timeStamp)
  },
  accept:function(draggeds){
    if(draggeds.attr('drg_time'))
    {
      return draggeds.attr('drg_time') == this.drg_time
    }
    return draggeds.hasClass('acceptable_classes_here')
  },
  out:function(evt,ui){
    // useless but cleaner
    ui.draggable.removeAttr('drg_time')
  }

	drop: function( event, ui ) {
       if(ui.helper.is(".dropped")) {
           return false;
       }
       ui.helper.addClass(".dropped");
    }

	hoverClass: 'dragHover',
    over:function(e,ui){
		$('#dropArea').droppable('disable').removeClass('ui-state-disabled dragHover');    
    },
    out:function(){
		$('#dropArea').droppable('enable').addClass('dragHover');
    }

		over: function(event, ui){
			ui.helper.addClass( "dropped" )
		},
		out: function(event, ui){
			ui.helper.removeClass( "dropped" )
		},
*/

		accept: "#tbl tr",
		drop: function (event, ui) {

			if (!$(this).children("td").eq(OPDATE).html())		//drop on header
				return

			var staffdrag = $(ui.draggable).children("td").eq(STAFFNAME).html()
			var staffname = $( "#container" ).dialog( "option", "title" )
			if (staffdrag != staffname)
				return
			var waitnum = findMAXwaitnum() + 1
			var todate = new Date().MysqlDate()
			var thatqn = $(ui.draggable).children("td").eq(QN).html()
			var sql = "sqlReturnbook=UPDATE book SET waitnum ="+ waitnum
			sql += ", opdate='" + todate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ thatqn +";"

			$("#tbl").css("cursor", 'wait')

			Ajax(MYSQLIPHP, sql, callbackmove);

			function callbackmove(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
				}
				else
				{
					updateBOOK(response);
					staffqueue(staffname)
					filluprefill()
					DragDrop(event)
				}
				$("#tbl").css("cursor", 'default')
			}	
		}
	});
}

function scrollUpDown()
{
	var tableheight = document.getElementById("tbl").offsetHeight
	var scrolly = Yscrolled()

	if (STATE[0] == "FILLUP")
	{ 
		if ($(window).scrollTop() < 2)
		{
			fillupscroll(-1)
		}
		else if (tableheight <= window.innerHeight + scrolly)
		{
			fillupscroll(+1)
		}
	}
}

function scrollview(table, dateclicked)
{
	var i, j, q
	var trow = table.rows
	var tlen = table.rows.length

	i = 1	//top row
	while ((i < tlen) && (trow[i].cells[OPDATE].innerHTML.numDate() != dateclicked))
		i++
	if (i == tlen)
		i--
	j = i + 1	//bottom row
	while ((j < tlen) && (trow[j].cells[OPDATE].innerHTML.numDate() == dateclicked))
		j++
	j--
	scrolltoview(trow[i], trow[j])
}

function scrolltoview(highpos, lowpos)
{
	var recthigh, rectlow
	var find = document.getElementById("finddiv")
	
	recthigh = highpos.getBoundingClientRect()
	rectlow = lowpos.getBoundingClientRect()
	if (rectlow.bottom > $(window).height())
	{
		$('#tbl, tbody').animate({
		  scrollTop: rectlow.bottom - $(window).height() + Yscrolled()
		}, 1250)
	}
	else if (find.style.display == "block")
	{
		high = find.offsetTop + find.offsetHeight
		if (recthigh.top < high)
		{
			$('#tbl, tbody').animate({
			  scrollTop: recthigh.top - high + Yscrolled()
			}, 1250)
		}
	}
	else if (recthigh.top < 0)
	{
		$('#tbl, tbody').animate({
          scrollTop: recthigh.top + Yscrolled()
        }, 1250)
	}
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
