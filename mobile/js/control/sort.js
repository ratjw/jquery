
import { OPDATE, THEATRE, OPROOM, STAFFNAME, QN } from "../model/const.js"
import { clearTimer, resetTimerCounter } from "./timer.js"
import { clearEditcell } from "./edit.js"
import { clearMouseoverTR } from "../menu/moveCase.js"
import { fetchSortable } from "../model/move.js"
import { calcWaitnum } from "../util/calcWaitnum.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomBOOKRows } from "../util/getrows.js"
import { BOOK, updateBOOK } from "../util/variables.js"
import { Alert, isConsults, isStaffname } from "../util/util.js"
import { viewmoveCase } from "../view/viewmoveCase.js"
import { hoverMain } from "../view/hoverMain.js"

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
				moveWaitnum = $item[0].title,
				moveOpdateth = $itemcell.eq(OPDATE).html(),
				moveOpdate = getOpdate(moveOpdateth),
				movetheatre = $itemcell.eq(THEATRE).html(),
				moveroom = $itemcell.eq(OPROOM).html(),
				staffname = $itemcell.eq(STAFFNAME).html(),
				moveqn = $itemcell.eq(QN).html()

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
					let helpertop = ui.offset.top
					let helperheight = $item.height()
					let helpercenter = helpertop + helperheight/2

					let placeholdertop = $item.offset().top
					let placeholderheight = ui.placeholder.height()
					let placeholdercenter = placeholdertop + placeholderheight/2
					let placeholderbottom = placeholdertop + placeholderheight

					let nearprev = Math.abs(helpercenter - placeholdertop)
					let nearplace = Math.abs(helpercenter - placeholdercenter)
					let nearnext = Math.abs(helpercenter - placeholderbottom)
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
			if (thisqn === moveqn) { return }

			// no room specified and waitnum not changed
			if (!moveroom && !thisroom && newWaitnum === moveWaitnum) {
				return
			}

			allOldCases = sameDateRoomBOOKRows(BOOK, moveOpdate, moveroom, movetheatre)
			allNewCases = sameDateRoomBOOKRows(BOOK, thisOpdate, thisroom, thistheatre)

			let moverow = allOldCases.find(e => e.qn === moveqn)

			// remove itself from old sameDateRoom
			allOldCases = allOldCases.filter(e => e.qn !== moveqn);

			// new === old
			if (!!allNewCases.find(e => e.qn === moveqn)) {
				allNewCases = allOldCases
				allOldCases = []
			}

			// insert itself into new sameDateRoom after the clicked row
			let index = allNewCases.indexOf(thisqn)
			before
			? allNewCases.splice(index, 0, moveqn)
			: allNewCases.splice(index + 1, 0, moveqn)

			let argModelDo = {
				movelist: allOldCases,
				newlist: allNewCases,
				waitnum: newWaitnum,
				opdate: thisOpdate,
				theatre: thistheatre,
				moveroom: moveroom,
				thisroom: thisroom,
				qn: moveqn
			}
/*			let argModelUndo = {
				movelist: allNewCases,
				newlist: allOldCases,
				waitnum: moveWaitnum,
				opdate: moveOpdate,
				theatre: movetheatre,
				moveroom: thisroom,
				thisroom: moveroom,
				qn: moveqn
			}
*/
			// after sorting, must attach hover to the changed DOM elements
			let doSorting = function(argModelDo) {
				fetchSortable(argModelDo).then(response => {
					let hasData = function () {
						updateBOOK(response)
						viewmoveCase(moveOpdate, thisOpdate, staffname)
						hoverMain()
					}

					typeof response === "object"
					? hasData()
					: Alert("Sortable", response)
				}).catch(error => {})
			}

			doSorting(argModelDo)
/*
			// make undo-able
			UndoManager.add({
				undo: function() {
					doSorting(argModelUndo)
				},
				redo: function() {
					doSorting(argModelDo)
				}
			})
*/
			stopsorting()
		}
	})
}

let stopsorting = function () {
	// Return to original place so that viewOneDay(moveOpdate)
	// will not render this row in wrong position
	$("#tbl tbody, #queuetbl tbody").sortable( "cancel" )

	// before sorting, timer was stopped by clearTimer
	resetTimerCounter()

	//  after sorting, editcell was placed at row 0 column 1
	//  and display at placeholder position in entire width
	$('#editcell').hide()
}
