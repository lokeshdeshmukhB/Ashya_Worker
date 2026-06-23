import React from 'react';

const StepWizard = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary-500 -z-10 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <button
                onClick={() => isCompleted && onStepClick(index)}
                disabled={!isCompleted}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 border-4
                  ${isCompleted 
                    ? 'bg-primary-600 text-white border-primary-600 cursor-pointer hover:bg-primary-700' 
                    : isCurrent 
                      ? 'bg-white text-primary-600 border-primary-600 shadow-md scale-110' 
                      : 'bg-white text-gray-400 border-gray-200'}
                `}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span 
                className={`
                  mt-2 text-xs font-semibold uppercase tracking-wider absolute top-10 w-32 text-center
                  ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}
                `}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-12">
        {/* Spacer for the absolute positioned labels */}
      </div>
    </div>
  );
};

export default StepWizard;
