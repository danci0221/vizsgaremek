import {themes as prismThemes} from 'prism-react-renderer';

const config = {
  title: 'SportHub',
  tagline: 'Sportolási lehetőségek katalógusa és közösségi platformja',
  favicon: 'img/favicon.ico',

  url: 'https://danci0221.github.io',
  baseUrl: '/vizsgaremek/',

  organizationName: 'danci0221',
  projectName: 'vizsgaremek',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'hu',
    locales: ['hu'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
      },
      navbar: {
        title: 'SportHub',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Dokumentáció',
          },
          {
            to: '/naplo',
            label: 'Fejlesztési Napló',
            position: 'left',
          },
          {
            href: 'https://github.com/danci0221/vizsgaremek',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Dokumentáció',
            items: [
              { label: 'Projekt áttekintés', to: '/docs/projekt-attekintes' },
              { label: 'Telepítési útmutató', to: '/docs/telepites' },
            ],
          },
          {
            title: 'Hasznos Linkek',
            items: [
              { label: 'GitHub', href: 'https://github.com/danci0221/vizsgaremek' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} SportHub Vizsgaremek.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
