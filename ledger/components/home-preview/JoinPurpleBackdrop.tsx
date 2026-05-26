import { FF_ATF_GRADIENT } from '@/lib/ff-get-involved'

/** Shared join-purple atmosphere for home-preview above the fold */
export default function JoinPurpleBackdrop({ fadeToWhite = false }: { fadeToWhite?: boolean }) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: FF_ATF_GRADIENT }} aria-hidden />
      {fadeToWhite && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 50%, #f8fafc 88%, #ffffff 100%)',
          }}
          aria-hidden
        />
      )}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 32%, rgba(0,0,0,0.08) 100%)',
          }}
        />
        <div
          className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full opacity-40 blur-3xl sm:h-96 sm:w-96"
          style={{ background: 'radial-gradient(circle, #f5b87a 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-[8%] left-[-8%] h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #e07830 0%, transparent 68%)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-64 w-[110%] -translate-x-1/2 opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(ellipse at center, #f9e04c 0%, transparent 55%)' }}
        />
      </div>
    </>
  )
}
