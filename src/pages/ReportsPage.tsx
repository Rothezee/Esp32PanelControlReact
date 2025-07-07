import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  Settings, 
  Cpu,
  Filter,
  FileText,
  BarChart3
} from 'lucide-react'
import { useReports } from '../hooks/useReports'
import { useDevices } from '../hooks/useDevices'
import { format, subDays } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import InteractiveCalendar from '../components/InteractiveCalendar'
import ArduinoProgrammer from '../components/ArduinoProgrammer'

export default function ReportsPage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showCalendar, setShowCalendar] = useState(false)
  const [showProgrammer, setShowProgrammer] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')
  
  const { data: devices } = useDevices()
  const { data: reports, isLoading } = useReports(deviceId!, startDate, endDate)
  
  const device = devices?.find(d => d.id === deviceId)

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    if (start) setStartDate(format(start, 'yyyy-MM-dd'))
    if (end) setEndDate(format(end, 'yyyy-MM-dd'))
  }

  const handleIntervalConfirm = (start: Date, end: Date) => {
    setStartDate(format(start, 'yyyy-MM-dd'))
    setEndDate(format(end, 'yyyy-MM-dd'))
    setShowCalendar(false)
    setViewMode('table')
  }

  const handleExportData = () => {
    if (!reports || reports.length === 0) return

    const csvContent = [
      ['Fecha y Hora', ...device?.fields.map(f => f.name) || []].join(','),
      ...reports.map(report => [
        format(new Date(report.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        ...device?.fields.map(f => report.data[f.key] ?? 'N/A') || []
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reportes_${device?.name}_${startDate}_${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Dispositivo no encontrado</h2>
        <Link to="/dashboard" className="btn btn-primary mt-4">
          Volver al Dashboard
        </Link>
      </div>
    )
  }

  const renderReportColumns = () => {
    return device.fields.map(field => (
      <th key={field.id} className="table-header">
        {field.name}
      </th>
    ))
  }

  const renderReportData = (report: any) => {
    return device.fields.map(field => (
      <td key={field.id} className="table-cell">
        {report.data[field.key] ?? 'N/A'}
      </td>
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{device.name}</h1>
          <p className="mt-2 text-gray-600">Reportes y análisis de datos</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowProgrammer(true)}
            className="btn btn-secondary"
          >
            <Cpu className="w-4 h-4 mr-2" />
            Programar Arduino
          </button>
          <Link
            to={`/analytics?device=${deviceId}`}
            className="btn btn-secondary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Tabla
              </button>
              <button
                onClick={() => {
                  setViewMode('calendar')
                  setShowCalendar(true)
                }}
                className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendario
              </button>
            </div>

            {viewMode === 'table' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <label htmlFor="startDate" className="text-sm font-medium text-gray-700 mr-2">
                    Desde:
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex items-center">
                  <label htmlFor="endDate" className="text-sm font-medium text-gray-700 mr-2">
                    Hasta:
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleExportData}
            disabled={!reports || reports.length === 0}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'calendar' && showCalendar ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <InteractiveCalendar
              onIntervalConfirm={handleIntervalConfirm}
              onDateRangeChange={handleDateRangeChange}
            />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">
                      Fecha y Hora
                    </th>
                    {renderReportColumns()}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={device.fields.length + 1} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="loading-spinner w-6 h-6 mr-3" />
                          Cargando reportes...
                        </div>
                      </td>
                    </tr>
                  ) : reports?.length === 0 ? (
                    <tr>
                      <td colSpan={device.fields.length + 1} className="px-6 py-8 text-center text-gray-500">
                        <div className="space-y-2">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                          <p>No hay reportes para el período seleccionado</p>
                          <p className="text-sm">
                            Del {format(new Date(startDate), 'dd/MM/yyyy')} al {format(new Date(endDate), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reports?.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="table-cell font-medium">
                          {format(new Date(report.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </td>
                        {renderReportData(report)}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {reports && reports.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Mostrando {reports.length} registro{reports.length !== 1 ? 's' : ''}
                  </span>
                  <span>
                    Período: {format(new Date(startDate), 'dd/MM/yyyy')} - {format(new Date(endDate), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arduino Programmer Modal */}
      <AnimatePresence>
        {showProgrammer && (
          <ArduinoProgrammer
            deviceId={device.id}
            onClose={() => setShowProgrammer(false)}
            onConfigSave={(config) => {
              console.log('Arduino config saved:', config)
              // Here you would send the configuration to the Arduino
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}