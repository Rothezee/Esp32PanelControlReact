import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDevices } from '../hooks/useDevices'
import { useReports } from '../hooks/useReports'
import Chart from '../components/Chart'
import Calendar from '../components/Calendar'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap,
  Calendar as CalendarIcon,
  Download,
  Filter,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export default function AnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const deviceId = searchParams.get('device')
  const [period, setPeriod] = useState('7d')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  const { data: devices, isLoading: devicesLoading } = useDevices()
  
  // Get reports for analytics based on coin data
  const startDate = (() => {
    const date = new Date()
    switch (period) {
      case '24h':
        date.setDate(date.getDate() - 1)
        break
      case '7d':
        date.setDate(date.getDate() - 7)
        break
      case '30d':
        date.setDate(date.getDate() - 30)
        break
      case '90d':
        date.setDate(date.getDate() - 90)
        break
      default:
        date.setDate(date.getDate() - 7)
    }
    return format(date, 'yyyy-MM-dd')
  })()
  
  const endDate = format(new Date(), 'yyyy-MM-dd')
  const { data: reports, isLoading: reportsLoading } = useReports(deviceId || 'all', startDate, endDate)

  const selectedDevice = deviceId ? devices?.find(d => d.id === deviceId) : null

  const periods = [
    { value: '24h', label: 'Últimas 24h' },
    { value: '7d', label: 'Última semana' },
    { value: '30d', label: 'Último mes' },
    { value: '90d', label: 'Últimos 3 meses' },
  ]

  const handleDeviceChange = (newDeviceId: string) => {
    if (newDeviceId === 'all') {
      searchParams.delete('device')
    } else {
      searchParams.set('device', newDeviceId)
    }
    setSearchParams(searchParams)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowCalendar(false)
  }

  // Loading state
  if (devicesLoading || reportsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-gray-600">Cargando analytics...</span>
      </div>
    )
  }

  // Error state

  // Calculate metrics from devices data
  const totalDevices = devices?.length || 0
  const onlineDevices = devices?.filter(d => d.status === 'online').length || 0
  const offlineDevices = devices?.filter(d => d.status === 'offline').length || 0
  const efficiency = totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0

  // Calculate coin analytics from reports
  const totalCoins = reports?.reduce((sum, report) => {
    const coinValue = report.data.coin || 0
    return sum + coinValue
  }, 0) || 0

  const averageCoinsPerDay = (() => {
    if (!reports || reports.length === 0) return 0
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    return Math.round(totalCoins / Math.max(days, 1))
  })()

  const metrics = [
    {
      title: 'Total Coins',
      value: totalCoins.toLocaleString(),
      change: 0,
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Promedio Diario',
      value: averageCoinsPerDay.toLocaleString(),
      change: 0,
      changeType: 'increase' as const,
      icon: Activity,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Dispositivos Activos',
      value: onlineDevices.toString(),
      change: 0,
      changeType: 'increase' as const,
      icon: Activity,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Eficiencia',
      value: `${efficiency}%`,
      change: 0,
      changeType: 'increase' as const,
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
    },
  ]

  // Chart data based on actual device data
  // Group reports by day and calculate daily coin totals
  const dailyCoinData = reports?.reduce((acc, report) => {
    const date = format(new Date(report.timestamp), 'yyyy-MM-dd')
    const coins = report.data.coin || 0
    acc[date] = (acc[date] || 0) + coins
    return acc
  }, {} as Record<string, number>) || {}

  const sortedDates = Object.keys(dailyCoinData).sort()
  const dailyCoins = sortedDates.map(date => dailyCoinData[date])

  // Group coins by device type
  const coinsByType = reports?.reduce((acc, report) => {
    const device = devices?.find(d => d.id === report.deviceId)
    if (device) {
      const coins = report.data.coin || 0
      acc[device.type] = (acc[device.type] || 0) + coins
    }
    return acc
  }, {} as Record<string, number>) || {}

  const timeSeriesData = {
    labels: sortedDates.map(date => format(new Date(date), 'dd/MM')),
    datasets: [
      {
        label: 'Coins por Día',
        data: dailyCoins,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const barChartData = {
    labels: Object.keys(coinsByType).map(type => {
      switch (type) {
        case 'grua': return 'Grúas'
        case 'expendedora': return 'Expendedoras'
        case 'videojuego': return 'Videojuegos'
        case 'ticketera': return 'Ticketeras'
        default: return type
      }
    }),
    datasets: [
      {
        label: 'Coins por Tipo de Dispositivo',
        data: Object.values(coinsByType),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const doughnutData = {
    labels: ['En línea', 'Desconectado'],
    datasets: [
      {
        data: [onlineDevices, offlineDevices],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Análisis detallado y métricas de rendimiento
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="btn btn-secondary"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {format(selectedDate, 'dd/MM/yyyy')}
          </button>
          <button className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispositivo
            </label>
            <select
              value={deviceId || 'all'}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="input"
            >
              <option value="all">Todos los dispositivos</option>
              {devices?.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input"
            >
              {periods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCalendar(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full mx-4"
          >
            <Calendar
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`metric-card bg-gradient-to-r ${metric.color}`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-white/80" />
                {metric.change !== 0 && (
                  <div className="flex items-center text-white/80">
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">{metric.title}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      {devices && devices.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Coins por Día
            </h3>
            <Chart type="line" data={timeSeriesData} height={300} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Coins por Tipo de Dispositivo
            </h3>
            {Object.keys(coinsByType).length > 0 ? (
              <Chart type="bar" data={barChartData} height={300} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estado de Dispositivos
            </h3>
            {totalDevices > 0 ? (
              <Chart type="doughnut" data={doughnutData} height={300} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay dispositivos configurados
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Dispositivos por Coins
            </h3>
            <div className="space-y-4">
              {devices?.slice(0, 5).map((device) => {
                const deviceCoins = reports?.filter(r => r.deviceId === device.id)
                  .reduce((sum, r) => sum + (r.data.coin || 0), 0) || 0
                
                return (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      device.status === 'online' ? 'bg-green-500' : 
                      device.status === 'offline' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{device.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{device.type} - {device.locality}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{deviceCoins} coins</p>
                    <p className={`text-xs ${
                      device.status === 'online' ? 'text-green-600' : 
                      device.status === 'offline' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {device.status === 'online' ? 'En línea' :
                       device.status === 'offline' ? 'Desconectado' : 'Desconocido'}
                    </p>
                  </div>
                </div>
              )})}
              {devices && devices.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  Y {devices.length - 5} dispositivos más...
                </p>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay dispositivos configurados
          </h3>
          <p className="text-gray-600 mb-6">
            Agrega algunos dispositivos para ver las estadísticas y análisis
          </p>
          <button
            onClick={() => window.location.href = '/devices/new'}
            className="btn btn-primary"
          >
            Agregar Dispositivo
          </button>
        </motion.div>
      )}

      {/* Device Details */}
      {selectedDevice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detalles de {selectedDevice.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {selectedDevice.type} - {selectedDevice.locality}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estado</p>
              <p className={`text-lg font-semibold ${
                selectedDevice.status === 'online' ? 'text-green-600' :
                selectedDevice.status === 'offline' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {selectedDevice.status === 'online' ? 'En línea' :
                 selectedDevice.status === 'offline' ? 'Desconectado' : 'Desconocido'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Última actualización</p>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(selectedDevice.lastHeartbeat), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>
          
          {/* Device Data */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Estadísticas del Período</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Total Coins</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {reports?.filter(r => r.deviceId === selectedDevice.id)
                    .reduce((sum, r) => sum + (r.data.coin || 0), 0) || 0}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Eventos</p>
                <p className="text-lg font-semibold text-blue-600">
                  {reports?.filter(r => r.deviceId === selectedDevice.id).length || 0}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Promedio/Día</p>
                <p className="text-lg font-semibold text-green-600">
                  {Math.round((reports?.filter(r => r.deviceId === selectedDevice.id)
                    .reduce((sum, r) => sum + (r.data.coin || 0), 0) || 0) / 
                    Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))))}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <p className={`text-lg font-semibold ${
                  selectedDevice.status === 'online' ? 'text-green-600' :
                  selectedDevice.status === 'offline' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {selectedDevice.status === 'online' ? 'En línea' :
                   selectedDevice.status === 'offline' ? 'Desconectado' : 'Desconocido'}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Datos Actuales del Dispositivo</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedDevice.fields.map((field) => (
                  <div key={field.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{field.name}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedDevice.data[field.key] ?? 'N/A'}
                  </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}