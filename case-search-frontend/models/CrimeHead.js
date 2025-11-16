const mongoose = require('mongoose');

const CrimeHeadSchema = new mongoose.Schema({
  name: {
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
  collection: 'crimeHeads',
});

const CrimeHead = mongoose.models.CrimeHead || mongoose.model('CrimeHead', CrimeHeadSchema);

module.exports = CrimeHead;

