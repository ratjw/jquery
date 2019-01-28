
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"

export function fetchGetEquip(qn)	{

	let sql = `sqlReturnData=SELECT editor,editdatetime\
								FROM bookhistory\
								WHERE qn=${qn} AND equipment <> ''\
								ORDER BY editdatetime DESC;`

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveEquip(equipment, qn) {
	let sql = `sqlReturnbook=UPDATE book\
							SET equipment='${equipment}',\
								editor='${USER}'\
							WHERE qn='${qn}';`

	return postData(MYSQLIPHP, sql);
}

export function fetchCancelAllEquip(qn)
{
	sql = `sqlReturnbook=UPDATE book SET equipment='',editor='${USER}'\
							WHERE qn='${qn}';`

	return postData(MYSQLIPHP, sql)
}
