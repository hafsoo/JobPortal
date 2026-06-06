import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import API from '../api/axios';

const JobCard = ({ job, onApplied, alreadyApplied }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(alreadyApplied);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!file) return setError('Please select your resume first');
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      await API.post(`/applications/${job._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      if (onApplied) onApplied();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {job.recruiter?.name || 'Company'} &middot; {job.location}
          </p>
        </div>
        {job.salary && (
          <span className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
            {job.salary}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

      {user?.role === 'jobseeker' && (
        <>
          {success ? (
            <span className="inline-block text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              Applied successfully
            </span>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-gray-50 hover:file:bg-gray-100"
              />
              <button
                onClick={handleApply}
                disabled={loading}
                className="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition"
              >
                {loading ? 'Applying...' : 'Apply'}
              </button>
            </div>
          )}
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
};

export default JobCard;