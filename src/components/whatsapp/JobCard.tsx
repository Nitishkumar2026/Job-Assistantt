import React, { useState } from 'react';
import { Job } from '../../lib/types';
import { MapPin, DollarSign, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface JobCardProps {
    job: Job;
    isApplied?: boolean;
    onApply?: () => void;
}

export const JobCard = ({ job, isApplied = false, onApply }: JobCardProps) => {
  const [loading, setLoading] = useState(false);

  const handleApplyClick = async () => {
    if (isApplied || !onApply) return;
    setLoading(true);
    await onApply();
    setLoading(false);
  };

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
        
        <button 
            onClick={handleApplyClick}
            disabled={isApplied || loading}
            className={cn(
                "text-sm font-medium py-2 rounded transition-colors flex items-center justify-center gap-1",
                isApplied 
                    ? "bg-green-100 text-green-700 cursor-default" 
                    : "bg-green-50 text-green-600 hover:bg-green-100"
            )}
        >
            {loading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : isApplied ? (
                <>
                    <CheckCircle2 size={14} />
                    Applied
                </>
            ) : (
                "Apply Now"
            )}
        </button>
      </div>
    </div>
  );
};
