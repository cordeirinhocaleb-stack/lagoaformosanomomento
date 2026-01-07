---
description: Fluxograma
---

MÓDULO C: CONTEXTO DO PROJETO (LAGOA FORMOSA)

[DESIGN_SYSTEM]

    Cores: Light (#f4f4f7) | Dark (bg-zinc-950).

    Efeitos: police-sweep (Red: #dc2626 | Blue: #2563eb).

    Tipografia: UI (Inter), Títulos (Merriweather), Detalhes/Assinaturas (Caveat).

    Animações: police-sweep, almost-fall, coin-spin, fadeIn, slideInRight.

    Stack: Tailwind v3 (CDN), Supabase, Cloudinary (Mídia), YouTube.

[DATABASE_SYNC]

    Mudanças em tabelas exigem atualização imediata de:

        Arquivo .sql (Schema).

        Policies (RLS).

        Documentação técnica de banco.

[VERSIONAMENTO_E_FLUXO]

    Incremento: +0.0.1 (Build +1) em App.tsx, package.json e VERSION.md.

    Pipeline: Local -> Staging (https://www.google.com/search?q=dev.webgho.com) -> Produção.

🛠️ CHECKLIST DE PRÉ-RESPOSTA (PARA A IA)

    Analisei o impacto no architecture.md?

    O novo código excede 400 linhas?

    Os inputs estão sanitizados e a tipagem está forte?

    Apliquei as cores e animações do Design System?

    A versão foi incrementada e o .sql atualizado?