
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { calcWaitnum } from "../util/calcWaitnum.js"
import { isConsults } from "../util/util.js"

export function sqlSaveContentQN(column, content, qn) {
  let sql = `sqlReturnbook=UPDATE book SET ${column}='${content}',editor='${USER}' WHERE qn=${qn};`

  return postData(MYSQLIPHP, sql);
}

export function sqlSaveContentNoQN(pointed, column, content) {
  let  row = pointed.closest("tr"),
    tableID = row.closest("table").id,
    opdate = row.dataset.opdate,
    staffname = row.dataset.staffname,
    sql1 = "",
    sql,
    waitnum = calcWaitnum(opdate, row.previousElementSibling, row.nextElementSibling)
    // new case, calculate waitnum

  if ((tableID === "queuetbl") && (column !== "staffname")) {
    if (!isConsults()) {
      staffname = document.getElementById('titlename').innerHTML
    }
    sql1 = "staffname='" + staffname + "',"
  }

  sql = `sqlReturnbook=INSERT INTO book SET waitnum=${waitnum},opdate='${opdate}',${sql1}${column}='${content}',editor='${USER}';`

  return postData(MYSQLIPHP, sql);
}
