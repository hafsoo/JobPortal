import { useEffect, useState } from 'react';
import API from '../api/axios';

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const statusStyle = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [totalApps, setTotalApps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await API.get('/jobs/mine');
        setJobs(data.jobs || []);
        setTotalApps(data.totalApplications || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setPosting(true);
    setFormError('');
    try {
      await API.post('/jobs', form);
      setForm({ title: '', description: '', location: '', salary: '' });
      setShowForm(false);
      setRefresh((r) => r + 1);
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create job');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    try {
      await API.delete(`/jobs/${id}`);
      if (selectedJob?._id === id) setSelectedJob(null);
      setRefresh((r) => r + 1);
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
    }
  };

  const openApplicants = async (job) => {
    setSelectedJob(job);
    setAppsLoading(true);
    try {
      const { data } = await API.get(`/applications/job/${job._id}`);
      setApplicants(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleStatus = async (appId, status) => {
    try {
      await API.patch(`/applications/${appId}/status`, { status });
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status } : a))
      );
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const activeJobs = jobs.filter((j) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(j.createdAt) >= thirtyDaysAgo;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your job postings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {showForm ? 'Cancel' : '+ Post a Job'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Jobs Posted" value={jobs.length} color="text-blue-600" />
        <StatCard label="Total Applications" value={totalApps} color="text-purple-600" />
        <StatCard label="Active Jobs (last 30 days)" value={activeJobs.length} color="text-green-600" />
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">New Job Posting</h2>
          {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Remote / Lahore"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary (optional)</label>
              <input
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. PKR 80,000/mo"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe the role, requirements..."
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={posting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
              >
                {posting ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-16 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No jobs posted yet. Click &quot;+ Post a Job&quot; to start.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Job title</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Salary</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Posted</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Applicants</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-900">{job.title}</td>
                  <td className="px-5 py-3 text-gray-500">{job.location}</td>
                  <td className="px-5 py-3 text-gray-500">{job.salary || '—'}</td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => openApplicants(job)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium underline underline-offset-2"
                    >
                      View applicants
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Applicants for: {selectedJob.title}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedJob.location}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
              >
                X
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4">
              {appsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  No applications received yet for this job.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Applied on</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">CV</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {app.seeker?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {app.seeker?.email || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`http://localhost:5000/${app.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs font-medium"
                          >
                            View CV
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium border px-2.5 py-1 rounded-full capitalize ${statusStyle[app.status]}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {app.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatus(app._id, 'accepted')}
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatus(app._id, 'rejected')}
                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default RecruiterDashboard;
