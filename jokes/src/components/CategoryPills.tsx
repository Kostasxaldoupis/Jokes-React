const CATEGORIES = [
  { value: '',            label: 'ANY' },
  { value: 'Programming', label: 'PROGRAMMING' },
  { value: 'Misc',        label: 'MISC' },
  { value: 'Dark',        label: 'DARK' },
  { value: 'Pun',         label: 'PUN' },
  { value: 'Spooky',      label: 'SPOOKY' },
  { value: 'Christmas',   label: 'CHRISTMAS' },
]

type Props = {
  selected: string
  onSelect: (category: string) => void
}

function CategoryPills({ selected, onSelect }: Props) {
  return (
    <div className="type-selector">
      {CATEGORIES.map(cat => (
        <button
          key={cat.value}
          className={`type-pill ${selected === cat.value ? 'active' : ''}`}
          onClick={() => onSelect(cat.value)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryPills