import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, Upload, PenLine, Download } from "lucide-react";

const URL = "https://pdf-charm-kit.lovable.app/blog/como-criar-apostilas-interativas-pdf";
const TITLE = "Como criar apostilas interativas em PDF (sem upload) — Grifo";
const DESC = "Guia prático para professores: transforme PDFs estáticos em apostilas interativas no navegador, com campos preenchíveis, sem upload e sem cadastro.";
const PUBLISHED = "2026-06-13";

export const Route = createFileRoute("/blog/como-criar-apostilas-interativas-pdf")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "article:published_time", content: PUBLISHED },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Como criar apostilas interativas em PDF (sem upload)",
          description: DESC,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          inLanguage: "pt-BR",
          author: { "@type": "Organization", name: "Grifo" },
          publisher: { "@type": "Organization", name: "Grifo" },
          mainEntityOfPage: URL,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Como tornar uma apostila em PDF interativa",
          description: "Passo a passo para converter um PDF estático em uma apostila interativa preenchível diretamente no navegador.",
          totalTime: "PT5M",
          step: [
            { "@type": "HowToStep", name: "Abrir o PDF", text: "Arraste o PDF da apostila para o editor do Grifo — o arquivo é processado localmente no navegador, sem upload." },
            { "@type": "HowToStep", name: "Adicionar campos", text: "Desenhe campos de texto, caixas de seleção, datas e números sobre as perguntas do PDF." },
            { "@type": "HowToStep", name: "Testar o preenchimento", text: "Preencha como um aluno para validar tamanhos, fontes e a ordem dos campos." },
            { "@type": "HowToStep", name: "Exportar PDF preenchido", text: "Exporte como PDF achatado ou PNG para enviar à turma ou guardar como gabarito." },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Como tornar uma apostila interativa?",
              acceptedAnswer: { "@type": "Answer", text: "Abra o PDF em um editor que permita sobrepor campos preenchíveis (texto, checkbox, data, número) sobre a página renderizada e exporte o resultado como PDF achatado." },
            },
            {
              "@type": "Question",
              name: "Preciso enviar o PDF para um servidor?",
              acceptedAnswer: { "@type": "Answer", text: "Não. No Grifo o PDF é aberto e processado localmente no navegador — nada é enviado para servidores, o que preserva a privacidade dos alunos." },
            },
            {
              "@type": "Question",
              name: "Funciona em substituição ao Liveworksheets ou I Love PDF?",
              acceptedAnswer: { "@type": "Answer", text: "Sim. O Grifo cobre o caso de uso de criar fichas e apostilas interativas, sem cadastro e sem upload, exportando um PDF preenchido pronto para entrega." },
            },
          ],
        }),
      },
    ],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <div className="min-h-screen bg-highlight/40 text-ink">
      <header className="border-b border-border bg-card px-6 py-5 md:px-12">
        <Link to="/" className="text-sm font-semibold text-ink hover:underline">← Grifo</Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 md:px-0">
        <article className="prose-like">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Guia · 5 min de leitura</p>
          <h1 className="font-display mt-4 text-4xl md:text-5xl text-ink leading-tight">
            Como criar <span className="text-highlight-mark">apostilas interativas</span> em PDF (sem upload)
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Professores perdem horas reformatando provas e apostilas para que alunos possam responder no computador.
            Este guia mostra como transformar qualquer PDF — mesmo escaneado — em uma apostila interativa preenchível
            direto no navegador, sem instalar nada, sem subir arquivos para a nuvem e sem cadastro.
          </p>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-ink">Por que tornar uma apostila interativa?</h2>
            <p className="mt-3 text-foreground/80">
              Uma apostila interativa elimina a impressão, padroniza a entrega das respostas e funciona em qualquer
              dispositivo. Para o aluno, é responder no próprio PDF; para o professor, é receber um arquivo único,
              legível e fácil de arquivar.
            </p>
            <ul className="mt-5 space-y-2 text-foreground/80">
              {[
                "Sem reescrever a prova em outro formato (Forms, Docs, etc).",
                "Funciona offline, no navegador do aluno.",
                "Preserva o layout original do PDF — fórmulas, figuras e diagramação.",
                "Privacidade: nenhum arquivo sai do dispositivo.",
              ].map((b) => (
                <li key={b} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0" style={{ color: "var(--color-pen-green)" }} /> {b}</li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-ink">Passo a passo</h2>

            <Step n={1} icon={Upload} title="Abra o PDF no editor">
              No <Link to="/tool" className="underline">editor do Grifo</Link>, arraste o PDF da apostila. Ele é
              renderizado localmente — diferente de I Love PDF, PDF Filler ou Liveworksheets, nada é enviado para
              servidores externos.
            </Step>

            <Step n={2} icon={PenLine} title="Adicione os campos sobre as perguntas">
              Use a barra de ferramentas para desenhar campos de <strong>texto</strong>, <strong>checkbox</strong>,
              <strong> data</strong> e <strong>número</strong> exatamente sobre os espaços de resposta. Ajuste fonte
              e tamanho — o conteúdo do aluno fica alinhado ao PDF original.
            </Step>

            <Step n={3} icon={CheckCircle2} title="Teste como aluno">
              Preencha você mesmo uma vez para conferir tabulação, ordem dos campos e se as caixas comportam respostas
              longas. Pequenos ajustes agora evitam retrabalho depois.
            </Step>

            <Step n={4} icon={Download} title="Exporte o PDF preenchível">
              Exporte como PDF achatado para enviar à turma. Cada aluno preenche no navegador e devolve um único
              arquivo final — pronto para correção.
            </Step>
          </section>

          <section className="mt-12 rounded-2xl border-2 border-ink bg-highlight p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-6 w-6 text-ink" />
              <div>
                <h3 className="text-lg font-semibold text-ink">Por que "sem upload" importa em sala de aula</h3>
                <p className="mt-2 text-sm text-ink/80">
                  Apostilas costumam conter nome, idade e respostas de menores. Ferramentas que sobem o PDF para um
                  servidor processam — e às vezes armazenam — esses dados. O Grifo roda 100% no navegador: o PDF e as
                  respostas nunca saem do dispositivo do aluno.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-ink">Perguntas frequentes</h2>
            <Faq q="Como tornar uma apostila interativa?" a="Abra o PDF em um editor que permita sobrepor campos preenchíveis (texto, checkbox, data, número) sobre a página renderizada e exporte o resultado como PDF achatado." />
            <Faq q="Funciona com PDF escaneado?" a="Sim. Como os campos são desenhados sobre a página, não é necessário que o PDF tenha texto selecionável." />
            <Faq q="Preciso de cadastro?" a="Não. O Grifo abre direto no navegador, sem login e sem instalação." />
            <Faq q="É grátis?" a="Sim, o editor é gratuito para uso individual de professores e alunos." />
          </section>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link to="/tool" className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-highlight">
              Abrir o editor <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-card px-6 py-3.5 text-base font-semibold text-ink">
              Voltar ao início
            </Link>
          </div>
        </article>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-6 text-sm text-muted-foreground">© {new Date().getFullYear()} Grifo</div>
      </footer>
    </div>
  );
}

function Step({ n, icon: Icon, title, children }: { n: number; icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-highlight text-sm font-bold">{n}</span>
        <Icon className="h-5 w-5 text-ink/70" />
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
      </div>
      <p className="mt-3 text-foreground/80">{children}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="mt-4 border-t border-border pt-4">
      <h3 className="font-semibold text-ink">{q}</h3>
      <p className="mt-1 text-foreground/80">{a}</p>
    </div>
  );
}