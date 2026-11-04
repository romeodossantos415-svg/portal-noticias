"use client";
import type { ActionState } from "@/lib/types";
import { useActionState, useState } from "react";
import { saveSettingsForm } from "@/app/admin/(panel)/personalizar/actions";
import { ImageField } from "./MediaPicker";
import { Field, Input, Textarea, Select, SubmitButton, Alert, Card } from "./ui";
import { HomeLayoutEditor } from "./HomeLayoutEditor";
import type { Category, SiteSettings } from "@/lib/types";

const FONTS = ["Playfair Display", "Merriweather", "Lora", "Source Serif 4", "Libre Baskerville", "DM Serif Display", "Inter", "Roboto", "Open Sans", "Montserrat", "Poppins", "Nunito Sans", "Work Sans", "IBM Plex Sans", "Oswald"];

function Toggle({ name, checked, label }: { name: string; checked: boolean; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="hidden" name={`${name.split(".")[0]}.__has_${name.split(".")[1]}`} value="1" />
      <input type="checkbox" name={name} defaultChecked={checked} className="h-4 w-4" /> {label}
    </label>
  );
}

export function AppearanceForm({ settings, categories }: { settings: SiteSettings; categories: Category[] }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettingsForm, {});
  const [tab, setTab] = useState<"identidade" | "cores" | "cabecalho" | "home" | "rodape" | "redes">("identidade");
  const t = settings.theme;
  const [preview, setPreview] = useState({ primary: t.primary, secondary: t.secondary, accent: t.accent, background: t.background, text: t.text, font_heading: t.font_heading, font_body: t.font_body });

  const tabs = [
    ["identidade", "Identidade"], ["cores", "Cores e tipografia"], ["cabecalho", "Cabeçalho e faixa"], ["home", "Blocos da página inicial"], ["rodape", "Rodapé"], ["redes", "Redes sociais"],
  ] as const;

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      <div className="flex flex-wrap gap-1 border-b">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === k ? "border-slate-900" : "border-transparent text-slate-500"}`}>{l}</button>
        ))}
      </div>

      <div className={tab === "identidade" ? "grid md:grid-cols-2 gap-4" : "hidden"}>
        <Card>
          <div className="space-y-3">
            <Field label="Nome do portal"><Input name="identity.name" defaultValue={settings.identity.name} /></Field>
            <Field label="Slogan"><Input name="identity.tagline" defaultValue={settings.identity.tagline} /></Field>
            <Field label="Descrição institucional (SEO / rodapé)"><Textarea name="identity.description" defaultValue={settings.identity.description} /></Field>
          </div>
        </Card>
        <Card>
          <div className="space-y-4">
            <ImageField name="identity.logo_url" label="Logotipo (fundo claro)" defaultValue={settings.identity.logo_url} />
            <ImageField name="identity.logo_dark_url" label="Logotipo para rodapé (fundo escuro)" defaultValue={settings.identity.logo_dark_url} />
            <ImageField name="identity.favicon_url" label="Favicon (PNG 64×64 ou .ico)" defaultValue={settings.identity.favicon_url} />
          </div>
        </Card>
      </div>

      <div className={tab === "cores" ? "grid lg:grid-cols-3 gap-4" : "hidden"}>
        <Card className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-4">
            {([["primary", "Cor principal (destaques, links)"], ["secondary", "Cor secundária (títulos, rodapé)"], ["accent", "Cor de realce"], ["background", "Fundo da página"], ["surface", "Fundo de seções"], ["text", "Cor do texto"], ["muted", "Texto secundário"]] as const).map(([k, l]) => (
              <Field key={k} label={l}>
                <div className="flex gap-2">
                  <input type="color" name={`theme.${k}`} defaultValue={t[k]} onChange={(e) => setPreview({ ...preview, [k]: e.target.value })} className="h-10 w-14 border rounded-lg" />
                  <span className="text-xs text-slate-500 self-center font-mono">{(preview as Record<string, string>)[k] ?? t[k]}</span>
                </div>
              </Field>
            ))}
            <Field label="Fonte dos títulos">
              <Select name="theme.font_heading" defaultValue={t.font_heading} onChange={(e) => setPreview({ ...preview, font_heading: e.target.value })}>
                {FONTS.map((f) => <option key={f}>{f}</option>)}
              </Select>
            </Field>
            <Field label="Fonte do texto">
              <Select name="theme.font_body" defaultValue={t.font_body} onChange={(e) => setPreview({ ...preview, font_body: e.target.value })}>
                {FONTS.map((f) => <option key={f}>{f}</option>)}
              </Select>
            </Field>
            <Field label="Tamanho dos títulos (escala)" hint="1 = padrão. 1.2 = 20% maior.">
              <Input type="number" step="0.05" min="0.7" max="1.6" name="theme.heading_scale" defaultValue={t.heading_scale} />
            </Field>
            <Field label="Arredondamento (bordas)">
              <Select name="theme.radius" defaultValue={t.radius}>
                <option value="0px">Reto</option><option value="4px">Leve</option><option value="8px">Médio</option><option value="16px">Arredondado</option>
              </Select>
            </Field>
            <Field label="Estilo das manchetes">
              <Select name="theme.headline_style" defaultValue={t.headline_style}>
                <option value="serif">Serifado (editorial)</option><option value="sans">Sem serifa (moderno)</option>
              </Select>
            </Field>
          </div>
        </Card>
        <Card title="Pré-visualização">
          <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(preview.font_heading).replace(/%20/g, "+")}:wght@700&family=${encodeURIComponent(preview.font_body).replace(/%20/g, "+")}:wght@400&display=swap`} />
          <div className="rounded-lg border overflow-hidden" style={{ background: preview.background, color: preview.text, fontFamily: preview.font_body }}>
            <div className="px-4 py-2 text-xs text-white" style={{ background: preview.secondary }}>
              <span className="px-2 py-0.5 font-bold" style={{ background: preview.primary }}>ÚLTIMAS</span> Manchete rolando na faixa de notícias
            </div>
            <div className="p-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: preview.primary }}>Política</div>
              <div className="text-xl font-bold leading-tight" style={{ fontFamily: preview.font_heading, color: preview.secondary }}>Título de exemplo de uma manchete do portal</div>
              <p className="text-sm opacity-70">Linha fina explicando a notícia com mais contexto para o leitor.</p>
              <button type="button" className="text-xs text-white px-3 py-1.5 rounded" style={{ background: preview.primary }}>Ler mais</button>
              <span className="text-xs ml-2" style={{ color: preview.accent }}>● realce</span>
            </div>
          </div>
        </Card>
      </div>

      <div className={tab === "cabecalho" ? "grid md:grid-cols-2 gap-4" : "hidden"}>
        <Card title="Cabeçalho">
          <div className="space-y-3">
            <Toggle name="header.sticky" checked={settings.header.sticky} label="Cabeçalho fixo ao rolar" /><br />
            <Toggle name="header.show_search" checked={settings.header.show_search} label="Mostrar campo de busca" /><br />
            <Toggle name="header.show_social" checked={settings.header.show_social} label="Mostrar ícones de redes sociais" /><br />
            <Toggle name="header.show_date" checked={settings.header.show_date} label="Mostrar data" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Field label="Botão especial (texto)" hint="Ex.: Assine, WhatsApp"><Input name="header.cta_label" defaultValue={settings.header.cta_label} /></Field>
              <Field label="Botão especial (link)"><Input name="header.cta_url" defaultValue={settings.header.cta_url} /></Field>
            </div>
          </div>
        </Card>
        <Card title="Faixa de últimas notícias">
          <div className="space-y-3">
            <Toggle name="ticker.enabled" checked={settings.ticker.enabled} label="Ativar faixa" />
            <Field label="Rótulo"><Input name="ticker.label" defaultValue={settings.ticker.label} /></Field>
            <Field label="Velocidade (segundos por volta)"><Input type="number" name="ticker.speed" defaultValue={settings.ticker.speed} min={20} max={200} /></Field>
            <p className="text-xs text-slate-500">As manchetes da faixa são escolhidas em <strong>Destaques → Últimas notícias (faixa)</strong>.</p>
          </div>
        </Card>
      </div>

      <div className={tab === "home" ? "" : "hidden"}>
        <HomeLayoutEditor initial={settings.home_layout?.blocks ?? []} categories={categories} />
      </div>

      <div className={tab === "rodape" ? "grid md:grid-cols-2 gap-4" : "hidden"}>
        <Card>
          <div className="space-y-3">
            <Field label="Texto institucional"><Textarea name="footer.about" defaultValue={settings.footer.about} /></Field>
            <Field label="E-mail de contato"><Input name="footer.contact_email" defaultValue={settings.footer.contact_email} /></Field>
            <Field label="Telefone"><Input name="footer.contact_phone" defaultValue={settings.footer.contact_phone} /></Field>
            <Field label="Endereço"><Input name="footer.address" defaultValue={settings.footer.address} /></Field>
          </div>
        </Card>
        <Card>
          <div className="space-y-3">
            <Field label="Expediente" hint="Direção, edição, redação, jornalista responsável…"><Textarea name="footer.expediente" defaultValue={settings.footer.expediente} className="!min-h-32" /></Field>
            <Field label="Direitos autorais" hint="Use {year} para o ano atual."><Input name="footer.copyright" defaultValue={settings.footer.copyright} /></Field>
            <p className="text-xs text-slate-500">Links institucionais do rodapé: marque “Mostrar link no rodapé” em cada página em <strong>Páginas</strong>.</p>
          </div>
        </Card>
      </div>

      <div className={tab === "redes" ? "" : "hidden"}>
        <Card>
          <div className="grid md:grid-cols-2 gap-3">
            {["instagram", "facebook", "x", "youtube", "tiktok", "whatsapp", "linkedin"].map((k) => (
              <Field key={k} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} hint={k === "whatsapp" ? "Número com DDI, ex.: 5585999999999" : "URL completa"}>
                <Input name={`social.${k}`} defaultValue={settings.social?.[k] ?? ""} />
              </Field>
            ))}
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 bg-slate-100/90 backdrop-blur py-3 flex justify-end">
        <SubmitButton>Salvar alterações</SubmitButton>
      </div>
    </form>
  );
}
