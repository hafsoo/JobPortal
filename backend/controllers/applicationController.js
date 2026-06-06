const Application = require('../models/Application');

exports.applyToJob = async (req, res) => {
  try {
    const already = await Application.findOne({ job: req.params.jobId, seeker: req.user.id });
    if (already) return res.status(400).json({ message: 'Already applied' });

    const application = await Application.create({
      job: req.params.jobId,
      seeker: req.user.id,
       resume: `uploads/${req.file.filename}`  // only relative path
      //resume: req.file.path
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ seeker: req.user.id })
      .populate('job', 'title location company')
      .sort('-createdAt');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobApplicants = async (req, res) => {
  try {
    const apps = await Application.find({ job: req.params.jobId })
      .populate('seeker', 'name email');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getJobApplicants = async (req, res) => {
  try {
    const apps = await Application.find({ job: req.params.jobId })
      .populate('seeker', 'name email')
      .sort('-createdAt');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};