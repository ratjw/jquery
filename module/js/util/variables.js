
//--- global variables --------------
// BOOK is for main table and individual staff's cases table
// CONSULT is for Consults table (special table in queuetbl)
// ONCALL is for exchanging between staffs for oncall consultation
// HOLIDAY is for Buddhist holiday entry of every year
// timestamp is the last time access from this client to the server
// can't check PACS (always unauthorized 401 with Firefox)

export const isPACS = /10.6./.test(window.location)

export let BOOK = [],
	CONSULT = [],
	STAFF = [],
	ONCALL = [],
	HOLIDAY = [],
	timestamp = ""

export function setONCALL(oncall) { ONCALL = oncall }
export function setSTAFF(staff) { STAFF = staff }
export function setHOLIDAY(holiday) { HOLIDAY = holiday }

// Save data got from server
// Two main data for tables (BOOK, CONSULT) and a timestamp
// QTIME = datetime of last fetching : $mysqli->query("SELECT now();")
export function updateBOOK(response) {
	if (response.BOOK) { BOOK = response.BOOK }
	if (response.CONSULT) { CONSULT = response.CONSULT }
	if (response.STAFF) { STAFF = response.STAFF }
	if (response.ONCALL) { ONCALL = response.ONCALL }
	if (response.HOLIDAY) { HOLIDAY = response.HOLIDAY }
	if (response.QTIME) { timestamp = response.QTIME }
}
