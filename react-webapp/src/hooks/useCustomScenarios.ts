import { useState, useEffect } from 'react';
import { Scenario } from '../types';
import { getUidFromUserProfile } from '../utils/getUserIdFromCookie';

const STORAGE_KEY = 'lingualife_custom_scenarios';

export const useCustomScenarios = () => {
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  // useEffect(() => {
  //   const userId = getUidFromUserProfile();
  //   setUid(userId);
  // }, []);

  useEffect(() => {
    const userId = getUidFromUserProfile();
    setUid(userId);

    console.log('uid:', uid);
    if (userId) {
      loadCustomScenario(userId);
    }
  }, []);

  const saveCustomScenario = (scenario: Scenario) => {
    const updated = [...customScenarios, scenario];
    setCustomScenarios(updated);
  };

  const deleteCustomScenario = (scenarioId: string) => {
    const updated = customScenarios.filter(s => s.id !== scenarioId);
    setCustomScenarios(updated);
  };

  const updateCustomScenario = (scenarioId: string, updates: Partial<Scenario>) => {
    const updated = customScenarios.map(s => 
      s.id === scenarioId ? { ...s, ...updates } : s
    );
    setCustomScenarios(updated);
  };

  const loadCustomScenario = async (uid: string) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/fetch`;
      console.log(url)
      console.log("HERE")
      console.log("UID", uid)

      const payload = {
        uid: uid,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.models && Array.isArray(data.models)) {
        setCustomScenarios(data.models); // 🎯 update state here
        // Optionally remove localStorage usage if API is the source of truth
      } else {
        console.warn("Unexpected response format:", data);
      }
      console.log(data)
      

      // Assuming data contains a message string
      // const formattedMessage = data.message.response.replace(/\n/g, '<br />');
    } catch (error) {
      console.error("Error fetching custom scenarios:", error);
    }
  }

  return {
    customScenarios,
    saveCustomScenario,
    deleteCustomScenario,
    updateCustomScenario,
    loadCustomScenario
  };
};
