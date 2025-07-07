import { useState } from 'react'
import { 
  Cpu, 
  Settings, 
  Zap, 
  Clock, 
  Gauge, 
  Eye, 
  RotateCcw, 
  Save,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ArduinoConfig {
  pago: number
  tiempo: number
  tiempoFuerzaFuerte: number
  fuerza: number
  tipoBarrera: 'infrarrojo' | 'ultrasonido'
  modoDisplay: 'contadores' | 'coin'
  borrarContadores: boolean
}

interface ArduinoProgrammerProps {
  deviceId: string
  onClose: () => void
  onConfigSave?: (config: ArduinoConfig) => void
}

export default function ArduinoProgrammer({ deviceId, onClose, onConfigSave }: ArduinoProgrammerProps) {
  const [config, setConfig] = useState<ArduinoConfig>({
    pago: 1,
    tiempo: 1000,
    tiempoFuerzaFuerte: 500,
    fuerza: 50,
    tipoBarrera: 'infrarrojo',
    modoDisplay: 'contadores',
    borrarContadores: false
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [distanciaBarrera, setDistanciaBarrera] = useState(0)

  const steps = [
    { id: 'connection', title: 'Conexión', icon: Cpu },
    { id: 'display', title: 'Modo Display', icon: Eye },
    { id: 'counters', title: 'Contadores', icon: RotateCcw },
    { id: 'payment', title: 'Pago', icon: Settings },
    { id: 'timing', title: 'Tiempos', icon: Clock },
    { id: 'force', title: 'Fuerza', icon: Zap },
    { id: 'barrier', title: 'Barrera', icon: Gauge },
    { id: 'test', title: 'Pruebas', icon: AlertTriangle },
    { id: 'save', title: 'Guardar', icon: Save }
  ]

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simular conexión con Arduino
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnected(true)
    setIsConnecting(false)
    setCurrentStep(1)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simular guardado de configuración
    await new Promise(resolve => setTimeout(resolve, 1500))
    onConfigSave?.(config)
    setIsSaving(false)
    onClose()
  }

  const updateConfig = (key: keyof ArduinoConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const renderStepContent = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case 'connection':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Cpu className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Conectar con Arduino
              </h3>
              <p className="text-gray-600 mb-6">
                Dispositivo: {deviceId}
              </p>
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="btn btn-primary"
                >
                  {isConnecting ? (
                    <>
                      <div className="loading-spinner w-4 h-4 mr-2" />
                      Conectando...
                    </>
                  ) : (
                    'Conectar'
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Conectado exitosamente
                </div>
              )}
            </div>
          </div>
        )

      case 'display':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Modo de Display</h3>
            <div className="space-y-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="modoDisplay"
                  value="contadores"
                  checked={config.modoDisplay === 'contadores'}
                  onChange={(e) => updateConfig('modoDisplay', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Modo Contadores</div>
                  <div className="text-sm text-gray-500">Muestra todos los contadores</div>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="modoDisplay"
                  value="coin"
                  checked={config.modoDisplay === 'coin'}
                  onChange={(e) => updateConfig('modoDisplay', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Modo Coin</div>
                  <div className="text-sm text-gray-500">Muestra solo las monedas</div>
                </div>
              </label>
            </div>
          </div>
        )

      case 'counters':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Gestión de Contadores</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">¡Atención!</span>
              </div>
              <p className="text-yellow-700 mt-1">
                Esta acción borrará todos los contadores de manera permanente.
              </p>
            </div>
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={config.borrarContadores}
                onChange={(e) => updateConfig('borrarContadores', e.target.checked)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Borrar Contadores</div>
                <div className="text-sm text-gray-500">
                  Reinicia COIN, CONTSALIDA y BANK a cero
                </div>
              </div>
            </label>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Configuración de Pago</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor de Pago
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => updateConfig('pago', Math.max(1, config.pago - 1))}
                  className="btn btn-secondary w-10 h-10 p-0"
                >
                  -
                </button>
                <div className="text-2xl font-bold text-center w-16">
                  {config.pago}
                </div>
                <button
                  onClick={() => updateConfig('pago', config.pago + 1)}
                  className="btn btn-secondary w-10 h-10 p-0"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Valor mínimo: 1
              </p>
            </div>
          </div>
        )

      case 'timing':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Configuración de Tiempos</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo Principal (ms)
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => updateConfig('tiempo', Math.max(500, config.tiempo - 10))}
                  className="btn btn-secondary w-10 h-10 p-0"
                >
                  -
                </button>
                <div className="text-xl font-bold text-center w-20">
                  {config.tiempo}
                </div>
                <button
                  onClick={() => updateConfig('tiempo', Math.min(5000, config.tiempo + 10))}
                  className="btn btn-secondary w-10 h-10 p-0"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Rango: 500-5000ms</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo Fuerza Fuerte (ms)
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => updateConfig('tiempoFuerzaFuerte', Math.max(0, config.tiempoFuerzaFuerte - 10))}
                  className="btn btn-secondary w-10 h-10 p-0"
                >
                  -
                </button>
                <div className="text-xl font-bold text-center w-20">
                  {config.tiempoFuerzaFuerte}
                </div>
                <button
                  onClick={() => updateConfig('tiempoFuerzaFuerte', Math.min(5000, config.tiempoFuerzaFuerte + 10))}
                  className="btn btn-secondary w-10 h-10 p-0"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Rango: 0-5000ms</p>
            </div>
          </div>
        )

      case 'force':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Configuración de Fuerza</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Fuerza (%)
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => updateConfig('fuerza', Math.max(5, config.fuerza - 1))}
                  className="btn btn-secondary w-10 h-10 p-0"
                >
                  -
                </button>
                <div className="text-2xl font-bold text-center w-16">
                  {config.fuerza}%
                </div>
                <button
                  onClick={() => updateConfig('fuerza', Math.min(101, config.fuerza + 1))}
                  className="btn btn-secondary w-10 h-10 p-0"
                >
                  +
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${config.fuerza}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Rango: 5-101%
              </p>
            </div>
          </div>
        )

      case 'barrier':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Configuración de Barrera</h3>
            <div className="space-y-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="tipoBarrera"
                  value="infrarrojo"
                  checked={config.tipoBarrera === 'infrarrojo'}
                  onChange={(e) => updateConfig('tipoBarrera', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Infrarrojo</div>
                  <div className="text-sm text-gray-500">Sensor infrarrojo tradicional</div>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="tipoBarrera"
                  value="ultrasonido"
                  checked={config.tipoBarrera === 'ultrasonido'}
                  onChange={(e) => updateConfig('tipoBarrera', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Ultrasonido</div>
                  <div className="text-sm text-gray-500">Sensor ultrasónico de distancia</div>
                </div>
              </label>
            </div>
          </div>
        )

      case 'test':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Prueba de Barrera</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-blue-600">
                  {distanciaBarrera} cm
                </div>
                <p className="text-gray-600">Distancia detectada</p>
                <div className="flex justify-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    distanciaBarrera < 10 ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  <div className={`w-4 h-4 rounded-full ${
                    distanciaBarrera >= 10 && distanciaBarrera < 20 ? 'bg-yellow-500' : 'bg-gray-300'
                  }`} />
                  <div className={`w-4 h-4 rounded-full ${
                    distanciaBarrera >= 20 ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
                <button
                  onClick={() => setDistanciaBarrera(Math.floor(Math.random() * 50))}
                  className="btn btn-secondary"
                >
                  Probar Sensor
                </button>
              </div>
            </div>
          </div>
        )

      case 'save':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Resumen de Configuración</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Modo Display:</span>
                <span className="capitalize">{config.modoDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Pago:</span>
                <span>{config.pago}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tiempo:</span>
                <span>{config.tiempo}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tiempo F. Fuerte:</span>
                <span>{config.tiempoFuerzaFuerte}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fuerza:</span>
                <span>{config.fuerza}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tipo Barrera:</span>
                <span className="capitalize">{config.tipoBarrera}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Borrar Contadores:</span>
                <span>{config.borrarContadores ? 'Sí' : 'No'}</span>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary w-full"
            >
              {isSaving ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Cpu className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">
              Programador Arduino - {deviceId}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <div className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                const isDisabled = index > currentStep && !isConnected

                return (
                  <div
                    key={step.id}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : isCompleted
                        ? 'bg-green-50 text-green-700'
                        : isDisabled
                        ? 'text-gray-400'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="text-sm font-medium">{step.title}</span>
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 ml-auto text-green-600" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="btn btn-secondary"
                >
                  Anterior
                </button>
                <div className="text-sm text-gray-500">
                  Paso {currentStep + 1} de {steps.length}
                </div>
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!isConnected && currentStep === 0}
                    className="btn btn-primary"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}