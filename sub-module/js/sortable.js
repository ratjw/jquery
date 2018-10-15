function sortable()
{
	var prevplace,
		thisplace,
		sender

	$("#tbl tbody, #queuetbl tbody").sortable({
		items: "tr",
		connectWith: "#tbl tbody, #queuetbl tbody",
		forceHelperSize: true,
		forcePlaceholderSize: true,
		revert: true,
		delay: 150,
		cancel: "tr:has('th')",
		start: function(e, ui){
			clearTimeout(gv.timer);
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
		stop: function(e, ui) {
			var $item = ui.item,
				$itemcell = $item.children("td"),
				receiver = $item.closest('table').attr('id'),
				oldwaitnum = $item[0].title,
				oldOpdateth = $itemcell.eq(OPDATE).html(),
				oldOpdate = getOpdate(oldOpdateth),
				oldtheatre = $itemcell.eq(THEATRE).html(),
				oldroom = $itemcell.eq(OPROOM).html(),
				staffname = $itemcell.eq(STAFFNAME).html(),
				oldqn = $itemcell.eq(QN).html()

			//allow drag to Consults, but not to wrong staffname
			if ((sender === "tbl") && (receiver === "queuetbl")
				&& !isConsults() && !isStaffname(staffname)) {
					stopsorting()
					return false
			}
				
			if (!$itemcell.eq(QN).html()) {
				stopsorting()
				return false
			}

			var $thisdrop, before,
				$previtem = $item.prev(),
				$nextitem = $item.next()
			if (!$previtem.length || $previtem.has('th').length) {
				$thisdrop = $nextitem
				before = 1
			} else {
				if (!$nextitem.length || $nextitem.has('th').length) {
					$thisdrop = $previtem
					before = 0
				} else {		//ui.offset (no '()') = helper position
					var helperpos = ui.offset.top,
						prevpos = $previtem.offset().top,
						thispos = $item.offset().top,
						nextpos = $nextitem.offset().top,
						nearprev = Math.abs(helperpos - prevpos),
						nearplace = Math.abs(helperpos - thispos),
						nearnext = Math.abs(helperpos - nextpos),
						nearest = Math.min(nearprev, nearplace, nearnext)
					if (nearest === nearprev) {
						$thisdrop = $previtem
						before = 0
					} 
					if (nearest === nearnext) {
						$thisdrop = $nextitem
						before = 1
					}
					if (nearest === nearplace) {
						if ((prevplace === thisplace) && (sender === receiver)) {
							stopsorting()
							return false
						}
						if (prevplace < thisplace) {
							$thisdrop = $previtem
							before = 0
						} else {
							$thisdrop = $nextitem
							before = 1
						}
					}
				}
			}

			var $thiscell = $thisdrop.children("td"),
				thisOpdateth = $thisdrop.children("td").eq(OPDATE).html(),
				thisOpdate = getOpdate(thisOpdateth),
				thistheatre = $thiscell.eq(THEATRE).html(),
				thisroom = $thiscell.eq(OPROOM).html(),
				thisqn = $thiscell.eq(QN).html(),

				newWaitnum = calcWaitnum(thisOpdateth, $previtem, $nextitem),
				allNewCases = allOldCases = [],
				index,
				sql = ""

			// drop on the same case
			if (thisqn === oldqn) { return }

			// assimilate into receiver
			$itemcell.eq(OPDATE).html(thisOpdateth)
			$itemcell.eq(OPROOM).html(thisroom)

			if (oldroom) {
				allOldCases = sameDateRoomTableQN(oldOpdateth, oldroom, oldtheatre)
				if (sender === "queuetbl") {
					index = allOldCases.indexOf(oldqn)
					allOldCases.splice(index, 1)
				}
				sql += updateCasenum(allOldCases)
			}

			if (thisroom) {
				allNewCases = sameDateRoomTableQN(thisOpdateth, thisroom, thistheatre)
				if (receiver === "queuetbl") {
					index = allNewCases.indexOf(thisqn)
					if (before) {
						allNewCases.splice(index, 0, oldqn)
					} else {
						allNewCases.splice(index + 1, 0, oldqn)
					}
				}

				for (var i=0; i<allNewCases.length; i++) {
					if (allNewCases[i] === oldqn) {
						sql += sqlMover(newWaitnum, thisOpdate, thisroom, i + 1, oldqn)
					} else {
						sql += sqlCaseNum(i + 1, allNewCases[i])
					}
				}
			} else {
				sql += sqlMover(newWaitnum, thisOpdate, null, null, oldqn)
			}

			if (!sql) {
				if (newWaitnum === oldwaitnum) {
					return
				}
				sql += sqlMover(newWaitnum, thisOpdate, null, null, oldqn)
			}
			sql = "sqlReturnbook=" + sql

			Ajax(MYSQLIPHP, sql, callbacksortable);

			function callbacksortable(response)
			{
				if (typeof response === "object") {
					updateBOOK(response)
					if (receiver === "tbl") {
						if (oldOpdateth) {
							refillOneDay(oldOpdate)
						}
						refillOneDay(thisOpdate)
						if (isSplited()) {
							refillstaffqueue()
						}
					} else {
						refillstaffqueue()
						refillOneDay(oldOpdate)
						refillOneDay(thisOpdate)
					}
				} else {
					Alert ("Sortable", response)
				}
			}
		}
	})
}

function stopsorting()
{
	// Return to original place
	// Timer: Global timer every 10 sec
	// idleCounter: Idle timer counts number of Timer cycles
	$("#tbl tbody, #queuetbl tbody").sortable( "cancel" )
	resetTimer()
	gv.idleCounter = 0

	// after sorting, editcell was placed at row 0 column 1
	// and display at placeholder position in entire row width
	$('#editcell').hide()
}

function updateCasenum(allCases)
{
	var sql = ""
	for (var i=0; i<allCases.length; i++) {
		sql += sqlCaseNum(i + 1, allCases[i])
	}
	return sql
}

function sqlCaseNum(casenum, qn)
{	
	return "UPDATE book SET "
		+  "casenum=" + casenum
		+  ",editor='" + gv.user
		+  "' WHERE qn="+ qn + ";";
}

function sqlMover(waitnum, opdate, oproom, casenum, qn)
{
	return "UPDATE book SET "
		+  "waitnum=" + waitnum
		+  ", opdate='" + opdate
		+  "',oproom=" + oproom
		+  ",casenum=" + casenum
		+  ",editor='" + gv.user
		+  "' WHERE qn="+ qn + ";";
}
