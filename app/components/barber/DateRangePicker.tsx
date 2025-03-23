import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Calendar } from "react-native-calendars"
import dayjs from "dayjs"

type DateRange = {
  startDate: string
  endDate: string
}

interface DateRangePickerProps {
  range: DateRange
  onRangeChange: (range: DateRange) => void
  presets?: {
    label: string
    range: DateRange
  }[]
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  range,
  onRangeChange,
  presets = [
    {
      label: "This Week",
      range: {
        startDate: dayjs().startOf("week").format("YYYY-MM-DD"),
        endDate: dayjs().endOf("week").format("YYYY-MM-DD"),
      },
    },
    {
      label: "This Month",
      range: {
        startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
        endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
      },
    },
    {
      label: "Last Month",
      range: {
        startDate: dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
        endDate: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
      },
    },
    {
      label: "Last 3 Months",
      range: {
        startDate: dayjs().subtract(3, "month").format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
      },
    },
  ],
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange>(range)
  const [selectingStart, setSelectingStart] = useState(true)

  const formatDisplayDate = (date: string) => {
    return dayjs(date).format("MMM D, YYYY")
  }

  const handleDayPress = (day: { dateString: string }) => {
    if (selectingStart) {
      setTempRange({
        startDate: day.dateString,
        endDate: day.dateString,
      })
      setSelectingStart(false)
    } else {
      // Ensure end date is not before start date
      if (dayjs(day.dateString).isBefore(dayjs(tempRange.startDate))) {
        setTempRange({
          startDate: day.dateString,
          endDate: tempRange.startDate,
        })
      } else {
        setTempRange({
          ...tempRange,
          endDate: day.dateString,
        })
      }
      setSelectingStart(true)
    }
  }

  const handleApply = () => {
    onRangeChange(tempRange)
    setModalVisible(false)
  }

  const handleCancel = () => {
    setTempRange(range)
    setModalVisible(false)
  }

  const handlePresetSelect = (preset: { label: string; range: DateRange }) => {
    setTempRange(preset.range)
  }

  // Create marked dates for the calendar
  const getMarkedDates = () => {
    const { startDate, endDate } = tempRange
    const markedDates: any = {}

    // Mark start date
    markedDates[startDate] = {
      startingDay: true,
      color: "#FFD700",
      textColor: "#000000",
    }

    // Mark end date
    markedDates[endDate] = {
      endingDay: true,
      color: "#FFD700",
      textColor: "#000000",
    }

    // Mark dates in between
    if (startDate !== endDate) {
      let currentDate = dayjs(startDate).add(1, "day")
      const lastDate = dayjs(endDate)

      while (currentDate.isBefore(lastDate)) {
        const dateString = currentDate.format("YYYY-MM-DD")
        markedDates[dateString] = {
          color: "#FFD70050",
          textColor: "#FFFFFF",
        }
        currentDate = currentDate.add(1, "day")
      }
    }

    return markedDates
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selector} onPress={() => setModalVisible(true)}>
        <Ionicons name="calendar-outline" size={20} color="#FFD700" />
        <Text style={styles.dateText}>
          {formatDisplayDate(range.startDate)} - {formatDisplayDate(range.endDate)}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={handleCancel}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.presetContainer}>
              {presets.map((preset, index) => (
                <TouchableOpacity key={index} style={styles.presetButton} onPress={() => handlePresetSelect(preset)}>
                  <Text style={styles.presetText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rangeInfo}>
              <View style={styles.rangeDate}>
                <Text style={styles.rangeLabel}>Start Date</Text>
                <Text style={styles.rangeValue}>{formatDisplayDate(tempRange.startDate)}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#999" />
              <View style={styles.rangeDate}>
                <Text style={styles.rangeLabel}>End Date</Text>
                <Text style={styles.rangeValue}>{formatDisplayDate(tempRange.endDate)}</Text>
              </View>
            </View>

            <Calendar
              markingType="period"
              markedDates={getMarkedDates()}
              onDayPress={handleDayPress}
              theme={{
                backgroundColor: "#1A1A1A",
                calendarBackground: "#1A1A1A",
                textSectionTitleColor: "#b6c1cd",
                selectedDayBackgroundColor: "#FFD700",
                selectedDayTextColor: "#000000",
                todayTextColor: "#FFD700",
                dayTextColor: "#FFFFFF",
                textDisabledColor: "#444444",
                dotColor: "#FFD700",
                selectedDotColor: "#000000",
                arrowColor: "#FFD700",
                monthTextColor: "#FFFFFF",
                indicatorColor: "#FFD700",
                textDayFontWeight: "300",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "500",
              }}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    color: "white",
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#0C0B0B",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  presetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  presetButton: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  presetText: {
    color: "#FFD700",
    fontSize: 14,
  },
  rangeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rangeDate: {
    flex: 1,
  },
  rangeLabel: {
    color: "#999",
    fontSize: 14,
  },
  rangeValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  applyButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default DateRangePicker

