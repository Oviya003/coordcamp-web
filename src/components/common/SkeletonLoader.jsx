import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full animate-pulse">
            <div className="h-4 bg-gray-200 rounded-full w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded-full w-1/2 mb-6"></div>
            <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
          </div>
        );
      case 'list':
        return (
          <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-3 animate-pulse w-full">
            <div className="h-4 bg-gray-200 rounded-full w-full"></div>
            <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-full w-4/6"></div>
          </div>
        );
      default:
        return (
          <div className="h-32 bg-gray-200 rounded-2xl w-full animate-pulse"></div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </div>
  );
}
