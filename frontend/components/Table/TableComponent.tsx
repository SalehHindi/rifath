"use client";

interface TableData {
  id: number;
  name: string;
  role: string;
  department: string;
  status: string;
}

const tableData: TableData[] = [
  { id: 1, name: "John Doe", role: "Developer", department: "Engineering", status: "Active" },
  { id: 2, name: "Jane Smith", role: "Designer", department: "Design", status: "Active" },
  { id: 3, name: "Bob Johnson", role: "Manager", department: "Operations", status: "On Leave" },
  { id: 4, name: "Alice Williams", role: "Analyst", department: "Data", status: "Active" },
  { id: 5, name: "Charlie Brown", role: "Developer", department: "Engineering", status: "Active" },
];

export function TableComponent() {
  return (
    <div className="w-full h-full min-h-[400px] bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Sample Data Table</h3>
        <p className="text-sm text-gray-500 mt-1">A simple table with sample data</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      row.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

