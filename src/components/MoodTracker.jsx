import React, { useState } from 'react';
import { X } from 'lucide-react';

const MOODS = [
  { value: 'terrible', label: 'Terrible', emoji: '💀', color: 'text-red-500' },
  { value: 'bad', label: 'Bad', emoji: '😤', color: 'text-orange-500' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-gray-400' },
  { value: 'good', label: 'Good', emoji: '🔥', color: 'text-green-400' },
  { value: 'great', label: 'Great', emoji: '⚡', color: 'text-purple-400' },
];

const MoodTracker = ({ onClose, onLogMood, currentMood }) => {
  const [selectedMood, setSelectedMood] = useState(currentMood?.mood || null);
  const [note, setNote] = useState(currentMood?.note || '');

  const handleSubmit = () => {
    if (!selectedMood) return;
    onLogMood(selectedMood, note.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-charcoal border-t border-purple-light w-full max-w-md rounded-t-xl">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">How are you feeling?</h2>
            <button
              onClick={onClose}
              className="touch-target text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Be honest. The Spartan doesn't care about your comfort — but needs the data.
          </p>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                  selectedMood === mood.value
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-purple-light/30 bg-deep-black hover:border-purple-light'
                }`}
              >
                <span className="text-2xl mb-1">{mood.emoji}</span>
                <span className={`text-xs ${selectedMood === mood.value ? mood.color : 'text-gray-500'}`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Note (optional — no excuses though)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-deep-black border border-purple-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="What's going on?"
              rows={2}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="flex-1 touch-target px-4 py-2 bg-deep-black border border-purple-light text-gray-300 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedMood}
              className="flex-1 touch-target px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Log Mood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
