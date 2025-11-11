const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true,
    index: true,
  },
  caseNo: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'notes',
});

// Indexes for better query performance
NoteSchema.index({ caseId: 1, createdAt: -1 });
NoteSchema.index({ caseNo: 1, createdAt: -1 });

const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

module.exports = Note;

