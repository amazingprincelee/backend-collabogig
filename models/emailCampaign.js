import mongoose from 'mongoose';

const recipientSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  email: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed', 'opened', 'clicked'],
    default: 'pending'
  },
  sentAt: { 
    type: Date 
  },
  openedAt: { 
    type: Date 
  },
  clickedAt: { 
    type: Date 
  },
  error: { 
    type: String 
  }
}, { _id: true });

const emailCampaignSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  subject: { 
    type: String, 
    required: true,
    trim: true
  },
  body: { 
    type: String, 
    required: true 
  },
  templateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmailTemplate' 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipients: [recipientSchema],
  targetGroups: {
    classGroups: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'ClassGroup' 
    }],
    courseStatus: [{ 
      type: String, 
      enum: ['free', 'paid', 'not paid', 'pending']
    }]
  },
  scheduledFor: { 
    type: Date 
  },
  sentAt: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'sending', 'completed', 'failed'],
    default: 'draft'
  },
  stats: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field on save
emailCampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update stats when recipients are modified
emailCampaignSchema.pre('save', function(next) {
  if (this.isModified('recipients')) {
    const stats = this.recipients.reduce((acc, recipient) => {
      acc.total++;
      if (recipient.status === 'sent') acc.sent++;
      if (recipient.status === 'failed') acc.failed++;
      if (recipient.status === 'opened') acc.opened++;
      if (recipient.status === 'clicked') acc.clicked++;
      return acc;
    }, { total: 0, sent: 0, failed: 0, opened: 0, clicked: 0 });
    
    this.stats = stats;
  }
  next();
});

const EmailCampaign = mongoose.model('EmailCampaign', emailCampaignSchema);
export default EmailCampaign;