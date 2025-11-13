import jsPDF from 'jspdf';

interface CaseData {
  caseNo: string;
  year: number;
  policeStation: string;
  crimeHead: string;
  crimeSection: string;
  punishmentCategory: string;
  caseDate: string;
  caseStatus: string;
  investigationStatus?: string;
  srNsr?: string;
  priority: string;
  isPropertyProfessionalCrime: boolean;
  petition: boolean;
  reasonForPendency: string[];
  diary: Array<{ diaryNo: string; diaryDate: string }>;
  reports: {
    spReports: Array<{
      rLabel: string;
      rDate: string;
      prLabel: string;
      prDate: string;
    }>;
    supervision: string;
    fpr: string;
    finalOrder: string;
    finalChargesheet: string;
  };
  chargeSheet: {
    submitted: boolean;
    submissionDate: string;
  };
  finalChargesheetSubmitted: boolean;
  finalChargesheetSubmissionDate: string;
  prosecutionSanction: Array<{
    type: string;
    submissionDate: string;
    receiptDate: string;
  }>;
  fsl: Array<{
    reportRequired: boolean;
    sampleToBeCollected: string;
    sampleCollected: boolean;
    sampleCollectionDate: string;
    sampleSendingDate: string;
    reportReceived: boolean;
    reportReceivedDate: string;
    reportDate: string;
  }>;
  injuryReport: {
    report: boolean;
    injuryType: string;
    injuryDate: string;
    reportReceived: boolean;
    reportDate: string;
  };
  pmReport: {
    report: string;
    pmDate: string;
    reportReceived: boolean;
    reportDate: string;
  };
  compensationProposal: {
    required: boolean;
    submitted: boolean;
    submissionDate: string;
  };
  accused: Array<{
    name: string;
    status: string;
    address?: string;
    mobileNumber?: string;
    aadhaarNumber?: string;
    arrestedDate?: string;
    arrestedOn?: string;
    notice41A?: {
      issued?: boolean;
      notice1Date?: string;
      notice2Date?: string;
      notice3Date?: string;
    };
    warrant?: {
      prayed?: boolean;
      prayerDate?: string;
      receiptDate?: string;
      executionDate?: string;
      returnDate?: string;
    };
    proclamation?: {
      prayed?: boolean;
      prayerDate?: string;
      receiptDate?: string;
      executionDate?: string;
      returnDate?: string;
    };
    attachment?: {
      prayed?: boolean;
      prayerDate?: string;
      receiptDate?: string;
      executionDate?: string;
      returnDate?: string;
    };
  }>;
  notes?: Array<{
    content: string;
    author: string;
    createdAt: string;
  }>;
}

const formatDate = (dateInput: string | Date): string => {
  if (!dateInput) return 'N/A';
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const formatDateTime = (dateInput: string | Date): string => {
  if (!dateInput) return 'N/A';
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

export const generateCasePDF = (caseData: CaseData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkNewPage = (requiredSpace: number = lineHeight) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with wrapping
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, x: number = margin) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    lines.forEach((line: string) => {
      checkNewPage();
      doc.text(line, x, yPosition);
      yPosition += lineHeight;
    });
  };

  // Helper function to add a section header
  const addSectionHeader = (title: string) => {
    checkNewPage(10);
    yPosition += 5;
    doc.setFillColor(59, 130, 246); // Blue color
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;
  };

  // Helper function to add a key-value pair
  const addKeyValue = (key: string, value: string | number | boolean, indent: number = 0) => {
    checkNewPage();
    const x = margin + indent;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(key + ':', x, yPosition);
    doc.setFont('helvetica', 'normal');
    const valueText = String(value === undefined || value === null || value === '' ? 'N/A' : value);
    const valueLines = doc.splitTextToSize(valueText, pageWidth - x - margin - 20);
    doc.text(valueLines, x + 35, yPosition);
    yPosition += valueLines.length * lineHeight;
  };

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CASE DETAIL REPORT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Case Number
  doc.setFontSize(14);
  doc.text(`Case No: ${caseData.caseNo}/${caseData.year}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Basic Information Section
  addSectionHeader('Basic Information');
  addKeyValue('Case Number', `${caseData.caseNo}/${caseData.year}`);
  addKeyValue('Police Station', caseData.policeStation);
  addKeyValue('Crime Head', caseData.crimeHead);
  addKeyValue('Section', caseData.crimeSection);
  addKeyValue('Punishment Category', caseData.punishmentCategory);
  if (caseData.caseDate && caseData.caseDate.trim() !== '') {
    addKeyValue('Case Date', formatDate(caseData.caseDate));
  }
  addKeyValue('Case Status', caseData.caseStatus);
  if (caseData.investigationStatus) {
    addKeyValue('Investigation Status', caseData.investigationStatus);
  }
  if (caseData.srNsr) {
    addKeyValue('SR/NSR', caseData.srNsr);
  }
  addKeyValue('Priority', caseData.priority);
  addKeyValue('Property/Professional Crime', caseData.isPropertyProfessionalCrime ? 'Yes' : 'No');
  addKeyValue('Petition', caseData.petition ? 'Yes' : 'No');

  // Reason for Pendency
  if (caseData.reasonForPendency && caseData.reasonForPendency.length > 0) {
    checkNewPage();
    yPosition += 3;
    addKeyValue('Reason for Pendency', caseData.reasonForPendency.join(', '));
  }

  // Diary Entries
  if (caseData.diary && caseData.diary.length > 0) {
    addSectionHeader('Diary Entries');
    caseData.diary.forEach((entry, index) => {
      checkNewPage();
      addKeyValue(`Diary ${index + 1} - Number`, entry.diaryNo || 'N/A', 5);
      if (entry.diaryDate && entry.diaryDate.trim() !== '') {
        addKeyValue(`Diary ${index + 1} - Date`, formatDate(entry.diaryDate), 5);
      }
      yPosition += 2;
    });
  }

  // Accused Information
  if (caseData.accused && caseData.accused.length > 0) {
    addSectionHeader('Accused Information');
    caseData.accused.forEach((accused, index) => {
      checkNewPage(15);
      yPosition += 3;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Accused ${index + 1}:`, margin + 5, yPosition);
      yPosition += 7;
      addKeyValue('Name', accused.name, 10);
      addKeyValue('Status', accused.status, 10);
      if (accused.address && String(accused.address).trim() !== '') {
        addKeyValue('Address', accused.address, 10);
      }
      if (accused.mobileNumber && String(accused.mobileNumber).trim() !== '') {
        addKeyValue('Mobile Number', accused.mobileNumber, 10);
      }
      if (accused.aadhaarNumber && String(accused.aadhaarNumber).trim() !== '') {
        addKeyValue('Aadhaar Number', accused.aadhaarNumber, 10);
      }
      if (accused.arrestedDate && String(accused.arrestedDate).trim() !== '') {
        addKeyValue('Arrested Date', formatDate(String(accused.arrestedDate)), 10);
      }
      if (accused.arrestedOn && String(accused.arrestedOn).trim() !== '') {
        addKeyValue('Arrested On', formatDate(String(accused.arrestedOn)), 10);
      }

      // Notice 41A
      if (accused.notice41A?.issued) {
        checkNewPage();
        yPosition += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Notice 41A:', margin + 10, yPosition);
        yPosition += 6;
        if (accused.notice41A.notice1Date && String(accused.notice41A.notice1Date).trim() !== '') {
          addKeyValue('Notice 1 Date', formatDate(String(accused.notice41A.notice1Date)), 15);
        }
        if (accused.notice41A.notice2Date && String(accused.notice41A.notice2Date).trim() !== '') {
          addKeyValue('Notice 2 Date', formatDate(String(accused.notice41A.notice2Date)), 15);
        }
        if (accused.notice41A.notice3Date && String(accused.notice41A.notice3Date).trim() !== '') {
          addKeyValue('Notice 3 Date', formatDate(String(accused.notice41A.notice3Date)), 15);
        }
      }

      // Warrant
      if (accused.warrant?.prayed) {
        checkNewPage();
        yPosition += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Warrant:', margin + 10, yPosition);
        yPosition += 6;
        if (accused.warrant.prayerDate && String(accused.warrant.prayerDate).trim() !== '') {
          addKeyValue('Prayer Date', formatDate(String(accused.warrant.prayerDate)), 15);
        }
        if (accused.warrant.receiptDate && String(accused.warrant.receiptDate).trim() !== '') {
          addKeyValue('Receipt Date', formatDate(String(accused.warrant.receiptDate)), 15);
        }
        if (accused.warrant.executionDate && String(accused.warrant.executionDate).trim() !== '') {
          addKeyValue('Execution Date', formatDate(String(accused.warrant.executionDate)), 15);
        }
        if (accused.warrant.returnDate && String(accused.warrant.returnDate).trim() !== '') {
          addKeyValue('Return Date', formatDate(String(accused.warrant.returnDate)), 15);
        }
      }

      // Proclamation
      if (accused.proclamation?.prayed) {
        checkNewPage();
        yPosition += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Proclamation:', margin + 10, yPosition);
        yPosition += 6;
        if (accused.proclamation.prayerDate && String(accused.proclamation.prayerDate).trim() !== '') {
          addKeyValue('Prayer Date', formatDate(String(accused.proclamation.prayerDate)), 15);
        }
        if (accused.proclamation.receiptDate && String(accused.proclamation.receiptDate).trim() !== '') {
          addKeyValue('Receipt Date', formatDate(String(accused.proclamation.receiptDate)), 15);
        }
        if (accused.proclamation.executionDate && String(accused.proclamation.executionDate).trim() !== '') {
          addKeyValue('Execution Date', formatDate(String(accused.proclamation.executionDate)), 15);
        }
        if (accused.proclamation.returnDate && String(accused.proclamation.returnDate).trim() !== '') {
          addKeyValue('Return Date', formatDate(String(accused.proclamation.returnDate)), 15);
        }
      }

      // Attachment
      if (accused.attachment?.prayed) {
        checkNewPage();
        yPosition += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Attachment:', margin + 10, yPosition);
        yPosition += 6;
        if (accused.attachment.prayerDate && String(accused.attachment.prayerDate).trim() !== '') {
          addKeyValue('Prayer Date', formatDate(String(accused.attachment.prayerDate)), 15);
        }
        if (accused.attachment.receiptDate && String(accused.attachment.receiptDate).trim() !== '') {
          addKeyValue('Receipt Date', formatDate(String(accused.attachment.receiptDate)), 15);
        }
        if (accused.attachment.executionDate && String(accused.attachment.executionDate).trim() !== '') {
          addKeyValue('Execution Date', formatDate(String(accused.attachment.executionDate)), 15);
        }
        if (accused.attachment.returnDate && String(accused.attachment.returnDate).trim() !== '') {
          addKeyValue('Return Date', formatDate(String(accused.attachment.returnDate)), 15);
        }
      }
      yPosition += 3;
    });
  }

  // Reports Section
  const spReports = caseData.reports.spReports || [];
  const hasReports =
    spReports.some(report => report.rLabel || report.rDate || report.prLabel || report.prDate) ||
    [caseData.reports.supervision, caseData.reports.fpr, caseData.reports.finalOrder, caseData.reports.finalChargesheet]
      .some(value => typeof value === 'string' && value.trim() !== '');

  if (hasReports) {
    addSectionHeader('Reports');
    if (spReports.length > 0) {
      spReports.forEach((report, index) => {
        checkNewPage();
        yPosition += 3;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Report ${index + 1}:`, margin + 5, yPosition);
        yPosition += 7;
        if (report.rLabel && String(report.rLabel).trim() !== '') {
          addKeyValue('R Label', report.rLabel, 10);
        }
        if (report.rDate && String(report.rDate).trim() !== '') {
          addKeyValue('R Date', formatDate(String(report.rDate)), 10);
        }
        if (report.prLabel && String(report.prLabel).trim() !== '') {
          addKeyValue('PR Label', report.prLabel, 10);
        }
        if (report.prDate && String(report.prDate).trim() !== '') {
          addKeyValue('PR Date', formatDate(String(report.prDate)), 10);
        }
        yPosition += 2;
      });
    }
    if (caseData.reports.supervision && caseData.reports.supervision.trim() !== '') addKeyValue('Supervision Date', formatDate(caseData.reports.supervision));
    if (caseData.reports.fpr && caseData.reports.fpr.trim() !== '') addKeyValue('FPR Date', formatDate(caseData.reports.fpr));
    if (caseData.reports.finalOrder && caseData.reports.finalOrder.trim() !== '') addKeyValue('Final Order Date', formatDate(caseData.reports.finalOrder));
    if (caseData.reports.finalChargesheet && caseData.reports.finalChargesheet.trim() !== '') addKeyValue('Final Chargesheet Date', formatDate(caseData.reports.finalChargesheet));
  }

  // Chargesheet submitted in VO Section
  addSectionHeader('Chargesheet submitted in VO');
  addKeyValue('Chargesheet submitted in VO', caseData.chargeSheet.submitted ? 'Yes' : 'No');
  if (caseData.chargeSheet.submissionDate && caseData.chargeSheet.submissionDate.trim() !== '') {
    addKeyValue('Submission Date (VO)', formatDate(caseData.chargeSheet.submissionDate));
  }
  addKeyValue('Chargesheet submitted in Court', caseData.finalChargesheetSubmitted ? 'Yes' : 'No');
  if (caseData.finalChargesheetSubmissionDate && caseData.finalChargesheetSubmissionDate.trim() !== '') {
    addKeyValue('Submission Date (Court)', formatDate(caseData.finalChargesheetSubmissionDate));
  }

  // Prosecution Sanction
  if (caseData.prosecutionSanction && caseData.prosecutionSanction.length > 0) {
    addSectionHeader('Prosecution Sanction');
    caseData.prosecutionSanction.forEach((sanction, index) => {
      checkNewPage();
      yPosition += 3;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Sanction ${index + 1}:`, margin + 5, yPosition);
      yPosition += 7;
      addKeyValue('Type', sanction.type, 10);
      if (sanction.submissionDate && String(sanction.submissionDate).trim() !== '') {
        addKeyValue('Submission Date', formatDate(String(sanction.submissionDate)), 10);
      }
      if (sanction.receiptDate && String(sanction.receiptDate).trim() !== '') {
        addKeyValue('Receipt Date', formatDate(String(sanction.receiptDate)), 10);
      }
      yPosition += 2;
    });
  }

  // FSL/Forensic Section
  if (caseData.fsl && caseData.fsl.length > 0) {
    addSectionHeader('FSL/Forensic Reports');
    caseData.fsl.forEach((fsl, index) => {
      checkNewPage(20);
      yPosition += 3;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`FSL Report ${index + 1}:`, margin + 5, yPosition);
      yPosition += 7;
      addKeyValue('Report Required', fsl.reportRequired ? 'Yes' : 'No', 10);
      if (fsl.sampleToBeCollected) {
        addKeyValue('Sample To Be Collected', fsl.sampleToBeCollected, 10);
      }
      addKeyValue('Sample Collected', fsl.sampleCollected ? 'Yes' : 'No', 10);
      if (fsl.sampleCollectionDate && String(fsl.sampleCollectionDate).trim() !== '') {
        addKeyValue('Sample Collection Date', formatDate(String(fsl.sampleCollectionDate)), 10);
      }
      if (fsl.sampleSendingDate && String(fsl.sampleSendingDate).trim() !== '') {
        addKeyValue('Sample Sending Date', formatDate(String(fsl.sampleSendingDate)), 10);
      }
      addKeyValue('Report Received', fsl.reportReceived ? 'Yes' : 'No', 10);
      if (fsl.reportReceivedDate && String(fsl.reportReceivedDate).trim() !== '') {
        addKeyValue('Report Received Date', formatDate(String(fsl.reportReceivedDate)), 10);
      }
      if (fsl.reportDate && String(fsl.reportDate).trim() !== '') {
        addKeyValue('Report Date', formatDate(String(fsl.reportDate)), 10);
      }
      yPosition += 2;
    });
  }

  // Injury Report Section
  addSectionHeader('Injury Report');
  addKeyValue('Report Required', caseData.injuryReport.report ? 'Yes' : 'No');
  if (caseData.injuryReport.injuryType && caseData.injuryReport.injuryType.trim() !== '') {
    addKeyValue('Injury Type', caseData.injuryReport.injuryType, 0);
  }
  if (caseData.injuryReport.injuryDate && caseData.injuryReport.injuryDate.trim() !== '') {
    addKeyValue('Injury Date', formatDate(caseData.injuryReport.injuryDate));
  }
  addKeyValue('Report Received', caseData.injuryReport.reportReceived ? 'Yes' : 'No');
  if (caseData.injuryReport.reportDate && caseData.injuryReport.reportDate.trim() !== '') {
    addKeyValue('Report Date', formatDate(caseData.injuryReport.reportDate));
  }

  // PM Report Section
  addSectionHeader('PM Report');
  addKeyValue('Report', caseData.pmReport.report || 'N/A');
  if (caseData.pmReport.pmDate && caseData.pmReport.pmDate.trim() !== '') {
    addKeyValue('PM Date', formatDate(caseData.pmReport.pmDate));
  }
  addKeyValue('Report Received', caseData.pmReport.reportReceived ? 'Yes' : 'No');
  if (caseData.pmReport.reportDate && caseData.pmReport.reportDate.trim() !== '') {
    addKeyValue('Report Date', formatDate(caseData.pmReport.reportDate));
  }

  // Compensation Proposal Section
  addSectionHeader('Compensation Proposal');
  addKeyValue('Compensation Proposal Required', caseData.compensationProposal.required ? 'Yes' : 'No');
  addKeyValue('Compensation Proposal Submitted', caseData.compensationProposal.submitted ? 'Yes' : 'No');
  if (caseData.compensationProposal.submissionDate && caseData.compensationProposal.submissionDate.trim() !== '') {
    addKeyValue('Submission Date', formatDate(caseData.compensationProposal.submissionDate));
  }

  // Notes Section
  if (caseData.notes && caseData.notes.length > 0) {
    addSectionHeader('Notes');
    caseData.notes.forEach((note, index) => {
      checkNewPage(15);
      yPosition += 3;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Note ${index + 1} - ${note.author} (${formatDateTime(note.createdAt)})`, margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(note.content, pageWidth - 2 * margin - 10);
      noteLines.forEach((line: string) => {
        checkNewPage();
        doc.text(line, margin + 10, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 3;
    });
  }

  // Footer with generation date
  // Get total pages - jsPDF 3.x uses internal.pages array
  // Type assertion needed due to outdated type definitions
  const internal = doc.internal as any;
  const totalPages = internal.pages?.length || 1;
  
  // Add footer to each page
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    const generatedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    doc.text(
      `Generated on ${generatedDate} - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  // Generate PDF
  const fileName = `Case_${caseData.caseNo}_${caseData.year}_Report.pdf`;
  doc.save(fileName);
};

