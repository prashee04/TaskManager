export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateTaskTitle = (title) => {
  return title && title.trim().length >= 3;
};

export const validateDueDate = (dueDate) => {
  return dueDate && new Date(dueDate) > new Date();
};
