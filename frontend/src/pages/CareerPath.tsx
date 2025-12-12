import { useState, useEffect } from 'react';

interface CareerData {
  // Define the shape of your career data here
  // For example:
  title: string;
  description: string;
  steps: string[];
}

function CareerPath() {
  const [data, setData] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Example API call to your backend.
    // Adjust the endpoint to match your backend's API.
    fetch('/api/paths/software-engineer')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: CareerData) => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) return <div>Loading career path...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{data?.title}</h1>
      <p className="mt-2">{data?.description}</p>
      <ul className="list-disc list-inside mt-4">
        {data?.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </div>
  );
}

export default CareerPath;