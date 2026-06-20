import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, ImagePlus, Camera } from 'lucide-react'
import { MAX_PLAYERS } from '../../../stores/useTeamsStore'
import { useI18n } from '../../../i18n/useI18n'
import { haptic } from '../../../hooks/useHaptics'

const emptyForm = {
  name: '',
  manager: '',
  players: [{ key: crypto.randomUUID(), value: '' }],
  logo: null,
}

export default function TeamFormModal({ isOpen, onClose, onSubmit, team, maxTeamsReached }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [playerPhotos, setPlayerPhotos] = useState({})
  const { t, isAr } = useI18n()
  const isEditing = Boolean(team)

  useEffect(() => {
    if (isOpen) {
      if (team) {
        setForm({
          name: team.name || '',
          manager: team.manager || '',
          players: team.players?.length > 0
            ? team.players.map((p) => ({ key: crypto.randomUUID(), value: p?.name || '' }))
            : [{ key: crypto.randomUUID(), value: '' }],
          logo: team.logo || null,
        })
        // Load existing player photos
        const photos = {}
        team.players.forEach((p, i) => {
          if (p.photo) photos[i] = p.photo
        })
        setPlayerPhotos(photos)
      } else {
        setForm(emptyForm)
        setPlayerPhotos({})
      }
      setErrors({})
      setSubmitting(false)
    }
  }, [isOpen, team])

  const MAX_LOGO_SIZE = 700 * 1024
  const MAX_LOGO_DIM = 256

  const resizeImage = (dataUrl, maxDim) =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width <= maxDim && height <= maxDim) {
          resolve(dataUrl)
          return
        }
        if (width > height) {
          height = Math.round((height / width) * maxDim)
          width = maxDim
        } else {
          width = Math.round((width / height) * maxDim)
          height = maxDim
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = dataUrl
    })

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, logo: t('teams.logoError') }))
      return
    }

    if (file.size > MAX_LOGO_SIZE) {
      setErrors((prev) => ({ ...prev, logo: t('teams.logoError') }))
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const resized = await resizeImage(reader.result, MAX_LOGO_DIM)
        setForm((prev) => ({ ...prev, logo: resized }))
        setErrors((prev) => ({ ...prev, logo: undefined }))
      } catch {
        setErrors((prev) => ({ ...prev, logo: t('teams.imageError') }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePlayerPhoto = async (index, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) return
    if (file.size > 700 * 1024) return

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const resized = await resizeImage(reader.result, 128)
        setPlayerPhotos((prev) => ({ ...prev, [index]: resized }))
      } catch {
        // silently fail for player photo
      }
    }
    reader.readAsDataURL(file)
  }

  const addPlayerField = () => {
    haptic.light()
    if (form.players.length >= MAX_PLAYERS) return
    setForm((prev) => ({ ...prev, players: [...prev.players, { key: crypto.randomUUID(), value: '' }] }))
  }

  const removePlayerField = (key) => {
    if (form.players.length <= 1) return
    setForm((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.key !== key),
    }))
    // Clean up photo for the removed player
    setPlayerPhotos((prev) => {
      const newPhotos = {}
      let photoIdx = 0
      form.players.forEach((p) => {
        if (p.key === key) return
        if (prev[photoIdx]) newPhotos[photoIdx] = prev[photoIdx]
        photoIdx++
      })
      return newPhotos
    })
  }

  const updatePlayer = (index, value) => {
    setForm((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => (i === index ? { ...p, value } : p)),
    }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = t('teams.nameRequired')
    if (!form.manager.trim()) nextErrors.manager = t('teams.managerRequired')

    const filledPlayers = form.players.filter((p) => p.value.trim())
    if (filledPlayers.length === 0) {
      nextErrors.players = t('teams.playerRequired')
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isEditing && maxTeamsReached) return
    if (!validate()) return

    setSubmitting(true)
    haptic.intense()
    try {
      await onSubmit({
        name: form.name,
        manager: form.manager,
        players: form.players.map((p, i) => ({
          name: p.value,
          photo: playerPhotos[i] || null,
        })),
        logo: form.logo,
      })
      onClose()
    } catch (err) {
      console.error('[TeamFormModal] submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const filledCount = form.players.filter((p) => p.value.trim()).length

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto glass-card rounded-t-2xl md:rounded-2xl border border-border shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-bg-card/95 backdrop-blur-md">
              <h2 className="text-lg font-bold">
                {isEditing ? t('teams.editTeam') : t('teams.addNewTeam')}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center hover:bg-bg-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-8">
              {/* Logo upload */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">{t('teams.logo')}</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {form.logo ? (
                      <img src={form.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus size={24} className="text-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-bg-surface border border-border text-sm cursor-pointer hover:bg-bg-primary transition-colors">
                      <ImagePlus size={16} className="text-accent" />
                      <span className="truncate">{t('teams.chooseImage')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    {form.logo && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, logo: null }))}
                        className="block mt-2 text-xs text-danger hover:underline"
                      >
                        {t('teams.removeLogo')}
                      </button>
                    )}
                    {errors.logo && (
                      <p className="text-xs text-danger mt-1">{errors.logo}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Team name */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">{t('teams.teamName')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={isAr ? 'مثال: النجوم' : 'e.g. Stars'}
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>

              {/* Manager name */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">{t('teams.managerName')}</label>
                <input
                  type="text"
                  value={form.manager}
                  onChange={(e) => setForm((prev) => ({ ...prev, manager: e.target.value }))}
                  placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmed'}
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                />
                {errors.manager && <p className="text-xs text-danger mt-1">{errors.manager}</p>}
              </div>

              {/* Players */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-text-secondary">
                    {t('teams.players')} ({filledCount}/{MAX_PLAYERS})
                  </label>
                  <button
                    type="button"
                    onClick={addPlayerField}
                    disabled={form.players.length >= MAX_PLAYERS}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={14} />
                    <span>{t('teams.addPlayer')}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {form.players.map((player, index) => (
                    <div key={player.key} className="flex gap-2 items-center">
                      {/* Player photo */}
                      <label className="w-9 h-9 shrink-0 rounded-full bg-bg-surface border border-border flex items-center justify-center cursor-pointer hover:border-accent/40 hover:text-accent transition-colors overflow-hidden">
                        {playerPhotos[index] ? (
                          <img src={playerPhotos[index]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={14} className="text-text-secondary" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePlayerPhoto(index, e)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={player.value}
                        onChange={(e) => updatePlayer(index, e.target.value)}
                        placeholder={`${isAr ? 'اللاعب' : 'Player'} ${index + 1}`}
                        className="flex-1 bg-bg-surface border border-border rounded-xl py-2.5 px-3 md:px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                      {form.players.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlayerField(player.key)}
                          className="w-10 h-10 rounded-xl bg-bg-surface border border-border flex items-center justify-center text-danger hover:bg-danger/10 transition-colors shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.players && <p className="text-xs text-danger mt-1">{errors.players}</p>}
              </div>

              <button
                type="submit"
                disabled={(!isEditing && maxTeamsReached) || submitting}
                className="w-full bg-accent text-black font-bold py-3.5 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting
                  ? t('common.loading')
                  : isEditing
                    ? t('teams.saveChanges')
                    : t('teams.addTeamBtn')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
