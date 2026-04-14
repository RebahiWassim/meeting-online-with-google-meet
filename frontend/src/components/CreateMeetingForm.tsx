import { useState } from 'react'
import { meetingApi } from '../api/meeting.api'

interface Props {
  doctorId: string
  doctorEmail: string
  onSuccess: () => void
  onCancel: () => void
}

interface FormData {
  patientId: string
  patientEmail: string
  title: string
  description: string
  startTime: string
  endTime: string
  meetLink: string
}

export default function CreateMeetingForm({ 
  doctorId, 
  doctorEmail, 
  onSuccess, 
  onCancel 
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    patientEmail: '',
    title: 'Consultation médicale',
    description: '',
    startTime: '',
    endTime: '',
    meetLink: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateGoogleMeetLink = () => {
    window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer')
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  try {
    await meetingApi.create({
      doctorId,
      doctorEmail,
      patientId: formData.patientId,
      patientEmail: formData.patientEmail,
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      meetLink: formData.meetLink,    // ← ajouter cette ligne
    })
    onSuccess()
  } catch (err: any) {
    setError(err.message || 'Une erreur est survenue')
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Nouvelle consultation
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID Patient */}
        <div>
          <label 
            htmlFor="patientId" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ID du patient
          </label>
          <input
            id="patientId"
            name="patientId"
            type="text"
            value={formData.patientId}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="patient-001"
          />
        </div>

        {/* Email Patient */}
        <div>
          <label 
            htmlFor="patientEmail" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email du patient
          </label>
          <input
            id="patientEmail"
            name="patientEmail"
            type="email"
            value={formData.patientEmail}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="patient@email.com"
          />
        </div>

        {/* Titre */}
        <div>
          <label 
            htmlFor="title" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Titre
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Motif de la consultation..."
          />
        </div>

        {/* Date et heure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="startTime" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Début
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label 
              htmlFor="endTime" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fin
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lien Google Meet */}
        <div>
          <label 
            htmlFor="meetLink" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Lien Google Meet
          </label>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="meetLink"
              name="meetLink"
              type="url"
              value={formData.meetLink}
              onChange={handleChange}
              required
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
            
            <button
              type="button"
              onClick={generateGoogleMeetLink}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors whitespace-nowrap"
            >
              Créer un lien
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-1">
            Cliquez sur "Créer un lien" pour générer un nouveau lien Google Meet, puis copiez-le dans le champ ci-dessus.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Création...
              </span>
            ) : (
              'Créer la consultation'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
