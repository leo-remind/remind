import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useSQLiteContext } from 'expo-sqlite';

interface AddReminderModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({ isVisible, onClose }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const db = useSQLiteContext();

  const onDismissDate = () => {
    setShowDatePicker(false);
  };

  const onConfirmDate = (params: { date: Date }) => {
    setShowDatePicker(false);
    const newDate = new Date(date);
    newDate.setFullYear(params.date.getFullYear());
    newDate.setMonth(params.date.getMonth());
    newDate.setDate(params.date.getDate());
    setDate(newDate);
  };

  const onDismissTime = () => {
    setShowTimePicker(false);
  };

  const onConfirmTime = ({ hours, minutes }: { hours: number; minutes: number }) => {
    setShowTimePicker(false);
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setDate(newDate);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      await db.runAsync(
        'INSERT INTO reminders (reminder_time, reminder_text, subtitle, recurrencetype, recurrenceon, recurrencefrequency)  VALUES (?, ?, ?, "daily", "day", 1)',
        date.toISOString(), title.trim(), subtitle.trim()
      );

      setTitle('');
      setSubtitle('');
      setDate(new Date());
      onClose();
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white w-[90%] rounded-xl p-6">
          <Text className="text-2xl font-bold mb-4">Add Reminder</Text>

          <Text className="text-base mb-2">Title</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-2 mb-4"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter reminder title"
          />

          <Text className="text-base mb-2">Subtitle</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-2 mb-4"
            value={subtitle}
            onChangeText={setSubtitle}
            placeholder="Enter subtitle (optional)"
          />

          <Text className="text-base mb-2">Date & Time</Text>
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-1 bg-light-blue rounded-lg p-3"
            >
              <Text className="text-center">
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="flex-1 bg-light-blue rounded-lg p-3"
            >
              <Text className="text-center">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          <DatePickerModal
            locale="en"
            visible={showDatePicker}
            mode="single"
            onDismiss={onDismissDate}
            date={date}
            onConfirm={onConfirmDate}
          />

          <TimePickerModal
            visible={showTimePicker}
            onDismiss={onDismissTime}
            onConfirm={onConfirmTime}
            hours={date.getHours()}
            minutes={date.getMinutes()}
          />

          <View className="flex-row justify-end mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 mr-2"
            >
              <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Add Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
