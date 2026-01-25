export const buildRedirectPath = (
  template: string,
  data: any,
  params?: string | string[] | null,
) => {
  let path = template;
  const paramList = Array.isArray(params) ? params : params ? [params] : [];
  paramList.forEach((param) => {
    path = path.replace(`{${param}}`, data[param]);
  });
  return path;
};
