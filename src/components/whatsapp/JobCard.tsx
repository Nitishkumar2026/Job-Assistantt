import React from 'react';
import { Job } from '../../lib/types';
import { MapPin, DollarSign, Briefcase, Building2 } from 'lucide-react';

export const JobCard = ({ job }: { job: Job }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-[300px] my-2">
      <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-start">
        <div>
            <h3 className="font-bold text-gray-900">{job.title}</h3>
            <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                <Building2 size={14} />
                <span>{job.company}</span>
            </div>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            {job.type}
        </span>
      </div>
      
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-gray-400" />
          {job.city}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign size={16} className="text-gray-400" />
          {job.salary}
        </div>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {job.description}
        </p>
      </div>

      <div className="p-3 border-t border-gray-100 grid grid-cols-2 gap-2">
        <button className="text-sm font-medium text-gray-600 py-2 hover:bg-gray-50 rounded transition-colors">
            More Info
        </button>
        <button className="text-sm font-medium text-green-600 bg-green-50 py-2 hover:bg-green-100 rounded transition-colors">
            Apply Now
        </button>
      </div>
    </div>
  );
};
