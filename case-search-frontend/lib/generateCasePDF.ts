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
  publicPetitionFile?: {
    original_filename: string;
    secure_url: string;
  };
  reasonForPendency: string[];
  diary: Array<{ diaryNo: string; diaryDate: string }>;
  reports: {
    spReports: Array<{
      label: string;
      date: string;
      file?: any;
    }>;
    dspReports: Array<{
      label: string;
      date: string;
      file?: any;
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

  // Force New Page helper
  const forceNewPage = () => {
    doc.addPage();
    yPosition = margin;
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
  const addSectionHeader = (title: string, startOnNewPage: boolean = true) => {
    if (startOnNewPage) {
      forceNewPage();
    } else {
      checkNewPage(15);
    }

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
    const valueLines = doc.splitTextToSize(valueText, pageWidth - x - margin - 30);
    doc.text(valueLines, x + 45, yPosition); // Increased gap for value
    yPosition += valueLines.length * lineHeight;
  };

  // --- PDF CONTENT STARTS HERE ---

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CASE DETAIL REPORT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Case Number
  doc.setFontSize(14);
  doc.text(`Case No: ${caseData.caseNo}/${caseData.year}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // 1. Basic Information Section (First Page)
  addSectionHeader('Basic Information', false);
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

  if (caseData.reasonForPendency && caseData.reasonForPendency.length > 0) {
    yPosition += 3;
    checkNewPage();
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Reason for Pendency:', margin, yPosition);
    yPosition += 5;
    caseData.reasonForPendency.forEach(reason => {
      addText(`• ${reason}`, 9, false, margin + 5);
    });
  }

  // 2. Diary Entries
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

  // 3. Accused Information
  if (caseData.accused && caseData.accused.length > 0) {
    addSectionHeader('Accused Information');
    caseData.accused.forEach((accused, index) => {
      if (index > 0) {
        checkNewPage(20);
        yPosition += 5;
        // Divider line between accused
        doc.setDrawColor(200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      }

      checkNewPage(15);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Accused ${index + 1}: ${accused.name}`, margin + 5, yPosition);
      yPosition += 7;

      addKeyValue('Name', accused.name, 10);
      addKeyValue('Status', accused.status, 10);
      if (accused.address) addKeyValue('Address', accused.address, 10);
      if (accused.mobileNumber) addKeyValue('Mobile Number', accused.mobileNumber, 10);
      if (accused.aadhaarNumber) addKeyValue('Aadhaar Number', accused.aadhaarNumber, 10);
      if (accused.arrestedDate) addKeyValue('Arrested Date', formatDate(accused.arrestedDate), 10);
      if (accused.arrestedOn) addKeyValue('Arrested On', formatDate(accused.arrestedOn), 10);

      // Notice 41A
      if (accused.notice41A?.issued) {
        checkNewPage();
        yPosition += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Notice 41A:', margin + 10, yPosition);
        yPosition += 6;
        if (accused.notice41A.notice1Date) addKeyValue('Notice 1 Date', formatDate(accused.notice41A.notice1Date), 15);
        if (accused.notice41A.notice2Date) addKeyValue('Notice 2 Date', formatDate(accused.notice41A.notice2Date), 15);
        if (accused.notice41A.notice3Date) addKeyValue('Notice 3 Date', formatDate(accused.notice41A.notice3Date), 15);
      }

      // Warrant
      if (accused.warrant?.prayed) {
        checkNewPage();
        yPosition += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Warrant:', margin + 10, yPosition);
        yPosition += 6;
        if (accused.warrant.prayerDate) addKeyValue('Prayer Date', formatDate(accused.warrant.prayerDate), 15);
        if (accused.warrant.receiptDate) addKeyValue('Receipt Date', formatDate(accused.warrant.receiptDate), 15);
        if (accused.warrant.executionDate) addKeyValue('Execution Date', formatDate(accused.warrant.executionDate), 15);
        if (accused.warrant.returnDate) addKeyValue('Return Date', formatDate(accused.warrant.returnDate), 15);
      }

      // Proclamation
      if (accused.proclamation?.prayed) {
        checkNewPage();
        yPosition += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Proclamation:', margin + 10, yPosition);
        yPosition += 6;
        if (accused.proclamation.prayerDate) addKeyValue('Prayer Date', formatDate(accused.proclamation.prayerDate), 15);
        if (accused.proclamation.receiptDate) addKeyValue('Receipt Date', formatDate(accused.proclamation.receiptDate), 15);
        if (accused.proclamation.executionDate) addKeyValue('Execution Date', formatDate(accused.proclamation.executionDate), 15);
        if (accused.proclamation.returnDate) addKeyValue('Return Date', formatDate(accused.proclamation.returnDate), 15);
      }

      // Attachment
      if (accused.attachment?.prayed) {
        checkNewPage();
        yPosition += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Attachment:', margin + 10, yPosition);
        yPosition += 6;
        if (accused.attachment.prayerDate) addKeyValue('Prayer Date', formatDate(accused.attachment.prayerDate), 15);
        if (accused.attachment.receiptDate) addKeyValue('Receipt Date', formatDate(accused.attachment.receiptDate), 15);
        if (accused.attachment.executionDate) addKeyValue('Execution Date', formatDate(accused.attachment.executionDate), 15);
        if (accused.attachment.returnDate) addKeyValue('Return Date', formatDate(accused.attachment.returnDate), 15);
      }
      yPosition += 3;
    });
  }

  // 4. Reports Section
  const spReports = caseData.reports.spReports || [];
  const dspReports = caseData.reports.dspReports || [];

  const hasReports = spReports.length > 0 || dspReports.length > 0 ||
    caseData.reports.supervision || caseData.reports.fpr ||
    caseData.reports.finalOrder || caseData.reports.finalChargesheet;

  if (hasReports) {
    addSectionHeader('Reports');

    // SP Reports
    if (spReports.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SP Reports:', margin + 2, yPosition);
      yPosition += 6;

      spReports.forEach((report, index) => {
        checkNewPage();
        addKeyValue(`SP Report ${index + 1}`, `${report.label || 'N/A'} - ${report.date ? formatDate(report.date) : 'No Date'}`, 5);
      });
      yPosition += 5;
    }

    // Supervision
    if (caseData.reports.supervision) {
      addKeyValue('Supervision Date', formatDate(caseData.reports.supervision));
      yPosition += 2;
    }

    // DSP Reports
    if (dspReports.length > 0) {
      checkNewPage();
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DSP Reports:', margin + 2, yPosition);
      yPosition += 6;

      dspReports.forEach((report, index) => {
        checkNewPage();
        addKeyValue(`DSP Report ${index + 1}`, `${report.label || 'N/A'} - ${report.date ? formatDate(report.date) : 'No Date'}`, 5);
      });
      yPosition += 5;
    }

    if (caseData.reports.fpr) addKeyValue('FPR Date', formatDate(caseData.reports.fpr));
    if (caseData.reports.finalOrder) addKeyValue('Final Order Date', formatDate(caseData.reports.finalOrder));
    if (caseData.reports.finalChargesheet) addKeyValue('Final Chargesheet Date', formatDate(caseData.reports.finalChargesheet));
  }

  // 5. Chargesheet submitted in VO Section
  addSectionHeader('Chargesheet Information');
  addKeyValue('Chargesheet submitted in VO', caseData.chargeSheet.submitted ? 'Yes' : 'No');
  if (caseData.chargeSheet.submissionDate) {
    addKeyValue('Submission Date (VO)', formatDate(caseData.chargeSheet.submissionDate));
  }
  addKeyValue('Chargesheet submitted in Court', caseData.finalChargesheetSubmitted ? 'Yes' : 'No');
  if (caseData.finalChargesheetSubmissionDate) {
    addKeyValue('Submission Date (Court)', formatDate(caseData.finalChargesheetSubmissionDate));
  }

  // 6. Prosecution Sanction
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
      if (sanction.submissionDate) addKeyValue('Submission Date', formatDate(sanction.submissionDate), 10);
      if (sanction.receiptDate) addKeyValue('Receipt Date', formatDate(sanction.receiptDate), 10);
      yPosition += 2;
    });
  }

  // 7. FSL/Forensic Section
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
      if (fsl.sampleToBeCollected) addKeyValue('Sample To Be Collected', fsl.sampleToBeCollected, 10);
      addKeyValue('Sample Collected', fsl.sampleCollected ? 'Yes' : 'No', 10);
      if (fsl.sampleCollectionDate) addKeyValue('Sample Collection Date', formatDate(fsl.sampleCollectionDate), 10);
      if (fsl.sampleSendingDate) addKeyValue('Sample Sending Date', formatDate(fsl.sampleSendingDate), 10);
      addKeyValue('Report Received', fsl.reportReceived ? 'Yes' : 'No', 10);
      if (fsl.reportReceivedDate) addKeyValue('Report Received Date', formatDate(fsl.reportReceivedDate), 10);
      if (fsl.reportDate) addKeyValue('Report Date', formatDate(fsl.reportDate), 10);
      yPosition += 2;
    });
  }

  // 8. Injury Report Section
  addSectionHeader('Injury Report');
  addKeyValue('Report Required', caseData.injuryReport.report ? 'Yes' : 'No');
  if (caseData.injuryReport.injuryType) addKeyValue('Injury Type', caseData.injuryReport.injuryType, 0);
  if (caseData.injuryReport.injuryDate) addKeyValue('Injury Date', formatDate(caseData.injuryReport.injuryDate));
  addKeyValue('Report Received', caseData.injuryReport.reportReceived ? 'Yes' : 'No');
  if (caseData.injuryReport.reportDate) addKeyValue('Report Date', formatDate(caseData.injuryReport.reportDate));

  // 9. PM Report Section
  addSectionHeader('PM Report');
  addKeyValue('Report', caseData.pmReport.report || 'N/A');
  if (caseData.pmReport.pmDate) addKeyValue('PM Date', formatDate(caseData.pmReport.pmDate));
  addKeyValue('Report Received', caseData.pmReport.reportReceived ? 'Yes' : 'No');
  if (caseData.pmReport.reportDate) addKeyValue('Report Date', formatDate(caseData.pmReport.reportDate));

  // 10. Compensation Proposal Section
  addSectionHeader('Compensation Proposal');
  addKeyValue('Compensation Proposal Required', caseData.compensationProposal.required ? 'Yes' : 'No');
  addKeyValue('Compensation Proposal Submitted', caseData.compensationProposal.submitted ? 'Yes' : 'No');
  if (caseData.compensationProposal.submissionDate) {
    addKeyValue('Submission Date', formatDate(caseData.compensationProposal.submissionDate));
  }

  // 11. Petition Section
  if (caseData.petition || caseData.publicPetitionFile) {
    addSectionHeader('Petition');
    addKeyValue('Petition Filed', caseData.petition ? 'Yes' : 'No');
    if (caseData.publicPetitionFile) {
      addKeyValue('Petition File', caseData.publicPetitionFile.original_filename || 'File Available');
    }
  }

  // 12. Notes Section
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
  const internal = doc.internal as any;
  const totalPages = internal.pages?.length || 1;

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
