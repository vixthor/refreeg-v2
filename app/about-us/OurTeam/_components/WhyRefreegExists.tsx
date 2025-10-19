import Link from 'next/link'

type Props = {
  title?: string
  ctaText?: string
  ctaHref?: string
}

const DEFAULT_TITLE =
  'RefreeG was created by a small team who saw how hard it can be to raise support for ideas, projects, or urgent needs. Traditional fundraising often felt limited, complicated, or out of reach. RefreeG is our way of making crowdfunding easier, transparent, and reliable for everyone.'

export default function WhyRefreegExists({
  title = DEFAULT_TITLE,
  ctaText = 'Get started today',
  ctaHref = '/causes',
}: Props) {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16 my-10">
      <div className="bg-[#0C4A85] text-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 lg:p-14 shadow-sm">
        <p className="text-sm md:text-base font-medium opacity-90 mb-3">Why RefreeG Exists</p>
        <h2 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl leading-tight font-bold tracking-tight">
          {title}
        </h2>
        <div className="mt-6">
          <Link href={ctaHref} className="inline-flex items-center gap-2 underline underline-offset-4">
            {ctaText}
            <span aria-hidden>›</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
