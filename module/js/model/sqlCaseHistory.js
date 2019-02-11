
import { postData, MYSQLIPHP } from "./fetch.js"

export function sqlCaseHistory(hn) {
  let sql = `sqlReturnData=SELECT * FROM bookhistory 
              WHERE qn in (SELECT qn FROM book WHERE hn='${hn}') 
              ORDER BY editdatetime DESC;`

  return postData(MYSQLIPHP, sql)
}
