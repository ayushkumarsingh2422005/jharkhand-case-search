const mongoose = require('mongoose');

// Schema for Notice 41A
const Notice41ASchema = new mongoose.Schema({
  issued: {
    type: Boolean,
    default: false,
  },
  notice1Date: {
    type: Date,
  },
  notice2Date: {
    type: Date,
  },
  notice3Date: {
    type: Date,
  },
}, { _id: false });

// Schema for Warrant/Proclamation/Attachment
const LegalProcessSchema = new mongoose.Schema({
  prayed: {
    type: Boolean,
    default: false,
  },
  prayerDate: {
    type: Date,
  },
  receiptDate: {
    type: Date,
  },
  executionDate: {
    type: Date,
  },
  returnDate: {
    type: Date,
  },
}, { _id: false });

// Schema for Accused
const AccusedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Arrested', 'Not arrested', 'Decision pending', 'Not Arrested', 'True', 'False', 'Decision Pending'],
    required: true,
  },
  arrestedDate: {
    type: Date,
  },
  arrestedOn: {
    type: Date,
  },
  notice41A: {
    type: Notice41ASchema,
  },
  warrant: {
    type: LegalProcessSchema,
  },
  proclamation: {
    type: LegalProcessSchema,
  },
  attachment: {
    type: LegalProcessSchema,
  },
}, { _id: true });

// Schema for Reports
const ReportInfoSchema = new mongoose.Schema({
  r1: {
    type: Date,
  },
  supervision: {
    type: Date,
  },
  r2: {
    type: Date,
  },
  r3: {
    type: Date,
  },
  pr1: {
    type: Date,
  },
  pr2: {
    type: Date,
  },
  pr3: {
    type: Date,
  },
  fpr: {
    type: Date,
  },
  finalOrder: {
    type: Date,
  },
  finalChargesheet: {
    type: Date,
  },
}, { _id: false });

// Schema for Charge Sheet
const ChargeSheetSchema = new mongoose.Schema({
  submitted: {
    type: Boolean,
    default: false,
  },
  submissionDate: {
    type: Date,
  },
}, { _id: false });

// Schema for Prosecution Sanction
const ProsecutionSanctionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  submissionDate: {
    type: Date,
  },
  receiptDate: {
    type: Date,
  },
}, { _id: true });

// Schema for FSL/Forensic
const FSLSchema = new mongoose.Schema({
  reportRequired: {
    type: Boolean,
    default: false,
  },
  sampleToBeCollected: {
    type: String,
  },
  sampleCollected: {
    type: Boolean,
    default: false,
  },
  sampleCollectionDate: {
    type: Date,
  },
  sampleSendingDate: {
    type: Date,
  },
  reportReceived: {
    type: Boolean,
    default: false,
  },
  reportReceivedDate: {
    type: Date,
  },
  reportDate: {
    type: Date,
  },
}, { _id: false });

// Schema for Injury Report
const InjuryReportSchema = new mongoose.Schema({
  report: {
    type: Boolean,
    default: false,
  },
  injuryDate: {
    type: Date,
  },
  reportReceived: {
    type: Boolean,
    default: false,
  },
  reportDate: {
    type: Date,
  },
}, { _id: false });

// Schema for PM Report
const PMReportSchema = new mongoose.Schema({
  report: {
    type: String,
    enum: ['Yes', 'No', 'N/A'],
  },
  pmDate: {
    type: Date,
  },
  reportReceived: {
    type: Boolean,
    default: false,
  },
  reportDate: {
    type: Date,
  },
}, { _id: false });

// Schema for Compensation Proposal
const CompensationProposalSchema = new mongoose.Schema({
  required: {
    type: Boolean,
    default: false,
  },
  submitted: {
    type: Boolean,
    default: false,
  },
  submissionDate: {
    type: Date,
  },
}, { _id: false });

// Main Case Schema
const CaseSchema = new mongoose.Schema({
  caseNo: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  year: {
    type: Number,
    required: true,
    index: true,
  },
  policeStation: {
    type: String,
    required: true,
    index: true,
  },
  crimeHead: {
    type: String,
    required: true,
    index: true,
  },
  crimeSection: {
    type: String,
    required: true,
  },
  section: {
    type: String,
  },
  punishmentCategory: {
    type: String,
    enum: ['≤7 yrs', '>7 yrs', '≤7"', '>7'],
    required: true,
  },
  caseDate: {
    type: Date,
  },
  caseStatus: {
    type: String,
    enum: ['Disposed', 'Under investigation', 'Decision Pending'],
    required: true,
    index: true,
  },
  investigationStatus: {
    type: String,
    enum: ['Detected', 'Undetected'],
  },
  srNsr: {
    type: String,
    enum: ['SR', 'NSR'],
  },
  priority: {
    type: String,
    enum: ['Under monitoring', 'Normal'],
  },
  isPropertyProfessionalCrime: {
    type: Boolean,
    default: false,
  },
  petition: {
    type: Boolean,
    default: false,
  },
  reasonForPendency: [{
    type: String,
  }],
  diary: [{
    diaryNo: {
      type: String,
    },
    diaryDate: {
      type: Date,
    },
  }],
  // Accused information
  accused: [AccusedSchema],
  // Reports
  reports: {
    type: ReportInfoSchema,
  },
  // Prosecution information
  chargeSheet: {
    type: ChargeSheetSchema,
  },
  finalChargesheetSubmitted: {
    type: Boolean,
    default: false,
  },
  finalChargesheetSubmissionDate: {
    type: Date,
  },
  prosecutionSanction: [ProsecutionSanctionSchema],
  fsl: [FSLSchema],
  // Victim information
  injuryReport: {
    type: InjuryReportSchema,
  },
  pmReport: {
    type: PMReportSchema,
  },
  compensationProposal: {
    type: CompensationProposalSchema,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'cases',
});

// Indexes for better query performance
CaseSchema.index({ caseNo: 1, year: 1 });
CaseSchema.index({ policeStation: 1, year: 1 });
CaseSchema.index({ caseStatus: 1, investigationStatus: 1 });
CaseSchema.index({ 'accused.name': 1 });
CaseSchema.index({ 'accused.status': 1 });
CaseSchema.index({ createdAt: -1 });

// Virtual for total accused count
CaseSchema.virtual('totalAccused').get(function() {
  return this.accused ? this.accused.length : 0;
});

// Virtual for arrested count
CaseSchema.virtual('arrestedCount').get(function() {
  if (!this.accused) return 0;
  return this.accused.filter(a => 
    a.status === 'Arrested' || a.status === 'True'
  ).length;
});

// Virtual for unarrested count
CaseSchema.virtual('unarrestedCount').get(function() {
  if (!this.accused) return 0;
  return this.accused.filter(a => 
    a.status === 'Not arrested' || a.status === 'Not Arrested' || a.status === 'False'
  ).length;
});

// Ensure virtuals are included in JSON
CaseSchema.set('toJSON', { virtuals: true });
CaseSchema.set('toObject', { virtuals: true });

const Case = mongoose.models.Case || mongoose.model('Case', CaseSchema);

module.exports = Case;

