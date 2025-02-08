
import { StyleSheet, Image, Platform, View, Text } from "react-native";
import React from 'react';

interface People {
  imageUrl?: string;
  text: string;
}

interface PeopleGridProps {
  profiles: People[];
  imageSize?: 'sm' | 'md' | 'lg';
}

const PeopleGrid: React.FC<PeopleGridProps> = ({ 
  profiles, 
  imageSize = 'md' 
}) => {
  const colors = ['bg-pink-100', 'bg-orange-100', 'bg-green-100', 'bg-blue-100'];
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <View className="flex flex-wrap gap-8 p-4">
      {profiles.map((profile, index) => (
        <View key={index} className="flex flex-col items-center">
          <View 
            className={`
              rounded-full 
              overflow-hidden 
              ${sizeClasses[imageSize]} 
              ${colors[index % colors.length]}
            `}
          >
            <Image
              src={profile.imageUrl || "/api/placeholder/96/96"} 
              alt={profile.text} 
              className="w-full h-full object-cover"
            />
          </View>
          <Text className="mt-2 text-center font-medium">{profile.text}</Text>
        </View>
      ))}
    </View>
  );
};

export default PeopleGrid;