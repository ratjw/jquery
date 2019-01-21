
import { postData, MYSQLIPHP } from "./fetch.js"
import { OPDATE, STAFFNAME, QN } from "./const.js"
import { USER } from "../main.js"
import { calcWaitnum } from "../util/calcWaitnum.js"
import { getOpdate } from "../util/date.js"

export function fetchSaveTheatre(allOldCases, allNewCases, theatre, oproom, qn)
{
	let sql = "sqlReturnbook="

	if (oproom) {
		sql += updateCasenum(allOldCases)
	}

	allNewCases.forEach((item, i) => {
		if (item === qn) {
			if (oproom) {
				sql += sqlNewTheatre(theatre, i + 1, qn)
			} else {
				sql += sqlNewTheatre(theatre, null, qn)
			}
		} else {
			if (oproom) { sql += sqlCaseNum(i + 1, item) }
		}
	})

	return postData(MYSQLIPHP, sql);
}

export function fetchSaveOpRoom(allOldCases, allNewCases, oldoproom, newoproom, qn)
{
	let sql = "sqlReturnbook="

	if (allOldCases.length && oldoproom) {
		sql += updateCasenum(allOldCases)
	}

	if (allNewCases.length) {
		allNewCases.forEach((item, i) => {
			if (item === qn) {
				if (newoproom) {
					sql += sqlNewRoom(newoproom, i + 1, qn)
				} else {
					sql += sqlNewRoom(null, null, qn)
				}
			} else {
				if (newoproom) { sql += sqlCaseNum(i + 1, item) }
			}
		})
	}

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveOpTime(allCases, time, qn)
{
	let sql = "sqlReturnbook="

	for (let i=0; i<allCases.length; i++) {
		if (allCases[i] === qn) {
			sql += sqlNewTime(time, i + 1, qn)
		} else {
			sql += sqlCaseNum(i + 1, allCases[i])
		}
	}

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveCaseNum(allCases, casenum, qn)
{
	let sql = "sqlReturnbook="

	if (casenum === "") {
		sql += sqlCaseNum(null, qn)
	} else {
		allCases.splice(casenum - 1, 0, qn)
	}

	allCases.forEach((item, i) => {
		if (item === qn) {
			sql += sqlCaseNum(casenum, qn)
		} else {
			sql += sqlCaseNum(i + 1, item)
		}
	})

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveContentQN(column, content, qn) {
	let sql = `sqlReturnbook=UPDATE book
				SET ${column}='${content}',editor='${USER}' WHERE qn=${qn};`

	return postData(MYSQLIPHP, sql);
}

export function fetchSaveContentNoQN(pointed, column, content) {
	let	cellindex = pointed.cellIndex,
		tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		titlename = $('#titlename').html(),
		sql1 = "",
		sql2 = "",
		sql,
		waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
		// new case, calculate waitnum

	// store waitnum in row title
	$row[0].title = waitnum

	if ((tableID === "queuetbl") && (column !== "staffname")) {
		sql1 = "staffname, "
		sql2 = staffname + "','"
	}

	sql = `sqlReturnbook=INSERT INTO book (waitnum,opdate,${sql1}${column},editor)
			VALUES (${waitnum},'${opdate}','${sql2}${content}','${USER}');`

	return postData(MYSQLIPHP, sql);
}

export function fetchGetEquip(qn)	{

	let sql = `sqlReturnData=SELECT editor,editdatetime
								FROM bookhistory
								WHERE qn=${qn} AND equipment <> ''
								ORDER BY editdatetime DESC;`

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveEquip(equipment, qn) {
	let sql = `sqlReturnbook=UPDATE book
							SET equipment='${equipment}',
								editor='${USER}'
							WHERE qn='${qn}';`

	return postData(MYSQLIPHP, sql);
}

export function fetchCancelAllEquip(qn)
{
	sql = `sqlReturnbook=UPDATE book SET equipment='',editor='${USER}'
							WHERE qn='${qn}';`

	return postData(MYSQLIPHP, sql)
}

function sqlNewTheatre(theatre, casenum, qn)
{
	return `UPDATE book
				SET theatre='${theatre}',casenum=${casenum},editor='${USER}'
				WHERE qn=${qn};`
}

function updateCasenum(allCases)
{
	let sql = ""
	allCases.forEach((item, i) => {
		sql += sqlCaseNum(i + 1, item)
	})
	return sql
}

function sqlCaseNum(casenum, qn)
{	
  return `UPDATE book SET casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}
