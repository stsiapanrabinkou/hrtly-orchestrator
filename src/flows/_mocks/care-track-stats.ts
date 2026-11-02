/** Prepared cohort counts for combinations of care tracks. Patients are counted once. */
export const combinedCareTrackStats: Record<string, string[]> = {
  "ckm,eckm": ["45", "9", "9", "18"],
  "ckm,bh": ["54", "18", "18", "27"],
  "ckm,msk": ["45", "9", "9", "18"],
  "eckm,bh": ["36", "9", "9", "9"],
  "eckm,msk": ["18", "0", "0", "0"],
  "bh,msk": ["36", "9", "9", "9"],
  "ckm,eckm,bh": ["63", "18", "18", "27"],
  "ckm,eckm,msk": ["54", "9", "9", "18"],
  "ckm,bh,msk": ["63", "18", "18", "27"],
  "eckm,bh,msk": ["45", "9", "9", "9"],
  "ckm,eckm,bh,msk": ["72", "18", "18", "27"],
};
