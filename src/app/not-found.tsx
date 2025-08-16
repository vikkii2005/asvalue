import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='mx-auto max-w-md text-center'>
        <h1 className='text-primary text-6xl font-bold'>404</h1>
        <h2 className='text-foreground mt-4 text-2xl font-bold'>
          Page not found
        </h2>
        <p className='text-muted-foreground mt-2'>
          Sorry, we couldn&apos;t find the page you&rsquo;re looking for.
        </p>
        <Link
          href='/'
          className='bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex h-9 items-center justify-center rounded-md px-8 text-sm font-semibold shadow transition-colors'
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
