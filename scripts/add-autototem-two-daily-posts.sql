BEGIN;

CREATE TABLE IF NOT EXISTS "PostAutototemTwoDailyInsert_20260502" AS
SELECT now()::timestamp AS "recordedAt", p.*
FROM "Post" p
WHERE false;

WITH media_seed(id, name, path) AS (
  VALUES
    ('84d7c667-7b7d-4702-9d1b-083af2d2810c', 'autototem-reels-hardware-real.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-hardware-real.mp4'),
    ('e84994cb-99bb-4734-90ab-a247d1cedadf', 'autototem-youtube-hardware-real.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-hardware-real.mp4'),
    ('77045e24-cf70-498b-a0c4-950fa9545d0a', 'autototem-reels-pix-balcao.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-pix-balcao.mp4'),
    ('ecbe79cd-4386-4817-9c19-99aefbb89581', 'autototem-youtube-pix-balcao.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-pix-balcao.mp4'),
    ('6bb03e77-0207-41a5-95c5-a53e8fbb636d', 'autototem-reels-clinicas.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-clinicas.mp4'),
    ('617099cb-f266-4069-8cbc-c13cad241b9d', 'autototem-youtube-clinicas.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-clinicas.mp4'),
    ('de5b677b-d462-484d-9a2e-9ed37ab72971', 'autototem-reels-varejo-cadastro.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-varejo-cadastro.mp4'),
    ('23148921-245f-4d28-b22c-878cfd0fc4ee', 'autototem-youtube-varejo-cadastro.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-varejo-cadastro.mp4'),
    ('b04b325b-4851-4bda-8a4a-0168c01930c2', 'autototem-reels-checklist-implantacao.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-checklist-implantacao.mp4'),
    ('bf78eb01-b152-40ed-bb9e-27f477d90894', 'autototem-youtube-checklist-implantacao.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-checklist-implantacao.mp4')
)
INSERT INTO "Media" (
  id, name, "originalName", path, "organizationId", "createdAt", "updatedAt", "fileSize", type
)
SELECT
  id,
  name,
  name,
  path,
  '5bb464a3-ffaf-4758-ac7f-7b00e79697fe',
  now(),
  now(),
  0,
  'video'
FROM media_seed
ON CONFLICT (id) DO NOTHING;

WITH themes AS (
  SELECT *
  FROM (
    VALUES
      (
        '2026-05-04'::date,
        'hardware-real',
        '2e799a65-67e1-4575-97d9-4938ec4c0dec',
        '84d7c667-7b7d-4702-9d1b-083af2d2810c',
        'autototem-reels-hardware-real.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-hardware-real.mp4',
        'e84994cb-99bb-4734-90ab-a247d1cedadf',
        'autototem-youtube-hardware-real.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-hardware-real.mp4',
        'Tablet e totem real para autoatendimento',
        $ig$<p>Quer montar um totem sem improviso?</p><p>O AutoTotem roda em tablet real, pedestal ou kiosk, com pedido, cadastro e Pix em tela cheia.</p><p>No site ja deixamos indicacoes de tablet e totem para comecar com o hardware certo.</p><p>Veja: https://autototem.com.br/#hardware</p><p>#AutoTotem #TotemDeAutoatendimento #TabletParaTotem #SelfService #Hardware #Kiosk #Pix</p>$ig$,
        $yt$<p>Tablet e totem real para autoatendimento.</p><p>Neste video mostramos como o AutoTotem pode rodar em tablet real, pedestal ou kiosk, com pedido, cadastro e Pix em tela cheia.</p><p>Veja as indicacoes de hardware: https://autototem.com.br/#hardware</p>$yt$
      ),
      (
        '2026-05-05'::date,
        'pix-balcao',
        'ece8832c-6546-4e8f-bca9-167ff994c918',
        '77045e24-cf70-498b-a0c4-950fa9545d0a',
        'autototem-reels-pix-balcao.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-pix-balcao.mp4',
        'ecbe79cd-4386-4817-9c19-99aefbb89581',
        'autototem-youtube-pix-balcao.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-pix-balcao.mp4',
        'Pix no balcao sem travar a equipe',
        $ig$<p>Pagamento tambem pode virar gargalo.</p><p>Com o AutoTotem, o cliente revisa pedido, segue para Pix guiado e deixa a equipe focada no atendimento que precisa de decisao humana.</p><p>Menos conferencia manual, mais fluxo no horario cheio.</p><p>Conheca: https://autototem.com.br</p><p>#AutoTotem #Pix #Autoatendimento #TotemDigital #Restaurantes #Varejo #AtendimentoDigital</p>$ig$,
        $yt$<p>Pix no balcao sem travar a equipe.</p><p>Mostramos como o AutoTotem ajuda o cliente a revisar pedido, seguir para pagamento guiado e reduzir conferencias manuais no horario de pico.</p><p>Conheca: https://autototem.com.br</p>$yt$
      ),
      (
        '2026-05-06'::date,
        'clinicas',
        '3c82f419-6000-456d-b60a-18af3d9bd73c',
        '6bb03e77-0207-41a5-95c5-a53e8fbb636d',
        'autototem-reels-clinicas.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-clinicas.mp4',
        '617099cb-f266-4069-8cbc-c13cad241b9d',
        'autototem-youtube-clinicas.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-clinicas.mp4',
        'Check-in para clinicas e recepcoes',
        $ig$<p>Recepcao cheia nao precisa virar fila desorganizada.</p><p>O AutoTotem pode guiar cadastro, triagem, check-in e proximas etapas antes do atendimento humano.</p><p>Ideal para clinicas, recepcoes, servicos e operacoes com entrada repetitiva.</p><p>Veja: https://autototem.com.br</p><p>#AutoTotem #Clinicas #Recepcao #CheckInDigital #TotemDeAtendimento #SelfService</p>$ig$,
        $yt$<p>Check-in para clinicas e recepcoes.</p><p>Neste video mostramos como o AutoTotem guia cadastro, triagem e proximas etapas para diminuir fila e organizar dados antes do atendimento humano.</p><p>Veja: https://autototem.com.br</p>$yt$
      ),
      (
        '2026-05-07'::date,
        'varejo-cadastro',
        '5ae311fe-c5b0-47e6-b0f2-fa7e14b43f74',
        'de5b677b-d462-484d-9a2e-9ed37ab72971',
        'autototem-reels-varejo-cadastro.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-varejo-cadastro.mp4',
        '23148921-245f-4d28-b22c-878cfd0fc4ee',
        'autototem-youtube-varejo-cadastro.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-varejo-cadastro.mp4',
        'Cadastro no varejo sem travar a venda',
        $ig$<p>Cadastro no caixa atrasa a venda e aumenta a fila.</p><p>Com o AutoTotem, o cliente informa dados, aceita termos, acompanha status e segue para a proxima etapa sem travar o balcao.</p><p>Use em loja, evento, retirada e atendimento presencial.</p><p>Conheca: https://autototem.com.br</p><p>#AutoTotem #Varejo #CadastroDigital #TotemDigital #SelfService #Atendimento</p>$ig$,
        $yt$<p>Cadastro no varejo sem travar a venda.</p><p>Veja como o AutoTotem ajuda o cliente a informar dados, aceitar termos, acompanhar status e seguir para a proxima etapa sem travar o balcao.</p><p>Conheca: https://autototem.com.br</p>$yt$
      ),
      (
        '2026-05-08'::date,
        'checklist-implantacao',
        '63d7ad2f-7dbd-4c5f-94d9-17e088a25247',
        'b04b325b-4851-4bda-8a4a-0168c01930c2',
        'autototem-reels-checklist-implantacao.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-checklist-implantacao.mp4',
        'bf78eb01-b152-40ed-bb9e-27f477d90894',
        'autototem-youtube-checklist-implantacao.mp4',
        'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-checklist-implantacao.mp4',
        'Checklist para publicar seu totem',
        $ig$<p>Para colocar um totem no ar, voce precisa de cinco coisas.</p><p>Tablet, pedestal, fluxo de atendimento, identidade visual e teste no ponto de uso.</p><p>O AutoTotem organiza o software para voce publicar rapido e operar com mais padrao.</p><p>Comece: https://autototem.com.br</p><p>#AutoTotem #TotemDeAutoatendimento #Checklist #TabletParaTotem #Kiosk #Operacao</p>$ig$,
        $yt$<p>Checklist para publicar seu totem.</p><p>Tablet, pedestal, fluxo de atendimento, identidade visual e teste no ponto de uso: veja os cinco passos para tirar o autoatendimento do papel.</p><p>Comece: https://autototem.com.br</p>$yt$
      )
  ) AS t(day, slug, group_id, reels_media_id, reels_name, reels_path, youtube_media_id, youtube_name, youtube_path, youtube_title, social_content, youtube_content)
),
channels AS (
  VALUES
    ('instagram', 'manual_igstandalone_17841427538670069', time '18:30:00', '{"__type": "instagram-standalone", "post_type": "post"}'::text),
    ('youtube', 'cmolc48ai0001o66wovcgtp21', time '19:00:00', null::text),
    ('facebook', 'cmomxwwb00001lk72rvem8qdv', time '20:30:00', '{"__type": "facebook"}'::text)
),
prepared AS (
  SELECT
    'at2-' || to_char(t.day, 'YYYYMMDD') || '-' || t.slug || '-' || c.column1 AS post_id,
    t.day + c.column3 AS publish_date,
    c.column2 AS integration_id,
    t.group_id,
    CASE WHEN c.column1 = 'youtube' THEN t.youtube_content ELSE t.social_content END AS content,
    CASE
      WHEN c.column1 = 'youtube' THEN jsonb_build_object(
        'tags', jsonb_build_array(
          jsonb_build_object('label', 'AutoTotem', 'value', 'AutoTotem'),
          jsonb_build_object('label', 'totem de autoatendimento', 'value', 'totem de autoatendimento'),
          jsonb_build_object('label', 'self-service', 'value', 'self-service'),
          jsonb_build_object('label', 'atendimento digital', 'value', 'atendimento digital'),
          jsonb_build_object('label', 'Pix', 'value', 'Pix')
        ),
        'type', 'public',
        'title', t.youtube_title || ' | AutoTotem',
        '__type', 'youtube',
        'selfDeclaredMadeForKids', 'no'
      )::text
      ELSE c.column4
    END AS settings,
    CASE WHEN c.column1 = 'youtube' THEN t.youtube_media_id ELSE t.reels_media_id END AS media_id,
    CASE WHEN c.column1 = 'youtube' THEN t.youtube_name ELSE t.reels_name END AS media_name,
    CASE WHEN c.column1 = 'youtube' THEN t.youtube_path ELSE t.reels_path END AS media_path
  FROM themes t
  CROSS JOIN channels c
)
INSERT INTO "Post" (
  id,
  state,
  "publishDate",
  "organizationId",
  "integrationId",
  content,
  delay,
  "group",
  title,
  description,
  settings,
  image,
  "approvedSubmitForOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  post_id,
  'QUEUE'::"State",
  publish_date,
  '5bb464a3-ffaf-4758-ac7f-7b00e79697fe',
  integration_id,
  content,
  0,
  group_id,
  '',
  '',
  settings,
  jsonb_build_array(
    jsonb_build_object(
      'id', media_id,
      'alt', null,
      'name', media_name,
      'path', media_path,
      'thumbnail', null,
      'originalName', media_name
    )
  )::text,
  'NO'::"APPROVED_SUBMIT_FOR_ORDER",
  now(),
  now()
FROM prepared
ON CONFLICT (id) DO NOTHING;

INSERT INTO "PostAutototemTwoDailyInsert_20260502"
SELECT now()::timestamp AS "recordedAt", p.*
FROM "Post" p
WHERE p.id LIKE 'at2-202605%'
  AND NOT EXISTS (
    SELECT 1
    FROM "PostAutototemTwoDailyInsert_20260502" b
    WHERE b.id = p.id
  );

COMMIT;
