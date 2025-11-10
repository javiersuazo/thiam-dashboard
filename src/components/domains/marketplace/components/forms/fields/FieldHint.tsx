export interface FieldHintProps {
  id: string
  hint: string
}

export function FieldHint({ id, hint }: FieldHintProps) {
  return (
    <p id={id} className="text-sm text-gray-500">
      {hint}
    </p>
  )
}
