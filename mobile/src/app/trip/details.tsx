import { View, Text } from "react-native";

type Props = {
  tripId: string;
}

export function Details({tripId}: {tripId: string}){
  return (
  <View className="flex-1">
    <Text className="text-white"> {tripId}</Text>
  </View>
  )
}