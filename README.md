# TASMON Database (unofficial)

Site em React (Vite) só com conteúdo do jogo, 100% em inglês: Tasmons (372), golpes, passivas, classes, equipamentos (status máximos, gravação, talismãs), elementos, DEX, mecânicas (ovos, breeding, awakening, expedições, convite de amigo, Hero Growth) e fases (14 dificuldades).
Não tem nada de save nem do editor.

## Passo a passo

1. `npm install`
2. Imagens: `npm run assets -- "C:\Program Files (x86)\Steam\steamapps\common\TASMON Taskbar Monsters"`
   (aceita a pasta do jogo ou o caminho direto do `resources\app.asar`). Copia as imagens para `public/img`, nas mesmas subpastas do jogo.
   Opcional: `--skip=bg,monsters-anim` para deixar de fora pastas que o site não usa.
3. Testar: `npm run dev`
4. Gerar o site: `npm run build` → pasta `dist/` (suba o conteúdo para qualquer hospedagem estática).

O site usa `HashRouter` e `base: './'`, então funciona em qualquer pasta ou domínio, sem configurar redirecionamentos.
Sem as imagens, o site funciona e mostra placeholders.

## Onde ficam os dados
`src/data/*.json` (espécies, golpes, passivas, classes, equipamento, gravação, talismãs, metadados).
Nomes em inglês dos Tasmons: o jogo só tem nomes em japonês, então o site mostra o japonês + leitura em romaji. Para nomes oficiais em inglês, preencha `src/data/names-en.json` como `{ "flamewolf": "Flame Wolf" }`.

## Aviso
Imagens, nomes e dados pertencem aos criadores do jogo. Confira se a hospedagem pública das imagens é permitida.
# TasmonWiki
# TasmonWiki
