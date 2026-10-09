# Yiran Yang — academic website

A static Next.js website prepared for GitHub Pages and `https://yiranyang.com`.

## Develop and verify

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

To build and check the deployable files:

```sh
npm run build
npm run verify
python3 -m http.server 5174 --bind 127.0.0.1 --directory out
```

Open `http://127.0.0.1:5174/`. The entire deployable website is in `out/`.
There is no server, database, login, visitor tracking, or owner dashboard in this version.

## Edit content

- Home, research interests: `app/page.tsx`
- Research, Publications, Grants, Gallery and Contact: their directories under `app/`
- Gallery photographs and hover/focus captions: `app/gallery/photos.ts`
- Navigation and footer: `app/site-frame.tsx`
- Responsive layout and mirrored background: `app/globals.css`
- Public CV: `public/CV_Yiran_Yang.pdf`
- Canonical origin and public route list: `lib/site-config.ts`

The `/news/` and `/interests/` URLs provide static redirects to Home and its interests section.
The source contains only current website content and public assets; no legacy repository history is included.

## GitHub repository and publication

Use a dedicated repository. A personal-site repository named `YOUR_USERNAME.github.io` works at the domain root before and after custom-domain setup. An arbitrary repository name also works with `yiranyang.com`, but its default `github.io/REPOSITORY/` project URL is not supported by this root-path configuration.

Start with a private repository while reviewing the source. GitHub Free requires a public repository for Pages; eligible paid plans allow Pages from a private repository. A private source repository does not generally make the published Pages website private. Review repository visibility and website publication separately before enabling them.

In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**.
The workflow in `.github/workflows/pages.yml` builds and verifies pushes and pull requests to `main`. These events do not deploy the site.

After publication is approved, open **Actions → Build and publish website → Run workflow**, choose `main`, and enable **Publish the reviewed website publicly on GitHub Pages**. This is also the process for later website updates. The deploy job uses the `github-pages` environment; GitHub environment reviewers can provide an additional approval step where supported.

## Connect yiranyang.com

1. Verify ownership of `yiranyang.com` under your GitHub account **Settings → Pages → Add a domain**. GitHub supplies an account-specific TXT hostname and value; copy those exact values to Namecheap and complete verification.
2. Add `yiranyang.com` in the repository's **Settings → Pages → Custom domain** before directing DNS to GitHub. With a custom Actions workflow, configure the custom domain in repository settings; the included `public/CNAME` file alone does not configure it.
3. In Namecheap **Domain List → Manage → Advanced DNS**, replace the apex website A/redirect records with these GitHub Pages A records, all with Host `@` and TTL `Automatic`:

   | Type | Host | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |

4. For `www.yiranyang.com`, add a CNAME with Host `www` and Value `YOUR_USERNAME.github.io` (no repository name or path). Preserve unrelated mail records. Do not keep conflicting old-host A/AAAA records at the same hostname or add wildcard records.
5. After GitHub validates DNS and provisions the certificate, enable **Enforce HTTPS** and check all pages, image links, and the CV through the custom domain.

The earlier Sites A targets and `_openai-site-verification` / `_cf-custom-hostname` TXT values are not GitHub Pages settings. They are not needed for this migration. Do not apply them to connect this version.

## Official references

- [GitHub Pages availability and hosting model](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [GitHub Pages Actions workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Verify domain ownership](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Configure the custom domain and DNS](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
