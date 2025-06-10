import Partner from '../models/partnersReferral.js';

// Controller to handle partner-related operations
export const createPartner = async (req, res) => {
  try {
    const newPartner = new Partner(req.body);
    await newPartner.save();
    res.status(201).json(newPartner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePartnerPercentages = async (req, res) => {
  try {
    const { partnerId, percentages } = req.body;
    const partner = await Partner.findByIdAndUpdate(partnerId, { percentages }, { new: true });
    res.status(200).json(partner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPartnerDetails = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const partner = await Partner.findById(partnerId);
    res.status(200).json(partner);
  } catch (error) {
    res.status(404).json({ error: 'Partner not found' });
  }
};