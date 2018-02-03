
ALTER TABLE book
	ADD theatre varchar(255) NOT NULL DEFAULT '' AFTER casenum,
	ADD opday date AFTER discharge, 
	ADD elective varchar(255) NOT NULL DEFAULT '' AFTER opday,
	ADD doneby varchar(255) NOT NULL DEFAULT '' AFTER elective,
	ADD major varchar(255) NOT NULL DEFAULT '' AFTER doneby,
	ADD disease varchar(255) NOT NULL DEFAULT '' AFTER major,
	ADD readmit tinyint(1) AFTER disease,
	ADD reoperate tinyint(1) AFTER readmit,
	ADD infection tinyint(1) AFTER reoperate,
	ADD morbid tinyint(1) AFTER infection,
	ADD dead tinyint(1) AFTER morbid;

update book set readmit=1 where locate("[[:<:]]re-ad",admission);
update book set reoperate=1 where locate("[[:<:]]re-op",treatment);
update book set infection=1 where locate("[[:<:]]SSI",final);
update book set infection=1 where locate("[[:<:]]Infect",final);
update book set morbid=1 where locate("[[:<:]]Morbid",final);
update book set dead=1 where locate("[[:<:]]Dead",final);
update book set dead=1 where locate("[[:<:]]passed away",final);
