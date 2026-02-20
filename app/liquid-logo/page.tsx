import { LiquidLogo } from '@/components/ui/liquid-logo';

type LiquidLogoPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function LiquidLogoPage({ searchParams }: LiquidLogoPageProps) {
  const capture = searchParams?.capture === '1';

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="h-[min(92vw,92vh)] w-[min(92vw,92vh)]">
        <LiquidLogo
          className="size-full"
          imageUrl="/liquid-logo-source.png"
          autoAnimate={!capture}
          showProcessing={!capture}
          captureId={capture ? 'step-pay-liquid' : undefined}
        />
      </div>
    </main>
  );
}
