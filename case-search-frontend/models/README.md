# Case Search Database Models

This directory contains Mongoose models for the Case Search application.

## Models

### 1. Case Model (`Case.js`)
The main model for storing case information.

**Key Fields:**
- `caseNo`: Unique case number (indexed)
- `year`: Case year (indexed)
- `policeStation`: Police station name (indexed)
- `crimeHead`: Type of crime (indexed)
- `crimeSection` / `section`: IPC section
- `punishmentCategory`: Punishment category (≤7 yrs or >7 yrs)
- `caseStatus`: Current status (Disposed, Under investigation, Decision Pending)
- `investigationStatus`: Investigation status (Detected, Undetected)
- `priority`: Priority level (Under monitoring, Normal)
- `accused`: Array of accused persons with their details
- `warrant`, `proclamation`, `attachment`: Legal process information
- `reports`: Internal reports (R1, R2, R3, PR1, PR2, PR3, FPR, etc.)
- `chargeSheet`, `prosecutionSanction`, `fsl`: Prosecution-related information
- `injuryReport`, `pmReport`, `compensationProposal`: Victim-related information

**Virtual Fields:**
- `totalAccused`: Total number of accused
- `arrestedCount`: Number of arrested accused
- `unarrestedCount`: Number of unarrested accused

**Indexes:**
- `caseNo`, `year`
- `policeStation`, `year`
- `caseStatus`, `investigationStatus`
- `accused.name`, `accused.status`

### 2. Note Model (`Note.js`)
Stores notes/comments for cases.

**Key Fields:**
- `caseId`: Reference to Case document
- `caseNo`: Case number (for quick lookup)
- `content`: Note content
- `author`: Author name
- `createdAt`: Creation timestamp

**Indexes:**
- `caseId`, `createdAt`
- `caseNo`, `createdAt`

### 3. ReasonForPendency Model (`ReasonForPendency.js`)
Stores reasons for case pendency (admin-managed list).

**Key Fields:**
- `reason`: Reason text (unique)
- `isActive`: Whether the reason is active
- `createdBy`: User who created the reason

## Usage

```javascript
const { connectDB, Case, Note, ReasonForPendency } = require('./models');

// Connect to database
await connectDB();

// Create a new case
const newCase = new Case({
  caseNo: '77/2024',
  year: 2024,
  policeStation: 'Central PS',
  crimeHead: 'Fraud',
  crimeSection: '420 IPC',
  punishmentCategory: '>7 yrs',
  caseStatus: 'Under investigation',
  // ... other fields
});

await newCase.save();

// Find cases
const cases = await Case.find({ 
  policeStation: 'Central PS',
  year: 2024 
});

// Add a note
const note = new Note({
  caseId: newCase._id,
  caseNo: newCase.caseNo,
  content: 'Initial investigation completed.',
  author: 'Inspector John Doe',
});

await note.save();
```

## Database Connection

Set the `MONGODB_URI` environment variable:
```bash
MONGODB_URI=mongodb://localhost:27017/case-search
```

Or for MongoDB Atlas:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/case-search
```

## Installation

Make sure to install mongoose:
```bash
npm install mongoose
```

