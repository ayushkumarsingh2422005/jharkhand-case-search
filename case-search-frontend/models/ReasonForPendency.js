const mongoose = require('mongoose');

const ReasonForPendencySchema = new mongoose.Schema({
  reason: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'reasonForPendency',
});

const ReasonForPendency = mongoose.models.ReasonForPendency || mongoose.model('ReasonForPendency', ReasonForPendencySchema);

module.exports = ReasonForPendency;

