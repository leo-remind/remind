import DiaryCard from "@/components/ui/memories/DiaryCard";
import { StyleSheet, Image, Platform, View, Text, SafeAreaView } from "react-native";

export default function MemoriesScreen() {
  return <SafeAreaView className="flex-1 bg-white overflow-y-auto">
    <View className="flex-row justify-between items-start px-8 pt-8 ">
      <View>
        <Text className="text-4xl font-sans">Your</Text>
        <Text className="text-4xl font-sans text-orange font-bold">Memories</Text>
      </View>
      <Text className="text-8xl font-sans text-orange">*</Text>
    </View>
    <View className="flex flex-row justify-between px-8 mb-2">
      <Text className="text-xl font-bold font-sans">Calender</Text>
      <Text className="underline text-orange font-sans text-xl">List All</Text>
    </View>
    <DiaryCard message="" className="bg-light-orange" />
    <View className="flex flex-row justify-between px-8 mt-4 mb-2">
      <Text className="text-xl font-bold font-sans">Trips</Text>
      <Text className="underline text-orange font-sans text-xl">List All</Text>
    </View>
    <Trips />

    <View className="flex flex-row justify-between px-8 mt-4 mb-2">
      <Text className="text-xl font-bold font-sans">People</Text>
      <Text className="underline text-orange font-sans text-xl">List All</Text>
    </View>
    <People />

  </SafeAreaView>
}

function Trips() {
  return <View className="bg-white overflow-y-auto">
    <TripCarousel items={[
      { "src": "https://upload.wikimedia.org/wikipedia/en/f/fa/Binding_of_isaac_header.jpg", "heading": "Mohali", "subheading": "19th-20th Feb" },
      { "src": "https://upload.wikimedia.org/wikipedia/en/f/fa/Binding_of_isaac_header.jpg", "heading": "Bangcok", "subheading": "19th-20th Feb" },
      { "src": "https://upload.wikimedia.org/wikipedia/en/f/fa/Binding_of_isaac_header.jpg", "heading": "Bangcok", "subheading": "19th-20th Feb" },
      { "src": "https://upload.wikimedia.org/wikipedia/en/f/fa/Binding_of_isaac_header.jpg", "heading": "Bangcok", "subheading": "19th-20th Feb" },
    ]} />
  </View>
}

function People() {
  return <View><PeopleGrid
    profiles={[
      { "imageUrl": "https://res.cloudinary.com/devolver-digital/image/upload/v1637791227/mothership/enter-the-gungeon/mothership-etg-poster.png", text: "Arnav Rustagi" },
      { "imageUrl": "https://res.cloudinary.com/devolver-digital/image/upload/v1637791227/mothership/enter-the-gungeon/mothership-etg-poster.png", text: "Arnav Rustagi" },
      { "imageUrl": "https://res.cloudinary.com/devolver-digital/image/upload/v1637791227/mothership/enter-the-gungeon/mothership-etg-poster.png", text: "Arnav Rustagi" },
    ]}
  />
  </View>;
}

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
  imageSize = 'lg'
}) => {

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40'
  };

  return (
    <View className="flex flex-wrap gap-8 p-8 m-auto flex-row">
      {profiles.map((profile, index) => (
        <View key={index} className="flex flex-col items-center">
          <View
            className={`
              rounded-full 
              overflow-hidden 
              ${sizeClasses[imageSize]} 
            `}
          >
            <Image
              source={{ uri: profile.imageUrl || "/api/placeholder/96/96" }}
              alt={profile.text}
              className="w-full h-full object-cover"
            />
          </View>
          <Text className="mt-2 text-center text-lg font-sans">{profile.text}</Text>
        </View>
      ))}
    </View>
  );
};

interface CarouselItem {
  src: string;
  heading: string;
  subheading: string;
}

interface TripCarouselProps {
  items: CarouselItem[];
}

const TripCarousel: React.FC<TripCarouselProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <View className="w-full overflow-x-auto overflow-y-none pl-2">
      <View className="flex gap-4 p-4 flex-row">
        {items.map((item, index) => (
          <View
            key={index}
            className="relative flex-shrink-0 w-64 h-96 rounded-xl overflow-hidden"
          >
            <Image
              source={item.src}
              alt={item.heading}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <View className="absolute inset-0 bg-linear-to-t from-black to-black" />
            <View className="absolute bottom-0 left-0 p-4 text-white">
              <Text className="text-3xl font-bold text-white font-sans">
                {item.heading}
              </Text>
              <Text className="text-lg text-white font-sans">
                {item.subheading}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
