import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
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
  description: { 
    type: String,
    trim: true
  },
  category: { 
    type: String, 
    enum: ['announcement', 'reminder', 'promotion', 'general', 'custom'], 
    default: 'general' 
  },
  variables: [{ 
    type: String,
    trim: true
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
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
emailTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
export default EmailTemplate;