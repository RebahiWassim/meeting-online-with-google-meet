import { useState } from 'react';
import { X, Clock, MapPin, Phone, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    avatar: string;
    establishment?: string;
    phone?: string;
}

interface Props {
    doctor: Doctor;
    isOpen: boolean;
    onClose: () => void;
    onRequestAppointment: (reason: string) => Promise<void>;
}

export default function DoctorDetailsModal({ doctor, isOpen, onClose, onRequestAppointment }: Props) {
    const { user } = useAuth();
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Veuillez indiquer la raison de la consultation');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onRequestAppointment(reason);
            setSuccess(true);
            setTimeout(() => {
                setReason('');
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la demande');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Demander un rendez-vous</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                {success ? (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-gray-900 font-semibold text-lg">Demande envoyée avec succès!</p>
                        <p className="text-gray-500 text-sm mt-2">Le médecin examinera votre demande.</p>
                    </div>
                ) : (
                    <>
                        {/* Doctor Info */}
                        <div className="bg-blue-50 rounded-xl p-6 mb-6">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl flex-shrink-0">
                                    {doctor.avatar}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 font-medium">MÉDECIN</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{doctor.name}</p>
                                    <p className="text-sm text-blue-600 font-medium mt-1">{doctor.specialty}</p>
                                </div>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="bg-green-50 rounded-xl p-6 mb-6">
                            <p className="text-sm text-gray-500 font-medium">PATIENT</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                    <span className="text-red-600">⚠️</span>
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Raison de la consultation
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Décrivez brièvement la raison de votre visite..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-600 font-medium mb-2">📋 PROCHAINES ÉTAPES</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>✓ Votre demande sera examinée par le médecin</li>
                                    <li>✓ Vous recevrez une confirmation</li>
                                    <li>✓ Un lien de réunion vous sera envoyé</li>
                                </ul>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Envoi...
                                        </>
                                    ) : (
                                        'Demander le rendez-vous'
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}