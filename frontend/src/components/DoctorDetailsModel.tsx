import { useState } from 'react';
import { X, Loader, Stethoscope, Mail, User, FileText, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Doctor } from '../api/reservation.api';

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
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la demande');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Demande de rendez-vous</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    /* Success state */
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">✅</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">Demande envoyée !</p>
                        <p className="text-sm text-gray-500">
                            Le Dr. {doctor.firstName} {doctor.lastName} examinera votre demande sous peu.
                        </p>
                    </div>
                ) : (
                    <div className="px-6 py-5 space-y-5">

                        {/* Doctor card */}
                        <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                                {doctor.firstName?.charAt(0)?.toUpperCase() || 'D'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-gray-900 text-lg">
                                    Dr. {doctor.firstName} {doctor.lastName}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Stethoscope className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                    <span className="text-sm font-medium text-blue-600">
                                        {doctor.specialty || 'Médecin généraliste'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-500 truncate">{doctor.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Patient card */}
                        <div className="flex items-center gap-4 bg-green-50 rounded-xl p-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                                {user?.firstName?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Patient</p>
                                <div className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                    <p className="font-bold text-gray-900">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-500 truncate">{user?.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex gap-2 items-start">
                                    <span className="text-red-500 mt-0.5">⚠️</span>
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Motif de la consultation
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Ex : Douleurs abdominales depuis 3 jours, bilan annuel, renouvellement d'ordonnance…"
                                    rows={4}
                                    maxLength={500}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">
                                    {reason.length} / 500 caractères
                                </p>
                            </div>

                            {/* Steps hint */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs text-gray-500 space-y-1.5">
                                <p className="font-semibold text-gray-600 mb-2">📋 Prochaines étapes</p>
                                <p>① Votre demande est transmise au médecin</p>
                                <p>② Le médecin accepte et fixe un créneau</p>
                                <p>③ Vous recevez le lien de la consultation vidéo</p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-1 pb-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !reason.trim()}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Envoi en cours…
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Envoyer la demande de rendez-vous
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}