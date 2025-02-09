import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useState, useMemo, Suspense } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface DiaryCardProps {
  message: string;
  className?: string;
  widthPercentage?: number;
  aspectRatio?: number;
}

const Loading = () => {
  return (<Text>Loading...</Text>)
}

interface MemoryProps {
  day: number,
  month: number,
  year: number
}

const Memory: React.FC<MemoryProps> = ({ day, month, year }) => {
  const db = useSQLiteContext();
  
  const memory = db.getFirstSync("SELECT * FROM memory ORDER BY id DESC;");
  console.log("Queries for memory");
  // console.log("SELECT * FROM memory WHERE date = ?;", `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

  if (!memory) {
    return (
      <Text className="text-xl text-white/80">
        Seems like you have no memories of that day.
        Or I forgot too :-)
      </Text>
    )
  }

  return (
    <>
      <Text className="text-xxl text-white/80">
        {memory.name}
      </Text>
      <Text className="text-xl text-white/80">
        {memory.summary.length > 200 ? `${memory.summary.substring(0, 200)}...` : memory.summary}
      </Text>
    </>
  )
}

const DiaryCard: React.FC<DiaryCardProps> = ({
  message,
  className,
}) => {
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
        className={`
          w-10 h-10 flex items-center justify-center mx-1
          ${dateInfo.date === selectedDateInfo.date &&
          dateInfo.month === selectedDateInfo.month &&
          'bg-black rounded-full'
          }
        `}
        onPress={() => handleDatePress(dateInfo)}
        aria-label={`Select date ${dateInfo.date}`}
      >
        <Text
          className={`text-lg font-semibold
          ${dateInfo.date === selectedDateInfo.date &&
              dateInfo.month === selectedDateInfo.month
              ? 'text-white'
              : 'text-gray-600'
            }
        `}
        >
          {dateInfo.date}
        </Text>
      </TouchableOpacity>
    ));
  };

  const { monthNames } = getDynamicDateRange;

  return (
    <View className={`
       mx-auto bg-blue-500 rounded-3xl
      relative
      w-[90%] max-w-2xl min-h-96
      ${className || ''}
    `}>
    <View className="flex flex-col p-4">
        <View className="flex flex-row items-center justify-center w-full h-12 
                      bg-white/50 rounded-full mb-4">
          {renderDateButtons()}
        </View>

        <Link href={{
          pathname: `/calender/[date]`,
          params: {
            date: (new Date(selectedDateInfo.year, selectedDateInfo.month, selectedDateInfo.date, 0, 0, 0, 0)).getTime()
          }

        }} className="pl-2"
        ><View>
            <Text className="text-4xl text-white font-serif mb-2">
              {selectedDateInfo.date}
              {getOrdinalSuffix(selectedDateInfo.date)}{' '}
              {monthNames[selectedDateInfo.month]}
            </Text>
            <Suspense fallback={<Loading />}>
              <Memory day={selectedDateInfo.date} month={selectedDateInfo.month} year={selectedDateInfo.year} />
            </Suspense>
          </View>
        </Link>

        <TouchableOpacity
          className="w-full mb-6 text-left"
          onPress={() => alert(message)}
          aria-label="View message details"
        >
          <Text className="text-5xl text-white font-['DM_Sans'] leading-tight 
                       line-clamp-2">
            {message}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="absolute bottom-6 left-6"
          aria-label="See more details"
        >
          <Text className="text-base font-bold text-black/50">
            TAP TO SEE MORE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DiaryCard;
