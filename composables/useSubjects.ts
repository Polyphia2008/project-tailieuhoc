export interface SubjectMeta { key: string; label: string; icon: string; gradient: string; text: string; bg: string }

/**
 * Gradient dung tong dong sac (same-hue), diu mat - khong dung gradient choi
 * kieu xanh -> tim hay do -> cam theo dinh huong thiet ke MapDocs.
 */
export const SUBJECTS: Record<string, SubjectMeta> = {
  toan: { key: 'toan', label: 'Toán học', icon: 'fa-square-root-variable', gradient: 'from-blue-700 to-blue-900', text: 'text-blue-700', bg: 'bg-blue-50' },
  ly:   { key: 'ly',   label: 'Vật lý',   icon: 'fa-atom',                 gradient: 'from-orange-500 to-orange-700', text: 'text-orange-600', bg: 'bg-orange-50' },
  hoa:  { key: 'hoa',  label: 'Hoá học',  icon: 'fa-flask',                gradient: 'from-emerald-600 to-emerald-800', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  sinh: { key: 'sinh', label: 'Sinh học', icon: 'fa-dna',                  gradient: 'from-teal-600 to-teal-800', text: 'text-teal-700', bg: 'bg-teal-50' },
  van:  { key: 'van',  label: 'Ngữ văn',  icon: 'fa-book-open',            gradient: 'from-rose-600 to-rose-800', text: 'text-rose-700', bg: 'bg-rose-50' },
  anh:  { key: 'anh',  label: 'Tiếng Anh', icon: 'fa-language',            gradient: 'from-indigo-600 to-indigo-800', text: 'text-indigo-700', bg: 'bg-indigo-50' },
  su:   { key: 'su',   label: 'Lịch sử',  icon: 'fa-landmark',             gradient: 'from-amber-600 to-amber-800', text: 'text-amber-700', bg: 'bg-amber-50' },
  dia:  { key: 'dia',  label: 'Địa lý',   icon: 'fa-earth-asia',           gradient: 'from-green-600 to-green-800', text: 'text-green-700', bg: 'bg-green-50' },
  tin:  { key: 'tin',  label: 'Tin học',  icon: 'fa-laptop-code',          gradient: 'from-sky-600 to-sky-800', text: 'text-sky-700', bg: 'bg-sky-50' },
  gdcd: { key: 'gdcd', label: 'GDCD',     icon: 'fa-scale-balanced',       gradient: 'from-slate-600 to-slate-800', text: 'text-slate-700', bg: 'bg-slate-100' }
}
const FALLBACK: SubjectMeta = { key: 'khac', label: 'Khác', icon: 'fa-file-lines', gradient: 'from-slate-500 to-slate-700', text: 'text-slate-700', bg: 'bg-slate-50' }

export function useSubjects() {
  const list = computed<SubjectMeta[]>(() => Object.values(SUBJECTS))
  const meta = (key?: string): SubjectMeta => (key && SUBJECTS[key]) || FALLBACK
  const label = (key?: string) => meta(key).label
  const gradient = (key?: string) => meta(key).gradient
  const icon = (key?: string) => meta(key).icon
  const grades = [10, 11, 12]
  return { SUBJECTS, list, meta, label, gradient, icon, grades }
}
