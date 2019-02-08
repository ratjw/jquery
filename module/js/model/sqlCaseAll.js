
import { postData, MYSQLIPHP } from "./fetch.js"

export function sqlCaseAll() {
  let sql = `sqlReturnData=SELECT * FROM book WHERE deleted=0 ORDER BY opdate;`

  return postData(MYSQLIPHP, sql)
}
