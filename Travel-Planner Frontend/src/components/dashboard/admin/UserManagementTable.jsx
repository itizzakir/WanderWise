import React from 'react';
import SectionTitle from '../shared/SectionTitle';

const statusStyles = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-yellow-100 text-yellow-700',
  DISABLED: 'bg-gray-200 text-gray-700',
};

const UserManagementTable = ({ users = [] }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 min-w-0">
      <SectionTitle title="User Management" actions={
          <div className="flex gap-2 text-gray-400">
              <span className="cursor-pointer hover:text-blue-600">{'<'}</span>
              <span className="cursor-pointer hover:text-blue-600">{'>'}</span>
          </div>
      } />
      <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm table-fixed">
          <thead className="text-gray-400 border-b">
              <tr>
                  <th className="pb-2 font-medium w-[34%]">User</th>
                  <th className="pb-2 font-medium w-[34%]">Email</th>
                  <th className="pb-2 font-medium w-[18%]">Status</th>
                  <th className="pb-2 font-medium w-[14%]">Actions</th>
              </tr>
          </thead>
          <tbody className="divide-y">
              {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <span className="font-medium text-gray-700 truncate" title={user.name}>
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-500 text-xs truncate" title={user.email}>
                        {user.email}
                      </td>
                      <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusStyles[user.status] || 'bg-gray-100 text-gray-700'}`}>
                              {user.status}
                          </span>
                      </td>
                      <td className="py-3">
                          <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700">View</button>
                      </td>
                  </tr>
              ))}
          </tbody>
      </table>
      </div>
      {users.length === 0 ? (
        <p className="text-xs text-gray-500 mt-3">No users found.</p>
      ) : null}
  </div>
);

export default UserManagementTable;
