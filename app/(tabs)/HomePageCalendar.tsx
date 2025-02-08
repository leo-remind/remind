import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ViewStyle,
  Dimensions,
  useWindowDimensions
} from 'react-native';

interface DiaryCardProps {
  message: string;
  onSeeMorePress?: () => void;
  style?: ViewStyle;
  widthPercentage?: number;
  aspectRatio?: number;
}

const DiaryCard: React.FC<DiaryCardProps> = ({ 
  message, 
  onSeeMorePress = () => Alert.alert('See More', 'More details coming soon!'),
  style,
  widthPercentage = 0.9,
  aspectRatio = 0.65
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Calculate dynamic dimensions
  const cardWidth = useMemo(() => SCREEN_WIDTH * widthPercentage, [SCREEN_WIDTH, widthPercentage]);
  const cardHeight = useMemo(() => cardWidth * aspectRatio, [cardWidth, aspectRatio]);
  const borderRadius = cardWidth * 0.045;

  const getDynamicDateRange = useMemo(() => {
    const today = new Date();
    const currentDate = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Function to get last day of a month
    const getLastDayOfMonth = (year: number, month: number) => {
      return new Date(year, month + 1, 0).getDate();
    };

    // Previous month details
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastDayOfPrevMonth = getLastDayOfMonth(prevMonthYear, prevMonth);

    // Next month details
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    // Generate 7 dates with current date at the end
    const dates: { date: number; month: number; year: number }[] = [];

    for (let i = -6; i <= 0; i++) {
      let targetDate = currentDate + i;
      let targetMonth = currentMonth;
      let targetYear = currentYear;

      // Adjust for previous month dates
      if (targetDate < 1) {
        targetMonth = prevMonth;
        targetYear = prevMonthYear;
        targetDate = lastDayOfPrevMonth + targetDate;
      }
      // Adjust for next month dates
      else {
        const lastDayOfCurrentMonth = getLastDayOfMonth(currentYear, currentMonth);
        if (targetDate > lastDayOfCurrentMonth) {
          targetMonth = nextMonth;
          targetYear = nextMonthYear;
          targetDate -= lastDayOfCurrentMonth;
        }
      }

      dates.push({ date: targetDate, month: targetMonth, year: targetYear });
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      dates,
      monthNames,
      currentDate: { 
        date: currentDate, 
        month: currentMonth, 
        year: currentYear,
        monthName: monthNames[currentMonth]
      }
    };
  }, []);

  const [selectedDateInfo, setSelectedDateInfo] = useState(
    getDynamicDateRange.dates[6] // Last date in the sequence
  );

  const handleDatePress = (dateInfo: { date: number; month: number; year: number }): void => {
    setSelectedDateInfo(dateInfo);
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day % 10 === 1 && day % 100 !== 11) return 'st';
    if (day % 10 === 2 && day % 100 !== 12) return 'nd';
    if (day % 10 === 3 && day % 100 !== 13) return 'rd';
    return 'th';
  };

  const renderDateButtons = (): React.ReactNode => {
    const { dates } = getDynamicDateRange;
    
    return dates.map((dateInfo) => (
      <TouchableOpacity 
        key={`${dateInfo.date}-${dateInfo.month}`}
        style={[
          styles.dateButton, 
          dateInfo.date === selectedDateInfo.date && 
          dateInfo.month === selectedDateInfo.month && 
          styles.activeDateButton
        ]}
        onPress={() => handleDatePress(dateInfo)}
        accessibilityLabel={`Select date ${dateInfo.date}`}
      >
        <Text style={[
          styles.dateButtonText, 
          dateInfo.date === selectedDateInfo.date && 
          dateInfo.month === selectedDateInfo.month && 
          styles.activeDateButtonText
        ]}>
          {dateInfo.date}
        </Text>
      </TouchableOpacity>
    ));
  };

  const formattedDate = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const { monthNames } = getDynamicDateRange;

  const styles = StyleSheet.create({
    container: {
      marginTop: 120,
      width: cardWidth,
      height: cardHeight,
      backgroundColor: '#4D94FF',
      borderRadius: borderRadius,
      alignSelf: 'center',
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: cardWidth * 0.045,
      paddingVertical: cardHeight * 0.067,
    },
    dateButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: cardHeight * 0.167,
      backgroundColor: 'rgba(238, 238, 238, 0.5)',
      borderRadius: cardWidth,
      marginBottom: cardHeight * 0.067,
    },
    dateButton: {
      width: cardWidth * 0.1,
      height: cardWidth * 0.1,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: cardWidth * 0.01,
    },
    activeDateButton: {
      backgroundColor: '#000000',
      borderRadius: cardWidth * 0.1,
    },
    dateButtonText: {
      fontFamily: 'Avenir Next LT Pro',
      fontSize: cardWidth * 0.045,
      fontWeight: '600',
      color: '#4A5660',
    },
    activeDateButtonText: {
      color: '#FFFFFF',
    },
    memoryContainer: {
      width: '100%',
      marginBottom: cardHeight * 0.067,
    },
    selectedDateText: {
      fontFamily: 'DM Sans',
      fontSize: cardWidth * 0.067,
      color: '#FFFFFF',
      marginBottom: cardHeight * 0.033,
    },
    placeholderText: {
      fontFamily: 'DM Sans',
      fontSize: cardWidth * 0.05,
      color: '#FFFFFF',
      opacity: 0.7,
    },
    messageContainer: {
      width: '100%',
      marginBottom: cardHeight * 0.067,
    },
    messageText: {
      fontFamily: 'DM Sans',
      fontSize: cardWidth * 0.15,
      color: '#FFFFFF',
      lineHeight: cardHeight * 0.093,
    },
    tapMoreContainer: {
      width: '100%',
      position: 'absolute',
      bottom: cardHeight * 0.067,
      left: cardWidth * 0.045,
    },
    tapMoreText: {
      fontFamily: 'DM Sans',
      fontSize: cardWidth * 0.04,
      fontWeight: '700',
      color: '#000000',
      opacity: 0.5,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentContainer}>
        <View style={styles.dateButtonsContainer}>
          {renderDateButtons()}
        </View>
        
        <View style={styles.memoryContainer}>
          <Text style={styles.selectedDateText}>
            {selectedDateInfo.date}{getOrdinalSuffix(selectedDateInfo.date)} {monthNames[selectedDateInfo.month]}
          </Text>
          <Text style={styles.placeholderText}>Memories to come here</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.messageContainer}
          onPress={() => Alert.alert('Message', message)}
          accessibilityLabel="View message details"
        >
          <Text style={styles.messageText} numberOfLines={2} ellipsizeMode="tail">
            {message}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tapMoreContainer}
          onPress={onSeeMorePress}
          accessibilityLabel="See more details"
        >
          <Text style={styles.tapMoreText}>TAP TO SEE MORE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DiaryCard;