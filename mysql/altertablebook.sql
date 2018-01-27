
ALTER TABLE book
	ADD theatre varchar(255) NOT NULL DEFAULT '' AFTER casenum,
	ADD opday date AFTER discharge, 
	ADD readmit tinyint AFTER opday,
	ADD reoperate tinyint AFTER readmit,
	ADD elective varchar(255) NOT NULL DEFAULT '' AFTER reoperate,
	ADD doneby varchar(255) NOT NULL DEFAULT '' AFTER elective,
	ADD major varchar(255) NOT NULL DEFAULT '' AFTER doneby,
	ADD disease varchar(255) NOT NULL DEFAULT '' AFTER major,
	ADD infection tinyint AFTER disease,
	ADD morbid tinyint AFTER infection,
	ADD dead tinyint AFTER morbid;
