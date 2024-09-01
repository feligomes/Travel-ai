import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  isLoading: boolean;
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isLoading, progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export function useFakeProgress(isLoading: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setProgress(0);
      const stages = [25, 50, 75];
      let currentStage = 0;

      interval = setInterval(() => {
        if (currentStage < stages.length) {
          setProgress(stages[currentStage]);
          currentStage++;
        }
      }, 5000);
    } else {
      setProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  return progress;
}

export default ProgressBar;