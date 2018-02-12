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
		revert: true,
		delay: 300,
		cancel: "tr:has('th')",
		start: function(e, ui){
			clearTimeout(gv.timer);
			$('#menu').hide();
			$('#stafflist').hide();
			clearEditcell();
			ui.placeholder.innerHeight(ui.item.outerHeight())
			prevplace = ui.placeholder.index()
			thisplace = ui.placeholder.index()
			sender = ui.item.closest('table').attr('id')
		},
        over: function(e, ui) {
            ui.item.data('sortableItem').scrollParent = ui.placeholder.closest("div");
            ui.item.data('sortableItem').overflowOffset = ui.placeholder.closest("div").offset();
        },
		change: function(e, ui){
			prevplace = thisplace
			thisplace = ui.placeholder.index()
		},
		stop: function(e, ui){
			var $item = ui.item
			var $itemcell = $item.children("td")
			var receiver = $item.closest('table').attr('id')
			var oldOpdate = getOpdate($itemcell.eq(OPDATE).html())
			var staffname = $itemcell.eq(STAFFNAME).html()
			var titlename = $('#titlename').html()

			if ((sender === "tbl") && (receiver === "queuetbl")) {
				if ((titlename !== "Consults") && (staffname !== titlename)) {
					stopsorting()	//allow drag to Consults, but not to wrong staffname
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
					if (nearest === nearprev) 
						$thisdrop = $previtem
					if (nearest === nearnext) 
						$thisdrop = $nextitem
					if (nearest === nearplace) {
						if ((prevplace === thisplace) && (sender === receiver)) {
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
			var roomtime = checkRoomTime($item, thisOpdate, oldOpdate)
			if (roomtime.conflict) {
				alert("Cancel Sorting", roomtime.conflict)
				stopsorting()
				return false
			}
			var finalWaitnum = calculateWaitnum(receiver, $item, thisOpdate)	

			var sql = "sqlReturnbook=UPDATE book SET Waitnum = "+ finalWaitnum
			sql += ", opdate='" + thisOpdate
			if (roomtime.roomtime) {
				sql += "', oproom='" + roomtime.roomtime[0]
				sql += "', optime='" + roomtime.roomtime[1]
			}
			sql += "', editor='"+ gv.user
			sql += "' WHERE qn="+ thisqn +";"

			Ajax(MYSQLIPHP, sql, callbacksortable);
			
			stopsorting()

			function callbacksortable(response)
			{
				if (/BOOK/.test(response)) {
					updateBOOK(response)
					if (receiver === "tbl") {
						refillOneDay(oldOpdate)
						refillOneDay(thisOpdate)
						if (($("#queuewrapper").css('display') === 'block')
							&& (titlename === staffname)) {
								//dragging inside tbl of this staff's case
							refillstaffqueue()
						}
					} else {	//receiver === "queuetbl"
						refillstaffqueue()
						refillOneDay(oldOpdate)
						refillOneDay(thisOpdate)
					}
				} else {
					alert ("Sortable", response)
				}
			}
		}
	})
}

function stopsorting()
{
	//Return to original place so that refillOneDay(oldOpdate)
	//will not render this row in wrong position
	$("#tbl tbody, #queuetbl tbody").sortable( "cancel" )
	resetTimer()					//Global timer
	gv.idleCounter = 0		//Idle timer
	//after sorting, editcell was placed at row 0 column 1
	//and display at placeholder position in entire width
	$('#editcell').hide()
}

function checkRoomTime($thisrow, thisOpdate, oldOpdate)
{
	var $thisRowCell = $thisrow.children("td")
	var $prevRowCell = $thisrow.prev().children("td")
	var $nextRowCell = $thisrow.next().children("td")
	var prevOpdate = getOpdate($prevRowCell.eq(OPDATE).html())
	var nextOpdate = getOpdate($nextRowCell.eq(OPDATE).html())
	var thisroomtime = $thisRowCell.eq(ROOMTIME).html()
	thisroomtime = thisroomtime? thisroomtime.split("<br>") : ""
	var prevroomtime = $prevRowCell.eq(ROOMTIME).html()
	prevroomtime = prevroomtime? prevroomtime.split("<br>") : ""
	var nextroomtime = $nextRowCell.eq(ROOMTIME).html()
	nextroomtime = nextroomtime? nextroomtime.split("<br>") : ""
	var moveroom = thisroomtime[0]? thisroomtime[0].match(/\d+/)[0] : ""
	var movetime = thisroomtime[1]
	var prevroom = prevroomtime[0]? prevroomtime[0].match(/\d+/)[0] : ""
	var prevtime = prevroomtime[1]
	var nextroom = nextroomtime[0]? nextroomtime[0].match(/\d+/)[0] : ""
	var nexttime = nextroomtime[1]
	var roomtime = {
		"conflict": "",
		"roomtime": ""
	}

	if (moveroom) {
		if (oldOpdate !== thisOpdate) {	//move from another date
			return roomtime		//do nothing, same as before move
		}
		//move in the same date
		if (prevOpdate === thisOpdate) {	
			if (prevroom) {
				if (prevroom > moveroom) {
					roomtime.conflict = "<br><br>Room conflict with previous case"
				}
				if ((prevroom === moveroom) && (prevtime > movetime)) {
					roomtime.conflict = "<br><br>Time conflict with previous case"
				}
			}
		}
		if (thisOpdate === nextOpdate) {
			if (nextroom) {
				if (moveroom > nextroom) {
					roomtime.conflict = "<br><br>Room conflict with next case"
				}
				if ((moveroom === nextroom) && (movetime > nexttime)) {
					roomtime.conflict = "<br><br>Time conflict with next case"
				}
			}
		}
	} else {	//no old roomtime, use roomtime as the same opdate
		if (prevOpdate === thisOpdate) {
			if (prevroom) {
				roomtime.roomtime = prevroomtime
			}
		}
		else if (thisOpdate === nextOpdate) {
			if (nextroom) {
				roomtime.roomtime = nextroomtime
			}
		}
	}
	return roomtime
}
