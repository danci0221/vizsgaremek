import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/vizsgaremek/__docusaurus/debug',
    component: ComponentCreator('/vizsgaremek/__docusaurus/debug', 'd8e'),
    exact: true
  },
  {
    path: '/vizsgaremek/__docusaurus/debug/config',
    component: ComponentCreator('/vizsgaremek/__docusaurus/debug/config', '8d9'),
    exact: true
  },
  {
    path: '/vizsgaremek/__docusaurus/debug/content',
    component: ComponentCreator('/vizsgaremek/__docusaurus/debug/content', 'fa7'),
    exact: true
  },
  {
    path: '/vizsgaremek/__docusaurus/debug/globalData',
    component: ComponentCreator('/vizsgaremek/__docusaurus/debug/globalData', '13b'),
    exact: true
  },
  {
    path: '/vizsgaremek/__docusaurus/debug/metadata',
    component: ComponentCreator('/vizsgaremek/__docusaurus/debug/metadata', '679'),
    exact: true
  },
  {
    path: '/vizsgaremek/__docusaurus/debug/registry',
    component: ComponentCreator('/vizsgaremek/__docusaurus/debug/registry', 'f38'),
    exact: true
  },
  {
    path: '/vizsgaremek/__docusaurus/debug/routes',
    component: ComponentCreator('/vizsgaremek/__docusaurus/debug/routes', '03c'),
    exact: true
  },
  {
    path: '/vizsgaremek/naplo',
    component: ComponentCreator('/vizsgaremek/naplo', '2e8'),
    exact: true
  },
  {
    path: '/vizsgaremek/docs',
    component: ComponentCreator('/vizsgaremek/docs', '148'),
    routes: [
      {
        path: '/vizsgaremek/docs',
        component: ComponentCreator('/vizsgaremek/docs', '63c'),
        routes: [
          {
            path: '/vizsgaremek/docs',
            component: ComponentCreator('/vizsgaremek/docs', '282'),
            routes: [
              {
                path: '/vizsgaremek/docs/adatbazis',
                component: ComponentCreator('/vizsgaremek/docs/adatbazis', 'e50'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/vizsgaremek/docs/admin-felulet',
                component: ComponentCreator('/vizsgaremek/docs/admin-felulet', 'b1c'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/vizsgaremek/docs/architektura',
                component: ComponentCreator('/vizsgaremek/docs/architektura', '6b6'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/vizsgaremek/docs/backend-api',
                component: ComponentCreator('/vizsgaremek/docs/backend-api', '9a3'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/vizsgaremek/docs/csapatmunka',
                component: ComponentCreator('/vizsgaremek/docs/csapatmunka', 'b4d'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/vizsgaremek/docs/frontend-ui',
                component: ComponentCreator('/vizsgaremek/docs/frontend-ui', 'b14'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/vizsgaremek/docs/projekt-attekintes',
                component: ComponentCreator('/vizsgaremek/docs/projekt-attekintes', '1b2'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/vizsgaremek/docs/telepites',
                component: ComponentCreator('/vizsgaremek/docs/telepites', '691'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/vizsgaremek/docs/teszteles-qa',
                component: ComponentCreator('/vizsgaremek/docs/teszteles-qa', '219'),
                exact: true,
                sidebar: "docsSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/vizsgaremek/',
    component: ComponentCreator('/vizsgaremek/', '820'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
