# Security Notions Zoo

[![Netlify Status](https://api.netlify.com/api/v1/badges/b770d3e9-090e-4e9a-a149-5a8215657623/deploy-status)](https://app.netlify.com/projects/securitynotionszoo/deploys)

A taxonomy site for cryptography security notions, specifically focusing on Fully Homomorphic Encryption (FHE).

This project is built using [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/), [MDX](https://mdxjs.com/), and [Mermaid.js](https://mermaid.js.org/).

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:4321`

## Contributing

We welcome contributions. If you'd like to add a new security notion to the taxonomy, or improve an existing one:

1. Fork the repository
2. Add your notion to `src/content/notions/` following the existing Zod schema (title, acronym, description, tags, introduced_in, implies, implied_by).
3. Submit a Pull Request!

If you spot any errors, feel free to open an issue or reach out.

This website is maintained by [Jules Dumezy](https://www.jdumezy.com).

## License

This project is licensed under the terms of the [MIT license](LICENSE).
