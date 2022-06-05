import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import {useDebouncedCallback} from 'use-debounce';
import {useNavigate} from 'react-router-dom';
import classnames from 'classnames';
import {validateFields, IFields} from '../../helpers/formValidation';
import './styles.css';

const HomePage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Partial<IFields>>({
    email: '',
    phone: '',
    global: ''
  });

  const debounceValidation = useDebouncedCallback(() => {
    const receivedErrors = validateFields({
      email,
      phone,
    });

    setErrors(receivedErrors);
  }, 250);

  const onEmailChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    debounceValidation();
  }, [debounceValidation]);

  const onPhoneChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value);

    debounceValidation();
  }, [debounceValidation]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasErrors = Object.keys(errors).some((objectKey: string) => {
      return errors[objectKey as keyof IFields];
    });

    if (hasErrors || !email || !phone) {
      return setErrors({
        ...errors,
        global: 'Please fix all issues around the fields',
      });
    }

    navigate('/registration');
  };

  return (
    <div className={'form-wrapper'} role={'wrapper'}>
      <form onSubmit={onSubmit} role={'form'}>
        <div className={classnames('input-block', {
          blockError: Boolean(errors.email)
        })}>
          <input type={'text'} placeholder={'Email'} onChange={onEmailChange} value={email} role={'emailInput'} />
          <div className={'error'} role={'error'}>{errors.email}</div>
        </div>
        <div className={classnames('input-block', {
          blockError: Boolean(errors.phone)
        })}>
          <input type={'text'} placeholder={'Phone'} onChange={onPhoneChange} value={phone} role={'phoneInput'} />
          <div className={'error'} role={'error'}>{errors.phone}</div>
        </div>

        <div className={'error'} role={'error'}>{errors.global}</div>

        <button type={'submit'} role={'submitButton'}>Send Data</button>
      </form>
    </div>
  );
};

export default HomePage;
