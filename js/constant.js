//Actually these are constants but older browsers do not support const
var GETIPD		= "php/getipd.php";
var GETNAMEHN	= "php/getnamehn.php";
var MYSQLIPHP	= "php/mysqli.php";

//tbl, queuetbl
var OPDATE		= 0;
var ROOM		= 1;
var CASENUM		= 2;
var STAFFNAME	= 3;
var HN			= 4;
var NAME		= 5;
var DIAGNOSIS	= 6;
var TREATMENT	= 7;
var CONTACT		= 8;
var QN			= 9;

//servicetbl
var CASENUMSV	= 0;
var HNSV		= 1;
var NAMESV		= 2;
var DIAGNOSISSV	= 3;
var TREATMENTSV	= 4;
var ADMISSIONSV	= 5;
var FINALSV		= 6;
var ADMITSV		= 7;
var DISCHARGESV	= 8;
var QNSV		= 9;

var ROWREPORT = {
	"Brain Tumor": 3,
	"Brain Vascular": 4,
	"CSF related": 5,
	"Trauma": 6,
	"Spine": 7,
	"etc.": 8,
	"Radiosurgery": 10,
	"Endovascular": 11
}
var COLUMNREPORT = {
	"Staff": 1,
	"Resident": 5,
	"Major": 0,
	"Minor": 2,
	"Elective": 0,
	"Emergency": 1
}

// NAMEOFDAYABBR for row color
// NAMEOFDAYFULL for 1st column color
var NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
var NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
var THAIMONTH		= ["มค.", "กพ.", "มีค.", "เมย.", "พค.", "มิย.", "กค.", "สค.", "กย.", "ตค.", "พย.", "ธค."];
var LARGESTDATE		= "9999-12-31";

var	BRAIN = [
	/[Cc]erebell/, /[Cc]onvexity/, /[Ff]ront/, /[Pp]ituitary/, /[Oo]ccipit/, /[Pp]etro/, 
	/[Ss]phenoid/,
	/[Tt]empor/, /[Tt]entori/, /[Tt]onsil/
]
var	NOTTUMOR = [
	/[Cc]avernoma/
var	TUMOR = [
	/[Aa]denoma/, /\bCA\b/, /oma/, /NFP?A/, /PA/
]
var	VASCULAR = [
	/[Cc]avernoma/, /ICH/, /SDH/
]
var	CSF = [
	/[Hh]ydrocephalus/, //, //
]
var	TRAUMA = [
	//, /[Cc]/, //
]
var	SPINE = [
	//, /[CTLS][\d]/, //
]
var	ETC = [
	//, //, //
]
var	NEUROSURGERY = [
	/ACDF/, /ALIF/, /[Aa]nast/, /[Aa]pproa/, /[Aa]spirat/, /[Aa]dvance/,
	/[Bb]iop/, /[Bb]lock/, /[Bb]urr/, /[Bb]x/, /[Bb]ypass/, /[Bb]alloon/,
	/[Cc]lip/, 
	/[Dd]ecom/, /DBS/, /[Dd]rain/, /[Dd]isconnect/,
	/ECOG/, /[Ee]ctom/, /[Ee]ndoscop/, /ESI/, /ETS/, /ETV/, /EVD/, /[Ee]xcis/,
	/[Ff]ix/, /[Ff]usion/,
	/[Gg]rid/,
	/[Ii]nsert/,
	/[Ll]esion/, /[Ll]ysis/, 
	/MIDLIF/, /MVD/,
	/[Nn]eurot/, /Navigator/,
	/OLIF/, /[Oo]cclu/, /[Oo]perat/, /ostom/, /otom/,
	/plast/, /PLF/, /PLIF/,
	/[Rr]econs/, /[Rr]edo/, /[Rr]emov/, /[Rr]epa/, /[Rr]evis/, /[Rr]obot/,
	/scope/, /[Ss]crew/, /[Ss]hunt/, /[Ss]tim/, /SNRB/, /[Ss]uture/,
	/TSP/, /TSS/, /TLIF/, /[Tt]ranforam/, /[Tt]ransnasal/,
	/[Tt]ransoral/, /[Tt]ransphenoid/, /[Tt]ranstent/,
	/[Uu]ntether/,
	/VNS/
]
var	NOTNEUROSURGERY = [
	/[Aa]djust/, /[Cc]onservative/, /[Oo]bserve/
]
var	RADIOSURGERY = [
	/conformal radiotherapy/i, /CRT/, /CyberKnife/i,
	/Gamma [Kk]nife/, /GKS/, /Linac/i,
	/[Rr]adiosurgery/, /RS/,
	/SRS/, /SRT/, /[Ss]tereotactic radiotherapy/,
	/Tomotherapy/
]
var	ENDOVASCULAR = [
	/[Bb]alloon/, /[Cc]oil/, /[Ee]mboli[zs]/, /[Ee]ndovasc/, /[Ii]ntervention/,
	/[Ss]tent/, /[Tt]ransart/, /[Tt]ransvenous/
]

//====================================================================================================

var gv = {
	BOOK: [],
	CONSULT: [],
	SERVICE: [],
	STAFF: [],
	user: "",
	timestamp: "",
	uploadWindow: null,
	timer: {},
	idleCounter: 0,
	mobile: false,
	isPACS: true
}

if (/Android|webOS|iPhone|iPad|BlackBerry|IEMobile/i.test(navigator.userAgent)) {
	gv.mobile = true
	gv.isPACS = false
}
