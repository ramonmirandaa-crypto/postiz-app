BEGIN;

CREATE TABLE IF NOT EXISTS "PostMediaBackup_20260501_html_assets" (
  "id" text PRIMARY KEY,
  "image" text,
  "updatedAt" timestamp(3),
  "backedUpAt" timestamp(3) NOT NULL DEFAULT now()
);

WITH target_posts(id) AS (
  VALUES
    ('cmatigfilapicobc14b5d721e245'),
    ('cmom0fycl0000p86tjvq7he34'),
    ('cmatfbfilapico49aefa7f0e2e41'),
    ('cmatiggargalo752d57909d7848'),
    ('cmom0o0u40001p86tyq9gj17f'),
    ('cmatfbgargalo5222bffe8a5c41'),
    ('cmatig6motivos85b2dd9c2e5345'),
    ('cmom0os8p0002p86tmb3raf4l'),
    ('cmatfb6motivosfccecde1665543'),
    ('cmatigondeusar16d726358cef4e'),
    ('cmom0p2ur0003p86tnd3cpta7'),
    ('cmatfbondeusare37ca9d7d78a4c'),
    ('cmatigrestaurante1378833b4ebd42'),
    ('cmom0p9hn0004p86t0l1qxbxc'),
    ('cmatfbrestaurante8398db90b71c48')
)
INSERT INTO "PostMediaBackup_20260501_html_assets" ("id", "image", "updatedAt")
SELECT p."id", p."image", p."updatedAt"
FROM "Post" p
JOIN target_posts t ON t.id = p.id
WHERE p."deletedAt" IS NULL
ON CONFLICT ("id") DO NOTHING;

WITH org AS (
  SELECT p."organizationId"
  FROM "Post" p
  WHERE p.id = 'cmatigfilapicobc14b5d721e245'
),
assets(asset_name, file_name, path) AS (
  VALUES
    ('reels-fila-pico', 'autototem-reels-fila-pico.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-fila-pico.mp4'),
    ('youtube-fila-pico', 'autototem-youtube-fila-pico.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-fila-pico.mp4'),
    ('reels-gargalo', 'autototem-reels-gargalo.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-gargalo.mp4'),
    ('youtube-gargalo', 'autototem-youtube-gargalo.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-gargalo.mp4'),
    ('reels-6-motivos', 'autototem-reels-6-motivos.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-6-motivos.mp4'),
    ('youtube-6-motivos', 'autototem-youtube-6-motivos.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-6-motivos.mp4'),
    ('reels-onde-usar', 'autototem-reels-onde-usar.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-onde-usar.mp4'),
    ('youtube-onde-usar', 'autototem-youtube-onde-usar.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-onde-usar.mp4'),
    ('reels-restaurante', 'autototem-reels-restaurante.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-restaurante.mp4'),
    ('youtube-restaurante', 'autototem-youtube-restaurante.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-restaurante.mp4')
)
INSERT INTO "Media" ("id", "name", "originalName", "path", "organizationId", "type", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, a.file_name, a.file_name, a.path, org."organizationId", 'video', now(), now()
FROM assets a
CROSS JOIN org
WHERE NOT EXISTS (
  SELECT 1
  FROM "Media" m
  WHERE m.path = a.path
    AND m."organizationId" = org."organizationId"
    AND m."deletedAt" IS NULL
);

WITH mapping(post_id, asset_name) AS (
  VALUES
    ('cmatigfilapicobc14b5d721e245', 'reels-fila-pico'),
    ('cmatfbfilapico49aefa7f0e2e41', 'reels-fila-pico'),
    ('cmom0fycl0000p86tjvq7he34', 'youtube-fila-pico'),
    ('cmatiggargalo752d57909d7848', 'reels-gargalo'),
    ('cmatfbgargalo5222bffe8a5c41', 'reels-gargalo'),
    ('cmom0o0u40001p86tyq9gj17f', 'youtube-gargalo'),
    ('cmatig6motivos85b2dd9c2e5345', 'reels-6-motivos'),
    ('cmatfb6motivosfccecde1665543', 'reels-6-motivos'),
    ('cmom0os8p0002p86tmb3raf4l', 'youtube-6-motivos'),
    ('cmatigondeusar16d726358cef4e', 'reels-onde-usar'),
    ('cmatfbondeusare37ca9d7d78a4c', 'reels-onde-usar'),
    ('cmom0p2ur0003p86tnd3cpta7', 'youtube-onde-usar'),
    ('cmatigrestaurante1378833b4ebd42', 'reels-restaurante'),
    ('cmatfbrestaurante8398db90b71c48', 'reels-restaurante'),
    ('cmom0p9hn0004p86t0l1qxbxc', 'youtube-restaurante')
),
assets(asset_name, file_name, path) AS (
  VALUES
    ('reels-fila-pico', 'autototem-reels-fila-pico.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-fila-pico.mp4'),
    ('youtube-fila-pico', 'autototem-youtube-fila-pico.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-fila-pico.mp4'),
    ('reels-gargalo', 'autototem-reels-gargalo.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-gargalo.mp4'),
    ('youtube-gargalo', 'autototem-youtube-gargalo.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-gargalo.mp4'),
    ('reels-6-motivos', 'autototem-reels-6-motivos.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-6-motivos.mp4'),
    ('youtube-6-motivos', 'autototem-youtube-6-motivos.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-6-motivos.mp4'),
    ('reels-onde-usar', 'autototem-reels-onde-usar.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-onde-usar.mp4'),
    ('youtube-onde-usar', 'autototem-youtube-onde-usar.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-onde-usar.mp4'),
    ('reels-restaurante', 'autototem-reels-restaurante.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-reels-restaurante.mp4'),
    ('youtube-restaurante', 'autototem-youtube-restaurante.mp4', 'https://postiz.aissistente.com.br/uploads/autototem-generated/autototem-youtube-restaurante.mp4')
),
selected_media AS (
  SELECT DISTINCT ON (a.asset_name)
    a.asset_name,
    m.id,
    m.name,
    m."originalName",
    m.path
  FROM assets a
  JOIN "Media" m ON m.path = a.path
  WHERE m."deletedAt" IS NULL
  ORDER BY a.asset_name, m."createdAt" DESC
),
payload AS (
  SELECT
    mapping.post_id,
    jsonb_build_array(
      jsonb_build_object(
        'id', selected_media.id,
        'name', selected_media.name,
        'originalName', selected_media."originalName",
        'path', selected_media.path,
        'thumbnail', NULL,
        'alt', NULL
      )
    )::text AS image
  FROM mapping
  JOIN selected_media ON selected_media.asset_name = mapping.asset_name
)
UPDATE "Post" p
SET "image" = payload.image,
    "updatedAt" = now()
FROM payload
WHERE p.id = payload.post_id
  AND p.state = 'QUEUE'
  AND p."deletedAt" IS NULL;

COMMIT;
