import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const DeleteAccountModal = ({ isOpen, onClose, onDeleted }) => {
  const { deleteAccountAndData } = useAuth();
  const { t } = useLanguage();

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setErrorMsg('');

    try {
      await deleteAccountAndData();
      if (onDeleted) {
        onDeleted();
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-card border border-rose-500/30 radius-card max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-fade-in space-y-4">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-1.5 radius-btn text-sub hover:text-main"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 radius-btn bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="font-serif text-xl font-bold text-main">
            {t('deleteAccountTitle') || 'Delete Account & Data'}
          </h2>
          <p className="text-xs text-sub leading-relaxed">
            {t('deleteAccountWarning') || 'This will permanently remove your profile, photos, and verification documents, and deactivate your account. This action cannot be undone.'}
          </p>
        </div>

        <div className="p-3 bg-surface-ground radius-card border border-main text-xs text-sub space-y-1.5">
          <p className="font-semibold text-main">What will be permanently erased:</p>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>Profile details, bio, occupation, and contact info</li>
            <li>Uploaded photos and avatar image files</li>
            <li>Government ID and verification audit documents</li>
            <li>Partner matching preferences and shortlisted candidates</li>
          </ul>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-main">
            To confirm, type <span className="font-bold text-rose-600 dark:text-rose-400 tracking-wider">DELETE</span> below:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            disabled={isDeleting}
            className="w-full px-3.5 py-2.5 border border-main radius-btn text-xs bg-surface-ground text-main outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {errorMsg}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 radius-btn border border-main text-sub hover:text-main text-xs font-semibold hover:bg-surface-ground"
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className={`flex-1 py-2.5 radius-btn text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
              isConfirmed && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-50'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Permanently Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
