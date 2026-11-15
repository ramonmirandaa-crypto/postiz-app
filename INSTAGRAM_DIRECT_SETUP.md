# Instagram direto no Postiz

Causa do erro "Invalid platform app":
- O fluxo direto usa https://www.instagram.com/oauth/authorize.
- Esse endpoint NAO aceita o Facebook App ID.
- Ele exige o Instagram App ID e o Instagram App Secret do produto Instagram/API setup.
- O fluxo via Facebook Business continua usando FACEBOOK_APP_ID, FACEBOOK_APP_SECRET e FACEBOOK_CONFIGURATION_ID.

Manter via Facebook como esta:
- FACEBOOK_APP_ID='1669716760825141'
- FACEBOOK_CONFIGURATION_ID=1431012508780165
- Redirect URI: https://postiz.aissistente.com.br/integrations/social/instagram

Para Instagram direto, preencher no painel da Meta/Instagram:
- Callback/Redirect URI: https://postiz.aissistente.com.br/integrations/social/instagram-standalone
- Webhook Callback URL: https://postiz.aissistente.com.br/webhooks/instagram
- Verify token: QD-cwcfNNK7YwPfpli3sS5jhUZwxJ53GpboXdMupho8

Depois que tiver o Instagram App ID e Secret:
python3 /root/postiz/configure_instagram_direct_env.py 'INSTAGRAM_APP_ID_AQUI' 'INSTAGRAM_APP_SECRET_AQUI'
cd /root/postiz && docker compose restart postiz

Verificar a URL gerada:
source ~/.postiz-cli-env
curl -sS -H "Authorization: $POSTIZ_API_KEY" "$POSTIZ_API_URL/public/v1/social/instagram-standalone" | python3 -m json.tool
