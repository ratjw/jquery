function sortable()
{
	var prevplace
	var thisplace
	var sender

	$("#tbl tbody, #queuetbl tbody").sortable({
		items: "tr",
		connectWith: "#tbl tbody, #queuetbl tbody",
		forceHelperSize: true,
		forcePlaceholderSize: true,
		delay: 100,
		revert: true,
		start: function(e, ui){
			clearTimeout(TIMER);
			$('#menu').hide();
			$('#stafflist').hide();
			clearEditcell();
			ui.placeholder.innerHeight(ui.item.outerHeight())
			prevplace = ui.placeholder.index()
			thisplace = ui.placeholder.index()
			sender = ui.item.closest('table').attr('id')
			if ($("#tblwrapper").is('.ui-resizable')) {
				$("#tblwrapper").resizable("destroy")
			}
		},
		change: function(e, ui){
			prevplace = thisplace
			thisplace = ui.placeholder.index()
		},
		stop: function(e, ui){
			var $item = ui.item
			var $itemcell = $item.children("td")
			var receiver = $item.closest('table').attr('id')
			var staffname = $itemcell.eq(STAFFNAME).html()
			var titlename = $('#titlename').html()

			if ((sender == "tbl") && (receiver == "queuetbl")) {
				if ((titlename != "Consults") && (staffname != titlename)) {
					stopsorting()
					return false
				}
			}
				
			if (!$itemcell.eq(QN).html()) {
				stopsorting()
				return false
			}

			var $thisdrop
			var $previtem = $item.prev()
			var $nextitem = $item.next()
			if (!$previtem.length || $previtem.has('th').length) {
				$thisdrop = $nextitem
			} else {
				if (!$nextitem.length || $nextitem.has('th').length) {
					$thisdrop = $previtem
				} else {		//ui.offset (no '()') = helper position
					var helperpos = ui.offset.top
					var prevpos = $previtem.offset().top
					var thispos = $item.offset().top
					var nextpos = $nextitem.offset().top
					var nearprev = Math.abs(helperpos - prevpos)
					var nearplace = Math.abs(helperpos - thispos)
					var nearnext = Math.abs(helperpos - nextpos)
					var nearest = Math.min(nearprev, nearplace, nearnext)
					if (nearest == nearprev) 
						$thisdrop = $previtem
					if (nearest == nearnext) 
						$thisdrop = $nextitem
					if (nearest == nearplace) {
						if ((prevplace == thisplace) && (sender == receiver)) {
							stopsorting()	//same place as before sorting
							return false
						}
						if (prevplace < thisplace) {
							$thisdrop = $previtem
						} else {
							$thisdrop = $nextitem
						}
					}
				}
			}

			var thisOpdate = getOpdate($thisdrop.children("td").eq(OPDATE).html())
			var thisqn = $itemcell.eq(QN).html()
			var roomtime = checkRoomTime(receiver, $item, thisOpdate)
			if (roomtime.conflict) {
				alert("Cancel Sorting", roomtime.conflict)
				stopsorting()
				return false
			}
			var finalWaitnum = calculateWaitnum(receiver, $item, thisOpdate)			

			var sql = "sqlReturnbook=UPDATE book SET Waitnum = "+ finalWaitnum
			sql += ", opdate='" + thisOpdate
			if (roomtime.room) {
				sql += "', oproom='" + roomtime.room
				sql += "', optime='" + roomtime.time
			}
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ thisqn +";"

			Ajax(MYSQLIPHP, sql, callbacksortable);
			
			$item[0].title = finalWaitnum
			stopsorting()

			function callbacksortable(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Sortable", response)
					$("#tbl tbody" ).sortable( "cancel" )
				}
				else
				{
					updateBOOK(response)
					if (receiver == "tbl") {
						refillall(BOOK)
						if (($("#queuewrapper").css('display') == 'block')
							&& ((titlename == staffname)) || (titlename == "Consults")) {

							refillstaffqueue()
						}
					} else {	//receiver == "queuetbl"
						refillstaffqueue()
						refillall(BOOK)
					}
				}
			}
		}
	})
}

function stopsorting()
{
	TIMER = setTimeout("updating()",10000);	//poke next 10 sec.
	if (!$("#tblwrapper").is('.ui-resizable')) {
		initResize("#tblwrapper")
		$('.ui-resizable-e').css('height', $("#tbl").css("height"))
	}
	$('#editcell').hide()
	//after sorting, editcell was placed at row 0 column 1
	//and display at placeholder position in entire width
}

function checkRoomTime(receiver, $row, thisOpdate)
{
	var $thisRowCell = $row.children("td")
	var $prevRowCell = $row.prev().children("td")
	var $nextRowCell = $row.next().children("td")
	var prevOpdate = getOpdate($prevRowCell.eq(OPDATE).html())
	var nextOpdate = getOpdate($nextRowCell.eq(OPDATE).html())
	var thisroomtime = $thisRowCell.eq(ROOMTIME).html()
	thisroomtime = thisroomtime? thisroomtime.split("<br>") : ""
	var prevroomtime = $prevRowCell.eq(ROOMTIME).html()
	prevroomtime = prevroomtime? prevroomtime.split("<br>") : ""
	var nextroomtime = $nextRowCell.eq(ROOMTIME).html()
	nextroomtime = nextroomtime? nextroomtime.split("<br>") : ""
	var thisroom = thisroomtime[0]? thisroomtime[0].match(/\d+/)[0] : ""
	var thistime = thisroomtime[1]
	var prevroom = prevroomtime[0]? prevroomtime[0].match(/\d+/)[0] : ""
	var prevtime = prevroomtime[1]
	var nextroom = nextroomtime[0]? nextroomtime[0].match(/\d+/)[0] : ""
	var nexttime = nextroomtime[1]
	var roomtime = {
		"conflict": "",
		"room": "",
		"time": ""
	}

	if (thisroom) {
		if (prevOpdate == thisOpdate) {
			if (prevroom) {
				if (prevroom > thisroom) {
					roomtime.conflict = "<br><br>Room conflict with previous case"
				}
				if ((prevroom == thisroom) && (prevtime > thistime)) {
					roomtime.conflict = "<br><br>Time conflict with previous case"
				}
			}
		}
		if (thisOpdate == nextOpdate) {
			if (nextroom) {
				if (thisroom > nextroom) {
					roomtime.conflict = "<br><br>Room conflict with next case"
				}
				if ((thisroom == nextroom) && (thistime > nexttime)) {
					roomtime.conflict = "<br><br>Time conflict with next case"
				}
			}
		}
	} else {
		if (prevOpdate == thisOpdate) {
			if (prevroom) {
				roomtime.room = prevroomtime[0]
				roomtime.time = prevtime
			}
		}
		else if (thisOpdate == nextOpdate) {
			if (nextroom) {
				roomtime.room = nextroomtime[0]
				roomtime.time = nexttime
			}
		}
	}
	return roomtime
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
