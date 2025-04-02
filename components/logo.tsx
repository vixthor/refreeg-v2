import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary">
        <span className="text-secondary-foreground font-bold text-lg">R</span>
      </div>
      <span className="text-xl font-bold">Refreeg</span>
    </Link>
  )
}

