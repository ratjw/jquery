
ALTER TABLE book
  ADD COLUMN `admitted` varchar(30) NOT NULL DEFAULT '' after discharge,
  ADD COLUMN `operated` varchar(30) NOT NULL DEFAULT '' after admitted,
  ADD COLUMN `doneday` date DEFAULT NULL after operated,
  ADD COLUMN `doneby` varchar(30) NOT NULL DEFAULT '' after doneday,
  ADD COLUMN `manner` varchar(30) NOT NULL DEFAULT '' after doneby,
  ADD COLUMN `scale` varchar(30) NOT NULL DEFAULT '' after manner,
  ADD COLUMN `disease` varchar(255) NOT NULL DEFAULT '' after scale,
  ADD COLUMN `nonsurgical` varchar(255) NOT NULL DEFAULT '' after disease,
  ADD COLUMN `infection` varchar(30) NOT NULL DEFAULT '' after nonsurgical,
  ADD COLUMN `morbid` varchar(30) NOT NULL DEFAULT '' after infection,
  ADD COLUMN `dead` varchar(30) NOT NULL DEFAULT '' after morbid;
