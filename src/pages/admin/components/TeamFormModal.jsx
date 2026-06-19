import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, ImagePlus } from 'lucide-react'
import { MAX_PLAYERS } from '../../../stores/useTeamsStore'

const emptyForm = {
  name: '',
  manager: '',
  players: [''],
  logo: null,
  group: '',
}

export default function TeamFormModal({ isOpen, onClose, onSubmit, team, maxTeamsReached }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const isEditing = Boolean(team)

  useEffect(() => {
    if (isOpen) {
      if (team) {
        setForm({
          name: team.name,
          manager: team.manager,
          players: team.players.length > 0 ? team.players.map((p) => p.name) : [''],
          logo: team.logo,
          group: team.group || '',
        })
      } else {
        setForm(emptyForm)
      }
      setErrors({})
    }
  }, [isOpen, team])

  const MAX_LOGO_SIZE = 700 * 1024 // 700KB → base64 ~950KB, safe for Firebase
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
      setErrors((prev) => ({ ...prev, logo: 'يرجى اختيار ملف صورة' }))
      return
    }

    if (file.size > MAX_LOGO_SIZE) {
      setErrors((prev) => ({ ...prev, logo: 'حجم الصورة يجب أن لا يتجاوز 700 كيلوبايت' }))
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const resized = await resizeImage(reader.result, MAX_LOGO_DIM)
        setForm((prev) => ({ ...prev, logo: resized }))
        setErrors((prev) => ({ ...prev, logo: undefined }))
      } catch {
        setErrors((prev) => ({ ...prev, logo: 'فشل في معالجة الصورة' }))
      }
    }
    reader.readAsDataURL(file)
  }

  const addPlayerField = () => {
    if (form.players.length >= MAX_PLAYERS) return
    setForm((prev) => ({ ...prev, players: [...prev.players, ''] }))
  }

  const removePlayerField = (index) => {
    if (form.players.length <= 1) return
    setForm((prev) => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index),
    }))
  }

  const updatePlayer = (index, value) => {
    setForm((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => (i === index ? value : p)),
    }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = 'اسم الفريق مطلوب'
    if (!form.manager.trim()) nextErrors.manager = 'اسم المدرب مطلوب'

    const playerErrors = form.players.map((p) => !p.trim() ? 'اسم اللاعب مطلوب' : '')
    if (playerErrors.some(err => err)) {
      nextErrors.playerErrors = playerErrors
    }

    const filledPlayers = form.players.filter((p) => p.trim())
    if (filledPlayers.length === 0 && !nextErrors.playerErrors) {
      nextErrors.players = 'أضف لاعباً واحداً على الأقل'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isEditing && maxTeamsReached) return
    if (!validate()) return

    onSubmit({
      name: form.name,
      manager: form.manager,
      players: form.players,
      logo: form.logo,
      group: form.group || null,
    })
    onClose()
  }

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
                {isEditing ? 'تعديل الفريق' : 'إضافة فريق جديد'}
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
                <label className="block text-sm text-text-secondary mb-2">شعار الفريق</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {form.logo ? (
                      <img src={form.logo} alt="شعار الفريق" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus size={28} className="text-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-surface border border-border text-sm cursor-pointer hover:bg-bg-primary transition-colors">
                      <ImagePlus size={16} className="text-accent" />
                      <span>اختر صورة</span>
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
                        إزالة الشعار
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
                <label className="block text-sm text-text-secondary mb-2">اسم الفريق</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                  }}
                  placeholder="مثال: النجوم"
                  className={`w-full bg-bg-surface border ${errors.name ? 'border-danger' : 'border-border'} rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors`}
                />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>

              {/* Manager name */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">اسم المدرب</label>
                <input
                  type="text"
                  value={form.manager}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, manager: e.target.value }))
                    if (errors.manager) setErrors(prev => ({ ...prev, manager: undefined }))
                  }}
                  placeholder="مثال: أحمد محمد"
                  className={`w-full bg-bg-surface border ${errors.manager ? 'border-danger' : 'border-border'} rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors`}
                />
                {errors.manager && <p className="text-xs text-danger mt-1">{errors.manager}</p>}
              </div>

              {/* Group selection */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">المجموعة</label>
                <div className="relative">
                  <select
                    value={form.group}
                    onChange={(e) => setForm((prev) => ({ ...prev, group: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">بدون مجموعة (لم يتم السحب بعد)</option>
                    <option value="A">المجموعة A</option>
                    <option value="B">المجموعة B</option>
                    <option value="C">المجموعة C</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-text-secondary">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Players */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-text-secondary">
                    اللاعبون ({form.players.filter((p) => p.trim()).length}/{MAX_PLAYERS})
                  </label>
                  <button
                    type="button"
                    onClick={addPlayerField}
                    disabled={form.players.length >= MAX_PLAYERS}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={14} />
                    <span>إضافة لاعب</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {form.players.map((player, index) => {
                    const hasError = errors.playerErrors?.[index]
                    return (
                      <div key={index} className="flex flex-col gap-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={player}
                            onChange={(e) => {
                              updatePlayer(index, e.target.value)
                              if (errors.playerErrors) {
                                const newPlayerErrors = [...errors.playerErrors]
                                newPlayerErrors[index] = ''
                                setErrors(prev => ({ ...prev, playerErrors: newPlayerErrors }))
                              }
                            }}
                            placeholder={`اللاعب ${index + 1}`}
                            className={`flex-1 bg-bg-surface border ${hasError ? 'border-danger' : 'border-border'} rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-accent transition-colors`}
                          />
                          {form.players.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePlayerField(index)}
                              className="w-10 h-10 rounded-xl bg-bg-surface border border-border flex items-center justify-center text-danger hover:bg-danger/10 transition-colors shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        {hasError && <p className="text-xs text-danger pr-1">{hasError}</p>}
                      </div>
                    )
                  })}
                </div>
                {errors.players && <p className="text-xs text-danger mt-1">{errors.players}</p>}
              </div>

              <button
                type="submit"
                disabled={!isEditing && maxTeamsReached}
                className="w-full bg-accent text-black font-bold py-3.5 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isEditing ? 'حفظ التعديلات' : 'إضافة الفريق'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
