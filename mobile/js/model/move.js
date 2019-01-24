
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"

export function fetchSortable(arg)
{
	let allOldCases = arg.movelist,
		allNewCases = arg.newlist,
		newWaitnum = arg.waitnum,
		thisOpdate = arg.opdate,
		theatre = arg.theatre,
		moveroom = arg. moveroom,
		thisroom = arg.thisroom,
		moveqn = arg.qn,
		sql = "sqlReturnbook="

	if (allOldCases.length && moveroom) {
		sql += updateCasenum(allOldCases)
	}

	if (allNewCases.length) {
	  for (let i=0; i<allNewCases.length; i++) {
	    sql += (allNewCases[i] === moveqn)
	      ? thisroom
	        ? sqlMover(newWaitnum, thisOpdate, theatre, thisroom, i + 1, moveqn)
	        : sqlMover(newWaitnum, thisOpdate, theatre, null, null, moveqn)
	      : thisroom
	        ? sqlCaseNum(i + 1, allNewCases[i])
	        : sqlCaseNum(null, allNewCases[i])
		}
	} else {
		sql += sqlMover(newWaitnum, thisOpdate, theatre, null, null, moveqn)
	}

	if (!allOldCases.length && !allNewCases.length) {
		sql += sqlMover(newWaitnum, thisOpdate, theatre, null, null, moveqn)
	}

	return postData(MYSQLIPHP, sql);
}

export function fetchPostponeCase(allCases, waitnum, thisdate, oproom, qn) {
	let sql = `sqlReturnbook=UPDATE book SET opdate='${thisdate}',
				waitnum=${waitnum},theatre='',oproom=null,casenum=null,
				optime='',editor='${USER}' WHERE qn=${qn};`

	if (allCases.length && oproom) {
		sql += updateCasenum(allCases.filter(e !== qn))
	}

	return postData(MYSQLIPHP, sql)
}

export function fetchmoveCase(arg) {
	let sql = "sqlReturnbook=",
		allOldCases = arg.allOldCases,
		allNewCases = arg.allNewCases,
		waitnum = arg.waitnum,
		thisdate = arg.thisdate,
		theatre = arg.thistheatre,
		moveroom = arg.moveroom,
		thisroom = arg.thisroom,
		qn = arg.moveQN

	if (moveroom) { sql += updateCasenum(allOldCases) }

	for (let i=0; i<allNewCases.length; i++) {
		if (allNewCases[i] === qn) {
			thisroom
			? sql += sqlMover(waitnum, thisdate, theatre, thisroom, i + 1, qn)
			: sql += sqlMover(waitnum, thisdate, theatre, null, null, qn)
		} else {
			thisroom
			? sql += sqlCaseNum(i + 1, allNewCases[i])
			: sql += sqlCaseNum(null, allNewCases[i])
		}
	}

	return postData(MYSQLIPHP, sql)
}

// if no oproom, will have no casenum too
function sqlMover(waitnum, opdate, theatre, oproom, casenum, qn)
{
  return `UPDATE book SET
			waitnum=${waitnum},
			opdate='${opdate}',
			theatre='${theatre}',
			oproom=${oproom},
			casenum=${casenum},
			editor='${USER}'
		  WHERE qn=${qn};`
}

// if no oproom, will have no casenum too
function sqlNewRoom(oproom, casenum, qn)
{
  return `UPDATE book SET oproom=${oproom},casenum=${casenum},editor='${USER}'
				WHERE qn=${qn};`
}

function sqlNewTime(optime, casenum, qn)
{
  return `UPDATE book SET optime='${optime}',casenum=${casenum},editor='${USER}'
				WHERE qn=${qn};`
}
