const sidebars = {
  docsSidebar: [
    'projekt-attekintes',
    'csapatmunka',
    'telepites',
    {
      type: 'category',
      label: 'Rendszer Felépítése',
      link: {
        type: 'doc',
        id: 'architektura',
      },
      items: [
        'adatbazis',
        'backend-api',
        'frontend-ui',
      ],
    },
    'admin-felulet',
    'teszteles-qa',
  ],
};

export default sidebars;
