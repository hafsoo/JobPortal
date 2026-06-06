import { useEffect, useState } from "react";
import API from "../api/axios";

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const statusStyle = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

const SeekerDashboard = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/applications/mine")
      .then(({ data }) => setApps(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const count = (status) =>
    apps.filter((app) => app.status === status).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Applications
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track all your job applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Applied"
          value={apps.length}
          color="text-blue-600"
        />
        <StatCard
          label="Pending"
          value={count("pending")}
          color="text-yellow-500"
        />
        <StatCard
          label="Accepted"
          value={count("accepted")}
          color="text-green-600"
        />
        <StatCard
          label="Rejected"
          value={count("rejected")}
          color="text-red-500"
        />
      </div>

      {/* Applications */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          You haven't applied to any jobs yet.{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Browse jobs
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Job
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Location
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Applied On
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Resume
                </th>
              </tr>
            </thead>

            <tbody>
              {apps.map((app) => (
                <tr
                  key={app._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {app.job?.title || "Job Removed"}
                  </td>

                  <td className="px-5 py-3 text-gray-500">
                    {app.job?.location || "—"}
                  </td>

                  <td className="px-5 py-3 text-gray-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium border px-2.5 py-1 rounded-full capitalize ${
                        statusStyle[app.status]
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    {app.resume ? (
                      <a
                        href={`http://localhost:5000/${app.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View Resume
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        No Resume
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;