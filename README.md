# Manto Monumental — Pedidos + Dashboard

Site estático em **HTML, CSS e JavaScript**, pronto para GitHub Pages. Os pedidos e o dashboard usam **Supabase** como banco de dados e autenticação.

## O que já está pronto

- Página pública responsiva com carrossel principal, galerias Básico/Premium, prazos e cronômetro.
- Básico: **R$ 65,00** | custo: **R$ 55,00**.
- Premium: **R$ 85,00** | custo: **R$ 70,00**.
- Pedido com múltiplas camisas, cada uma com modelo, categoria, tamanho e quantidade.
- Masculino, feminino e infantil; infantil possui idade da criança.
- Entrega “A combinar”. Pagamento informado como Dinheiro ou PIX.
- Envio/confirmação pelo WhatsApp **(75) 98162-4889**.
- Dashboard com pedidos, edição, desconto manual, venda manual, lucro, custos, status, WhatsApp e cobrança automática baseada no prazo de 29/08/2026.
- Relatórios com pendências, valor a receber, recebido, lucro estimado, lucro obtido e custo.
- Gráfico por modelo e exportação CSV.
- Contador público de camisas sem expor dados dos clientes.

## 1. Configurar o Supabase (obrigatório para funcionar entre dispositivos)

1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute todo o arquivo `supabase.sql`.
3. Em **Authentication > Users**, crie o usuário administrador (e-mail + senha).
4. Em **Project Settings / API**, copie:
   - Project URL
   - anon / publishable key
5. Abra `config.js` e preencha:

```js
SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
SUPABASE_ANON_KEY: 'SUA_CHAVE_ANON_PUBLICA',
```

A chave `anon`/publishable pode ficar no front-end. **Nunca coloque a service_role key no GitHub.**

## 2. Publicar no GitHub Pages

Suba **o conteúdo desta pasta na raiz do repositório**, de forma que `index.html` fique na raiz.

No GitHub, abra:

**Settings > Pages > Build and deployment > Source > Deploy from a branch**

Escolha a branch `main` e a pasta `/(root)`.

O site usa caminhos relativos e inclui `.nojekyll`, então funciona tanto em domínio próprio quanto em `usuario.github.io/repositorio/`.

## 3. Acessos

- Site público: `index.html`
- Dashboard: `admin.html`

Com Supabase configurado, o acesso ao dashboard é feito com o usuário criado no **Supabase Authentication**.

Sem Supabase configurado, existe apenas um modo local de demonstração com a senha `admin`. Esse modo usa `localStorage` e **não sincroniza pedidos entre celulares/computadores**.

## Datas configuradas

- Pagamento: **29/08/2026**
- Pedidos recebidos até: **30/08/2026**
- Pedido ao fornecedor: **01/09/2026**
- Entrega estimada: **até 45 dias após o pedido ao fornecedor**

## Arquivos principais

- `index.html` — página pública
- `admin.html` — dashboard
- `styles.css` — visual completo
- `app.js` — pedidos, carrosséis, cronômetro e contador
- `admin.js` — dashboard, relatórios, lucro, edição e cobrança
- `config.js` — preços, custos, datas, WhatsApp e credenciais públicas do Supabase
- `supabase.sql` — banco, RLS, trigger de cálculo e contador público
- `assets/` — imagens e logo

