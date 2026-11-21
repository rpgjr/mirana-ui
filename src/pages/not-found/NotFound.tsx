import { Link } from "react-router-dom"

export function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Link to="/" className="text-primary hover:underline">
          Go to the board
        </Link>
      </div>
    </div>
  )
}
