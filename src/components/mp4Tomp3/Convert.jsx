import React, { useState } from 'react';
import axios from 'axios';

const Convert = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const convertToAudio = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/v1/convert', { videoUrl });
      console.log(response)
      setAudioUrl(response.data.audioUrl);
    } catch (error) {
      console.error('Error converting video to audio:', error);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };  

  return (
    <div className="max-w-md mx-auto mt-8 p-8 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Video to Audio Converter</h1>
      <label className="block mb-4">
        Enter Video URL:
        <input
          className="w-full border border-gray-300 p-2 rounded"
          type="text" 
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </label>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
        onClick={convertToAudio}
      >
        Convert to Audio
      </button>

      {audioUrl && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Audio Preview:</h3>
          <audio className="w-full" controls>
            <source src={audioUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
          <div className="mt-4">
            {isPlaying ? (
              <button
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
                onClick={handlePause}
              >
                Pause
              </button>
            ) : (
              <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                onClick={handlePlay}
              >
                Play
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Convert;
