
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser } from './use-user-role';

export type TrackedTopic = {
  topic: string;
  subject: string;
};

const defaultTopics: TrackedTopic[] = [
    { topic: 'Algebra', subject: 'Mathematics' },
    { topic: 'Calculus', subject: 'Mathematics' },
    { topic: 'Thermodynamics', subject: 'Physics' },
];

interface TrackedTopicsContextType {
  trackedTopics: TrackedTopic[];
  addTrackedTopic: (topic: TrackedTopic) => void;
  removeTrackedTopic: (topic: string) => void;
  clearTrackedTopics: () => void;
}

const TrackedTopicsContext = createContext<TrackedTopicsContextType | undefined>(undefined);

export const TrackedTopicsProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useUser();
  const [trackedTopics, setTrackedTopics] = useState<TrackedTopic[]>(defaultTopics);
  const [isMounted, setIsMounted] = useState(false);
  const topicsKey = `trackedTopics_${userId}`;

  useEffect(() => {
    setIsMounted(true);
    if (userId) {
        try {
            const item = window.localStorage.getItem(topicsKey);
            if (item) {
                const parsedTopics = JSON.parse(item);
                // Ensure it's an array, handle potential corruption
                if(Array.isArray(parsedTopics)) {
                    setTrackedTopics(parsedTopics);
                } else {
                    setTrackedTopics(defaultTopics);
                }
            } else {
                // If no topics are stored for the user, set the default ones.
                setTrackedTopics(defaultTopics);
            }
        } catch (error) {
            console.error('Error reading topics from localStorage', error);
            setTrackedTopics(defaultTopics);
        }
    }
  }, [userId, topicsKey]);

  useEffect(() => {
    if (isMounted && userId) {
      try {
        window.localStorage.setItem(topicsKey, JSON.stringify(trackedTopics));
      } catch (error) {
        console.error('Error saving topics to localStorage', error);
      }
    }
  }, [trackedTopics, isMounted, userId, topicsKey]);

  const addTrackedTopic = (topic: TrackedTopic) => {
    setTrackedTopics(prevTopics => {
        if (prevTopics.find(t => t.topic.toLowerCase() === topic.topic.toLowerCase())) {
            return prevTopics;
        }
        return [...prevTopics, topic];
    });
  };

  const removeTrackedTopic = (topicToRemove: string) => {
    setTrackedTopics(prevTopics => prevTopics.filter(t => t.topic !== topicToRemove));
  };

  const clearTrackedTopics = () => {
    setTrackedTopics([]);
  };
  
  const value = { trackedTopics, addTrackedTopic, removeTrackedTopic, clearTrackedTopics };

  if (!isMounted) {
    const defaultContext: TrackedTopicsContextType = {
        trackedTopics: defaultTopics,
        addTrackedTopic: () => {},
        removeTrackedTopic: () => {},
        clearTrackedTopics: () => {},
    };
    return (
        <TrackedTopicsContext.Provider value={defaultContext}>
            {children}
        </TrackedTopicsContext.Provider>
    );
  }

  return (
    <TrackedTopicsContext.Provider value={value}>
      {children}
    </TrackedTopicsContext.Provider>
  );
};

export const useTrackedTopics = () => {
  const context = useContext(TrackedTopicsContext);
  if (context === undefined) {
    throw new Error('useTrackedTopics must be used within a TrackedTopicsProvider');
  }
  return context;
};
