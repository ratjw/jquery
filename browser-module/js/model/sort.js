
import { OPDATE, THEATRE, OPROOM, STAFFNAME, QN } from "./const.js"
import { clearTimer, resetTimer, resetTimerCounter } from "../control/updating.js"
import { clearEditcell } from "../control/edit.js"
import { clearMouseoverTR } from "../menu/changeDate.js"
import { fetchSortable } from "./fetch.js"
import { calcWaitnum } from "../util/calcWaitnum.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQN } from "../util/getrows.js"
import { Alert, updateBOOK, isConsults, isStaffname } from "../util/util.js"
import { viewSortable } from "../view/fill.js"
import { showUpload } from "../get/showUpload.js"
import { UndoManager } from "../model/UndoManager.js"

// Sortable 2 windows connected with each other
// Trace placeholder to determine moving up or down
export function sortable () {
	let prevplace,
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
			clearTimer()
			$('#stafflist').hide()
			clearEditcell()
			clearMouseoverTR()
			ui.placeholder.innerHeight(ui.item.outerHeight())
			prevplace = ui.placeholder.index()
			thisplace = ui.placeholder.index()
			sender = ui.item.closest('table').attr('id')
		},
		// Make scroll only the window that placeholder is in
		over: function(e, ui) {
			ui.item.data('sortableItem').scrollParent = ui.placeholder.closest("div");
			ui.item.data('sortableItem').overflowOffset = ui.placeholder.closest("div").offset();
		},
		// For determination of up or down
		change: function(e, ui){
			prevplace = thisplace
			thisplace = ui.placeholder.index()
		},
		stop: function(e, ui) {
			let $item = ui.item,
				$itemcell = $item.children("td"),
				receiver = $item.closest('table').attr('id'),
				oldWaitnum = $item[0].title,
				oldOpdateth = $itemcell.eq(OPDATE).html(),
				oldOpdate = getOpdate(oldOpdateth),
				oldtheatre = $itemcell.eq(THEATRE).html(),
				oldroom = $itemcell.eq(OPROOM).html(),
				staffname = $itemcell.eq(STAFFNAME).html(),
				oldqn = $itemcell.eq(QN).html()

			// Allow drag to Consults, or same staff name
			// That is (titlename === "Consults") is allowed
			// To another staff name is not allowed
			// Not allow to drag a blank line
			let illegal = ((sender === "tbl")
						&& (receiver === "queuetbl")
						&& !isConsults()
						&& !isStaffname(staffname))
						|| (!$itemcell.eq(QN).html())

			if (illegal) {
				stopsorting()
				return false
			}

			// Find nearest row by dropping position
			let $thisdrop
			let before
			let $previtem = $item.prev()
			let $nextitem = $item.next()

			if (!$previtem.length || $previtem.has('th').length) {
				$thisdrop = $nextitem
				before = 1
			} else {
				if (!$nextitem.length || $nextitem.has('th').length) {
					$thisdrop = $previtem
					before = 0
				} else {
					// Determine that the user intend to drop on which row
					//ui.offset (without '()') = helper position
					let helperpos = ui.offset.top
					let prevpos = $previtem.length && $previtem.offset().top
					let thispos = $item.offset().top
					let nextpos = $nextitem.length && $nextitem.offset().top
					let nearprev = Math.abs(helperpos - prevpos)
					let nearplace = Math.abs(helperpos - thispos)
					let nearnext = Math.abs(helperpos - nextpos)
					let nearest = Math.min(nearprev, nearplace, nearnext)

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
							stopSorting()
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

			let $thiscell = $thisdrop.children("td"),
				thisOpdateth = $thisdrop.children("td").eq(OPDATE).html(),
				thisOpdate = getOpdate(thisOpdateth),
				thistheatre = $thiscell.eq(THEATRE).html(),
				thisroom = $thiscell.eq(OPROOM).html(),
				thisqn = $thiscell.eq(QN).html(),

				newWaitnum = calcWaitnum(thisOpdateth, $previtem, $nextitem),
				allNewCases = [],
				allOldCases = [],
				sql = ""

			// old = mover
			// this = dropping place
			// drop on the same case
			if (thisqn === oldqn) { return }

			// no room specified and waitnum not changed
			if (!oldroom && !thisroom && newWaitnum === oldWaitnum) {
				return
			}

			// sameDateRoomTableQN is of tbl only, the mover must be removed manually
			if (oldroom) {
				allOldCases = sameDateRoomTableQN(oldOpdateth, oldroom, oldtheatre)
				if (sender === "queuetbl") {
					allOldCases = allOldCases.filter(e => e !== oldqn)
				}
			}

			if (thisroom) {
				allNewCases = sameDateRoomTableQN(thisOpdateth, thisroom, thistheatre)
				if (receiver === "queuetbl") {
					let index = allNewCases.indexOf(thisqn)
					before
					? allNewCases.splice(index, 0, oldqn)
					: allNewCases.splice(index + 1, 0, oldqn)
				}
			}

			let argModelDo = {
				oldlist: allOldCases,
				newlist: allNewCases,
				waitnum: newWaitnum,
				opdate: thisOpdate,
				room: thisroom,
				qn: oldqn
			}
			let argViewDo = {
				receiver: receiver,
				oldOpdate: oldOpdate,
				thisOpdate: thisOpdate
			}
			let argModelUndo = {
				oldlist: allNewCases,
				newlist: allOldCases,
				waitnum: oldWaitnum,
				opdate: oldOpdate,
				room: oldroom,
				qn: oldqn
			}
			let argViewUndo = {
				receiver: sender,
				oldOpdate: thisOpdate,
				thisOpdate: oldOpdate
			}

			doSorting(argModelDo, argViewDo)

			// make undo-able
			UndoManager.add({
				undo: function() {
					doSorting(argModelUndo, argViewUndo)
				},
				redo: function() {
					doSorting(argModelDo, argViewDo)
				}
			})		

			stopsorting()
		}
	})
}

function doSorting(argModel, argView) {
	fetchSortable(argModel).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewSortable(argView)
		}

		typeof response === "object"
		? hasData()
		: Alert("Sortable", response)
	}).catch(error => {})
}

let stopsorting = function () {
	// Return to original place so that refillOneDay(oldOpdate)
	// will not render this row in wrong position
	$("#tbl tbody, #queuetbl tbody").sortable( "cancel" )

	// before sorting, timer was stopped by clearTimer
	resetTimerCounter()

	//  after sorting, editcell was placed at row 0 column 1
	//  and display at placeholder position in entire width
	$('#editcell').hide()
}
