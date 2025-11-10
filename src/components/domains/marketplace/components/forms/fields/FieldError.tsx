export interface FieldErrorProps {
  id: string
  error: string
}

export function FieldError({ id, error }: FieldErrorProps) {
  return (
    <p id={id} className="text-sm text-red-500" role="alert">
      {error}
    </p>
  )
}
