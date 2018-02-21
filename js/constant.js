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
var OPDATESV	= 1;
var HNSV		= 2;
var NAMESV		= 3;
var DIAGNOSISSV	= 4;
var TREATMENTSV	= 5;
var ADMISSIONSV	= 6;
var FINALSV		= 7;
var ADMITSV		= 8;
var DISCHARGESV	= 9;
var QNSV		= 10;

var ROWREPORT = {
	"Brain Tumor": 3,
	"Brain Vascular": 4,
	"CSF related": 5,
	"Trauma": 6,
	"Spine": 7,
	"etc": 8,
	"Radiosurgery": 10,
	"Endovascular": 11,
	"Conservative": 12
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
/*
var	BRAINDX = [
	/[Bb]rain/, /[Cc]avernous/, /[Cc]erebell/, /[Cc]ranio/, /CNS/,
	/[Cc]onvexity/, /CPA?/, /[Cc]liv[aou]/,
	/[Ff]acial/, /[Ff]ront/, /[Ff]al[cx]/, /\bF-?P\b/, /[Jj]ugular/, /mass/,
	/planum/, /[Pp]itui/, /[Pp]etro/, 
	/[Oo]ccipit/, /sella/, /[Ss]phenoid/, /[Ss]agittal/, /SSS/,
	/[Tt]empor/, /[Tt]entori/, /[Tt]halam/, /[Tt]onsil/, /[Tt]uberculum/,
	/[Vv]estibul/
]
var	TUMORDX = [
	/^((?!cavernoma).)*oma$/, /\bCA\b/, /CPA/, /Cushing/, /[Cc]yst/,
	/DNET/, /GBM/, /[Mm]ass/, /[Mm]etas/, /\bNFP?A\b/,
	/\bPA\b/, /[Pp]ituitary apoplexy/,
	/[Tt]umou?r/
]
var	VASCULARDX = [
	/[Aa]neurysm/, /AVM/, /AVF/, /[Cc]avernoma/,
	/[Ee]mboli/, /[Hh]a?emorrh/,
	/ICH/, /[Ii]nfarct/, /ICA|MCA|VBA.*stenosis/,
	/M1|M2|MCA occlusion/, /[Mm]oya [Mm]oya/,
	/SAH/
]
var	CSFDX = [
	/HCP/, /[Hh]ydrocephalus/, /\bNPH\b/,
	/[Ss]hunt [Oo]bstruct/, /[Ss]hunt [Mm]alfunction/
]
var	TRAUMADX = [
	/[Aa]ssult/, /EDH/, /[Cc]ontusion/, /[Ii]njury/,
	/Fx|[Ff]racture/, /[Ll]acerat/,
	/SDH/, /[Ss]ubdural [Hh]a?ematoma/, /[Tt]rauma/
]
var	SPINEDX = [
	/[Cc]ervical/, /\bCSM\b/, /\b[CTLS] ?[\d]/, /HNP/, /[Ll]umb[ao]/, /myel/,
	/[Ss]acr[ao]/, /scoliosis/, /[Ss]pin/, /[Ss]pondylo/, /[Tt]hora/
]
var	ETCDX = [
	/[Aa]bscess/, /[Cc]hiari/, /[Cc]onvulsi/, /\bCTS\b/, /cubital/,
	/[Dd]ecompress/, /[Dd]ysplasia/,
	/[Ee]pilepsy/, /[Hh]emifacial/,
	/MTS/, /ocele/, /[Pp]arkinson/,
	/[Ss]kull [Dd]efect/, /[Ss]clerosis/, /[Ss]eizure/, /[Ss]ural/,
	/TG?N/, /[Tt]rigemin/, /[Tt]unnel/
]
*/
var	TUMORRX = [
	/[Cc]rani[oe].*[Tt]umou?r/, /[Cc]rani[oe].*[Bb]iopsy/,
	/[Pp]etro/, /TSS/i,
	/[Tt]umou?r [Bb]iopsy|[Bb]iopsy.*[Tt]umou?r/,
	/[Tt]umou?r [Rr]emov/
]
var	VASCULARRX = [
	/bypass/, /[Cc]lip/, /[Ee]xcision.*AVM|AVM.*[Ee]xcision/
]
var	CSFRX = [
	/EVD/, /[Ll]umbar [Dd]rain/, /OMMAYA/i,
	/[Tt]ap [Tt]est/, /VP|LP|periton.*[Ss]hunt/
]
var	TRAUMARX = [
	/[Dd]ebridement/, /(clot|hematoma).*(removal|irrigation|evacuation)/
]
var	SPINERX = [
	/[Cc]ervical/, /\b[CTLS][\d]/, /[Ll]amin[eo]/,
	/[Ss]acr[ao]/, /[Ss]pin/, /[Tt]hora/
]
var ETCRX = [
	/[Cc/hange [Bb]attery/, /[Cc]ranioplast/, /DBS/, /grid/, /MVD/,
	/[Ll]esionectomy/, /[Ll]obectomy/, /rhizotomy/,
	/[Tt]racheos/, /VNS/
]

var	OPERATION = [
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
var	NOTOPERATION = [
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
