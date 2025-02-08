import React from 'react';
import { View, Text } from 'react-native';

interface ReminderItemProps {
  heading: string;
  subtitle?: string;
  timeLeft: string;
  className?: string;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  heading,
  subtitle,
  timeLeft,
}) => {
  return (
    <View className="bg-black/10 rounded-xl m-auto w-fill mx-8 mt-4 p-4">
      <View className="space-y-1">
        <Text className="font-sans font-bold text-black text-2xl">
          {heading}
        </Text>
        
        {subtitle && (
          <Text className="text-md text-black">
            {subtitle}
          </Text>
        )}
        
        <Text className="text-lg text-light-blue mt-1 font-bold ml-auto">
          {timeLeft.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

export default ReminderItem;