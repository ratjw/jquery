//Actually these are constants but older browsers do not support const
var GETIPD		= "php/getipd.php";
var GETNAMEHN	= "php/getnamehn.php";
var MYSQLIPHP	= "php/mysqli.php";

//tbl, queuetbl
OPDATE		= 0,
THEATRE		= 1,
OPROOM		= 2,
OPTIME		= 3,
CASENUM		= 4,
STAFFNAME	= 5,
HN			= 6,
PATIENT		= 7,
DIAGNOSIS	= 8,
TREATMENT	= 9,
EQUIPMENT	= 10,
CONTACT		= 11,
QN			= 12,

// NAMEOFDAYABBR for row color
// NAMEOFDAYFULL for 1st column color
NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
THAIMONTH		= ["มค.", "กพ.", "มีค.", "เมย.", "พค.", "มิย.", "กค.", "สค.", "กย.", "ตค.", "พย.", "ธค."],
LARGESTDATE		= "9999-12-31",

//================================================================================================

	gv = {
	BOOK: [],
	CONSULT: [],
	STAFF: [],
	HOLIDAY: [],
	user: "",
	timestamp: "",
	timer: {},
	idleCounter: 0,
	isMobile: false,
	isPACS: true
}
