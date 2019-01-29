
import { postData, MYSQLIPHP } from "./fetch.js"
import { sqlCaseNum } from "./sqlSaveCaseNum.js"
import { USER } from "../main.js"

export function sqlAllDeletedCases() {
  let sql = `sqlReturnData=SELECT editdatetime, b.* 
                FROM book b 
                    LEFT JOIN bookhistory bh ON b.qn = bh.qn 
                WHERE editdatetime>DATE_ADD(NOW(), INTERVAL -3 MONTH) 
                    AND b.deleted>0 
                    AND bh.action='delete' 
                ORDER BY editdatetime DESC;`

  return postData(MYSQLIPHP, sql)
}

export function sqlUndelete(allCases, oproom, qn, del) {
  let sql = "sqlReturnbook="

  allCases.forEach((item, i) => {
    if (item === qn) {
      sql += `UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`
    } else {
      if (oproom) {
        sql += sqlCaseNum(i + 1, item)
      }
    }
  })

  return postData(MYSQLIPHP, sql);
}
