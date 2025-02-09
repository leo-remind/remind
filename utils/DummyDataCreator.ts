import React, { useState } from 'react';
import { View, Button, Text, ScrollView } from 'react-native';
import { useSQLiteContext } from "expo-sqlite/next";
import { createDummyData, verifyDummyData } from './DummyDataCreator';

export default function DummyDataTester() {
  const db = useSQLiteContext();
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const handleCreateData = async () => {
    setIsLoading(true);
    try {
      const { personIds, totalConversations } = await createDummyData(db);
      addLog(`✅ Created ${Object.keys(personIds).length} persons`);
      addLog(`✅ Created ${totalConversations} conversations`);
      
      // Verify the data
      const verificationResults = await verifyDummyData(db);
      addLog('\nVerification Results:');
      addLog(`📊 Persons: ${verificationResults.persons.length}`);
      addLog(`📊 Conversations: ${verificationResults.conversations.length}`);
      addLog(`📊 Person-Conversation Relations: ${verificationResults.person_conversations.length}`);

      // Show some sample data
      addLog('\nSample Conversation:');
      const sampleConv = verificationResults.conversations[0];
      addLog(`Summary: ${sampleConv.summary}`);
      addLog(`Time: ${new Date(sampleConv.time_created).toLocaleString()}`);

    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleClearData = async () => {
    setIsLoading(true);
    try {
      await db.runAsync('BEGIN TRANSACTION;');
      
      await db.runAsync('DELETE FROM person_conversations;');
      await db.runAsync('DELETE FROM conversations;');
      await db.runAsync('DELETE FROM persons;');
      
      await db.runAsync('COMMIT;');
      addLog('🧹 All dummy data cleared');
      
    } catch (error) {
      await db.runAsync('ROLLBACK;');
      addLog(`❌ Error clearing data: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <View className="flex-1 p-4">
      <View className="flex-row justify-around mb-4">
        <Button
          onPress={handleCreateData}
          title="Create Dummy Data"
          disabled={isLoading}
        />
        <Button
          onPress={handleClearData}
          title="Clear All Data"
          disabled={isLoading}
        />
      </View>

      <ScrollView className="flex-1 bg-gray-50 p-2 rounded">
        {results.map((result, index) => (
          <Text key={index} className="mb-2">{result}</Text>
        ))}
      </ScrollView>
    </View>
  );
}