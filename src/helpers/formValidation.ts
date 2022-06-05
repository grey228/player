export interface IFields {
  email: string;
  phone: string;
  global: string;
}

export const validateFields = ({email, phone}: Partial<IFields>) => {
  const errors = {
    email: '',
    phone: '',
  };

  if (email) {
    const emailRegExp = new RegExp(/\w+@\w+\.\w+/);
    if (!emailRegExp.test(email)) {
      errors.email = 'Invalid user email';
    }
  }

  if (phone) {
    const phoneRegExp = new RegExp(/[0-9]{10,12}/);
    if (!phoneRegExp.test(phone)) {
      errors.phone = 'Invalid phone number';
    }
  }

  return errors;
};
