
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { updateCasenum, sqlCaseNum } from "./sqlSaveCaseNum.js"

export function sqlPostponeCase(allCases, waitnum, thisdate, oproom, qn) {
	let sql = `sqlReturnbook=UPDATE book SET opdate='${thisdate}',
				waitnum=${waitnum},theatre='',oproom=null,casenum=null,
				optime='',editor='${USER}' WHERE qn=${qn};`

	if (allCases.length && oproom) {
		sql += updateCasenum(allCases.filter(e => e !== qn))
	}

	return postData(MYSQLIPHP, sql)
}

export function sqlmoveCase(arg) {
	let sql = "sqlReturnbook=",
		allOldCases = arg.allOldCases,
		allNewCases = arg.allNewCases,
		waitnum = arg.waitnum,
		thisdate = arg.thisdate,
		theatre = arg.thistheatre,
		moveroom = arg.moveroom,
		thisroom = arg.thisroom,
		qn = arg.moveqn

	if (moveroom) { sql += updateCasenum(allOldCases) }

	allNewCases.forEach((e, i) => {
		if (e === qn) {
			thisroom
			? sql += sqlMover(waitnum, thisdate, theatre, thisroom, i + 1, qn)
			: sql += sqlMover(waitnum, thisdate, theatre, null, null, qn)
		} else {
			thisroom
			? sql += sqlCaseNum(i + 1, e)
			: sql += sqlCaseNum(null, e)
		}
	})

	return postData(MYSQLIPHP, sql)
}

export function sqlSortable(allOldCases, allNewCases, moverow, thisrow)
{
	let newWaitnum = moverow.dataset.waitnum,
		moveroom = moverow.dataset.oproom,
		moveqn = moverow.dataset.qn,
		thisOpdate = thisrow.dataset.opdate,
		theatre = thisrow.dataset.theatre || "",
		thisroom = thisrow.dataset.oproom || null,
		sql = "sqlReturnbook="

	if (allOldCases.length && moveroom) {
		sql += updateCasenum(allOldCases)
	}

	allNewCases.forEach((e, i) => {
    sql += (e === moveqn)
      ? thisroom
        ? sqlMover(newWaitnum, thisOpdate, theatre, thisroom, i + 1, moveqn)
        : sqlMover(newWaitnum, thisOpdate, theatre, null, null, moveqn)
      : thisroom
        ? sqlCaseNum(i + 1, e)
        : sqlCaseNum(null, e)
  })

	return postData(MYSQLIPHP, sql);
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
