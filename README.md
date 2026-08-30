
# Portfolio Website - Alexander Hermann

![Portfolio Preview](/images/preview.png)

Modern, responsive portfolio website built with HTML, CSS, JavaScript modules, and Vite. Features dark/light mode and multi-language support (German, English, Russian).

🌐 **Live Demo:** [https://www.ahermann.dev/](https://www.ahermann.dev/)

## 🌟 Features

- **Responsive Design** - Works on all devices
- **Dark/Light Mode** - Toggle between themes
- **Multi-language Support** - German, English, Russian
- **Modern UI** - Clean and professional design
- **Project Showcase** - Display your work with filters
- **Contact Form** - Easy way to get in touch
- **SEO Optimized** - With proper meta tags and schema.org
- **Search indexing** - robots.txt, XML sitemap, and web app manifest

## 🚀 Technologies Used

- HTML5
- CSS3 (CSS Variables, Grid, Flexbox)
- JavaScript (ES modules)
- Vite
- Chart.js
- Self-hosted Inter variable font
- SVG Icons

## 📁 Project Structure

```
portfolio-website/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config/
│   ├── core/
│   ├── data/
│   ├── modules/
│   ├── utils/
│   └── main.js
├── images/
├── docs/
│   └── resume.pdf
├── .gitignore
├── README.md
├── LICENSE
└── 404.html
```

## 🛠️ Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/AlexH73/portfolio-website.git
cd portfolio-website
```

2. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

3. Before publishing, run all repository checks:

```bash
npm run check
```

4. To customize:
   - Edit `js/data/translations.json` for text content
   - Edit `js/data/projects.json` to add/remove projects
   - Edit `js/data/skills.json` to add/remove skills
   - Update `js/data/schema.json` for structured SEO data
   - Modify `css/style.css` for styling
   - Replace `docs/resume.pdf` with your actual resume

## 📸 Screenshots

<div align="center">
  
![Light Theme](/images/screenshot-light.png)
*Light Theme*

![Dark Theme](/images/screenshot-dark.png)
*Dark Theme*

![Mobile View](/images/screenshot-mobile.png)
*Mobile View*

</div>

## 🌐 Deployment

This site is deployed on GitHub Pages. To update the deployment:

1. Run `npm run build`
2. Publish the generated `dist/` directory using the selected hosting provider

### Alternative Deployment Options

- **Netlify**: Drag and drop the folder or connect your GitHub repository
- **Vercel**: Import your GitHub repository for automatic deployments
- **Any static hosting service**: Upload the project files to any web host

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/AlexH73/portfolio-website/issues).

## 📞 Contact

Alexander Hermann - [LinkedIn](https://www.linkedin.com/in/alexh73/) - ewebotah@gmail.com

Live Demo: [https://www.ahermann.dev/](https://www.ahermann.dev/)
