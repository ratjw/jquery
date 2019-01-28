
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { calcWaitnum } from "../util/calcWaitnum.js"

export function fetchSaveContentQN(column, content, qn) {
	let sql = `sqlReturnbook=UPDATE book\
				SET ${column}='${content}',editor='${USER}' WHERE qn=${qn};`

	return postData(MYSQLIPHP, sql);
}

export function fetchSaveContentNoQN(pointed, column, content) {
	let	row = pointed.closest("tr"),
		tableID = row.closest("table").id,
		opdate = row.opdate,
		qn = row.qn,
		staffname = row.staffname,
		sql1 = "",
		sql,
		waitnum = calcWaitnum(opdate, row.previousElementSibling, row.nextElementSibling)
		// new case, calculate waitnum

	// store waitnum in row waitnum
	row.waitnum = waitnum

	if ((tableID === "queuetbl") && (column !== "staffname")) {
		sql1 = "staffname='staffname',"
	}

	sql = `sqlReturnbook=INSERT INTO book\
         SET waitnum=${waitnum},\
             opdate='${opdate}',\
             ${sql1}\
             ${column}='${content}',\
             editor='${USER}';`

	return postData(MYSQLIPHP, sql);
}
