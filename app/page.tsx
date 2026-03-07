import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-900 text-sm font-semibold text-white">
                RM
              </div>
              <h1 className="text-lg font-semibold">Restaurant Manager</h1>
            </div>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Restaurant management made simple
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Complete POS, kitchen workflow, menu, and staff management in one fast dashboard.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/login">
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { title: 'POS System', desc: 'Fast order taking and payment processing' },
            { title: 'Kitchen Display', desc: 'Real-time order tracking and management' },
            { title: 'Staff Management', desc: 'Role-based access and assignment tools' },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
