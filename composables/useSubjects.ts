export interface SubjectMeta { key: string; label: string; icon: string; gradient: string; text: string; bg: string }

export const SUBJECTS: Record<string, SubjectMeta> = {
  toan: { key: 'toan', label: 'Toán học', icon: 'fa-square-root-variable', gradient: 'from-blue-600 to-blue-800', text: 'text-blue-700', bg: 'bg-blue-50' },
  ly:   { key: 'ly',   label: 'Vật lý',   icon: 'fa-atom',                 gradient: 'from-orange-500 to-amber-600', text: 'text-orange-600', bg: 'bg-orange-50' },
  hoa:  { key: 'hoa',  label: 'Hoá học',  icon: 'fa-flask',                gradient: 'from-green-500 to-emerald-700', text: 'text-green-700', bg: 'bg-green-50' },
  sinh: { key: 'sinh', label: 'Sinh học', icon: 'fa-dna',                  gradient: 'from-cyan-500 to-teal-700', text: 'text-cyan-700', bg: 'bg-cyan-50' },
  van:  { key: 'van',  label: 'Ngữ văn',  icon: 'fa-book-open',            gradient: 'from-red-500 to-rose-700', text: 'text-red-600', bg: 'bg-red-50' },
  anh:  { key: 'anh',  label: 'Tiếng Anh', icon: 'fa-language',            gradient: 'from-violet-500 to-purple-700', text: 'text-violet-700', bg: 'bg-violet-50' },
  su:   { key: 'su',   label: 'Lịch sử',  icon: 'fa-landmark',             gradient: 'from-amber-600 to-yellow-700', text: 'text-amber-700', bg: 'bg-amber-50' },
  dia:  { key: 'dia',  label: 'Địa lý',   icon: 'fa-earth-asia',           gradient: 'from-emerald-500 to-green-700', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  tin:  { key: 'tin',  label: 'Tin học',  icon: 'fa-laptop-code',          gradient: 'from-indigo-500 to-blue-700', text: 'text-indigo-700', bg: 'bg-indigo-50' },
  gdcd: { key: 'gdcd', label: 'GDCD',     icon: 'fa-scale-balanced',       gradient: 'from-pink-500 to-fuchsia-700', text: 'text-pink-700', bg: 'bg-pink-50' }
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
