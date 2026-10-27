export const site = {
  name: 'Elias Coleshill',
  email: 'encoleshill@icloud.com',
  github: 'https://github.com/EColeshill8',
  linkedin: 'https://www.linkedin.com/in/elias-coleshill',
  availability: 'May–August 2027',
  description: 'Engineering projects by Elias Coleshill: robotics, embedded controls, mechanical design and hands-on teaching at Western University.'
};
export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
