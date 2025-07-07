import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InteractiveCalendarProps {
  onIntervalConfirm?: (start: Date, end: Date) => void
  onDateRangeChange?: (start: Date | null, end: Date | null) => void
}

export default function InteractiveCalendar({ onIntervalConfirm, onDateRangeChange }: InteractiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isSelectingEnd, setIsSelectingEnd] = useState(false)
  const [confirmedInterval, setConfirmedInterval] = useState<{
    start: Date
    end: Date
    days: number
  } | null>(null)

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const isDateInRange = (date: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false
    const dateTime = date.getTime()
    const startTime = start.getTime()
    const endTime = end.getTime()
    return dateTime >= startTime && dateTime <= endTime
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    
    if (!startDate || (startDate && endDate)) {
      // Comenzar nueva selección
      setStartDate(clickedDate)
      setEndDate(null)
      setIsSelectingEnd(true)
      setConfirmedInterval(null)
      onDateRangeChange?.(clickedDate, null)
    } else if (isSelectingEnd) {
      // Seleccionar fecha de fin
      if (clickedDate >= startDate) {
        setEndDate(clickedDate)
        setIsSelectingEnd(false)
        onDateRangeChange?.(startDate, clickedDate)
      } else {
        // Si selecciona una fecha anterior, empezar de nuevo
        setStartDate(clickedDate)
        setEndDate(null)
        onDateRangeChange?.(clickedDate, null)
      }
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleConfirmInterval = () => {
    if (startDate && endDate) {
      const interval = {
        start: startDate,
        end: endDate,
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      }
      setConfirmedInterval(interval)
      onIntervalConfirm?.(startDate, endDate)
    }
  }

  const handleClearSelection = () => {
    setStartDate(null)
    setEndDate(null)
    setIsSelectingEnd(false)
    setConfirmedInterval(null)
    onDateRangeChange?.(null, null)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Días vacíos del mes anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-10"></div>
      )
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isStart = isSameDay(date, startDate)
      const isEnd = isSameDay(date, endDate)
      const isInRange = isDateInRange(date, startDate, endDate)
      const isToday = isSameDay(date, new Date())

      let dayClass = 'h-10 w-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-100 '
      
      if (isStart) {
        dayClass += 'bg-blue-500 dark:bg-blue-600 text-white font-bold shadow-md hover:bg-blue-600 dark:hover:bg-blue-700 '
      } else if (isEnd) {
        dayClass += 'bg-green-500 dark:bg-green-600 text-white font-bold shadow-md hover:bg-green-600 dark:hover:bg-green-700 '
      } else if (isInRange) {
        dayClass += 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-medium '
      } else if (isToday) {
        dayClass += 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium '
      } else {
        dayClass += 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 '
      }

      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      )
    }

    return days
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">📅 Selecciona el Período de Reportes</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {/* Header del calendario */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 dark:bg-blue-600 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Fecha de inicio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Fecha de fin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Período seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Hoy</span>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Instrucciones */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Instrucciones:</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              {!startDate && (
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <p>Haz clic en un día para seleccionar el inicio del período</p>
                </div>
              )}
              {startDate && !endDate && (
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <p>Ahora selecciona el día final del período</p>
                </div>
              )}
              {startDate && endDate && (
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  <p>¡Perfecto! Confirma el período o selecciona uno nuevo</p>
                </div>
              )}
            </div>
          </div>

          {/* Información del intervalo */}
          <AnimatePresence>
            {startDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Intervalo Actual:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Inicio:</span>
                    <div className="text-blue-600 font-medium">{formatDate(startDate)}</div>
                  </div>
                  {endDate && (
                    <>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Fin:</span>
                        <div className="text-green-600 font-medium">{formatDate(endDate)}</div>
                      </div>
                      <div className="border-t pt-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Duración:</span>
                        <div className="text-purple-600 font-bold">
                          {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} días
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botones */}
          <div className="space-y-2">
            <AnimatePresence>
              {startDate && endDate && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleConfirmInterval}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Intervalo
                </motion.button>
              )}
            </AnimatePresence>

            <button
              onClick={handleClearSelection}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar Selección
            </button>
          </div>

          {/* Intervalo confirmado */}
          <AnimatePresence>
            {confirmedInterval && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-800 dark:text-green-300">Período Confirmado</h4>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  <div>Del {formatDate(confirmedInterval.start)}</div>
                  <div>al {formatDate(confirmedInterval.end)}</div>
                  <div className="font-bold mt-1">({confirmedInterval.days} días)</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}