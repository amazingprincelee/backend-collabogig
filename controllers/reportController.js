import Report from '../models/report.js';

export const generateReport = async (req, res) => {
  try {
    const { title, type, data } = req.body;

    // Restrict to staff or admin
    if (!['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Staff or Admins only' });
    }

    const report = new Report({
      title,
      type,
      data,
      generatedBy: req.user.role === 'staff' ? req.user.staff : null, // Link to staff if applicable
    });

    await report.save();

    res.status(201).json({ message: 'Report generated successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const reports = await Report.find().populate('generatedBy', 'staffId department');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('generatedBy', 'staffId department');
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Restrict access to admins or the generator
    if (req.user.role !== 'admin' && report.generatedBy?.toString() !== req.user.staff) {
      return res.status(403).json({ message: 'Unauthorized: Admins or report generator only' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
};