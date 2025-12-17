import { CheckIcon } from "lucide-react";
import React from "react";

export interface StepItem {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomStepsProps {
  current: number;
  items: StepItem[];
  onChange?: (current: number) => void;
  direction?: "horizontal" | "vertical";
  responsive?: boolean;
  contentAlignment?: "left" | "center" | "right";
  completedSteps?: number[];
}

export const Steps: React.FC<CustomStepsProps> = ({
  current,
  items,
  onChange,
  direction = "horizontal",
  responsive = true,
  contentAlignment = "center",
  completedSteps = [],
}) => {
  const isStepCompleted = (stepIndex: number) => stepIndex < current || completedSteps.includes(stepIndex);
  const isStepInProgress = (stepIndex: number) => stepIndex === current;

  const handleStepClick = (stepIndex: number) => {
    if (onChange) {
      // Allow clicking on:
      // 1. Current step
      // 2. Any step that has been completed
      // 3. The immediate next step if current is completed
      if (stepIndex === current) return;
      
      if (stepIndex < current) {
        // Going back to previous steps is always allowed
        onChange(stepIndex);
      } else if (stepIndex === current + 1) {
        // Going to next step is allowed if current step is completed
        if (isStepCompleted(current)) {
          onChange(stepIndex);
        }
      } else if (completedSteps.includes(stepIndex)) {
        // Jumping to any previously completed step is allowed
        onChange(stepIndex);
      }
    }
  };

  // Default icon for steps
  const defaultIcon = (stepIndex: number) => {
    if (isStepCompleted(stepIndex)) {
      return <CheckIcon className="w-5 h-5" />;
    }
    return <span className="text-sm font-medium">{stepIndex + 1}</span>;
  };

  // Check if the LEFT connector should be completed (connector from previous step to current)
  const isLeftConnectorCompleted = (stepIndex: number) => {
    return stepIndex <= current && stepIndex > 0;
  };

  // Check if the RIGHT connector should be completed (connector from current step to next)
  const isRightConnectorCompleted = (stepIndex: number) => {
    return stepIndex < current;
  };

  return (
    <div
      className={`
        custom-steps 
        ${
          direction === "vertical"
            ? "flex flex-col"
            : "flex flex-row justify-between"
        }
        ${responsive ? "responsive-steps" : ""}
        w-full
      `}
    >
      {items.map((item, index) => {
        const completed = isStepCompleted(index);
        const inProgress = isStepInProgress(index);
        const leftConnectorCompleted = isLeftConnectorCompleted(index);
        const rightConnectorCompleted = isRightConnectorCompleted(index);

        return (
          <div
            key={index}
            className={`
              step-item 
              ${
                direction === "horizontal"
                  ? "flex flex-col items-center text-center relative flex-1"
                  : "flex flex-col items-center text-center relative"
              }
              ${
                onChange && (index <= current || completedSteps.includes(index))
                  ? "cursor-pointer hover:opacity-80 transition-opacity"
                  : "cursor-default"
              }
              ${direction === "vertical" ? "min-h-20" : ""}
            `}
            onClick={() => handleStepClick(index)}
          >
            {/* Horizontal Layout */}
            {direction === "horizontal" && (
              <>
                {/* Left Connector Line (except for first item) */}
                {index > 0 && (
                  <div
                    className={`
                      absolute left-0 top-6 h-0.5 w-1/2 -translate-x-full
                      transition-all duration-200
                      ${leftConnectorCompleted ? "bg-[#CC5500]" : "bg-gray-200"}
                      z-0
                    `}
                  />
                )}

                {/* Step Icon */}
                <div
                  className={`
                    step-icon 
                    flex items-center justify-center 
                    w-12 h-12 rounded-full 
                    transition-all duration-200
                    relative z-10 mb-3
                    
                    ${
                      completed
                        ? "bg-[#CC5500] text-white"
                        : inProgress
                        ? "bg-[#CC5500] text-white"
                        : "bg-white border border-gray-300 text-gray-400 dark:bg-[#00000040] dark:bg-[#303030]"
                    }
                    ${onChange && (index <= current || completedSteps.includes(index)) ? "hover:scale-105" : ""}
                  `}
                >
                  {item.icon || defaultIcon(index)}
                </div>

                {/* Step Content */}
                <div className="w-full">
                  <span
                    className={`
                      step-title 
                      text-sm font-medium block
                      ${
                        completed || inProgress
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    `}
                  >
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="step-description text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                      {item.description}
                    </span>
                  )}
                </div>

                {/* Right Connector Line (except for last item) */}
                {index < items.length - 1 && (
                  <div
                    className={`
                      absolute right-0 top-6 h-0.5 w-1/2 translate-x-full
                      transition-all duration-200
                      ${
                        rightConnectorCompleted ? "bg-[#CC5500]" : "bg-gray-200"
                      }
                      z-0
                    `}
                  />
                )}
              </>
            )}

            {/* Vertical Layout */}
            {direction === "vertical" && (
              <>
                {/* Step Icon and Connector Container */}
                <div className="flex flex-col items-center w-full">
                  {/* Step Icon */}
                  <div
                    className={`
                      step-icon 
                      flex items-center justify-center 
                      w-10 h-10 rounded-full border-2 
                      transition-all duration-200
                      z-10 mb-3 mt-3
                      ${
                        completed
                          ? "bg-[#CC5500] border-[#CC5500] text-white"
                          : inProgress
                          ? "bg-[#CC5500] border-[#CC5500] text-white"
                          : "bg-white border border-gray-300 text-gray-400 dark:bg-[#00000040] dark:border-[#00000040]"
                      }
                      ${onChange && (index <= current || completedSteps.includes(index)) ? "hover:scale-105" : ""}
                    `}
                  >
                    {item.icon || defaultIcon(index)}
                  </div>

                  {/* Step Content - Title below the step number */}
                  <div
                    className={`w-full mb-4 ${
                      contentAlignment === "center"
                        ? "text-center"
                        : contentAlignment === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {/* Show title only on larger screens */}
                    <span
                      className={`
                        step-title 
                        text-sm font-medium hidden sm:block
                        ${
                          completed || inProgress
                            ? "text-[#CC5500]"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      `}
                    >
                      {item.title}
                    </span>
                    {item.description && (
                      <span className="step-description text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                        {item.description}
                      </span>
                    )}
                  </div>

                  {/* Vertical Connector Line (except for last item) */}
                  {index < items.length - 1 && (
                    <div
                      className={`
                        step-connector 
                        w-0.5 h-8
                        transition-all duration-200
                        ${
                          rightConnectorCompleted
                            ? "bg-[#CC5500]"
                            : "bg-gray-200 dark:bg-gray-700"
                        }
                      `}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Steps;