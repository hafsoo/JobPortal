const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid' });
  }
};

const recruiterOnly = (req, res, next) => {
  if (req.user.role !== 'recruiter')
    return res.status(403).json({ message: 'Recruiters only' });
  next();
};

const seekerOnly = (req, res, next) => {
  if (req.user.role !== 'jobseeker')
    return res.status(403).json({ message: 'Job seekers only' });
  next();
};

module.exports = { protect, recruiterOnly, seekerOnly };