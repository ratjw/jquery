
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { calcWaitnum } from "../util/calcWaitnum.js"

export function sqlSaveContentQN(column, content, qn) {
	let sql = `sqlReturnbook=UPDATE book\
				SET ${column}='${content}',editor='${USER}' WHERE qn=${qn};`

	return postData(MYSQLIPHP, sql);
}

export function sqlSaveContentNoQN(pointed, column, content) {
	let	row = pointed.closest("tr"),
		tableID = row.closest("table").id,
		opdate = row.dataset.opdate,
		qn = row.dataset.qn,
		staffname = row.dataset.staffname,
		sql1 = "",
		sql,
		waitnum = calcWaitnum(opdate, row.previousElementSibling, row.nextElementSibling)
		// new case, calculate waitnum

	// store waitnum in row waitnum
	row.dataset.waitnum = waitnum

	if ((tableID === "queuetbl") && (column !== "staffname")) {
		sql1 = "staffname='" + staffname + "',"
	}

	sql = `sqlReturnbook=INSERT INTO book\
         SET waitnum=${waitnum},\
             opdate='${opdate}',\
             ${sql1}\
             ${column}='${content}',\
             editor='${USER}';`

	return postData(MYSQLIPHP, sql);
}
