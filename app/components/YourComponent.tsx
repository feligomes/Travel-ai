import React, { useState } from 'react';
import ProgressBar, { useFakeProgress } from './ProgressBar';

const YourComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const progress = useFakeProgress(isLoading);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Your API call here
      await yourApiCall();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        Submit
      </button>
      {isLoading && <ProgressBar isLoading={isLoading} progress={progress} />}
    </div>
  );
};

export default YourComponent;